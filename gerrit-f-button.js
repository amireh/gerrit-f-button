// ==UserScript==
// @name        Gerrit F Button
// @namespace   ahmad@amireh.net
// @include     https://gerrit.instructure.com/*
// @version     1
// @grant       GM_setClipboard
// @grant       none
// @run-at      document.end
// ==/UserScript==

/* eslint-env browser */
/* eslint quotes:0, strict:0, no-underscore-dangle:0, no-console:0 */

var HAS_SCROLL_INTO_VIEW = typeof HTMLElement.prototype.scrollIntoViewIfNeeded === 'function';
var NR_AJAX_CALLS = 2;

function GerritFButton() {
  var KC_F = 70;

  function CSS() {/*
    .clipboard-16x16 {
      background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACaklEQVR4nG2SS2uUWRCGn6rvnC92LkbbyzgZLxkULyBJ1IyICjIwG3/ALAYcBnHhZhaCwvwC94qC+g8UREH/g+BKF0ZFicZgkml1EuykbyffOeWik+lO8IWioOA81Fvvkf17hkSQn0u9vTJY3jr0085dV0bGjpyKMfJh6v3S65cTfzfq9TeLi9UoqpVXb98t0SVnyS7+fmb01kLLOP/PVbZt207/wAAC1Ou1LZ8qlce3b17n2Pg4N65fuwv8sQagKoNnR3ZSjRnTr54xNWHElChiu8eUGDt8iAt/nePO7VsbWCeHGaG2wLHhH1A/iZYG0NLGrt6u5epnsLT+Pc4wWvV5Yt1hFrDUwlLAYguLq71FEQKWvgPAjGZtgaKhqAXUAvNfq3xqCJr3IXkv2tNHyPooisLWA7Itg/2nf92b/zbUG0ihioUl7r9oUj75J37oMG7HAfLt+3j54TM+7/mxlLvn0x9nJ7ssQFJBvAAJi0uIeUZGx9hcLqOqqAq1Wo1KpbJpbnbm4cG9w7tfT059AVCAqCAexLdBRSoIIZBiIsZIjIlfjp/g0uUrjIyO9nif93RuACQF8fq/r7AcaDZbxJRQBAxEhUwzGo0m0DlFGyCrFlYkUMSCGBMpgRHBDOcczWaDIsa1gKgg+erIyLzinUdVVnkgQkqJf+fmiEXR/Q8giSG+k7E6xeeezGVrIhMgyxxm1g0wWhap1ArMDDNopRLeOTJVWIdwziHSsesEJh48WZx+9HRRzMAMfH+pPDc70zf/35eVFDq1vBxIXRsI39GhfcPjZhwVVVjZyrD2hinVYkr33k3PFADfABCHPBaR9zqPAAAAAElFTkSuQmCC);
      background-repeat: no-repeat;
      background-position: center center;
      width: 32px;
    }

    .col--centered {
      text-align: center;
    }

    .f-button__frame {
      position: fixed;
      top: 0;
      right: auto;
      bottom: 0;
      left: 0;

      width: 50%;
      overflow: auto;

      border-right: 1px solid #aaa;
      background: white;
      padding: 10px;

      z-index: 6;
    }

    .f-button__frame--commented-only .f-button__file:not(.f-button__file--commented) {
      display: none;
    }

    .f-button__controls {
      padding-bottom: 1em;
      margin-bottom: 1em;
      border-bottom: 1px solid #ddd;
    }

    .f-button__table {
      width: 100%;
    }

    .f-button__table td, .f-button__table th {
      padding: 0;
      line-height: 1.5rem;
      vertical-align: top;
    }

    .f-button__table th {
      text-align: left;
    }

    .f-button__table th.col--centered {
      text-align: center;
    }

    .f-button__file:nth-of-type(odd) {
      background: #eee;
    }

    .f-button__file:hover {
      background: #D8EDF9;
    }

    .f-button__file.f-button__file--active {
      background-color: #fcfa96;
    }

    .f-button__file-link {
      display: block;
    }
  */}

  function UI($) {
    var $frame = $('<div />', { 'class': 'f-button__frame' });
    var $activeRow;

    return {
      props: {
        files: [],
        currentFile: null,
        commentedOnly: true,
        showComments: false
      },

      /**
       * Show or hide the F button frame.
       */
      toggle: function() {
        if ($frame.parent().length > 0) {
          $frame.detach();
        }
        else {
          $frame.appendTo(document.body);
          this.componentDidRender();
        }
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
        var $table = $('<table />', { 'class': 'f-button__table' });
        var $thead = $('<thead />').appendTo($table);
        var $tbody = $('<tbody />').appendTo($table);
        var $header = $('<tr />').appendTo($thead);

        $activeRow = null;

        $header.append($('<th />', {
          title: 'Comments',
          class: 'col--centered'
        }).text('C'));

        $header.append($('<th />'));
        $header.append($('<th />').text('File Path'));

        files.forEach(function(file) {
          var filePath = file.filePath;
          var $row = $('<tr />', { class: 'f-button__file' });
          var hasComments = (file.comments || []).length > 0;

          if (currentFile === filePath) {
            $row.addClass('f-button__file--active');
            $activeRow = $row;
          }

          if (hasComments) {
            $row.addClass('f-button__file--commented');
          }

          $row.append(
            $('<td />', {
              class: 'col--centered'
            }).text(hasComments ? file.comments.length : '')
          );

          $row.append(
            $('<td />', {
              class: 'col--centered clipboard-16x16',
              title: 'Copy filepath to clipboard'
            }).bind('click', this.copyToClipboard.bind(this, filePath))
          );

          var $textColumn = (
            $('<td />').append(
              $('<a />', { href: file.url, class: 'f-button__file-link' }).text(filePath)
            )
          );

          if (this.props.showComments && hasComments) {
            $textColumn.append(this.renderFileComments(file.comments));
          }

          $row.append($textColumn);

          $tbody.append($row);
        }.bind(this));

        return $table;
      },

      renderFileComments: function(comments) {
        var $comments = $('<ol />', { class: 'f-button__file-comments' });

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

        var $toggleCommented = (
          $('<label />')
            .append($('<input />', {
              type: 'checkbox',
              checked: this.props.commentedOnly
            }))
            .append($('<span />').text('Hide files with no comments'))
            .bind('click', this.toggleCommented.bind(this))
        );

        var $toggleComments = (
          $('<label />')
            .append($('<input />', {
              type: 'checkbox',
              checked: this.props.showComments
            }))
            .append($('<span />').text('Display comment bodies'))
            .bind('click', this.toggleComments.bind(this))
        );

        $controls.append($toggleCommented);
        $controls.append($toggleComments);

        return $controls;
      },

      /**
       * @private
       *
       * Copy a filepath to the clipboard.
       */
      copyToClipboard: function(filePath, e) {
        GM_setClipboard(filePath);
      },

      /**
       * @private
       */
      toggleCommented: function() {
        this.setProps({ commentedOnly: !this.props.commentedOnly });
      },

      /**
       * @private
       */
      toggleComments: function() {
        this.setProps({ showComments: !this.props.showComments });
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

          ui.setProps({
            files: cachedFiles,
            currentFile: context.currentFile
          });
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
            ui.setProps({
              files: cachedFiles,
              currentFile: context.currentFile
            });
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

      console.log('gerrit-f-button: active.');
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