import { TreeView, classSet, copyToClipboard } from './utils';

export default function GerritFButtonUI($) {
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