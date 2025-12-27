/**
 * Player Class - Oyuncu hareketi ve kontrolleri
 */

class Player {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        
        // Hareket durumları
        this.movement = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            running: false
        };
        
        // Hız ve yön
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        
        // Fare hassasiyeti
        this.mouseSensitivity = CONFIG.PLAYER.MOUSE_SENSITIVITY;
        
        // Oyuncu mesh (görünmez)
        this.createPlayerMesh();
        
        // Event listener'ları başlat
        this.initControls();
        
        // Pointer lock durumu
        this.isPointerLocked = false;
    }
    
    createPlayerMesh() {
        const geometry = new THREE.BoxGeometry(
            CONFIG.PLAYER.COLLISION_RADIUS,
            CONFIG.PLAYER.HEIGHT,
            CONFIG.PLAYER.COLLISION_RADIUS
        );
        const material = new THREE.MeshBasicMaterial({ visible: false });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.camera.position);
        this.scene.add(this.mesh);
    }
    
    initControls() {
        // Klavye kontrolleri
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        
        // Fare kontrolleri
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        
        // Pointer lock
        document.body.addEventListener('click', () => {
            if (!this.isPointerLocked) {
                document.body.requestPointerLock();
            }
        });
        
        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement === document.body;
        });
    }
    
    onKeyDown(event) {
        switch (event.code) {
            case CONFIG.KEYS.FORWARD:
                this.movement.forward = true;
                break;
            case CONFIG.KEYS.BACKWARD:
                this.movement.backward = true;
                break;
            case CONFIG.KEYS.LEFT:
                this.movement.left = true;
                break;
            case CONFIG.KEYS.RIGHT:
                this.movement.right = true;
                break;
            case CONFIG.KEYS.RUN:
                this.movement.running = true;
                break;
        }
    }
    
    onKeyUp(event) {
        switch (event.code) {
            case CONFIG.KEYS.FORWARD:
                this.movement.forward = false;
                break;
            case CONFIG.KEYS.BACKWARD:
                this.movement.backward = false;
                break;
            case CONFIG.KEYS.LEFT:
                this.movement.left = false;
                break;
            case CONFIG.KEYS.RIGHT:
                this.movement.right = false;
                break;
            case CONFIG.KEYS.RUN:
                this.movement.running = false;
                break;
        }
    }
    
    onMouseMove(event) {
        if (!this.isPointerLocked) return;
        
        // Yatay rotasyon (Y ekseni)
        this.camera.rotation.y -= event.movementX * this.mouseSensitivity;
        
        // Dikey rotasyon (X ekseni) - sınırlı
        this.camera.rotation.x -= event.movementY * this.mouseSensitivity;
        this.camera.rotation.x = Math.max(
            -CONFIG.CAMERA.MAX_PITCH,
            Math.min(CONFIG.CAMERA.MAX_PITCH, this.camera.rotation.x)
        );
    }
    
    update(deltaTime) {
        // Hareket yönünü hesapla
        this.direction.z = Number(this.movement.forward) - Number(this.movement.backward);
        this.direction.x = Number(this.movement.right) - Number(this.movement.left);
        this.direction.normalize();
        
        // Hızı belirle (koşma/yürüme)
        const speed = this.movement.running ? CONFIG.PLAYER.RUN_SPEED : CONFIG.PLAYER.WALK_SPEED;
        
        // Hız vektörünü güncelle
        if (this.movement.forward || this.movement.backward) {
            this.velocity.z = this.direction.z * speed;
        }
        if (this.movement.left || this.movement.right) {
            this.velocity.x = this.direction.x * speed;
        }
        
        // Kamera yönüne göre hareket
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(this.camera.quaternion);
        forward.y = 0;
        forward.normalize();
        
        const right = new THREE.Vector3(1, 0, 0);
        right.applyQuaternion(this.camera.quaternion);
        right.y = 0;
        right.normalize();
        
        // Pozisyonu güncelle
        this.camera.position.addScaledVector(forward, this.velocity.z);
        this.camera.position.addScaledVector(right, this.velocity.x);
        
        // Mesh pozisyonunu senkronize et
        this.mesh.position.copy(this.camera.position);
        
        // Hızı azalt (sürtünme)
        this.velocity.multiplyScalar(0.8);
        
        // Zemin sınırı
        this.constrainToGround();
    }
    
    constrainToGround() {
        // Oyuncuyu zeminde tut
        this.camera.position.y = CONFIG.PLAYER.HEIGHT;
        
        // Harita sınırları
        const halfSize = CONFIG.GROUND.SIZE / 2;
        this.camera.position.x = Math.max(-halfSize + 1, Math.min(halfSize - 1, this.camera.position.x));
        this.camera.position.z = Math.max(-halfSize + 1, Math.min(halfSize - 1, this.camera.position.z));
    }
    
    getPosition() {
        return {
            x: Math.round(this.camera.position.x * 10) / 10,
            z: Math.round(this.camera.position.z * 10) / 10
        };
    }
    
    setMouseSensitivity(value) {
        this.mouseSensitivity = CONFIG.PLAYER.MOUSE_SENSITIVITY * (value / 5);
    }
}
