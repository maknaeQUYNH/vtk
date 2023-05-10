import "@kitware/vtk.js/favicon";
// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import "@kitware/vtk.js/Rendering/Profiles/Geometry";

import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkConeSource from "@kitware/vtk.js/Filters/Sources/ConeSource";
import vtkSphereSource from "@kitware/vtk.js/Filters/Sources/SphereSource";
import vtkCubeSource from "@kitware/vtk.js/Filters/Sources/CubeSource";
import vtkRenderer from "@kitware/vtk.js/Rendering/Core/Renderer";
import vtkOpenGLRenderWindow from "@kitware/vtk.js/Rendering/OpenGL/RenderWindow";
import vtkRenderWindow from "@kitware/vtk.js/Rendering/Core/RenderWindow";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import vtkSTLReader from "@kitware/vtk.js/IO/Geometry/STLReader";
import vtkInteractorStyleTrackballCamera from "@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera";
import vtkRenderWindowInteractor from "@kitware/vtk.js/Rendering/Core/RenderWindowInteractor";

//chosen shape
var shapeChoice;
//given shape sizes
let shapeSize = 1;
let radius = 1;

//position of clicked region for shape generation
var Position = null;

//container for the render window containers
const myContainer = document.querySelector("body");
//create another container for shape builder render window
const shapeContainer = document.createElement("div");
//create container for stlLoader render window
const rootContainer = document.createElement("div");

rootContainer.style.position = "relative";
rootContainer.style.width = "500px";
rootContainer.style.height = "500px";

shapeContainer.style.position = "relative";
shapeContainer.style.width = "500px";
shapeContainer.style.height = "500px";
myContainer.appendChild(shapeContainer);
myContainer.appendChild(rootContainer);
myContainer.style.margin = "0";
const fileContainer = document.createElement("div");
fileContainer.innerHTML = '<input type="file" class="file"/>';

myContainer.appendChild(fileContainer);

const fileInput = fileContainer.querySelector("input");

//Rendering pipeline for stl reader
const reader = vtkSTLReader.newInstance();
const mapper = vtkMapper.newInstance({ scalarVisibility: false });
const actor = vtkActor.newInstance();

const renderWindow = vtkRenderWindow.newInstance();
const renderer = vtkRenderer.newInstance({ background: [0.2, 0.3, 0.4] });
const openGLRenderWindow = vtkOpenGLRenderWindow.newInstance();

renderWindow.addRenderer(renderer);
actor.setMapper(mapper);
mapper.setInputConnection(reader.getOutputPort());

//rendering pipeline for the shape mode
const shapemapper = vtkMapper.newInstance({ scalarVisibility: false });
const shaperenderWindow = vtkRenderWindow.newInstance();
const shaperenderer = vtkRenderer.newInstance({ background: [0.2, 0.3, 0.4] });
const shapeopenGLRenderWindow = vtkOpenGLRenderWindow.newInstance();
shaperenderWindow.addView(shapeopenGLRenderWindow);
shapeopenGLRenderWindow.setContainer(shapeContainer);
shapeopenGLRenderWindow.setSize(500, 500);
shaperenderWindow.addRenderer(shaperenderer);
const shapeinteractor = vtkRenderWindowInteractor.newInstance();
shapeinteractor.setView(shapeopenGLRenderWindow);
shapeinteractor.initialize();
shapeinteractor.bindEvents(shapeContainer);
shapeinteractor.setInteractorStyle(
  vtkInteractorStyleTrackballCamera.newInstance()
);

// ----------------------------------------------------------------------------

//create a rendering window when an stl file is given
function update() {
  const resetCamera = renderer.resetCamera;
  const render = renderWindow.render;

  renderer.addActor(actor);
  resetCamera();

  renderWindow.addView(openGLRenderWindow);
  openGLRenderWindow.setContainer(rootContainer);
  const { width, height } = rootContainer.getBoundingClientRect();
  openGLRenderWindow.setSize(width, height);
  const interactor = vtkRenderWindowInteractor.newInstance();
  interactor.setView(openGLRenderWindow);
  interactor.initialize();
  interactor.bindEvents(rootContainer);
  interactor.setInteractorStyle(
    vtkInteractorStyleTrackballCamera.newInstance()
  );
}



function selectShape() {
  var mylist = document.getElementById("shapeChoice");
  shapeChoice = mylist.options[mylist.selectedIndex].text;
}

function setRadius(){
  var shapeRadiusInput = document.getElementById("shapeRadius");
  radius = shapeRadiusInput.value;
}

function setSize(){
  var shapeSizeInput = document.getElementById("shapeSize");
  shapeSize = shapeSizeInput.value;
}
const shapeList = document.getElementById("shapeChoice");
const shapeSizeInput = document.getElementById("shapeSize");
const shapeRadiusInput = document.getElementById("shapeRadius")

//create a new cone at given position with set height and radius
function createCone(pos) {
  const cone = vtkConeSource.newInstance({
    height: shapeSize,
    radius: radius,
  });

  cone.setCenter(pos.worldPosition);

  const shapeactor = vtkActor.newInstance();
  shapemapper.setInputConnection(cone.getOutputPort());
  shapeactor.setMapper(shapemapper);
  shaperenderer.addActor(shapeactor);
  shaperenderer.resetCamera();
  shaperenderWindow.render();
}
function createSphere(pos) {
  const sphere = vtkSphereSource.newInstance({
    radius: radius,
  });

  sphere.setCenter(pos.worldPosition);

  const shapeactor = vtkActor.newInstance();
  shapemapper.setInputConnection(sphere.getOutputPort());
  shapeactor.setMapper(shapemapper);
  shaperenderer.addActor(shapeactor);
  shaperenderer.resetCamera();
  shaperenderWindow.render();
}
function createCube(pos) {
  const cube = vtkCubeSource.newInstance();

  cube.setCenter(pos.worldPosition);

  const shapeactor = vtkActor.newInstance();
  shapemapper.setInputConnection(cube.getOutputPort());
  shapeactor.setMapper(shapemapper);
  shaperenderer.addActor(shapeactor);
  shaperenderer.resetCamera();
  shaperenderWindow.render();
}

// ----------------------------------------------------------------------------
// Use a file reader to load a local file
// ----------------------------------------------------------------------------

function handleFile(event) {
  event.preventDefault();
  const dataTransfer = event.dataTransfer;
  const files = event.target.files || dataTransfer.files;
  if (files.length === 1) {
    const file = files[0];
    if (file.name.toLowerCase().endsWith(".stl")) {
      // only proceed if file extension is .stl
      //myContainer.removeChild(fileContainer);
      const fileReader = new FileReader();
      fileReader.onload = function onLoad(e) {
        reader.parseAsArrayBuffer(fileReader.result);
        update();
      };
      fileReader.readAsArrayBuffer(file);
    } else {
      alert("Please submit a stl file");
      return;
    }
  }
}

//convert clicked area into world coordinates
function handlePicking(xp, yp, tolerance) {
  const x1 = Math.floor(xp - tolerance);
  const y1 = Math.floor(yp - tolerance);
  const x2 = Math.ceil(xp + tolerance);
  const y2 = Math.ceil(yp + tolerance);

  const startPoint = shapeopenGLRenderWindow.displayToWorld(
    Math.round((x1 + x2) / 2),
    Math.round((y1 + y2) / 2),
    0,
    shaperenderer
  );

  const endPoint = shapeopenGLRenderWindow.displayToWorld(
    Math.round((x1 + x2) / 2),
    Math.round((y1 + y2) / 2),
    1,
    shaperenderer
  );

  const ray = [Array.from(startPoint), Array.from(endPoint)];

  const worldPosition = Array.from(
    shapeopenGLRenderWindow.displayToWorld(xp, yp, 1000, shaperenderer)
  );

  const selection = [];
  selection[0] = {
    worldPosition,
    ray,
  };
  return selection;
}

//Gets locations of clicked region
function getScreenEventPositionFor(source) {
  const bounds = shapeContainer.getBoundingClientRect();
  const [canvasWidth, canvasHeight] = shapeopenGLRenderWindow.getSize();
  const scaleX = canvasWidth / bounds.width;
  const scaleY = canvasHeight / bounds.height;
  const position = {
    x: scaleX * (source.clientX - bounds.left),
    y: scaleY * (bounds.height - source.clientY + bounds.top),
    z: 0,
  };
  return position;
}

//finds location of click and creates a chosen shape at that area
function onMouseDown(e) {
  if (e !== undefined) {
    const sc = getScreenEventPositionFor(e);
    const e1 = handlePicking(sc.x, sc.y, 10);
    if (e1.length === 0) {
      console.warn("e1 null", e1);
      return;
    }
    Position = e1[0];
    if (shapeChoice != null) {
      switch (shapeChoice) {
        case "cone":
          createCone(Position);
          break;
        case "sphere":
          createSphere(Position);
          break;
        case "cube":
          createCube(Position);
          break;
      }
    }
    shaperenderWindow.render();
  }
}

shapeContainer.addEventListener("mousedown", onMouseDown);

shapeSizeInput.addEventListener("change", setSize);

fileInput.addEventListener("change", handleFile);

shapeRadiusInput.addEventListener("change", setRadius);
shapeList.addEventListener("change", selectShape);

// ----------------------------------------------------------------------------
// Use the reader to download a file
// ----------------------------------------------------------------------------

// reader.setUrl(`${__BASE_PATH__}/data/stl/segmentation.stl`, { binary: true }).then(update);
