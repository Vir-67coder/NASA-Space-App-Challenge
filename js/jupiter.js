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
camera.position.set(0, 500, 1500); // Adjusted camera position for Jupiter

// Global variables for 3D objects
const objects = {};
const scaleFactor = 5; // Adjust scale factor for better visibility

// Initial speed multiplier
let speedMultiplier = 1;

// Store current angles for moons
const currentAngles = { io: 0, europa: 0, ganymede: 0, callisto: 0 };

// Orbital parameters for Jupiter and its moons
const orbitalParams = {
    jupiter: { scale: 1, rotationSpeed: 0.01 }, // Jupiter rotation speed around its axis
    io: { a: 90 * scaleFactor, b: 90 * scaleFactor, speed: 0.004, scale: 0.8, rotationSpeed: 0.024 }, // Increased orbit radius
    europa: { a: 110 * scaleFactor, b: 110 * scaleFactor, speed: 0.003, scale: 0.18, rotationSpeed: 0.003 }, // Increased orbit radius
    ganymede: { a: 130 * scaleFactor, b: 130 * scaleFactor, speed: 0.002, scale: 0.25, rotationSpeed: 0.002 }, // Increased orbit radius
    callisto: { a: 160 * scaleFactor, b: 160 * scaleFactor, speed: 0.001, scale: 0.22, rotationSpeed: 0.001 } // Increased orbit radius
};

// Instantiate a loader for the .glb files
const gltfLoader = new GLTFLoader();

// Load the Jupiter model
gltfLoader.load(
    '../models/jupiter.glb',
    function (gltf) {
        const jupiter = gltf.scene;
        jupiter.position.set(0, 0, 0); // Jupiter at the center
        const { scale } = orbitalParams.jupiter;
        jupiter.scale.set(scale, scale, scale);
        scene.add(jupiter);
        objects.jupiter = jupiter;
    },
    function (xhr) {
        console.log(`Jupiter: ${(xhr.loaded / xhr.total * 100)}% loaded`);
    },
    function (error) {
        console.error('An error happened while loading the Jupiter model:', error);
    }
);

// Load the Io model
gltfLoader.load(
    '../models/io.glb',
    function (gltf) {
        const io = gltf.scene;
        const { scale } = orbitalParams.io;
        io.scale.set(scale, scale, scale);
        io.position.set(orbitalParams.io.a, 0, 0); // Initial Io position
        scene.add(io);
        objects.io = io;
        currentAngles.io = 0;

        createOrbitLine("io");
    },
    function (xhr) {
        console.log(`Io: ${(xhr.loaded / xhr.total * 100)}% loaded`);
    },
    function (error) {
        console.error('An error happened while loading the Io model:', error);
    }
);

// Load the Europa model
gltfLoader.load(
    '../models/europa.glb',
    function (gltf) {
        const europa = gltf.scene;
        const { scale } = orbitalParams.europa;
        europa.scale.set(scale, scale, scale);
        europa.position.set(orbitalParams.europa.a, 0, 0); // Initial Europa position
        scene.add(europa);
        objects.europa = europa;
        currentAngles.europa = 0;

        createOrbitLine("europa");
    },
    function (xhr) {
        console.log(`Europa: ${(xhr.loaded / xhr.total * 100)}% loaded`);
    },
    function (error) {
        console.error('An error happened while loading the Europa model:', error);
    }
);

// Load the Ganymede model
gltfLoader.load(
    '../models/ganymede.glb',
    function (gltf) {
        const ganymede = gltf.scene;
        const { scale } = orbitalParams.ganymede;
        ganymede.scale.set(scale, scale, scale);
        ganymede.position.set(orbitalParams.ganymede.a, 0, 0); // Initial Ganymede position
        scene.add(ganymede);
        objects.ganymede = ganymede;
        currentAngles.ganymede = 0;

        createOrbitLine("ganymede");
    },
    function (xhr) {
        console.log(`Ganymede: ${(xhr.loaded / xhr.total * 100)}% loaded`);
    },
    function (error) {
        console.error('An error happened while loading the Ganymede model:', error);
    }
);

// Load the Callisto model
gltfLoader.load(
    '../models/calisto.glb',
    function (gltf) {
        const callisto = gltf.scene;
        const { scale } = orbitalParams.callisto;
        callisto.scale.set(scale, scale, scale);
        callisto.position.set(orbitalParams.callisto.a, 0, 0); // Initial Callisto position
        scene.add(callisto);
        objects.callisto = callisto;
        currentAngles.callisto = 0;

        createOrbitLine("callisto");
    },
    function (xhr) {
        console.log(`Callisto: ${(xhr.loaded / xhr.total * 100)}% loaded`);
    },
    function (error) {
        console.error('An error happened while loading the Callisto model:', error);
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

// Animation loop to rotate Jupiter, Io, Europa, Ganymede, and Callisto
function animate() {
    requestAnimationFrame(animate);

    const { rotationSpeed: jupiterRotationSpeed } = orbitalParams.jupiter;
    const { a: ioA, b: ioB, speed: ioSpeed, rotationSpeed: ioRotationSpeed } = orbitalParams.io;
    const { a: europaA, b: europaB, speed: europaSpeed, rotationSpeed: europaRotationSpeed } = orbitalParams.europa;
    const { a: ganymedeA, b: ganymedeB, speed: ganymedeSpeed, rotationSpeed: ganymedeRotationSpeed } = orbitalParams.ganymede;
    const { a: callistoA, b: callistoB, speed: callistoSpeed, rotationSpeed: callistoRotationSpeed } = orbitalParams.callisto;

    // Rotate Jupiter on its axis
    const jupiter = objects.jupiter;
    if (jupiter) {
        jupiter.rotation.y += jupiterRotationSpeed * speedMultiplier; // Jupiter's rotation on its axis
    }

    // Orbit Io around Jupiter
    const io = objects.io;
    currentAngles.io += ioSpeed * speedMultiplier;
    const ioX = ioA * Math.cos(currentAngles.io);
    const ioZ = ioB * Math.sin(currentAngles.io);
    if (io) {
        io.position.set(ioX, 0, ioZ);
        io.rotation.y += ioRotationSpeed;
    }

    // Orbit Europa around Jupiter
    const europa = objects.europa;
    currentAngles.europa += europaSpeed * speedMultiplier;
    const europaX = europaA * Math.cos(currentAngles.europa);
    const europaZ = europaB * Math.sin(currentAngles.europa);
    if (europa) {
        europa.position.set(europaX, 0, europaZ);
        europa.rotation.y += europaRotationSpeed;
    }

    // Orbit Ganymede around Jupiter
    const ganymede = objects.ganymede;
    currentAngles.ganymede += ganymedeSpeed * speedMultiplier;
    const ganymedeX = ganymedeA * Math.cos(currentAngles.ganymede);
    const ganymedeZ = ganymedeB * Math.sin(currentAngles.ganymede);
    if (ganymede) {
        ganymede.position.set(ganymedeX, 0, ganymedeZ);
        ganymede.rotation.y += ganymedeRotationSpeed;
    }

    // Orbit Callisto around Jupiter
    const callisto = objects.callisto;
    currentAngles.callisto += callistoSpeed * speedMultiplier;
    const callistoX = callistoA * Math.cos(currentAngles.callisto);
    const callistoZ = callistoB * Math.sin(currentAngles.callisto);
    if (callisto) {
        callisto.position.set(callistoX, 0, callistoZ);
        callisto.rotation.y += callistoRotationSpeed;
    }

    renderer.render(scene, camera);
    controls.update();
}

// Speed control for the orbits of Io, Europa, Ganymede, Callisto, and Jupiter's rotation
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
