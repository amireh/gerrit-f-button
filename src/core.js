import { discardLeadingSlash, injectCSS } from './utils';
import Styles from './styles';
import GerritFButtonUI from './ui';

var NR_AJAX_CALLS = 2;

export default function GerritFButton() {
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
