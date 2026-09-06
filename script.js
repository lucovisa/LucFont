const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split('');
let selectedCharacter = null;
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let drawingHistory = [];

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

function createCharactersGrid() {
    const grid = document.getElementById('charactersGrid');
    characters.forEach(char => {
        const btn = document.createElement('button');
        btn.className = 'character-btn';
        btn.textContent = char;
        btn.dataset.character = char;
        btn.addEventListener('click', () => selectCharacter(char, btn));
        grid.appendChild(btn);
    });
}

function selectCharacter(char, btn) {
    document.querySelectorAll('.character-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedCharacter = char;
    loadCharacterDrawing(char);
}

function loadCharacterDrawing(char) {
    const saved = localStorage.getItem(`lucfont-char-${char}`);
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

function startDrawing(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    lastX = (e.clientX - rect.left) * scaleX;
    lastY = (e.clientY - rect.top) * scaleY;
}

function draw(e) {
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

function stopDrawing() {
    if (isDrawing) {
        isDrawing = false;
        saveCurrentDrawing();
    }
}

function saveCurrentDrawing() {
    if (selectedCharacter) {
        const dataUrl = canvas.toDataURL();
        localStorage.setItem(`lucfont-char-${selectedCharacter}`, dataUrl);
        drawingHistory.push(dataUrl);
        if (drawingHistory.length > 20) {
            drawingHistory.shift();
        }
    }
}

function clearCanvas() {
    initCanvas();
    if (selectedCharacter) {
        localStorage.removeItem(`lucfont-char-${selectedCharacter}`);
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
        if (selectedCharacter) {
            localStorage.setItem(`lucfont-char-${selectedCharacter}`, previousState);
        }
    } else if (drawingHistory.length === 1) {
        clearCanvas();
    }
}

function exportFont() {
    const fontData = {};
    let hasDrawings = false;
    
    characters.forEach(char => {
        const saved = localStorage.getItem(`lucfont-char-${char}`);
        if (saved) {
            fontData[char] = saved;
            hasDrawings = true;
        }
    });
    
    if (!hasDrawings) {
        alert('No characters drawn yet! Draw some characters first.');
        return;
    }
    
    const jsonData = JSON.stringify(fontData);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lucfont-custom-font.json';
    a.click();
    URL.revokeObjectURL(url);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('lucfont-theme', newTheme);
    document.getElementById('themeToggle').textContent = newTheme === 'dark' ? '☀️' : '🌙';
}

function copyAddress(address) {
    navigator.clipboard.writeText(address).then(() => {
        alert('Address copied to clipboard!');
    }).catch(() => {
        alert('Failed to copy address');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('lucfont-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.getElementById('themeToggle').textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    
    initCanvas();
    createCharactersGrid();
    
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);
    
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    });
    
    canvas.addEventListener('touchend', () => {
        const mouseEvent = new MouseEvent('mouseup');
        canvas.dispatchEvent(mouseEvent);
    });
    
    document.getElementById('clearBtn').addEventListener('click', clearCanvas);
    document.getElementById('undoBtn').addEventListener('click', undoLastStroke);
    document.getElementById('exportBtn').addEventListener('click', exportFont);
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    const modal = document.getElementById('donateModal');
    document.getElementById('donateBtn').addEventListener('click', () => {
        modal.classList.add('show');
    });
    
    document.getElementById('closeModal').addEventListener('click', () => {
        modal.classList.remove('show');
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
    
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            copyAddress(btn.dataset.address);
        });
    });
});