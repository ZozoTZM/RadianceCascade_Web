import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface RadianceProbe {
  mesh: THREE.Mesh;
  shCoefficients: number[];
  position: THREE.Vector3;
}
const SH_COEFFICIENT_COUNT = 9;

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

//
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
  format: THREE.RGBFormat,
  generateMipmaps: true,
  minFilter: THREE.LinearMipmapLinearFilter
});
const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget);
scene.add(cubeCamera);

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

const cubeGeometry = new THREE.BoxGeometry(1,1,1);
const cubeMaterial = new THREE.MeshStandardMaterial({
  color: 0x00ff00,
  roughness: 0.1,
  metalness: 0.9,
  envMap: cubeRenderTarget.texture
});
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.set(-2, -0.5, 0);
scene.add(cube);

//Light probes grid
const globalProbes = createProbeGrid(5, 4, 'global-probes');
const localProbes = createProbeGrid(8, 0.5, 'local-probes');
const localProbeGroup = scene.children.find(child => child.name === 'local-probes') as THREE.Group;
//Camera and controls
camera.position.z = 5;
camera.position.set(2, 2, 8);

const controls = new OrbitControls(camera, renderer.domElement);




//Animation loop
function animate(){
  requestAnimationFrame(animate);

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  localProbeGroup.position.set(camera.position.x, 0, camera.position.z);
  controls.update();
  cubeCamera.update(renderer, scene);
  renderer.render(scene, camera);
}

animate();



function createProbeGrid(gridSize: number, spacing: number, groupName: string){
  const probes: RadianceProbe[] = [];
  const group = new THREE.Group();
  group.name = groupName;
  scene.add(group);

  const probeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
  const probeMaterial = new THREE.MeshStandardMaterial({color: 0xff00ff});

  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      for (let z = 0; z < gridSize; z++) {
        const probeMesh = new THREE.Mesh(probeGeometry, probeMaterial.clone());
        probeMesh.position.set(
          (x - (gridSize - 1) / 2) * spacing,
          (y - (gridSize - 1) / 2) * spacing,
          (z - (gridSize - 1) / 2) * spacing
        );

        const shCoefficients = new Array(SH_COEFFICIENT_COUNT).fill(0);

        const probe: RadianceProbe = {
          mesh: probeMesh,
          shCoefficients: shCoefficients,
          position: probeMesh.position
        };

        group.add(probe.mesh);
        probes.push(probe);
      }
    }
  }
  return probes;
}


//Event listeners
window.addEventListener('resize', ()=>{
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

probeToggle.addEventListener('change', ()=>{
  showProbes = probeToggle.checked;
  globalProbes.forEach(probe => probe.mesh.visible = showProbes);
  localProbes.forEach(probe => probe.mesh.visible = showProbes);
});