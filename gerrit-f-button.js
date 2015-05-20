// ==UserScript==
// @name        Gerrit F Button
// @namespace   ahmad@amireh.net
// @include     https://gerrit.instructure.com/*
// @version     1
// @grant       none
// @run-at      document.end
// ==/UserScript==

/* eslint-env browser */
/* eslint quotes:0, strict:0, no-underscore-dangle:0, no-console:0 */

function GerritFButton() {
  var KC_F = 70;

  function CSS() {/*
    .f-button__frame {
      position: fixed;
      bottom: 0;
      left: 10%;
      right: 10%;
      height: 50%;
      min-height: 120px;
      max-height: 50%;

      border: 1px solid #aaa;
      padding: 10px;

      background: white;
      z-index: 6;

      overflow: auto;
    }

    .f-button__table {
      width: 100%;
    }

    .f-button__table tbody tr:nth-of-type(odd) {
      background: #fafafa;
    }

    .f-button__table th {
      text-align: left;
    }

    .f-button__table tbody tr:hover {
      background: rgba(209, 245, 248, 0.32);
    }

    .f-button__table td, .f-button__table th {
      padding: 0;
      line-height: 1.5rem;
    }

    .f-button__file--active {
      font-weight: bold;
    }
  */}

  function UI($) {
    var $frame = $('<div />', { 'class': 'f-button__frame' });

    return {
      toggle: function() {
        if ($frame.parent().length > 0) {
          $frame.detach();
        }
        else {
          $frame.appendTo(document.body);
        }
      },

      render: function(files, currentFilePath) {
        var $table = $('<table />', { 'class': 'f-button__table' });
        var $thead = $('<thead />').appendTo($table);
        var $tbody = $('<tbody />').appendTo($table);
        var $header = $('<tr />').appendTo($thead);

        $header.append($('<th />').text('File Path'));
        $header.append($('<th />').text('Comments'));

        files.forEach(function(file) {
          var filePath = file.filePath;
          var $row = $('<tr />');
          var hasComments = (file.comments || []).length > 0;

          if (currentFilePath === filePath) {
            $row.addClass('f-button__file--active');
          }

          $row.append(
            $('<td />').append(
              $('<a />', { href: file.url }).text(filePath)
            )
          );

          $row.append(
            $('<td />').text(
              hasComments ?
                file.comments.length + ' comments' :
                ''
              )
          );

          $tbody.append($row);
        });

        $frame.empty().append($table);
      }
    };
  }

  function injectCSS() {
    var styleNode = document.createElement('style');

    styleNode.innerHTML = CSS.toString()
      .replace('function CSS() {/*', '')
      .replace('*/}', '')
    ;

    document.head.appendChild(styleNode);
  }

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

    function set(filePath, item, value) {
      var entry = files.filter(function(_entry) {
        return _entry.filePath === filePath;
      })[0];

      if (!entry) {
        entry = { filePath: filePath };
        files.push(entry);
      }

      entry[item] = value;
    }

    var tick = (function(NR_AJAX_CALLS) {
      var nrAjaxCallsDone = 0;

      return function() {
        if (++nrAjaxCallsDone === NR_AJAX_CALLS) {
          done(files);
        }
      };
    }(2 /* change me if u add another getRemote() call! */));

    function getUrlForFile(filePath) {
      return (
        '/#/c/' + chNumber + '/' + rvNumber + '/' + filePath.replace(/^\//, '')
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
      Object.keys(rvFiles).forEach(function(filePath) {
        set(filePath, 'url', getUrlForFile(filePath));
      });
    });

    getRemote('/comments', function(rvFileComments) {
      Object.keys(rvFileComments).forEach(function(filePath) {
        set(filePath, 'comments', rvFileComments[filePath]);
      });
    });
  }

  return {
    install: function(Gerrit, $) {
      var ui = new UI($);
      var context, cachedFiles;

      function fetchFilesAndRender(chNumber, rvNumber) {
        fetch(chNumber, rvNumber, function(files) {
          cachedFiles = files;
          ui.render(cachedFiles, context.currentFile);
        });
      }

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
            ui.render(cachedFiles, context.currentFile);
          }
        }
        else { // no longer in a change? untrack the downloaded file listing
          cachedFiles = null;
        }
      });

      window.addEventListener('keyup', function(e) {
        if (!context.chNumber) { // not viewing a change? forget it!
          return;
        }

        if ([ e.keyCode, e.which ].indexOf(KC_F) > -1) {
          if (!$(e.target).is('.com-google-gerrit-client-diff-DraftBox_BinderImpl_GenCss_style-editArea' /* heheheh */)) {
            ui.toggle();
          }
        }
      });

      injectCSS();
    }
  };
}

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
