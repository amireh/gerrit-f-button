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
        var fileName = file.filePath.split('/').slice(-1)[0];
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
      }
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

    return {
      install: function(Gerrit, $) {
        var ui = GerritFButtonUI($);
        var context, cachedFiles;

        ui.setProps({
          hideInUnifiedMode: shouldHideInUnifiedMode(),
          displayAsOverlay: shouldDisplayAsOverlay(),

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2Vycml0LWYtYnV0dG9uLmpzIiwic291cmNlcyI6WyJzcmMvdXRpbHMuanMiLCJzcmMvc3R5bGVzLmpzIiwic3JjL3VpLmpzIiwic3JjL2NvcmUuanMiLCJzcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gVXRpbHNcbmV4cG9ydCBmdW5jdGlvbiBUcmVlVmlldyhmaWxlTGlzdCkge1xuICB2YXIgdHJlZSA9IHtcbiAgICBpdGVtczogW10sXG4gICAgY2hpbGRyZW46IHt9XG4gIH07XG5cbiAgZnVuY3Rpb24gZ2V0QnJhbmNoKHBhdGgpIHtcbiAgICB2YXIgZnJhZ21lbnRzID0gcGF0aC5zcGxpdCgnLycpLmZpbHRlcihmdW5jdGlvbih4KSB7IHJldHVybiB4Lmxlbmd0aCA+IDA7IH0pO1xuICAgIHZhciBicmFuY2ggPSB0cmVlO1xuXG4gICAgZnJhZ21lbnRzLmZvckVhY2goZnVuY3Rpb24oZnJhZ21lbnQpIHtcbiAgICAgIGlmICghYnJhbmNoLmNoaWxkcmVuW2ZyYWdtZW50XSkge1xuICAgICAgICBicmFuY2guY2hpbGRyZW5bZnJhZ21lbnRdID0geyBpdGVtczogW10sIGNoaWxkcmVuOiB7fSB9O1xuICAgICAgfVxuXG4gICAgICBicmFuY2ggPSBicmFuY2guY2hpbGRyZW5bZnJhZ21lbnRdO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGJyYW5jaDtcbiAgfVxuXG4gIGZpbGVMaXN0LmZvckVhY2goZnVuY3Rpb24oZmlsZSkge1xuICAgIGdldEJyYW5jaChmaWxlLmZpbGVQYXRoLnNwbGl0KCcvJykuc2xpY2UoMCwgLTEpLmpvaW4oJy8nKSkuaXRlbXMucHVzaChmaWxlKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHRyZWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGFzc1NldChjbGFzc05hbWVzKSB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhjbGFzc05hbWVzKS5yZWR1Y2UoZnVuY3Rpb24oY2xhc3NOYW1lLCBrZXkpIHtcbiAgICByZXR1cm4gISFjbGFzc05hbWVzW2tleV0gPyAoY2xhc3NOYW1lICsgJyAnICsga2V5KSA6IGNsYXNzTmFtZTtcbiAgfSwgJycpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0Q1NTKHN0cmluZykge1xuICB2YXIgc3R5bGVOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcblxuICBzdHlsZU5vZGUuaW5uZXJIVE1MID0gc3RyaW5nO1xuXG4gIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGVOb2RlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc2NhcmRMZWFkaW5nU2xhc2gocykge1xuICByZXR1cm4gcy5yZXBsYWNlKC9eXFwvLywgJycpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29weVRvQ2xpcGJvYXJkKHN0cmluZykge1xuICAvLyBHcmVhc2VNb25rZXkgc2FuZGJveDpcbiAgaWYgKHR5cGVvZiBHTV9zZXRDbGlwYm9hcmQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgR01fc2V0Q2xpcGJvYXJkKHN0cmluZyk7XG4gIH1cbn0iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHsvKlxuICBAZm9udC1mYWNlIHtcbiAgICBmb250LWZhbWlseTogJ2dlcnJpdC1mLWJ1dHRvbic7XG4gICAgc3JjOlxuICAgICAgdXJsKGRhdGE6YXBwbGljYXRpb24vZm9udC13b2ZmO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LGQwOUdSZ0FCQUFBQUFBWWNBQXNBQUFBQUJkQUFBUUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFCUFV5OHlBQUFCQ0FBQUFHQUFBQUJnRHhJR2ttTnRZWEFBQUFGb0FBQUFYQUFBQUZ6cUpPcFBaMkZ6Y0FBQUFjUUFBQUFJQUFBQUNBQUFBQkJuYkhsbUFBQUJ6QUFBQWFBQUFBR2dta2FLczJobFlXUUFBQU5zQUFBQU5nQUFBRFlLbUFCcGFHaGxZUUFBQTZRQUFBQWtBQUFBSkFmQkE4aG9iWFI0QUFBRHlBQUFBQndBQUFBY0VnQUFRbXh2WTJFQUFBUGtBQUFBRUFBQUFCQUF5QUZVYldGNGNBQUFBL1FBQUFBZ0FBQUFJQUFMQURwdVlXMWxBQUFFRkFBQUFlWUFBQUhtaS9uNlJYQnZjM1FBQUFYOEFBQUFJQUFBQUNBQUF3QUFBQU1EZ0FHUUFBVUFBQUtaQXN3QUFBQ1BBcGtDekFBQUFlc0FNd0VKQUFBQUFBQUFBQUFBQUFBQUFBQUFBUkFBQUFBQUFBQUFBQUFBQUFBQUFBQUFRQUFBNmVnRHdQL0FBRUFEd0FCQUFBQUFBUUFBQUFBQUFBQUFBQUFBSUFBQUFBQUFBd0FBQUFNQUFBQWNBQUVBQXdBQUFCd0FBd0FCQUFBQUhBQUVBRUFBQUFBTUFBZ0FBZ0FFQUFFQUlPbWQ2ZWovL2YvL0FBQUFBQUFnNlozcDUvLzkvLzhBQWYvakZtY1dIZ0FEQUFFQUFBQUFBQUFBQUFBQUFBQUFBUUFCLy84QUR3QUJBQUFBQUFBQUFBQUFBZ0FBTnprQkFBQUFBQUVBQUFBQUFBQUFBQUFDQUFBM09RRUFBQUFBQVFBQUFBQUFBQUFBQUFJQUFEYzVBUUFBQUFBREFFRC93QVBBQThBQUdRQWhBRGNBQUFFdUFTY3VBU2N1QVNNaElnWVZFUlFXTXlFeU5qVVJOQ1luSng0QkZ5TTFIZ0VURkFZaklTSW1OUkUwTmpNd09nSXhGUlFXT3dFRGxoRXRHUm96RnljcEMvNFFJUzh2SVFMZ0lTOE9ISVVYSlEyYUVTbUdDUWY5SUFjSkNRZWJ1cHNURGVBQzJ4Y3pHaGt0RVJ3T0x5SDhvQ0V2THlFQ2NBc3BKellYS1JHYURTWDg2QWNKQ1FjRFlBY0o0QTBUQUFBQUFBSUFBUUJBQS84RGdBQVBBQnNBQUFFaElnWVhFeDRCTXlFeU5qY1ROaVluTkNZaklTY2pJZ1lkQVNFRDJQeFFGQmNFZGdNaUZBS2dGQ0lEZGdRWGJCd1UvbEFnMEJRY0F3QUN3QndUL2Q0VEhCd1RBaUlUSEZBVUhFQWNGRkFBQUFJQUFRQkFBLzhEZ0FBUEFCc0FBQUV5RmdjRERnRWpJU0ltSndNbU5qTWxGU0UxTkRZN0FSY2hNaFlEMkJRWEJIWURJaFQ5WUJRaUEzWUVGeE1EV2YwQUhCVFFJQUd3RkJ3Q1FCd1QvbDRUSEJ3VEFhSVRITkNRMEJRY1FCd0FBQUVBQUFBQkFBQzA2UjFMWHc4ODlRQUxCQUFBQUFBQTA3emQ5Z0FBQUFEVHZOMzJBQUQvd0FQL0E4QUFBQUFJQUFJQUFBQUFBQUFBQVFBQUE4RC93QUFBQkFBQUFBQUFBLzhBQVFBQUFBQUFBQUFBQUFBQUFBQUFBQWNFQUFBQUFBQUFBQUFBQUFBQ0FBQUFCQUFBUUFRQUFBRUVBQUFCQUFBQUFBQUtBQlFBSGdCd0FLQUEwQUFCQUFBQUJ3QTRBQU1BQUFBQUFBSUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFEZ0N1QUFFQUFBQUFBQUVBRHdBQUFBRUFBQUFBQUFJQUJ3Q29BQUVBQUFBQUFBTUFEd0JPQUFFQUFBQUFBQVFBRHdDOUFBRUFBQUFBQUFVQUN3QXRBQUVBQUFBQUFBWUFEd0I3QUFFQUFBQUFBQW9BR2dEcUFBTUFBUVFKQUFFQUhnQVBBQU1BQVFRSkFBSUFEZ0N2QUFNQUFRUUpBQU1BSGdCZEFBTUFBUVFKQUFRQUhnRE1BQU1BQVFRSkFBVUFGZ0E0QUFNQUFRUUpBQVlBSGdDS0FBTUFBUVFKQUFvQU5BRUVaMlZ5Y21sMExXWXRZblYwZEc5dUFHY0FaUUJ5QUhJQWFRQjBBQzBBWmdBdEFHSUFkUUIwQUhRQWJ3QnVWbVZ5YzJsdmJpQXhMakFBVmdCbEFISUFjd0JwQUc4QWJnQWdBREVBTGdBd1oyVnljbWwwTFdZdFluVjBkRzl1QUdjQVpRQnlBSElBYVFCMEFDMEFaZ0F0QUdJQWRRQjBBSFFBYndCdVoyVnljbWwwTFdZdFluVjBkRzl1QUdjQVpRQnlBSElBYVFCMEFDMEFaZ0F0QUdJQWRRQjBBSFFBYndCdVVtVm5kV3hoY2dCU0FHVUFad0IxQUd3QVlRQnlaMlZ5Y21sMExXWXRZblYwZEc5dUFHY0FaUUJ5QUhJQWFRQjBBQzBBWmdBdEFHSUFkUUIwQUhRQWJ3QnVSbTl1ZENCblpXNWxjbUYwWldRZ1lua2dTV052VFc5dmJpNEFSZ0J2QUc0QWRBQWdBR2NBWlFCdUFHVUFjZ0JoQUhRQVpRQmtBQ0FBWWdCNUFDQUFTUUJqQUc4QVRRQnZBRzhBYmdBdUFBQUFBd0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUE9PSkgZm9ybWF0KCd3b2ZmJyksXG4gICAgICB1cmwoZGF0YTphcHBsaWNhdGlvbi94LWZvbnQtdHRmO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LEFBRUFBQUFMQUlBQUF3QXdUMU12TWc4U0JwSUFBQUM4QUFBQVlHTnRZWERxSk9wUEFBQUJIQUFBQUZ4bllYTndBQUFBRUFBQUFYZ0FBQUFJWjJ4NVpwcEdpck1BQUFHQUFBQUJvR2hsWVdRS21BQnBBQUFESUFBQUFEWm9hR1ZoQjhFRHlBQUFBMWdBQUFBa2FHMTBlQklBQUVJQUFBTjhBQUFBSEd4dlkyRUF5QUZVQUFBRG1BQUFBQkJ0WVhod0FBc0FPZ0FBQTZnQUFBQWdibUZ0Wll2NStrVUFBQVBJQUFBQjVuQnZjM1FBQXdBQUFBQUZzQUFBQUNBQUF3T0FBWkFBQlFBQUFwa0N6QUFBQUk4Q21RTE1BQUFCNndBekFRa0FBQUFBQUFBQUFBQUFBQUFBQUFBQkVBQUFBQUFBQUFBQUFBQUFBQUFBQUFCQUFBRHA2QVBBLzhBQVFBUEFBRUFBQUFBQkFBQUFBQUFBQUFBQUFBQWdBQUFBQUFBREFBQUFBd0FBQUJ3QUFRQURBQUFBSEFBREFBRUFBQUFjQUFRQVFBQUFBQXdBQ0FBQ0FBUUFBUUFnNlozcDZQLzkvLzhBQUFBQUFDRHBuZW5uLy8zLy93QUIvK01XWnhZZUFBTUFBUUFBQUFBQUFBQUFBQUFBQUFBQkFBSC8vd0FQQUFFQUFBQUFBQUFBQUFBQ0FBQTNPUUVBQUFBQUFRQUFBQUFBQUFBQUFBSUFBRGM1QVFBQUFBQUJBQUFBQUFBQUFBQUFBZ0FBTnprQkFBQUFBQU1BUVAvQUE4QUR3QUFaQUNFQU53QUFBUzRCSnk0Qkp5NEJJeUVpQmhVUkZCWXpJVEkyTlJFMEppY25IZ0VYSXpVZUFSTVVCaU1oSWlZMUVUUTJNekE2QWpFVkZCWTdBUU9XRVMwWkdqTVhKeWtML2hBaEx5OGhBdUFoTHc0Y2hSY2xEWm9SS1lZSkIvMGdCd2tKQjV1Nm14TU40QUxiRnpNYUdTMFJIQTR2SWZ5Z0lTOHZJUUp3Q3lrbk5oY3BFWm9OSmZ6b0J3a0pCd05nQnduZ0RSTUFBQUFBQWdBQkFFQUQvd09BQUE4QUd3QUFBU0VpQmhjVEhnRXpJVEkyTnhNMkppYzBKaU1oSnlNaUJoMEJJUVBZL0ZBVUZ3UjJBeUlVQXFBVUlnTjJCQmRzSEJUK1VDRFFGQndEQUFMQUhCUDkzaE1jSEJNQ0loTWNVQlFjUUJ3VVVBQUFBZ0FCQUVBRC93T0FBQThBR3dBQUFUSVdCd01PQVNNaElpWW5BeVkyTXlVVklUVTBOanNCRnlFeUZnUFlGQmNFZGdNaUZQMWdGQ0lEZGdRWEV3TlovUUFjRk5BZ0FiQVVIQUpBSEJQK1hoTWNIQk1Cb2hNYzBKRFFGQnhBSEFBQUFRQUFBQUVBQUxUcEhVdGZEenoxQUFzRUFBQUFBQURUdk4zMkFBQUFBTk84M2ZZQUFQL0FBLzhEd0FBQUFBZ0FBZ0FBQUFBQUFBQUJBQUFEd1AvQUFBQUVBQUFBQUFBRC93QUJBQUFBQUFBQUFBQUFBQUFBQUFBQUJ3UUFBQUFBQUFBQUFBQUFBQUlBQUFBRUFBQkFCQUFBQVFRQUFBRUFBQUFBQUFvQUZBQWVBSEFBb0FEUUFBRUFBQUFIQURnQUF3QUFBQUFBQWdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT0FLNEFBUUFBQUFBQUFRQVBBQUFBQVFBQUFBQUFBZ0FIQUtnQUFRQUFBQUFBQXdBUEFFNEFBUUFBQUFBQUJBQVBBTDBBQVFBQUFBQUFCUUFMQUMwQUFRQUFBQUFBQmdBUEFIc0FBUUFBQUFBQUNnQWFBT29BQXdBQkJBa0FBUUFlQUE4QUF3QUJCQWtBQWdBT0FLOEFBd0FCQkFrQUF3QWVBRjBBQXdBQkJBa0FCQUFlQU13QUF3QUJCQWtBQlFBV0FEZ0FBd0FCQkFrQUJnQWVBSW9BQXdBQkJBa0FDZ0EwQVFSblpYSnlhWFF0WmkxaWRYUjBiMjRBWndCbEFISUFjZ0JwQUhRQUxRQm1BQzBBWWdCMUFIUUFkQUJ2QUc1V1pYSnphVzl1SURFdU1BQldBR1VBY2dCekFHa0Fid0J1QUNBQU1RQXVBREJuWlhKeWFYUXRaaTFpZFhSMGIyNEFad0JsQUhJQWNnQnBBSFFBTFFCbUFDMEFZZ0IxQUhRQWRBQnZBRzVuWlhKeWFYUXRaaTFpZFhSMGIyNEFad0JsQUhJQWNnQnBBSFFBTFFCbUFDMEFZZ0IxQUhRQWRBQnZBRzVTWldkMWJHRnlBRklBWlFCbkFIVUFiQUJoQUhKblpYSnlhWFF0WmkxaWRYUjBiMjRBWndCbEFISUFjZ0JwQUhRQUxRQm1BQzBBWWdCMUFIUUFkQUJ2QUc1R2IyNTBJR2RsYm1WeVlYUmxaQ0JpZVNCSlkyOU5iMjl1TGdCR0FHOEFiZ0IwQUNBQVp3QmxBRzRBWlFCeUFHRUFkQUJsQUdRQUlBQmlBSGtBSUFCSkFHTUFid0JOQUc4QWJ3QnVBQzRBQUFBREFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUEpIGZvcm1hdCgndHJ1ZXR5cGUnKSxcbiAgICAgIHVybChkYXRhOmltYWdlL3N2Zyt4bWw7Y2hhcnNldD11dGYtODtiYXNlNjQsUEQ5NGJXd2dkbVZ5YzJsdmJqMGlNUzR3SWlCemRHRnVaR0ZzYjI1bFBTSnVieUkvUGdvOElVUlBRMVJaVUVVZ2MzWm5JRkJWUWt4SlF5QWlMUzh2VnpOREx5OUVWRVFnVTFaSElERXVNUzh2UlU0aUlDSm9kSFJ3T2k4dmQzZDNMbmN6TG05eVp5OUhjbUZ3YUdsamN5OVRWa2N2TVM0eEwwUlVSQzl6ZG1jeE1TNWtkR1FpSUQ0S1BITjJaeUI0Yld4dWN6MGlhSFIwY0RvdkwzZDNkeTUzTXk1dmNtY3ZNakF3TUM5emRtY2lQZ284YldWMFlXUmhkR0UrUjJWdVpYSmhkR1ZrSUdKNUlFbGpiMDF2YjI0OEwyMWxkR0ZrWVhSaFBnbzhaR1ZtY3o0S1BHWnZiblFnYVdROUltZGxjbkpwZEMxbUxXSjFkSFJ2YmlJZ2FHOXlhWG90WVdSMkxYZzlJakV3TWpRaVBnbzhabTl1ZEMxbVlXTmxJSFZ1YVhSekxYQmxjaTFsYlQwaU1UQXlOQ0lnWVhOalpXNTBQU0k1TmpBaUlHUmxjMk5sYm5ROUlpMDJOQ0lnTHo0S1BHMXBjM05wYm1jdFoyeDVjR2dnYUc5eWFYb3RZV1IyTFhnOUlqRXdNalFpSUM4K0NqeG5iSGx3YUNCMWJtbGpiMlJsUFNJbUkzZ3lNRHNpSUdodmNtbDZMV0ZrZGkxNFBTSTFNVElpSUdROUlpSWdMejRLUEdkc2VYQm9JSFZ1YVdOdlpHVTlJaVlqZUdVNU9XUTdJaUJuYkhsd2FDMXVZVzFsUFNKbWFXeGxJaUJrUFNKTk9URTNMamd3TmlBM016QXVPVEkwWXkweU1pNHlNVElnTXpBdU1qa3lMVFV6TGpFM05DQTJOUzQzTFRnM0xqRTNPQ0E1T1M0M01EUnpMVFk1TGpReE1pQTJOQzQ1TmpRdE9Ua3VOekEwSURnM0xqRTNPR010TlRFdU5UYzBJRE0zTGpneUxUYzJMalU1TWlBME1pNHhPVFF0T1RBdU9USTBJRFF5TGpFNU5HZ3RORGsyWXkwME5DNHhNVElnTUMwNE1DMHpOUzQ0T0RndE9EQXRPREIyTFRnMk5HTXdMVFEwTGpFeE1pQXpOUzQ0T0RndE9EQWdPREF0T0RCb056TTJZelEwTGpFeE1pQXdJRGd3SURNMUxqZzRPQ0E0TUNBNE1IWTJNalJqTUNBeE5DNHpNekl0TkM0ek56SWdNemt1TXpVdE5ESXVNVGswSURrd0xqa3lOSHBOTnpnMUxqTTNOQ0EzT0RVdU16YzBZek13TGpjdE16QXVOeUExTkM0NExUVTRMak01T0NBM01pNDFPQzA0TVM0ek56Um9MVEUxTXk0NU5UUjJNVFV6TGprME5tTXlNaTQ1T0RRdE1UY3VOemdnTlRBdU5qYzRMVFF4TGpnM09DQTRNUzR6TnpRdE56SXVOVGN5ZWswNE9UWWdNVFpqTUMwNExqWTNNaTAzTGpNeU9DMHhOaTB4TmkweE5tZ3ROek0yWXkwNExqWTNNaUF3TFRFMklEY3VNekk0TFRFMklERTJkamcyTkdNd0lEZ3VOamN5SURjdU16STRJREUySURFMklERTJJREFnTUNBME9UVXVPVFUySURBdU1EQXlJRFE1TmlBd2RpMHlNalJqTUMweE55NDJOeklnTVRRdU16STJMVE15SURNeUxUTXlhREl5TkhZdE5qSTBlaUlnTHo0S1BHZHNlWEJvSUhWdWFXTnZaR1U5SWlZamVHVTVaVGM3SWlCbmJIbHdhQzF1WVcxbFBTSm1iMnhrWlhJaUlHUTlJazA1T0RRdU5TQTNNRFJvTFRrME5XTXRNall1TkNBd0xUUXpMamMyTkMweU1TNHhPQzB6T0M0MU9EWXRORGN1TURZNGJERXhOeTQyTnpJdE5UUTFMamcyTkdNMUxqRTNPQzB5TlM0NE9EZ2dNekV1TURFMExUUTNMakEyT0NBMU55NDBNVFF0TkRjdU1EWTRhRFkzTW1NeU5pNHpPVGdnTUNBMU1pNHlNelFnTWpFdU1UZ2dOVGN1TkRFeUlEUTNMakEyT0d3eE1UY3VOamMwSURVME5TNDROalJqTlM0eE56Z2dNalV1T0RnNExURXlMakU0T0NBME55NHdOamd0TXpndU5UZzJJRFEzTGpBMk9IcE5PRGsySURjNE5HTXdJREkyTGpVeExUSXhMalE1SURRNExUUTRJRFE0YUMwME16SnNMVE15SURZMGFDMHlNRGhqTFRJMkxqVXhJREF0TkRndE1qRXVORGt0TkRndE5EaDJMVGd3YURjMk9IWXhObm9pSUM4K0NqeG5iSGx3YUNCMWJtbGpiMlJsUFNJbUkzaGxPV1U0T3lJZ1oyeDVjR2d0Ym1GdFpUMGlabTlzWkdWeUxTMXZjR1Z1SWlCa1BTSk5PVGcwTGpVZ05UYzJZekkyTGpRZ01DQTBNeTQzTmpRdE1qRXVNVGdnTXpndU5UZzJMVFEzTGpBMk9Hd3RNVEUzTGpZM01pMDBNVGN1T0RZMFl5MDFMakUzT0MweU5TNDRPRGd0TXpFdU1ERTBMVFEzTGpBMk9DMDFOeTQwTVRRdE5EY3VNRFk0YUMwMk56SmpMVEkyTGpRZ01DMDFNaTR5TXpZZ01qRXVNVGd0TlRjdU5ERTBJRFEzTGpBMk9Hd3RNVEUzTGpZM01pQTBNVGN1T0RZMFl5MDFMakUzT0NBeU5TNDRPRGdnTVRJdU1UZzJJRFEzTGpBMk9DQXpPQzQxT0RZZ05EY3VNRFk0YURrME5YcE5PRGsySURjNE5IWXRNVFEwYUMwM05qaDJNakE0WXpBZ01qWXVOVEVnTWpFdU5Ea2dORGdnTkRnZ05EaG9NakE0YkRNeUxUWTBhRFF6TW1NeU5pNDFNU0F3SURRNExUSXhMalE1SURRNExUUTRlaUlnTHo0S1BDOW1iMjUwUGp3dlpHVm1jejQ4TDNOMlp6ND0pIGZvcm1hdCgnc3ZnJylcbiAgICA7XG4gICAgZm9udC13ZWlnaHQ6IG5vcm1hbDtcbiAgICBmb250LXN0eWxlOiBub3JtYWw7XG4gIH1cblxuICBbY2xhc3NePVwiZi1idXR0b24taWNvbl9fXCJdLFxuICBbY2xhc3MqPVwiIGYtYnV0dG9uLWljb25fX1wiXSB7XG4gICAgZm9udC1mYW1pbHk6ICdnZXJyaXQtZi1idXR0b24nICFpbXBvcnRhbnQ7XG4gICAgc3BlYWs6IG5vbmU7XG4gICAgZm9udC1zdHlsZTogbm9ybWFsO1xuICAgIGZvbnQtd2VpZ2h0OiBub3JtYWw7XG4gICAgZm9udC12YXJpYW50OiBub3JtYWw7XG4gICAgdGV4dC10cmFuc2Zvcm06IG5vbmU7XG4gICAgbGluZS1oZWlnaHQ6IDE7XG5cbiAgICAtd2Via2l0LWZvbnQtc21vb3RoaW5nOiBhbnRpYWxpYXNlZDtcbiAgICAtbW96LW9zeC1mb250LXNtb290aGluZzogZ3JheXNjYWxlO1xuICB9XG5cbiAgLmYtYnV0dG9uLWljb25fX2ZpbGU6YmVmb3JlIHtcbiAgICBjb250ZW50OiBcIlxcZTk5ZFwiO1xuICB9XG4gIC5mLWJ1dHRvbi1pY29uX19mb2xkZXI6YmVmb3JlIHtcbiAgICBjb250ZW50OiBcIlxcZTllN1wiO1xuICB9XG4gIC5mLWJ1dHRvbi1pY29uX19mb2xkZXItLW9wZW46YmVmb3JlIHtcbiAgICBjb250ZW50OiBcIlxcZTllOFwiO1xuICB9XG5cbiAgYm9keS5nZXJyaXQtLXdpdGgtZi1idXR0b24ge1xuICAgIG1hcmdpbi1sZWZ0OiAyODBweDtcbiAgfVxuXG4gIGJvZHkuZ2Vycml0LS13aXRoLWYtYnV0dG9uLW92ZXJsYXkge1xuICAgIG1hcmdpbi1sZWZ0OiAwO1xuICB9XG5cbiAgLmYtYnV0dG9uX19mcmFtZSB7XG4gICAgcG9zaXRpb246IGZpeGVkO1xuICAgIHRvcDogMDtcbiAgICByaWdodDogYXV0bztcbiAgICBib3R0b206IDA7XG4gICAgbGVmdDogMDtcblxuICAgIHdpZHRoOiAyNDBweDtcbiAgICBvdmVyZmxvdzogYXV0bztcblxuICAgIGJvcmRlci1jb2xvcjogI2FhYTtcbiAgICBib3JkZXItcmlnaHQtc3R5bGU6IHNvbGlkO1xuICAgIGJvcmRlci1yaWdodC13aWR0aDogMXB4O1xuICAgIGJhY2tncm91bmQ6IHdoaXRlO1xuICAgIHBhZGRpbmc6IDEwcHg7XG5cbiAgICBmb250LXNpemU6IDAuODVlbTtcbiAgICBsaW5lLWhlaWdodDogMS40O1xuXG4gICAgei1pbmRleDogNjtcbiAgfVxuXG4gIGJvZHkuZ2Vycml0LS13aXRoLWYtYnV0dG9uLW92ZXJsYXkgLmYtYnV0dG9uX19mcmFtZSB7XG4gICAgd2lkdGg6IDUwJTtcbiAgICBsZWZ0OiAyNSU7XG4gICAgdG9wOiA1MCU7XG4gICAgYm9yZGVyLWxlZnQtd2lkdGg6IDFweDtcbiAgICBib3JkZXItbGVmdC1zdHlsZTogc29saWQ7XG4gICAgYm9yZGVyLXRvcC1zdHlsZTogc29saWQ7XG4gICAgYm9yZGVyLXRvcC13aWR0aDogMXB4O1xuXG4gICAgb3BhY2l0eTogMC44NTtcbiAgfVxuXG4gIGJvZHkuZ2Vycml0LS13aXRoLWYtYnV0dG9uLW92ZXJsYXkgLmYtYnV0dG9uX19mcmFtZTpob3ZlciB7XG4gICAgb3BhY2l0eTogMTtcbiAgfVxuXG4gIC5mLWJ1dHRvbl9fZnJhbWUtLWNvbW1lbnRlZC1vbmx5IC5mLWJ1dHRvbi1maWxlOm5vdCguZi1idXR0b24tZmlsZS0tY29tbWVudGVkKSB7XG4gICAgZGlzcGxheTogbm9uZTtcbiAgfVxuXG4gIC5mLWJ1dHRvbl9fY29udHJvbHMge1xuICAgIHBhZGRpbmctYm90dG9tOiAxZW07XG4gICAgbWFyZ2luLWJvdHRvbTogMWVtO1xuICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjZGRkO1xuICB9XG5cbiAgLmYtYnV0dG9uX19jb250cm9scyBsYWJlbCB7XG4gICAgZGlzcGxheTogYmxvY2s7XG4gIH1cblxuICAuZi1idXR0b24tZmlsZSB7XG4gICAgbGlzdC1zdHlsZTogbm9uZTtcbiAgfVxuXG4gIC5mLWJ1dHRvbi1maWxlOmhvdmVyIHtcbiAgICBiYWNrZ3JvdW5kOiAjZmNmYTk2O1xuICB9XG5cbiAgLmYtYnV0dG9uLWZpbGUtLWFjdGl2ZSB7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogI0RFRjtcbiAgfVxuXG4gIC5mLWJ1dHRvbi1maWxlX19pY29uIHtcbiAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gICAgd2lkdGg6IDE2cHg7XG4gICAgaGVpZ2h0OiAxNnB4O1xuICAgIHZlcnRpY2FsLWFsaWduOiBtaWRkbGU7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIHRleHQtYWxpZ246IGxlZnQ7XG4gIH1cblxuICAuZi1idXR0b24tZmlsZV9fbGluayB7XG4gICAgZGlzcGxheTogYmxvY2s7XG4gICAgbWFyZ2luLXJpZ2h0OiAyZW07XG4gICAgbWFyZ2luLWxlZnQ6IDE2cHg7XG4gICAgcGFkZGluZy1sZWZ0OiAwLjI1ZW07XG4gICAgbGluZS1oZWlnaHQ6IDEuNjtcbiAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XG4gICAgd29yZC1icmVhazogYnJlYWstYWxsO1xuICB9XG5cbiAgLmYtYnV0dG9uLWZpbGVfX2ZvbGRlciB7XG4gICAgbGlzdC1zdHlsZTogbm9uZTtcbiAgICBtYXJnaW4tbGVmdDogMDtcbiAgICBwYWRkaW5nLWxlZnQ6IDAuNWVtO1xuICB9XG5cbiAgLmYtYnV0dG9uLWZpbGVfX2ZvbGRlci1oZWFkZXIge1xuICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xuICAgIG1hcmdpbi1sZWZ0OiAxLjVlbTtcbiAgfVxuXG4gIC5mLWJ1dHRvbi1maWxlX19mb2xkZXItaGVhZGVyIC5mLWJ1dHRvbi1pY29uX19mb2xkZXIge1xuICAgIG1hcmdpbi1sZWZ0OiAtMS41ZW07XG4gIH1cblxuICAuZi1idXR0b24tZmlsZV9fZm9sZGVyLS1yb290IHtcbiAgICBwYWRkaW5nLWxlZnQ6IDA7XG4gIH1cblxuICAuZi1idXR0b24tZmlsZV9fY29tbWVudC1jb3VudCB7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIHJpZ2h0OiAwO1xuICAgIG1heC13aWR0aDogMmVtO1xuICAgIHBhZGRpbmctcmlnaHQ6IDFlbTtcbiAgICB0ZXh0LWFsaWduOiByaWdodDtcbiAgICBmb250LXdlaWdodDogYm9sZDtcbiAgICBsaW5lLWhlaWdodDogMS42O1xuICB9XG5cbiAgLmYtYnV0dG9uLWZpbGVfX2ljb24uZi1idXR0b24taWNvbl9fZmlsZSAgIHsgbGluZS1oZWlnaHQ6IGluaGVyaXQ7IG1hcmdpbi10b3A6IDFweDsgfVxuICAuZi1idXR0b24tZmlsZV9faWNvbi5mLWJ1dHRvbi1pY29uX19mb2xkZXIgeyBtYXJnaW4tdG9wOiAycHg7IH1cbiovfS50b1N0cmluZygpLnJlcGxhY2UoJ2Z1bmN0aW9uICgpIHsvKicsICcnKS5yZXBsYWNlKCcqL30nLCAnJyk7IiwiaW1wb3J0IHsgVHJlZVZpZXcsIGNsYXNzU2V0LCBjb3B5VG9DbGlwYm9hcmQgfSBmcm9tICcuL3V0aWxzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gR2Vycml0RkJ1dHRvblVJKCQpIHtcbiAgdmFyIEhBU19TQ1JPTExfSU5UT19WSUVXID0gKFxuICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmXG4gICAgdHlwZW9mIEhUTUxFbGVtZW50LnByb3RvdHlwZS5zY3JvbGxJbnRvVmlld0lmTmVlZGVkID09PSAnZnVuY3Rpb24nXG4gICk7XG5cbiAgdmFyICRmcmFtZSA9ICQoJzxkaXYgLz4nLCB7ICdjbGFzcyc6ICdmLWJ1dHRvbl9fZnJhbWUnIH0pO1xuICB2YXIgJGNvbnRhaW5lciwgJGFjdGl2ZVJvdztcblxuICByZXR1cm4ge1xuICAgIG5vZGU6ICRmcmFtZVswXSxcblxuICAgIHByb3BzOiB7XG4gICAgICBmaWxlczogW10sXG4gICAgICBjdXJyZW50RmlsZTogbnVsbCxcbiAgICAgIGNvbW1lbnRlZE9ubHk6IGZhbHNlLFxuICAgICAgaGlkZUluVW5pZmllZE1vZGU6IGZhbHNlLFxuICAgICAgZGlzcGxheUFzT3ZlcmxheTogZmFsc2UsXG4gICAgICBvblRvZ2dsZUhpZGVJblVuaWZpZWRNb2RlOiBGdW5jdGlvbi5wcm90b3R5cGUsXG4gICAgICBvblRvZ2dsZURpc3BsYXlBc092ZXJsYXk6IEZ1bmN0aW9uLnByb3RvdHlwZSxcbiAgICB9LFxuXG4gICAgaXNNb3VudGVkOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAkZnJhbWUucGFyZW50KCkubGVuZ3RoID09PSAxO1xuICAgIH0sXG5cbiAgICBtb3VudDogZnVuY3Rpb24oX2NvbnRhaW5lcikge1xuICAgICAgJGNvbnRhaW5lciA9ICQoX2NvbnRhaW5lciB8fCBkb2N1bWVudC5ib2R5KTtcblxuICAgICAgJGNvbnRhaW5lci5hZGRDbGFzcygnZ2Vycml0LS13aXRoLWYtYnV0dG9uJyk7XG4gICAgICAkY29udGFpbmVyLmFwcGVuZCgkZnJhbWUpO1xuXG4gICAgICB0aGlzLmNvbXBvbmVudERpZFJlbmRlcigpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTaG93IG9yIGhpZGUgdGhlIEYgYnV0dG9uIGZyYW1lLlxuICAgICAqL1xuICAgIHRvZ2dsZTogZnVuY3Rpb24oY29udGFpbmVyKSB7XG4gICAgICBpZiAodGhpcy5pc01vdW50ZWQoKSkge1xuICAgICAgICB0aGlzLnVubW91bnQoY29udGFpbmVyKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLm1vdW50KGNvbnRhaW5lcik7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHVubW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgJGZyYW1lLmRldGFjaCgpO1xuICAgICAgJGNvbnRhaW5lci5yZW1vdmVDbGFzcygnZ2Vycml0LS13aXRoLWYtYnV0dG9uJyk7XG4gICAgICAkY29udGFpbmVyLnJlbW92ZUNsYXNzKCdnZXJyaXQtLXdpdGgtZi1idXR0b24tb3ZlcmxheScpO1xuICAgICAgJGNvbnRhaW5lciA9IG51bGw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSB0aGUgRiBidXR0b24gd2l0aCBuZXcgcGFyYW1ldGVycy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwcm9wc1xuICAgICAqXG4gICAgICogQHBhcmFtIHtPYmplY3RbXX0gcHJvcHMuZmlsZXNcbiAgICAgKiAgICAgICAgVGhlIGxpc3Qgb2YgcGF0Y2gtc2V0IGZpbGVzIHdpdGggb3Igd2l0aG91dCBjb21tZW50IGRhdGEuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcHJvcHMuY3VycmVudEZpbGVcbiAgICAgKiAgICAgICAgRmlsZSBwYXRoIG9mIHRoZSBmaWxlIGJlaW5nIGN1cnJlbnRseSBicm93c2VkIGluIGdlcnJpdC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gcHJvcHMuY29tbWVudGVkT25seVxuICAgICAqICAgICAgICBXaGV0aGVyIHRvIGxpc3Qgb25seSB0aGUgZmlsZXMgdGhhdCBoYXZlIGNvbW1lbnRzLlxuICAgICAqL1xuICAgIHNldFByb3BzOiBmdW5jdGlvbihwcm9wcykge1xuICAgICAgT2JqZWN0LmtleXMocHJvcHMpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgIHRoaXMucHJvcHNba2V5XSA9IHByb3BzW2tleV07XG4gICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGNvbXBvbmVudERpZFJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBTY3JvbGwgdGhlIGFjdGl2ZSByb3cgaW50byB2aWV3LCB2ZXJ5IGhhbmR5IHdoZW4gdGhlIFBTIGhhcyBtYW55IGZpbGVzLlxuICAgICAgaWYgKCRhY3RpdmVSb3cgJiYgSEFTX1NDUk9MTF9JTlRPX1ZJRVcpIHtcbiAgICAgICAgJGFjdGl2ZVJvd1swXS5zY3JvbGxJbnRvVmlld0lmTmVlZGVkKCk7XG4gICAgICB9XG5cbiAgICAgIGlmICgkY29udGFpbmVyKSB7XG4gICAgICAgICRjb250YWluZXIudG9nZ2xlQ2xhc3MoJ2dlcnJpdC0td2l0aC1mLWJ1dHRvbi1vdmVybGF5JywgdGhpcy5wcm9wcy5kaXNwbGF5QXNPdmVybGF5KTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyICRmaWxlcyA9IHRoaXMucmVuZGVyRmlsZXModGhpcy5wcm9wcy5maWxlcywgdGhpcy5wcm9wcy5jdXJyZW50RmlsZSk7XG4gICAgICB2YXIgJGNvbnRyb2xzID0gdGhpcy5yZW5kZXJDb250cm9scygpO1xuXG4gICAgICAkZnJhbWVcbiAgICAgICAgLmVtcHR5KClcbiAgICAgICAgLmFwcGVuZCgkY29udHJvbHMpXG4gICAgICAgIC5hcHBlbmQoJGZpbGVzKVxuICAgICAgICAudG9nZ2xlQ2xhc3MoJ2YtYnV0dG9uX19mcmFtZS0tY29tbWVudGVkLW9ubHknLCB0aGlzLnByb3BzLmNvbW1lbnRlZE9ubHkpXG4gICAgICA7XG5cbiAgICAgIHRoaXMuY29tcG9uZW50RGlkUmVuZGVyKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcmVuZGVyRmlsZXM6IGZ1bmN0aW9uKGZpbGVzLCBjdXJyZW50RmlsZSkge1xuICAgICAgdmFyICRsaXN0ID0gJCgnPGRpdiAvPicsIHsgJ2NsYXNzJzogJ2YtYnV0dG9uX190YWJsZScgfSk7XG4gICAgICB2YXIgZmlsZVRyZWUgPSBUcmVlVmlldyhmaWxlcyk7XG5cbiAgICAgICRhY3RpdmVSb3cgPSBudWxsO1xuICAgICAgJGxpc3QuYXBwZW5kKHRoaXMucmVuZGVyRmlsZVRyZWUoZmlsZVRyZWUsIGN1cnJlbnRGaWxlLCB0cnVlKSk7XG5cbiAgICAgIHJldHVybiAkbGlzdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICByZW5kZXJGaWxlVHJlZTogZnVuY3Rpb24odHJlZSwgY3VycmVudEZpbGUsIGlzUm9vdCkge1xuICAgICAgdmFyICRsaXN0ID0gJCgnPG9sIC8+Jywge1xuICAgICAgICBjbGFzczogY2xhc3NTZXQoe1xuICAgICAgICAgICdmLWJ1dHRvbi1maWxlX19mb2xkZXInOiB0cnVlLFxuICAgICAgICAgICdmLWJ1dHRvbi1maWxlX19mb2xkZXItLXJvb3QnOiBpc1Jvb3QgPT09IHRydWVcbiAgICAgICAgfSlcbiAgICAgIH0pO1xuXG4gICAgICAvLyBmb2xkZXJzOlxuICAgICAgT2JqZWN0LmtleXModHJlZS5jaGlsZHJlbikuc29ydCgpLmZvckVhY2goZnVuY3Rpb24oYnJhbmNoKSB7XG4gICAgICAgIHZhciAkY2hpbGRyZW4gPSB0aGlzLnJlbmRlckZpbGVUcmVlKHRyZWUuY2hpbGRyZW5bYnJhbmNoXSwgY3VycmVudEZpbGUpO1xuXG4gICAgICAgIGlmICghJGNoaWxkcmVuKSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgJGZvbGRlckhlYWRlciA9ICQoJzxoZWFkZXIgLz4nLCB7IGNsYXNzOiAnZi1idXR0b24tZmlsZV9fZm9sZGVyLWhlYWRlcicgfSk7XG5cbiAgICAgICAgJGZvbGRlckhlYWRlci5hcHBlbmQoXG4gICAgICAgICAgJCgnPHNwYW4gLz4nLCB7IGNsYXNzOiAnZi1idXR0b24tZmlsZV9faWNvbiBmLWJ1dHRvbi1pY29uX19mb2xkZXInIH0pXG4gICAgICAgICk7XG5cbiAgICAgICAgJGZvbGRlckhlYWRlci5hcHBlbmQoJCgnPHNwYW4gLz4nKS50ZXh0KGJyYW5jaCArICcvJykpO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgJCgnPGxpIC8+JylcbiAgICAgICAgICAgIC5hcHBlbmQoJGZvbGRlckhlYWRlcilcbiAgICAgICAgICAgIC5hcHBlbmQoJGNoaWxkcmVuKVxuICAgICAgICAgICAgLmFwcGVuZFRvKCRsaXN0KVxuICAgICAgICApO1xuICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgLy8gZmlsZXM6XG4gICAgICB0cmVlLml0ZW1zLmZvckVhY2goZnVuY3Rpb24oZmlsZSkge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5jb21tZW50ZWRPbmx5ICYmICghZmlsZS5jb21tZW50cyB8fCAhZmlsZS5jb21tZW50cy5sZW5ndGgpKSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICAkbGlzdC5hcHBlbmQodGhpcy5yZW5kZXJGaWxlKGZpbGUsIGN1cnJlbnRGaWxlKSk7XG4gICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICByZXR1cm4gJGxpc3QuY2hpbGRyZW4oKS5sZW5ndGggPT09IDAgPyBudWxsIDogJGxpc3Q7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcmVuZGVyRmlsZTogZnVuY3Rpb24oZmlsZSwgY3VycmVudEZpbGUpIHtcbiAgICAgIHZhciBmaWxlUGF0aCA9IGZpbGUuZmlsZVBhdGg7XG4gICAgICB2YXIgZmlsZU5hbWUgPSBmaWxlLmZpbGVQYXRoLnNwbGl0KCcvJykuc2xpY2UoLTEpWzBdO1xuICAgICAgdmFyIGhhc0NvbW1lbnRzID0gZmlsZS5jb21tZW50cyAmJiBmaWxlLmNvbW1lbnRzLmxlbmd0aCA+IDA7XG4gICAgICB2YXIgJHJvdyA9ICQoJzxsaSAvPicsIHtcbiAgICAgICAgY2xhc3M6IGNsYXNzU2V0KHtcbiAgICAgICAgICAnZi1idXR0b24tZmlsZSc6IHRydWUsXG4gICAgICAgICAgJ2YtYnV0dG9uLWZpbGUtLWFjdGl2ZSc6IGN1cnJlbnRGaWxlID09PSBmaWxlUGF0aCxcbiAgICAgICAgICAnZi1idXR0b24tZmlsZS0tY29tbWVudGVkJzogaGFzQ29tbWVudHNcbiAgICAgICAgfSlcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoY3VycmVudEZpbGUgPT09IGZpbGVQYXRoKSB7XG4gICAgICAgICRhY3RpdmVSb3cgPSAkcm93O1xuICAgICAgfVxuXG4gICAgICAkcm93LmFwcGVuZChcbiAgICAgICAgJCgnPHNwYW4gLz4nLCB7XG4gICAgICAgICAgY2xhc3M6ICdmLWJ1dHRvbi1maWxlX19jb21tZW50LWNvdW50J1xuICAgICAgICB9KS50ZXh0KGhhc0NvbW1lbnRzID8gZmlsZS5jb21tZW50cy5sZW5ndGggOiAnJylcbiAgICAgICk7XG5cbiAgICAgICRyb3cuYXBwZW5kKFxuICAgICAgICAkKCc8c3BhbiAvPicsIHtcbiAgICAgICAgICBjbGFzczogJ2YtYnV0dG9uLWljb25fX2ZpbGUgZi1idXR0b24tZmlsZV9faWNvbicsXG4gICAgICAgICAgdGl0bGU6ICdDb3B5IGZpbGVwYXRoIHRvIGNsaXBib2FyZCdcbiAgICAgICAgfSkuYmluZCgnY2xpY2snLCB0aGlzLmNvcHlUb0NsaXBib2FyZC5iaW5kKHRoaXMsIGZpbGVQYXRoKSlcbiAgICAgICk7XG5cbiAgICAgICRyb3cuYXBwZW5kKFxuICAgICAgICAkKCc8YSAvPicsIHtcbiAgICAgICAgICBocmVmOiBmaWxlLnVybCxcbiAgICAgICAgICBjbGFzczogJ2YtYnV0dG9uLWZpbGVfX2xpbmsnXG4gICAgICAgIH0pLnRleHQoZmlsZU5hbWUpXG4gICAgICApO1xuXG4gICAgICByZXR1cm4gJHJvdztcbiAgICB9LFxuXG4gICAgcmVuZGVyRmlsZUNvbW1lbnRzOiBmdW5jdGlvbihjb21tZW50cykge1xuICAgICAgdmFyICRjb21tZW50cyA9ICQoJzxvbCAvPicsIHsgY2xhc3M6ICdmLWJ1dHRvbi1maWxlX19jb21tZW50cycgfSk7XG5cbiAgICAgIGNvbW1lbnRzLmZvckVhY2goZnVuY3Rpb24oY29tbWVudCkge1xuICAgICAgICAkY29tbWVudHMuYXBwZW5kKFxuICAgICAgICAgICQoJzxsaSAvPicpLnRleHQoXG4gICAgICAgICAgICAnWycgKyBjb21tZW50LmF1dGhvci51c2VybmFtZSArICddICcgKyBjb21tZW50Lm1lc3NhZ2VcbiAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuICRjb21tZW50cztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICByZW5kZXJDb250cm9sczogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgJGNvbnRyb2xzID0gJCgnPGRpdiAvPicsIHtcbiAgICAgICAgY2xhc3M6ICdmLWJ1dHRvbl9fY29udHJvbHMnXG4gICAgICB9KTtcblxuICAgICAgJCgnPGxhYmVsIC8+JylcbiAgICAgICAgLmFwcGVuZCgkKCc8aW5wdXQgLz4nLCB7IHR5cGU6ICdjaGVja2JveCcsIGNoZWNrZWQ6IHRoaXMucHJvcHMuY29tbWVudGVkT25seSB9KSlcbiAgICAgICAgLmFwcGVuZCgkKCc8c3BhbiAvPicpLnRleHQoJ0hpZGUgZmlsZXMgd2l0aCBubyBjb21tZW50cycpKVxuICAgICAgICAuYXBwZW5kVG8oJGNvbnRyb2xzKVxuICAgICAgICAuYmluZCgnY2xpY2snLCB0aGlzLnRvZ2dsZUNvbW1lbnRlZC5iaW5kKHRoaXMpKVxuICAgICAgO1xuXG4gICAgICAkKCc8bGFiZWwgLz4nKVxuICAgICAgICAuYXBwZW5kKFxuICAgICAgICAgICQoJzxpbnB1dCAvPicsIHsgdHlwZTogJ2NoZWNrYm94JywgY2hlY2tlZDogdGhpcy5wcm9wcy5oaWRlSW5VbmlmaWVkTW9kZSB9KVxuICAgICAgICAgIC5iaW5kKCdjaGFuZ2UnLCB0aGlzLnRvZ2dsZUhpZGVJblVuaWZpZWRNb2RlLmJpbmQodGhpcykpXG4gICAgICAgIClcbiAgICAgICAgLmFwcGVuZCgkKCc8c3BhbiAvPicpLnRleHQoJ0Rpc2FibGUgaW4gVW5pZmllZCBEaWZmIHZpZXcnKSlcbiAgICAgICAgLmFwcGVuZFRvKCRjb250cm9scylcbiAgICAgIDtcblxuICAgICAgJCgnPGxhYmVsIC8+JylcbiAgICAgICAgLmFwcGVuZChcbiAgICAgICAgICAkKCc8aW5wdXQgLz4nLCB7IHR5cGU6ICdjaGVja2JveCcsIGNoZWNrZWQ6IHRoaXMucHJvcHMuZGlzcGxheUFzT3ZlcmxheSB9KVxuICAgICAgICAgIC5iaW5kKCdjaGFuZ2UnLCB0aGlzLnRvZ2dsZURpc3BsYXlBc092ZXJsYXkuYmluZCh0aGlzKSlcbiAgICAgICAgKVxuICAgICAgICAuYXBwZW5kKCQoJzxzcGFuIC8+JykudGV4dCgnRGlzcGxheSBhcyBvdmVybGF5JykpXG4gICAgICAgIC5hcHBlbmRUbygkY29udHJvbHMpXG4gICAgICA7XG5cbiAgICAgIHJldHVybiAkY29udHJvbHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICpcbiAgICAgKiBDb3B5IGEgZmlsZXBhdGggdG8gdGhlIGNsaXBib2FyZC5cbiAgICAgKi9cbiAgICBjb3B5VG9DbGlwYm9hcmQ6IGZ1bmN0aW9uKGZpbGVQYXRoLyosIGUqLykge1xuICAgICAgY29weVRvQ2xpcGJvYXJkKGZpbGVQYXRoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0b2dnbGVDb21tZW50ZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRQcm9wcyh7IGNvbW1lbnRlZE9ubHk6ICF0aGlzLnByb3BzLmNvbW1lbnRlZE9ubHkgfSk7XG4gICAgfSxcblxuICAgIHRvZ2dsZUhpZGVJblVuaWZpZWRNb2RlOiBmdW5jdGlvbihlKSB7XG4gICAgICB0aGlzLnByb3BzLm9uVG9nZ2xlSGlkZUluVW5pZmllZE1vZGUoZS50YXJnZXQuY2hlY2tlZCk7XG4gICAgfSxcblxuICAgIHRvZ2dsZURpc3BsYXlBc092ZXJsYXk6IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHRoaXMucHJvcHMub25Ub2dnbGVEaXNwbGF5QXNPdmVybGF5KGUudGFyZ2V0LmNoZWNrZWQpO1xuICAgIH1cbiAgfTtcbn0iLCJpbXBvcnQgeyBkaXNjYXJkTGVhZGluZ1NsYXNoLCBpbmplY3RDU1MgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCBTdHlsZXMgZnJvbSAnLi9zdHlsZXMnO1xuaW1wb3J0IEdlcnJpdEZCdXR0b25VSSBmcm9tICcuL3VpJztcblxudmFyIE5SX0FKQVhfQ0FMTFMgPSAyO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBHZXJyaXRGQnV0dG9uKCkge1xuICB2YXIgS0NfRiA9IDcwO1xuXG4gIGZ1bmN0aW9uIHBhcnNlQ29udGV4dEZyb21VUkwodXJsKSB7XG4gICAgdmFyIGN0eCA9IHt9O1xuICAgIHZhciBtYXRjaENoYW5nZSA9IHVybC5tYXRjaCgvXlxcL2NcXC8oXFxkKykvKTtcbiAgICB2YXIgbWF0Y2hSZXZpc2lvbiA9IHVybC5tYXRjaCgvXlxcL2NcXC9cXGQrXFwvKFxcZCspLyk7XG4gICAgdmFyIG1hdGNoRmlsZSA9IHVybC5tYXRjaCgvXlxcL2NcXC9cXGQrXFwvXFxkK1xcLyguKykvKTtcblxuICAgIGN0eC5jaE51bWJlciA9IG1hdGNoQ2hhbmdlID8gbWF0Y2hDaGFuZ2VbMV0gOiBudWxsO1xuICAgIGN0eC5ydk51bWJlciA9IG1hdGNoUmV2aXNpb24gPyBtYXRjaFJldmlzaW9uWzFdIDogbnVsbDtcbiAgICBjdHguY3VycmVudEZpbGUgPSBtYXRjaEZpbGUgPyBtYXRjaEZpbGVbMV0gOiBudWxsO1xuXG4gICAgcmV0dXJuIGN0eDtcbiAgfVxuXG4gIC8qKlxuICAgKiBEb3dubG9hZCB0aGUgZmlsZXMgZm9yIHRoZSBnaXZlbiBjaGFuZ2UvcmV2aXNpb24gY29tYm8gYW5kIGFueSBjb21tZW50cyBmb3JcbiAgICogdGhlbS5cbiAgICpcbiAgICogQHBhcmFtICB7TnVtYmVyfSAgIGNoTnVtYmVyXG4gICAqIEBwYXJhbSAge051bWJlcn0gICBydk51bWJlclxuICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gZG9uZVxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdFtdfSBkb25lLmZpbGVzXG4gICAqICAgICAgICBBIGhhc2ggb2YgZmlsZS1uYW1lcyBhbmQgdGhlaXIgaW5mby5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGRvbmUuZmlsZXNbXS51cmxcbiAgICogICAgICAgIFRoZSBVUkwgZm9yIHRoZSBmaWxlLWRpZmYgcGFnZSBmb3IgdGhpcyBmaWxlLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdFtdfSBkb25lLmZpbGVzW10uY29tbWVudHNcbiAgICogICAgICAgIFRoZSBsaXN0IG9mIGNvbW1lbnRzIGZvciB0aGlzIGZpbGUuXG4gICAqL1xuICBmdW5jdGlvbiBmZXRjaChjaE51bWJlciwgcnZOdW1iZXIsIGRvbmUpIHtcbiAgICB2YXIgZmlsZXMgPSBbXTtcbiAgICB2YXIgQkFTRV9VUkwgPSBbICcvY2hhbmdlcycsIGNoTnVtYmVyLCAncmV2aXNpb25zJywgcnZOdW1iZXIgXS5qb2luKCcvJyk7XG4gICAgdmFyIGNhbGxzRG9uZSA9IDA7XG5cbiAgICBmdW5jdGlvbiBzZXQoZmlsZVBhdGgsIGl0ZW0sIHZhbHVlKSB7XG4gICAgICB2YXIgZmlsZUVudHJ5ID0gZmlsZXMuZmlsdGVyKGZ1bmN0aW9uKGVudHJ5KSB7XG4gICAgICAgIHJldHVybiBlbnRyeS5maWxlUGF0aCA9PT0gZmlsZVBhdGg7XG4gICAgICB9KVswXTtcblxuICAgICAgaWYgKCFmaWxlRW50cnkpIHtcbiAgICAgICAgZmlsZUVudHJ5ID0geyBmaWxlUGF0aDogZmlsZVBhdGggfTtcbiAgICAgICAgZmlsZXMucHVzaChmaWxlRW50cnkpO1xuICAgICAgfVxuXG4gICAgICBmaWxlRW50cnlbaXRlbV0gPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0aWNrKCkge1xuICAgICAgaWYgKCsrY2FsbHNEb25lID09PSBOUl9BSkFYX0NBTExTKSB7XG4gICAgICAgIGRvbmUoZmlsZXMpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFVybEZvckZpbGUoZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgICcvIy9jLycgKyBjaE51bWJlciArICcvJyArIHJ2TnVtYmVyICsgJy8nICsgZGlzY2FyZExlYWRpbmdTbGFzaChmaWxlUGF0aClcbiAgICAgICk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0UmVtb3RlKHVybCwgY2FsbGJhY2spIHtcbiAgICAgIHdpbmRvdy4kLmFqYXgoe1xuICAgICAgICB1cmw6IEJBU0VfVVJMICsgdXJsLFxuICAgICAgICB0eXBlOiAnR0VUJyxcbiAgICAgICAgZGF0YVR5cGU6ICd0ZXh0JyxcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24ocmVzcCkge1xuICAgICAgICAgIGNhbGxiYWNrKEpTT04ucGFyc2UocmVzcC5zdWJzdHIoXCIpXX0nXCIubGVuZ3RoKSkpO1xuICAgICAgICAgIHRpY2soKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0UmVtb3RlKCcvZmlsZXMnLCBmdW5jdGlvbihydkZpbGVzKSB7XG4gICAgICBPYmplY3Qua2V5cyhydkZpbGVzKS5mb3JFYWNoKGZ1bmN0aW9uKF9maWxlUGF0aCkge1xuICAgICAgICB2YXIgZmlsZVBhdGggPSBkaXNjYXJkTGVhZGluZ1NsYXNoKF9maWxlUGF0aCk7XG4gICAgICAgIHNldChmaWxlUGF0aCwgJ3VybCcsIGdldFVybEZvckZpbGUoZmlsZVBhdGgpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZ2V0UmVtb3RlKCcvY29tbWVudHMnLCBmdW5jdGlvbihydkZpbGVDb21tZW50cykge1xuICAgICAgT2JqZWN0LmtleXMocnZGaWxlQ29tbWVudHMpLmZvckVhY2goZnVuY3Rpb24oX2ZpbGVQYXRoKSB7XG4gICAgICAgIHZhciBmaWxlUGF0aCA9IGRpc2NhcmRMZWFkaW5nU2xhc2goX2ZpbGVQYXRoKTtcbiAgICAgICAgc2V0KGZpbGVQYXRoLCAnY29tbWVudHMnLCBydkZpbGVDb21tZW50c1tmaWxlUGF0aF0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBpc0luVW5pZmllZE1vZGUoKSB7XG4gICAgcmV0dXJuICEhZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmdlcnJpdEJvZHkgLnVuaWZpZWRUYWJsZScpO1xuICB9XG5cbiAgZnVuY3Rpb24gc2hvdWxkSGlkZUluVW5pZmllZE1vZGUoKSB7XG4gICAgcmV0dXJuIGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdHRVJSSVRfRl9CVVRUT04vSElERV9JTl9VTklGSUVEX01PREUnKSA9PT0gJzEnO1xuICB9XG5cbiAgZnVuY3Rpb24gc2hvdWxkRGlzcGxheUFzT3ZlcmxheSgpIHtcbiAgICByZXR1cm4gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ0dFUlJJVF9GX0JVVFRPTi9ESVNQTEFZX0FTX09WRVJMQVknKSA9PT0gJzEnO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBpbnN0YWxsOiBmdW5jdGlvbihHZXJyaXQsICQpIHtcbiAgICAgIHZhciB1aSA9IEdlcnJpdEZCdXR0b25VSSgkKTtcbiAgICAgIHZhciBjb250ZXh0LCBjYWNoZWRGaWxlcztcblxuICAgICAgdWkuc2V0UHJvcHMoe1xuICAgICAgICBoaWRlSW5VbmlmaWVkTW9kZTogc2hvdWxkSGlkZUluVW5pZmllZE1vZGUoKSxcbiAgICAgICAgZGlzcGxheUFzT3ZlcmxheTogc2hvdWxkRGlzcGxheUFzT3ZlcmxheSgpLFxuXG4gICAgICAgIG9uVG9nZ2xlSGlkZUluVW5pZmllZE1vZGU6IGZ1bmN0aW9uKGNoZWNrZWQpIHtcbiAgICAgICAgICBpZiAoY2hlY2tlZCkge1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ0dFUlJJVF9GX0JVVFRPTi9ISURFX0lOX1VOSUZJRURfTU9ERScsICcxJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ0dFUlJJVF9GX0JVVFRPTi9ISURFX0lOX1VOSUZJRURfTU9ERScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHVpLnNldFByb3BzKHtcbiAgICAgICAgICAgIGhpZGVJblVuaWZpZWRNb2RlOiBzaG91bGRIaWRlSW5VbmlmaWVkTW9kZSgpXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Ub2dnbGVEaXNwbGF5QXNPdmVybGF5OiBmdW5jdGlvbihjaGVja2VkKSB7XG4gICAgICAgICAgaWYgKGNoZWNrZWQpIHtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdHRVJSSVRfRl9CVVRUT04vRElTUExBWV9BU19PVkVSTEFZJywgJzEnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnR0VSUklUX0ZfQlVUVE9OL0RJU1BMQVlfQVNfT1ZFUkxBWScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHVpLnNldFByb3BzKHtcbiAgICAgICAgICAgIGRpc3BsYXlBc092ZXJsYXk6IHNob3VsZERpc3BsYXlBc092ZXJsYXkoKVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICBpbmplY3RDU1MoU3R5bGVzKTtcblxuICAgICAgLy8gQGV2ZW50ICdzaG93Y2hhbmdlJ1xuICAgICAgLy9cbiAgICAgIC8vIFRoaXMgd2lsbCBiZSB0cmlnZ2VyZWQgZXZlcnl0aW1lIHRoZSBjaGFuZ2UncyBcImxhbmRpbmdcIiBwYWdlIGlzXG4gICAgICAvLyB2aXNpdGVkLlxuICAgICAgLy9cbiAgICAgIC8vIFNlZSBodHRwczovL2dlcnJpdC1yZXZpZXcuZ29vZ2xlc291cmNlLmNvbS9Eb2N1bWVudGF0aW9uL2pzLWFwaS5odG1sI3NlbGZfb25cbiAgICAgIC8vXG4gICAgICAvLyBAcGFyYW0gY2hJbmZvXG4gICAgICAvLyAgIFNlZSBodHRwczovL2dlcnJpdC1yZXZpZXcuZ29vZ2xlc291cmNlLmNvbS9Eb2N1bWVudGF0aW9uL3Jlc3QtYXBpLWNoYW5nZXMuaHRtbCNjaGFuZ2UtaW5mb1xuICAgICAgLy9cbiAgICAgIC8vIEBwYXJhbSBydkluZm9cbiAgICAgIC8vICAgU2VlIGh0dHBzOi8vZ2Vycml0LXJldmlldy5nb29nbGVzb3VyY2UuY29tL0RvY3VtZW50YXRpb24vcmVzdC1hcGktY2hhbmdlcy5odG1sI3JldmlzaW9uLWluZm9cbiAgICAgIEdlcnJpdC5vbignc2hvd2NoYW5nZScsIGZ1bmN0aW9uKGNoSW5mbywgcnZJbmZvKSB7XG4gICAgICAgIGZldGNoRmlsZXNBbmRSZW5kZXIoY2hJbmZvLl9udW1iZXIsIHJ2SW5mby5fbnVtYmVyKTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBAZXZlbnQgJ2hpc3RvcnknXG4gICAgICAvL1xuICAgICAgLy8gVGhpcyBpcyB0cmlnZ2VyZWQgZXZlcnl0aW1lIGEgbmV3IHBhZ2UgaW4gdGhlIEdlcnJpdCBVSSBpcyB2aXNpdGVkO1xuICAgICAgLy8gd2UgYXJlIGludGVyZXN0ZWQgd2l0aCB0aGUgdmlzaXRzIHRvIHRoZSBmaWxlLWRpZmYgcGFnZXMgYmVjYXVzZSB3ZSdkXG4gICAgICAvLyBsaWtlIHRvIGhpZ2hsaWdodCB0aGUgY3VycmVudGx5IHZpZXdlZCBmaWxlLlxuICAgICAgLy9cbiAgICAgIC8vIFNlZSBodHRwczovL2dlcnJpdC1yZXZpZXcuZ29vZ2xlc291cmNlLmNvbS9Eb2N1bWVudGF0aW9uL2pzLWFwaS5odG1sI3NlbGZfb25cbiAgICAgIEdlcnJpdC5vbignaGlzdG9yeScsIGZ1bmN0aW9uKHRva2VuKSB7XG4gICAgICAgIGNvbnRleHQgPSBwYXJzZUNvbnRleHRGcm9tVVJMKHRva2VuKTtcblxuICAgICAgICBpZiAoY29udGV4dC5jaE51bWJlcikge1xuICAgICAgICAgIC8vIFRoaXMgaGFwcGVucyBpZiB0aGUgaW5pdGlhbCBVUkwgaXMgbm90IHRoZSBjaGFuZ2UncyBsYW5kaW5nIHBhZ2UsIGJ1dFxuICAgICAgICAgIC8vIGluc3RlYWQgYSBmaWxlLWRpZmYgcGFnZTsgdGhlIFwic2hvd2NoYW5nZVwiIGV2ZW50IHdvdWxkIG5vdCBiZSBlbWl0dGVkXG4gICAgICAgICAgLy8gaW4gdGhpcyBjYXNlIGFuZCB0aGVyZSdzIG5vIHdheSB0byBnZXQgdGhlIGNoYW5nZS9yZXZpc2lvbiBpbmZvcm1hdGlvblxuICAgICAgICAgIC8vIGJ1dCBmcm9tIHRoZSBVUkwuXG4gICAgICAgICAgaWYgKCFjYWNoZWRGaWxlcykge1xuICAgICAgICAgICAgZmV0Y2hGaWxlc0FuZFJlbmRlcihjb250ZXh0LmNoTnVtYmVyLCBjb250ZXh0LnJ2TnVtYmVyKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7IC8vIG5vIGxvbmdlciBpbiBhIGNoYW5nZT8gdW50cmFjayB0aGUgZG93bmxvYWRlZCBmaWxlIGxpc3RpbmdcbiAgICAgICAgICBjYWNoZWRGaWxlcyA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAhY29udGV4dC5jaE51bWJlciAvKiBub3Qgdmlld2luZyBhIGNoYW5nZT8gZm9yZ2V0IGl0ISAqLyB8fFxuICAgICAgICAgIChpc0luVW5pZmllZE1vZGUoKSAmJiBzaG91bGRIaWRlSW5VbmlmaWVkTW9kZSgpKVxuICAgICAgICApIHtcbiAgICAgICAgICBpZiAodWkuaXNNb3VudGVkKCkpIHtcbiAgICAgICAgICAgIHVpLnVubW91bnQoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoWyBlLmtleUNvZGUsIGUud2hpY2ggXS5pbmRleE9mKEtDX0YpID4gLTEpIHtcbiAgICAgICAgICBpZiAoISQoZS50YXJnZXQpLmlzKCdpbnB1dCwgdGV4dGFyZWEnKSkge1xuICAgICAgICAgICAgdWkudG9nZ2xlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgY29uc29sZS5sb2coJ2dlcnJpdC1mLWJ1dHRvbjogYWN0aXZlLicpO1xuXG4gICAgICBmdW5jdGlvbiBmZXRjaEZpbGVzQW5kUmVuZGVyKGNoTnVtYmVyLCBydk51bWJlcikge1xuICAgICAgICBmZXRjaChjaE51bWJlciwgcnZOdW1iZXIsIGZ1bmN0aW9uKGZpbGVzKSB7XG4gICAgICAgICAgY2FjaGVkRmlsZXMgPSBmaWxlcztcblxuICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB1aS5zZXRQcm9wcyh7XG4gICAgICAgICAgZmlsZXM6IGNhY2hlZEZpbGVzLFxuICAgICAgICAgIGN1cnJlbnRGaWxlOiBjb250ZXh0LmN1cnJlbnRGaWxlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn1cbiIsImltcG9ydCBHZXJyaXRGQnV0dG9uIGZyb20gJy4vY29yZSc7XG5pbXBvcnQgR2Vycml0RkJ1dHRvblVJIGZyb20gJy4vdWknO1xuaW1wb3J0IEdlcnJpdEZCdXR0b25TdHlsZXMgZnJvbSAnLi9zdHlsZXMnO1xuaW1wb3J0IHsgVHJlZVZpZXcsIGluamVjdENTUyB9IGZyb20gJy4vdXRpbHMnO1xuXG4vLyBIVE1MIHRlc3RzXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHdpbmRvdy5HZXJyaXRGQnV0dG9uICE9PSAndW5kZWZpbmVkJykge1xuICB3aW5kb3cuR2Vycml0RkJ1dHRvbi5Db3JlID0gR2Vycml0RkJ1dHRvbjtcbiAgd2luZG93LkdlcnJpdEZCdXR0b24uU3R5bGVzID0gR2Vycml0RkJ1dHRvblN0eWxlcztcbiAgd2luZG93LkdlcnJpdEZCdXR0b24uVUkgPSBHZXJyaXRGQnV0dG9uVUk7XG4gIHdpbmRvdy5HZXJyaXRGQnV0dG9uLmluamVjdENTUyA9IGluamVjdENTUztcbn1cbi8vIG1vY2hhIHRlc3RzXG5lbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICBleHBvcnRzLkNvcmUgPSBHZXJyaXRGQnV0dG9uO1xuICBleHBvcnRzLlVJID0gR2Vycml0RkJ1dHRvblVJO1xuICBleHBvcnRzLlRyZWVWaWV3ID0gVHJlZVZpZXc7XG59XG4vLyBHZXJyaXQgZW52XG5lbHNlIHtcbiAgdmFyIGdlcnJpdEZCdXR0b24gPSBuZXcgR2Vycml0RkJ1dHRvbigpO1xuICB2YXIgcG9sbGVyLCB0aW1lb3V0O1xuXG4gIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgIC8vIG5vdGU6IHRoaXMgZ3VhcmQgaXMgbm90IG5lY2Vzc2FyeSBvdXRzaWRlIG9mIGdyZWFzZS1tb25rZXkncyBjb250ZXh0IHNpbmNlXG4gICAgLy8gdGhlIHRpbWVvdXQgd2lsbCBiZSBjbGVhcmVkIGlmIHRoZSBwb2xsZXIncyB0ZXN0IHN1Y2NlZWRzLlxuICAgIGlmICghZ2Vycml0RkJ1dHRvbi5pbnN0YWxsZWQpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICdnZXJyaXQtZi1idXR0b246IG9uZSBvZiB3aW5kb3cuR2Vycml0IG9yIHdpbmRvdy5qUXVlcnkgaXMgbm90IHByZXNlbnQ7JyxcbiAgICAgICAgJ3BsdWdpbiB3aWxsIG5vdCB3b3JrLidcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gZm9yIHNvbWUgcmVhc29uLCB0aGlzIGlzbid0IHdvcmtpbmcgaW4gR3JlYXNlbW9ua2V5XG4gICAgcG9sbGVyID0gY2xlYXJJbnRlcnZhbChwb2xsZXIpO1xuICB9LCAzMDAwMCk7XG5cbiAgcG9sbGVyID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgaWYgKHdpbmRvdy5HZXJyaXQgJiYgd2luZG93LmpRdWVyeSkge1xuICAgICAgZ2Vycml0RkJ1dHRvbi5pbnN0YWxsKHdpbmRvdy5HZXJyaXQsIHdpbmRvdy5qUXVlcnkpO1xuXG4gICAgICAvLyBmb3Igc29tZSByZWFzb24sIHRoaXMgaXNuJ3Qgd29ya2luZyBpbiBHcmVhc2Vtb25rZXlcbiAgICAgIHBvbGxlciA9IGNsZWFySW50ZXJ2YWwocG9sbGVyKTtcbiAgICAgIHRpbWVvdXQgPSBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgfVxuICB9LCAyNTApO1xufSJdLCJuYW1lcyI6WyJHZXJyaXRGQnV0dG9uU3R5bGVzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0VBQUE7QUFDQSxBQUFPLEVBQUEsU0FBUyxRQUFRLENBQUMsUUFBUSxFQUFFO0FBQ25DLEVBQUEsRUFBRSxJQUFJLElBQUksR0FBRztBQUNiLEVBQUEsSUFBSSxLQUFLLEVBQUUsRUFBRTtBQUNiLEVBQUEsSUFBSSxRQUFRLEVBQUUsRUFBRTtBQUNoQixFQUFBLEdBQUcsQ0FBQzs7QUFFSixFQUFBLEVBQUUsU0FBUyxTQUFTLENBQUMsSUFBSSxFQUFFO0FBQzNCLEVBQUEsSUFBSSxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDakYsRUFBQSxJQUFJLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQzs7QUFFdEIsRUFBQSxJQUFJLFNBQVMsQ0FBQyxPQUFPLENBQUMsU0FBUyxRQUFRLEVBQUU7QUFDekMsRUFBQSxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFO0FBQ3RDLEVBQUEsUUFBUSxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFDaEUsRUFBQSxPQUFPOztBQUVQLEVBQUEsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN6QyxFQUFBLEtBQUssQ0FBQyxDQUFDOztBQUVQLEVBQUEsSUFBSSxPQUFPLE1BQU0sQ0FBQztBQUNsQixFQUFBLEdBQUc7O0FBRUgsRUFBQSxFQUFFLFFBQVEsQ0FBQyxPQUFPLENBQUMsU0FBUyxJQUFJLEVBQUU7QUFDbEMsRUFBQSxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoRixFQUFBLEdBQUcsQ0FBQyxDQUFDOztBQUVMLEVBQUEsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkLEVBQUEsQ0FBQzs7QUFFRCxBQUFPLEVBQUEsU0FBUyxRQUFRLENBQUMsVUFBVSxFQUFFO0FBQ3JDLEVBQUEsRUFBRSxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTSxDQUFDLFNBQVMsU0FBUyxFQUFFLEdBQUcsRUFBRTtBQUNqRSxFQUFBLElBQUksT0FBTyxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxTQUFTLENBQUM7QUFDbkUsRUFBQSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDVCxFQUFBLENBQUM7O0FBRUQsQUFBTyxFQUFBLFNBQVMsU0FBUyxDQUFDLE1BQU0sRUFBRTtBQUNsQyxFQUFBLEVBQUUsSUFBSSxTQUFTLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFbEQsRUFBQSxFQUFFLFNBQVMsQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDOztBQUUvQixFQUFBLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDdkMsRUFBQSxDQUFDOztBQUVELEFBQU8sRUFBQSxTQUFTLG1CQUFtQixDQUFDLENBQUMsRUFBRTtBQUN2QyxFQUFBLEVBQUUsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztBQUM5QixFQUFBLENBQUM7O0FBRUQsQUFBTyxFQUFBLFNBQVMsZUFBZSxDQUFDLE1BQU0sRUFBRTtBQUN4QyxFQUFBO0FBQ0EsRUFBQSxFQUFFLElBQUksT0FBTyxlQUFlLEtBQUssV0FBVyxFQUFFO0FBQzlDLEVBQUEsSUFBSSxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDNUIsRUFBQSxHQUFHO0FBQ0gsRUFBQTs7QUNwREEsZUFBZSxXQUFXO0FBQzFCLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7O0FBRUEsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBOztBQUVBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTs7QUFFQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7O0FBRUEsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBOztBQUVBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTs7QUFFQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7O0FBRUEsRUFBQTtBQUNBLEVBQUE7O0FBRUEsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7O0FBRUEsRUFBQTtBQUNBLEVBQUE7O0FBRUEsRUFBQTtBQUNBLEVBQUE7O0FBRUEsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7O0FBRUEsRUFBQTtBQUNBLEVBQUE7O0FBRUEsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBOztBQUVBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTs7QUFFQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTs7QUFFQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7O0FBRUEsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBOztBQUVBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTs7QUFFQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7O0FBRUEsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7O0FBRUEsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBOztBQUVBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBOztBQUVBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7O0FBRUEsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBOztBQUVBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTs7QUFFQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7O0FBRUEsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUM7O0VDNUpqRCxTQUFTLGVBQWUsQ0FBQyxDQUFDLEVBQUU7QUFDM0MsRUFBQSxFQUFFLElBQUksb0JBQW9CLEdBQUc7QUFDN0IsRUFBQSxJQUFJLE9BQU8sTUFBTSxLQUFLLFdBQVc7QUFDakMsRUFBQSxJQUFJLE9BQU8sV0FBVyxDQUFDLFNBQVMsQ0FBQyxzQkFBc0IsS0FBSyxVQUFVO0FBQ3RFLEVBQUEsR0FBRyxDQUFDOztBQUVKLEVBQUEsRUFBRSxJQUFJ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
