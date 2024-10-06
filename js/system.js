import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// Create a Three.JS scene
const scene = new THREE.Scene();
// scene.background = new THREE.Color(0x000000);

// Load the background image
const backgroundTexture = new THREE.TextureLoader().load('../models/stars.jpg', () => {
    scene.background = backgroundTexture; // Set the scene's background
});

// Adjusted far plane to 10000 to prevent objects disappearing when zooming out
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.set(0, 500, 1000); // Adjusted to have a good view of the solar system

// Global variables for the 3D objects
const planets = {};
const scaleFactor = 1.7; // Multiply the orbit size by 2. Adjust this factor as needed.

// Initial speed multiplier
let speedMultiplier = 1;

// Store current angles for each planet
const currentAngles = {};

// Planet orbital parameters: distance from the Sun (a, b), speed, scale, and rotation speed for day-night cycle
const planetOrbitalParams = {
    mercury: { a: 350 * scaleFactor, b: 350 * scaleFactor, speed: 0.002, scale: 1.5, rotationSpeed: 0.0047 },
    venus: { a: 480 * scaleFactor, b: 480 * scaleFactor, speed: 0.0015, scale: 1.5, rotationSpeed: -0.0017 },
    earth: { a: 640 * scaleFactor, b: 640 * scaleFactor, speed: 0.001, scale: 1.5, rotationSpeed: 0.01 },
    mars: { a: 800 * scaleFactor, b: 800 * scaleFactor, speed: 0.0009, scale: 1.5, rotationSpeed: 0.01 },
    jupiter: { a: 1200 * scaleFactor, b: 1200 * scaleFactor, speed: 0.0007, scale: 1.5, rotationSpeed: 0.024 },
    saturn: { a: 1600 * scaleFactor, b: 1600 * scaleFactor, speed: 0.0006, scale: 1.5, rotationSpeed: 0.021 },
    uranus: { a: 2200 * scaleFactor, b: 2200 * scaleFactor, speed: 0.0005, scale: 1.5, rotationSpeed: -0.014 },
    neptune: { a: 2600 * scaleFactor, b: 2600 * scaleFactor, speed: 0.0004, scale: 1.5, rotationSpeed: 0.01 }
};

// Instantiate a loader for the .glb files
const gltfLoader = new GLTFLoader();

// Load the Sun model
gltfLoader.load(
    '../models/sun.glb',
    function (gltf) {
        const sun = gltf.scene;
        sun.position.set(0, 0, 0); // Place the Sun at the center
        scene.add(sun);
        planets.sun = sun;
    },
    function (xhr) {
        console.log(`Sun: ${(xhr.loaded / xhr.total * 100)}% loaded`);
    },
    function (error) {
        console.error('An error happened while loading the Sun model:', error);
    }
);

// Function to load a planet model with the adjusted scale and orbital distance
function loadPlanet(name) {
    gltfLoader.load(
        `../models/${name}.glb`,
        function (gltf) {
            const planet = gltf.scene;
            const { scale } = planetOrbitalParams[name];
            planet.scale.set(scale, scale, scale);
            planet.position.y = 0;
            scene.add(planet);
            planets[name] = planet;

            currentAngles[name] = 0;

            createOrbitLine(name);
        },
        function (xhr) {
            console.log(`${name.charAt(0).toUpperCase() + name.slice(1)}: ${(xhr.loaded / xhr.total * 100)}% loaded`);
        },
        function (error) {
            console.error(`An error happened while loading the ${name} model:`, error);
        }
    );
}

// Load all planets and their orbit lines
['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'].forEach(loadPlanet);

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

// Set limits for zoom
controls.minDistance = 1000; // Minimum distance for zooming in
controls.maxDistance = 6000; // Maximum distance for zooming out

function createOrbitLine(planetName) {
    const { a, b } = planetOrbitalParams[planetName];
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

// Animation loop to rotate the planets and update their positions
function animate() {
    requestAnimationFrame(animate);

    Object.keys(planets).forEach((planetName) => {
        if (planetName === 'sun') return;

        const planet = planets[planetName];
        const { a, b, speed, rotationSpeed } = planetOrbitalParams[planetName];
        currentAngles[planetName] += speed * speedMultiplier;

        const x = a * Math.cos(currentAngles[planetName]);
        const z = b * Math.sin(currentAngles[planetName]);

        planet.position.set(x, 0, z);
        planet.rotation.y += rotationSpeed;
    });

    renderer.render(scene, camera);
    controls.update();
}

// Speed control for the planets
document.getElementById('speedRange').addEventListener('input', (event) => {
    speedMultiplier = parseFloat(event.target.value);
});

// Modal functionality for planet images
const modal = document.getElementById('modal');
const modalImage = document.getElementById('modal-image');
const closeModal = document.getElementById('close-modal');

// const planetImages = {
//     mercury: 'images/mercury.jpg',
//     venus: 'images/venus.jpg',
//     earth: 'images/earth.jpg',
//     mars: 'images/mars.jpg',
//     jupiter: 'images/jupiter.jpg',
//     saturn: 'images/saturn.jpg',
//     uranus: 'images/uranus.jpg',
//     neptune: 'images/neptune.jpg'
// };

document.querySelectorAll('.planet-button').forEach(button => {
    button.addEventListener('click', () => {
        const planetName = button.getAttribute('data-planet');
        modalImage.src = planetImages[planetName]; // Show planet image
        modal.style.display = 'flex'; // Display modal
    });
});

// Close modal
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Update camera aspect ratio on window resize
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation
animate();
