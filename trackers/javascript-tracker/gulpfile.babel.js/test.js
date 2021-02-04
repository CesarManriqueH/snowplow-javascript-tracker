import { rollup } from 'rollup';
import { core } from './rollup';
import Docker from 'dockerode';

// export const buildTestDetectors = async function () {
//   const detectors = await rollup({
//     input: 'test/scripts/detectors.js',
//     plugins: core,
//   });
//   return await detectors.write({
//     name: 'detectors',
//     file: 'test/pages/detectors.js',
//     format: 'iife',
//   });
// };

// export const buildTestHelpers = async function () {
//   const helpers = await rollup({
//     input: 'test/scripts/helpers.js',
//     plugins: core,
//   });
//   return await helpers.write({
//     name: 'helpers',
//     file: 'test/pages/helpers.js',
//     format: 'iife',
//   });
// };

export const buildTestSnowplow = async function () {
  const snowplow = await rollup({
    input: './src/index.ts',
    plugins: core,
    treeshake: { moduleSideEffects: ['jstimezonedetect'] },
  });

  return await snowplow.write({
    file: './test/pages/snowplow.js',
    format: 'iife',
  });
};

export const pullSnowplowMicro = async function () {
  return new Docker().pull('snowplow/snowplow-micro:1.1.0');
};
