import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let showProbes = true;
const probeToggle = document.getElementById('probe-toggle') as HTMLInputElement;

//Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//Lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5,5,5);
scene.add(directionalLight); 

//Objects
const planeGeometry = new THREE.PlaneGeometry(10,10);
const planeMaterial = new THREE.MeshStandardMaterial({color: 0xcccccc });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -2.5;
scene.add(plane);

const wallGeometry = new THREE.BoxGeometry(0.2, 5, 10);
const wallMaterial = new THREE.MeshStandardMaterial({color: 0x999999});
const wall = new THREE.Mesh(wallGeometry, wallMaterial);
wall.position.x = -5;
scene.add(wall);

const geometry = new THREE.BoxGeometry(1,1,1);
const material = new THREE.MeshStandardMaterial({color: 0x00ff00});
const cube = new THREE.Mesh(geometry, material);
cube.position.set(-2, -0.5, 0);
scene.add(cube);

//Light probes grid
const probeGridSize = 5;
const probeSpacing = 2;
const probeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
const probeMaterial = new THREE.MeshStandardMaterial({color: 0xff00ff});
const probeGroup = new THREE.Group();
scene.add(probeGroup);

for(let x = 0; x < probeGridSize; x++){
  for(let y = 0; y < probeGridSize; y++){
    for(let z = 0; z < probeGridSize; z++){
      const probe = new THREE.Mesh(probeGeometry, probeMaterial);
      probe.position.set(
        (x - (probeGridSize - 1) / 2) * probeSpacing,
        (y - (probeGridSize - 1) / 2) * probeSpacing,
        (z - (probeGridSize - 1) / 2) * probeSpacing
      );
      probeGroup.add(probe); 
    }
  }
}

//Camera and controls
camera.position.z = 5;
camera.position.set(2, 2, 8);

const controls = new OrbitControls(camera, renderer.domElement);


//Animation loop
function animate(){
  requestAnimationFrame(animate);

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  controls.update();
  renderer.render(scene, camera);
}

animate();

//Event listeners
window.addEventListener('resize', ()=>{
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

probeToggle.addEventListener('change', ()=>{
  showProbes = probeToggle.checked;
  probeGroup.visible = showProbes;
});