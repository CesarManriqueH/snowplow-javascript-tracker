/*
 * JavaScript tracker for Snowplow: features.ts
 *
 * Significant portions copyright 2010 Anthon Pang. Remainder copyright
 * 2012-2020 Snowplow Analytics Ltd. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 * * Redistributions of source code must retain the above copyright
 *   notice, this list of conditions and the following disclaimer.
 *
 * * Redistributions in binary form must reproduce the above copyright
 *   notice, this list of conditions and the following disclaimer in the
 *   documentation and/or other materials provided with the distribution.
 *
 * * Neither the name of Anthon Pang nor Snowplow Analytics Ltd nor the
 *   names of their contributors may be used to endorse or promote products
 *   derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { determine } from 'jstimezonedetect';
import { Core } from '@snowplow/tracker-core';
import isUndefined from 'lodash/isUndefined';
import { isFunction } from '@snowplow/browser-core';

declare global {
  interface MimeTypeArray {
    [index: string]: MimeType;
  }
}

const windowAlias = window,
  navigatorAlias = navigator;

/*
 * Returns visitor timezone
 */
export function DetectTimezone() {
  return (core: Core) => {
    core.setTimezone(determine(typeof Intl !== 'undefined').name());
  };
}

/*
 * Detect features that are available in this browser
 */
export function DetectBrowserFeatures() {
  return (core: Core) => {
    let mimeType,
      pluginMap: Record<string, string> = {
        // document types
        pdf: 'application/pdf',

        // media players
        qt: 'video/quicktime',
        realp: 'audio/x-pn-realaudio-plugin',
        wma: 'application/x-mplayer2',

        // interactive multimedia
        dir: 'application/x-director',
        fla: 'application/x-shockwave-flash',

        // RIA
        java: 'application/x-java-vm',
        gears: 'application/x-googlegears',
        ag: 'application/x-silverlight',
      };

    // General plugin detection
    if (navigatorAlias.mimeTypes && navigatorAlias.mimeTypes.length) {
      for (const i in pluginMap) {
        if (Object.prototype.hasOwnProperty.call(pluginMap, i)) {
          mimeType = navigatorAlias.mimeTypes[pluginMap[i]];
          core.addPayloadPair('f_' + i, mimeType && mimeType.enabledPlugin ? '1' : '0');
        }
      }
    }

    // Safari and Opera
    // IE6/IE7 navigator.javaEnabled can't be aliased, so test directly
    if (
      navigatorAlias.constructor === window.Navigator &&
      !isUndefined(navigatorAlias.javaEnabled) &&
      navigatorAlias.javaEnabled()
    ) {
      core.addPayloadPair('f_java', '1');
    }

    // Firefox
    if (isFunction((windowAlias as any).GearsFactory)) {
      core.addPayloadPair('f_gears', '1');
    }
  };
}
