/**
 * Profesyonel 3D Oyun Sahnesi - Konfigürasyon Dosyası
 * Tüm oyun ayarları ve sabitler burada tanımlanır
 */

const CONFIG = {
    // Oyun Versiyonu
    VERSION: '2.0.0',
    
    // Oyuncu Ayarları
    PLAYER: {
        WALK_SPEED: 0.1,
        RUN_SPEED: 0.2,
        MOUSE_SENSITIVITY: 0.002,
        HEIGHT: 1.6,
        COLLISION_RADIUS: 0.5,
        INTERACTION_DISTANCE: 6
    },
    
    // Kamera Ayarları
    CAMERA: {
        FOV: 75,
        NEAR: 0.1,
        FAR: 1000,
        MAX_PITCH: Math.PI / 2
    },
    
    // Grafik Ayarları
    GRAPHICS: {
        SHADOW_MAP_SIZE: 2048,
        ANTIALIASING: true,
        QUALITY: {
            LOW: {
                shadowMapSize: 1024,
                maxLights: 2,
                fogDensity: 0.002
            },
            MEDIUM: {
                shadowMapSize: 2048,
                maxLights: 4,
                fogDensity: 0.001
            },
            HIGH: {
                shadowMapSize: 4096,
                maxLights: 6,
                fogDensity: 0.0005
            }
        }
    },
    
    // Sahne Ayarları
    SCENE: {
        BACKGROUND_COLOR: 0x87ceeb,
        FOG_COLOR: 0x87ceeb,
        FOG_NEAR: 0,
        FOG_FAR: 750,
        AMBIENT_LIGHT_INTENSITY: 0.6,
        SUN_LIGHT_INTENSITY: 0.8
    },
    
    // Zemin ve Yol Ayarları
    GROUND: {
        SIZE: 100,
        COLOR: 0x3a9d23,
        ROAD_WIDTH: 5,
        ROAD_COLOR: 0x555555
    },
    
    // Ev Ayarları
    HOUSES: [
        { x: -10, z: -10, color: 0xff6b6b, name: 'Kırmızı Ev' },
        { x: 10, z: -10, color: 0x4ecdc4, name: 'Mavi Ev' },
        { x: -10, z: -25, color: 0xffe66d, name: 'Sarı Ev' }
    ],
    
    HOUSE: {
        BODY_SIZE: { width: 4, height: 3, depth: 4 },
        ROOF_RADIUS: 3,
        ROOF_HEIGHT: 2,
        DOOR_SIZE: { width: 0.8, height: 1.5, depth: 0.1 },
        WINDOW_SIZE: { width: 0.6, height: 0.6, depth: 0.1 },
        DOOR_COLOR: 0x654321,
        WINDOW_COLOR: 0xadd8e6
    },
    
    // Ağaç Ayarları
    TREES: [
        { x: 15, z: 5 },
        { x: -15, z: 5 },
        { x: 20, z: -5 },
        { x: -20, z: -5 },
        { x: 15, z: -20 },
        { x: -15, z: -30 },
        { x: -5, z: 10 },
        { x: 8, z: 15 }
    ],
    
    TREE: {
        TRUNK_RADIUS_TOP: 0.2,
        TRUNK_RADIUS_BOTTOM: 0.3,
        TRUNK_HEIGHT: 2,
        TRUNK_COLOR: 0x8b4513,
        LEAVES_RADIUS: 1.5,
        LEAVES_COLOR: 0x228b22
    },
    
    // Animasyon Ayarları
    ANIMATION: {
        DOOR_ROTATION: Math.PI / 2,
        DOOR_SPEED: 0.05,
        NOTIFICATION_DURATION: 2000
    },
    
    // Klavye Tuşları
    KEYS: {
        FORWARD: 'KeyW',
        BACKWARD: 'KeyS',
        LEFT: 'KeyA',
        RIGHT: 'KeyD',
        RUN: 'ShiftLeft',
        INTERACT: 'KeyE',
        PAUSE: 'Escape'
    },
    
    // FPS Sayacı
    FPS: {
        UPDATE_INTERVAL: 100
    }
};

// Ayarları donduralım (değiştirilemesin)
Object.freeze(CONFIG);
