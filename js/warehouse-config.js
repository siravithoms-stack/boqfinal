/** Metres, seconds and radians. Values preserve the tested original behaviour. */
export const WAREHOUSE_MOVEMENT = Object.freeze({
  normal: 1.8, fast: 3.6, radius: 0.32, sweptStep: 0.16,
  limitX: 46, limitZ: 91, maxDeltaSeconds: 0.05, acceleration: 14,
  eyeHeight: 1.65, spawnZ: -83, maximumPitch: 1.55,
  pointerSensitivity: 0.0035, arrowTapRadians: 0.045, arrowRadiansPerSecond: 1.5
});
export const WAREHOUSE_RENDER = Object.freeze({
  maxPixelRatio: 2, maxPixels: 16000000, framesPerSecond: 60,
  mapIntervalSeconds: 0.12, qualityWindowSeconds: 3, minimumSamples: 30,
  maximumFrameSeconds: 0.25, slowFrameSeconds: 0.038,
  minimumPixelRatio: 0.7, qualityStep: 0.2, shadowMapSize: 2048
});
