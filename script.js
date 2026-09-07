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
let currentTool = 'pencil';
let brushSize = 5;
let fillEmptyChoice = 'yes';
let hasDrawnCurrent = false;

const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');

function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('errorModal').classList.add('show');
}

function initCanvas() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = brushSize;
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
        showError('Select at least one character set');
        return;
    }
    
    currentIndex = 0;
    fontData = {};
    hasDrawnCurrent = false;
    document.getElementById('setupScreen').style.display = 'none';
    document.getElementById('drawingScreen').style.display = 'block';
    document.getElementById('doneScreen').style.display = 'none';
    showCharacter();
}

function showCharacter() {
    const char = currentCharacters[currentIndex];
    document.getElementById('referenceChar').textContent = char;
    document.getElementById('referenceOverlay').textContent = char;
    document.getElementById('charCounter').textContent = `${currentIndex + 1} / ${currentCharacters.length}`;
    document.getElementById('progressFill').style.width = `${((currentIndex + 1) / currentCharacters.length) * 100}%`;
    
    const isLast = currentIndex === currentCharacters.length - 1;
    const isFirst = currentIndex === 0;
    
    document.getElementById('prevBtn').style.display = 'block';
    document.getElementById('skipBtn').style.display = isLast ? 'none' : 'block';
    document.getElementById('nextBtn').style.display = isLast ? 'none' : 'block';
    document.getElementById('continueBtn').style.display = isLast ? 'block' : 'none';
    
    if (isFirst) {
        document.getElementById('prevBtn').textContent = '← Home';
    } else {
        document.getElementById('prevBtn').textContent = '← Previous';
    }
    
    hasDrawnCurrent = !!fontData[char];
    document.getElementById('nextBtn').disabled = !hasDrawnCurrent;
    
    loadCharacterDrawing(char);
}

function loadCharacterDrawing(char) {
    const saved = fontData[char];
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
        drawingHistory.push(dataUrl);
        if (drawingHistory.length > 20) {
            drawingHistory.shift();
        }
        hasDrawnCurrent = true;
        document.getElementById('nextBtn').disabled = false;
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
    
    if (currentTool === 'eraser') {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = brushSize * 2;
    } else {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = brushSize;
    }
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = brushSize;
    
    lastX = currentX;
    lastY = currentY;
}

function stopDrawingEvent() {
    if (isDrawing) {
        isDrawing = false;
        hasDrawnCurrent = true;
        document.getElementById('nextBtn').disabled = false;
    }
}

function fillCanvas() {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    hasDrawnCurrent = true;
    document.getElementById('nextBtn').disabled = false;
}

function clearCanvas() {
    initCanvas();
    const char = currentCharacters[currentIndex];
    if (char) {
        delete fontData[char];
        drawingHistory = [];
        hasDrawnCurrent = false;
        document.getElementById('nextBtn').disabled = true;
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

function setTool(tool) {
    currentTool = tool;
    document.querySelectorAll('.drawing-toolbar .tool-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const toolMap = {
        'pencil': 'pencilTool',
        'eraser': 'eraserTool',
        'fill': 'fillTool'
    };
    
    if (toolMap[tool]) {
        document.getElementById(toolMap[tool]).classList.add('active');
    }
}

function importFont() {
    const fileInput = document.getElementById('importFile');
    fileInput.click();
    
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                const characters = data.characters || data;
                
                Object.keys(characters).forEach(char => {
                    fontData[char] = characters[char];
                });
                
                showCharacter();
            } catch (error) {
                showError('Invalid font file');
            }
        };
        reader.readAsText(file);
    };
}

function exportFont() {
    const char = currentCharacters[currentIndex];
    const saved = fontData[char];
    
    if (!saved) {
        showError('No drawing for this character');
        return;
    }
    
    const exportData = {};
    exportData[char] = saved;
    
    const jsonData = JSON.stringify({
        name: 'LucFont Single Character',
        version: '1.0',
        characters: exportData
    }, null, 2);
    
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lucfont-${char}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function skipCharacter() {
    if (currentIndex < currentCharacters.length - 1) {
        currentIndex++;
        showCharacter();
    }
}

function nextCharacter() {
    if (hasDrawnCurrent) {
        saveCurrentDrawing();
    }
    if (currentIndex < currentCharacters.length - 1) {
        currentIndex++;
        showCharacter();
    }
}

function prevCharacter() {
    if (currentIndex > 0) {
        currentIndex--;
        showCharacter();
    } else {
        backToSetup();
    }
}

function finishFont() {
    if (hasDrawnCurrent) {
        saveCurrentDrawing();
    }
    
    document.getElementById('drawingScreen').style.display = 'none';
    document.getElementById('doneScreen').style.display = 'block';
}

function backToDrawing() {
    document.getElementById('doneScreen').style.display = 'none';
    document.getElementById('drawingScreen').style.display = 'block';
    currentIndex = currentCharacters.length - 1;
    showCharacter();
}

function dataUrlToPath(dataUrl) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = 500;
            tempCanvas.height = 500;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(img, 0, 0);
            
            const imageData = tempCtx.getImageData(0, 0, 500, 500);
            const pixels = imageData.data;
            
            const path = new opentype.Path();
            const step = 4;
            
            for (let y = 0; y < 500; y += step) {
                for (let x = 0; x < 500; x += step) {
                    const index = (y * 500 + x) * 4;
                    if (pixels[index] < 128) {
                        const px = (x / 500) * 1000;
                        const py = 1000 - (y / 500) * 1000;
                        path.moveTo(px, py);
                        path.lineTo(px + step, py);
                        path.lineTo(px + step, py - step);
                        path.lineTo(px, py - step);
                        path.close();
                    }
                }
            }
            
            resolve(path);
        };
        img.src = dataUrl;
    });
}

async function downloadFont() {
    if (typeof opentype === 'undefined') {
        showError('Failed to load font library. Check your internet connection.');
        return;
    }
    
    const drawnChars = Object.keys(fontData);
    
    if (drawnChars.length === 0 && fillEmptyChoice === 'no') {
        showError('No characters drawn!');
        return;
    }
    
    const notdefGlyph = new opentype.Glyph({
        name: '.notdef',
        unicode: 0,
        advanceWidth: 650,
        path: new opentype.Path()
    });
    
    const glyphs = [notdefGlyph];
    
    for (const char of drawnChars) {
        const path = await dataUrlToPath(fontData[char]);
        const glyph = new opentype.Glyph({
            name: char,
            unicode: char.charCodeAt(0),
            advanceWidth: 1000,
            path: path
        });
        glyphs.push(glyph);
    }
    
    const font = new opentype.Font({
        familyName: 'LucFont Custom',
        styleName: 'Regular',
        unitsPerEm: 1000,
        ascender: 800,
        descender: -200,
        glyphs: glyphs
    });
    
    const ttfArrayBuffer = font.toArrayBuffer();
    const blob = new Blob([ttfArrayBuffer], { type: 'font/ttf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lucfont-custom.ttf';
    a.click();
    URL.revokeObjectURL(url);
}

function backToSetup() {
    document.getElementById('drawingScreen').style.display = 'none';
    document.getElementById('doneScreen').style.display = 'none';
    document.getElementById('setupScreen').style.display = 'block';
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
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.disabled = true;
        setTimeout(() => {
            btn.textContent = originalText;
            btn.disabled = false;
        }, 1500);
    }).catch(() => {
        showError('Failed to copy');
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
    
    document.getElementById('pencilTool').addEventListener('click', () => setTool('pencil'));
    document.getElementById('eraserTool').addEventListener('click', () => setTool('eraser'));
    document.getElementById('fillTool').addEventListener('click', () => {
        setTool('fill');
        fillCanvas();
    });
    document.getElementById('clearBtn').addEventListener('click', clearCanvas);
    document.getElementById('undoBtn').addEventListener('click', undoLastStroke);
    document.getElementById('toggleReferenceBtn').addEventListener('click', toggleReference);
    document.getElementById('backToSetupBtn').addEventListener('click', backToSetup);
    document.getElementById('importBtn').addEventListener('click', importFont);
    document.getElementById('exportBtn').addEventListener('click', exportFont);
    document.getElementById('skipBtn').addEventListener('click', skipCharacter);
    document.getElementById('nextBtn').addEventListener('click', nextCharacter);
    document.getElementById('prevBtn').addEventListener('click', prevCharacter);
    document.getElementById('continueBtn').addEventListener('click', finishFont);
    document.getElementById('downloadBtn').addEventListener('click', downloadFont);
    document.getElementById('backToDrawingBtn').addEventListener('click', backToDrawing);
    document.getElementById('backToSetupFromDone').addEventListener('click', backToSetup);
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    document.getElementById('donateBtn').addEventListener('click', toggleDonatePanel);
    
    document.getElementById('fillEmptyYes').addEventListener('click', () => {
        fillEmptyChoice = 'yes';
        document.getElementById('fillEmptyYes').classList.add('selected-choice');
        document.getElementById('fillEmptyNo').classList.remove('selected-choice');
    });
    
    document.getElementById('fillEmptyNo').addEventListener('click', () => {
        fillEmptyChoice = 'no';
        document.getElementById('fillEmptyNo').classList.add('selected-choice');
        document.getElementById('fillEmptyYes').classList.remove('selected-choice');
    });
    
    document.getElementById('errorCloseBtn').addEventListener('click', () => {
        document.getElementById('errorModal').classList.remove('show');
    });
    
    document.getElementById('brushSize').addEventListener('input', (e) => {
        brushSize = parseInt(e.target.value);
        document.getElementById('brushSizeValue').textContent = brushSize;
        ctx.lineWidth = brushSize;
    });
    
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            copyAddress(btn.dataset.address, btn);
        });
    });
    
    updateStartButton();
    document.getElementById('fillEmptyYes').classList.add('selected-choice');
    
    setTimeout(() => {
        const warningText = document.getElementById('warningText');
        warningText.classList.add('dissolving');
        setTimeout(() => {
            warningText.classList.add('hidden');
        }, 2000);
    }, 5000);
});