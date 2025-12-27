/**
 * Main.js - UI kontrolü ve uygulama başlangıcı
 */

let game = null;

// Sayfa yüklendiğinde
window.addEventListener('DOMContentLoaded', () => {
    initializeUI();
    simulateLoading();
});

/**
 * UI'yi başlat
 */
function initializeUI() {
    // Menü butonları
    document.getElementById('startButton').addEventListener('click', startGame);
    document.getElementById('instructionsButton').addEventListener('click', showInstructions);
    document.getElementById('settingsButton').addEventListener('click', showSettings);
    
    // Ayarlar paneli
    document.getElementById('closeSettings').addEventListener('click', hideSettings);
    document.getElementById('graphicsQuality').addEventListener('change', onQualityChange);
    document.getElementById('mouseSensitivity').addEventListener('input', onSensitivityChange);
    document.getElementById('shadowsEnabled').addEventListener('change', onShadowsToggle);
    document.getElementById('fogEnabled').addEventListener('change', onFogToggle);
    
    // Pause menü butonları
    document.getElementById('resumeButton').addEventListener('click', resumeGame);
    document.getElementById('restartButton').addEventListener('click', restartGame);
    document.getElementById('mainMenuButton').addEventListener('click', backToMainMenu);
}

/**
 * Yükleme simülasyonu
 */
function simulateLoading() {
    const loadingScreen = document.getElementById('loadingScreen');
    const progressBar = document.getElementById('progressBar');
    let progress = 0;
    
    const loadingInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingInterval);
            
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
            }, 500);
        }
        
        progressBar.style.width = progress + '%';
    }, 100);
}

/**
 * Oyunu başlat
 */
function startGame() {
    // Menüyü gizle
    document.getElementById('menuScreen').classList.add('hidden');
    
    // HUD'u göster
    document.getElementById('hud').classList.remove('hidden');
    
    // Oyunu oluştur ve başlat
    if (!game) {
        game = new Game();
        game.init();
    }
    
    // Bildirim göster
    setTimeout(() => {
        game.showNotification('Oyun başladı! Evlere yaklaşarak kapıları açabilirsiniz.', 'success');
    }, 500);
}

/**
 * Talimatları göster
 */
function showInstructions() {
    const instructions = `
🎮 KONTROLLER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
W, A, S, D - Hareket Et
Fare - Etrafına Bak
E - Kapı Aç/Kapat
Shift - Koş
ESC - Oyunu Duraklat

📖 NASIL OYNANIR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Oyuna başladıktan sonra ekrana tıklayın
2. W, A, S, D tuşları ile hareket edin
3. Fare ile etrafınıza bakın
4. Evlere yaklaşın
5. "E" tuşuna basarak kapıları açın/kapatın
6. Shift ile koşabilirsiniz
7. ESC ile oyunu durdurun

🎯 HEDEF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sahnedeki 3 farklı renkteki evin kapılarını
keşfedin ve açın!

    `;
    
    alert(instructions);
}

/**
 * Ayarları göster
 */
function showSettings() {
    document.getElementById('settingsPanel').classList.remove('hidden');
}

/**
 * Ayarları gizle
 */
function hideSettings() {
    document.getElementById('settingsPanel').classList.add('hidden');
    
    if (game) {
        game.applySettings();
    }
}

/**
 * Grafik kalitesi değişimi
 */
function onQualityChange(e) {
    const quality = e.target.value;
    
    if (game) {
        game.settings.quality = quality;
        
        const qualitySettings = CONFIG.GRAPHICS.QUALITY[quality.toUpperCase()];
        game.renderer.shadowMap.enabled = game.settings.shadowsEnabled;
        
        // Bildirim
        const qualityNames = { low: 'Düşük', medium: 'Orta', high: 'Yüksek' };
        console.log(`Grafik kalitesi ${qualityNames[quality]} olarak ayarlandı`);
    }
}

/**
 * Fare hassasiyeti değişimi
 */
function onSensitivityChange(e) {
    const value = parseInt(e.target.value);
    document.getElementById('sensitivityValue').textContent = value;
    
    if (game) {
        game.settings.mouseSensitivity = value;
        game.player.setMouseSensitivity(value);
    }
}

/**
 * Gölge açma/kapama
 */
function onShadowsToggle(e) {
    if (game) {
        game.settings.shadowsEnabled = e.target.checked;
        game.renderer.shadowMap.enabled = e.target.checked;
    }
}

/**
 * Sis açma/kapama
 */
function onFogToggle(e) {
    if (game) {
        game.settings.fogEnabled = e.target.checked;
        game.applySettings();
    }
}

/**
 * Oyuna devam et
 */
function resumeGame() {
    if (game) {
        game.togglePause();
    }
}

/**
 * Oyunu yeniden başlat
 */
function restartGame() {
    if (game) {
        game.restart();
    }
}

/**
 * Ana menüye dön
 */
function backToMainMenu() {
    if (game) {
        game.stop();
        game = null;
    }
    
    // HUD'u gizle
    document.getElementById('hud').classList.add('hidden');
    
    // Pause menüyü gizle
    document.getElementById('pauseMenu').classList.add('hidden');
    
    // Ana menüyü göster
    document.getElementById('menuScreen').classList.remove('hidden');
    
    // Pointer lock'u kaldır
    document.exitPointerLock();
}

/**
 * Hata yakalama
 */
window.addEventListener('error', (e) => {
    console.error('Bir hata oluştu:', e.error);
    alert('Bir hata oluştu. Lütfen sayfayı yenileyin.');
});

/**
 * Sayfa kapatılırken uyarı
 */
window.addEventListener('beforeunload', (e) => {
    if (game && game.isRunning) {
        e.preventDefault();
        e.returnValue = 'Oyundan çıkmak istediğinize emin misiniz?';
        return e.returnValue;
    }
});

console.log(`

`);
