// global constants
const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000 );
const renderer = new THREE.WebGLRenderer({
  antialias: true
});

const gui = new dat.GUI();
const guiValues = new makeGuiValues();
let xPoints = [];
let yPoints = [];
let shapeGroup;
const waveLength = Math.PI * 2;
const nPoints = 32;
const commonScale = 64;
const pointSize = 3;

let mouseWasClicked = false;

// create elements
const camControls = new THREE.OrbitControls( camera );
const ambientLight = new THREE.AmbientLight( 0x404040 );
const light = new THREE.DirectionalLight(0xffffff, 0.75);
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
// const testPoint = createPoint({
//   position: new THREE.Vector3(0, 0, 0),
//   size: 1,
//   color: 0x00ff00
// });
xPoints = generateXsMap({
  waveLength: waveLength,
  nPoints: nPoints,
  scale: commonScale
});
yPoints = generateYsMap({
  waveLength: waveLength,
  nPoints: nPoints,
  scale: commonScale
});

// config
gui.close();
// gui.add(guiValues, 'addHelpers');
gui.add(guiValues, 'orbitCam');
gui.add(guiValues, 'rotateIt').listen();
gui.add(guiValues, 'resetRotate');
// gui.addColor(guiValues, 'color');
// camera
camControls.enableDamping = true;
camControls.enabled = false;
camControls.enableZoom = false;
camera.position.z = 500;
// camera.lookAt(100, 100, 100);
// light
light.position.x = 16;
light.position.y = 16;
light.position.z = 16;
// renderer
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// add lighting
camera.add(light);
scene.add(ambientLight);

// add meshes to scene
drawShape({
  xPoints: xPoints,
  yPoints: yPoints,
  scene: scene,
});
drawChart({
  name: 'x-chart',
  points: xPoints,
  scene: camera,
  scale: commonScale,
  position: new THREE.Vector3(
    - window.innerWidth / 2 + 32,
    (- window.innerHeight / 2) + commonScale + 32 + 64 + (commonScale * 2),
    -512
  )
});
drawChart({
  name: 'y-chart',
  points: yPoints,
  scene: camera,
  scale: commonScale,
  position: new THREE.Vector3(
    - window.innerWidth / 2 + 32,
    (- window.innerHeight / 2) + commonScale + 32,
    -512
  )
});
scene.add(camera);
// scene.add(testPoint);

// animation
function animate() {
  requestAnimationFrame(animate);
  setFromGui();
  if (shapeGroup && guiValues.rotateIt) {
    // shapeGroup.rotation.x += 0.01;
    shapeGroup.rotation.y += 0.015;
    shapeGroup.rotation.z += 0.01;
  }
  camControls.update();
	renderer.render(scene, camera);
}

function setFromGui() {
  // const color = new THREE.Color(guiValues.color[0] / 255, guiValues.color[1] / 255, guiValues.color[2] / 255);
  // if (!cube.material.color.equals(color)) {
  //   cube.material.color.setRGB(guiValues.color[0] / 255, guiValues.color[1] / 255, guiValues.color[2] / 255);
  // }
  if (camControls.enabled !== guiValues.orbitCam) {
    camControls.enabled = guiValues.orbitCam;
  }
}

function generateXsMap(opts) {
  const slice = opts.waveLength / nPoints;
  const xMap = [];
  for (let i = 0; i < opts.waveLength; i += slice) {
    xMap.push(Math.cos(i) * opts.scale);
  }
  return xMap;
}

function generateYsMap(opts) {
  const slice = opts.waveLength / nPoints;
  const yMap = [];
  for (let i = 0; i < opts.waveLength; i += slice) {
    yMap.push(Math.sin(i) * opts.scale);
  }
  return yMap;
}

function createPoint(opts) {
  const geometry = new THREE.SphereBufferGeometry(opts.size, 32, 32);
  const material = new THREE.MeshPhongMaterial({ color: opts.color });
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(opts.position.x, opts.position.y, opts.position.z);
  return mesh;
}

function drawShape(opts) {
  const group = new THREE.Group();
  group.name = 'shape'
  for (let i = 0; i < opts.xPoints.length; i++) {
    const point = createPoint({
      position: new THREE.Vector3(opts.xPoints[i], opts.yPoints[i], 0),
      size: pointSize,
      color: 0x00ff00
    });
    group.add(point);
  }
  group.position.y = window.innerHeight / 2 - commonScale - 128;
  shapeGroup = group;
  opts.scene.add(group);
}

function drawChart(opts) {
  const group = new THREE.Group();
  group.name = opts.name;
  const internalScale = 0.1

  const guideLineMaterial = new THREE.LineBasicMaterial( { color: 0x888888 } );
  const xLineGeometry = new THREE.Geometry();
  xLineGeometry.vertices.push(new THREE.Vector3( 0, 0, 0) );
  xLineGeometry.vertices.push(new THREE.Vector3( opts.scale * internalScale * opts.points.length, 0, 0) );
  const xLine = new THREE.Line( xLineGeometry, guideLineMaterial );


  const yLineGeometry = new THREE.Geometry();
  yLineGeometry.vertices.push(new THREE.Vector3( 0, -commonScale, 0) );
  yLineGeometry.vertices.push(new THREE.Vector3( 0, commonScale, 0) );
  const yLine = new THREE.Line( yLineGeometry, guideLineMaterial );

  group.add(xLine);
  group.add(yLine);
  for (let i = 0; i < opts.points.length; i++) {
    const point = createPoint({
      position: new THREE.Vector3(i * opts.scale * internalScale, opts.points[i], 0),
      size: pointSize,
      color: 0x00ff00
    });
    group.add(point);
  }
  group.position.set(opts.position.x, opts.position.y, opts.position.z)
  opts.scene.add(group);
}

animate();

// add renderer to dom
document.body.appendChild(renderer.domElement);
window.onresize = onResize;

// gui functions 
function makeGuiValues() {
  this.orbitCam = false;
  this.rotateIt = false;
  this.resetRotate = function() {
    shapeGroup.rotation.y = 0;
    shapeGroup.rotation.z = 0;
    this.rotateIt = false;
  };
};
// this.addHelpers = addHelpers;

function addHelpers() {
  const lightHelper = new THREE.DirectionalLightHelper(light, 4);
  scene.add(lightHelper);
}

// other functions
function onResize() {
  // camera.aspect = window.innerWidth / window.innerHeight;
  // camera.updateProjectionMatrix();
  // renderer.setSize(window.innerWidth, window.innerHeight);
  // notify the renderer of the size change
  renderer.setSize(window.innerWidth, window.innerHeight);
  // update the camera
  camera.left = -window.innerWidth / 2;
  camera.right = window.innerWidth / 2;
  camera.top = window.innerHeight / 2;
  camera.bottom = -window.innerHeight / 2;
  camera.updateProjectionMatrix();
}

function onMouseClick( event ) {

	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  raycaster.setFromCamera( mouse, camera );
  // calculate objects intersecting the picking ray
  const shapeGroup = scene.getObjectByName( "shape" );
  const xChartGroup = scene.getObjectByName( "x-chart" );
  const yChartGroup = scene.getObjectByName( "y-chart" );

  const allChildren = shapeGroup.children.concat(xChartGroup.children).concat(yChartGroup.children);

  var intersects = raycaster.intersectObjects( allChildren );

  for ( var i = 0; i < intersects.length; i++ ) {
    intersects[ i ].object.material.color.set( 0xff0000 );

  }
}

// Event listeners
window.addEventListener( 'mousedown', onMouseClick );