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

// Store current angles
const currentAngles = {};

// Orbital parameters for Earth and Moon
const orbitalParams = {
    earth: { scale: 1.5, rotationSpeed: 0.01 }, // Earth rotation speed around its axis
    moon: { a: 100 * scaleFactor, b: 100 * scaleFactor, speed: 0.001, scale: 1.0, rotationSpeed: 0.002 }
};

// Instantiate a loader for the .glb files
const gltfLoader = new GLTFLoader();

// Load the Earth model
gltfLoader.load(
    '../models/earth.glb',
    function (gltf) {
        const earth = gltf.scene;
        earth.position.set(0, 0, 0); // Earth at the center
        const { scale } = orbitalParams.earth;
        earth.scale.set(scale, scale, scale);
        scene.add(earth);
        objects.earth = earth;
    },
    function (xhr) {
        console.log(`Earth: ${(xhr.loaded / xhr.total * 100)}% loaded`);
    },
    function (error) {
        console.error('An error happened while loading the Earth model:', error);
    }
);

// Load the Moon model
gltfLoader.load(
    '../models/moon.glb',
    function (gltf) {
        const moon = gltf.scene;
        const { scale } = orbitalParams.moon;
        moon.scale.set(scale, scale, scale);
        moon.position.set(orbitalParams.moon.a, 0, 0); // Initial moon position
        scene.add(moon);
        objects.moon = moon;
        currentAngles.moon = 0;

        createOrbitLine("moon");
    },
    function (xhr) {
        console.log(`Moon: ${(xhr.loaded / xhr.total * 100)}% loaded`);
    },
    function (error) {
        console.error('An error happened while loading the Moon model:', error);
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

// Animation loop to rotate the Earth and Moon
function animate() {
    requestAnimationFrame(animate);

    const { a, b, speed, rotationSpeed: moonRotationSpeed } = orbitalParams.moon;
    const { rotationSpeed: earthRotationSpeed } = orbitalParams.earth;

    // Rotate Earth on its axis
    const earth = objects.earth;
    if (earth) {
        earth.rotation.y += earthRotationSpeed * speedMultiplier; // Earth's rotation on its axis
    }

    // Orbit the Moon around the Earth
    const moon = objects.moon;
    currentAngles.moon += speed * speedMultiplier;

    const x = a * Math.cos(currentAngles.moon);
    const z = b * Math.sin(currentAngles.moon);
    if (moon) {
        moon.position.set(x, 0, z);
        moon.rotation.y += moonRotationSpeed;
    }

    renderer.render(scene, camera);
    controls.update();
}

// Speed control for the orbit of the Moon and Earth's rotation
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
