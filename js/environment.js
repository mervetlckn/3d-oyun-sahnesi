/**
 * Environment Class - Sahne nesneleri ve çevre oluşturma
 */

class Environment {
    constructor(scene) {
        this.scene = scene;
        this.houses = [];
        this.doorStates = new Map();
        this.doorAnimations = new Map();
    }
    
    /**
     * Tüm çevreyi oluştur
     */
    createEnvironment() {
        this.createLighting();
        this.createGround();
        this.createRoad();
        this.createHouses();
        this.createTrees();
        this.createSkybox();
    }
    
    /**
     * Işıklandırma sistemi
     */
    createLighting() {
        // Ortam ışığı
        const ambientLight = new THREE.AmbientLight(
            0xffffff,
            CONFIG.SCENE.AMBIENT_LIGHT_INTENSITY
        );
        this.scene.add(ambientLight);
        
        // Güneş ışığı (Directional)
        const sunLight = new THREE.DirectionalLight(
            0xffffff,
            CONFIG.SCENE.SUN_LIGHT_INTENSITY
        );
        sunLight.position.set(50, 50, 50);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = CONFIG.GRAPHICS.SHADOW_MAP_SIZE;
        sunLight.shadow.mapSize.height = CONFIG.GRAPHICS.SHADOW_MAP_SIZE;
        sunLight.shadow.camera.left = -50;
        sunLight.shadow.camera.right = 50;
        sunLight.shadow.camera.top = 50;
        sunLight.shadow.camera.bottom = -50;
        this.scene.add(sunLight);
        
        // Nokta ışıklar (evlerin önünde)
        CONFIG.HOUSES.forEach((houseData, index) => {
            const pointLight = new THREE.PointLight(0xffaa00, 0.5, 10);
            pointLight.position.set(houseData.x, 2, houseData.z + 3);
            pointLight.castShadow = true;
            this.scene.add(pointLight);
        });
    }
    
    /**
     * Zemin oluşturma
     */
    createGround() {
        const geometry = new THREE.PlaneGeometry(
            CONFIG.GROUND.SIZE,
            CONFIG.GROUND.SIZE
        );
        const material = new THREE.MeshLambertMaterial({
            color: CONFIG.GROUND.COLOR
        });
        const ground = new THREE.Mesh(geometry, material);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // Çim detayları
        this.addGrassPatches(ground);
    }
    
    /**
     * Çim yamaları ekle
     */
    addGrassPatches(ground) {
        const patchCount = 50;
        for (let i = 0; i < patchCount; i++) {
            const geometry = new THREE.CircleGeometry(Math.random() * 2 + 1, 6);
            const material = new THREE.MeshLambertMaterial({
                color: 0x2d8a1f,
                transparent: true,
                opacity: 0.3
            });
            const patch = new THREE.Mesh(geometry, material);
            patch.rotation.x = -Math.PI / 2;
            patch.position.set(
                Math.random() * CONFIG.GROUND.SIZE - CONFIG.GROUND.SIZE / 2,
                0.01,
                Math.random() * CONFIG.GROUND.SIZE - CONFIG.GROUND.SIZE / 2
            );
            this.scene.add(patch);
        }
    }
    
    /**
     * Yol oluşturma
     */
    createRoad() {
        const geometry = new THREE.PlaneGeometry(
            CONFIG.GROUND.ROAD_WIDTH,
            CONFIG.GROUND.SIZE
        );
        const material = new THREE.MeshLambertMaterial({
            color: CONFIG.GROUND.ROAD_COLOR
        });
        const road = new THREE.Mesh(geometry, material);
        road.rotation.x = -Math.PI / 2;
        road.position.y = 0.01;
        road.receiveShadow = true;
        this.scene.add(road);
        
        // Yol şeritleri
        this.createRoadLines();
    }
    
    /**
     * Yol şeritleri
     */
    createRoadLines() {
        const lineCount = 10;
        const lineSpacing = CONFIG.GROUND.SIZE / lineCount;
        
        for (let i = 0; i < lineCount; i++) {
            const geometry = new THREE.PlaneGeometry(0.2, 2);
            const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
            const line = new THREE.Mesh(geometry, material);
            line.rotation.x = -Math.PI / 2;
            line.position.set(0, 0.02, -CONFIG.GROUND.SIZE / 2 + i * lineSpacing);
            this.scene.add(line);
        }
    }
    
    /**
     * Evleri oluştur
     */
    createHouses() {
        CONFIG.HOUSES.forEach((houseData, index) => {
            const house = this.createHouse(houseData);
            this.houses.push({
                group: house.group,
                door: house.door,
                position: new THREE.Vector3(houseData.x, 0, houseData.z),
                name: houseData.name,
                index: index
            });
            this.doorStates.set(index, { isOpen: false, targetRotation: 0 });
        });
    }
    
    /**
     * Tek bir ev oluştur
     */
    createHouse(data) {
        const houseGroup = new THREE.Group();
        
        // Ev gövdesi
        const bodyGeometry = new THREE.BoxGeometry(
            CONFIG.HOUSE.BODY_SIZE.width,
            CONFIG.HOUSE.BODY_SIZE.height,
            CONFIG.HOUSE.BODY_SIZE.depth
        );
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: data.color });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = CONFIG.HOUSE.BODY_SIZE.height / 2;
        body.castShadow = true;
        body.receiveShadow = true;
        houseGroup.add(body);
        
        // Çatı
        const roofGeometry = new THREE.ConeGeometry(
            CONFIG.HOUSE.ROOF_RADIUS,
            CONFIG.HOUSE.ROOF_HEIGHT,
            4
        );
        const roofMaterial = new THREE.MeshLambertMaterial({
            color: CONFIG.HOUSE.DOOR_COLOR
        });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = CONFIG.HOUSE.BODY_SIZE.height + CONFIG.HOUSE.ROOF_HEIGHT / 2;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        houseGroup.add(roof);
        
        // Kapı (pivot noktası sol kenarda)
        const doorGeometry = new THREE.BoxGeometry(
            CONFIG.HOUSE.DOOR_SIZE.width,
            CONFIG.HOUSE.DOOR_SIZE.height,
            CONFIG.HOUSE.DOOR_SIZE.depth
        );
        const doorMaterial = new THREE.MeshLambertMaterial({
            color: CONFIG.HOUSE.DOOR_COLOR
        });
      // Kapı (pivot noktası sol kenarda)
        // Kapı grubu (pivot/menteşe) - ön duvar + sol kenar
        const doorGroup = new THREE.Group();
        doorGroup.position.set(
        -CONFIG.HOUSE.BODY_SIZE.width / 2,   // sol duvar çizgisi
          0,
          CONFIG.HOUSE.BODY_SIZE.depth / 2    // ön duvar çizgisi
        );

        // Kapı mesh'i (menteşeye göre sağa kaydırılmış)
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(
          CONFIG.HOUSE.DOOR_SIZE.width / 2,   // menteşeden sağa
          CONFIG.HOUSE.DOOR_SIZE.height / 2,  // zemine oturur
          CONFIG.HOUSE.DOOR_SIZE.depth / 2 + 0.01 // duvarın biraz önünde
        );
        door.castShadow = true;

        doorGroup.add(door);
        houseGroup.add(doorGroup);


    
        // Pencereler
        this.createWindows(houseGroup);
        
        // Baca
        this.createChimney(houseGroup);
        
        houseGroup.position.set(data.x, 0, data.z);
        this.scene.add(houseGroup);
        
        return { group: houseGroup, door: doorGroup };
    }
    
    /**
     * Pencereler oluştur
     */
    createWindows(houseGroup) {
        const windowGeometry = new THREE.BoxGeometry(
            CONFIG.HOUSE.WINDOW_SIZE.width,
            CONFIG.HOUSE.WINDOW_SIZE.height,
            CONFIG.HOUSE.WINDOW_SIZE.depth
        );
        const windowMaterial = new THREE.MeshLambertMaterial({
            color: CONFIG.HOUSE.WINDOW_COLOR,
            emissive: 0xffffaa,
            emissiveIntensity: 0.2
        });
        
        // Sol pencere
        const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
        window1.position.set(-1, 1.5, CONFIG.HOUSE.BODY_SIZE.depth / 2 + 0.05);
        houseGroup.add(window1);
        
        // Sağ pencere
        const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
        window2.position.set(1, 1.5, CONFIG.HOUSE.BODY_SIZE.depth / 2 + 0.05);
        houseGroup.add(window2);
    }
    
    /**
     * Baca oluştur
     */
    createChimney(houseGroup) {
        const chimneyGeometry = new THREE.BoxGeometry(0.4, 1.5, 0.4);
        const chimneyMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
        const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
        chimney.position.set(1.2, 3.75, -1);
        chimney.castShadow = true;
        houseGroup.add(chimney);
    }
    
    /**
     * Ağaçları oluştur
     */
    createTrees() {
        CONFIG.TREES.forEach(treeData => {
            this.createTree(treeData.x, treeData.z);
        });
    }
    
    /**
     * Tek bir ağaç oluştur
     */
    createTree(x, z) {
        const treeGroup = new THREE.Group();
        
        // Gövde
        const trunkGeometry = new THREE.CylinderGeometry(
            CONFIG.TREE.TRUNK_RADIUS_TOP,
            CONFIG.TREE.TRUNK_RADIUS_BOTTOM,
            CONFIG.TREE.TRUNK_HEIGHT
        );
        const trunkMaterial = new THREE.MeshLambertMaterial({
            color: CONFIG.TREE.TRUNK_COLOR
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = CONFIG.TREE.TRUNK_HEIGHT / 2;
        trunk.castShadow = true;
        treeGroup.add(trunk);
        
        // Yapraklar (3 küre)
        for (let i = 0; i < 3; i++) {
            const leavesGeometry = new THREE.SphereGeometry(
                CONFIG.TREE.LEAVES_RADIUS - i * 0.3,
                8,
                8
            );
            const leavesMaterial = new THREE.MeshLambertMaterial({
                color: CONFIG.TREE.LEAVES_COLOR
            });
            const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
            leaves.position.y = CONFIG.TREE.TRUNK_HEIGHT + 0.5 + i * 0.8;
            leaves.castShadow = true;
            treeGroup.add(leaves);
        }
        
        treeGroup.position.set(x, 0, z);
        this.scene.add(treeGroup);
    }
    
    /**
     * Gökyüzü kutusu
     */
    createSkybox() {
        const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: 0x87ceeb,
            side: THREE.BackSide
        });
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(sky);
    }
    
    /**
     * Kapı animasyonu güncelleme
     */
    updateDoorAnimations() {
        this.doorStates.forEach((state, index) => {
            const house = this.houses[index];
            const currentRotation = house.door.rotation.y;
            
            // Hedef rotasyona yumuşak geçiş
            if (Math.abs(currentRotation - state.targetRotation) > 0.01) {
                house.door.rotation.y += (state.targetRotation - currentRotation) * CONFIG.ANIMATION.DOOR_SPEED;
            }
        });
    }
    
    /**
     * Kapıyı aç/kapat
     */
    toggleDoor(index) {
        const state = this.doorStates.get(index);
        state.isOpen = !state.isOpen;
        state.targetRotation = state.isOpen ? -CONFIG.ANIMATION.DOOR_ROTATION : 0;
        return state.isOpen;
    }
    
    /**
     * En yakın evi bul
     */
    findNearestHouse(playerPosition) {
        let nearestHouse = null;
        let minDistance = CONFIG.PLAYER.INTERACTION_DISTANCE;
        
        this.houses.forEach(house => {
            const distance = playerPosition.distanceTo(house.position);
            if (distance < minDistance) {
                nearestHouse = house;
                minDistance = distance;
            }
        });
        
        return nearestHouse;
    }
}
