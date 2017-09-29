(function(Editor, markdownit, WebUploader){

    function _replaceSelection(cm, active, start, end) {
        var text;
        var startPoint = cm.getCursor('start');
        var endPoint = cm.getCursor('end');
        var end = end || '';
        if (active) {
            text = cm.getLine(startPoint.line);
            start = text.slice(0, startPoint.ch);
            end = text.slice(startPoint.ch);
            cm.setLine(startPoint.line, start + end);
        } else {
            text = cm.getSelection();
            cm.replaceSelection(start + text + end);

            startPoint.ch += start.length;
            endPoint.ch += start.length;
        }
        cm.setSelection(startPoint, endPoint);
        cm.focus();
    }

    /**
     * The state of CodeMirror at the given position.
     */
    function getState(cm, pos) {
        pos = pos || cm.getCursor('start');
        var stat = cm.getTokenAt(pos);
        if (!stat.type) return {};

        var types = stat.type.split(' ');

        var ret = {}, data, text;
        for (var i = 0; i < types.length; i++) {
            data = types[i];
            if (data === 'strong') {
            ret.bold = true;
            } else if (data === 'variable-2') {
            text = cm.getLine(pos.line);
            if (/^\s*\d+\.\s/.test(text)) {
                ret['ordered-list'] = true;
            } else {
                ret['unordered-list'] = true;
            }
            } else if (data === 'atom') {
            ret.quote = true;
            } else if (data === 'em') {
            ret.italic = true;
            }
        }
        return ret;
    }

    // Set default options
    var md = new markdownit();

    md.set({
      html:         false,        // Enable HTML tags in source
      xhtmlOut:     false,        // Use '/' to close single tags (<br />)
      breaks:       true,        // Convert '\n' in paragraphs into <br>
      langPrefix:   'language-',  // CSS language prefix for fenced blocks
      linkify:      false,        // Autoconvert URL-like text to links
      typographer:  false,        // Enable smartypants and other sweet transforms
    });

    window.markdowniter = md;

    var toolbar = Editor.toolbar;

    var replaceTool = function(name, callback){
        for(var i=0, len=toolbar.length; i<len; i++){
            var v = toolbar[i];
            if(typeof(v) !== 'string' && v.name === name){
                v.action = callback;
                break;
            }
        }
    };

    var $body = $('body');

    //添加连接工具
    var ToolLink = function(){
        var self = this;
        this.$win = $([
            '<div class="modal fade" tabindex="-1" role="dialog" aria-labelledby="editorToolImageTitle" aria-hidden="true">',
                '<div class="modal-dialog" role="document">',
                    '<div class="modal-content">',
                        '<div class="modal-header">',
                            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>',
                            '<h3 id="editorToolImageTitle">添加连接</h3>',
                        '</div>',
                        '<div class="modal-body">',
                            '<form class="form-horizontal">',
                                '<div class="control-group">',
                                    '<label class="control-label">标题</label>',
                                    '<div class="controls">',
                                        '<input type="text" name="title" placeholder="Title">',
                                    '</div>',
                                '</div>',
                                '<div class="control-group">',
                                    '<label class="control-label">连接</label>',
                                    '<div class="controls">',
                                        '<input type="text" name="link" value="http://" placeholder="Link">',
                                    '</div>',
                                '</div>',
                            '</form>',
                        '</div>',
                        '<div class="modal-footer">',
                            '<button class="btn btn-primary" role="save">确定</button>',
                        '</div>',
                    '</div>',
                '</div>',
            '</div>'
        ].join('')).appendTo($body);

        this.$win.on('click', '[role=save]', function(){
            self.$win.find('form').submit();
        }).on('submit', 'form', function(){
            var $el = $(this);
            var title = $el.find('[name=title]').val();
            var link = $el.find('[name=link]').val();

            self.$win.modal('hide');

            var cm = self.editor.codemirror;
            var stat = getState(cm);
            _replaceSelection(cm, stat.link, '!['+ title +']('+ link +')');

            $el.find('[name=title]').val('');
            $el.find('[name=link]').val('http://');

            return false;
        });
    };

    ToolLink.prototype.bind = function(editor){
        this.editor = editor;
        this.$win.modal('show');
    };

    //图片上传工具
    var ToolImage = function(){
        var self = this;
        this.$win = $([
            '<div class="modal fade" tabindex="-1" role="dialog" aria-labelledby="editorToolImageTitle" aria-hidden="true">',
                '<div class="modal-dialog" role="document">',
                    '<div class="modal-content">',
                        '<div class="modal-header">',
                            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>',

                            '<div class="index-tab-navs" role="tablist">',
                            '<div class="nav" role="tablist">',
                            '<a class="tabButton fade in active" role="presentation" href="#collapseUpload" aria-controls="collapseUpload" id="headingUpload" type="button" role="tab" data-toggle="tab">',
                            '插入图片',
                            '</a>',
                            '<a class="tabButton fade in" role="presentation" href="#collapseSelect" aria-controls="collapseSelect" id="headingSelect" type="button" role="tab" data-toggle="tab">',
                            '选择图片',
                            '</a>',
                            '</div>',
                            '</div>',
                        '</div>',
                        '<div class="modal-body tab-content">',
                            '<div class="tab-pane fade in active" role="tabpanel" id="collapseUpload">',
                                '<div class="upload-img">',
                                    '<div class="button">上传图片</div>',

                                    '<span class="tip"></span>',
                                    '<div class="alert alert-error hide"></div>',
                                '</div>',
                            '</div>',
                            '<div class="board-pins tab-pane fade in" role="tabpanel" id="collapseSelect">',
                                '<div style="padding-bottom: 10px;">',
                                    '<input name="q" id="query" class="form-control" placeholder="搜索条件"/>',
                                '</div>',
                                '<div id="selectList" class="board_grid">',
                                    '<div class="grid-sizer"></div>',
                                '</div>',
                                '<div id="pic-page-marker" style="height: 32px; color: darkgray;text-align: center;">查询结果最多显示24张图片</div>',
                                '<div class="clearfix"></div>',
                            '</div>',
                        '</div>',
                    '</div>',
                '</div>',
            '</div>'
        ].join('')).appendTo($body);

        var gridBoardImagesMasonry = $('.board_grid').masonry({
            // options...
            itemSelector: '.item',
            columnWidth: 90,
            gutter: 2
        });

        // $('#pic-page-marker').on('lazyshow', function () {
        //     loadPicList(++pic_page);
        // }).lazyLoadXT({visibleOnly: false, scrollContainer: $('#pic-page-marker')});

        this.$win.find('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            var selectId = $(e.target).attr('id');
            if (!$(e.target).hasClass('active')) {
                $('a[data-toggle="tab"]').removeClass('active');
                $(e.target).addClass('active');
                loadPicList('');
            }
        });

        function loadPicList(query) {
            $('#selectList').children('.item').remove();
            $.ajax({
                url: "/api/v2/images?type=image&limit=24&page=1&q=" + query
            }).done(function (response) {
                var itemLength = response.data.length;
                response.data.forEach(function (item) {
                    var itemHtml =
                        '<a class="item" data-id="' + item.id + '" data-title="' + item.title + '" data-src="' + item.image + '">' +
                        '<img src="'+ item.image_86 +'" title="'+ item.title +'" width="90"/>' +
                        '<div class="cover" alt="' + item.title + '" title="' + item.title + '"></div>' +
                        '</a>';
                    var jpicelements = $(itemHtml);
                    gridBoardImagesMasonry.append(jpicelements)
                        .masonry('appended', jpicelements);
                });
                gridBoardImagesMasonry.imagesLoaded().progress(function () {
                    gridBoardImagesMasonry.masonry('layout');
                });
                // if (itemLength >= 5) {
                //     gridBoardImagesMasonry.masonry('layout');
                //     $(window).lazyLoadXT();
                //     $('#pic-page-marker').lazyLoadXT({visibleOnly: false, checkDuplicates: false, forceLoad: true});
                // } else {
                //     gridBoardImagesMasonry.masonry('layout');
                //     $("#pic-page-marker").remove();
                // }
            });
        }


        this.$upload = this.$win.find('.upload-img').css({
            padding: '60px 0',
            textAlign: 'center',
            border: '4px dashed#ddd'
        });

        this.$uploadBtn = this.$upload.find('.button').css({
            width: 86,
            height: 40,
            margin: '0 auto'
        });

        this.$uploadTip = this.$upload.find('.tip').hide();

        this.file = false;
        var _csrf = $('[name=_csrf]').val();

        this.uploader = WebUploader.create({
            swf: '/public/libs/webuploader/Uploader.swf',
            server: '/upload?_csrf=' + _csrf,
            pick: this.$uploadBtn[0],
            paste: document.body,
            dnd: this.$upload[0],
            auto: true,
            fileSingleSizeLimit: 2 * 1024 * 1024,
            //sendAsBinary: true,
            // 只允许选择图片文件。
            accept: {
                title: 'Images',
                extensions: 'gif,jpg,jpeg,bmp,png',
                mimeTypes: 'image/*'
            }
        });

        this.uploader.on('beforeFileQueued', function(file){
            if(self.file !== false || !self.editor){
                return false;
            }
            self.showFile(file);
        });

        this.uploader.on('uploadProgress', function(file, percentage){
            // console.log(percentage);
            self.showProgress(file, percentage * 100);
        });

        this.uploader.on('uploadSuccess', function(file, res){
            if(res.success){
                self.$win.modal('hide');

                var cm = self.editor.codemirror;
                var stat = getState(cm);
                _replaceSelection(cm, stat.image, '!['+ file.name +']('+ res.url +')');

            }
            else{
                self.removeFile();
                self.showError(res.msg || '服务器走神了，上传失败');
            }
        });

        this.uploader.on('uploadComplete', function(file){
            self.uploader.removeFile(file);
            self.removeFile();
        });

        this.uploader.on('error', function(type){
            self.removeFile();
            switch(type){
                case 'Q_EXCEED_SIZE_LIMIT':
                case 'F_EXCEED_SIZE':
                    self.showError('文件太大了, 不能超过2M');
                    break;
                case 'Q_TYPE_DENIED':
                    self.showError('只能上传图片');
                    break;
                default:
                    self.showError('发生未知错误');
            }
        });

        this.uploader.on('uploadError', function(){
            self.removeFile();
            self.showError('服务器走神了，上传失败');
        });

        this.$win.on('click', '.item', function(event){
            var dataset = event.currentTarget.dataset;
            var id = dataset.id;
            var src = dataset.src;
            var title = dataset.title;
            self.$win.modal('hide');
            var cm = self.editor.codemirror;
            var stat = getState(cm);
            _replaceSelection(cm, stat.image, '!['+ title +']('+ src +')');
        });

        $('#query').change(function(event){
            console.info(event);
        });

        $('#query').on('input propertychange', function() {
            var val = $(this).val();
            console.info(val);
            loadPicList(val);
        });
    };

    ToolImage.prototype.removeFile = function(){
        //var self = this;
        this.file = false;
        this.$uploadBtn.show();
        this.$uploadTip.hide();
    };

    ToolImage.prototype.showFile = function(file){
        //var self = this;
        this.file = file;
        this.$uploadBtn.hide();
        this.$uploadTip.html('正在上传: ' + file.name).show();
        this.hideError();
    };

    ToolImage.prototype.showError = function(error){
        this.$upload.find('.alert-error').html(error).show();
    };

    ToolImage.prototype.hideError = function(error){
        this.$upload.find('.alert-error').hide();
    };

    ToolImage.prototype.showProgress = function(file, percentage){
        this.$uploadTip
            .html('正在上传: ' + file.name + ' ' + percentage + '%')
            .show();
    };

    ToolImage.prototype.bind = function(editor){
        this.editor = editor;
        this.$win.modal('show');
    };

    var toolImage = new ToolImage();
    var toolLink = new ToolLink();

    replaceTool('image', function(editor){
        toolImage.bind(editor);
    });
    replaceTool('link', function(editor){
        toolLink.bind(editor);
    });

    //当编辑器取得焦点时，绑定 toolImage；
    var createToolbar = Editor.prototype.createToolbar;
    Editor.prototype.createToolbar = function(items){
        createToolbar.call(this, items);
        var self = this;
        $(self.codemirror.display.input).on('focus', function(){
            toolImage.editor = self;
        });
    };

    //追加内容
    Editor.prototype.push = function(txt){
        var cm = this.codemirror;
        var line = cm.lastLine();
        cm.setLine(line, cm.getLine(line) + txt);
    };
})(window.Editor, window.markdownit, window.WebUploader);
