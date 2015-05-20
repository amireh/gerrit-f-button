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

  .f-button__table td {
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

function poll(options, tester, done) {
  var poller, timeout;

  timeout = setTimeout(function() {
    poller = clearInterval(poller);
    done(true);
  }, options.timeout);

  poller = setInterval(function() {
    if (tester()) {
      poller = clearInterval(poller);
      timeout = clearTimeout(timeout);
      done();
    }
  }, options.every);
}

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
      $header.append($('<th />').text('Lines Changed'));

      Object.keys(files).forEach(function(filePath) {
        var file = files[filePath];
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

        $row.append(
          $('<td />').text([
            '+' + file.linesInserted,
            '-' + file.linesDeleted
          ].join(' / '))
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

function getRemote(url, callback) {
  window.$.ajax({
    url: url,
    type: 'GET',
    dataType: 'text',
    success: function(resp) {
      callback(JSON.parse(resp.substr(")]}'".length)));
    }
  });
}

function fetch(chNumber, rvNumber, done) {
  var files = {};

  function set(filePath, item, value) {
    if (!files[filePath]) {
      files[filePath] = {};
    }

    files[filePath][item] = value;
  }

  var tick = (function() {
    var NR_AJAX_CALLS = 2;
    var nrAjaxCallsDone = 0;

    return function() {
      if (++nrAjaxCallsDone === NR_AJAX_CALLS) {
        done(files);
      }
    };
  }());

  var baseUrl = [ '/changes', chNumber, 'revisions', rvNumber ].join('/');

  function getUrlForFile(filePath) {
    return (
      '/#/c/' + chNumber + '/' + rvNumber + '/' + filePath.replace(/^\//, '')
    );
  }

  getRemote(baseUrl + '/files', function(rvFiles) {
    Object.keys(rvFiles).forEach(function(filePath) {
      var file = rvFiles[filePath];

      set(filePath, 'linesDeleted', file.lines_deleted || 0);
      set(filePath, 'linesInserted', file.lines_inserted || 0);
      set(filePath, 'url', getUrlForFile(filePath));
    });

    tick();
  });

  getRemote(baseUrl + '/comments', function(rvFileComments) {
    Object.keys(rvFileComments).forEach(function(filePath) {
      set(filePath, 'comments', rvFileComments[filePath]);
    });

    tick();
  });
}

function install(Gerrit, $) {
  var ui = new UI($);
  var context, lastFetchedFiles;

  function update() {
    ui.render(lastFetchedFiles || [], context.currentFile);
  }

  function reset() {
    lastFetchedFiles = null;
  }

  Gerrit.on('showchange', function(chInfo, rvInfo) {
    if ((!chInfo || !chInfo.id) || (!rvInfo || !rvInfo.name)) {
      console.log('Does not seem to be viewing a revision, ignoring...');
      return;
    }

    fetch(chInfo._number, rvInfo._number, function(files) {
      lastFetchedFiles = files;
      update();
    });
  });

  Gerrit.on('history', function(token) {
    context = parseContextFromURL(token);

    if (context.chNumber) {
      if (!lastFetchedFiles) {
        fetch(context.chNumber, context.rvNumber, function(files) {
          lastFetchedFiles = files;
          update();
        });
      }

      update();
    }
    else {
      reset();
    }
  });

  window.addEventListener('keyup', function(e) {
    if (!context.chNumber) { // not viewing a change? forget it!
      return;
    }

    if (e.keyCode === KC_F || e.which === KC_F) {
      if (!$(e.target).is('.com-google-gerrit-client-diff-DraftBox_BinderImpl_GenCss_style-editArea' /* heheheh */)) {
        ui.toggle();
      }
    }
  });

  injectCSS($);
}

poll(
  { every: 250, timeout: 30000 },
  function() {
    return window.Gerrit && window.jQuery;
  },
  function(timedOut) {
    if (!timedOut) {
      console.log('gerrit-f-button: installing...');

      install(window.Gerrit, window.jQuery);

      console.log('Hello from gerrit-f-button!');
    }
  }
);
