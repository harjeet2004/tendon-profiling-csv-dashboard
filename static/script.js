// Set up Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// White background
scene.background = new THREE.Color(0xffffff);
scene.fog = new THREE.Fog(0xffffff, 200, 500);

// Create Water
function createWater() {
    const waterGeometry = new THREE.PlaneGeometry(1000, 1000);
    const waterMaterial = new THREE.MeshPhongMaterial({
        color: 0x006994,
        transparent: true,
        opacity: 0.8,
        shininess: 100
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -20;
    water.receiveShadow = true;
    return water;
}

// Create Road Function
function createRoad() {
    const roadGroup = new THREE.Group();

    // Main road surface (widened)
    const roadGeometry = new THREE.PlaneGeometry(300, 60); // Increased width to 60
    const roadMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x333333,
        roughness: 0.8,
        metalness: 0.2
    });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.y = 0;
    road.receiveShadow = true;
    roadGroup.add(road);

    // Road lines (dashed)
    const lineGeometry = new THREE.PlaneGeometry(12, 1); // Increased line width
    const lineMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFFFFFF,
        emissive: 0xFFFFFF,
        roughness: 0.2
    });

    // Center dashed lines (multiple parallel lines)
    const lanePositions = [-15, -5, 5, 15];
    for (let i = -140; i <= 140; i += 25) {
        lanePositions.forEach(zPos => {
            const line = new THREE.Mesh(lineGeometry, lineMaterial);
            line.rotation.x = -Math.PI / 2;
            line.position.set(i, 0.01, zPos);
            roadGroup.add(line);
        });
    }

    // Side lines (continuous)
    const sideLineGeometry = new THREE.PlaneGeometry(300, 1.2);
    const sideLine1 = new THREE.Mesh(sideLineGeometry, lineMaterial);
    sideLine1.rotation.x = -Math.PI / 2;
    sideLine1.position.set(0, 0.01, 25);
    roadGroup.add(sideLine1);

    const sideLine2 = sideLine1.clone();
    sideLine2.position.z = -25;
    roadGroup.add(sideLine2);

    return roadGroup;
}

// Arch Bridge Construction Function
function createArchBridge() {
    const bridgeGroup = new THREE.Group();

    // Main road platform
    const bridgeGeometry = new THREE.BoxGeometry(300, 2, 40);
    const bridgeMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x333333,
        roughness: 0.8,
        metalness: 0.2
    });
    const bridgePlatform = new THREE.Mesh(bridgeGeometry, bridgeMaterial);
    bridgePlatform.position.y = 0.5;
    bridgePlatform.castShadow = true;
    bridgePlatform.receiveShadow = true;
    bridgeGroup.add(bridgePlatform);

    // Create enhanced arch structure
    const archPoints = [
        new THREE.Vector3(-140, -5, 15),
        new THREE.Vector3(-100, 30, 15),
        new THREE.Vector3(-60, 55, 15),
        new THREE.Vector3(0, 65, 15),
        new THREE.Vector3(60, 55, 15),
        new THREE.Vector3(100, 30, 15),
        new THREE.Vector3(140, -5, 15)
    ];

    const archCurve = new THREE.CatmullRomCurve3(archPoints);
    const archGeometry = new THREE.TubeGeometry(archCurve, 50, 4, 16, false);
    const archMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2c3e50,
        roughness: 0.3,
        metalness: 0.8
    });

    // Front and back arches
    const frontArch = new THREE.Mesh(archGeometry, archMaterial);
    frontArch.castShadow = true;
    bridgeGroup.add(frontArch);

    const backArch = frontArch.clone();
    backArch.position.z = -30;
    bridgeGroup.add(backArch);

    // Add vertical suspension cables
    const cableGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1);
    const cableMaterial = new THREE.MeshStandardMaterial({
        color: 0x666666,
        metalness: 0.8
    });

    for (let i = 0; i <= 1; i += 0.05) {
        const point = archCurve.getPoint(i);
        const cable = new THREE.Mesh(cableGeometry, cableMaterial);
        cable.position.set(point.x, point.y/2, 15);
        cable.scale.y = point.y;
        bridgeGroup.add(cable);

        const backCable = cable.clone();
        backCable.position.z = -15;
        bridgeGroup.add(backCable);
    }

    // Add cross beams under the bridge
    const beamGeometry = new THREE.BoxGeometry(4, 1, 30);
    const beamMaterial = new THREE.MeshStandardMaterial({
        color: 0x34495e,
        roughness: 0.5,
        metalness: 0.7
    });

    for (let x = -140; x <= 140; x += 20) {
        const beam = new THREE.Mesh(beamGeometry, beamMaterial);
        beam.position.set(x, -1, 0);
        bridgeGroup.add(beam);
    }

    // Add diagonal support bars
    const supportGeometry = new THREE.BoxGeometry(28, 1, 1);
    for (let x = -130; x <= 130; x += 20) {
        const support1 = new THREE.Mesh(supportGeometry, beamMaterial);
        support1.position.set(x, -1, 0);
        support1.rotation.y = Math.PI / 4;
        support1.rotation.z = Math.PI / 6;
        bridgeGroup.add(support1);

        const support2 = support1.clone();
        support2.rotation.y = -Math.PI / 4;
        bridgeGroup.add(support2);
    }

    // Add vertical support pillars
    const pillarGeometry = new THREE.BoxGeometry(8, 40, 8);
    const pillarMaterial = new THREE.MeshStandardMaterial({
        color: 0x34495e,
        roughness: 0.5,
        metalness: 0.7
    });

    const pillarPositions = [-120, -60, 0, 60, 120];
    pillarPositions.forEach(x => {
        const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        pillar.position.set(x, -20, 15);
        pillar.castShadow = true;
        bridgeGroup.add(pillar);

        const backPillar = pillar.clone();
        backPillar.position.z = -15;
        bridgeGroup.add(backPillar);
    });

    return bridgeGroup;
}

// Enhanced Crane Construction
function createCrane(xPos, zPos) {
    const craneGroup = new THREE.Group();

    // Base structure
    const baseGeometry = new THREE.BoxGeometry(12, 60, 12);
    const baseMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xdd3333,
        metalness: 0.5,
        roughness: 0.7
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 20;
    base.castShadow = true;
    craneGroup.add(base);

    // Arm structure
    const armGeometry = new THREE.BoxGeometry(80, 4, 4);
    const arm = new THREE.Mesh(armGeometry, baseMaterial);
    arm.position.set(20, 38, 0);
    arm.castShadow = true;
    craneGroup.add(arm);

    // Counter weight
    const counterWeightGeometry = new THREE.BoxGeometry(10, 10, 8);
    const counterWeight = new THREE.Mesh(counterWeightGeometry, baseMaterial);
    counterWeight.position.set(-10, 38, 0);
    counterWeight.castShadow = true;
    craneGroup.add(counterWeight);

    // Cable system
    const cableGeometry = new THREE.CylinderGeometry(0.2, 0.2, 20);
    const cableMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x666666,
        metalness: 0.8
    });
    const cable = new THREE.Mesh(cableGeometry, cableMaterial);
    cable.position.set(35, 28, 0);
    craneGroup.add(cable);

    // Hook system
    const hookGeometry = new THREE.BoxGeometry(3, 3, 3);
    const hookMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x444444,
        metalness: 0.9
    });
    const hook = new THREE.Mesh(hookGeometry, hookMaterial);
    hook.position.set(35, 18, 0);
    hook.castShadow = true;
    craneGroup.add(hook);

    // Construction block being lifted
    const blockGeometry = new THREE.BoxGeometry(8, 8, 8);
    const blockMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x888888,
        roughness: 0.7,
        metalness: 0.3
    });
    const block = new THREE.Mesh(blockGeometry, blockMaterial);
    block.position.set(35, 14, 0);
    block.castShadow = true;
    craneGroup.add(block);

    craneGroup.position.set(xPos, 0, zPos);
    return craneGroup;
}

// Add Water
const water = createWater();
scene.add(water);

// Add Road
const road = createRoad();
scene.add(road);

// Add Bridge
const bridge = createArchBridge();
scene.add(bridge);

// Add Cranes with strategic positioning
const cranePositions = [
    { x: -120, z: 40 },
    { x: -120, z: -40 },
    { x: 0, z: 60 },
    { x: 0, z: -60 },
    { x: 120, z: 40 },
    { x: 120, z: -40 }
];

const cranes = cranePositions.map(pos => {
    const crane = createCrane(pos.x, pos.z);
    scene.add(crane);
    return crane;
});

// Enhanced Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

// Main sun light
const sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.position.set(100, 100, 50);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 500;
sunLight.shadow.camera.left = -100;
sunLight.shadow.camera.right = 100;
sunLight.shadow.camera.top = 100;
sunLight.shadow.camera.bottom = -100;
scene.add(sunLight);

// Additional fill light
const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
fillLight.position.set(-100, 50, -50);
scene.add(fillLight);

// Camera Positioning for better view
camera.position.set(0, 80, 200);
camera.lookAt(scene.position);

// Animation Loop with enhanced crane movements
function animate() {
    requestAnimationFrame(animate);

    // Water animation
    water.material.opacity = 0.6 + Math.sin(Date.now() * 0.001) * 0.1;

    // Crane animations
    cranes.forEach((crane, index) => {
        // Rotate crane base
        crane.rotation.y = Math.sin(Date.now() * 0.0005 + index) * 0.5;

        // Animate cable, hook and block
        const hookHeight = Math.sin(Date.now() * 0.001 + index * 0.5) * 8;
        const cable = crane.children[3];
        const hook = crane.children[4];
        const block = crane.children[5];

        cable.scale.y = 1 + hookHeight * 0.1;
        cable.position.y = 28 - hookHeight * 0.5;
        hook.position.y = 18 - hookHeight;
        block.position.y = 14 - hookHeight;
    });

    renderer.render(scene, camera);
}

animate();

// Window Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Drag and Drop Handling
const dropZone = document.querySelector('.drop-zone');
const fileInput = document.querySelector('#file-input');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.add('dragover');
    });
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.remove('dragover');
    });
});

dropZone.addEventListener('drop', handleDrop);
dropZone.addEventListener('click', () => fileInput.click());

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

function handleFiles(files) {
    const file = files[0];
    if (file && file.name.endsWith('.csv')) {
        fileInput.files = files;
        document.querySelector('form').submit();
    }
}