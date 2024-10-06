import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// Create a Three.JS scene
const scene = new THREE.Scene();

// Load the background image
const backgroundTexture = new THREE.TextureLoader().load('../models/stars.jpg', () => {
    scene.background = backgroundTexture;
});

// Adjusted far plane to 10000 to prevent objects disappearing when zooming out
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.set(0, 500, 1000);

// Global variables for 3D objects
const objects = {};
const scaleFactor = 1.7;

// Initial speed multiplier
let speedMultiplier = 1;

// Store current angles for moons
const currentAngles = { phobos: 0, deimos: 0 };

// Orbital parameters for Mars and its moons Phobos and Deimos
const orbitalParams = {
    mars: { scale: 1.2, rotationSpeed: 0.01 }, // Mars rotation speed around its axis
    phobos: { a: 60 * scaleFactor, b: 60 * scaleFactor, speed: 0.002, scale: 0.2, rotationSpeed: 0.002 },
    deimos: { a: 100 * scaleFactor, b: 100 * scaleFactor, speed: 0.001, scale: 0.15, rotationSpeed: 0.001 }
};

// Instantiate a loader for the .glb files
const gltfLoader = new GLTFLoader();

// Load the Mars model
gltfLoader.load(
    '../models/mars.glb',
    function (gltf) {
        const mars = gltf.scene;
        mars.position.set(0, 0, 0); // Mars at the center
        const { scale } = orbitalParams.mars;
        mars.scale.set(scale, scale, scale);
        scene.add(mars);
        objects.mars = mars;
    },
    function (xhr) {
        console.log(`Mars: ${(xhr.loaded / xhr.total * 100)}% loaded`);
    },
    function (error) {
        console.error('An error happened while loading the Mars model:', error);
    }
);

// Load the Phobos model
gltfLoader.load(
    '../models/phobos.glb',
    function (gltf) {
        const phobos = gltf.scene;
        const { scale } = orbitalParams.phobos;
        phobos.scale.set(scale, scale, scale);
        phobos.position.set(orbitalParams.phobos.a, 0, 0); // Initial Phobos position
        scene.add(phobos);
        objects.phobos = phobos;
        currentAngles.phobos = 0;

        createOrbitLine("phobos");
    },
    function (xhr) {
        console.log(`Phobos: ${(xhr.loaded / xhr.total * 100)}% loaded`);
    },
    function (error) {
        console.error('An error happened while loading the Phobos model:', error);
    }
);

// Load the Deimos model
gltfLoader.load(
    '../models/deimos.glb',
    function (gltf) {
        const deimos = gltf.scene;
        const { scale } = orbitalParams.deimos;
        deimos.scale.set(scale, scale, scale);
        deimos.position.set(orbitalParams.deimos.a, 0, 0); // Initial Deimos position
        scene.add(deimos);
        objects.deimos = deimos;
        currentAngles.deimos = 0;

        createOrbitLine("deimos");
    },
    function (xhr) {
        console.log(`Deimos: ${(xhr.loaded / xhr.total * 100)}% loaded`);
    },
    function (error) {
        console.error('An error happened while loading the Deimos model:', error);
    }
);

// Instantiate a new renderer and set its size
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
document.getElementById("container3D").appendChild(renderer.domElement);

// Add lights to the scene
const pointLight = new THREE.PointLight(0xffffff, 2, 1000);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);
scene.add(new THREE.AmbientLight(0x404040, 2));

// Add OrbitControls for camera movement
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableZoom = true;
controls.enablePan = true;
controls.minDistance = 275;
controls.maxDistance = 3000;

// Function to create an orbit line
function createOrbitLine(objectName) {
    const { a, b } = orbitalParams[objectName];
    const orbitPoints = new THREE.BufferGeometry();
    const points = [];
    for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        const x = a * Math.cos(angle);
        const z = b * Math.sin(angle);
        points.push(new THREE.Vector3(x, 0, z));
    }
    orbitPoints.setFromPoints(points);

    const orbitLine = new THREE.LineLoop(orbitPoints, new THREE.LineBasicMaterial({ color: 0xffffff }));
    scene.add(orbitLine);
}

// Animation loop to rotate Mars, Phobos, and Deimos
function animate() {
    requestAnimationFrame(animate);

    const { rotationSpeed: marsRotationSpeed } = orbitalParams.mars;
    const { a: phobosA, b: phobosB, speed: phobosSpeed, rotationSpeed: phobosRotationSpeed } = orbitalParams.phobos;
    const { a: deimosA, b: deimosB, speed: deimosSpeed, rotationSpeed: deimosRotationSpeed } = orbitalParams.deimos;

    // Rotate Mars on its axis
    const mars = objects.mars;
    if (mars) {
        mars.rotation.y += marsRotationSpeed * speedMultiplier; // Mars's rotation on its axis
    }

    // Orbit Phobos around Mars
    const phobos = objects.phobos;
    currentAngles.phobos += phobosSpeed * speedMultiplier;
    const phobosX = phobosA * Math.cos(currentAngles.phobos);
    const phobosZ = phobosB * Math.sin(currentAngles.phobos);
    if (phobos) {
        phobos.position.set(phobosX, 0, phobosZ);
        phobos.rotation.y += phobosRotationSpeed;
    }

    // Orbit Deimos around Mars
    const deimos = objects.deimos;
    currentAngles.deimos += deimosSpeed * speedMultiplier;
    const deimosX = deimosA * Math.cos(currentAngles.deimos);
    const deimosZ = deimosB * Math.sin(currentAngles.deimos);
    if (deimos) {
        deimos.position.set(deimosX, 0, deimosZ);
        deimos.rotation.y += deimosRotationSpeed;
    }

    renderer.render(scene, camera);
    controls.update();
}

// Speed control for the orbits of Phobos, Deimos, and Mars's rotation
document.getElementById('speedRange').addEventListener('input', (event) => {
    speedMultiplier = parseFloat(event.target.value);
});

// Update camera aspect ratio on window resize
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation
animate();
