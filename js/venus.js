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
const currentAngles = {
    venus: 0
};

// Orbital parameters for Venus (as the main planet)
const orbitalParams = {
    venus: { scale: 1.6, rotationSpeed: -0.0017 } // Venus rotation speed around its axis
};

// Instantiate a loader for the .glb files
const gltfLoader = new GLTFLoader();

// Load the Venus model
gltfLoader.load(
    '../models/venus.glb', // Make sure you have a Venus model here
    function (gltf) {
        const venus = gltf.scene;
        venus.position.set(0, 0, 0); // Venus at the center
        const { scale } = orbitalParams.venus;
        venus.scale.set(scale, scale, scale);
        scene.add(venus);
        objects.venus = venus;
    },
    function (xhr) {
        console.log(`Venus: ${(xhr.loaded / xhr.total * 100)}% loaded`);
    },
    function (error) {
        console.error('An error happened while loading the Venus model:', error);
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
controls.minDistance = 110;
controls.maxDistance = 400;

// Animation loop to rotate Venus
function animate() {
    requestAnimationFrame(animate);

    const { rotationSpeed } = orbitalParams.venus;

    // Rotate Venus on its axis
    const venus = objects.venus;
    if (venus) {
        venus.rotation.y += rotationSpeed * speedMultiplier; // Venus's rotation on its axis
    }

    renderer.render(scene, camera);
    controls.update();
}

// Speed control for Venus's rotation
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
