/*
 * JavaScript tracker for Snowplow: tests/functional/detectors.spec.js
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
import { trackerCore } from '@snowplow/tracker-core';
import { JSDOM } from 'jsdom';
// import F from 'lodash/fp';
import { tz } from 'moment-timezone';
import {
  DetectBrowserFeatures,
  DetectCookie,
  DetectDocument,
  DetectScreen,
  DetectTimezone,
  DetectWindow,
} from '../src/index';

declare var jsdom: JSDOM;

describe('Detectors', () => {
  beforeAll(() => {
    Object.defineProperty(jsdom.window.HTMLHtmlElement.prototype, 'clientWidth', { value: 1024 });
    Object.defineProperty(jsdom.window.HTMLHtmlElement.prototype, 'clientHeight', { value: 768 });
    Object.defineProperty(jsdom.window.screen, 'width', { value: 1024 });
    Object.defineProperty(jsdom.window.screen, 'height', { value: 768 });
    Object.defineProperty(jsdom.window.navigator, 'mimeTypes', {
      value: {
        'application/pdf': { enabledPlugin: true },
        length: 1,
      },
    });
  });

  it('Return a value for document and viewport dimensions', (done) => {
    const core = trackerCore(false, (payloadBuilder) => {
      DetectWindow()(payloadBuilder);
      const payload = payloadBuilder.build();

      const [reportedDocumentWidth, reportedDocumentHeight] = (payload['ds'] as string).split('x');
      expect(+reportedDocumentWidth).toBeGreaterThan(1);
      expect(+reportedDocumentHeight).toBeGreaterThan(1);

      const [reportedViewportWidth, reportedViewportHeight] = (payload['vp'] as string).split('x');
      expect(+reportedViewportWidth).toBe(1024);
      expect(+reportedViewportHeight).toBe(768);
      done();
    });
    core.trackLinkClick('https://example.com');
  });

  it('Return a value for language and charset', (done) => {
    const core = trackerCore(false, (payloadBuilder) => {
      const payload = payloadBuilder.build();
      expect(payload['cs']).toBe('UTF-8');
      expect(payload['lang']).toBe('en-US');
      done();
    });
    DetectDocument()(core);
    core.trackLinkClick('https://example.com');
  });

  it('Return a value for whether cookies are enabled', (done) => {
    const core = trackerCore(false, (payloadBuilder) => {
      const payload = payloadBuilder.build();
      expect(payload['cookie']).toBe('1');
      done();
    });
    DetectCookie()(core);
    core.trackLinkClick('https://example.com');
  });

  it('Return a value for screen resolution and colour depth', (done) => {
    const core = trackerCore(false, (payloadBuilder) => {
      const payload = payloadBuilder.build();
      const [reportedWidth, reportedHeight] = (payload['res'] as string).split('x');
      expect(+reportedWidth).toBe(1024);
      expect(+reportedHeight).toBe(768);
      expect(payload['cd']).toBe(24);
      done();
    });
    DetectScreen()(core);
    core.trackLinkClick('https://example.com');
  });

  it('Return a value for the current timezone', (done) => {
    const core = trackerCore(false, (payloadBuilder) => {
      const payload = payloadBuilder.build();
      expect(tz.names().includes(payload['tz'] as string)).toBeTruthy();
      done();
    });
    DetectTimezone()(core);
    core.trackLinkClick('https://example.com');
  });

  it('Return values for available mimeTypes', (done) => {
    const core = trackerCore(false, (payloadBuilder) => {
      const payload = payloadBuilder.build();
      expect(payload['f_pdf']).toBe('1');
      expect(payload['f_ag']).toBe('0');
      done();
    });
    DetectBrowserFeatures()(core);
    core.trackLinkClick('https://example.com');
  });
});
