/**
 * Game Class - Ana oyun mantığı ve döngüsü
 */

class Game {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.player = null;
        this.environment = null;
        
        // Oyun durumu
        this.isRunning = false;
        this.isPaused = false;
        
        // FPS sayacı
        this.fps = 0;
        this.frameCount = 0;
        this.lastTime = performance.now();
        
        // Delta time
        this.clock = new THREE.Clock();
        
        // Ayarlar
        this.settings = {
            quality: 'medium',
            shadowsEnabled: true,
            fogEnabled: true,
            mouseSensitivity: 5
        };
        
        // Etkileşim
        this.nearestHouse = null;
    }
    
    /**
     * Oyunu başlat
     */
    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createEnvironment();
        this.createPlayer();
        this.setupEventListeners();
        this.updateHUD();
        
        this.isRunning = true;
        this.animate();
    }
    
    /**
     * Sahne oluştur
     */
    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(CONFIG.SCENE.BACKGROUND_COLOR);
        
        if (this.settings.fogEnabled) {
            this.scene.fog = new THREE.Fog(
                CONFIG.SCENE.FOG_COLOR,
                CONFIG.SCENE.FOG_NEAR,
                CONFIG.SCENE.FOG_FAR
            );
        }
    }
    
    /**
     * Kamera oluştur
     */
    createCamera() {
        this.camera = new THREE.PerspectiveCamera(
            CONFIG.CAMERA.FOV,
            window.innerWidth / window.innerHeight,
            CONFIG.CAMERA.NEAR,
            CONFIG.CAMERA.FAR
        );
        this.camera.position.set(0, CONFIG.PLAYER.HEIGHT, 5);
    }
    
    /**
     * Renderer oluştur
     */
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('gameCanvas'),
            antialias: CONFIG.GRAPHICS.ANTIALIASING
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        if (this.settings.shadowsEnabled) {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
    }
    
    /**
     * Çevreyi oluştur
     */
    createEnvironment() {
        this.environment = new Environment(this.scene);
        this.environment.createEnvironment();
    }
    
    /**
     * Oyuncuyu oluştur
     */
    createPlayer() {
        this.player = new Player(this.camera, this.scene);
        this.player.setMouseSensitivity(this.settings.mouseSensitivity);
    }
    
    /**
     * Event listener'ları ayarla
     */
    setupEventListeners() {
        // Pencere boyutu değişimi
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Klavye - Etkileşim
        document.addEventListener('keydown', (e) => {
            if (e.code === CONFIG.KEYS.INTERACT) {
                this.handleInteraction();
            } else if (e.code === CONFIG.KEYS.PAUSE) {
                this.togglePause();
            }
        });
    }
    
    /**
     * Pencere boyutu değişimi
     */
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    /**
     * Etkileşim işle (kapı aç/kapat)
     */
    handleInteraction() {
        if (this.nearestHouse) {
            const isOpen = this.environment.toggleDoor(this.nearestHouse.index);
            const action = isOpen ? 'açıldı' : 'kapandı';
            this.showNotification(
                `${this.nearestHouse.name} kapısı ${action}!`,
                isOpen ? 'success' : 'warning'
            );
        }
    }
    
    /**
     * Oyunu duraklat/devam ettir
     */
    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseMenu = document.getElementById('pauseMenu');
        
        if (this.isPaused) {
            pauseMenu.classList.remove('hidden');
            document.exitPointerLock();
        } else {
            pauseMenu.classList.add('hidden');
        }
    }
    
    /**
     * HUD'u güncelle
     */
    updateHUD() {
        // Oyuncu pozisyonu
        const pos = this.player.getPosition();
        document.getElementById('playerPosition').textContent = 
            `X: ${pos.x}, Z: ${pos.z}`;
        
        // Yakındaki nesne
        if (this.nearestHouse) {
            document.getElementById('nearbyObject').textContent = this.nearestHouse.name;
            
            // Etkileşim prompt'ını göster
            const prompt = document.getElementById('interactionPrompt');
            prompt.classList.remove('hidden');
            
            const state = this.environment.doorStates.get(this.nearestHouse.index);
            document.getElementById('interactionText').textContent = 
                state.isOpen ? 'Kapıyı Kapat' : 'Kapıyı Aç';
        } else {
            document.getElementById('nearbyObject').textContent = '-';
            document.getElementById('interactionPrompt').classList.add('hidden');
        }
        
        // FPS
        document.getElementById('fpsCounter').textContent = Math.round(this.fps);
    }
    
    /**
     * FPS hesapla
     */
    calculateFPS() {
        this.frameCount++;
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        
        if (deltaTime >= CONFIG.FPS.UPDATE_INTERVAL) {
            this.fps = (this.frameCount / deltaTime) * 1000;
            this.frameCount = 0;
            this.lastTime = currentTime;
        }
    }
    
    /**
     * Minimap çiz
     */
    updateMinimap() {
        const canvas = document.getElementById('minimapCanvas');
        const ctx = canvas.getContext('2d');
        const scale = 1.5;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Temizle
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Yol
        ctx.fillStyle = '#555';
        ctx.fillRect(centerX - 2.5 * scale, 0, 5 * scale, canvas.height);
        
        // Evler
        this.environment.houses.forEach(house => {
            const x = centerX + (house.position.x - this.camera.position.x) * scale;
            const y = centerY + (house.position.z - this.camera.position.z) * scale;
            
            ctx.fillStyle = '#ff6b6b';
            ctx.fillRect(x - 3, y - 3, 6, 6);
        });
        
        // Oyuncu
        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Yön göstergesi
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.sin(this.camera.rotation.y) * 15,
            centerY + Math.cos(this.camera.rotation.y) * 15
        );
        ctx.stroke();
    }
    
    /**
     * Bildirim göster
     */
    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, CONFIG.ANIMATION.NOTIFICATION_DURATION);
    }
    
    /**
     * Ayarları uygula
     */
    applySettings() {
        // Gölgeler
        this.renderer.shadowMap.enabled = this.settings.shadowsEnabled;
        
        // Sis
        if (this.settings.fogEnabled) {
            this.scene.fog = new THREE.Fog(
                CONFIG.SCENE.FOG_COLOR,
                CONFIG.SCENE.FOG_NEAR,
                CONFIG.SCENE.FOG_FAR
            );
        } else {
            this.scene.fog = null;
        }
        
        // Fare hassasiyeti
        this.player.setMouseSensitivity(this.settings.mouseSensitivity);
    }
    
    /**
     * Update loop
     */
    update() {
        if (this.isPaused) return;
        
        const deltaTime = this.clock.getDelta();
        
        // Oyuncuyu güncelle
        this.player.update(deltaTime);
        
        // Kapı animasyonlarını güncelle
        this.environment.updateDoorAnimations();
        
        // En yakın evi bul
        this.nearestHouse = this.environment.findNearestHouse(this.camera.position);
        
        // HUD'u güncelle
        this.updateHUD();
        
        // Minimap'i güncelle
        this.updateMinimap();
        
        // FPS hesapla
        this.calculateFPS();
    }
    
    /**
     * Render loop
     */
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    
    /**
     * Ana animasyon döngüsü
     */
    animate() {
        if (!this.isRunning) return;
        
        requestAnimationFrame(() => this.animate());
        
        this.update();
        this.render();
    }
    
    /**
     * Oyunu durdur
     */
    stop() {
        this.isRunning = false;
    }
    
    /**
     * Oyunu yeniden başlat
     */
    restart() {
        // Oyuncuyu başlangıç pozisyonuna al
        this.camera.position.set(0, CONFIG.PLAYER.HEIGHT, 5);
        this.camera.rotation.set(0, 0, 0);
        
        // Tüm kapıları kapat
        this.environment.houses.forEach((house, index) => {
            this.environment.doorStates.set(index, { isOpen: false, targetRotation: 0 });
        });
        
        this.isPaused = false;
        document.getElementById('pauseMenu').classList.add('hidden');
        
        this.showNotification('Oyun yeniden başlatıldı!', 'success');
    }
}
