import { BrowserApiPlugin } from '@snowplow/browser-core';
import { Core } from '@snowplow/tracker-core';
import { determine } from 'jstimezonedetect';

export const TimezonePlugin = (): BrowserApiPlugin<{}> => {
  return {
    initialise: (core: Core) => {
      core.setTimezone(determine(typeof Intl !== 'undefined').name());
    },
    apiMethods: {},
  };
};
