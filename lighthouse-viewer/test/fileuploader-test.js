/**
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

/* eslint-env mocha */

const assert = require('assert');

const testHelpers = require('./test-helpers'); // before other src imports.
const FileUploader = require('../app/src/fileuploader');
const logger = require('../app/src/logger');

function assertUIReset(uploader) {
  assert.ok(!logger.el.classList.contains('show'));
  assert.ok(!uploader.dropZone.classList.contains('dropping'));
  assert.ok(!uploader._dragging);
}

describe('Viewer', () => {
  beforeEach(function() {
    // Reconstruct page on every test so event listeners are clean.
    testHelpers.setupGlobals();
  });

  it('constructor', () => {
    const uploader = new FileUploader();

    assert.ok(uploader.dropZone, 'page has dropzone element');
    assert.ok(uploader.placeholder, 'page has placeholder element');
    assert.ok(!uploader._dragging, 'dragging is initially false');

    const pageInput = document.querySelector('input#hidden-file-input[type="file"]');
    assert.deepEqual(uploader.fileInput, pageInput, 'constructor added hidden file input to page');
  });

  it('hidden file input responds to change events', (done) => {
    const uploader = new FileUploader(_ => {
      assert.ok(true, 'file change callback is called');
      done();
    });
    uploader.fileInput.dispatchEvent(new window.CustomEvent('change'));
  });

  it('document responds to drag and drop events', () => {
    // TODO: test drop event on document. Callback is not getting called
    // because jsdom doesn't support clipboard API: https://github.com/tmpvar/jsdom/issues/1568/.
    const uploader = new FileUploader(_ => {
      // assert.ok(true, 'file change callback is called');
      // done();
    });

    document.dispatchEvent(new window.CustomEvent('mouseleave'));
    assertUIReset(uploader);

    document.dispatchEvent(new window.CustomEvent('dragenter'));
    assert.ok(uploader.dropZone.classList.contains('dropping'));
    assert.ok(uploader._dragging);

    document.dispatchEvent(new window.CustomEvent('drop'));
  });

  it('_resetDraggingUI()', () => {
    const uploader = new FileUploader();
    uploader._resetDraggingUI();
    assertUIReset(uploader);
  });

  it('removeDropzonePlaceholder()', () => {
    const uploader = new FileUploader();
    uploader.removeDropzonePlaceholder();
    assert.ok(!document.querySelector('.viewer-placeholder'), 'placeholder is removed');
  });

  it('readFile()', () => {
    const content = '{val: "file content"}';
    const file = new window.Blob([content], {type: 'application/json'});
    return FileUploader.readFile(file).then(str => {
      assert.equal(content, str, 'file read');
    });
  });
});
