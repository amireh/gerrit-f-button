// ==UserScript==
// @name        Gerrit F Button
// @namespace   ahmad@amireh.net
// @include     https://gerrit.instructure.com/*
// @version     2
// @grant       none
// @grant       GM_setClipboard
// @run-at      document.end
// ==/UserScript==

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
      padding-bottom: 1em;
      margin-bottom: 1em;
      border-bottom: 1px solid #ddd;
    }

    .f-button__controls label {
      display: block;
    }

    .f-button-file {
      list-style: none;
    }

    .f-button-file:hover {
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

  function GerritFButtonUI($) {
    var HAS_SCROLL_INTO_VIEW = (
      typeof window !== 'undefined' &&
      typeof HTMLElement.prototype.scrollIntoViewIfNeeded === 'function'
    );

    var $frame = $('<div />', { 'class': 'f-button__frame' });
    var $container, $activeRow;

    return {
      node: $frame[0],

      props: {
        files: [],
        currentFile: null,
        commentedOnly: false,
        hideInUnifiedMode: false,
        displayAsOverlay: false,
        displayAsTree: true,
        onToggleHideInUnifiedMode: Function.prototype,
        onToggleDisplayAsOverlay: Function.prototype,
      },

      isMounted: function() {
        return $frame.parent().length === 1;
      },

      mount: function(_container) {
        $container = $(_container || document.body);

        $container.addClass('gerrit--with-f-button');
        $container.append($frame);

        this.componentDidRender();
      },

      /**
       * Show or hide the F button frame.
       */
      toggle: function(container) {
        if (this.isMounted()) {
          this.unmount(container);
        }
        else {
          this.mount(container);
        }
      },

      unmount: function() {
        $frame.detach();
        $container.removeClass('gerrit--with-f-button');
        $container.removeClass('gerrit--with-f-button-overlay');
        $container = null;
      },

      /**
       * Update the F button with new parameters.
       *
       * @param {Object} props
       *
       * @param {Object[]} props.files
       *        The list of patch-set files with or without comment data.
       *
       * @param {String} props.currentFile
       *        File path of the file being currently browsed in gerrit.
       *
       * @param {Boolean} props.commentedOnly
       *        Whether to list only the files that have comments.
       */
      setProps: function(props) {
        Object.keys(props).forEach(function(key) {
          this.props[key] = props[key];
        }.bind(this));

        this.render();
      },

      /**
       * @private
       */
      componentDidRender: function() {
        // Scroll the active row into view, very handy when the PS has many files.
        if ($activeRow && HAS_SCROLL_INTO_VIEW) {
          $activeRow[0].scrollIntoViewIfNeeded();
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
        var $files = this.renderFiles(this.props.files, this.props.currentFile);
        var $controls = this.renderControls();

        $frame
          .empty()
          .append($controls)
          .append($files)
          .toggleClass('f-button__frame--commented-only', this.props.commentedOnly)
        ;

        this.componentDidRender();
      },

      /**
       * @private
       */
      renderFiles: function(files, currentFile) {
        var $list = $('<div />', { 'class': 'f-button__table' });
        var fileTree = TreeView(files);

        $activeRow = null;
        $list.append(this.renderFileTree(fileTree, currentFile, true));

        return $list;
      },

      /**
       * @private
       */
      renderFileTree: function(tree, currentFile, isRoot) {
        var $list = $('<ol />', {
          class: classSet({
            'f-button-file__folder': true,
            'f-button-file__folder--root': isRoot === true
          })
        });

        // folders:
        Object.keys(tree.children).sort().forEach(function(branch) {
          var $children = this.renderFileTree(tree.children[branch], currentFile);

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
          if (this.props.commentedOnly && (!file.comments || !file.comments.length)) {
            return null;
          }

          $list.append(this.renderFile(file, currentFile));
        }.bind(this));

        return $list.children().length === 0 ? null : $list;
      },

      /**
       * @private
       */
      renderFile: function(file, currentFile) {
        var filePath = file.filePath;
        var fileName = this.props.displayAsTree ?
          file.filePath.split('/').slice(-1)[0] :
          file.filePath
        ;

        var hasComments = file.comments && file.comments.length > 0;
        var $row = $('<li />', {
          class: classSet({
            'f-button-file': true,
            'f-button-file--active': currentFile === filePath,
            'f-button-file--commented': hasComments
          })
        });

        if (currentFile === filePath) {
          $activeRow = $row;
        }

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

      renderFileComments: function(comments) {
        var $comments = $('<ol />', { class: 'f-button-file__comments' });

        comments.forEach(function(comment) {
          $comments.append(
            $('<li />').text(
              '[' + comment.author.username + '] ' + comment.message
            )
          );
        });

        return $comments;
      },

      /**
       * @private
       */
      renderControls: function() {
        var $controls = $('<div />', {
          class: 'f-button__controls'
        });

        $('<label />')
          .append($('<input />', { type: 'checkbox', checked: this.props.commentedOnly }))
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

      /**
       * @private
       *
       * Copy a filepath to the clipboard.
       */
      copyToClipboard: function(filePath/*, e*/) {
        copyToClipboard(filePath);
      },

      /**
       * @private
       */
      toggleCommented: function() {
        this.setProps({ commentedOnly: !this.props.commentedOnly });
      },

      toggleHideInUnifiedMode: function(e) {
        this.props.onToggleHideInUnifiedMode(e.target.checked);
      },

      toggleDisplayAsOverlay: function(e) {
        this.props.onToggleDisplayAsOverlay(e.target.checked);
      },

      toggleDisplayAsTree: function(e) {
        this.props.onToggleDisplayAsTree(e.target.checked);
      },
    };
  }

  var NR_AJAX_CALLS = 2;

  function GerritFButton() {
    var KC_F = 70;

    function parseContextFromURL(url) {
      var ctx = {};
      var matchChange = url.match(/^\/c\/(\d+)/);
      var matchRevision = url.match(/^\/c\/\d+\/(\d+)/);
      var matchFile = url.match(/^\/c\/\d+\/\d+\/(.+)/);

      ctx.chNumber = matchChange ? matchChange[1] : null;
      ctx.rvNumber = matchRevision ? matchRevision[1] : null;
      ctx.currentFile = matchFile ? matchFile[1] : null;

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

    return {
      install: function(Gerrit, $) {
        var ui = GerritFButtonUI($);
        var context, cachedFiles;

        ui.setProps({
          hideInUnifiedMode: shouldHideInUnifiedMode(),
          displayAsOverlay: shouldDisplayAsOverlay(),
          displayAsTree: shouldDisplayAsTree(),

          onToggleHideInUnifiedMode: function(checked) {
            if (checked) {
              localStorage.setItem('GERRIT_F_BUTTON/HIDE_IN_UNIFIED_MODE', '1');
            }
            else {
              localStorage.removeItem('GERRIT_F_BUTTON/HIDE_IN_UNIFIED_MODE');
            }

            ui.setProps({
              hideInUnifiedMode: shouldHideInUnifiedMode()
            });
          },

          onToggleDisplayAsTree: function(checked) {
            if (checked) {
              localStorage.removeItem('GERRIT_F_BUTTON/DISPLAY_AS_LIST');
            }
            else {
              localStorage.setItem('GERRIT_F_BUTTON/DISPLAY_AS_LIST', '1');
            }

            ui.setProps({
              displayAsTree: shouldDisplayAsTree()
            });
          },

          onToggleDisplayAsOverlay: function(checked) {
            if (checked) {
              localStorage.setItem('GERRIT_F_BUTTON/DISPLAY_AS_OVERLAY', '1');
            }
            else {
              localStorage.removeItem('GERRIT_F_BUTTON/DISPLAY_AS_OVERLAY');
            }

            ui.setProps({
              displayAsOverlay: shouldDisplayAsOverlay()
            });
          }
        })

        injectCSS(Styles);

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

        window.addEventListener('keyup', function(e) {
          if (
            !context.chNumber /* not viewing a change? forget it! */ ||
            (isInUnifiedMode() && shouldHideInUnifiedMode())
          ) {
            if (ui.isMounted()) {
              ui.unmount();
            }

            return;
          }

          if ([ e.keyCode, e.which ].indexOf(KC_F) > -1) {
            if (!$(e.target).is('input, textarea')) {
              ui.toggle();
            }
          }
        });

        console.log('gerrit-f-button: active.');

        function fetchFilesAndRender(chNumber, rvNumber) {
          fetch(chNumber, rvNumber, function(files) {
            cachedFiles = files;

            render();
          });
        }

        function render() {
          ui.setProps({
            files: cachedFiles,
            currentFile: context.currentFile
          });
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
    exports.Core = GerritFButton;
    exports.UI = GerritFButtonUI;
    exports.TreeView = TreeView;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2Vycml0LWYtYnV0dG9uLmpzIiwic291cmNlcyI6WyJzcmMvdXRpbHMuanMiLCJzcmMvc3R5bGVzLmpzIiwic3JjL3VpLmpzIiwic3JjL2NvcmUuanMiLCJzcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gVXRpbHNcbmV4cG9ydCBmdW5jdGlvbiBUcmVlVmlldyhmaWxlTGlzdCkge1xuICB2YXIgdHJlZSA9IHtcbiAgICBpdGVtczogW10sXG4gICAgY2hpbGRyZW46IHt9XG4gIH07XG5cbiAgZnVuY3Rpb24gZ2V0QnJhbmNoKHBhdGgpIHtcbiAgICB2YXIgZnJhZ21lbnRzID0gcGF0aC5zcGxpdCgnLycpLmZpbHRlcihmdW5jdGlvbih4KSB7IHJldHVybiB4Lmxlbmd0aCA+IDA7IH0pO1xuICAgIHZhciBicmFuY2ggPSB0cmVlO1xuXG4gICAgZnJhZ21lbnRzLmZvckVhY2goZnVuY3Rpb24oZnJhZ21lbnQpIHtcbiAgICAgIGlmICghYnJhbmNoLmNoaWxkcmVuW2ZyYWdtZW50XSkge1xuICAgICAgICBicmFuY2guY2hpbGRyZW5bZnJhZ21lbnRdID0geyBpdGVtczogW10sIGNoaWxkcmVuOiB7fSB9O1xuICAgICAgfVxuXG4gICAgICBicmFuY2ggPSBicmFuY2guY2hpbGRyZW5bZnJhZ21lbnRdO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGJyYW5jaDtcbiAgfVxuXG4gIGZpbGVMaXN0LmZvckVhY2goZnVuY3Rpb24oZmlsZSkge1xuICAgIGdldEJyYW5jaChmaWxlLmZpbGVQYXRoLnNwbGl0KCcvJykuc2xpY2UoMCwgLTEpLmpvaW4oJy8nKSkuaXRlbXMucHVzaChmaWxlKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHRyZWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGFzc1NldChjbGFzc05hbWVzKSB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhjbGFzc05hbWVzKS5yZWR1Y2UoZnVuY3Rpb24oY2xhc3NOYW1lLCBrZXkpIHtcbiAgICByZXR1cm4gISFjbGFzc05hbWVzW2tleV0gPyAoY2xhc3NOYW1lICsgJyAnICsga2V5KSA6IGNsYXNzTmFtZTtcbiAgfSwgJycpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0Q1NTKHN0cmluZykge1xuICB2YXIgc3R5bGVOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcblxuICBzdHlsZU5vZGUuaW5uZXJIVE1MID0gc3RyaW5nO1xuXG4gIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGVOb2RlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc2NhcmRMZWFkaW5nU2xhc2gocykge1xuICByZXR1cm4gcy5yZXBsYWNlKC9eXFwvLywgJycpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29weVRvQ2xpcGJvYXJkKHN0cmluZykge1xuICAvLyBHcmVhc2VNb25rZXkgc2FuZGJveDpcbiAgaWYgKHR5cGVvZiBHTV9zZXRDbGlwYm9hcmQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgR01fc2V0Q2xpcGJvYXJkKHN0cmluZyk7XG4gIH1cbn0iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHsvKlxuICBAZm9udC1mYWNlIHtcbiAgICBmb250LWZhbWlseTogJ2dlcnJpdC1mLWJ1dHRvbic7XG4gICAgc3JjOlxuICAgICAgdXJsKGRhdGE6YXBwbGljYXRpb24vZm9udC13b2ZmO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LGQwOUdSZ0FCQUFBQUFBWWNBQXNBQUFBQUJkQUFBUUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFCUFV5OHlBQUFCQ0FBQUFHQUFBQUJnRHhJR2ttTnRZWEFBQUFGb0FBQUFYQUFBQUZ6cUpPcFBaMkZ6Y0FBQUFjUUFBQUFJQUFBQUNBQUFBQkJuYkhsbUFBQUJ6QUFBQWFBQUFBR2dta2FLczJobFlXUUFBQU5zQUFBQU5nQUFBRFlLbUFCcGFHaGxZUUFBQTZRQUFBQWtBQUFBSkFmQkE4aG9iWFI0QUFBRHlBQUFBQndBQUFBY0VnQUFRbXh2WTJFQUFBUGtBQUFBRUFBQUFCQUF5QUZVYldGNGNBQUFBL1FBQUFBZ0FBQUFJQUFMQURwdVlXMWxBQUFFRkFBQUFlWUFBQUhtaS9uNlJYQnZjM1FBQUFYOEFBQUFJQUFBQUNBQUF3QUFBQU1EZ0FHUUFBVUFBQUtaQXN3QUFBQ1BBcGtDekFBQUFlc0FNd0VKQUFBQUFBQUFBQUFBQUFBQUFBQUFBUkFBQUFBQUFBQUFBQUFBQUFBQUFBQUFRQUFBNmVnRHdQL0FBRUFEd0FCQUFBQUFBUUFBQUFBQUFBQUFBQUFBSUFBQUFBQUFBd0FBQUFNQUFBQWNBQUVBQXdBQUFCd0FBd0FCQUFBQUhBQUVBRUFBQUFBTUFBZ0FBZ0FFQUFFQUlPbWQ2ZWovL2YvL0FBQUFBQUFnNlozcDUvLzkvLzhBQWYvakZtY1dIZ0FEQUFFQUFBQUFBQUFBQUFBQUFBQUFBUUFCLy84QUR3QUJBQUFBQUFBQUFBQUFBZ0FBTnprQkFBQUFBQUVBQUFBQUFBQUFBQUFDQUFBM09RRUFBQUFBQVFBQUFBQUFBQUFBQUFJQUFEYzVBUUFBQUFBREFFRC93QVBBQThBQUdRQWhBRGNBQUFFdUFTY3VBU2N1QVNNaElnWVZFUlFXTXlFeU5qVVJOQ1luSng0QkZ5TTFIZ0VURkFZaklTSW1OUkUwTmpNd09nSXhGUlFXT3dFRGxoRXRHUm96RnljcEMvNFFJUzh2SVFMZ0lTOE9ISVVYSlEyYUVTbUdDUWY5SUFjSkNRZWJ1cHNURGVBQzJ4Y3pHaGt0RVJ3T0x5SDhvQ0V2THlFQ2NBc3BKellYS1JHYURTWDg2QWNKQ1FjRFlBY0o0QTBUQUFBQUFBSUFBUUJBQS84RGdBQVBBQnNBQUFFaElnWVhFeDRCTXlFeU5qY1ROaVluTkNZaklTY2pJZ1lkQVNFRDJQeFFGQmNFZGdNaUZBS2dGQ0lEZGdRWGJCd1UvbEFnMEJRY0F3QUN3QndUL2Q0VEhCd1RBaUlUSEZBVUhFQWNGRkFBQUFJQUFRQkFBLzhEZ0FBUEFCc0FBQUV5RmdjRERnRWpJU0ltSndNbU5qTWxGU0UxTkRZN0FSY2hNaFlEMkJRWEJIWURJaFQ5WUJRaUEzWUVGeE1EV2YwQUhCVFFJQUd3RkJ3Q1FCd1QvbDRUSEJ3VEFhSVRITkNRMEJRY1FCd0FBQUVBQUFBQkFBQzA2UjFMWHc4ODlRQUxCQUFBQUFBQTA3emQ5Z0FBQUFEVHZOMzJBQUQvd0FQL0E4QUFBQUFJQUFJQUFBQUFBQUFBQVFBQUE4RC93QUFBQkFBQUFBQUFBLzhBQVFBQUFBQUFBQUFBQUFBQUFBQUFBQWNFQUFBQUFBQUFBQUFBQUFBQ0FBQUFCQUFBUUFRQUFBRUVBQUFCQUFBQUFBQUtBQlFBSGdCd0FLQUEwQUFCQUFBQUJ3QTRBQU1BQUFBQUFBSUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFEZ0N1QUFFQUFBQUFBQUVBRHdBQUFBRUFBQUFBQUFJQUJ3Q29BQUVBQUFBQUFBTUFEd0JPQUFFQUFBQUFBQVFBRHdDOUFBRUFBQUFBQUFVQUN3QXRBQUVBQUFBQUFBWUFEd0I3QUFFQUFBQUFBQW9BR2dEcUFBTUFBUVFKQUFFQUhnQVBBQU1BQVFRSkFBSUFEZ0N2QUFNQUFRUUpBQU1BSGdCZEFBTUFBUVFKQUFRQUhnRE1BQU1BQVFRSkFBVUFGZ0E0QUFNQUFRUUpBQVlBSGdDS0FBTUFBUVFKQUFvQU5BRUVaMlZ5Y21sMExXWXRZblYwZEc5dUFHY0FaUUJ5QUhJQWFRQjBBQzBBWmdBdEFHSUFkUUIwQUhRQWJ3QnVWbVZ5YzJsdmJpQXhMakFBVmdCbEFISUFjd0JwQUc4QWJnQWdBREVBTGdBd1oyVnljbWwwTFdZdFluVjBkRzl1QUdjQVpRQnlBSElBYVFCMEFDMEFaZ0F0QUdJQWRRQjBBSFFBYndCdVoyVnljbWwwTFdZdFluVjBkRzl1QUdjQVpRQnlBSElBYVFCMEFDMEFaZ0F0QUdJQWRRQjBBSFFBYndCdVVtVm5kV3hoY2dCU0FHVUFad0IxQUd3QVlRQnlaMlZ5Y21sMExXWXRZblYwZEc5dUFHY0FaUUJ5QUhJQWFRQjBBQzBBWmdBdEFHSUFkUUIwQUhRQWJ3QnVSbTl1ZENCblpXNWxjbUYwWldRZ1lua2dTV052VFc5dmJpNEFSZ0J2QUc0QWRBQWdBR2NBWlFCdUFHVUFjZ0JoQUhRQVpRQmtBQ0FBWWdCNUFDQUFTUUJqQUc4QVRRQnZBRzhBYmdBdUFBQUFBd0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUE9PSkgZm9ybWF0KCd3b2ZmJyksXG4gICAgICB1cmwoZGF0YTphcHBsaWNhdGlvbi94LWZvbnQtdHRmO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LEFBRUFBQUFMQUlBQUF3QXdUMU12TWc4U0JwSUFBQUM4QUFBQVlHTnRZWERxSk9wUEFBQUJIQUFBQUZ4bllYTndBQUFBRUFBQUFYZ0FBQUFJWjJ4NVpwcEdpck1BQUFHQUFBQUJvR2hsWVdRS21BQnBBQUFESUFBQUFEWm9hR1ZoQjhFRHlBQUFBMWdBQUFBa2FHMTBlQklBQUVJQUFBTjhBQUFBSEd4dlkyRUF5QUZVQUFBRG1BQUFBQkJ0WVhod0FBc0FPZ0FBQTZnQUFBQWdibUZ0Wll2NStrVUFBQVBJQUFBQjVuQnZjM1FBQXdBQUFBQUZzQUFBQUNBQUF3T0FBWkFBQlFBQUFwa0N6QUFBQUk4Q21RTE1BQUFCNndBekFRa0FBQUFBQUFBQUFBQUFBQUFBQUFBQkVBQUFBQUFBQUFBQUFBQUFBQUFBQUFCQUFBRHA2QVBBLzhBQVFBUEFBRUFBQUFBQkFBQUFBQUFBQUFBQUFBQWdBQUFBQUFBREFBQUFBd0FBQUJ3QUFRQURBQUFBSEFBREFBRUFBQUFjQUFRQVFBQUFBQXdBQ0FBQ0FBUUFBUUFnNlozcDZQLzkvLzhBQUFBQUFDRHBuZW5uLy8zLy93QUIvK01XWnhZZUFBTUFBUUFBQUFBQUFBQUFBQUFBQUFBQkFBSC8vd0FQQUFFQUFBQUFBQUFBQUFBQ0FBQTNPUUVBQUFBQUFRQUFBQUFBQUFBQUFBSUFBRGM1QVFBQUFBQUJBQUFBQUFBQUFBQUFBZ0FBTnprQkFBQUFBQU1BUVAvQUE4QUR3QUFaQUNFQU53QUFBUzRCSnk0Qkp5NEJJeUVpQmhVUkZCWXpJVEkyTlJFMEppY25IZ0VYSXpVZUFSTVVCaU1oSWlZMUVUUTJNekE2QWpFVkZCWTdBUU9XRVMwWkdqTVhKeWtML2hBaEx5OGhBdUFoTHc0Y2hSY2xEWm9SS1lZSkIvMGdCd2tKQjV1Nm14TU40QUxiRnpNYUdTMFJIQTR2SWZ5Z0lTOHZJUUp3Q3lrbk5oY3BFWm9OSmZ6b0J3a0pCd05nQnduZ0RSTUFBQUFBQWdBQkFFQUQvd09BQUE4QUd3QUFBU0VpQmhjVEhnRXpJVEkyTnhNMkppYzBKaU1oSnlNaUJoMEJJUVBZL0ZBVUZ3UjJBeUlVQXFBVUlnTjJCQmRzSEJUK1VDRFFGQndEQUFMQUhCUDkzaE1jSEJNQ0loTWNVQlFjUUJ3VVVBQUFBZ0FCQUVBRC93T0FBQThBR3dBQUFUSVdCd01PQVNNaElpWW5BeVkyTXlVVklUVTBOanNCRnlFeUZnUFlGQmNFZGdNaUZQMWdGQ0lEZGdRWEV3TlovUUFjRk5BZ0FiQVVIQUpBSEJQK1hoTWNIQk1Cb2hNYzBKRFFGQnhBSEFBQUFRQUFBQUVBQUxUcEhVdGZEenoxQUFzRUFBQUFBQURUdk4zMkFBQUFBTk84M2ZZQUFQL0FBLzhEd0FBQUFBZ0FBZ0FBQUFBQUFBQUJBQUFEd1AvQUFBQUVBQUFBQUFBRC93QUJBQUFBQUFBQUFBQUFBQUFBQUFBQUJ3UUFBQUFBQUFBQUFBQUFBQUlBQUFBRUFBQkFCQUFBQVFRQUFBRUFBQUFBQUFvQUZBQWVBSEFBb0FEUUFBRUFBQUFIQURnQUF3QUFBQUFBQWdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT0FLNEFBUUFBQUFBQUFRQVBBQUFBQVFBQUFBQUFBZ0FIQUtnQUFRQUFBQUFBQXdBUEFFNEFBUUFBQUFBQUJBQVBBTDBBQVFBQUFBQUFCUUFMQUMwQUFRQUFBQUFBQmdBUEFIc0FBUUFBQUFBQUNnQWFBT29BQXdBQkJBa0FBUUFlQUE4QUF3QUJCQWtBQWdBT0FLOEFBd0FCQkFrQUF3QWVBRjBBQXdBQkJBa0FCQUFlQU13QUF3QUJCQWtBQlFBV0FEZ0FBd0FCQkFrQUJnQWVBSW9BQXdBQkJBa0FDZ0EwQVFSblpYSnlhWFF0WmkxaWRYUjBiMjRBWndCbEFISUFjZ0JwQUhRQUxRQm1BQzBBWWdCMUFIUUFkQUJ2QUc1V1pYSnphVzl1SURFdU1BQldBR1VBY2dCekFHa0Fid0J1QUNBQU1RQXVBREJuWlhKeWFYUXRaaTFpZFhSMGIyNEFad0JsQUhJQWNnQnBBSFFBTFFCbUFDMEFZZ0IxQUhRQWRBQnZBRzVuWlhKeWFYUXRaaTFpZFhSMGIyNEFad0JsQUhJQWNnQnBBSFFBTFFCbUFDMEFZZ0IxQUhRQWRBQnZBRzVTWldkMWJHRnlBRklBWlFCbkFIVUFiQUJoQUhKblpYSnlhWFF0WmkxaWRYUjBiMjRBWndCbEFISUFjZ0JwQUhRQUxRQm1BQzBBWWdCMUFIUUFkQUJ2QUc1R2IyNTBJR2RsYm1WeVlYUmxaQ0JpZVNCSlkyOU5iMjl1TGdCR0FHOEFiZ0IwQUNBQVp3QmxBRzRBWlFCeUFHRUFkQUJsQUdRQUlBQmlBSGtBSUFCSkFHTUFid0JOQUc4QWJ3QnVBQzRBQUFBREFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUEpIGZvcm1hdCgndHJ1ZXR5cGUnKSxcbiAgICAgIHVybChkYXRhOmltYWdlL3N2Zyt4bWw7Y2hhcnNldD11dGYtODtiYXNlNjQsUEQ5NGJXd2dkbVZ5YzJsdmJqMGlNUzR3SWlCemRHRnVaR0ZzYjI1bFBTSnVieUkvUGdvOElVUlBRMVJaVUVVZ2MzWm5JRkJWUWt4SlF5QWlMUzh2VnpOREx5OUVWRVFnVTFaSElERXVNUzh2UlU0aUlDSm9kSFJ3T2k4dmQzZDNMbmN6TG05eVp5OUhjbUZ3YUdsamN5OVRWa2N2TVM0eEwwUlVSQzl6ZG1jeE1TNWtkR1FpSUQ0S1BITjJaeUI0Yld4dWN6MGlhSFIwY0RvdkwzZDNkeTUzTXk1dmNtY3ZNakF3TUM5emRtY2lQZ284YldWMFlXUmhkR0UrUjJWdVpYSmhkR1ZrSUdKNUlFbGpiMDF2YjI0OEwyMWxkR0ZrWVhSaFBnbzhaR1ZtY3o0S1BHWnZiblFnYVdROUltZGxjbkpwZEMxbUxXSjFkSFJ2YmlJZ2FHOXlhWG90WVdSMkxYZzlJakV3TWpRaVBnbzhabTl1ZEMxbVlXTmxJSFZ1YVhSekxYQmxjaTFsYlQwaU1UQXlOQ0lnWVhOalpXNTBQU0k1TmpBaUlHUmxjMk5sYm5ROUlpMDJOQ0lnTHo0S1BHMXBjM05wYm1jdFoyeDVjR2dnYUc5eWFYb3RZV1IyTFhnOUlqRXdNalFpSUM4K0NqeG5iSGx3YUNCMWJtbGpiMlJsUFNJbUkzZ3lNRHNpSUdodmNtbDZMV0ZrZGkxNFBTSTFNVElpSUdROUlpSWdMejRLUEdkc2VYQm9JSFZ1YVdOdlpHVTlJaVlqZUdVNU9XUTdJaUJuYkhsd2FDMXVZVzFsUFNKbWFXeGxJaUJrUFNKTk9URTNMamd3TmlBM016QXVPVEkwWXkweU1pNHlNVElnTXpBdU1qa3lMVFV6TGpFM05DQTJOUzQzTFRnM0xqRTNPQ0E1T1M0M01EUnpMVFk1TGpReE1pQTJOQzQ1TmpRdE9Ua3VOekEwSURnM0xqRTNPR010TlRFdU5UYzBJRE0zTGpneUxUYzJMalU1TWlBME1pNHhPVFF0T1RBdU9USTBJRFF5TGpFNU5HZ3RORGsyWXkwME5DNHhNVElnTUMwNE1DMHpOUzQ0T0RndE9EQXRPREIyTFRnMk5HTXdMVFEwTGpFeE1pQXpOUzQ0T0RndE9EQWdPREF0T0RCb056TTJZelEwTGpFeE1pQXdJRGd3SURNMUxqZzRPQ0E0TUNBNE1IWTJNalJqTUNBeE5DNHpNekl0TkM0ek56SWdNemt1TXpVdE5ESXVNVGswSURrd0xqa3lOSHBOTnpnMUxqTTNOQ0EzT0RVdU16YzBZek13TGpjdE16QXVOeUExTkM0NExUVTRMak01T0NBM01pNDFPQzA0TVM0ek56Um9MVEUxTXk0NU5UUjJNVFV6TGprME5tTXlNaTQ1T0RRdE1UY3VOemdnTlRBdU5qYzRMVFF4TGpnM09DQTRNUzR6TnpRdE56SXVOVGN5ZWswNE9UWWdNVFpqTUMwNExqWTNNaTAzTGpNeU9DMHhOaTB4TmkweE5tZ3ROek0yWXkwNExqWTNNaUF3TFRFMklEY3VNekk0TFRFMklERTJkamcyTkdNd0lEZ3VOamN5SURjdU16STRJREUySURFMklERTJJREFnTUNBME9UVXVPVFUySURBdU1EQXlJRFE1TmlBd2RpMHlNalJqTUMweE55NDJOeklnTVRRdU16STJMVE15SURNeUxUTXlhREl5TkhZdE5qSTBlaUlnTHo0S1BHZHNlWEJvSUhWdWFXTnZaR1U5SWlZamVHVTVaVGM3SWlCbmJIbHdhQzF1WVcxbFBTSm1iMnhrWlhJaUlHUTlJazA1T0RRdU5TQTNNRFJvTFRrME5XTXRNall1TkNBd0xUUXpMamMyTkMweU1TNHhPQzB6T0M0MU9EWXRORGN1TURZNGJERXhOeTQyTnpJdE5UUTFMamcyTkdNMUxqRTNPQzB5TlM0NE9EZ2dNekV1TURFMExUUTNMakEyT0NBMU55NDBNVFF0TkRjdU1EWTRhRFkzTW1NeU5pNHpPVGdnTUNBMU1pNHlNelFnTWpFdU1UZ2dOVGN1TkRFeUlEUTNMakEyT0d3eE1UY3VOamMwSURVME5TNDROalJqTlM0eE56Z2dNalV1T0RnNExURXlMakU0T0NBME55NHdOamd0TXpndU5UZzJJRFEzTGpBMk9IcE5PRGsySURjNE5HTXdJREkyTGpVeExUSXhMalE1SURRNExUUTRJRFE0YUMwME16SnNMVE15SURZMGFDMHlNRGhqTFRJMkxqVXhJREF0TkRndE1qRXVORGt0TkRndE5EaDJMVGd3YURjMk9IWXhObm9pSUM4K0NqeG5iSGx3YUNCMWJtbGpiMlJsUFNJbUkzaGxPV1U0T3lJZ1oyeDVjR2d0Ym1GdFpUMGlabTlzWkdWeUxTMXZjR1Z1SWlCa1BTSk5PVGcwTGpVZ05UYzJZekkyTGpRZ01DQTBNeTQzTmpRdE1qRXVNVGdnTXpndU5UZzJMVFEzTGpBMk9Hd3RNVEUzTGpZM01pMDBNVGN1T0RZMFl5MDFMakUzT0MweU5TNDRPRGd0TXpFdU1ERTBMVFEzTGpBMk9DMDFOeTQwTVRRdE5EY3VNRFk0YUMwMk56SmpMVEkyTGpRZ01DMDFNaTR5TXpZZ01qRXVNVGd0TlRjdU5ERTBJRFEzTGpBMk9Hd3RNVEUzTGpZM01pQTBNVGN1T0RZMFl5MDFMakUzT0NBeU5TNDRPRGdnTVRJdU1UZzJJRFEzTGpBMk9DQXpPQzQxT0RZZ05EY3VNRFk0YURrME5YcE5PRGsySURjNE5IWXRNVFEwYUMwM05qaDJNakE0WXpBZ01qWXVOVEVnTWpFdU5Ea2dORGdnTkRnZ05EaG9NakE0YkRNeUxUWTBhRFF6TW1NeU5pNDFNU0F3SURRNExUSXhMalE1SURRNExUUTRlaUlnTHo0S1BDOW1iMjUwUGp3dlpHVm1jejQ4TDNOMlp6ND0pIGZvcm1hdCgnc3ZnJylcbiAgICA7XG4gICAgZm9udC13ZWlnaHQ6IG5vcm1hbDtcbiAgICBmb250LXN0eWxlOiBub3JtYWw7XG4gIH1cblxuICBbY2xhc3NePVwiZi1idXR0b24taWNvbl9fXCJdLFxuICBbY2xhc3MqPVwiIGYtYnV0dG9uLWljb25fX1wiXSB7XG4gICAgZm9udC1mYW1pbHk6ICdnZXJyaXQtZi1idXR0b24nICFpbXBvcnRhbnQ7XG4gICAgc3BlYWs6IG5vbmU7XG4gICAgZm9udC1zdHlsZTogbm9ybWFsO1xuICAgIGZvbnQtd2VpZ2h0OiBub3JtYWw7XG4gICAgZm9udC12YXJpYW50OiBub3JtYWw7XG4gICAgdGV4dC10cmFuc2Zvcm06IG5vbmU7XG4gICAgbGluZS1oZWlnaHQ6IDE7XG5cbiAgICAtd2Via2l0LWZvbnQtc21vb3RoaW5nOiBhbnRpYWxpYXNlZDtcbiAgICAtbW96LW9zeC1mb250LXNtb290aGluZzogZ3JheXNjYWxlO1xuICB9XG5cbiAgLmYtYnV0dG9uLWljb25fX2ZpbGU6YmVmb3JlIHtcbiAgICBjb250ZW50OiBcIlxcZTk5ZFwiO1xuICB9XG4gIC5mLWJ1dHRvbi1pY29uX19mb2xkZXI6YmVmb3JlIHtcbiAgICBjb250ZW50OiBcIlxcZTllN1wiO1xuICB9XG4gIC5mLWJ1dHRvbi1pY29uX19mb2xkZXItLW9wZW46YmVmb3JlIHtcbiAgICBjb250ZW50OiBcIlxcZTllOFwiO1xuICB9XG5cbiAgYm9keS5nZXJyaXQtLXdpdGgtZi1idXR0b24ge1xuICAgIG1hcmdpbi1sZWZ0OiAyODBweDtcbiAgfVxuXG4gIGJvZHkuZ2Vycml0LS13aXRoLWYtYnV0dG9uLW92ZXJsYXkge1xuICAgIG1hcmdpbi1sZWZ0OiAwO1xuICB9XG5cbiAgLmYtYnV0dG9uX19mcmFtZSB7XG4gICAgcG9zaXRpb246IGZpeGVkO1xuICAgIHRvcDogMDtcbiAgICByaWdodDogYXV0bztcbiAgICBib3R0b206IDA7XG4gICAgbGVmdDogMDtcblxuICAgIHdpZHRoOiAyNDBweDtcbiAgICBvdmVyZmxvdzogYXV0bztcblxuICAgIGJvcmRlci1jb2xvcjogI2FhYTtcbiAgICBib3JkZXItcmlnaHQtc3R5bGU6IHNvbGlkO1xuICAgIGJvcmRlci1yaWdodC13aWR0aDogMXB4O1xuICAgIGJhY2tncm91bmQ6IHdoaXRlO1xuICAgIHBhZGRpbmc6IDEwcHg7XG5cbiAgICBmb250LXNpemU6IDAuODVlbTtcbiAgICBsaW5lLWhlaWdodDogMS40O1xuXG4gICAgei1pbmRleDogNjtcbiAgfVxuXG4gIGJvZHkuZ2Vycml0LS13aXRoLWYtYnV0dG9uLW92ZXJsYXkgLmYtYnV0dG9uX19mcmFtZSB7XG4gICAgd2lkdGg6IDUwJTtcbiAgICBsZWZ0OiAyNSU7XG4gICAgdG9wOiA1MCU7XG4gICAgYm9yZGVyLWxlZnQtd2lkdGg6IDFweDtcbiAgICBib3JkZXItbGVmdC1zdHlsZTogc29saWQ7XG4gICAgYm9yZGVyLXRvcC1zdHlsZTogc29saWQ7XG4gICAgYm9yZGVyLXRvcC13aWR0aDogMXB4O1xuXG4gICAgb3BhY2l0eTogMC44NTtcbiAgfVxuXG4gIGJvZHkuZ2Vycml0LS13aXRoLWYtYnV0dG9uLW92ZXJsYXkgLmYtYnV0dG9uX19mcmFtZTpob3ZlciB7XG4gICAgb3BhY2l0eTogMTtcbiAgfVxuXG4gIC5mLWJ1dHRvbl9fZnJhbWUtLWNvbW1lbnRlZC1vbmx5IC5mLWJ1dHRvbi1maWxlOm5vdCguZi1idXR0b24tZmlsZS0tY29tbWVudGVkKSB7XG4gICAgZGlzcGxheTogbm9uZTtcbiAgfVxuXG4gIC5mLWJ1dHRvbl9fZnJhbWUtLWxpc3QtdmlldyAuZi1idXR0b24tZmlsZV9fZm9sZGVyIHtcbiAgICBwYWRkaW5nLWxlZnQ6IDA7XG4gIH1cblxuICAuZi1idXR0b25fX2ZyYW1lLS1saXN0LXZpZXcgLmYtYnV0dG9uLWZpbGVfX2ZvbGRlci1oZWFkZXIge1xuICAgIGRpc3BsYXk6IG5vbmU7XG4gIH1cblxuICAuZi1idXR0b25fX2NvbnRyb2xzIHtcbiAgICBwYWRkaW5nLWJvdHRvbTogMWVtO1xuICAgIG1hcmdpbi1ib3R0b206IDFlbTtcbiAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2RkZDtcbiAgfVxuXG4gIC5mLWJ1dHRvbl9fY29udHJvbHMgbGFiZWwge1xuICAgIGRpc3BsYXk6IGJsb2NrO1xuICB9XG5cbiAgLmYtYnV0dG9uLWZpbGUge1xuICAgIGxpc3Qtc3R5bGU6IG5vbmU7XG4gIH1cblxuICAuZi1idXR0b24tZmlsZTpob3ZlciB7XG4gICAgYmFja2dyb3VuZDogI2ZjZmE5NjtcbiAgfVxuXG4gIC5mLWJ1dHRvbi1maWxlLS1hY3RpdmUge1xuICAgIGJhY2tncm91bmQtY29sb3I6ICNERUY7XG4gIH1cblxuICAuZi1idXR0b24tZmlsZV9faWNvbiB7XG4gICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICAgIHdpZHRoOiAxNnB4O1xuICAgIGhlaWdodDogMTZweDtcbiAgICB2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlO1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICB0ZXh0LWFsaWduOiBsZWZ0O1xuICB9XG5cbiAgLmYtYnV0dG9uLWZpbGVfX2xpbmsge1xuICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgIG1hcmdpbi1yaWdodDogMmVtO1xuICAgIG1hcmdpbi1sZWZ0OiAxNnB4O1xuICAgIHBhZGRpbmctbGVmdDogMC4yNWVtO1xuICAgIGxpbmUtaGVpZ2h0OiAxLjY7XG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xuICAgIHdvcmQtYnJlYWs6IGJyZWFrLWFsbDtcbiAgfVxuXG4gIC5mLWJ1dHRvbi1maWxlX19mb2xkZXIge1xuICAgIGxpc3Qtc3R5bGU6IG5vbmU7XG4gICAgbWFyZ2luLWxlZnQ6IDA7XG4gICAgcGFkZGluZy1sZWZ0OiAwLjVlbTtcbiAgfVxuXG4gIC5mLWJ1dHRvbi1maWxlX19mb2xkZXItaGVhZGVyIHtcbiAgICBmb250LXdlaWdodDogYm9sZDtcbiAgICBtYXJnaW4tbGVmdDogMS41ZW07XG4gIH1cblxuICAuZi1idXR0b24tZmlsZV9fZm9sZGVyLWhlYWRlciAuZi1idXR0b24taWNvbl9fZm9sZGVyIHtcbiAgICBtYXJnaW4tbGVmdDogLTEuNWVtO1xuICB9XG5cbiAgLmYtYnV0dG9uLWZpbGVfX2ZvbGRlci0tcm9vdCB7XG4gICAgcGFkZGluZy1sZWZ0OiAwO1xuICB9XG5cbiAgLmYtYnV0dG9uLWZpbGVfX2NvbW1lbnQtY291bnQge1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICByaWdodDogMDtcbiAgICBtYXgtd2lkdGg6IDJlbTtcbiAgICBwYWRkaW5nLXJpZ2h0OiAxZW07XG4gICAgdGV4dC1hbGlnbjogcmlnaHQ7XG4gICAgZm9udC13ZWlnaHQ6IGJvbGQ7XG4gICAgbGluZS1oZWlnaHQ6IDEuNjtcbiAgfVxuXG4gIC5mLWJ1dHRvbi1maWxlX19pY29uLmYtYnV0dG9uLWljb25fX2ZpbGUgICB7IGxpbmUtaGVpZ2h0OiBpbmhlcml0OyBtYXJnaW4tdG9wOiAxcHg7IH1cbiAgLmYtYnV0dG9uLWZpbGVfX2ljb24uZi1idXR0b24taWNvbl9fZm9sZGVyIHsgbWFyZ2luLXRvcDogMnB4OyB9XG4qL30udG9TdHJpbmcoKS5yZXBsYWNlKCdmdW5jdGlvbiAoKSB7LyonLCAnJykucmVwbGFjZSgnKi99JywgJycpOyIsImltcG9ydCB7IFRyZWVWaWV3LCBjbGFzc1NldCwgY29weVRvQ2xpcGJvYXJkIH0gZnJvbSAnLi91dGlscyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEdlcnJpdEZCdXR0b25VSSgkKSB7XG4gIHZhciBIQVNfU0NST0xMX0lOVE9fVklFVyA9IChcbiAgICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgIHR5cGVvZiBIVE1MRWxlbWVudC5wcm90b3R5cGUuc2Nyb2xsSW50b1ZpZXdJZk5lZWRlZCA9PT0gJ2Z1bmN0aW9uJ1xuICApO1xuXG4gIHZhciAkZnJhbWUgPSAkKCc8ZGl2IC8+JywgeyAnY2xhc3MnOiAnZi1idXR0b25fX2ZyYW1lJyB9KTtcbiAgdmFyICRjb250YWluZXIsICRhY3RpdmVSb3c7XG5cbiAgcmV0dXJuIHtcbiAgICBub2RlOiAkZnJhbWVbMF0sXG5cbiAgICBwcm9wczoge1xuICAgICAgZmlsZXM6IFtdLFxuICAgICAgY3VycmVudEZpbGU6IG51bGwsXG4gICAgICBjb21tZW50ZWRPbmx5OiBmYWxzZSxcbiAgICAgIGhpZGVJblVuaWZpZWRNb2RlOiBmYWxzZSxcbiAgICAgIGRpc3BsYXlBc092ZXJsYXk6IGZhbHNlLFxuICAgICAgZGlzcGxheUFzVHJlZTogdHJ1ZSxcbiAgICAgIG9uVG9nZ2xlSGlkZUluVW5pZmllZE1vZGU6IEZ1bmN0aW9uLnByb3RvdHlwZSxcbiAgICAgIG9uVG9nZ2xlRGlzcGxheUFzT3ZlcmxheTogRnVuY3Rpb24ucHJvdG90eXBlLFxuICAgIH0sXG5cbiAgICBpc01vdW50ZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICRmcmFtZS5wYXJlbnQoKS5sZW5ndGggPT09IDE7XG4gICAgfSxcblxuICAgIG1vdW50OiBmdW5jdGlvbihfY29udGFpbmVyKSB7XG4gICAgICAkY29udGFpbmVyID0gJChfY29udGFpbmVyIHx8IGRvY3VtZW50LmJvZHkpO1xuXG4gICAgICAkY29udGFpbmVyLmFkZENsYXNzKCdnZXJyaXQtLXdpdGgtZi1idXR0b24nKTtcbiAgICAgICRjb250YWluZXIuYXBwZW5kKCRmcmFtZSk7XG5cbiAgICAgIHRoaXMuY29tcG9uZW50RGlkUmVuZGVyKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNob3cgb3IgaGlkZSB0aGUgRiBidXR0b24gZnJhbWUuXG4gICAgICovXG4gICAgdG9nZ2xlOiBmdW5jdGlvbihjb250YWluZXIpIHtcbiAgICAgIGlmICh0aGlzLmlzTW91bnRlZCgpKSB7XG4gICAgICAgIHRoaXMudW5tb3VudChjb250YWluZXIpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMubW91bnQoY29udGFpbmVyKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgdW5tb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAkZnJhbWUuZGV0YWNoKCk7XG4gICAgICAkY29udGFpbmVyLnJlbW92ZUNsYXNzKCdnZXJyaXQtLXdpdGgtZi1idXR0b24nKTtcbiAgICAgICRjb250YWluZXIucmVtb3ZlQ2xhc3MoJ2dlcnJpdC0td2l0aC1mLWJ1dHRvbi1vdmVybGF5Jyk7XG4gICAgICAkY29udGFpbmVyID0gbnVsbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlIHRoZSBGIGJ1dHRvbiB3aXRoIG5ldyBwYXJhbWV0ZXJzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHByb3BzXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge09iamVjdFtdfSBwcm9wcy5maWxlc1xuICAgICAqICAgICAgICBUaGUgbGlzdCBvZiBwYXRjaC1zZXQgZmlsZXMgd2l0aCBvciB3aXRob3V0IGNvbW1lbnQgZGF0YS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wcy5jdXJyZW50RmlsZVxuICAgICAqICAgICAgICBGaWxlIHBhdGggb2YgdGhlIGZpbGUgYmVpbmcgY3VycmVudGx5IGJyb3dzZWQgaW4gZ2Vycml0LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBwcm9wcy5jb21tZW50ZWRPbmx5XG4gICAgICogICAgICAgIFdoZXRoZXIgdG8gbGlzdCBvbmx5IHRoZSBmaWxlcyB0aGF0IGhhdmUgY29tbWVudHMuXG4gICAgICovXG4gICAgc2V0UHJvcHM6IGZ1bmN0aW9uKHByb3BzKSB7XG4gICAgICBPYmplY3Qua2V5cyhwcm9wcykuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgdGhpcy5wcm9wc1trZXldID0gcHJvcHNba2V5XTtcbiAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgY29tcG9uZW50RGlkUmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIFNjcm9sbCB0aGUgYWN0aXZlIHJvdyBpbnRvIHZpZXcsIHZlcnkgaGFuZHkgd2hlbiB0aGUgUFMgaGFzIG1hbnkgZmlsZXMuXG4gICAgICBpZiAoJGFjdGl2ZVJvdyAmJiBIQVNfU0NST0xMX0lOVE9fVklFVykge1xuICAgICAgICAkYWN0aXZlUm93WzBdLnNjcm9sbEludG9WaWV3SWZOZWVkZWQoKTtcbiAgICAgIH1cblxuICAgICAgJGZyYW1lLnRvZ2dsZUNsYXNzKCdmLWJ1dHRvbl9fZnJhbWUtLWxpc3QtdmlldycsICF0aGlzLnByb3BzLmRpc3BsYXlBc1RyZWUpO1xuXG4gICAgICBpZiAoJGNvbnRhaW5lcikge1xuICAgICAgICAkY29udGFpbmVyLnRvZ2dsZUNsYXNzKCdnZXJyaXQtLXdpdGgtZi1idXR0b24tb3ZlcmxheScsIHRoaXMucHJvcHMuZGlzcGxheUFzT3ZlcmxheSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciAkZmlsZXMgPSB0aGlzLnJlbmRlckZpbGVzKHRoaXMucHJvcHMuZmlsZXMsIHRoaXMucHJvcHMuY3VycmVudEZpbGUpO1xuICAgICAgdmFyICRjb250cm9scyA9IHRoaXMucmVuZGVyQ29udHJvbHMoKTtcblxuICAgICAgJGZyYW1lXG4gICAgICAgIC5lbXB0eSgpXG4gICAgICAgIC5hcHBlbmQoJGNvbnRyb2xzKVxuICAgICAgICAuYXBwZW5kKCRmaWxlcylcbiAgICAgICAgLnRvZ2dsZUNsYXNzKCdmLWJ1dHRvbl9fZnJhbWUtLWNvbW1lbnRlZC1vbmx5JywgdGhpcy5wcm9wcy5jb21tZW50ZWRPbmx5KVxuICAgICAgO1xuXG4gICAgICB0aGlzLmNvbXBvbmVudERpZFJlbmRlcigpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHJlbmRlckZpbGVzOiBmdW5jdGlvbihmaWxlcywgY3VycmVudEZpbGUpIHtcbiAgICAgIHZhciAkbGlzdCA9ICQoJzxkaXYgLz4nLCB7ICdjbGFzcyc6ICdmLWJ1dHRvbl9fdGFibGUnIH0pO1xuICAgICAgdmFyIGZpbGVUcmVlID0gVHJlZVZpZXcoZmlsZXMpO1xuXG4gICAgICAkYWN0aXZlUm93ID0gbnVsbDtcbiAgICAgICRsaXN0LmFwcGVuZCh0aGlzLnJlbmRlckZpbGVUcmVlKGZpbGVUcmVlLCBjdXJyZW50RmlsZSwgdHJ1ZSkpO1xuXG4gICAgICByZXR1cm4gJGxpc3Q7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcmVuZGVyRmlsZVRyZWU6IGZ1bmN0aW9uKHRyZWUsIGN1cnJlbnRGaWxlLCBpc1Jvb3QpIHtcbiAgICAgIHZhciAkbGlzdCA9ICQoJzxvbCAvPicsIHtcbiAgICAgICAgY2xhc3M6IGNsYXNzU2V0KHtcbiAgICAgICAgICAnZi1idXR0b24tZmlsZV9fZm9sZGVyJzogdHJ1ZSxcbiAgICAgICAgICAnZi1idXR0b24tZmlsZV9fZm9sZGVyLS1yb290JzogaXNSb290ID09PSB0cnVlXG4gICAgICAgIH0pXG4gICAgICB9KTtcblxuICAgICAgLy8gZm9sZGVyczpcbiAgICAgIE9iamVjdC5rZXlzKHRyZWUuY2hpbGRyZW4pLnNvcnQoKS5mb3JFYWNoKGZ1bmN0aW9uKGJyYW5jaCkge1xuICAgICAgICB2YXIgJGNoaWxkcmVuID0gdGhpcy5yZW5kZXJGaWxlVHJlZSh0cmVlLmNoaWxkcmVuW2JyYW5jaF0sIGN1cnJlbnRGaWxlKTtcblxuICAgICAgICBpZiAoISRjaGlsZHJlbikge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyICRmb2xkZXJIZWFkZXIgPSAkKCc8aGVhZGVyIC8+JywgeyBjbGFzczogJ2YtYnV0dG9uLWZpbGVfX2ZvbGRlci1oZWFkZXInIH0pO1xuXG4gICAgICAgICRmb2xkZXJIZWFkZXIuYXBwZW5kKFxuICAgICAgICAgICQoJzxzcGFuIC8+JywgeyBjbGFzczogJ2YtYnV0dG9uLWZpbGVfX2ljb24gZi1idXR0b24taWNvbl9fZm9sZGVyJyB9KVxuICAgICAgICApO1xuXG4gICAgICAgICRmb2xkZXJIZWFkZXIuYXBwZW5kKCQoJzxzcGFuIC8+JykudGV4dChicmFuY2ggKyAnLycpKTtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICQoJzxsaSAvPicpXG4gICAgICAgICAgICAuYXBwZW5kKCRmb2xkZXJIZWFkZXIpXG4gICAgICAgICAgICAuYXBwZW5kKCRjaGlsZHJlbilcbiAgICAgICAgICAgIC5hcHBlbmRUbygkbGlzdClcbiAgICAgICAgKTtcbiAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgIC8vIGZpbGVzOlxuICAgICAgdHJlZS5pdGVtcy5mb3JFYWNoKGZ1bmN0aW9uKGZpbGUpIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuY29tbWVudGVkT25seSAmJiAoIWZpbGUuY29tbWVudHMgfHwgIWZpbGUuY29tbWVudHMubGVuZ3RoKSkge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgJGxpc3QuYXBwZW5kKHRoaXMucmVuZGVyRmlsZShmaWxlLCBjdXJyZW50RmlsZSkpO1xuICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgcmV0dXJuICRsaXN0LmNoaWxkcmVuKCkubGVuZ3RoID09PSAwID8gbnVsbCA6ICRsaXN0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHJlbmRlckZpbGU6IGZ1bmN0aW9uKGZpbGUsIGN1cnJlbnRGaWxlKSB7XG4gICAgICB2YXIgZmlsZVBhdGggPSBmaWxlLmZpbGVQYXRoO1xuICAgICAgdmFyIGZpbGVOYW1lID0gdGhpcy5wcm9wcy5kaXNwbGF5QXNUcmVlID9cbiAgICAgICAgZmlsZS5maWxlUGF0aC5zcGxpdCgnLycpLnNsaWNlKC0xKVswXSA6XG4gICAgICAgIGZpbGUuZmlsZVBhdGhcbiAgICAgIDtcblxuICAgICAgdmFyIGhhc0NvbW1lbnRzID0gZmlsZS5jb21tZW50cyAmJiBmaWxlLmNvbW1lbnRzLmxlbmd0aCA+IDA7XG4gICAgICB2YXIgJHJvdyA9ICQoJzxsaSAvPicsIHtcbiAgICAgICAgY2xhc3M6IGNsYXNzU2V0KHtcbiAgICAgICAgICAnZi1idXR0b24tZmlsZSc6IHRydWUsXG4gICAgICAgICAgJ2YtYnV0dG9uLWZpbGUtLWFjdGl2ZSc6IGN1cnJlbnRGaWxlID09PSBmaWxlUGF0aCxcbiAgICAgICAgICAnZi1idXR0b24tZmlsZS0tY29tbWVudGVkJzogaGFzQ29tbWVudHNcbiAgICAgICAgfSlcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoY3VycmVudEZpbGUgPT09IGZpbGVQYXRoKSB7XG4gICAgICAgICRhY3RpdmVSb3cgPSAkcm93O1xuICAgICAgfVxuXG4gICAgICAkcm93LmFwcGVuZChcbiAgICAgICAgJCgnPHNwYW4gLz4nLCB7XG4gICAgICAgICAgY2xhc3M6ICdmLWJ1dHRvbi1maWxlX19jb21tZW50LWNvdW50J1xuICAgICAgICB9KS50ZXh0KGhhc0NvbW1lbnRzID8gZmlsZS5jb21tZW50cy5sZW5ndGggOiAnJylcbiAgICAgICk7XG5cbiAgICAgICRyb3cuYXBwZW5kKFxuICAgICAgICAkKCc8c3BhbiAvPicsIHtcbiAgICAgICAgICBjbGFzczogJ2YtYnV0dG9uLWljb25fX2ZpbGUgZi1idXR0b24tZmlsZV9faWNvbicsXG4gICAgICAgICAgdGl0bGU6ICdDb3B5IGZpbGVwYXRoIHRvIGNsaXBib2FyZCdcbiAgICAgICAgfSkuYmluZCgnY2xpY2snLCB0aGlzLmNvcHlUb0NsaXBib2FyZC5iaW5kKHRoaXMsIGZpbGVQYXRoKSlcbiAgICAgICk7XG5cbiAgICAgICRyb3cuYXBwZW5kKFxuICAgICAgICAkKCc8YSAvPicsIHtcbiAgICAgICAgICBocmVmOiBmaWxlLnVybCxcbiAgICAgICAgICBjbGFzczogJ2YtYnV0dG9uLWZpbGVfX2xpbmsnXG4gICAgICAgIH0pLnRleHQoZmlsZU5hbWUpXG4gICAgICApO1xuXG4gICAgICByZXR1cm4gJHJvdztcbiAgICB9LFxuXG4gICAgcmVuZGVyRmlsZUNvbW1lbnRzOiBmdW5jdGlvbihjb21tZW50cykge1xuICAgICAgdmFyICRjb21tZW50cyA9ICQoJzxvbCAvPicsIHsgY2xhc3M6ICdmLWJ1dHRvbi1maWxlX19jb21tZW50cycgfSk7XG5cbiAgICAgIGNvbW1lbnRzLmZvckVhY2goZnVuY3Rpb24oY29tbWVudCkge1xuICAgICAgICAkY29tbWVudHMuYXBwZW5kKFxuICAgICAgICAgICQoJzxsaSAvPicpLnRleHQoXG4gICAgICAgICAgICAnWycgKyBjb21tZW50LmF1dGhvci51c2VybmFtZSArICddICcgKyBjb21tZW50Lm1lc3NhZ2VcbiAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuICRjb21tZW50cztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICByZW5kZXJDb250cm9sczogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgJGNvbnRyb2xzID0gJCgnPGRpdiAvPicsIHtcbiAgICAgICAgY2xhc3M6ICdmLWJ1dHRvbl9fY29udHJvbHMnXG4gICAgICB9KTtcblxuICAgICAgJCgnPGxhYmVsIC8+JylcbiAgICAgICAgLmFwcGVuZCgkKCc8aW5wdXQgLz4nLCB7IHR5cGU6ICdjaGVja2JveCcsIGNoZWNrZWQ6IHRoaXMucHJvcHMuY29tbWVudGVkT25seSB9KSlcbiAgICAgICAgLmFwcGVuZCgkKCc8c3BhbiAvPicpLnRleHQoJ0hpZGUgZmlsZXMgd2l0aCBubyBjb21tZW50cycpKVxuICAgICAgICAuYXBwZW5kVG8oJGNvbnRyb2xzKVxuICAgICAgICAuYmluZCgnY2xpY2snLCB0aGlzLnRvZ2dsZUNvbW1lbnRlZC5iaW5kKHRoaXMpKVxuICAgICAgO1xuXG4gICAgICAkKCc8bGFiZWwgLz4nKVxuICAgICAgICAuYXBwZW5kKFxuICAgICAgICAgICQoJzxpbnB1dCAvPicsIHsgdHlwZTogJ2NoZWNrYm94JywgY2hlY2tlZDogdGhpcy5wcm9wcy5oaWRlSW5VbmlmaWVkTW9kZSB9KVxuICAgICAgICAgIC5iaW5kKCdjaGFuZ2UnLCB0aGlzLnRvZ2dsZUhpZGVJblVuaWZpZWRNb2RlLmJpbmQodGhpcykpXG4gICAgICAgIClcbiAgICAgICAgLmFwcGVuZCgkKCc8c3BhbiAvPicpLnRleHQoJ0Rpc2FibGUgaW4gVW5pZmllZCBEaWZmIHZpZXcnKSlcbiAgICAgICAgLmFwcGVuZFRvKCRjb250cm9scylcbiAgICAgIDtcblxuICAgICAgJCgnPGxhYmVsIC8+JylcbiAgICAgICAgLmFwcGVuZChcbiAgICAgICAgICAkKCc8aW5wdXQgLz4nLCB7IHR5cGU6ICdjaGVja2JveCcsIGNoZWNrZWQ6IHRoaXMucHJvcHMuZGlzcGxheUFzT3ZlcmxheSB9KVxuICAgICAgICAgIC5iaW5kKCdjaGFuZ2UnLCB0aGlzLnRvZ2dsZURpc3BsYXlBc092ZXJsYXkuYmluZCh0aGlzKSlcbiAgICAgICAgKVxuICAgICAgICAuYXBwZW5kKCQoJzxzcGFuIC8+JykudGV4dCgnRGlzcGxheSBhcyBvdmVybGF5JykpXG4gICAgICAgIC5hcHBlbmRUbygkY29udHJvbHMpXG4gICAgICA7XG5cbiAgICAgICQoJzxsYWJlbCAvPicpXG4gICAgICAgIC5hcHBlbmQoXG4gICAgICAgICAgJCgnPGlucHV0IC8+JywgeyB0eXBlOiAnY2hlY2tib3gnLCBjaGVja2VkOiB0aGlzLnByb3BzLmRpc3BsYXlBc1RyZWUgfSlcbiAgICAgICAgICAuYmluZCgnY2hhbmdlJywgdGhpcy50b2dnbGVEaXNwbGF5QXNUcmVlLmJpbmQodGhpcykpXG4gICAgICAgIClcbiAgICAgICAgLmFwcGVuZCgkKCc8c3BhbiAvPicpLnRleHQoJ0Rpc3BsYXkgZmlsZXMgYXMgYSB0cmVlJykpXG4gICAgICAgIC5hcHBlbmRUbygkY29udHJvbHMpXG4gICAgICA7XG5cbiAgICAgIHJldHVybiAkY29udHJvbHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICpcbiAgICAgKiBDb3B5IGEgZmlsZXBhdGggdG8gdGhlIGNsaXBib2FyZC5cbiAgICAgKi9cbiAgICBjb3B5VG9DbGlwYm9hcmQ6IGZ1bmN0aW9uKGZpbGVQYXRoLyosIGUqLykge1xuICAgICAgY29weVRvQ2xpcGJvYXJkKGZpbGVQYXRoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0b2dnbGVDb21tZW50ZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRQcm9wcyh7IGNvbW1lbnRlZE9ubHk6ICF0aGlzLnByb3BzLmNvbW1lbnRlZE9ubHkgfSk7XG4gICAgfSxcblxuICAgIHRvZ2dsZUhpZGVJblVuaWZpZWRNb2RlOiBmdW5jdGlvbihlKSB7XG4gICAgICB0aGlzLnByb3BzLm9uVG9nZ2xlSGlkZUluVW5pZmllZE1vZGUoZS50YXJnZXQuY2hlY2tlZCk7XG4gICAgfSxcblxuICAgIHRvZ2dsZURpc3BsYXlBc092ZXJsYXk6IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHRoaXMucHJvcHMub25Ub2dnbGVEaXNwbGF5QXNPdmVybGF5KGUudGFyZ2V0LmNoZWNrZWQpO1xuICAgIH0sXG5cbiAgICB0b2dnbGVEaXNwbGF5QXNUcmVlOiBmdW5jdGlvbihlKSB7XG4gICAgICB0aGlzLnByb3BzLm9uVG9nZ2xlRGlzcGxheUFzVHJlZShlLnRhcmdldC5jaGVja2VkKTtcbiAgICB9LFxuICB9O1xufSIsImltcG9ydCB7IGRpc2NhcmRMZWFkaW5nU2xhc2gsIGluamVjdENTUyB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IFN0eWxlcyBmcm9tICcuL3N0eWxlcyc7XG5pbXBvcnQgR2Vycml0RkJ1dHRvblVJIGZyb20gJy4vdWknO1xuXG52YXIgTlJfQUpBWF9DQUxMUyA9IDI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEdlcnJpdEZCdXR0b24oKSB7XG4gIHZhciBLQ19GID0gNzA7XG5cbiAgZnVuY3Rpb24gcGFyc2VDb250ZXh0RnJvbVVSTCh1cmwpIHtcbiAgICB2YXIgY3R4ID0ge307XG4gICAgdmFyIG1hdGNoQ2hhbmdlID0gdXJsLm1hdGNoKC9eXFwvY1xcLyhcXGQrKS8pO1xuICAgIHZhciBtYXRjaFJldmlzaW9uID0gdXJsLm1hdGNoKC9eXFwvY1xcL1xcZCtcXC8oXFxkKykvKTtcbiAgICB2YXIgbWF0Y2hGaWxlID0gdXJsLm1hdGNoKC9eXFwvY1xcL1xcZCtcXC9cXGQrXFwvKC4rKS8pO1xuXG4gICAgY3R4LmNoTnVtYmVyID0gbWF0Y2hDaGFuZ2UgPyBtYXRjaENoYW5nZVsxXSA6IG51bGw7XG4gICAgY3R4LnJ2TnVtYmVyID0gbWF0Y2hSZXZpc2lvbiA/IG1hdGNoUmV2aXNpb25bMV0gOiBudWxsO1xuICAgIGN0eC5jdXJyZW50RmlsZSA9IG1hdGNoRmlsZSA/IG1hdGNoRmlsZVsxXSA6IG51bGw7XG5cbiAgICByZXR1cm4gY3R4O1xuICB9XG5cbiAgLyoqXG4gICAqIERvd25sb2FkIHRoZSBmaWxlcyBmb3IgdGhlIGdpdmVuIGNoYW5nZS9yZXZpc2lvbiBjb21ibyBhbmQgYW55IGNvbW1lbnRzIGZvclxuICAgKiB0aGVtLlxuICAgKlxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9ICAgY2hOdW1iZXJcbiAgICogQHBhcmFtICB7TnVtYmVyfSAgIHJ2TnVtYmVyXG4gICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBkb25lXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0W119IGRvbmUuZmlsZXNcbiAgICogICAgICAgIEEgaGFzaCBvZiBmaWxlLW5hbWVzIGFuZCB0aGVpciBpbmZvLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gZG9uZS5maWxlc1tdLnVybFxuICAgKiAgICAgICAgVGhlIFVSTCBmb3IgdGhlIGZpbGUtZGlmZiBwYWdlIGZvciB0aGlzIGZpbGUuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0W119IGRvbmUuZmlsZXNbXS5jb21tZW50c1xuICAgKiAgICAgICAgVGhlIGxpc3Qgb2YgY29tbWVudHMgZm9yIHRoaXMgZmlsZS5cbiAgICovXG4gIGZ1bmN0aW9uIGZldGNoKGNoTnVtYmVyLCBydk51bWJlciwgZG9uZSkge1xuICAgIHZhciBmaWxlcyA9IFtdO1xuICAgIHZhciBCQVNFX1VSTCA9IFsgJy9jaGFuZ2VzJywgY2hOdW1iZXIsICdyZXZpc2lvbnMnLCBydk51bWJlciBdLmpvaW4oJy8nKTtcbiAgICB2YXIgY2FsbHNEb25lID0gMDtcblxuICAgIGZ1bmN0aW9uIHNldChmaWxlUGF0aCwgaXRlbSwgdmFsdWUpIHtcbiAgICAgIHZhciBmaWxlRW50cnkgPSBmaWxlcy5maWx0ZXIoZnVuY3Rpb24oZW50cnkpIHtcbiAgICAgICAgcmV0dXJuIGVudHJ5LmZpbGVQYXRoID09PSBmaWxlUGF0aDtcbiAgICAgIH0pWzBdO1xuXG4gICAgICBpZiAoIWZpbGVFbnRyeSkge1xuICAgICAgICBmaWxlRW50cnkgPSB7IGZpbGVQYXRoOiBmaWxlUGF0aCB9O1xuICAgICAgICBmaWxlcy5wdXNoKGZpbGVFbnRyeSk7XG4gICAgICB9XG5cbiAgICAgIGZpbGVFbnRyeVtpdGVtXSA9IHZhbHVlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRpY2soKSB7XG4gICAgICBpZiAoKytjYWxsc0RvbmUgPT09IE5SX0FKQVhfQ0FMTFMpIHtcbiAgICAgICAgZG9uZShmaWxlcyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0VXJsRm9yRmlsZShmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgJy8jL2MvJyArIGNoTnVtYmVyICsgJy8nICsgcnZOdW1iZXIgKyAnLycgKyBkaXNjYXJkTGVhZGluZ1NsYXNoKGZpbGVQYXRoKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRSZW1vdGUodXJsLCBjYWxsYmFjaykge1xuICAgICAgd2luZG93LiQuYWpheCh7XG4gICAgICAgIHVybDogQkFTRV9VUkwgKyB1cmwsXG4gICAgICAgIHR5cGU6ICdHRVQnLFxuICAgICAgICBkYXRhVHlwZTogJ3RleHQnLFxuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihyZXNwKSB7XG4gICAgICAgICAgY2FsbGJhY2soSlNPTi5wYXJzZShyZXNwLnN1YnN0cihcIildfSdcIi5sZW5ndGgpKSk7XG4gICAgICAgICAgdGljaygpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXRSZW1vdGUoJy9maWxlcycsIGZ1bmN0aW9uKHJ2RmlsZXMpIHtcbiAgICAgIE9iamVjdC5rZXlzKHJ2RmlsZXMpLmZvckVhY2goZnVuY3Rpb24oX2ZpbGVQYXRoKSB7XG4gICAgICAgIHZhciBmaWxlUGF0aCA9IGRpc2NhcmRMZWFkaW5nU2xhc2goX2ZpbGVQYXRoKTtcbiAgICAgICAgc2V0KGZpbGVQYXRoLCAndXJsJywgZ2V0VXJsRm9yRmlsZShmaWxlUGF0aCkpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBnZXRSZW1vdGUoJy9jb21tZW50cycsIGZ1bmN0aW9uKHJ2RmlsZUNvbW1lbnRzKSB7XG4gICAgICBPYmplY3Qua2V5cyhydkZpbGVDb21tZW50cykuZm9yRWFjaChmdW5jdGlvbihfZmlsZVBhdGgpIHtcbiAgICAgICAgdmFyIGZpbGVQYXRoID0gZGlzY2FyZExlYWRpbmdTbGFzaChfZmlsZVBhdGgpO1xuICAgICAgICBzZXQoZmlsZVBhdGgsICdjb21tZW50cycsIHJ2RmlsZUNvbW1lbnRzW2ZpbGVQYXRoXSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzSW5VbmlmaWVkTW9kZSgpIHtcbiAgICByZXR1cm4gISFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZ2Vycml0Qm9keSAudW5pZmllZFRhYmxlJyk7XG4gIH1cblxuICBmdW5jdGlvbiBzaG91bGRIaWRlSW5VbmlmaWVkTW9kZSgpIHtcbiAgICByZXR1cm4gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ0dFUlJJVF9GX0JVVFRPTi9ISURFX0lOX1VOSUZJRURfTU9ERScpID09PSAnMSc7XG4gIH1cblxuICBmdW5jdGlvbiBzaG91bGREaXNwbGF5QXNPdmVybGF5KCkge1xuICAgIHJldHVybiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnR0VSUklUX0ZfQlVUVE9OL0RJU1BMQVlfQVNfT1ZFUkxBWScpID09PSAnMSc7XG4gIH1cblxuICBmdW5jdGlvbiBzaG91bGREaXNwbGF5QXNUcmVlKCkge1xuICAgIHJldHVybiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnR0VSUklUX0ZfQlVUVE9OL0RJU1BMQVlfQVNfTElTVCcpICE9PSAnMSc7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGluc3RhbGw6IGZ1bmN0aW9uKEdlcnJpdCwgJCkge1xuICAgICAgdmFyIHVpID0gR2Vycml0RkJ1dHRvblVJKCQpO1xuICAgICAgdmFyIGNvbnRleHQsIGNhY2hlZEZpbGVzO1xuXG4gICAgICB1aS5zZXRQcm9wcyh7XG4gICAgICAgIGhpZGVJblVuaWZpZWRNb2RlOiBzaG91bGRIaWRlSW5VbmlmaWVkTW9kZSgpLFxuICAgICAgICBkaXNwbGF5QXNPdmVybGF5OiBzaG91bGREaXNwbGF5QXNPdmVybGF5KCksXG4gICAgICAgIGRpc3BsYXlBc1RyZWU6IHNob3VsZERpc3BsYXlBc1RyZWUoKSxcblxuICAgICAgICBvblRvZ2dsZUhpZGVJblVuaWZpZWRNb2RlOiBmdW5jdGlvbihjaGVja2VkKSB7XG4gICAgICAgICAgaWYgKGNoZWNrZWQpIHtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdHRVJSSVRfRl9CVVRUT04vSElERV9JTl9VTklGSUVEX01PREUnLCAnMScpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdHRVJSSVRfRl9CVVRUT04vSElERV9JTl9VTklGSUVEX01PREUnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB1aS5zZXRQcm9wcyh7XG4gICAgICAgICAgICBoaWRlSW5VbmlmaWVkTW9kZTogc2hvdWxkSGlkZUluVW5pZmllZE1vZGUoKVxuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uVG9nZ2xlRGlzcGxheUFzVHJlZTogZnVuY3Rpb24oY2hlY2tlZCkge1xuICAgICAgICAgIGlmIChjaGVja2VkKSB7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnR0VSUklUX0ZfQlVUVE9OL0RJU1BMQVlfQVNfTElTVCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdHRVJSSVRfRl9CVVRUT04vRElTUExBWV9BU19MSVNUJywgJzEnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB1aS5zZXRQcm9wcyh7XG4gICAgICAgICAgICBkaXNwbGF5QXNUcmVlOiBzaG91bGREaXNwbGF5QXNUcmVlKClcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBvblRvZ2dsZURpc3BsYXlBc092ZXJsYXk6IGZ1bmN0aW9uKGNoZWNrZWQpIHtcbiAgICAgICAgICBpZiAoY2hlY2tlZCkge1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ0dFUlJJVF9GX0JVVFRPTi9ESVNQTEFZX0FTX09WRVJMQVknLCAnMScpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdHRVJSSVRfRl9CVVRUT04vRElTUExBWV9BU19PVkVSTEFZJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdWkuc2V0UHJvcHMoe1xuICAgICAgICAgICAgZGlzcGxheUFzT3ZlcmxheTogc2hvdWxkRGlzcGxheUFzT3ZlcmxheSgpXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIGluamVjdENTUyhTdHlsZXMpO1xuXG4gICAgICAvLyBAZXZlbnQgJ3Nob3djaGFuZ2UnXG4gICAgICAvL1xuICAgICAgLy8gVGhpcyB3aWxsIGJlIHRyaWdnZXJlZCBldmVyeXRpbWUgdGhlIGNoYW5nZSdzIFwibGFuZGluZ1wiIHBhZ2UgaXNcbiAgICAgIC8vIHZpc2l0ZWQuXG4gICAgICAvL1xuICAgICAgLy8gU2VlIGh0dHBzOi8vZ2Vycml0LXJldmlldy5nb29nbGVzb3VyY2UuY29tL0RvY3VtZW50YXRpb24vanMtYXBpLmh0bWwjc2VsZl9vblxuICAgICAgLy9cbiAgICAgIC8vIEBwYXJhbSBjaEluZm9cbiAgICAgIC8vICAgU2VlIGh0dHBzOi8vZ2Vycml0LXJldmlldy5nb29nbGVzb3VyY2UuY29tL0RvY3VtZW50YXRpb24vcmVzdC1hcGktY2hhbmdlcy5odG1sI2NoYW5nZS1pbmZvXG4gICAgICAvL1xuICAgICAgLy8gQHBhcmFtIHJ2SW5mb1xuICAgICAgLy8gICBTZWUgaHR0cHM6Ly9nZXJyaXQtcmV2aWV3Lmdvb2dsZXNvdXJjZS5jb20vRG9jdW1lbnRhdGlvbi9yZXN0LWFwaS1jaGFuZ2VzLmh0bWwjcmV2aXNpb24taW5mb1xuICAgICAgR2Vycml0Lm9uKCdzaG93Y2hhbmdlJywgZnVuY3Rpb24oY2hJbmZvLCBydkluZm8pIHtcbiAgICAgICAgZmV0Y2hGaWxlc0FuZFJlbmRlcihjaEluZm8uX251bWJlciwgcnZJbmZvLl9udW1iZXIpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIEBldmVudCAnaGlzdG9yeSdcbiAgICAgIC8vXG4gICAgICAvLyBUaGlzIGlzIHRyaWdnZXJlZCBldmVyeXRpbWUgYSBuZXcgcGFnZSBpbiB0aGUgR2Vycml0IFVJIGlzIHZpc2l0ZWQ7XG4gICAgICAvLyB3ZSBhcmUgaW50ZXJlc3RlZCB3aXRoIHRoZSB2aXNpdHMgdG8gdGhlIGZpbGUtZGlmZiBwYWdlcyBiZWNhdXNlIHdlJ2RcbiAgICAgIC8vIGxpa2UgdG8gaGlnaGxpZ2h0IHRoZSBjdXJyZW50bHkgdmlld2VkIGZpbGUuXG4gICAgICAvL1xuICAgICAgLy8gU2VlIGh0dHBzOi8vZ2Vycml0LXJldmlldy5nb29nbGVzb3VyY2UuY29tL0RvY3VtZW50YXRpb24vanMtYXBpLmh0bWwjc2VsZl9vblxuICAgICAgR2Vycml0Lm9uKCdoaXN0b3J5JywgZnVuY3Rpb24odG9rZW4pIHtcbiAgICAgICAgY29udGV4dCA9IHBhcnNlQ29udGV4dEZyb21VUkwodG9rZW4pO1xuXG4gICAgICAgIGlmIChjb250ZXh0LmNoTnVtYmVyKSB7XG4gICAgICAgICAgLy8gVGhpcyBoYXBwZW5zIGlmIHRoZSBpbml0aWFsIFVSTCBpcyBub3QgdGhlIGNoYW5nZSdzIGxhbmRpbmcgcGFnZSwgYnV0XG4gICAgICAgICAgLy8gaW5zdGVhZCBhIGZpbGUtZGlmZiBwYWdlOyB0aGUgXCJzaG93Y2hhbmdlXCIgZXZlbnQgd291bGQgbm90IGJlIGVtaXR0ZWRcbiAgICAgICAgICAvLyBpbiB0aGlzIGNhc2UgYW5kIHRoZXJlJ3Mgbm8gd2F5IHRvIGdldCB0aGUgY2hhbmdlL3JldmlzaW9uIGluZm9ybWF0aW9uXG4gICAgICAgICAgLy8gYnV0IGZyb20gdGhlIFVSTC5cbiAgICAgICAgICBpZiAoIWNhY2hlZEZpbGVzKSB7XG4gICAgICAgICAgICBmZXRjaEZpbGVzQW5kUmVuZGVyKGNvbnRleHQuY2hOdW1iZXIsIGNvbnRleHQucnZOdW1iZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHsgLy8gbm8gbG9uZ2VyIGluIGEgY2hhbmdlPyB1bnRyYWNrIHRoZSBkb3dubG9hZGVkIGZpbGUgbGlzdGluZ1xuICAgICAgICAgIGNhY2hlZEZpbGVzID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICFjb250ZXh0LmNoTnVtYmVyIC8qIG5vdCB2aWV3aW5nIGEgY2hhbmdlPyBmb3JnZXQgaXQhICovIHx8XG4gICAgICAgICAgKGlzSW5VbmlmaWVkTW9kZSgpICYmIHNob3VsZEhpZGVJblVuaWZpZWRNb2RlKCkpXG4gICAgICAgICkge1xuICAgICAgICAgIGlmICh1aS5pc01vdW50ZWQoKSkge1xuICAgICAgICAgICAgdWkudW5tb3VudCgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChbIGUua2V5Q29kZSwgZS53aGljaCBdLmluZGV4T2YoS0NfRikgPiAtMSkge1xuICAgICAgICAgIGlmICghJChlLnRhcmdldCkuaXMoJ2lucHV0LCB0ZXh0YXJlYScpKSB7XG4gICAgICAgICAgICB1aS50b2dnbGUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBjb25zb2xlLmxvZygnZ2Vycml0LWYtYnV0dG9uOiBhY3RpdmUuJyk7XG5cbiAgICAgIGZ1bmN0aW9uIGZldGNoRmlsZXNBbmRSZW5kZXIoY2hOdW1iZXIsIHJ2TnVtYmVyKSB7XG4gICAgICAgIGZldGNoKGNoTnVtYmVyLCBydk51bWJlciwgZnVuY3Rpb24oZmlsZXMpIHtcbiAgICAgICAgICBjYWNoZWRGaWxlcyA9IGZpbGVzO1xuXG4gICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHVpLnNldFByb3BzKHtcbiAgICAgICAgICBmaWxlczogY2FjaGVkRmlsZXMsXG4gICAgICAgICAgY3VycmVudEZpbGU6IGNvbnRleHQuY3VycmVudEZpbGVcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufVxuIiwiaW1wb3J0IEdlcnJpdEZCdXR0b24gZnJvbSAnLi9jb3JlJztcbmltcG9ydCBHZXJyaXRGQnV0dG9uVUkgZnJvbSAnLi91aSc7XG5pbXBvcnQgR2Vycml0RkJ1dHRvblN0eWxlcyBmcm9tICcuL3N0eWxlcyc7XG5pbXBvcnQgeyBUcmVlVmlldywgaW5qZWN0Q1NTIH0gZnJvbSAnLi91dGlscyc7XG5cbi8vIEhUTUwgdGVzdHNcbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2Ygd2luZG93LkdlcnJpdEZCdXR0b24gIT09ICd1bmRlZmluZWQnKSB7XG4gIHdpbmRvdy5HZXJyaXRGQnV0dG9uLkNvcmUgPSBHZXJyaXRGQnV0dG9uO1xuICB3aW5kb3cuR2Vycml0RkJ1dHRvbi5TdHlsZXMgPSBHZXJyaXRGQnV0dG9uU3R5bGVzO1xuICB3aW5kb3cuR2Vycml0RkJ1dHRvbi5VSSA9IEdlcnJpdEZCdXR0b25VSTtcbiAgd2luZG93LkdlcnJpdEZCdXR0b24uaW5qZWN0Q1NTID0gaW5qZWN0Q1NTO1xufVxuLy8gbW9jaGEgdGVzdHNcbmVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gIGV4cG9ydHMuQ29yZSA9IEdlcnJpdEZCdXR0b247XG4gIGV4cG9ydHMuVUkgPSBHZXJyaXRGQnV0dG9uVUk7XG4gIGV4cG9ydHMuVHJlZVZpZXcgPSBUcmVlVmlldztcbn1cbi8vIEdlcnJpdCBlbnZcbmVsc2Uge1xuICB2YXIgZ2Vycml0RkJ1dHRvbiA9IG5ldyBHZXJyaXRGQnV0dG9uKCk7XG4gIHZhciBwb2xsZXIsIHRpbWVvdXQ7XG5cbiAgdGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgLy8gbm90ZTogdGhpcyBndWFyZCBpcyBub3QgbmVjZXNzYXJ5IG91dHNpZGUgb2YgZ3JlYXNlLW1vbmtleSdzIGNvbnRleHQgc2luY2VcbiAgICAvLyB0aGUgdGltZW91dCB3aWxsIGJlIGNsZWFyZWQgaWYgdGhlIHBvbGxlcidzIHRlc3Qgc3VjY2VlZHMuXG4gICAgaWYgKCFnZXJyaXRGQnV0dG9uLmluc3RhbGxlZCkge1xuICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgJ2dlcnJpdC1mLWJ1dHRvbjogb25lIG9mIHdpbmRvdy5HZXJyaXQgb3Igd2luZG93LmpRdWVyeSBpcyBub3QgcHJlc2VudDsnLFxuICAgICAgICAncGx1Z2luIHdpbGwgbm90IHdvcmsuJ1xuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBmb3Igc29tZSByZWFzb24sIHRoaXMgaXNuJ3Qgd29ya2luZyBpbiBHcmVhc2Vtb25rZXlcbiAgICBwb2xsZXIgPSBjbGVhckludGVydmFsKHBvbGxlcik7XG4gIH0sIDMwMDAwKTtcblxuICBwb2xsZXIgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICBpZiAod2luZG93LkdlcnJpdCAmJiB3aW5kb3cualF1ZXJ5KSB7XG4gICAgICBnZXJyaXRGQnV0dG9uLmluc3RhbGwod2luZG93LkdlcnJpdCwgd2luZG93LmpRdWVyeSk7XG5cbiAgICAgIC8vIGZvciBzb21lIHJlYXNvbiwgdGhpcyBpc24ndCB3b3JraW5nIGluIEdyZWFzZW1vbmtleVxuICAgICAgcG9sbGVyID0gY2xlYXJJbnRlcnZhbChwb2xsZXIpO1xuICAgICAgdGltZW91dCA9IGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICB9XG4gIH0sIDI1MCk7XG59Il0sIm5hbWVzIjpbIkdlcnJpdEZCdXR0b25TdHlsZXMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7RUFBQTtBQUNBLEFBQU8sRUFBQSxTQUFTLFFBQVEsQ0FBQyxRQUFRLEVBQUU7QUFDbkMsRUFBQSxFQUFFLElBQUksSUFBSSxHQUFHO0FBQ2IsRUFBQSxJQUFJLEtBQUssRUFBRSxFQUFFO0FBQ2IsRUFBQSxJQUFJLFFBQVEsRUFBRSxFQUFFO0FBQ2hCLEVBQUEsR0FBRyxDQUFDOztBQUVKLEVBQUEsRUFBRSxTQUFTLFNBQVMsQ0FBQyxJQUFJLEVBQUU7QUFDM0IsRUFBQSxJQUFJLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNqRixFQUFBLElBQUksSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDOztBQUV0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QUFFQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7O0FBRUEsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBOztBQUVBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTs7QUFFQSxFQUFBO0FBQ0EsRUFBQTs7QUFFQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTs7QUFFQSxFQUFBO0FBQ0EsRUFBQTs7QUFFQSxFQUFBO0FBQ0EsRUFBQTs7QUFFQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTs7QUFFQSxFQUFBO0FBQ0EsRUFBQTs7QUFFQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7O0FBRUEsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBOztBQUVBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTs7QUFFQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7O0FBRUEsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7O0FBRUEsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBOztBQUVBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTs7QUFFQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7O0FBRUEsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBOztBQUVBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBOztBQUVBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTs7QUFFQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTs7QUFFQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFB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R0FBRyxFQUFFLENBQUM7QUFDakIsRUFBQSxJQUFJLElBQUksV0FBVyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDL0MsRUFBQSxJQUFJLElBQUksYUFBYSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUN0RCxFQUFBLElBQUksSUFBSSxTQUFTLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDOztBQUV0RCxFQUFBLElBQUksR0FBRyxDQUFDLFFBQVEsR0FBRyxXQUFXLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUN2RCxFQUFBLElBQUksR0FBRyxDQUFDLFFBQVEsR0FBRyxhQUFhLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUMzRCxFQUFBLElBQUksR0FBRyxDQUFDLFdBQVcsR0FBRyxTQUFTLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQzs7QUFFdEQsRUFBQSxJQUFJLE9BQU8sR0FBRyxDQUFDO0FBQ2YsRUFBQSxHQUFHOztBQUVILEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQSxFQUFFLFNBQVMsS0FBSyxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFO0FBQzNDLEVBQUEsSUFBSSxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7QUFDbkIsRUFBQSxJQUFJLElBQUksUUFBUSxHQUFHLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzdFLEVBQUEsSUFB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
