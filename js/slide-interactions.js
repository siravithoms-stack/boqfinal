import { PRESENTATION_CONFIG } from './presentation-config.js';

// Each factory implements the same small contract: reset() and destroy().
// Aliases share one descriptor so canvas/reset identifiers cannot drift apart.
export const SLIDE_SCENES = Object.freeze([
  { types: ['3d-warehouse'], factory: 'initCompletedWarehouse3D', canvas: 'canvasWarehouse3D', reset: 'resetWarehouseBtn' },
  { types: ['3d-pile', '3d-foundation'], factory: 'initPileDriving3D', canvas: 'canvasPile3D', reset: 'resetPileBtn' },
  { types: ['3d-steel', '3d-cellular'], factory: 'initCellularBeam3D', canvas: 'canvasBeam3D', reset: 'resetBeamBtn' },
  { types: ['3d-floor'], factory: 'initFloorStratigraphy3D', canvas: 'canvasFloor3D', reset: 'resetFloorBtn' },
  { types: ['3d-roof'], factory: 'initRoofCladding3D', canvas: 'canvasRoof3D', reset: 'resetRoofBtn' },
  { types: ['3d-mep-road', '3d-road'], factory: 'initInfrastructureRoad3D', canvas: 'canvasMep3D', reset: 'resetMepBtn' },
  { types: ['3d-qaqc', '3d-quality'], factory: 'initQualityLab3D', canvas: 'canvasQaqc3D', reset: 'resetQaqcBtn' },
  { types: ['3d-hse', '3d-safety'], factory: 'initSafetySite3D', canvas: 'canvasHse3D', reset: 'resetHseBtn' }
].map(descriptor => Object.freeze({ ...descriptor, types: Object.freeze(descriptor.types) })));

export function initialiseSlideInteraction(slide, services) {
  const { document: dom, factories, renderSCurve, renderCashFlow, beep } = services;
  const descriptor = SLIDE_SCENES.find(entry => entry.types.includes(slide.type));
  let controller = null;
  if (descriptor) {
    controller = factories[descriptor.factory](descriptor.canvas);
    const reset = dom.getElementById(descriptor.reset);
    if (reset && controller) reset.onclick = () => controller.reset();
  }
  if (slide.type === 'interactive-scurve') {
    const slider = dom.getElementById('scurveSlider');
    const monthLabel = dom.getElementById('sliderMonthLabel');
    const render = index => {
      renderSCurve('scurveChartContainer', slide.content.milestones, index);
      if (monthLabel) monthLabel.textContent = slide.content.milestones[index].month + ` (${slide.content.milestones[index].cum}%)`;
    };
    render(PRESENTATION_CONFIG.defaultMonthIndex);
    if (slider) slider.oninput = event => {
      const index = parseInt(event.target.value);
      render(index);
      beep(PRESENTATION_CONFIG.sliderBeepBaseHz + index * PRESENTATION_CONFIG.sliderBeepStepHz, PRESENTATION_CONFIG.sliderBeepSeconds);
    };
  } else if (slide.type === 'cashflow-chart') {
    renderCashFlow('cashFlowChartContainer', slide.content.chartData);
  }
  return controller;
}
