const translations = {
    en: {
        mainTitle: 'Font Generator',
        mainDescription: 'Create your own custom fonts with LucFont',
        placeholderText: 'Font generator coming soon...',
        footerText: '© 2024 LucFont. All rights reserved.',
        donate: '❤️ Donate',
        theme: '🌙',
        language: 'Language'
    },
    ru: {
        mainTitle: 'Генератор шрифтов',
        mainDescription: 'Создавайте свои собственные шрифты с LucFont',
        placeholderText: 'Генератор шрифтов скоро появится...',
        footerText: '© 2024 LucFont. Все права защищены.',
        donate: '❤️ Донат',
        theme: '🌙',
        language: 'Язык'
    }
};

let currentLanguage = localStorage.getItem('lucfont-language') || 'en';
let currentTheme = localStorage.getItem('lucfont-theme') || 'light';

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeBtn = document.getElementById('themeToggle');
    themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('lucfont-theme', theme);
}

function applyLanguage(lang) {
    const t = translations[lang];
    document.getElementById('mainTitle').textContent = t.mainTitle;
    document.getElementById('mainDescription').textContent = t.mainDescription;
    document.getElementById('placeholderText').textContent = t.placeholderText;
    document.getElementById('footerText').textContent = t.footerText;
    document.getElementById('donateBtn').textContent = t.donate;
    document.getElementById('languageSelect').value = lang;
    localStorage.setItem('lucfont-language', lang);
}

document.addEventListener('DOMContentLoaded', () => {
    applyTheme(currentTheme);
    applyLanguage(currentLanguage);
    
    document.getElementById('themeToggle').addEventListener('click', () => {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(currentTheme);
    });
    
    document.getElementById('languageSelect').addEventListener('change', (e) => {
        currentLanguage = e.target.value;
        applyLanguage(currentLanguage);
    });
    
    document.getElementById('donateBtn').addEventListener('click', () => {
        alert('Thank you for your support! Donation options coming soon.');
    });
});