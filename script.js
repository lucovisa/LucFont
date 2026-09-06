const charsets = {
    english: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    russian: 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?/~`'
};

let selectedCharsets = new Set();
let customCharset = '';
let currentCharacters = [];
let currentIndex = 0;
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let drawingHistory = [];
let showReference = true;
let fontData = {};

const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');

function initCanvas() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
}

function toggleCharset(charset) {
    const btn = document.querySelector(`[data-charset="${charset}"]`);
    
    if (charset === 'custom') {
        const customInput = document.getElementById('customCharsetInput');
        if (btn.classList.contains('selected')) {
            btn.classList.remove('selected');
            customInput.style.display = 'none';
            selectedCharsets.delete('custom');
        } else {
            btn.classList.add('selected');
            customInput.style.display = 'block';
            selectedCharsets.add('custom');
        }
    } else {
        if (btn.classList.contains('selected')) {
            btn.classList.remove('selected');
            selectedCharsets.delete(charset);
        } else {
            btn.classList.add('selected');
            selectedCharsets.add(charset);
        }
    }
    
    updateStartButton();
}

function updateStartButton() {
    const startBtn = document.getElementById('startBtn');
    if (selectedCharsets.size === 0 && !customCharset) {
        startBtn.disabled = true;
        startBtn.style.opacity = '0.5';
    } else {
        startBtn.disabled = false;
        startBtn.style.opacity = '1';
    }
}

function startDrawing() {
    currentCharacters = [];
    
    if (selectedCharsets.has('english')) {
        currentCharacters = currentCharacters.concat(charsets.english.split(''));
    }
    if (selectedCharsets.has('russian')) {
        currentCharacters = currentCharacters.concat(charsets.russian.split(''));
    }
    if (selectedCharsets.has('numbers')) {
        currentCharacters = currentCharacters.concat(charsets.numbers.split(''));
    }
    if (selectedCharsets.has('symbols')) {
        currentCharacters = currentCharacters.concat(charsets.symbols.split(''));
    }
    if (selectedCharsets.has('custom')) {
        customCharset = document.getElementById('customCharset').value.trim();
        if (customCharset) {
            currentCharacters = currentCharacters.concat(customCharset.split(''));
        }
    }
    
    if (currentCharacters.length === 0) {
        alert('Select at least one character set');
        return;
    }
    
    currentIndex = 0;
    fontData = {};
    document.getElementById('setupScreen').style.display = 'none';
    document.getElementById('drawingScreen').style.display = 'block';
    showCharacter();
}

function showCharacter() {
    const char = currentCharacters[currentIndex];
    document.getElementById('referenceChar').textContent = char;
    document.getElementById('referenceOverlay').textContent = char;
    document.getElementById('charCounter').textContent = `${currentIndex + 1} / ${currentCharacters.length}`;
    document.getElementById('progressFill').style.width = `${((currentIndex + 1) / currentCharacters.length) * 100}%`;
    
    document.getElementById('prevBtn').style.display = currentIndex === 0 ? 'none' : 'block';
    document.getElementById('nextBtn').style.display = currentIndex === currentCharacters.length - 1 ? 'none' : 'block';
    document.getElementById('finishBtn').style.display = currentIndex === currentCharacters.length - 1 ? 'block' : 'none';
    
    loadCharacterDrawing(char);
}

function loadCharacterDrawing(char) {
    const saved = fontData[char] || localStorage.getItem(`lucfont-char-${char}`);
    initCanvas();
    if (saved) {
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0);
            drawingHistory = [saved];
        };
        img.src = saved;
    } else {
        drawingHistory = [];
    }
}

function saveCurrentDrawing() {
    const char = currentCharacters[currentIndex];
    if (char) {
        const dataUrl = canvas.toDataURL();
        fontData[char] = dataUrl;
        localStorage.setItem(`lucfont-char-${char}`, dataUrl);
        drawingHistory.push(dataUrl);
        if (drawingHistory.length > 20) {
            drawingHistory.shift();
        }
    }
}

function startDrawingEvent(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    lastX = (e.clientX - rect.left) * scaleX;
    lastY = (e.clientY - rect.top) * scaleY;
}

function drawEvent(e) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const currentX = (e.clientX - rect.left) * scaleX;
    const currentY = (e.clientY - rect.top) * scaleY;
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();
    
    lastX = currentX;
    lastY = currentY;
}

function stopDrawingEvent() {
    if (isDrawing) {
        isDrawing = false;
        saveCurrentDrawing();
    }
}

function clearCanvas() {
    initCanvas();
    const char = currentCharacters[currentIndex];
    if (char) {
        delete fontData[char];
        localStorage.removeItem(`lucfont-char-${char}`);
        drawingHistory = [];
    }
}

function undoLastStroke() {
    if (drawingHistory.length > 1) {
        drawingHistory.pop();
        const previousState = drawingHistory[drawingHistory.length - 1];
        const img = new Image();
        img.onload = () => {
            initCanvas();
            ctx.drawImage(img, 0, 0);
        };
        img.src = previousState;
        const char = currentCharacters[currentIndex];
        if (char) {
            fontData[char] = previousState;
            localStorage.setItem(`lucfont-char-${char}`, previousState);
        }
    } else if (drawingHistory.length === 1) {
        clearCanvas();
    }
}

function toggleReference() {
    showReference = !showReference;
    const overlay = document.getElementById('referenceOverlay');
    const btn = document.getElementById('toggleReferenceBtn');
    
    if (showReference) {
        overlay.classList.remove('hidden');
        btn.textContent = 'Hide Reference';
        btn.classList.remove('active');
    } else {
        overlay.classList.add('hidden');
        btn.textContent = 'Show Reference';
        btn.classList.add('active');
    }
}

function nextCharacter() {
    if (currentIndex < currentCharacters.length - 1) {
        saveCurrentDrawing();
        currentIndex++;
        showCharacter();
    }
}

function prevCharacter() {
    if (currentIndex > 0) {
        saveCurrentDrawing();
        currentIndex--;
        showCharacter();
    }
}

function finishFont() {
    saveCurrentDrawing();
    
    const exportData = {};
    currentCharacters.forEach(char => {
        const saved = localStorage.getItem(`lucfont-char-${char}`);
        if (saved) {
            exportData[char] = saved;
        }
    });
    
    if (Object.keys(exportData).length === 0) {
        alert('No characters drawn!');
        return;
    }
    
    const jsonData = JSON.stringify({
        name: 'LucFont Custom',
        version: '1.0',
        characters: exportData
    }, null, 2);
    
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lucfont-custom.font';
    a.click();
    URL.revokeObjectURL(url);
    
    alert('Font saved! This is a JSON file that can be converted to TTF/OTF with font tools.');
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('lucfont-theme', newTheme);
    document.getElementById('themeToggle').textContent = newTheme === 'dark' ? '☀️' : '🌙';
}

function toggleDonatePanel() {
    const panel = document.getElementById('donatePanel');
    panel.classList.toggle('show');
}

function copyAddress(address, btn) {
    navigator.clipboard.writeText(address).then(() => {
        const copiedText = btn.parentElement.querySelector('.copied-text');
        copiedText.classList.add('show');
        setTimeout(() => {
            copiedText.classList.remove('show');
        }, 1500);
    }).catch(() => {
        alert('Failed to copy');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('lucfont-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.getElementById('themeToggle').textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    
    initCanvas();
    
    document.querySelectorAll('.charset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            toggleCharset(btn.dataset.charset);
        });
    });
    
    document.getElementById('startBtn').addEventListener('click', startDrawing);
    
    canvas.addEventListener('mousedown', startDrawingEvent);
    canvas.addEventListener('mousemove', drawEvent);
    canvas.addEventListener('mouseup', stopDrawingEvent);
    canvas.addEventListener('mouseleave', stopDrawingEvent);
    
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        startDrawingEvent({ clientX: touch.clientX, clientY: touch.clientY });
    });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        drawEvent({ clientX: touch.clientX, clientY: touch.clientY });
    });
    
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        stopDrawingEvent();
    });
    
    document.getElementById('clearBtn').addEventListener('click', clearCanvas);
    document.getElementById('undoBtn').addEventListener('click', undoLastStroke);
    document.getElementById('toggleReferenceBtn').addEventListener('click', toggleReference);
    document.getElementById('nextBtn').addEventListener('click', nextCharacter);
    document.getElementById('prevBtn').addEventListener('click', prevCharacter);
    document.getElementById('finishBtn').addEventListener('click', finishFont);
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    document.getElementById('donateBtn').addEventListener('click', toggleDonatePanel);
    
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            copyAddress(btn.dataset.address, btn);
        });
    });
    
    updateStartButton();
    
    setTimeout(() => {
        const warningText = document.getElementById('warningText');
        warningText.classList.add('hidden');
    }, 15000);
});