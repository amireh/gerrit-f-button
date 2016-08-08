// ==UserScript==
// @name        Gerrit F Button
// @namespace   ahmad@amireh.net
// @include     https://gerrit.instructure.com/*
// @version     2
// @grant       none
// @grant       GM_setClipboard
// @run-at      document.end
// ==/UserScript==

/* gerrit-f-button.js v2.1.2 */

(function () {
	'use strict';

	// Utils
	function TreeView(fileList) {
	  var tree = {
	    items: [],
	    children: {}
	  };

	  function getBranch(path) {
	    var fragments = path.split('/').filter(function(x) { return x.length > 0; });
	    var branch = tree;

	    fragments.forEach(function(fragment) {
	      if (!branch.children[fragment]) {
	        branch.children[fragment] = { items: [], children: {} };
	      }

	      branch = branch.children[fragment];
	    });

	    return branch;
	  }

	  fileList.forEach(function(file) {
	    getBranch(file.filePath.split('/').slice(0, -1).join('/')).items.push(file);
	  });

	  return tree;
	}

	function classSet(classNames) {
	  return Object.keys(classNames).reduce(function(className, key) {
	    return !!classNames[key] ? (className + ' ' + key) : className;
	  }, '');
	}

	function injectCSS(string) {
	  var styleNode = document.createElement('style');

	  styleNode.innerHTML = string;

	  document.head.appendChild(styleNode);
	}

	function discardLeadingSlash(s) {
	  return s.replace(/^\//, '');
	}

	function copyToClipboard(string) {
	  // GreaseMonkey sandbox:
	  if (typeof GM_setClipboard !== 'undefined') {
	    GM_setClipboard(string);
	  }
	}

	var Styles = function() {/*
	  @font-face {
	    font-family: 'gerrit-f-button';
	    src:
	      url(data:application/font-woff;charset=utf-8;base64,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) format('woff'),
	      url(data:application/x-font-ttf;charset=utf-8;base64,AAEAAAALAIAAAwAwT1MvMg8SBpIAAAC8AAAAYGNtYXDqJOpPAAABHAAAAFxnYXNwAAAAEAAAAXgAAAAIZ2x5ZppGirMAAAGAAAABoGhlYWQKmABpAAADIAAAADZoaGVhB8EDyAAAA1gAAAAkaG10eBIAAEIAAAN8AAAAHGxvY2EAyAFUAAADmAAAABBtYXhwAAsAOgAAA6gAAAAgbmFtZYv5+kUAAAPIAAAB5nBvc3QAAwAAAAAFsAAAACAAAwOAAZAABQAAApkCzAAAAI8CmQLMAAAB6wAzAQkAAAAAAAAAAAAAAAAAAAABEAAAAAAAAAAAAAAAAAAAAABAAADp6APA/8AAQAPAAEAAAAABAAAAAAAAAAAAAAAgAAAAAAADAAAAAwAAABwAAQADAAAAHAADAAEAAAAcAAQAQAAAAAwACAACAAQAAQAg6Z3p6P/9//8AAAAAACDpnenn//3//wAB/+MWZxYeAAMAAQAAAAAAAAAAAAAAAAABAAH//wAPAAEAAAAAAAAAAAACAAA3OQEAAAAAAQAAAAAAAAAAAAIAADc5AQAAAAABAAAAAAAAAAAAAgAANzkBAAAAAAMAQP/AA8ADwAAZACEANwAAAS4BJy4BJy4BIyEiBhURFBYzITI2NRE0JicnHgEXIzUeARMUBiMhIiY1ETQ2MzA6AjEVFBY7AQOWES0ZGjMXJykL/hAhLy8hAuAhLw4chRclDZoRKYYJB/0gBwkJB5u6mxMN4ALbFzMaGS0RHA4vIfygIS8vIQJwCyknNhcpEZoNJfzoBwkJBwNgBwngDRMAAAAAAgABAEAD/wOAAA8AGwAAASEiBhcTHgEzITI2NxM2Jic0JiMhJyMiBh0BIQPY/FAUFwR2AyIUAqAUIgN2BBdsHBT+UCDQFBwDAALAHBP93hMcHBMCIhMcUBQcQBwUUAAAAgABAEAD/wOAAA8AGwAAATIWBwMOASMhIiYnAyY2MyUVITU0NjsBFyEyFgPYFBcEdgMiFP1gFCIDdgQXEwNZ/QAcFNAgAbAUHAJAHBP+XhMcHBMBohMc0JDQFBxAHAAAAQAAAAEAALTpHUtfDzz1AAsEAAAAAADTvN32AAAAANO83fYAAP/AA/8DwAAAAAgAAgAAAAAAAAABAAADwP/AAAAEAAAAAAAD/wABAAAAAAAAAAAAAAAAAAAABwQAAAAAAAAAAAAAAAIAAAAEAABABAAAAQQAAAEAAAAAAAoAFAAeAHAAoADQAAEAAAAHADgAAwAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAOAK4AAQAAAAAAAQAPAAAAAQAAAAAAAgAHAKgAAQAAAAAAAwAPAE4AAQAAAAAABAAPAL0AAQAAAAAABQALAC0AAQAAAAAABgAPAHsAAQAAAAAACgAaAOoAAwABBAkAAQAeAA8AAwABBAkAAgAOAK8AAwABBAkAAwAeAF0AAwABBAkABAAeAMwAAwABBAkABQAWADgAAwABBAkABgAeAIoAAwABBAkACgA0AQRnZXJyaXQtZi1idXR0b24AZwBlAHIAcgBpAHQALQBmAC0AYgB1AHQAdABvAG5WZXJzaW9uIDEuMABWAGUAcgBzAGkAbwBuACAAMQAuADBnZXJyaXQtZi1idXR0b24AZwBlAHIAcgBpAHQALQBmAC0AYgB1AHQAdABvAG5nZXJyaXQtZi1idXR0b24AZwBlAHIAcgBpAHQALQBmAC0AYgB1AHQAdABvAG5SZWd1bGFyAFIAZQBnAHUAbABhAHJnZXJyaXQtZi1idXR0b24AZwBlAHIAcgBpAHQALQBmAC0AYgB1AHQAdABvAG5Gb250IGdlbmVyYXRlZCBieSBJY29Nb29uLgBGAG8AbgB0ACAAZwBlAG4AZQByAGEAdABlAGQAIABiAHkAIABJAGMAbwBNAG8AbwBuAC4AAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA) format('truetype'),
	      url(data:image/svg+xml;charset=utf-8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiID4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8bWV0YWRhdGE+R2VuZXJhdGVkIGJ5IEljb01vb248L21ldGFkYXRhPgo8ZGVmcz4KPGZvbnQgaWQ9ImdlcnJpdC1mLWJ1dHRvbiIgaG9yaXotYWR2LXg9IjEwMjQiPgo8Zm9udC1mYWNlIHVuaXRzLXBlci1lbT0iMTAyNCIgYXNjZW50PSI5NjAiIGRlc2NlbnQ9Ii02NCIgLz4KPG1pc3NpbmctZ2x5cGggaG9yaXotYWR2LXg9IjEwMjQiIC8+CjxnbHlwaCB1bmljb2RlPSImI3gyMDsiIGhvcml6LWFkdi14PSI1MTIiIGQ9IiIgLz4KPGdseXBoIHVuaWNvZGU9IiYjeGU5OWQ7IiBnbHlwaC1uYW1lPSJmaWxlIiBkPSJNOTE3LjgwNiA3MzAuOTI0Yy0yMi4yMTIgMzAuMjkyLTUzLjE3NCA2NS43LTg3LjE3OCA5OS43MDRzLTY5LjQxMiA2NC45NjQtOTkuNzA0IDg3LjE3OGMtNTEuNTc0IDM3LjgyLTc2LjU5MiA0Mi4xOTQtOTAuOTI0IDQyLjE5NGgtNDk2Yy00NC4xMTIgMC04MC0zNS44ODgtODAtODB2LTg2NGMwLTQ0LjExMiAzNS44ODgtODAgODAtODBoNzM2YzQ0LjExMiAwIDgwIDM1Ljg4OCA4MCA4MHY2MjRjMCAxNC4zMzItNC4zNzIgMzkuMzUtNDIuMTk0IDkwLjkyNHpNNzg1LjM3NCA3ODUuMzc0YzMwLjctMzAuNyA1NC44LTU4LjM5OCA3Mi41OC04MS4zNzRoLTE1My45NTR2MTUzLjk0NmMyMi45ODQtMTcuNzggNTAuNjc4LTQxLjg3OCA4MS4zNzQtNzIuNTcyek04OTYgMTZjMC04LjY3Mi03LjMyOC0xNi0xNi0xNmgtNzM2Yy04LjY3MiAwLTE2IDcuMzI4LTE2IDE2djg2NGMwIDguNjcyIDcuMzI4IDE2IDE2IDE2IDAgMCA0OTUuOTU2IDAuMDAyIDQ5NiAwdi0yMjRjMC0xNy42NzIgMTQuMzI2LTMyIDMyLTMyaDIyNHYtNjI0eiIgLz4KPGdseXBoIHVuaWNvZGU9IiYjeGU5ZTc7IiBnbHlwaC1uYW1lPSJmb2xkZXIiIGQ9Ik05ODQuNSA3MDRoLTk0NWMtMjYuNCAwLTQzLjc2NC0yMS4xOC0zOC41ODYtNDcuMDY4bDExNy42NzItNTQ1Ljg2NGM1LjE3OC0yNS44ODggMzEuMDE0LTQ3LjA2OCA1Ny40MTQtNDcuMDY4aDY3MmMyNi4zOTggMCA1Mi4yMzQgMjEuMTggNTcuNDEyIDQ3LjA2OGwxMTcuNjc0IDU0NS44NjRjNS4xNzggMjUuODg4LTEyLjE4OCA0Ny4wNjgtMzguNTg2IDQ3LjA2OHpNODk2IDc4NGMwIDI2LjUxLTIxLjQ5IDQ4LTQ4IDQ4aC00MzJsLTMyIDY0aC0yMDhjLTI2LjUxIDAtNDgtMjEuNDktNDgtNDh2LTgwaDc2OHYxNnoiIC8+CjxnbHlwaCB1bmljb2RlPSImI3hlOWU4OyIgZ2x5cGgtbmFtZT0iZm9sZGVyLS1vcGVuIiBkPSJNOTg0LjUgNTc2YzI2LjQgMCA0My43NjQtMjEuMTggMzguNTg2LTQ3LjA2OGwtMTE3LjY3Mi00MTcuODY0Yy01LjE3OC0yNS44ODgtMzEuMDE0LTQ3LjA2OC01Ny40MTQtNDcuMDY4aC02NzJjLTI2LjQgMC01Mi4yMzYgMjEuMTgtNTcuNDE0IDQ3LjA2OGwtMTE3LjY3MiA0MTcuODY0Yy01LjE3OCAyNS44ODggMTIuMTg2IDQ3LjA2OCAzOC41ODYgNDcuMDY4aDk0NXpNODk2IDc4NHYtMTQ0aC03Njh2MjA4YzAgMjYuNTEgMjEuNDkgNDggNDggNDhoMjA4bDMyLTY0aDQzMmMyNi41MSAwIDQ4LTIxLjQ5IDQ4LTQ4eiIgLz4KPC9mb250PjwvZGVmcz48L3N2Zz4=) format('svg')
	    ;
	    font-weight: normal;
	    font-style: normal;
	  }

	  [class^="f-button-icon__"],
	  [class*=" f-button-icon__"] {
	    font-family: 'gerrit-f-button' !important;
	    speak: none;
	    font-style: normal;
	    font-weight: normal;
	    font-variant: normal;
	    text-transform: none;
	    line-height: 1;

	    -webkit-font-smoothing: antialiased;
	    -moz-osx-font-smoothing: grayscale;
	  }

	  .f-button-icon__file:before {
	    content: "\e99d";
	  }
	  .f-button-icon__folder:before {
	    content: "\e9e7";
	  }
	  .f-button-icon__folder--open:before {
	    content: "\e9e8";
	  }

	  body.gerrit--with-f-button {
	    margin-left: 280px;
	  }

	  body.gerrit--with-f-button-overlay {
	    margin-left: 0;
	  }

	  .f-button__frame {
	    position: fixed;
	    top: 0;
	    right: auto;
	    bottom: 0;
	    left: 0;

	    width: 240px;
	    overflow: auto;

	    border-color: #aaa;
	    border-right-style: solid;
	    border-right-width: 1px;
	    background: white;
	    padding: 10px;

	    font-size: 0.85em;
	    line-height: 1.4;

	    z-index: 6;
	  }

	  body.gerrit--with-f-button-overlay .f-button__frame {
	    width: 50%;
	    left: 25%;
	    top: 50%;
	    border-left-width: 1px;
	    border-left-style: solid;
	    border-top-style: solid;
	    border-top-width: 1px;

	    opacity: 0.85;
	  }

	  body.gerrit--with-f-button-overlay .f-button__frame:hover {
	    opacity: 1;
	  }

	  .f-button__frame--commented-only .f-button-file:not(.f-button-file--commented) {
	    display: none;
	  }

	  .f-button__frame--list-view .f-button-file__folder {
	    padding-left: 0;
	  }

	  .f-button__frame--list-view .f-button-file__folder-header {
	    display: none;
	  }

	  .f-button__controls {
	    border-top: 1px solid #ddd;
	    margin-top: 1em;
	    padding-top: 1em;
	  }

	  .f-button__controls label {
	    display: block;
	  }

	  .f-button__controls input {
	    margin-top: 0;
	    margin-bottom: 0;
	    vertical-align: middle;
	  }

	  .f-button-file {
	    list-style: none;
	  }

	  .f-button-file:hover, .f-button-file--selected {
	    background: #fcfa96;
	  }

	  .f-button-file--active {
	    background-color: #DEF;
	  }

	  .f-button-file__icon {
	    display: inline-block;
	    width: 16px;
	    height: 16px;
	    vertical-align: middle;
	    position: absolute;
	    text-align: left;
	  }

	  .f-button-file__link {
	    display: block;
	    margin-right: 2em;
	    margin-left: 16px;
	    padding-left: 0.25em;
	    line-height: 1.6;
	    text-decoration: none;
	    word-break: break-all;
	  }

	  .f-button-file__folder {
	    list-style: none;
	    margin-left: 0;
	    padding-left: 0.5em;
	  }

	  .f-button-file__folder-header {
	    font-weight: bold;
	    margin-left: 1.5em;
	  }

	  .f-button-file__folder-header .f-button-icon__folder {
	    margin-left: -1.5em;
	  }

	  .f-button-file__folder--root {
	    padding-left: 0;
	    margin: 0;
	  }

	  .f-button-file__comment-count {
	    position: absolute;
	    right: 0;
	    max-width: 2em;
	    padding-right: 1em;
	    text-align: right;
	    font-weight: bold;
	    line-height: 1.6;
	  }

	  .f-button-file__icon.f-button-icon__file   { line-height: inherit; margin-top: 1px; }
	  .f-button-file__icon.f-button-icon__folder { margin-top: 2px; }
	*/}.toString().replace('function () {/*', '').replace('*/}', '');

	// TODO: we don't really need all of this, just expose two functions that
	// calculate the target cursor within a list given a target
	function LinkedList($, set) {
	  this.$ = $;
	  this.$set = $(set);
	  this.setCursor(0);

	  return this;
	};

	LinkedList.prototype.setCursor = function(cursor) {
	  if (cursor instanceof this.$) {
	    cursor = this.$set.index( cursor );
	  }

	  this.cursor = cursor;
	  this.$cursor = this.$(this.$set.get(this.cursor));

	  return this;
	};

	LinkedList.prototype.getNext = function(originalCursor) {
	  if (originalCursor) {
	    this.setCursor(originalCursor);
	  }

	  this.setCursor(this.canGoForward() ? this.cursor + 1 : 0);

	  return this.$cursor;
	};

	LinkedList.prototype.canGoForward = function() {
	  return this.$set.length > 1 && this.cursor !== this.$set.length - 1;
	};

	LinkedList.prototype.canGoBack = function() {
	  return this.$set.length > 1 && this.cursor !== 0;
	};

	LinkedList.prototype.getPrevious = function(originalCursor) {
	  if (originalCursor) {
	    this.setCursor(originalCursor);
	  }

	  this.setCursor(this.canGoBack() ? this.cursor - 1 : this.$set.length - 1);

	  return this.$cursor;
	};

	function GerritFButtonUI($) {
	  var HAS_SCROLL_INTO_VIEW = (
	    typeof window !== 'undefined' &&
	    typeof HTMLElement.prototype.scrollIntoViewIfNeeded === 'function'
	  );

	  var $frame = $('<div />', { 'class': 'f-button__frame' });
	  var $container;

	  return {
	    node: $frame[0],

	    state: {
	      /**
	       * @property {Boolean}
	       * Whether to list only the files that have comments.
	       */
	      commentedOnly: false,

	      /**
	       * @property {String}
	       *
	       * ID of the "selected" file so that we can highlight during keyboard
	       * navigation.
	       *
	       * Defaults to: @props.activeFile
	       */
	      selectedFile: null,
	    },

	    props: {
	      files: [],
	      activeFile: null,
	      hideInUnifiedMode: false,
	      displayAsOverlay: false,
	      displayAsTree: true,
	      onToggleHideInUnifiedMode: Function.prototype,
	      onToggleDisplayAsOverlay: Function.prototype,
	      onToggleDisplayAsTree: Function.prototype,
	    },

	    /**
	     * @public
	     */
	    mount: function(_container) {
	      $container = $(_container || document.body);

	      $container.addClass('gerrit--with-f-button');
	      $container.append($frame);

	      this.componentDidRender();
	    },

	    /**
	     * @public
	     */
	    isMounted: function() {
	      return $frame.parent().length === 1;
	    },

	    /**
	     * Show or hide the F button frame.
	     *
	     * @param {?HTMLElement} [container=document.body]
	     * @param {?Object} options
	     * @param {Boolean} options.stealFocus
	     */
	    toggle: function(container, options) {
	      if (this.isMounted()) {
	        this.unmount(container);
	      }
	      else {
	        this.mount(container);

	        if (options && options.stealFocus) {
	          this.stealFocus();
	        }
	      }
	    },

	    stealFocus: function() {
	      if (document.activeElement) {
	        document.activeElement.blur();
	      }

	      $frame.focus();
	    },

	    /**
	     * @public
	     */
	    unmount: function() {
	      $frame.detach();

	      $container.removeClass('gerrit--with-f-button');
	      $container.removeClass('gerrit--with-f-button-overlay');
	      $container = null;
	    },

	    /**
	     * @public
	     *
	     * Update the F button with new parameters.
	     *
	     * @param {Object} props
	     *
	     * @param {Object[]} props.files
	     *        The list of patch-set files with or without comment data.
	     *
	     * @param {String} props.activeFile
	     *        File path of the file being currently browsed in gerrit.
	     */
	    setProps: function(props) {
	      Object.keys(props).forEach(function(key) {
	        this.props[key] = props[key];
	      }.bind(this));

	      this.render();
	    },

	    /**
	     * @public
	     *
	     * Highlight the file following the currently selected file.
	     */
	    selectNextFile: function() {
	      var list = new LinkedList($, $frame.find('.f-button-file'));
	      var $selectedFile = $(this.getSelectedFileDOMNode());

	      if ($selectedFile) {
	        list.setCursor($selectedFile);
	      }

	      var $next = list.getNext();

	      if ($next.length) {
	        this.selectFile($next[0].getAttribute('data-id'));
	      }
	    },

	    /**
	     * @public
	     *
	     * Highlight the file preceding the currently selected file.
	     */
	    selectPreviousFile: function() {
	      var list = new LinkedList($, $frame.find('.f-button-file'));
	      var $selectedFile = $(this.getSelectedFileDOMNode());

	      if ($selectedFile) {
	        list.setCursor($selectedFile);
	      }

	      var $prev = list.getPrevious();

	      if ($prev.length) {
	        this.selectFile($prev[0].getAttribute('data-id'));
	      }
	    },

	    /**
	     * @public
	     *
	     * Activate the link of the selected file.
	     */
	    activateSelectedFile: function() {
	      if (this.state.selectedFile) {
	        this.getSelectedFileDOMNode().querySelector('a').click();
	      }
	    },

	    /**
	     * @private
	     */
	    componentDidRender: function() {
	      var activeFileDOMNode = this.getActiveFileDOMNode();

	      // Scroll the active row into view, very handy when the PS has many files.
	      if (activeFileDOMNode && HAS_SCROLL_INTO_VIEW) {
	        activeFileDOMNode.scrollIntoViewIfNeeded();
	      }

	      $frame.toggleClass('f-button__frame--list-view', !this.props.displayAsTree);

	      if ($container) {
	        $container.toggleClass('gerrit--with-f-button-overlay', this.props.displayAsOverlay);
	      }
	    },

	    /**
	     * @private
	     */
	    render: function() {
	      var $files = this.renderFiles();
	      var $controls = this.renderControls();

	      $frame
	        .empty()
	        .append($files)
	        .append($controls)
	        .toggleClass('f-button__frame--commented-only', this.state.commentedOnly)
	      ;

	      this.componentDidRender();
	    },

	    /**
	     * @private
	     */
	    renderFiles: function() {
	      var $list = $('<div />', { 'class': 'f-button__table' });
	      var fileTree = TreeView(this.props.files);

	      $list.append(this.renderFileTree(fileTree, true));

	      return $list;
	    },

	    /**
	     * @private
	     */
	    renderFileTree: function(tree, isRoot) {
	      var $list = $('<ol />', {
	        class: classSet({
	          'f-button-file__folder': true,
	          'f-button-file__folder--root': isRoot === true
	        })
	      });

	      // folders:
	      Object.keys(tree.children).sort().forEach(function(branch) {
	        var $children = this.renderFileTree(tree.children[branch]);

	        if (!$children) {
	          return null;
	        }

	        var $folderHeader = $('<header />', { class: 'f-button-file__folder-header' });

	        $folderHeader.append(
	          $('<span />', { class: 'f-button-file__icon f-button-icon__folder' })
	        );

	        $folderHeader.append($('<span />').text(branch + '/'));

	        return (
	          $('<li />')
	            .append($folderHeader)
	            .append($children)
	            .appendTo($list)
	        );
	      }.bind(this));

	      // files:
	      tree.items.forEach(function(file) {
	        if (this.state.commentedOnly && (!file.comments || !file.comments.length)) {
	          return null;
	        }

	        $list.append(this.renderFile(file));
	      }.bind(this));

	      return $list.children().length === 0 ? null : $list;
	    },

	    /**
	     * @private
	     */
	    renderFile: function(file) {
	      var filePath = file.filePath;
	      var fileName = this.props.displayAsTree ?
	        file.filePath.split('/').slice(-1)[0] :
	        file.filePath
	      ;

	      var hasComments = file.comments && file.comments.length > 0;
	      var $row = $('<li />', {
	        'data-id': file.filePath,
	        class: classSet({
	          'f-button-file': true,
	          'f-button-file--active': this.props.activeFile === filePath,
	          'f-button-file--selected': this.state.selectedFile === filePath,
	          'f-button-file--commented': hasComments
	        })
	      });

	      $row.append(
	        $('<span />', {
	          class: 'f-button-file__comment-count'
	        }).text(hasComments ? file.comments.length : '')
	      );

	      $row.append(
	        $('<span />', {
	          class: 'f-button-icon__file f-button-file__icon',
	          title: 'Copy filepath to clipboard'
	        }).bind('click', this.copyToClipboard.bind(this, filePath))
	      );

	      $row.append(
	        $('<a />', {
	          href: file.url,
	          class: 'f-button-file__link'
	        }).text(fileName)
	      );

	      return $row;
	    },

	    /**
	     * @private
	     */
	    renderControls: function() {
	      var $controls = $('<div />', {
	        class: 'f-button__controls'
	      });

	      $('<label />')
	        .append($('<input />', { type: 'checkbox', checked: this.state.commentedOnly }))
	        .append($('<span />').text('Hide files with no comments'))
	        .appendTo($controls)
	        .bind('click', this.toggleCommented.bind(this))
	      ;

	      $('<label />')
	        .append(
	          $('<input />', { type: 'checkbox', checked: this.props.hideInUnifiedMode })
	          .bind('change', this.toggleHideInUnifiedMode.bind(this))
	        )
	        .append($('<span />').text('Disable in Unified Diff view'))
	        .appendTo($controls)
	      ;

	      $('<label />')
	        .append(
	          $('<input />', { type: 'checkbox', checked: this.props.displayAsOverlay })
	          .bind('change', this.toggleDisplayAsOverlay.bind(this))
	        )
	        .append($('<span />').text('Display as overlay'))
	        .appendTo($controls)
	      ;

	      $('<label />')
	        .append(
	          $('<input />', { type: 'checkbox', checked: this.props.displayAsTree })
	          .bind('change', this.toggleDisplayAsTree.bind(this))
	        )
	        .append($('<span />').text('Display files as a tree'))
	        .appendTo($controls)
	      ;

	      return $controls;
	    },

	    /** @private */
	    setState: function(nextState) {
	      Object.keys(nextState).forEach(function(key) {
	        this.state[key] = nextState[key];
	      }.bind(this));

	      this.render();
	    },

	    /** @private */
	    selectFile: function(filePath) {
	      if (this.props.activeFile === filePath) {
	        this.setState({ selectedFile: null });
	      }
	      else {
	        this.setState({ selectedFile: filePath });
	      }
	    },

	    /** @private */
	    getSelectedFile: function() {
	      return this.state.selectedFile || this.props.activeFile;
	    },

	    /** @private */
	    getSelectedFileDOMNode: function() {
	      var selectedFile = this.getSelectedFile();

	      return [].filter.call($frame.find('.f-button-file'), function(el) {
	        return el.getAttribute('data-id') === selectedFile;
	      })[0];
	    },

	    /** @private */
	    getActiveFileDOMNode: function() {
	      var activeFile = this.props.activeFile;

	      return [].filter.call($frame.find('.f-button-file'), function(el) {
	        return el.getAttribute('data-id') === activeFile;
	      })[0];
	    },

	    /**
	     * @private
	     *
	     * Copy a filepath to the clipboard.
	     */
	    copyToClipboard: function(filePath/*, e*/) {
	      copyToClipboard(filePath);
	    },

	    /** @private */
	    toggleCommented: function() {
	      this.setState({ commentedOnly: !this.state.commentedOnly });
	    },

	    /** @private */
	    toggleHideInUnifiedMode: function(e) {
	      this.props.onToggleHideInUnifiedMode(e.target.checked);
	    },

	    /** @private */
	    toggleDisplayAsOverlay: function(e) {
	      this.props.onToggleDisplayAsOverlay(e.target.checked);
	    },

	    /** @private */
	    toggleDisplayAsTree: function(e) {
	      this.props.onToggleDisplayAsTree(e.target.checked);
	    },
	  };
	}

	var KC_F = 70;
	var KC_J = 74;
	var KC_K = 75;
	var KC_RETURN = 13;

	function GerritFButtonUIController($, core) {
	  var ui;

	  injectCSS(Styles);

	  window.addEventListener('keydown', function(e) {
	    var megaKey = e.shiftKey && e.ctrlKey && e.metaKey;

	    if (!megaKey) {
	      // don't show if we're not inspecting a patchset (or asked not to)
	      if (!core.isViewingPatchset() || (isInUnifiedMode() && shouldHideInUnifiedMode())) {
	        if (ui.isMounted()) {
	          ui.unmount();
	        }

	        return;
	      }
	      // don't steal focus from input widgets
	      else if (!shouldIntercept($, e.target)) {
	        return;
	      }
	    }

	    switch (e.keyCode || e.which) {
	      case KC_F:
	        // Some really pesky tuning here... the case is when we're focusing
	        // the editor node while the panel is already shown, we want to press
	        // MEGAKEY+f only to grant focus to the panel so that we can navigate
	        // to other files using the keyboard and do _not_ want to hide the panel
	        // as would've been done without this guard.
	        //
	        // So the formula is:
	        //
	        //   [panel is visible] + [megakey] + [we're focusing editor]
	        //
	        // Double-pressing this combination _should_ hide the panel.
	        if (megaKey && ui.isMounted() && !shouldIntercept($, e.target)) {
	          ui.stealFocus();
	        }
	        // Allow cmd+f and ctrl+f through to permit search.
	        else if (e.ctrlKey || e.metaKey) {
	          return;
	        }
	        else {
	          ui.toggle(null, { stealFocus: megaKey });
	        }

	        break;
	      case KC_J:
	        if (ui.isMounted()) {
	          ui.selectNextFile();
	        }

	        break;

	      case KC_K:
	        if (ui.isMounted()) {
	          ui.selectPreviousFile();
	        }

	        break;

	      case KC_RETURN:
	        if (ui.isMounted()) {
	          ui.activateSelectedFile();
	        }

	        break;
	    }
	  }, false);

	  ui = GerritFButtonUI($);
	  ui.setProps({
	    hideInUnifiedMode: shouldHideInUnifiedMode(),
	    displayAsOverlay: shouldDisplayAsOverlay(),
	    displayAsTree: shouldDisplayAsTree(),

	    onToggleHideInUnifiedMode: function(checked) {
	      setSetting('GERRIT_F_BUTTON/HIDE_IN_UNIFIED_MODE', checked);
	      ui.setProps({ hideInUnifiedMode: shouldHideInUnifiedMode() });
	    },

	    onToggleDisplayAsTree: function(checked) {
	      setSetting('GERRIT_F_BUTTON/DISPLAY_AS_LIST', !checked);
	      ui.setProps({ displayAsTree: shouldDisplayAsTree() });
	    },

	    onToggleDisplayAsOverlay: function(checked) {
	      setSetting('GERRIT_F_BUTTON/DISPLAY_AS_OVERLAY', checked);
	      ui.setProps({ displayAsOverlay: shouldDisplayAsOverlay() });
	    }
	  });

	  return {
	    render: function(files, activeFile) {
	      ui.setProps({ files: files, activeFile: activeFile });
	    }
	  };
	}

	function setSetting(key, isOn) {
	  if (isOn) {
	    localStorage.setItem(key, '1');
	  }
	  else {
	    localStorage.removeItem(key);
	  }
	}

	function isInUnifiedMode() {
	  return !!document.querySelector('.gerritBody .unifiedTable');
	}

	function shouldHideInUnifiedMode() {
	  return localStorage.getItem('GERRIT_F_BUTTON/HIDE_IN_UNIFIED_MODE') === '1';
	}

	function shouldDisplayAsOverlay() {
	  return localStorage.getItem('GERRIT_F_BUTTON/DISPLAY_AS_OVERLAY') === '1';
	}

	function shouldDisplayAsTree() {
	  return localStorage.getItem('GERRIT_F_BUTTON/DISPLAY_AS_LIST') !== '1';
	}

	function shouldIntercept($, node) {
	  return !$(node).is('input, textarea');
	}

	var version = "2.1.2";

	var NR_AJAX_CALLS = 2;

	function GerritFButton() {
	  function parseContextFromURL(url) {
	    var ctx = {};
	    var matchChange = url.match(/^\/c\/(\d+)/);
	    var matchRevision = url.match(/^\/c\/\d+\/(\d+)/);
	    var matchFile = url.match(/^\/c\/\d+\/\d+\/(.+)/);

	    ctx.chNumber = matchChange ? matchChange[1] : null;
	    ctx.rvNumber = matchRevision ? matchRevision[1] : null;
	    ctx.activeFile = matchFile ? matchFile[1] : null;

	    return ctx;
	  }

	  /**
	   * Download the files for the given change/revision combo and any comments for
	   * them.
	   *
	   * @param  {Number}   chNumber
	   * @param  {Number}   rvNumber
	   * @param  {Function} done
	   *
	   * @param {Object[]} done.files
	   *        A hash of file-names and their info.
	   *
	   * @param {String} done.files[].url
	   *        The URL for the file-diff page for this file.
	   *
	   * @param {Object[]} done.files[].comments
	   *        The list of comments for this file.
	   */
	  function fetch(chNumber, rvNumber, done) {
	    var files = [];
	    var BASE_URL = [ '/changes', chNumber, 'revisions', rvNumber ].join('/');
	    var callsDone = 0;

	    function set(filePath, item, value) {
	      var fileEntry = files.filter(function(entry) {
	        return entry.filePath === filePath;
	      })[0];

	      if (!fileEntry) {
	        fileEntry = { filePath: filePath };
	        files.push(fileEntry);
	      }

	      fileEntry[item] = value;
	    }

	    function tick() {
	      if (++callsDone === NR_AJAX_CALLS) {
	        done(files);
	      }
	    }

	    function getUrlForFile(filePath) {
	      return (
	        '/#/c/' + chNumber + '/' + rvNumber + '/' + discardLeadingSlash(filePath)
	      );
	    }

	    function getRemote(url, callback) {
	      window.$.ajax({
	        url: BASE_URL + url,
	        type: 'GET',
	        dataType: 'text',
	        success: function(resp) {
	          callback(JSON.parse(resp.substr(")]}'".length)));
	          tick();
	        }
	      });
	    }

	    getRemote('/files', function(rvFiles) {
	      Object.keys(rvFiles).forEach(function(_filePath) {
	        var filePath = discardLeadingSlash(_filePath);
	        set(filePath, 'url', getUrlForFile(filePath));
	      });
	    });

	    getRemote('/comments', function(rvFileComments) {
	      Object.keys(rvFileComments).forEach(function(_filePath) {
	        var filePath = discardLeadingSlash(_filePath);
	        set(filePath, 'comments', rvFileComments[filePath]);
	      });
	    });
	  }

	  return {
	    install: function(Gerrit, $) {
	      var context, cachedFiles;
	      var ui = GerritFButtonUIController($, {
	        isViewingPatchset: function() {
	          return !!context.chNumber;
	        }
	      });

	      // @event 'showchange'
	      //
	      // This will be triggered everytime the change's "landing" page is
	      // visited.
	      //
	      // See https://gerrit-review.googlesource.com/Documentation/js-api.html#self_on
	      //
	      // @param chInfo
	      //   See https://gerrit-review.googlesource.com/Documentation/rest-api-changes.html#change-info
	      //
	      // @param rvInfo
	      //   See https://gerrit-review.googlesource.com/Documentation/rest-api-changes.html#revision-info
	      Gerrit.on('showchange', function(chInfo, rvInfo) {
	        fetchFilesAndRender(chInfo._number, rvInfo._number);
	      });

	      // @event 'history'
	      //
	      // This is triggered everytime a new page in the Gerrit UI is visited;
	      // we are interested with the visits to the file-diff pages because we'd
	      // like to highlight the currently viewed file.
	      //
	      // See https://gerrit-review.googlesource.com/Documentation/js-api.html#self_on
	      Gerrit.on('history', function(token) {
	        context = parseContextFromURL(token);

	        if (context.chNumber) {
	          // This happens if the initial URL is not the change's landing page, but
	          // instead a file-diff page; the "showchange" event would not be emitted
	          // in this case and there's no way to get the change/revision information
	          // but from the URL.
	          if (!cachedFiles) {
	            fetchFilesAndRender(context.chNumber, context.rvNumber);
	          }
	          else {
	            render();
	          }
	        }
	        else { // no longer in a change? untrack the downloaded file listing
	          cachedFiles = null;
	        }
	      });

	      console.log('gerrit-f-button: version %s.', version);

	      function fetchFilesAndRender(chNumber, rvNumber) {
	        fetch(chNumber, rvNumber, function(files) {
	          cachedFiles = files;

	          render();
	        });
	      }

	      function render() {
	        ui.render(cachedFiles, context.activeFile);
	      }
	    }
	  };
	}

	// HTML tests
	if (typeof window !== 'undefined' && typeof window.GerritFButton !== 'undefined') {
	  window.GerritFButton.Core = GerritFButton;
	  window.GerritFButton.Styles = Styles;
	  window.GerritFButton.UI = GerritFButtonUI;
	  window.GerritFButton.injectCSS = injectCSS;
	}
	// mocha tests
	else if (typeof module !== 'undefined') {
	  /* eslint-disable */
	  exports.Core = GerritFButton;
	  exports.UI = GerritFButtonUI;
	  exports.TreeView = TreeView;
	  /* eslint-enable */
	}
	// Gerrit env
	else {
	  var gerritFButton = new GerritFButton();
	  var poller, timeout;

	  timeout = setTimeout(function() {
	    // note: this guard is not necessary outside of grease-monkey's context since
	    // the timeout will be cleared if the poller's test succeeds.
	    if (!gerritFButton.installed) {
	      console.error(
	        'gerrit-f-button: one of window.Gerrit or window.jQuery is not present;',
	        'plugin will not work.'
	      );
	    }

	    // for some reason, this isn't working in Greasemonkey
	    poller = clearInterval(poller);
	  }, 30000);

	  poller = setInterval(function() {
	    if (window.Gerrit && window.jQuery) {
	      gerritFButton.install(window.Gerrit, window.jQuery);

	      // for some reason, this isn't working in Greasemonkey
	      poller = clearInterval(poller);
	      timeout = clearTimeout(timeout);
	    }
	  }, 250);
	}

}());