'use strict';

const GerritFButton = require('../../gerrit-f-button');
const jQuery = require('jquery');
const jsdom = require('jsdom');
const assert = require('chai').assert;
const UI = GerritFButton.UI;
const TreeView = GerritFButton.TreeView;

describe('UI', function() {
  let dom, window, document, $, container;

  beforeEach(function() {
    dom = jsdom.jsdom();
    window = dom.defaultView;
    document = window.document;
    $ = jQuery(window);
    container = document.body.appendChild( document.createElement('div') );
  });

  afterEach(function() {
    window.close();

    $ = null;
    document = null;
    window = null;
    dom = null;
  });

  describe('TreeView', function() {
    it('should group files by their paths', function() {
      var tree = TreeView([
        { filePath: '/lib/foo/a.js' },
        { filePath: '/lib/foo/b.js' },
        { filePath: '/lib/bar.js' },
      ]);

      assert.include(Object.keys(tree.children), 'lib');
      assert.include(Object.keys(tree.children.lib.children), 'foo');
      assert.include(tree.children.lib.children.foo.items[0], { filePath: '/lib/foo/a.js' });
      assert.include(tree.children.lib.children.foo.items[1], { filePath: '/lib/foo/b.js' });
    });
  });

  it('should work', function() {
    const subject = UI($);
    const $subject = $(subject.node);

    subject.toggle(container);
    subject.setProps({
      commentedOnly: false,
      files: [{ filePath: '/lib/foo.js' }]
    });

    assert.equal($subject.find('li.f-button-file').length, 1);
  });

  it('should group files based on path', function() {
    const subject = UI($);
    const $subject = $(subject.node);

    subject.toggle(container);
    subject.setProps({
      commentedOnly: false,
      files: [
        { filePath: '/lib/foo.js' },
        { filePath: '/lib/bar.js' },
      ]
    });

    assert.equal($subject.find('.f-button-file__folder-header').length, 1);
    assert.equal($subject.find('.f-button-file').length, 2);
  });

  it('should use the file name instead of file path as a label', function() {
    const subject = UI($);
    const $subject = $(subject.node);

    subject.toggle(container);
    subject.setProps({
      commentedOnly: false,
      files: [
        { filePath: '/lib/foo.js' },
        { filePath: '/lib/bar.js' },
      ]
    });

    assert.equal($subject.find('.f-button-file').length, 2);
    assert.equal($subject.find('.f-button-file').eq(0).text(), 'foo.js');
    assert.equal($subject.find('.f-button-file').eq(1).text(), 'bar.js');
  });
});