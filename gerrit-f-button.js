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
        url(data:application/font-woff;charset=utf-8;base64,d09GRgABAAAAAAYcAAsAAAAABdAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABPUy8yAAABCAAAAGAAAABgDxIGkmNtYXAAAAFoAAAAXAAAAFzqJOpPZ2FzcAAAAcQAAAAIAAAACAAAABBnbHlmAAABzAAAAaAAAAGgmkaKs2hlYWQAAANsAAAANgAAADYKmABpaGhlYQAAA6QAAAAkAAAAJAfBA8hobXR4AAADyAAAABwAAAAcEgAAQmxvY2EAAAPkAAAAEAAAABAAyAFUbWF4cAAAA/QAAAAgAAAAIAALADpuYW1lAAAEFAAAAeYAAAHmi/n6RXBvc3QAAAX8AAAAIAAAACAAAwAAAAMDgAGQAAUAAAKZAswAAACPApkCzAAAAesAMwEJAAAAAAAAAAAAAAAAAAAAARAAAAAAAAAAAAAAAAAAAAAAQAAA6egDwP/AAEADwABAAAAAAQAAAAAAAAAAAAAAIAAAAAAAAwAAAAMAAAAcAAEAAwAAABwAAwABAAAAHAAEAEAAAAAMAAgAAgAEAAEAIOmd6ej//f//AAAAAAAg6Z3p5//9//8AAf/jFmcWHgADAAEAAAAAAAAAAAAAAAAAAQAB//8ADwABAAAAAAAAAAAAAgAANzkBAAAAAAEAAAAAAAAAAAACAAA3OQEAAAAAAQAAAAAAAAAAAAIAADc5AQAAAAADAED/wAPAA8AAGQAhADcAAAEuAScuAScuASMhIgYVERQWMyEyNjURNCYnJx4BFyM1HgETFAYjISImNRE0NjMwOgIxFRQWOwEDlhEtGRozFycpC/4QIS8vIQLgIS8OHIUXJQ2aESmGCQf9IAcJCQebupsTDeAC2xczGhktERwOLyH8oCEvLyECcAspJzYXKRGaDSX86AcJCQcDYAcJ4A0TAAAAAAIAAQBAA/8DgAAPABsAAAEhIgYXEx4BMyEyNjcTNiYnNCYjIScjIgYdASED2PxQFBcEdgMiFAKgFCIDdgQXbBwU/lAg0BQcAwACwBwT/d4THBwTAiITHFAUHEAcFFAAAAIAAQBAA/8DgAAPABsAAAEyFgcDDgEjISImJwMmNjMlFSE1NDY7ARchMhYD2BQXBHYDIhT9YBQiA3YEFxMDWf0AHBTQIAGwFBwCQBwT/l4THBwTAaITHNCQ0BQcQBwAAAEAAAABAAC06R1LXw889QALBAAAAAAA07zd9gAAAADTvN32AAD/wAP/A8AAAAAIAAIAAAAAAAAAAQAAA8D/wAAABAAAAAAAA/8AAQAAAAAAAAAAAAAAAAAAAAcEAAAAAAAAAAAAAAACAAAABAAAQAQAAAEEAAABAAAAAAAKABQAHgBwAKAA0AABAAAABwA4AAMAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAADgCuAAEAAAAAAAEADwAAAAEAAAAAAAIABwCoAAEAAAAAAAMADwBOAAEAAAAAAAQADwC9AAEAAAAAAAUACwAtAAEAAAAAAAYADwB7AAEAAAAAAAoAGgDqAAMAAQQJAAEAHgAPAAMAAQQJAAIADgCvAAMAAQQJAAMAHgBdAAMAAQQJAAQAHgDMAAMAAQQJAAUAFgA4AAMAAQQJAAYAHgCKAAMAAQQJAAoANAEEZ2Vycml0LWYtYnV0dG9uAGcAZQByAHIAaQB0AC0AZgAtAGIAdQB0AHQAbwBuVmVyc2lvbiAxLjAAVgBlAHIAcwBpAG8AbgAgADEALgAwZ2Vycml0LWYtYnV0dG9uAGcAZQByAHIAaQB0AC0AZgAtAGIAdQB0AHQAbwBuZ2Vycml0LWYtYnV0dG9uAGcAZQByAHIAaQB0AC0AZgAtAGIAdQB0AHQAbwBuUmVndWxhcgBSAGUAZwB1AGwAYQByZ2Vycml0LWYtYnV0dG9uAGcAZQByAHIAaQB0AC0AZgAtAGIAdQB0AHQAbwBuRm9udCBnZW5lcmF0ZWQgYnkgSWNvTW9vbi4ARgBvAG4AdAAgAGcAZQBuAGUAcgBhAHQAZQBkACAAYgB5ACAASQBjAG8ATQBvAG8AbgAuAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==) format('woff'),
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

    .f-button__frame {
      position: fixed;
      top: 0;
      right: auto;
      bottom: 0;
      left: 0;

      width: 240px;
      overflow: auto;

      border-right: 1px solid #aaa;
      background: white;
      padding: 10px;

      font-size: 0.85em;
      line-height: 1.4;

      z-index: 6;
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
    var $activeRow;

    return {
      node: $frame[0],

      props: {
        files: [],
        currentFile: null,
        commentedOnly: false,
        hideInUnifiedMode: false,
        onToggleHideInUnifiedMode: Function.prototype,
      },

      isMounted: function() {
        return $frame.parent().length === 1;
      },

      mount: function(container) {
        var $container = $(container || document.body);

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

      unmount: function(container) {
        var $container = $(container || document.body);

        $frame.detach();
        $container.removeClass('gerrit--with-f-button');
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

    return {
      install: function(Gerrit, $) {
        var ui = GerritFButtonUI($);
        var context, cachedFiles;

        ui.setProps({
          hideInUnifiedMode: shouldHideInUnifiedMode(),
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2Vycml0LWYtYnV0dG9uLmpzIiwic291cmNlcyI6WyJzcmMvdXRpbHMuanMiLCJzcmMvc3R5bGVzLmpzIiwic3JjL3VpLmpzIiwic3JjL2NvcmUuanMiLCJzcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gVXRpbHNcbmV4cG9ydCBmdW5jdGlvbiBUcmVlVmlldyhmaWxlTGlzdCkge1xuICB2YXIgdHJlZSA9IHtcbiAgICBpdGVtczogW10sXG4gICAgY2hpbGRyZW46IHt9XG4gIH07XG5cbiAgZnVuY3Rpb24gZ2V0QnJhbmNoKHBhdGgpIHtcbiAgICB2YXIgZnJhZ21lbnRzID0gcGF0aC5zcGxpdCgnLycpLmZpbHRlcihmdW5jdGlvbih4KSB7IHJldHVybiB4Lmxlbmd0aCA+IDA7IH0pO1xuICAgIHZhciBicmFuY2ggPSB0cmVlO1xuXG4gICAgZnJhZ21lbnRzLmZvckVhY2goZnVuY3Rpb24oZnJhZ21lbnQpIHtcbiAgICAgIGlmICghYnJhbmNoLmNoaWxkcmVuW2ZyYWdtZW50XSkge1xuICAgICAgICBicmFuY2guY2hpbGRyZW5bZnJhZ21lbnRdID0geyBpdGVtczogW10sIGNoaWxkcmVuOiB7fSB9O1xuICAgICAgfVxuXG4gICAgICBicmFuY2ggPSBicmFuY2guY2hpbGRyZW5bZnJhZ21lbnRdO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGJyYW5jaDtcbiAgfVxuXG4gIGZpbGVMaXN0LmZvckVhY2goZnVuY3Rpb24oZmlsZSkge1xuICAgIGdldEJyYW5jaChmaWxlLmZpbGVQYXRoLnNwbGl0KCcvJykuc2xpY2UoMCwgLTEpLmpvaW4oJy8nKSkuaXRlbXMucHVzaChmaWxlKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHRyZWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGFzc1NldChjbGFzc05hbWVzKSB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhjbGFzc05hbWVzKS5yZWR1Y2UoZnVuY3Rpb24oY2xhc3NOYW1lLCBrZXkpIHtcbiAgICByZXR1cm4gISFjbGFzc05hbWVzW2tleV0gPyAoY2xhc3NOYW1lICsgJyAnICsga2V5KSA6IGNsYXNzTmFtZTtcbiAgfSwgJycpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0Q1NTKHN0cmluZykge1xuICB2YXIgc3R5bGVOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcblxuICBzdHlsZU5vZGUuaW5uZXJIVE1MID0gc3RyaW5nO1xuXG4gIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGVOb2RlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc2NhcmRMZWFkaW5nU2xhc2gocykge1xuICByZXR1cm4gcy5yZXBsYWNlKC9eXFwvLywgJycpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29weVRvQ2xpcGJvYXJkKHN0cmluZykge1xuICAvLyBHcmVhc2VNb25rZXkgc2FuZGJveDpcbiAgaWYgKHR5cGVvZiBHTV9zZXRDbGlwYm9hcmQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgR01fc2V0Q2xpcGJvYXJkKHN0cmluZyk7XG4gIH1cbn0iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHsvKlxuICBAZm9udC1mYWNlIHtcbiAgICBmb250LWZhbWlseTogJ2dlcnJpdC1mLWJ1dHRvbic7XG4gICAgc3JjOlxuICAgICAgdXJsKGRhdGE6YXBwbGljYXRpb24vZm9udC13b2ZmO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LGQwOUdSZ0FCQUFBQUFBWWNBQXNBQUFBQUJkQUFBUUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFCUFV5OHlBQUFCQ0FBQUFHQUFBQUJnRHhJR2ttTnRZWEFBQUFGb0FBQUFYQUFBQUZ6cUpPcFBaMkZ6Y0FBQUFjUUFBQUFJQUFBQUNBQUFBQkJuYkhsbUFBQUJ6QUFBQWFBQUFBR2dta2FLczJobFlXUUFBQU5zQUFBQU5nQUFBRFlLbUFCcGFHaGxZUUFBQTZRQUFBQWtBQUFBSkFmQkE4aG9iWFI0QUFBRHlBQUFBQndBQUFBY0VnQUFRbXh2WTJFQUFBUGtBQUFBRUFBQUFCQUF5QUZVYldGNGNBQUFBL1FBQUFBZ0FBQUFJQUFMQURwdVlXMWxBQUFFRkFBQUFlWUFBQUhtaS9uNlJYQnZjM1FBQUFYOEFBQUFJQUFBQUNBQUF3QUFBQU1EZ0FHUUFBVUFBQUtaQXN3QUFBQ1BBcGtDekFBQUFlc0FNd0VKQUFBQUFBQUFBQUFBQUFBQUFBQUFBUkFBQUFBQUFBQUFBQUFBQUFBQUFBQUFRQUFBNmVnRHdQL0FBRUFEd0FCQUFBQUFBUUFBQUFBQUFBQUFBQUFBSUFBQUFBQUFBd0FBQUFNQUFBQWNBQUVBQXdBQUFCd0FBd0FCQUFBQUhBQUVBRUFBQUFBTUFBZ0FBZ0FFQUFFQUlPbWQ2ZWovL2YvL0FBQUFBQUFnNlozcDUvLzkvLzhBQWYvakZtY1dIZ0FEQUFFQUFBQUFBQUFBQUFBQUFBQUFBUUFCLy84QUR3QUJBQUFBQUFBQUFBQUFBZ0FBTnprQkFBQUFBQUVBQUFBQUFBQUFBQUFDQUFBM09RRUFBQUFBQVFBQUFBQUFBQUFBQUFJQUFEYzVBUUFBQUFBREFFRC93QVBBQThBQUdRQWhBRGNBQUFFdUFTY3VBU2N1QVNNaElnWVZFUlFXTXlFeU5qVVJOQ1luSng0QkZ5TTFIZ0VURkFZaklTSW1OUkUwTmpNd09nSXhGUlFXT3dFRGxoRXRHUm96RnljcEMvNFFJUzh2SVFMZ0lTOE9ISVVYSlEyYUVTbUdDUWY5SUFjSkNRZWJ1cHNURGVBQzJ4Y3pHaGt0RVJ3T0x5SDhvQ0V2THlFQ2NBc3BKellYS1JHYURTWDg2QWNKQ1FjRFlBY0o0QTBUQUFBQUFBSUFBUUJBQS84RGdBQVBBQnNBQUFFaElnWVhFeDRCTXlFeU5qY1ROaVluTkNZaklTY2pJZ1lkQVNFRDJQeFFGQmNFZGdNaUZBS2dGQ0lEZGdRWGJCd1UvbEFnMEJRY0F3QUN3QndUL2Q0VEhCd1RBaUlUSEZBVUhFQWNGRkFBQUFJQUFRQkFBLzhEZ0FBUEFCc0FBQUV5RmdjRERnRWpJU0ltSndNbU5qTWxGU0UxTkRZN0FSY2hNaFlEMkJRWEJIWURJaFQ5WUJRaUEzWUVGeE1EV2YwQUhCVFFJQUd3RkJ3Q1FCd1QvbDRUSEJ3VEFhSVRITkNRMEJRY1FCd0FBQUVBQUFBQkFBQzA2UjFMWHc4ODlRQUxCQUFBQUFBQTA3emQ5Z0FBQUFEVHZOMzJBQUQvd0FQL0E4QUFBQUFJQUFJQUFBQUFBQUFBQVFBQUE4RC93QUFBQkFBQUFBQUFBLzhBQVFBQUFBQUFBQUFBQUFBQUFBQUFBQWNFQUFBQUFBQUFBQUFBQUFBQ0FBQUFCQUFBUUFRQUFBRUVBQUFCQUFBQUFBQUtBQlFBSGdCd0FLQUEwQUFCQUFBQUJ3QTRBQU1BQUFBQUFBSUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFEZ0N1QUFFQUFBQUFBQUVBRHdBQUFBRUFBQUFBQUFJQUJ3Q29BQUVBQUFBQUFBTUFEd0JPQUFFQUFBQUFBQVFBRHdDOUFBRUFBQUFBQUFVQUN3QXRBQUVBQUFBQUFBWUFEd0I3QUFFQUFBQUFBQW9BR2dEcUFBTUFBUVFKQUFFQUhnQVBBQU1BQVFRSkFBSUFEZ0N2QUFNQUFRUUpBQU1BSGdCZEFBTUFBUVFKQUFRQUhnRE1BQU1BQVFRSkFBVUFGZ0E0QUFNQUFRUUpBQVlBSGdDS0FBTUFBUVFKQUFvQU5BRUVaMlZ5Y21sMExXWXRZblYwZEc5dUFHY0FaUUJ5QUhJQWFRQjBBQzBBWmdBdEFHSUFkUUIwQUhRQWJ3QnVWbVZ5YzJsdmJpQXhMakFBVmdCbEFISUFjd0JwQUc4QWJnQWdBREVBTGdBd1oyVnljbWwwTFdZdFluVjBkRzl1QUdjQVpRQnlBSElBYVFCMEFDMEFaZ0F0QUdJQWRRQjBBSFFBYndCdVoyVnljbWwwTFdZdFluVjBkRzl1QUdjQVpRQnlBSElBYVFCMEFDMEFaZ0F0QUdJQWRRQjBBSFFBYndCdVVtVm5kV3hoY2dCU0FHVUFad0IxQUd3QVlRQnlaMlZ5Y21sMExXWXRZblYwZEc5dUFHY0FaUUJ5QUhJQWFRQjBBQzBBWmdBdEFHSUFkUUIwQUhRQWJ3QnVSbTl1ZENCblpXNWxjbUYwWldRZ1lua2dTV052VFc5dmJpNEFSZ0J2QUc0QWRBQWdBR2NBWlFCdUFHVUFjZ0JoQUhRQVpRQmtBQ0FBWWdCNUFDQUFTUUJqQUc4QVRRQnZBRzhBYmdBdUFBQUFBd0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUE9PSkgZm9ybWF0KCd3b2ZmJyksXG4gICAgICB1cmwoZGF0YTphcHBsaWNhdGlvbi94LWZvbnQtdHRmO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LEFBRUFBQUFMQUlBQUF3QXdUMU12TWc4U0JwSUFBQUM4QUFBQVlHTnRZWERxSk9wUEFBQUJIQUFBQUZ4bllYTndBQUFBRUFBQUFYZ0FBQUFJWjJ4NVpwcEdpck1BQUFHQUFBQUJvR2hsWVdRS21BQnBBQUFESUFBQUFEWm9hR1ZoQjhFRHlBQUFBMWdBQUFBa2FHMTBlQklBQUVJQUFBTjhBQUFBSEd4dlkyRUF5QUZVQUFBRG1BQUFBQkJ0WVhod0FBc0FPZ0FBQTZnQUFBQWdibUZ0Wll2NStrVUFBQVBJQUFBQjVuQnZjM1FBQXdBQUFBQUZzQUFBQUNBQUF3T0FBWkFBQlFBQUFwa0N6QUFBQUk4Q21RTE1BQUFCNndBekFRa0FBQUFBQUFBQUFBQUFBQUFBQUFBQkVBQUFBQUFBQUFBQUFBQUFBQUFBQUFCQUFBRHA2QVBBLzhBQVFBUEFBRUFBQUFBQkFBQUFBQUFBQUFBQUFBQWdBQUFBQUFBREFBQUFBd0FBQUJ3QUFRQURBQUFBSEFBREFBRUFBQUFjQUFRQVFBQUFBQXdBQ0FBQ0FBUUFBUUFnNlozcDZQLzkvLzhBQUFBQUFDRHBuZW5uLy8zLy93QUIvK01XWnhZZUFBTUFBUUFBQUFBQUFBQUFBQUFBQUFBQkFBSC8vd0FQQUFFQUFBQUFBQUFBQUFBQ0FBQTNPUUVBQUFBQUFRQUFBQUFBQUFBQUFBSUFBRGM1QVFBQUFBQUJBQUFBQUFBQUFBQUFBZ0FBTnprQkFBQUFBQU1BUVAvQUE4QUR3QUFaQUNFQU53QUFBUzRCSnk0Qkp5NEJJeUVpQmhVUkZCWXpJVEkyTlJFMEppY25IZ0VYSXpVZUFSTVVCaU1oSWlZMUVUUTJNekE2QWpFVkZCWTdBUU9XRVMwWkdqTVhKeWtML2hBaEx5OGhBdUFoTHc0Y2hSY2xEWm9SS1lZSkIvMGdCd2tKQjV1Nm14TU40QUxiRnpNYUdTMFJIQTR2SWZ5Z0lTOHZJUUp3Q3lrbk5oY3BFWm9OSmZ6b0J3a0pCd05nQnduZ0RSTUFBQUFBQWdBQkFFQUQvd09BQUE4QUd3QUFBU0VpQmhjVEhnRXpJVEkyTnhNMkppYzBKaU1oSnlNaUJoMEJJUVBZL0ZBVUZ3UjJBeUlVQXFBVUlnTjJCQmRzSEJUK1VDRFFGQndEQUFMQUhCUDkzaE1jSEJNQ0loTWNVQlFjUUJ3VVVBQUFBZ0FCQUVBRC93T0FBQThBR3dBQUFUSVdCd01PQVNNaElpWW5BeVkyTXlVVklUVTBOanNCRnlFeUZnUFlGQmNFZGdNaUZQMWdGQ0lEZGdRWEV3TlovUUFjRk5BZ0FiQVVIQUpBSEJQK1hoTWNIQk1Cb2hNYzBKRFFGQnhBSEFBQUFRQUFBQUVBQUxUcEhVdGZEenoxQUFzRUFBQUFBQURUdk4zMkFBQUFBTk84M2ZZQUFQL0FBLzhEd0FBQUFBZ0FBZ0FBQUFBQUFBQUJBQUFEd1AvQUFBQUVBQUFBQUFBRC93QUJBQUFBQUFBQUFBQUFBQUFBQUFBQUJ3UUFBQUFBQUFBQUFBQUFBQUlBQUFBRUFBQkFCQUFBQVFRQUFBRUFBQUFBQUFvQUZBQWVBSEFBb0FEUUFBRUFBQUFIQURnQUF3QUFBQUFBQWdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT0FLNEFBUUFBQUFBQUFRQVBBQUFBQVFBQUFBQUFBZ0FIQUtnQUFRQUFBQUFBQXdBUEFFNEFBUUFBQUFBQUJBQVBBTDBBQVFBQUFBQUFCUUFMQUMwQUFRQUFBQUFBQmdBUEFIc0FBUUFBQUFBQUNnQWFBT29BQXdBQkJBa0FBUUFlQUE4QUF3QUJCQWtBQWdBT0FLOEFBd0FCQkFrQUF3QWVBRjBBQXdBQkJBa0FCQUFlQU13QUF3QUJCQWtBQlFBV0FEZ0FBd0FCQkFrQUJnQWVBSW9BQXdBQkJBa0FDZ0EwQVFSblpYSnlhWFF0WmkxaWRYUjBiMjRBWndCbEFISUFjZ0JwQUhRQUxRQm1BQzBBWWdCMUFIUUFkQUJ2QUc1V1pYSnphVzl1SURFdU1BQldBR1VBY2dCekFHa0Fid0J1QUNBQU1RQXVBREJuWlhKeWFYUXRaaTFpZFhSMGIyNEFad0JsQUhJQWNnQnBBSFFBTFFCbUFDMEFZZ0IxQUhRQWRBQnZBRzVuWlhKeWFYUXRaaTFpZFhSMGIyNEFad0JsQUhJQWNnQnBBSFFBTFFCbUFDMEFZZ0IxQUhRQWRBQnZBRzVTWldkMWJHRnlBRklBWlFCbkFIVUFiQUJoQUhKblpYSnlhWFF0WmkxaWRYUjBiMjRBWndCbEFISUFjZ0JwQUhRQUxRQm1BQzBBWWdCMUFIUUFkQUJ2QUc1R2IyNTBJR2RsYm1WeVlYUmxaQ0JpZVNCSlkyOU5iMjl1TGdCR0FHOEFiZ0IwQUNBQVp3QmxBRzRBWlFCeUFHRUFkQUJsQUdRQUlBQmlBSGtBSUFCSkFHTUFid0JOQUc4QWJ3QnVBQzRBQUFBREFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUEpIGZvcm1hdCgndHJ1ZXR5cGUnKSxcbiAgICAgIHVybChkYXRhOmltYWdlL3N2Zyt4bWw7Y2hhcnNldD11dGYtODtiYXNlNjQsUEQ5NGJXd2dkbVZ5YzJsdmJqMGlNUzR3SWlCemRHRnVaR0ZzYjI1bFBTSnVieUkvUGdvOElVUlBRMVJaVUVVZ2MzWm5JRkJWUWt4SlF5QWlMUzh2VnpOREx5OUVWRVFnVTFaSElERXVNUzh2UlU0aUlDSm9kSFJ3T2k4dmQzZDNMbmN6TG05eVp5OUhjbUZ3YUdsamN5OVRWa2N2TVM0eEwwUlVSQzl6ZG1jeE1TNWtkR1FpSUQ0S1BITjJaeUI0Yld4dWN6MGlhSFIwY0RvdkwzZDNkeTUzTXk1dmNtY3ZNakF3TUM5emRtY2lQZ284YldWMFlXUmhkR0UrUjJWdVpYSmhkR1ZrSUdKNUlFbGpiMDF2YjI0OEwyMWxkR0ZrWVhSaFBnbzhaR1ZtY3o0S1BHWnZiblFnYVdROUltZGxjbkpwZEMxbUxXSjFkSFJ2YmlJZ2FHOXlhWG90WVdSMkxYZzlJakV3TWpRaVBnbzhabTl1ZEMxbVlXTmxJSFZ1YVhSekxYQmxjaTFsYlQwaU1UQXlOQ0lnWVhOalpXNTBQU0k1TmpBaUlHUmxjMk5sYm5ROUlpMDJOQ0lnTHo0S1BHMXBjM05wYm1jdFoyeDVjR2dnYUc5eWFYb3RZV1IyTFhnOUlqRXdNalFpSUM4K0NqeG5iSGx3YUNCMWJtbGpiMlJsUFNJbUkzZ3lNRHNpSUdodmNtbDZMV0ZrZGkxNFBTSTFNVElpSUdROUlpSWdMejRLUEdkc2VYQm9JSFZ1YVdOdlpHVTlJaVlqZUdVNU9XUTdJaUJuYkhsd2FDMXVZVzFsUFNKbWFXeGxJaUJrUFNKTk9URTNMamd3TmlBM016QXVPVEkwWXkweU1pNHlNVElnTXpBdU1qa3lMVFV6TGpFM05DQTJOUzQzTFRnM0xqRTNPQ0E1T1M0M01EUnpMVFk1TGpReE1pQTJOQzQ1TmpRdE9Ua3VOekEwSURnM0xqRTNPR010TlRFdU5UYzBJRE0zTGpneUxUYzJMalU1TWlBME1pNHhPVFF0T1RBdU9USTBJRFF5TGpFNU5HZ3RORGsyWXkwME5DNHhNVElnTUMwNE1DMHpOUzQ0T0RndE9EQXRPREIyTFRnMk5HTXdMVFEwTGpFeE1pQXpOUzQ0T0RndE9EQWdPREF0T0RCb056TTJZelEwTGpFeE1pQXdJRGd3SURNMUxqZzRPQ0E0TUNBNE1IWTJNalJqTUNBeE5DNHpNekl0TkM0ek56SWdNemt1TXpVdE5ESXVNVGswSURrd0xqa3lOSHBOTnpnMUxqTTNOQ0EzT0RVdU16YzBZek13TGpjdE16QXVOeUExTkM0NExUVTRMak01T0NBM01pNDFPQzA0TVM0ek56Um9MVEUxTXk0NU5UUjJNVFV6TGprME5tTXlNaTQ1T0RRdE1UY3VOemdnTlRBdU5qYzRMVFF4TGpnM09DQTRNUzR6TnpRdE56SXVOVGN5ZWswNE9UWWdNVFpqTUMwNExqWTNNaTAzTGpNeU9DMHhOaTB4TmkweE5tZ3ROek0yWXkwNExqWTNNaUF3TFRFMklEY3VNekk0TFRFMklERTJkamcyTkdNd0lEZ3VOamN5SURjdU16STRJREUySURFMklERTJJREFnTUNBME9UVXVPVFUySURBdU1EQXlJRFE1TmlBd2RpMHlNalJqTUMweE55NDJOeklnTVRRdU16STJMVE15SURNeUxUTXlhREl5TkhZdE5qSTBlaUlnTHo0S1BHZHNlWEJvSUhWdWFXTnZaR1U5SWlZamVHVTVaVGM3SWlCbmJIbHdhQzF1WVcxbFBTSm1iMnhrWlhJaUlHUTlJazA1T0RRdU5TQTNNRFJvTFRrME5XTXRNall1TkNBd0xUUXpMamMyTkMweU1TNHhPQzB6T0M0MU9EWXRORGN1TURZNGJERXhOeTQyTnpJdE5UUTFMamcyTkdNMUxqRTNPQzB5TlM0NE9EZ2dNekV1TURFMExUUTNMakEyT0NBMU55NDBNVFF0TkRjdU1EWTRhRFkzTW1NeU5pNHpPVGdnTUNBMU1pNHlNelFnTWpFdU1UZ2dOVGN1TkRFeUlEUTNMakEyT0d3eE1UY3VOamMwSURVME5TNDROalJqTlM0eE56Z2dNalV1T0RnNExURXlMakU0T0NBME55NHdOamd0TXpndU5UZzJJRFEzTGpBMk9IcE5PRGsySURjNE5HTXdJREkyTGpVeExUSXhMalE1SURRNExUUTRJRFE0YUMwME16SnNMVE15SURZMGFDMHlNRGhqTFRJMkxqVXhJREF0TkRndE1qRXVORGt0TkRndE5EaDJMVGd3YURjMk9IWXhObm9pSUM4K0NqeG5iSGx3YUNCMWJtbGpiMlJsUFNJbUkzaGxPV1U0T3lJZ1oyeDVjR2d0Ym1GdFpUMGlabTlzWkdWeUxTMXZjR1Z1SWlCa1BTSk5PVGcwTGpVZ05UYzJZekkyTGpRZ01DQTBNeTQzTmpRdE1qRXVNVGdnTXpndU5UZzJMVFEzTGpBMk9Hd3RNVEUzTGpZM01pMDBNVGN1T0RZMFl5MDFMakUzT0MweU5TNDRPRGd0TXpFdU1ERTBMVFEzTGpBMk9DMDFOeTQwTVRRdE5EY3VNRFk0YUMwMk56SmpMVEkyTGpRZ01DMDFNaTR5TXpZZ01qRXVNVGd0TlRjdU5ERTBJRFEzTGpBMk9Hd3RNVEUzTGpZM01pQTBNVGN1T0RZMFl5MDFMakUzT0NBeU5TNDRPRGdnTVRJdU1UZzJJRFEzTGpBMk9DQXpPQzQxT0RZZ05EY3VNRFk0YURrME5YcE5PRGsySURjNE5IWXRNVFEwYUMwM05qaDJNakE0WXpBZ01qWXVOVEVnTWpFdU5Ea2dORGdnTkRnZ05EaG9NakE0YkRNeUxUWTBhRFF6TW1NeU5pNDFNU0F3SURRNExUSXhMalE1SURRNExUUTRlaUlnTHo0S1BDOW1iMjUwUGp3dlpHVm1jejQ4TDNOMlp6ND0pIGZvcm1hdCgnc3ZnJylcbiAgICA7XG4gICAgZm9udC13ZWlnaHQ6IG5vcm1hbDtcbiAgICBmb250LXN0eWxlOiBub3JtYWw7XG4gIH1cblxuICBbY2xhc3NePVwiZi1idXR0b24taWNvbl9fXCJdLFxuICBbY2xhc3MqPVwiIGYtYnV0dG9uLWljb25fX1wiXSB7XG4gICAgZm9udC1mYW1pbHk6ICdnZXJyaXQtZi1idXR0b24nICFpbXBvcnRhbnQ7XG4gICAgc3BlYWs6IG5vbmU7XG4gICAgZm9udC1zdHlsZTogbm9ybWFsO1xuICAgIGZvbnQtd2VpZ2h0OiBub3JtYWw7XG4gICAgZm9udC12YXJpYW50OiBub3JtYWw7XG4gICAgdGV4dC10cmFuc2Zvcm06IG5vbmU7XG4gICAgbGluZS1oZWlnaHQ6IDE7XG5cbiAgICAtd2Via2l0LWZvbnQtc21vb3RoaW5nOiBhbnRpYWxpYXNlZDtcbiAgICAtbW96LW9zeC1mb250LXNtb290aGluZzogZ3JheXNjYWxlO1xuICB9XG5cbiAgLmYtYnV0dG9uLWljb25fX2ZpbGU6YmVmb3JlIHtcbiAgICBjb250ZW50OiBcIlxcZTk5ZFwiO1xuICB9XG4gIC5mLWJ1dHRvbi1pY29uX19mb2xkZXI6YmVmb3JlIHtcbiAgICBjb250ZW50OiBcIlxcZTllN1wiO1xuICB9XG4gIC5mLWJ1dHRvbi1pY29uX19mb2xkZXItLW9wZW46YmVmb3JlIHtcbiAgICBjb250ZW50OiBcIlxcZTllOFwiO1xuICB9XG5cbiAgYm9keS5nZXJyaXQtLXdpdGgtZi1idXR0b24ge1xuICAgIG1hcmdpbi1sZWZ0OiAyODBweDtcbiAgfVxuXG4gIC5mLWJ1dHRvbl9fZnJhbWUge1xuICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICB0b3A6IDA7XG4gICAgcmlnaHQ6IGF1dG87XG4gICAgYm90dG9tOiAwO1xuICAgIGxlZnQ6IDA7XG5cbiAgICB3aWR0aDogMjQwcHg7XG4gICAgb3ZlcmZsb3c6IGF1dG87XG5cbiAgICBib3JkZXItcmlnaHQ6IDFweCBzb2xpZCAjYWFhO1xuICAgIGJhY2tncm91bmQ6IHdoaXRlO1xuICAgIHBhZGRpbmc6IDEwcHg7XG5cbiAgICBmb250LXNpemU6IDAuODVlbTtcbiAgICBsaW5lLWhlaWdodDogMS40O1xuXG4gICAgei1pbmRleDogNjtcbiAgfVxuXG4gIC5mLWJ1dHRvbl9fZnJhbWUtLWNvbW1lbnRlZC1vbmx5IC5mLWJ1dHRvbi1maWxlOm5vdCguZi1idXR0b24tZmlsZS0tY29tbWVudGVkKSB7XG4gICAgZGlzcGxheTogbm9uZTtcbiAgfVxuXG4gIC5mLWJ1dHRvbl9fY29udHJvbHMge1xuICAgIHBhZGRpbmctYm90dG9tOiAxZW07XG4gICAgbWFyZ2luLWJvdHRvbTogMWVtO1xuICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjZGRkO1xuICB9XG5cbiAgLmYtYnV0dG9uX19jb250cm9scyBsYWJlbCB7XG4gICAgZGlzcGxheTogYmxvY2s7XG4gIH1cblxuICAuZi1idXR0b24tZmlsZSB7XG4gICAgbGlzdC1zdHlsZTogbm9uZTtcbiAgfVxuXG4gIC5mLWJ1dHRvbi1maWxlOmhvdmVyIHtcbiAgICBiYWNrZ3JvdW5kOiAjZmNmYTk2O1xuICB9XG5cbiAgLmYtYnV0dG9uLWZpbGUtLWFjdGl2ZSB7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogI0RFRjtcbiAgfVxuXG4gIC5mLWJ1dHRvbi1maWxlX19pY29uIHtcbiAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gICAgd2lkdGg6IDE2cHg7XG4gICAgaGVpZ2h0OiAxNnB4O1xuICAgIHZlcnRpY2FsLWFsaWduOiBtaWRkbGU7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIHRleHQtYWxpZ246IGxlZnQ7XG4gIH1cblxuICAuZi1idXR0b24tZmlsZV9fbGluayB7XG4gICAgZGlzcGxheTogYmxvY2s7XG4gICAgbWFyZ2luLXJpZ2h0OiAyZW07XG4gICAgbWFyZ2luLWxlZnQ6IDE2cHg7XG4gICAgcGFkZGluZy1sZWZ0OiAwLjI1ZW07XG4gICAgbGluZS1oZWlnaHQ6IDEuNjtcbiAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XG4gICAgd29yZC1icmVhazogYnJlYWstYWxsO1xuICB9XG5cbiAgLmYtYnV0dG9uLWZpbGVfX2ZvbGRlciB7XG4gICAgbGlzdC1zdHlsZTogbm9uZTtcbiAgICBtYXJnaW4tbGVmdDogMDtcbiAgICBwYWRkaW5nLWxlZnQ6IDAuNWVtO1xuICB9XG5cbiAgLmYtYnV0dG9uLWZpbGVfX2ZvbGRlci1oZWFkZXIge1xuICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xuICAgIG1hcmdpbi1sZWZ0OiAxLjVlbTtcbiAgfVxuXG4gIC5mLWJ1dHRvbi1maWxlX19mb2xkZXItaGVhZGVyIC5mLWJ1dHRvbi1pY29uX19mb2xkZXIge1xuICAgIG1hcmdpbi1sZWZ0OiAtMS41ZW07XG4gIH1cblxuICAuZi1idXR0b24tZmlsZV9fZm9sZGVyLS1yb290IHtcbiAgICBwYWRkaW5nLWxlZnQ6IDA7XG4gIH1cblxuICAuZi1idXR0b24tZmlsZV9fY29tbWVudC1jb3VudCB7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIHJpZ2h0OiAwO1xuICAgIG1heC13aWR0aDogMmVtO1xuICAgIHBhZGRpbmctcmlnaHQ6IDFlbTtcbiAgICB0ZXh0LWFsaWduOiByaWdodDtcbiAgICBmb250LXdlaWdodDogYm9sZDtcbiAgICBsaW5lLWhlaWdodDogMS42O1xuICB9XG5cbiAgLmYtYnV0dG9uLWZpbGVfX2ljb24uZi1idXR0b24taWNvbl9fZmlsZSAgIHsgbGluZS1oZWlnaHQ6IGluaGVyaXQ7IG1hcmdpbi10b3A6IDFweDsgfVxuICAuZi1idXR0b24tZmlsZV9faWNvbi5mLWJ1dHRvbi1pY29uX19mb2xkZXIgeyBtYXJnaW4tdG9wOiAycHg7IH1cbiovfS50b1N0cmluZygpLnJlcGxhY2UoJ2Z1bmN0aW9uICgpIHsvKicsICcnKS5yZXBsYWNlKCcqL30nLCAnJyk7IiwiaW1wb3J0IHsgVHJlZVZpZXcsIGNsYXNzU2V0LCBjb3B5VG9DbGlwYm9hcmQgfSBmcm9tICcuL3V0aWxzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gR2Vycml0RkJ1dHRvblVJKCQpIHtcbiAgdmFyIEhBU19TQ1JPTExfSU5UT19WSUVXID0gKFxuICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmXG4gICAgdHlwZW9mIEhUTUxFbGVtZW50LnByb3RvdHlwZS5zY3JvbGxJbnRvVmlld0lmTmVlZGVkID09PSAnZnVuY3Rpb24nXG4gICk7XG5cbiAgdmFyICRmcmFtZSA9ICQoJzxkaXYgLz4nLCB7ICdjbGFzcyc6ICdmLWJ1dHRvbl9fZnJhbWUnIH0pO1xuICB2YXIgJGFjdGl2ZVJvdztcblxuICByZXR1cm4ge1xuICAgIG5vZGU6ICRmcmFtZVswXSxcblxuICAgIHByb3BzOiB7XG4gICAgICBmaWxlczogW10sXG4gICAgICBjdXJyZW50RmlsZTogbnVsbCxcbiAgICAgIGNvbW1lbnRlZE9ubHk6IGZhbHNlLFxuICAgICAgaGlkZUluVW5pZmllZE1vZGU6IGZhbHNlLFxuICAgICAgb25Ub2dnbGVIaWRlSW5VbmlmaWVkTW9kZTogRnVuY3Rpb24ucHJvdG90eXBlLFxuICAgIH0sXG5cbiAgICBpc01vdW50ZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICRmcmFtZS5wYXJlbnQoKS5sZW5ndGggPT09IDE7XG4gICAgfSxcblxuICAgIG1vdW50OiBmdW5jdGlvbihjb250YWluZXIpIHtcbiAgICAgIHZhciAkY29udGFpbmVyID0gJChjb250YWluZXIgfHwgZG9jdW1lbnQuYm9keSk7XG5cbiAgICAgICRjb250YWluZXIuYWRkQ2xhc3MoJ2dlcnJpdC0td2l0aC1mLWJ1dHRvbicpO1xuICAgICAgJGNvbnRhaW5lci5hcHBlbmQoJGZyYW1lKTtcblxuICAgICAgdGhpcy5jb21wb25lbnREaWRSZW5kZXIoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2hvdyBvciBoaWRlIHRoZSBGIGJ1dHRvbiBmcmFtZS5cbiAgICAgKi9cbiAgICB0b2dnbGU6IGZ1bmN0aW9uKGNvbnRhaW5lcikge1xuICAgICAgaWYgKHRoaXMuaXNNb3VudGVkKCkpIHtcbiAgICAgICAgdGhpcy51bm1vdW50KGNvbnRhaW5lcik7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5tb3VudChjb250YWluZXIpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICB1bm1vdW50OiBmdW5jdGlvbihjb250YWluZXIpIHtcbiAgICAgIHZhciAkY29udGFpbmVyID0gJChjb250YWluZXIgfHwgZG9jdW1lbnQuYm9keSk7XG5cbiAgICAgICRmcmFtZS5kZXRhY2goKTtcbiAgICAgICRjb250YWluZXIucmVtb3ZlQ2xhc3MoJ2dlcnJpdC0td2l0aC1mLWJ1dHRvbicpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgdGhlIEYgYnV0dG9uIHdpdGggbmV3IHBhcmFtZXRlcnMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcHJvcHNcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7T2JqZWN0W119IHByb3BzLmZpbGVzXG4gICAgICogICAgICAgIFRoZSBsaXN0IG9mIHBhdGNoLXNldCBmaWxlcyB3aXRoIG9yIHdpdGhvdXQgY29tbWVudCBkYXRhLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHByb3BzLmN1cnJlbnRGaWxlXG4gICAgICogICAgICAgIEZpbGUgcGF0aCBvZiB0aGUgZmlsZSBiZWluZyBjdXJyZW50bHkgYnJvd3NlZCBpbiBnZXJyaXQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IHByb3BzLmNvbW1lbnRlZE9ubHlcbiAgICAgKiAgICAgICAgV2hldGhlciB0byBsaXN0IG9ubHkgdGhlIGZpbGVzIHRoYXQgaGF2ZSBjb21tZW50cy5cbiAgICAgKi9cbiAgICBzZXRQcm9wczogZnVuY3Rpb24ocHJvcHMpIHtcbiAgICAgIE9iamVjdC5rZXlzKHByb3BzKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgICB0aGlzLnByb3BzW2tleV0gPSBwcm9wc1trZXldO1xuICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBjb21wb25lbnREaWRSZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gU2Nyb2xsIHRoZSBhY3RpdmUgcm93IGludG8gdmlldywgdmVyeSBoYW5keSB3aGVuIHRoZSBQUyBoYXMgbWFueSBmaWxlcy5cbiAgICAgIGlmICgkYWN0aXZlUm93ICYmIEhBU19TQ1JPTExfSU5UT19WSUVXKSB7XG4gICAgICAgICRhY3RpdmVSb3dbMF0uc2Nyb2xsSW50b1ZpZXdJZk5lZWRlZCgpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgJGZpbGVzID0gdGhpcy5yZW5kZXJGaWxlcyh0aGlzLnByb3BzLmZpbGVzLCB0aGlzLnByb3BzLmN1cnJlbnRGaWxlKTtcbiAgICAgIHZhciAkY29udHJvbHMgPSB0aGlzLnJlbmRlckNvbnRyb2xzKCk7XG5cbiAgICAgICRmcmFtZVxuICAgICAgICAuZW1wdHkoKVxuICAgICAgICAuYXBwZW5kKCRjb250cm9scylcbiAgICAgICAgLmFwcGVuZCgkZmlsZXMpXG4gICAgICAgIC50b2dnbGVDbGFzcygnZi1idXR0b25fX2ZyYW1lLS1jb21tZW50ZWQtb25seScsIHRoaXMucHJvcHMuY29tbWVudGVkT25seSlcbiAgICAgIDtcblxuICAgICAgdGhpcy5jb21wb25lbnREaWRSZW5kZXIoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICByZW5kZXJGaWxlczogZnVuY3Rpb24oZmlsZXMsIGN1cnJlbnRGaWxlKSB7XG4gICAgICB2YXIgJGxpc3QgPSAkKCc8ZGl2IC8+JywgeyAnY2xhc3MnOiAnZi1idXR0b25fX3RhYmxlJyB9KTtcbiAgICAgIHZhciBmaWxlVHJlZSA9IFRyZWVWaWV3KGZpbGVzKTtcblxuICAgICAgJGFjdGl2ZVJvdyA9IG51bGw7XG4gICAgICAkbGlzdC5hcHBlbmQodGhpcy5yZW5kZXJGaWxlVHJlZShmaWxlVHJlZSwgY3VycmVudEZpbGUsIHRydWUpKTtcblxuICAgICAgcmV0dXJuICRsaXN0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHJlbmRlckZpbGVUcmVlOiBmdW5jdGlvbih0cmVlLCBjdXJyZW50RmlsZSwgaXNSb290KSB7XG4gICAgICB2YXIgJGxpc3QgPSAkKCc8b2wgLz4nLCB7XG4gICAgICAgIGNsYXNzOiBjbGFzc1NldCh7XG4gICAgICAgICAgJ2YtYnV0dG9uLWZpbGVfX2ZvbGRlcic6IHRydWUsXG4gICAgICAgICAgJ2YtYnV0dG9uLWZpbGVfX2ZvbGRlci0tcm9vdCc6IGlzUm9vdCA9PT0gdHJ1ZVxuICAgICAgICB9KVxuICAgICAgfSk7XG5cbiAgICAgIC8vIGZvbGRlcnM6XG4gICAgICBPYmplY3Qua2V5cyh0cmVlLmNoaWxkcmVuKS5zb3J0KCkuZm9yRWFjaChmdW5jdGlvbihicmFuY2gpIHtcbiAgICAgICAgdmFyICRjaGlsZHJlbiA9IHRoaXMucmVuZGVyRmlsZVRyZWUodHJlZS5jaGlsZHJlblticmFuY2hdLCBjdXJyZW50RmlsZSk7XG5cbiAgICAgICAgaWYgKCEkY2hpbGRyZW4pIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciAkZm9sZGVySGVhZGVyID0gJCgnPGhlYWRlciAvPicsIHsgY2xhc3M6ICdmLWJ1dHRvbi1maWxlX19mb2xkZXItaGVhZGVyJyB9KTtcblxuICAgICAgICAkZm9sZGVySGVhZGVyLmFwcGVuZChcbiAgICAgICAgICAkKCc8c3BhbiAvPicsIHsgY2xhc3M6ICdmLWJ1dHRvbi1maWxlX19pY29uIGYtYnV0dG9uLWljb25fX2ZvbGRlcicgfSlcbiAgICAgICAgKTtcblxuICAgICAgICAkZm9sZGVySGVhZGVyLmFwcGVuZCgkKCc8c3BhbiAvPicpLnRleHQoYnJhbmNoICsgJy8nKSk7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAkKCc8bGkgLz4nKVxuICAgICAgICAgICAgLmFwcGVuZCgkZm9sZGVySGVhZGVyKVxuICAgICAgICAgICAgLmFwcGVuZCgkY2hpbGRyZW4pXG4gICAgICAgICAgICAuYXBwZW5kVG8oJGxpc3QpXG4gICAgICAgICk7XG4gICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAvLyBmaWxlczpcbiAgICAgIHRyZWUuaXRlbXMuZm9yRWFjaChmdW5jdGlvbihmaWxlKSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmNvbW1lbnRlZE9ubHkgJiYgKCFmaWxlLmNvbW1lbnRzIHx8ICFmaWxlLmNvbW1lbnRzLmxlbmd0aCkpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgICRsaXN0LmFwcGVuZCh0aGlzLnJlbmRlckZpbGUoZmlsZSwgY3VycmVudEZpbGUpKTtcbiAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgIHJldHVybiAkbGlzdC5jaGlsZHJlbigpLmxlbmd0aCA9PT0gMCA/IG51bGwgOiAkbGlzdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICByZW5kZXJGaWxlOiBmdW5jdGlvbihmaWxlLCBjdXJyZW50RmlsZSkge1xuICAgICAgdmFyIGZpbGVQYXRoID0gZmlsZS5maWxlUGF0aDtcbiAgICAgIHZhciBmaWxlTmFtZSA9IGZpbGUuZmlsZVBhdGguc3BsaXQoJy8nKS5zbGljZSgtMSlbMF07XG4gICAgICB2YXIgaGFzQ29tbWVudHMgPSBmaWxlLmNvbW1lbnRzICYmIGZpbGUuY29tbWVudHMubGVuZ3RoID4gMDtcbiAgICAgIHZhciAkcm93ID0gJCgnPGxpIC8+Jywge1xuICAgICAgICBjbGFzczogY2xhc3NTZXQoe1xuICAgICAgICAgICdmLWJ1dHRvbi1maWxlJzogdHJ1ZSxcbiAgICAgICAgICAnZi1idXR0b24tZmlsZS0tYWN0aXZlJzogY3VycmVudEZpbGUgPT09IGZpbGVQYXRoLFxuICAgICAgICAgICdmLWJ1dHRvbi1maWxlLS1jb21tZW50ZWQnOiBoYXNDb21tZW50c1xuICAgICAgICB9KVxuICAgICAgfSk7XG5cbiAgICAgIGlmIChjdXJyZW50RmlsZSA9PT0gZmlsZVBhdGgpIHtcbiAgICAgICAgJGFjdGl2ZVJvdyA9ICRyb3c7XG4gICAgICB9XG5cbiAgICAgICRyb3cuYXBwZW5kKFxuICAgICAgICAkKCc8c3BhbiAvPicsIHtcbiAgICAgICAgICBjbGFzczogJ2YtYnV0dG9uLWZpbGVfX2NvbW1lbnQtY291bnQnXG4gICAgICAgIH0pLnRleHQoaGFzQ29tbWVudHMgPyBmaWxlLmNvbW1lbnRzLmxlbmd0aCA6ICcnKVxuICAgICAgKTtcblxuICAgICAgJHJvdy5hcHBlbmQoXG4gICAgICAgICQoJzxzcGFuIC8+Jywge1xuICAgICAgICAgIGNsYXNzOiAnZi1idXR0b24taWNvbl9fZmlsZSBmLWJ1dHRvbi1maWxlX19pY29uJyxcbiAgICAgICAgICB0aXRsZTogJ0NvcHkgZmlsZXBhdGggdG8gY2xpcGJvYXJkJ1xuICAgICAgICB9KS5iaW5kKCdjbGljaycsIHRoaXMuY29weVRvQ2xpcGJvYXJkLmJpbmQodGhpcywgZmlsZVBhdGgpKVxuICAgICAgKTtcblxuICAgICAgJHJvdy5hcHBlbmQoXG4gICAgICAgICQoJzxhIC8+Jywge1xuICAgICAgICAgIGhyZWY6IGZpbGUudXJsLFxuICAgICAgICAgIGNsYXNzOiAnZi1idXR0b24tZmlsZV9fbGluaydcbiAgICAgICAgfSkudGV4dChmaWxlTmFtZSlcbiAgICAgICk7XG5cbiAgICAgIHJldHVybiAkcm93O1xuICAgIH0sXG5cbiAgICByZW5kZXJGaWxlQ29tbWVudHM6IGZ1bmN0aW9uKGNvbW1lbnRzKSB7XG4gICAgICB2YXIgJGNvbW1lbnRzID0gJCgnPG9sIC8+JywgeyBjbGFzczogJ2YtYnV0dG9uLWZpbGVfX2NvbW1lbnRzJyB9KTtcblxuICAgICAgY29tbWVudHMuZm9yRWFjaChmdW5jdGlvbihjb21tZW50KSB7XG4gICAgICAgICRjb21tZW50cy5hcHBlbmQoXG4gICAgICAgICAgJCgnPGxpIC8+JykudGV4dChcbiAgICAgICAgICAgICdbJyArIGNvbW1lbnQuYXV0aG9yLnVzZXJuYW1lICsgJ10gJyArIGNvbW1lbnQubWVzc2FnZVxuICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gJGNvbW1lbnRzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHJlbmRlckNvbnRyb2xzOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciAkY29udHJvbHMgPSAkKCc8ZGl2IC8+Jywge1xuICAgICAgICBjbGFzczogJ2YtYnV0dG9uX19jb250cm9scydcbiAgICAgIH0pO1xuXG4gICAgICAkKCc8bGFiZWwgLz4nKVxuICAgICAgICAuYXBwZW5kKCQoJzxpbnB1dCAvPicsIHsgdHlwZTogJ2NoZWNrYm94JywgY2hlY2tlZDogdGhpcy5wcm9wcy5jb21tZW50ZWRPbmx5IH0pKVxuICAgICAgICAuYXBwZW5kKCQoJzxzcGFuIC8+JykudGV4dCgnSGlkZSBmaWxlcyB3aXRoIG5vIGNvbW1lbnRzJykpXG4gICAgICAgIC5hcHBlbmRUbygkY29udHJvbHMpXG4gICAgICAgIC5iaW5kKCdjbGljaycsIHRoaXMudG9nZ2xlQ29tbWVudGVkLmJpbmQodGhpcykpXG4gICAgICA7XG5cbiAgICAgICQoJzxsYWJlbCAvPicpXG4gICAgICAgIC5hcHBlbmQoXG4gICAgICAgICAgJCgnPGlucHV0IC8+JywgeyB0eXBlOiAnY2hlY2tib3gnLCBjaGVja2VkOiB0aGlzLnByb3BzLmhpZGVJblVuaWZpZWRNb2RlIH0pXG4gICAgICAgICAgLmJpbmQoJ2NoYW5nZScsIHRoaXMudG9nZ2xlSGlkZUluVW5pZmllZE1vZGUuYmluZCh0aGlzKSlcbiAgICAgICAgKVxuICAgICAgICAuYXBwZW5kKCQoJzxzcGFuIC8+JykudGV4dCgnRGlzYWJsZSBpbiBVbmlmaWVkIERpZmYgdmlldycpKVxuICAgICAgICAuYXBwZW5kVG8oJGNvbnRyb2xzKVxuICAgICAgO1xuXG4gICAgICByZXR1cm4gJGNvbnRyb2xzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqXG4gICAgICogQ29weSBhIGZpbGVwYXRoIHRvIHRoZSBjbGlwYm9hcmQuXG4gICAgICovXG4gICAgY29weVRvQ2xpcGJvYXJkOiBmdW5jdGlvbihmaWxlUGF0aC8qLCBlKi8pIHtcbiAgICAgIGNvcHlUb0NsaXBib2FyZChmaWxlUGF0aCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdG9nZ2xlQ29tbWVudGVkOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0UHJvcHMoeyBjb21tZW50ZWRPbmx5OiAhdGhpcy5wcm9wcy5jb21tZW50ZWRPbmx5IH0pO1xuICAgIH0sXG5cbiAgICB0b2dnbGVIaWRlSW5VbmlmaWVkTW9kZTogZnVuY3Rpb24oZSkge1xuICAgICAgdGhpcy5wcm9wcy5vblRvZ2dsZUhpZGVJblVuaWZpZWRNb2RlKGUudGFyZ2V0LmNoZWNrZWQpO1xuICAgIH1cbiAgfTtcbn0iLCJpbXBvcnQgeyBkaXNjYXJkTGVhZGluZ1NsYXNoLCBpbmplY3RDU1MgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCBTdHlsZXMgZnJvbSAnLi9zdHlsZXMnO1xuaW1wb3J0IEdlcnJpdEZCdXR0b25VSSBmcm9tICcuL3VpJztcblxudmFyIE5SX0FKQVhfQ0FMTFMgPSAyO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBHZXJyaXRGQnV0dG9uKCkge1xuICB2YXIgS0NfRiA9IDcwO1xuXG4gIGZ1bmN0aW9uIHBhcnNlQ29udGV4dEZyb21VUkwodXJsKSB7XG4gICAgdmFyIGN0eCA9IHt9O1xuICAgIHZhciBtYXRjaENoYW5nZSA9IHVybC5tYXRjaCgvXlxcL2NcXC8oXFxkKykvKTtcbiAgICB2YXIgbWF0Y2hSZXZpc2lvbiA9IHVybC5tYXRjaCgvXlxcL2NcXC9cXGQrXFwvKFxcZCspLyk7XG4gICAgdmFyIG1hdGNoRmlsZSA9IHVybC5tYXRjaCgvXlxcL2NcXC9cXGQrXFwvXFxkK1xcLyguKykvKTtcblxuICAgIGN0eC5jaE51bWJlciA9IG1hdGNoQ2hhbmdlID8gbWF0Y2hDaGFuZ2VbMV0gOiBudWxsO1xuICAgIGN0eC5ydk51bWJlciA9IG1hdGNoUmV2aXNpb24gPyBtYXRjaFJldmlzaW9uWzFdIDogbnVsbDtcbiAgICBjdHguY3VycmVudEZpbGUgPSBtYXRjaEZpbGUgPyBtYXRjaEZpbGVbMV0gOiBudWxsO1xuXG4gICAgcmV0dXJuIGN0eDtcbiAgfVxuXG4gIC8qKlxuICAgKiBEb3dubG9hZCB0aGUgZmlsZXMgZm9yIHRoZSBnaXZlbiBjaGFuZ2UvcmV2aXNpb24gY29tYm8gYW5kIGFueSBjb21tZW50cyBmb3JcbiAgICogdGhlbS5cbiAgICpcbiAgICogQHBhcmFtICB7TnVtYmVyfSAgIGNoTnVtYmVyXG4gICAqIEBwYXJhbSAge051bWJlcn0gICBydk51bWJlclxuICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gZG9uZVxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdFtdfSBkb25lLmZpbGVzXG4gICAqICAgICAgICBBIGhhc2ggb2YgZmlsZS1uYW1lcyBhbmQgdGhlaXIgaW5mby5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGRvbmUuZmlsZXNbXS51cmxcbiAgICogICAgICAgIFRoZSBVUkwgZm9yIHRoZSBmaWxlLWRpZmYgcGFnZSBmb3IgdGhpcyBmaWxlLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdFtdfSBkb25lLmZpbGVzW10uY29tbWVudHNcbiAgICogICAgICAgIFRoZSBsaXN0IG9mIGNvbW1lbnRzIGZvciB0aGlzIGZpbGUuXG4gICAqL1xuICBmdW5jdGlvbiBmZXRjaChjaE51bWJlciwgcnZOdW1iZXIsIGRvbmUpIHtcbiAgICB2YXIgZmlsZXMgPSBbXTtcbiAgICB2YXIgQkFTRV9VUkwgPSBbICcvY2hhbmdlcycsIGNoTnVtYmVyLCAncmV2aXNpb25zJywgcnZOdW1iZXIgXS5qb2luKCcvJyk7XG4gICAgdmFyIGNhbGxzRG9uZSA9IDA7XG5cbiAgICBmdW5jdGlvbiBzZXQoZmlsZVBhdGgsIGl0ZW0sIHZhbHVlKSB7XG4gICAgICB2YXIgZmlsZUVudHJ5ID0gZmlsZXMuZmlsdGVyKGZ1bmN0aW9uKGVudHJ5KSB7XG4gICAgICAgIHJldHVybiBlbnRyeS5maWxlUGF0aCA9PT0gZmlsZVBhdGg7XG4gICAgICB9KVswXTtcblxuICAgICAgaWYgKCFmaWxlRW50cnkpIHtcbiAgICAgICAgZmlsZUVudHJ5ID0geyBmaWxlUGF0aDogZmlsZVBhdGggfTtcbiAgICAgICAgZmlsZXMucHVzaChmaWxlRW50cnkpO1xuICAgICAgfVxuXG4gICAgICBmaWxlRW50cnlbaXRlbV0gPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0aWNrKCkge1xuICAgICAgaWYgKCsrY2FsbHNEb25lID09PSBOUl9BSkFYX0NBTExTKSB7XG4gICAgICAgIGRvbmUoZmlsZXMpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFVybEZvckZpbGUoZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgICcvIy9jLycgKyBjaE51bWJlciArICcvJyArIHJ2TnVtYmVyICsgJy8nICsgZGlzY2FyZExlYWRpbmdTbGFzaChmaWxlUGF0aClcbiAgICAgICk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0UmVtb3RlKHVybCwgY2FsbGJhY2spIHtcbiAgICAgIHdpbmRvdy4kLmFqYXgoe1xuICAgICAgICB1cmw6IEJBU0VfVVJMICsgdXJsLFxuICAgICAgICB0eXBlOiAnR0VUJyxcbiAgICAgICAgZGF0YVR5cGU6ICd0ZXh0JyxcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24ocmVzcCkge1xuICAgICAgICAgIGNhbGxiYWNrKEpTT04ucGFyc2UocmVzcC5zdWJzdHIoXCIpXX0nXCIubGVuZ3RoKSkpO1xuICAgICAgICAgIHRpY2soKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0UmVtb3RlKCcvZmlsZXMnLCBmdW5jdGlvbihydkZpbGVzKSB7XG4gICAgICBPYmplY3Qua2V5cyhydkZpbGVzKS5mb3JFYWNoKGZ1bmN0aW9uKF9maWxlUGF0aCkge1xuICAgICAgICB2YXIgZmlsZVBhdGggPSBkaXNjYXJkTGVhZGluZ1NsYXNoKF9maWxlUGF0aCk7XG4gICAgICAgIHNldChmaWxlUGF0aCwgJ3VybCcsIGdldFVybEZvckZpbGUoZmlsZVBhdGgpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZ2V0UmVtb3RlKCcvY29tbWVudHMnLCBmdW5jdGlvbihydkZpbGVDb21tZW50cykge1xuICAgICAgT2JqZWN0LmtleXMocnZGaWxlQ29tbWVudHMpLmZvckVhY2goZnVuY3Rpb24oX2ZpbGVQYXRoKSB7XG4gICAgICAgIHZhciBmaWxlUGF0aCA9IGRpc2NhcmRMZWFkaW5nU2xhc2goX2ZpbGVQYXRoKTtcbiAgICAgICAgc2V0KGZpbGVQYXRoLCAnY29tbWVudHMnLCBydkZpbGVDb21tZW50c1tmaWxlUGF0aF0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBpc0luVW5pZmllZE1vZGUoKSB7XG4gICAgcmV0dXJuICEhZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmdlcnJpdEJvZHkgLnVuaWZpZWRUYWJsZScpO1xuICB9XG5cbiAgZnVuY3Rpb24gc2hvdWxkSGlkZUluVW5pZmllZE1vZGUoKSB7XG4gICAgcmV0dXJuIGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdHRVJSSVRfRl9CVVRUT04vSElERV9JTl9VTklGSUVEX01PREUnKSA9PT0gJzEnO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBpbnN0YWxsOiBmdW5jdGlvbihHZXJyaXQsICQpIHtcbiAgICAgIHZhciB1aSA9IEdlcnJpdEZCdXR0b25VSSgkKTtcbiAgICAgIHZhciBjb250ZXh0LCBjYWNoZWRGaWxlcztcblxuICAgICAgdWkuc2V0UHJvcHMoe1xuICAgICAgICBoaWRlSW5VbmlmaWVkTW9kZTogc2hvdWxkSGlkZUluVW5pZmllZE1vZGUoKSxcbiAgICAgICAgb25Ub2dnbGVIaWRlSW5VbmlmaWVkTW9kZTogZnVuY3Rpb24oY2hlY2tlZCkge1xuICAgICAgICAgIGlmIChjaGVja2VkKSB7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnR0VSUklUX0ZfQlVUVE9OL0hJREVfSU5fVU5JRklFRF9NT0RFJywgJzEnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnR0VSUklUX0ZfQlVUVE9OL0hJREVfSU5fVU5JRklFRF9NT0RFJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdWkuc2V0UHJvcHMoe1xuICAgICAgICAgICAgaGlkZUluVW5pZmllZE1vZGU6IHNob3VsZEhpZGVJblVuaWZpZWRNb2RlKClcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgaW5qZWN0Q1NTKFN0eWxlcyk7XG5cbiAgICAgIC8vIEBldmVudCAnc2hvd2NoYW5nZSdcbiAgICAgIC8vXG4gICAgICAvLyBUaGlzIHdpbGwgYmUgdHJpZ2dlcmVkIGV2ZXJ5dGltZSB0aGUgY2hhbmdlJ3MgXCJsYW5kaW5nXCIgcGFnZSBpc1xuICAgICAgLy8gdmlzaXRlZC5cbiAgICAgIC8vXG4gICAgICAvLyBTZWUgaHR0cHM6Ly9nZXJyaXQtcmV2aWV3Lmdvb2dsZXNvdXJjZS5jb20vRG9jdW1lbnRhdGlvbi9qcy1hcGkuaHRtbCNzZWxmX29uXG4gICAgICAvL1xuICAgICAgLy8gQHBhcmFtIGNoSW5mb1xuICAgICAgLy8gICBTZWUgaHR0cHM6Ly9nZXJyaXQtcmV2aWV3Lmdvb2dsZXNvdXJjZS5jb20vRG9jdW1lbnRhdGlvbi9yZXN0LWFwaS1jaGFuZ2VzLmh0bWwjY2hhbmdlLWluZm9cbiAgICAgIC8vXG4gICAgICAvLyBAcGFyYW0gcnZJbmZvXG4gICAgICAvLyAgIFNlZSBodHRwczovL2dlcnJpdC1yZXZpZXcuZ29vZ2xlc291cmNlLmNvbS9Eb2N1bWVudGF0aW9uL3Jlc3QtYXBpLWNoYW5nZXMuaHRtbCNyZXZpc2lvbi1pbmZvXG4gICAgICBHZXJyaXQub24oJ3Nob3djaGFuZ2UnLCBmdW5jdGlvbihjaEluZm8sIHJ2SW5mbykge1xuICAgICAgICBmZXRjaEZpbGVzQW5kUmVuZGVyKGNoSW5mby5fbnVtYmVyLCBydkluZm8uX251bWJlcik7XG4gICAgICB9KTtcblxuICAgICAgLy8gQGV2ZW50ICdoaXN0b3J5J1xuICAgICAgLy9cbiAgICAgIC8vIFRoaXMgaXMgdHJpZ2dlcmVkIGV2ZXJ5dGltZSBhIG5ldyBwYWdlIGluIHRoZSBHZXJyaXQgVUkgaXMgdmlzaXRlZDtcbiAgICAgIC8vIHdlIGFyZSBpbnRlcmVzdGVkIHdpdGggdGhlIHZpc2l0cyB0byB0aGUgZmlsZS1kaWZmIHBhZ2VzIGJlY2F1c2Ugd2UnZFxuICAgICAgLy8gbGlrZSB0byBoaWdobGlnaHQgdGhlIGN1cnJlbnRseSB2aWV3ZWQgZmlsZS5cbiAgICAgIC8vXG4gICAgICAvLyBTZWUgaHR0cHM6Ly9nZXJyaXQtcmV2aWV3Lmdvb2dsZXNvdXJjZS5jb20vRG9jdW1lbnRhdGlvbi9qcy1hcGkuaHRtbCNzZWxmX29uXG4gICAgICBHZXJyaXQub24oJ2hpc3RvcnknLCBmdW5jdGlvbih0b2tlbikge1xuICAgICAgICBjb250ZXh0ID0gcGFyc2VDb250ZXh0RnJvbVVSTCh0b2tlbik7XG5cbiAgICAgICAgaWYgKGNvbnRleHQuY2hOdW1iZXIpIHtcbiAgICAgICAgICAvLyBUaGlzIGhhcHBlbnMgaWYgdGhlIGluaXRpYWwgVVJMIGlzIG5vdCB0aGUgY2hhbmdlJ3MgbGFuZGluZyBwYWdlLCBidXRcbiAgICAgICAgICAvLyBpbnN0ZWFkIGEgZmlsZS1kaWZmIHBhZ2U7IHRoZSBcInNob3djaGFuZ2VcIiBldmVudCB3b3VsZCBub3QgYmUgZW1pdHRlZFxuICAgICAgICAgIC8vIGluIHRoaXMgY2FzZSBhbmQgdGhlcmUncyBubyB3YXkgdG8gZ2V0IHRoZSBjaGFuZ2UvcmV2aXNpb24gaW5mb3JtYXRpb25cbiAgICAgICAgICAvLyBidXQgZnJvbSB0aGUgVVJMLlxuICAgICAgICAgIGlmICghY2FjaGVkRmlsZXMpIHtcbiAgICAgICAgICAgIGZldGNoRmlsZXNBbmRSZW5kZXIoY29udGV4dC5jaE51bWJlciwgY29udGV4dC5ydk51bWJlcik7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgeyAvLyBubyBsb25nZXIgaW4gYSBjaGFuZ2U/IHVudHJhY2sgdGhlIGRvd25sb2FkZWQgZmlsZSBsaXN0aW5nXG4gICAgICAgICAgY2FjaGVkRmlsZXMgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgIWNvbnRleHQuY2hOdW1iZXIgLyogbm90IHZpZXdpbmcgYSBjaGFuZ2U/IGZvcmdldCBpdCEgKi8gfHxcbiAgICAgICAgICAoaXNJblVuaWZpZWRNb2RlKCkgJiYgc2hvdWxkSGlkZUluVW5pZmllZE1vZGUoKSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgaWYgKHVpLmlzTW91bnRlZCgpKSB7XG4gICAgICAgICAgICB1aS51bm1vdW50KCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKFsgZS5rZXlDb2RlLCBlLndoaWNoIF0uaW5kZXhPZihLQ19GKSA+IC0xKSB7XG4gICAgICAgICAgaWYgKCEkKGUudGFyZ2V0KS5pcygnaW5wdXQsIHRleHRhcmVhJykpIHtcbiAgICAgICAgICAgIHVpLnRvZ2dsZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGNvbnNvbGUubG9nKCdnZXJyaXQtZi1idXR0b246IGFjdGl2ZS4nKTtcblxuICAgICAgZnVuY3Rpb24gZmV0Y2hGaWxlc0FuZFJlbmRlcihjaE51bWJlciwgcnZOdW1iZXIpIHtcbiAgICAgICAgZmV0Y2goY2hOdW1iZXIsIHJ2TnVtYmVyLCBmdW5jdGlvbihmaWxlcykge1xuICAgICAgICAgIGNhY2hlZEZpbGVzID0gZmlsZXM7XG5cbiAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdWkuc2V0UHJvcHMoe1xuICAgICAgICAgIGZpbGVzOiBjYWNoZWRGaWxlcyxcbiAgICAgICAgICBjdXJyZW50RmlsZTogY29udGV4dC5jdXJyZW50RmlsZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59XG4iLCIvLyA9PVVzZXJTY3JpcHQ9PVxuLy8gQG5hbWUgICAgICAgIEdlcnJpdCBGIEJ1dHRvblxuLy8gQG5hbWVzcGFjZSAgIGFobWFkQGFtaXJlaC5uZXRcbi8vIEBpbmNsdWRlICAgICBodHRwczovL2dlcnJpdC5pbnN0cnVjdHVyZS5jb20vKlxuLy8gQHZlcnNpb24gICAgIDJcbi8vIEBncmFudCAgICAgICBub25lXG4vLyBAZ3JhbnQgICAgICAgR01fc2V0Q2xpcGJvYXJkXG4vLyBAcnVuLWF0ICAgICAgZG9jdW1lbnQuZW5kXG4vLyA9PS9Vc2VyU2NyaXB0PT1cblxuaW1wb3J0IEdlcnJpdEZCdXR0b24gZnJvbSAnLi9jb3JlJztcbmltcG9ydCBHZXJyaXRGQnV0dG9uVUkgZnJvbSAnLi91aSc7XG5pbXBvcnQgR2Vycml0RkJ1dHRvblN0eWxlcyBmcm9tICcuL3N0eWxlcyc7XG5pbXBvcnQgeyBUcmVlVmlldywgaW5qZWN0Q1NTIH0gZnJvbSAnLi91dGlscyc7XG5cbi8vIEhUTUwgdGVzdHNcbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2Ygd2luZG93LkdlcnJpdEZCdXR0b24gIT09ICd1bmRlZmluZWQnKSB7XG4gIHdpbmRvdy5HZXJyaXRGQnV0dG9uLkNvcmUgPSBHZXJyaXRGQnV0dG9uO1xuICB3aW5kb3cuR2Vycml0RkJ1dHRvbi5TdHlsZXMgPSBHZXJyaXRGQnV0dG9uU3R5bGVzO1xuICB3aW5kb3cuR2Vycml0RkJ1dHRvbi5VSSA9IEdlcnJpdEZCdXR0b25VSTtcbiAgd2luZG93LkdlcnJpdEZCdXR0b24uaW5qZWN0Q1NTID0gaW5qZWN0Q1NTO1xufVxuLy8gbW9jaGEgdGVzdHNcbmVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gIGV4cG9ydHMuQ29yZSA9IEdlcnJpdEZCdXR0b247XG4gIGV4cG9ydHMuVUkgPSBHZXJyaXRGQnV0dG9uVUk7XG4gIGV4cG9ydHMuVHJlZVZpZXcgPSBUcmVlVmlldztcbn1cbi8vIEdlcnJpdCBlbnZcbmVsc2Uge1xuICB2YXIgZ2Vycml0RkJ1dHRvbiA9IG5ldyBHZXJyaXRGQnV0dG9uKCk7XG4gIHZhciBwb2xsZXIsIHRpbWVvdXQ7XG5cbiAgdGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgLy8gbm90ZTogdGhpcyBndWFyZCBpcyBub3QgbmVjZXNzYXJ5IG91dHNpZGUgb2YgZ3JlYXNlLW1vbmtleSdzIGNvbnRleHQgc2luY2VcbiAgICAvLyB0aGUgdGltZW91dCB3aWxsIGJlIGNsZWFyZWQgaWYgdGhlIHBvbGxlcidzIHRlc3Qgc3VjY2VlZHMuXG4gICAgaWYgKCFnZXJyaXRGQnV0dG9uLmluc3RhbGxlZCkge1xuICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgJ2dlcnJpdC1mLWJ1dHRvbjogb25lIG9mIHdpbmRvdy5HZXJyaXQgb3Igd2luZG93LmpRdWVyeSBpcyBub3QgcHJlc2VudDsnLFxuICAgICAgICAncGx1Z2luIHdpbGwgbm90IHdvcmsuJ1xuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBmb3Igc29tZSByZWFzb24sIHRoaXMgaXNuJ3Qgd29ya2luZyBpbiBHcmVhc2Vtb25rZXlcbiAgICBwb2xsZXIgPSBjbGVhckludGVydmFsKHBvbGxlcik7XG4gIH0sIDMwMDAwKTtcblxuICBwb2xsZXIgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICBpZiAod2luZG93LkdlcnJpdCAmJiB3aW5kb3cualF1ZXJ5KSB7XG4gICAgICBnZXJyaXRGQnV0dG9uLmluc3RhbGwod2luZG93LkdlcnJpdCwgd2luZG93LmpRdWVyeSk7XG5cbiAgICAgIC8vIGZvciBzb21lIHJlYXNvbiwgdGhpcyBpc24ndCB3b3JraW5nIGluIEdyZWFzZW1vbmtleVxuICAgICAgcG9sbGVyID0gY2xlYXJJbnRlcnZhbChwb2xsZXIpO1xuICAgICAgdGltZW91dCA9IGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICB9XG4gIH0sIDI1MCk7XG59Il0sIm5hbWVzIjpbIkdlcnJpdEZCdXR0b25TdHlsZXMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7RUFBQTtBQUNBLEFBQU8sRUFBQSxTQUFTLFFBQVEsQ0FBQyxRQUFRLEVBQUU7QUFDbkMsRUFBQSxFQUFFLElBQUksSUFBSSxHQUFHO0FBQ2IsRUFBQSxJQUFJLEtBQUssRUFBRSxFQUFFO0FBQ2IsRUFBQSxJQUFJLFFBQVEsRUFBRSxFQUFFO0FBQ2hCLEVBQUEsR0FBRyxDQUFDOztBQUVKLEVBQUEsRUFBRSxTQUFTLFNBQVMsQ0FBQyxJQUFJLEVBQUU7QUFDM0IsRUFBQSxJQUFJLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNqRixFQUFBLElBQUksSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDOztBQUV0QixFQUFBLElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxTQUFTLFFBQVEsRUFBRTtBQUN6QyxF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QSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBOztBQUVBLEVBQUE7QUFDQSxFQUFBOztBQUVBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTs7QUFFQSxFQUFBO0FBQ0EsRUFBQTs7QUFFQSxFQUFBO0FBQ0EsRUFBQTs7QUFFQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7O0FBRUEsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7O0FBRUEsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBOztBQUVBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTs7QUFFQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7O0FBRUEsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBOztBQUVBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBOztBQUVBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTs7QUFFQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTs7QUFFQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBOztBQUVBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTs7QUFFQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7O0FBRUEsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBOztBQUVBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQSxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDOztFQ3RJakQsU0FBUyxlQUFlLENBQUMsQ0FBQyxFQUFFO0FBQzNDLEVBQUEsRUFBRSxJQUFJLG9CQUFvQixHQUFHO0FBQzdCLEVBQUEsSUFBSSxPQUFPLE1BQU0sS0FBSyxXQUFXO0FBQ2pDLEVBQUEsSUFBSSxPQUFPLFdBQVcsQ0FBQyxTQUFTLENBQUMsc0JBQXNCLEtBQUssVUFBVTtBQUN0RSxFQUFBLEdBQUcsQ0FBQzs7QUFFSixFQUFBLEVBQUUsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUFFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxDQUFDLENBQUM7QUFDNUQsRUFBQSxFQUFFLElBQUksVUFBVSxDQUFDOztBQUVqQixFQUFBLEVBQUUsT0FBTztBQUNULEVBQUEsSUFBSSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQzs7QUFFbkIsRUFBQSxJQUFJLEtBQUssRUFBRTtBQUNYLEVBQUEsTUFBTSxLQUFLLEVBQUUsRUFBRTtBQUNmLEVBQUEsTUFBTSxXQUFXLEVBQUUsSUFBSTtBQUN2QixFQUFBLE1BQU0sYUFBYSxFQUFFLEtBQUs7QUFDMUIsRUFBQSxNQUFNLGlCQUFpQixFQUFFLEtBQUs7QUFDOUIsRUFBQSxNQUFNLHlCQUF5QixFQUFFLFFBQVEsQ0FBQyxTQUFTO0FBQ25ELEVBQUEsS0FBSzs7QUFFTCxFQUFBLElBQUksU0FBUyxFQUFFLFdBQVc7QUFDMUIsRUFBQSxNQUFNLE9BQU8sTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7QUFDMUMsRUFBQSxLQUFLOztBQUVMLEVBQUEsSUFBSSxLQUFLLEVBQUUsU0FBUyxTQUFTLEVBQUU7QUFDL0IsRUFBQSxNQUFNLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQyxTQUFTLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUVyRCxFQUFBLE1BQU0sVUFBVSxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBQ25ELEVBQUEsTUFBTSxVQUFVLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUVoQyxFQUFBLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7QUFDaEMsRUFBQSxLQUFLOztBQUVMLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUEsSUFBSSxNQUFNLEVBQUUsU0FBUyxTQUFTLEVBQUU7QUFDaEMsRUFBQSxNQUFNLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFO0FBQzVCLEVBQUEsUUFBUSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2hDLEVBQUEsT0FBTztBQUNQLEVBQUEsV0FBVztBQUNYLEVBQUEsUUFBUSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzlCLEVBQUEsT0FBTztBQUNQLEVBQUEsS0FBSzs7QUFFTCxFQUFBLElBQUksT0FBTyxFQUFFLFNBQVMsU0FBUyxFQUFFO0FBQ2pDLEVBQUEsTUFBTSxJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUMsU0FBUyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFckQsRUFBQSxNQUFNLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUN0QixFQUFBLE1BQU0sVUFBVSxDQUFDLFdBQVcsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBQ3RELEVBQUEsS0FBSzs7QUFFTCxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUEsSUFBSSxRQUFRLEVBQUUsU0FBUyxLQUFLLEVBQUU7QUFDOUIsRUFBQSxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxFQUFFO0FBQy9DLEVBQUEsUUFBUSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNyQyxFQUFBLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs7QUFFcEIsRUFBQSxNQUFNLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNwQixFQUFBLEtBQUs7O0FBRUwsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQSxJQUFJLGtCQUFrQixFQUFFLFdBQVc7QUFDbkMsRUFBQTtBQUNBLEVBQUEsTUFBTSxJQUFJLFVBQVUsSUFBSSxvQkFBb0IsRUFBRTtBQUM5QyxFQUFBLFFBQVEsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLHNCQUFzQixFQUFFLENBQUM7QUFDL0MsRUFBQSxPQUFPO0FBQ1AsRUFBQSxLQUFLOztBQUVMLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUEsSUFBSSxNQUFNLEVBQUUsV0FBVztBQUN2QixFQUFBLE1BQU0sSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQzlFLEVBQUEsTUFBTSxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7O0FBRTVDLEVBQUEsTUFBTSxNQUFNO0FBQ1osRUFBQSxTQUFTLEtBQUssRUFBRTtBQUNoQixFQUFBLFNBQVMsTUFBTSxDQUFDLFNBQVMsQ0FBQztBQUMxQixFQUFBLFNBQVMsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUN2QixFQUFBLFNBQVMsV0FBVyxDQUFDLGlDQUFpQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDO0FBQ2pGLEVBQUEsT0FBTzs7QUFFUCxFQUFBLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7QUFDaEMsRUFBQSxLQUFLOztBQUVMLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUEsSUFBSSxXQUFXLEVBQUUsU0FBUyxLQUFLLEVBQUUsV0FBVyxFQUFFO0FBQzlDLEVBQUEsTUFBTSxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsU0FBUyxFQUFFLEVBQUUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLENBQUMsQ0FBQztBQUMvRCxFQUFBLE1BQU0sSUFBSSxRQUFRLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUVyQyxFQUFBLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQztBQUN4QixFQUFBLE1BQU0sS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQzs7QUFFckUsRUFBQSxNQUFNLE9BQU8sS0FBSyxDQUFDO0FBQ25CLEVBQUEsS0FBSzs7QUFFTCxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBLElBQUksY0FBYyxFQUFFLFNBQVMsSUFBSSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUU7QUFDeEQsRUFBQSxNQUFNLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUU7QUFDOUIsRUFBQSxRQUFRLEtBQUssRUFBRSxRQUFRLENBQUM7QUFDeEIsRUFBQSxVQUFVLHVCQUF1QixFQUFFLElBQUk7QUFDdkMsRUFBQSxVQUFVLDZCQUE2QixFQUFFLE1BQU0sS0FBSyxJQUFJO0FBQ3hELEVBQUEsU0FBUyxDQUFDO0FBQ1YsRUFBQSxPQUFPLENBQUMsQ0FBQzs7QUFFVCxFQUFBO0FBQ0EsRUFBQSxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxTQUFTLE1BQU0sRUFBRTtBQUNqRSxFQUFBLFFBQVEsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDOztBQUVoRixFQUFBLFFBQVEsSUFBSSxDQUFDLFNBQVMsRUFBRTtBQUN4QixFQUFBLFVBQVUsT0FBTyxJQUFJLENBQUM7QUFDdEIsRUFBQSxTQUFTOztBQUVULEVBQUEsUUFBUSxJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUMsWUFBWSxFQUFFLEVBQUUsS0FBSyxFQUFFLDhCQUE4QixFQUFFLENBQUMsQ0FBQzs7QUFFdkYsRUFBQSxRQUFRLGFBQWEsQ0FBQyxNQUFNO0FBQzVCLEVBQUEsVUFBVSxDQUFDLENBQUMsVUFBVSxFQUFFLEVBQUUsS0FBSyxFQUFFLDJDQUEyQyxFQUFFLENBQUM7QUFDL0UsRUFBQSxTQUFTLENBQUM7O0FBRVYsRUFBQSxRQUFRLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQzs7QUFFL0QsRUFBQSxRQUFRLE9BQU87QUFDZixFQUFBLFVBQVUsQ0FBQyxDQUFDLFFBQVEsQ0FBQztBQUNyQixFQUFBLGFBQWEsTUFBTSxDQUFDLGFBQWEsQ0FBQztBQUNsQyxFQUFBLGFBQWEsTUFBTSxDQUFDLFNBQVMsQ0FBQztBQUM5QixFQUFBLGFBQWEsUUFBUSxDQUFDLEtBQUssQ0FBQztBQUM1QixFQUFBLFNBQVMsQ0FBQztBQUNWLEVBQUEsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDOztBQUVwQixFQUFBO0FBQ0EsRUFBQSxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsSUFBSSxFQUFFO0FBQ3hDLEVBQUEsUUFBUSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUNuRixFQUFBLFVBQVUsT0FBTyxJQUFJLENBQUM7QUFDdEIsRUFBQSxTQUFTOztBQUVULEVBQUEsUUFBUSxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7QUFDekQsRUFBQSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7O0FBRXBCLEVBQUEsTUFBTSxPQUFPLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxHQUFHLElBQUksR0FBRyxLQUFLLENBQUM7QUFDMUQsRUFBQSxLQUFLOztBQUVMLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUEsSUFBSSxVQUFVLEVBQUUsU0FBUyxJQUFJLEVBQUUsV0FBVyxFQUFFO0FBQzVDLEVBQUEsTUFBTSxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0FBQ25DLEVBQUEsTUFBTSxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzRCxFQUFBLE1BQU0sSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDbEUsRUFBQSxNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUU7QUFDN0IsRUFBQSxRQUFRLEtBQUssRUFBRSxRQUFRLENBQUM7QUFDeEIsRUFBQSxVQUFVLGVBQWUsRUFBRSxJQUFJO0FBQy9CLEVBQUEsVUFBVSx1QkFBdUIsRUFBRSxXQUFXLEtBQUssUUFBUTtBQUMzRCxFQUFBLFVBQVUsMEJBQTBCLEVBQUUsV0FBVztBQUNqRCxFQUFBLFNBQVMsQ0FBQztBQUNWLEVBQUEsT0FBTyxDQUFDLENBQUM7O0FBRVQsRUFBQSxNQUFNLElBQUksV0FBVyxLQUFLLFFBQVEsRUFBRTtBQUNwQyxFQUFBLFFBQVEsVUFBVSxHQUFHLElBQUksQ0FBQztBQUMxQixFQUFBLE9BQU87O0FBRVAsRUFBQSxNQUFNLElBQUksQ0FBQyxNQUFNO0FBQ2pCLEVBQUEsUUFBUSxDQUFDLENBQUMsVUFBVSxFQUFFO0FBQ3RCLEVBQUEsVUFBVSxLQUFLLEVBQUUsOEJBQThCO0FBQy9DLEVBQUEsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDeEQsRUFBQSxPQUFPLENBQUM7O0FBRVIsRUFBQSxNQUFNLElBQUksQ0FBQyxNQUFNO0FBQ2pCLEVBQUEsUUFBUSxDQUFDLENBQUMsVUFBVSxFQUFFO0FBQ3RCLEVBQUEsVUFBVSxLQUFLLEVBQUUseUNBQXlDO0FBQzFELEVBQUEsVUFBVSxLQUFLLEVBQUUsNEJBQTRCO0FBQzdDLEVBQUEsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDbkUsRUFBQSxPQUFPLENBQUM7O0FBRVIsRUFBQSxNQUFNLElBQUksQ0FBQyxNQUFNO0FBQ2pCLEVBQUEsUUFBUSxDQUFDLENBQUMsT0FBTyxFQUFFO0FBQ25CLEVBQUEsVUFBVSxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUc7QUFDeEIsRUFBQSxVQUFVLEtBQUssRUFBRSxxQkFBcUI7QUFDdEMsRUFBQSxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO0FBQ3pCLEVBQUEsT0FBTyxDQUFDOztBQUVSLEVBQUEsTUFBTSxPQUFPLElBQUksQ0FBQztBQUNsQixFQUFBLEtBQUs7O0FBRUwsRUFBQSxJQUFJLGtCQUFrQixFQUFFLFNBQVMsUUFBUSxFQUFFO0FBQzNDLEVBQUEsTUFBTSxJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsS0FBSyxFQUFFLHlCQUF5QixFQUFFLENBQUMsQ0FBQzs7QUFFeEUsRUFBQSxNQUFNLFFBQVEsQ0FBQyxPQUFPLENBQUMsU0FBUyxPQUFPLEVBQUU7QUFDekMsRUFBQSxRQUFRLFNBQVMsQ0FBQyxNQUFNO0FBQ3hCLEVBQUEsVUFBVSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSTtBQUMxQixFQUFBLFlBQVksR0FBRyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxHQUFHLElBQUksR0FBRyxPQUFPLENBQUMsT0FBTztBQUNsRSxFQUFBLFdBQVc7QUFDWCxFQUFBLFNBQVMsQ0FBQztBQUNWLEVBQUEsT0FBTyxDQUFDLENBQUM7O0FBRVQsRUFBQSxNQUFNLE9BQU8sU0FBUyxDQUFDO0FBQ3ZCLEVBQUEsS0FBSzs7QUFFTCxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBLElBQUksY0FBYyxFQUFFLFdBQVc7QUFDL0IsRUFBQSxNQUFNLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQyxTQUFTLEVBQUU7QUFDbkMsRUFBQSxRQUFRLEtBQUssRUFBRSxvQkFBb0I7QUFDbkMsRUFBQSxPQUFPLENBQUMsQ0FBQzs7QUFFVCxFQUFBLE1BQU0sQ0FBQyxDQUFDLFdBQVcsQ0FBQztBQUNwQixFQUFBLFNBQVMsTUFBTSxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7QUFDeEYsRUFBQSxTQUFTLE1BQU0sQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLENBQUM7QUFDbEUsRUFBQSxTQUFTLFFBQVEsQ0FBQyxTQUFTLENBQUM7QUFDNUIsRUFBQSxTQUFTLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdkQsRUFBQSxPQUFPOztBQUVQLEVBQUEsTUFBTSxDQUFDLENBQUMsV0FBVyxDQUFDO0FBQ3BCLEVBQUEsU0FBUyxNQUFNO0FBQ2YsRUFBQSxVQUFVLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixFQUFFLENBQUM7QUFDckYsRUFBQSxXQUFXLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNsRSxFQUFBLFNBQVM7QUFDVCxFQUFBLFNBQVMsTUFBTSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsQ0FBQztBQUNuRSxFQUFBLFNBQVMsUUFBUSxDQUFDLFNBQVMsQ0FBQztBQUM1QixFQUFBLE9BQU87O0FBRVAsRUFBQSxNQUFNLE9BQU8sU0FBUyxDQUFDO0FBQ3ZCLEVBQUEsS0FBSzs7QUFFTCxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUEsSUFBSSxlQUFlLEVBQUUsU0FBUyxRQUFRLFNBQVM7QUFDL0MsRUFBQSxNQUFNLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNoQyxFQUFBLEtBQUs7O0FBRUwsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQSxJQUFJLGVBQWUsRUFBRSxXQUFXO0FBQ2hDLEVBQUEsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsYUFBYSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO0FBQ2xFLEVBQUEsS0FBSzs7QUFFTCxFQUFBLElBQUksdUJBQXVCLEVBQUUsU0FBUyxDQUFDLEVBQUU7QUFDekMsRUFBQSxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM3RCxFQUFBLEtBQUs7QUFDTCxFQUFBLEdBQUcsQ0FBQztBQUNKLEVBQUE7O0VDdFFBLElBQUksYUFBYSxHQUFHLENBQUMsQ0FBQzs7QUFFdEIsQUFBZSxFQUFBLFNBQVMsYUFBYSxHQUFHO0FBQ3hDLEVBQUEsRUFBRSxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7O0FBRWhCLEVBQUEsRUFBRSxTQUFTLG1CQUFtQixDQUFDLEdBQUcsRUFBRTtBQUNwQyxFQUFBLElBQUksSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBQ2pCLEVBQUEsSUFBSSxJQUFJLFdBQVcsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQy9DLEVBQUEsSUFBSSxJQUFJLGFBQWEsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDdEQsRUFBQSxJQUFJLElBQUksU0FBUyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQzs7QUFFdEQsRUFBQSxJQUFJLEdBQUcsQ0FBQyxRQUFRLEdBQUcsV0FBVyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDdkQsRUFBQSxJQUFJLEdBQUcsQ0FBQyxRQUFRLEdBQUcsYUFBYSxHQUFHLGFBQWEsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDM0QsRUFBQSxJQUFJLEdBQUcsQ0FBQyxXQUFXLEdBQUcsU0FBUyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7O0FBRXRELEVBQUEsSUFBSSxPQUFPLEdBQUcsQ0FBQztBQUNmLEVBQUEsR0FBRzs7QUFFSCxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUEsRUFBRSxTQUFTLEtBQUssQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRTtBQUMzQyxFQUFBLElBQUksSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBQ25CLEVBQUEsSUFBSSxJQUFJLFFBQVEsR0FBRyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM3RSxFQUFBLElBQUksSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDOztBQUV0QixFQUFBLElBQUksU0FBUyxHQUFHLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUU7QUFDeEMsRUFBQSxNQUFNLElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBUyxLQUFLLEVBQUU7QUFDbkQsRUFBQSxRQUFRLE9BQU8sS0FBSyxDQUFDLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFDM0MsRUFBQSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFWixFQUFBLE1BQU0sSUFBSSxDQUFDLFNBQVMsRUFBRTtBQUN0QixFQUFBLFFBQVEsU0FBUyxHQUFHLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDO0FBQzNDLEVBQUEsUUFBUSxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzlCLEVBQUEsT0FBTzs7QUFFUCxFQUFBLE1BQU0sU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQztBQUM5QixFQUFBLEtBQUs7O0FBRUwsRUFBQSxJQUFJLFNBQVMsSUFBSSxHQUFHO0FBQ3BCLEVBQUEsTUFBTSxJQUFJLEVBQUUsU0FBUyxLQUFLLGFBQWEsRUFBRTtBQUN6QyxFQUFBLFFBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3BCLEVBQUEsT0FBTztBQUNQLEVBQUEsS0FBSzs7QUFFTCxFQUFBLElBQUksU0FBUyxhQUFhLENBQUMsUUFBUSxFQUFFO0FBQ3JDLEVBQUEsTUFBTSxPQUFPO0FBQ2IsRUFBQSxRQUFRLE9BQU8sR0FBRyxRQUFRLEdBQUcsR0FBRyxHQUFHLFFBQVEsR0FBRyxHQUFHLEdBQUcsbUJBQW1CLENBQUMsUUFBUSxDQUFDO0FBQ2pGLEVBQUEsT0FBTyxDQUFDO0FBQ1IsRUFBQSxLQUFLOztBQUVMLEVBQUEsSUFBSSxTQUFTLFNBQVMsQ0FBQyxHQUFHLEVBQUUsUUFBUSxFQUFFO0FBQ3RDLEVBQUEsTUFBTSxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUNwQixFQUFBLFFBQVEsR0FBRyxFQUFFLFFBQVEsR0FBRyxHQUFHO0FBQzNCLEVBQUEsUUFBUSxJQUFJLEVBQUUsS0FBSztBQUNuQixFQUFBLFFBQVEsUUFBUSxFQUFFLE1BQU07QUFDeEIsRUFBQSxRQUFRLE9BQU8sRUFBRSxTQUFTLElBQUksRUFBRTtBQUNoQyxFQUFBLFVBQVUsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNELEVBQUEsVUFBVSxJQUFJLEVBQUUsQ0FBQztBQUNqQixFQUFBLFNBQVM7QUFDVCxFQUFBLE9BQU8sQ0FBQyxDQUFDO0FBQ1QsRUFBQSxLQUFLOztBQUVMLEVBQUEsSUFBSSxTQUFTLENBQUMsUUFBUSxFQUFFLFNBQVMsT0FBTyxFQUFFO0FBQzFDLEVBQUEsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLFNBQVMsRUFBRTtBQUN2RCxFQUFBLFFBQVEsSUFBSSxRQUFRLEdBQUcsbUJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDdEQsRUFBQSxRQUFRLEdBQUcsQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0FBQ3RELEVBQUEsT0FBTyxDQUFDLENBQUM7QUFDVCxFQUFBLEtBQUssQ0FBQyxDQUFDOztBQUVQLEVBQUEsSUFBSSxTQUFTLENBQUMsV0FBVyxFQUFFLFNBQVMsY0FBYyxFQUFFO0FBQ3BELEVBQUEsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLFNBQVMsRUFBRTtBQUM5RCxFQUFBLFFBQVEsSUFBSSxRQUFRLEdBQUcsbUJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDdEQsRUFBQSxRQUFRLEdBQUcsQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0FBQzVELEVBQUEsT0FBTyxDQUFDLENBQUM7QUFDVCxFQUFBLEtBQUssQ0FBQyxDQUFDO0FBQ1AsRUFBQSxHQUFHOztBQUVILEVBQUEsRUFBRSxTQUFTLGVBQWUsR0FBRztBQUM3QixFQUFBLElBQUksT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0FBQ2pFLEVBQUEsR0FBRzs7QUFFSCxFQUFBLEVBQUUsU0FBUyx1QkFBdUIsR0FBRztBQUNyQyxFQUFBLElBQUksT0FBTyxZQUFZLENBQUMsT0FBTyxDQUFDLHNDQUFzQyxDQUFDLEtBQUssR0FBRyxDQUFDO0FBQ2hGLEVBQUEsR0FBRzs7QUFFSCxFQUFBLEVBQUUsT0FBTztBQUNULEVBQUEsSUFBSSxPQUFPLEVBQUUsU0FBUyxNQUFNLEVBQUUsQ0FBQyxFQUFFO0FBQ2pDLEVBQUEsTUFBTSxJQUFJLEVBQUUsR0FBRyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEMsRUFBQSxNQUFNLElBQUksT0FBTyxFQUFFLFdBQVcsQ0FBQzs7QUFFL0IsRUFBQSxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUM7QUFDbEIsRUFBQSxRQUFRLGlCQUFpQixFQUFFLHVCQUF1QixFQUFFO0FBQ3BELEVBQUEsUUFBUSx5QkFBeUIsRUFBRSxTQUFTLE9BQU8sRUFBRTtBQUNyRCxFQUFBLFVBQVUsSUFBSSxPQUFPLEVBQUU7QUFDdkIsRUFBQSxZQUFZLFlBQVksQ0FBQyxPQUFPLENBQUMsc0NBQXNDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDOUUsRUFBQSxXQUFXO0FBQ1gsRUFBQSxlQUFlO0FBQ2YsRUFBQSxZQUFZLFlBQVksQ0FBQyxVQUFVLENBQUMsc0NBQXNDLENBQUMsQ0FBQztBQUM1RSxFQUFBLFdBQVc7O0FBRVgsRUFBQSxVQUFVLEVBQUUsQ0FBQyxRQUFRLENBQUM7QUFDdEIsRUFBQSxZQUFZLGlCQUFpQixFQUFFLHVCQUF1QixFQUFFO0FBQ3hELEVBQUEsV0FBVyxDQUFDLENBQUM7QUFDYixFQUFBLFNBQVM7QUFDVCxFQUFBLE9BQU8sQ0FBQzs7QUFFUixFQUFBLE1BQU0sU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUV4QixFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBLE1BQU0sTUFBTSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsU0FBUyxNQUFNLEVBQUUsTUFBTSxFQUFFO0FBQ3ZELEVBQUEsUUFBUSxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM1RCxFQUFBLE9BQU8sQ0FBQyxDQUFDOztBQUVULEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBLE1BQU0sTUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsU0FBUyxLQUFLLEVBQUU7QUFDM0MsRUFBQSxRQUFRLE9BQU8sR0FBRyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFN0MsRUFBQSxRQUFRLElBQUksT0FBTyxDQUFDLFFBQVEsRUFBRTtBQUM5QixFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUE7QUFDQSxFQUFBO0FBQ0EsRUFBQSxVQUFVLElBQUksQ0FBQyxXQUFXLEVBQUU7QUFDNUIsRUFBQSxZQUFZLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3BFLEVBQUEsV0FBVztBQUNYLEVBQUEsZUFBZTtBQUNmLEVBQUEsWUFBWSxNQUFNLEVBQUUsQ0FBQztBQUNyQixFQUFBLFdBQVc7QUFDWCxFQUFBLFNBQVM7QUFDVCxFQUFBLGFBQWE7QUFDYixFQUFBLFVBQVUsV0FBVyxHQUFHLElBQUksQ0FBQztBQUM3QixFQUFBLFNBQVM7QUFDVCxFQUFBLE9BQU8sQ0FBQyxDQUFDOztBQUVULEVBQUEsTUFBTSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxFQUFFO0FBQ25ELEVBQUEsUUFBUTtBQUNSLEVBQUEsVUFBVSxDQUFDLE9BQU8sQ0FBQyxRQUFRO0FBQzNCLEVBQUEsVUFBVSxDQUFDLGVBQWUsRUFBRSxJQUFJLHVCQUF1QixFQUFFLENBQUM7QUFDMUQsRUFBQSxVQUFVO0FBQ1YsRUFBQSxVQUFVLElBQUksRUFBRSxDQUFDLFNBQVMsRUFBRSxFQUFFO0FBQzlCLEVBQUEsWUFBWSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDekIsRUFBQSxXQUFXOztBQUVYLEVBQUEsVUFBVSxPQUFPO0FBQ2pCLEVBQUEsU0FBUzs7QUFFVCxFQUFBLFFBQVEsSUFBSSxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUN2RCxFQUFBLFVBQVUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLGlCQUFpQixDQUFDLEVBQUU7QUFDbEQsRUFBQSxZQUFZLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUN4QixFQUFBLFdBQVc7QUFDWCxFQUFBLFNBQVM7QUFDVCxFQUFBLE9BQU8sQ0FBQyxDQUFDOztBQUVULEVBQUEsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUFDLENBQUM7O0FBRTlDLEVBQUEsTUFBTSxTQUFTLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUU7QUFDdkQsRUFBQSxRQUFRLEtBQUssQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLFNBQVMsS0FBSyxFQUFFO0FBQ2xELEVBQUEsVUFBVSxXQUFXLEdBQUcsS0FBSyxDQUFDOztBQUU5QixFQUFBLFVBQVUsTUFBTSxFQUFFLENBQUM7QUFDbkIsRUFBQSxTQUFTLENBQUMsQ0FBQztBQUNYLEVBQUEsT0FBTzs7QUFFUCxFQUFBLE1BQU0sU0FBUyxNQUFNLEdBQUc7QUFDeEIsRUFBQSxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUM7QUFDcEIsRUFBQSxVQUFVLEtBQUssRUFBRSxXQUFXO0FBQzVCLEVBQUEsVUFBVSxXQUFXLEVBQUUsT0FBTyxDQUFDLFdBQVc7QUFDMUMsRUFBQSxTQUFTLENBQUMsQ0FBQztBQUNYLEVBQUEsT0FBTztBQUNQLEVBQUEsS0FBSztBQUNMLEVBQUEsR0FBRyxDQUFDO0FBQ0osRUFBQSxDQUFDOztFQ2hNRDtBQUNBLEVBQUEsSUFBSSxPQUFPLE1BQU0sS0FBSyxXQUFXLElBQUksT0FBTyxNQUFNLENBQUMsYUFBYSxLQUFLLFdBQVcsRUFBRTtBQUNsRixFQUFBLEVBQUUsTUFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEdBQUcsYUFBYSxDQUFDO0FBQzVDLEVBQUEsRUFBRSxNQUFNLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBR0EsTUFBbUIsQ0FBQztBQUNwRCxFQUFBLEVBQUUsTUFBTSxDQUFDLGFBQWEsQ0FBQyxFQUFFLEdBQUcsZUFBZSxDQUFDO0FBQzVDLEVBQUEsRUFBRSxNQUFNLENBQUMsYUFBYSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7QUFDN0MsRUFBQSxDQUFDO0FBQ0QsRUFBQTtBQUNBLEVBQUEsS0FBSyxJQUFJLE9BQU8sTUFBTSxLQUFLLFdBQVcsRUFBRTtBQUN4QyxFQUFBLEVBQUUsT0FBTyxDQUFDLElBQUksR0FBRyxhQUFhLENBQUM7QUFDL0IsRUFBQSxFQUFFLE9BQU8sQ0FBQyxFQUFFLEdBQUcsZUFBZSxDQUFDO0FBQy9CLEVBQUEsRUFBRSxPQUFPLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztBQUM5QixFQUFBLENBQUM7QUFDRCxFQUFBO0FBQ0EsRUFBQSxLQUFLO0FBQ0wsRUFBQSxFQUFFLElBQUksYUFBYSxHQUFHLElBQUksYUFBYSxFQUFFLENBQUM7QUFDMUMsRUFBQSxFQUFFLElBQUksTUFBTSxFQUFFLE9BQU8sQ0FBQzs7QUFFdEIsRUFBQSxFQUFFLE9BQU8sR0FBRyxVQUFVLENBQUMsV0FBVztBQUNsQyxFQUFBO0FBQ0EsRUFBQTtBQUNBLEVBQUEsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRTtBQUNsQyxFQUFBLE1BQU0sT0FBTyxDQUFDLEtBQUs7QUFDbkIsRUFBQSxRQUFRLHdFQUF3RTtBQUNoRixFQUFBLFFBQVEsdUJBQXVCO0FBQy9CLEVBQUEsT0FBTyxDQUFDO0FBQ1IsRUFBQSxLQUFLOztBQUVMLEVBQUE7QUFDQSxFQUFBLElBQUksTUFBTSxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNuQyxFQUFBLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQzs7QUFFWixFQUFBLEVBQUUsTUFBTSxHQUFHLFdBQVcsQ0FBQyxXQUFXO0FBQ2xDLEVBQUEsSUFBSSxJQUFJLE1BQU0sQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRTtBQUN4QyxFQUFBLE1BQU0sYUFBYSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFMUQsRUFBQTtBQUNBLEVBQUEsTUFBTSxNQUFNLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3JDLEVBQUEsTUFBTSxPQUFPLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3RDLEVBQUEsS0FBSztBQUNMLEVBQUEsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ1YsRUFBQSw7OyJ9
