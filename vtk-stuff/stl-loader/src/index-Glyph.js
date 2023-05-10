import '@kitware/vtk.js/favicon';
// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import '@kitware/vtk.js/Rendering/Profiles/Geometry';
import '@kitware/vtk.js/Rendering/Profiles/Glyph'; // vtkGlyph3DMapper
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkCalculator from '@kitware/vtk.js/Filters/General/Calculator';
import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkPlaneSource from '@kitware/vtk.js/Filters/Sources/PlaneSource';
import vtkConeSource from '@kitware/vtk.js/Filters/Sources/ConeSource';
import vtkGlyph3DMapper from '@kitware/vtk.js/Rendering/Core/Glyph3DMapper';
import { AttributeTypes } from '@kitware/vtk.js/Common/DataModel/DataSetAttributes/Constants';
import { FieldDataTypes } from '@kitware/vtk.js/Common/DataModel/DataSet/Constants';
import controlPanel from './controller-Glyph.html';
import vtkScalarBarActor from '@kitware/vtk.js/Rendering/Core/ScalarBarActor';


// ----------------------------------------------------------------------------
// Setting up the render window
// ----------------------------------------------------------------------------

const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
  background: [0, 0, 0],
});
const renderer = fullScreenRenderer.getRenderer();
const renderWindow = fullScreenRenderer.getRenderWindow();

// ----------------------------------------------------------------------------
// Initiating the formula calculations
// ----------------------------------------------------------------------------

const planeSource = vtkPlaneSource.newInstance();
const simpleFilter = vtkCalculator.newInstance();
const mapper = vtkGlyph3DMapper.newInstance();
const actor = vtkActor.newInstance();



simpleFilter.setFormula({
  getArrays: (inputDataSets) => ({
    input: [{ location: FieldDataTypes.COORDINATE }], // Require point coordinates as input
    output: [
      // Generate two output arrays:
      {
        location: FieldDataTypes.POINT, // This array will be point-data ...
        name: 'pressure', // ... with the given name ...
        dataType: 'Float64Array', // ... of this type ...
        numberOfComponents: 3, // ... with this many components ...
      },
      {
        location: FieldDataTypes.POINT, // This array will be field data ...
        name: 'temperature', // ... with the given name ...
        dataType: 'Float64Array', // ... of this type ...
        attribute: AttributeTypes.SCALARS, // ... and will be marked as the default scalars.
        numberOfComponents: 1, // ... with this many components ...
      },
    ],
  }),
  evaluate: (arraysIn, arraysOut) => {
    // Convert in the input arrays of vtkDataArrays into variables
    // referencing the underlying JavaScript typed-data arrays:
    const [coords] = arraysIn.map((d) => d.getData());
    const [press, temp] = arraysOut.map((d) => d.getData());

    // Since we are passed coords as a 3-component array,
    // loop over all the points and compute the point-data output:
    for (let i = 0, sz = coords.length / 3; i < sz; ++i) {
      press[i * 3] = (coords[3 * i] - 0.5) * (coords[3 * i] - 0.5);
      press[i * 3 + 1] =
        ((coords[3 * i + 1] - 0.5) * (coords[3 * i + 1] - 0.5) + 0.125) * 0.1;
      press[i * 3 + 2] =
        ((coords[3 * i] - 0.5) * (coords[3 * i] - 0.5) +
          (coords[3 * i + 1] - 0.5) * (coords[3 * i + 1] - 0.5) +
          0.125) *
        0.1;
      temp[i] = coords[3 * i + 1] * 0.1;
    }

    // Mark the output vtkDataArray as modified
    arraysOut.forEach((x) => x.modified());
  },
});

// The generated 'temperature' array will become the default scalars, so the plane mapper will color by 'temperature':
simpleFilter.setInputConnection(planeSource.getOutputPort());

mapper.setInputConnection(simpleFilter.getOutputPort(), 0);

const coneSource = vtkConeSource.newInstance();
coneSource.setResolution(20);
mapper.setInputConnection(coneSource.getOutputPort(), 1);
mapper.setOrientationArray('pressure');
mapper.setScalarRange(0.0, 0.1);

actor.setMapper(mapper);

renderer.addActor(actor);
renderer.resetCamera();
renderWindow.render();

// ----------------------------------------------------------------------------
// Initiating the Scalar Bar (legend)
// ----------------------------------------------------------------------------
let lut = mapper.getLookupTable()
const scalarBarActor = vtkScalarBarActor.newInstance();
renderer.addActor(scalarBarActor);
scalarBarActor.setScalarsToColors(lut);



//function to handle scalar range
function updateScalarRange() {
  const min = Number(document.querySelector('.min').value);
  const max = Number(document.querySelector('.max').value);
  if (!Number.isNaN(min) && !Number.isNaN(max)) {
    mapper.setScalarRange(min, max);
    renderWindow.render();
  }
}

// -----------------------------------------------------------
// UI control handling
// -----------------------------------------------------------

fullScreenRenderer.addController(controlPanel);

['xResolution', 'yResolution'].forEach((propertyName) => {
  document.querySelector(`.${propertyName}`).addEventListener('input', (e) => {
    const value = Number(e.target.value);
    planeSource.set({ [propertyName]: value });
    renderWindow.render();
  });
});

['min', 'max'].forEach((selector) => {
  document.querySelector(`.${selector}`)
    .addEventListener('input', updateScalarRange);
    renderWindow.render();
});

const inputElement = document.getElementById("myFile");
inputElement.addEventListener("change", handleFiles, false);
function handleFiles() {
  const fileList = this.files; /* now you can work with the file list */
  alert(myFile.value + "file has been uploaded");
}

// -------------------------------------
// Color Scalar Bar helper functions
// -------------------------------------
// function generateTicks(numberOfTicks) {
//   return (helper) => {
//     const lastTickBounds = helper.getLastTickBounds();
//     // compute tick marks for axes
//     const scale = d3
//       .scaleLinear()
//       .domain([0.0, 1.0])
//       .range([lastTickBounds[0], lastTickBounds[1]]);
//     const samples = scale.ticks(numberOfTicks);
//     const ticks = samples.map((tick) => scale(tick));
//     // Replace minus "\u2212" with hyphen-minus "\u002D" so that parseFloat() works
//     formatDefaultLocale({ minus: '\u002D' });
//     const format = scale.tickFormat(
//       ticks[0],
//       ticks[ticks.length - 1],
//       numberOfTicks
//     );
//     const tickStrings = ticks
//       .map(format)
//       .map((tick) => Number(parseFloat(tick).toPrecision(12)).toPrecision()); // d3 sometimes adds unwanted whitespace
//     helper.setTicks(ticks);
//     helper.setTickStrings(tickStrings);
//   };
// }
// scalarBarActor.setGenerateTicks(generateTicks(10));

const minInput = document.querySelector('.min');
const onMinChanged = () => {
  lut.setRange(parseFloat(minInput.value), lut.getRange()[1]);
  renderWindow.render();
};
minInput.addEventListener('input', onMinChanged);
onMinChanged();

const maxInput = document.querySelector('.max');
const onMaxChanged = () => {
  lut.setRange(lut.getRange()[0], parseFloat(maxInput.value));
  renderWindow.render();
};
maxInput.addEventListener('input', onMaxChanged);
onMaxChanged();

document.querySelector('#axisLabel').addEventListener('change', (event) => {
  scalarBarActor.setAxisLabel(event.target.value);
  renderWindow.render();
});
document
  .querySelector('#numberOfColors')
  .addEventListener('change', (event) => {
    if (lut.isA('vtkLookupTable')) {
      lut.setNumberOfColors(parseInt(event.target.value, 10));
      lut.modified();
      lut.build();
    } else {
      lut.setNumberOfValues(parseInt(event.target.value, 10));
    }
    lut.modified();
    scalarBarActor.setScalarsToColors(lut);
    scalarBarActor.modified();
    renderWindow.render();
  });
// -----------------------------------------------------------
// Make some variables global so that you can inspect and
// modify objects in your browser's developer console:
// -----------------------------------------------------------

global.planeSource = planeSource;
global.mapper = mapper;
global.actor = actor;
global.renderer = renderer;
global.renderWindow = renderWindow;
global.simpleFilter = simpleFilter;
global.fileList = fileList;