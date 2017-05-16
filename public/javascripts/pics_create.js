var insertImageBoardAfterCreate = true;

var _csrf = $('meta[name=csrf-token]').attr('content');
var uploader = new Q.Uploader({
    url: "/imageupload?type=file&_csrf=" + _csrf,
    target: document.getElementById("upload_area"),
    view: document.getElementById("preview"),
    allows: ".jpg,.png,.gif,.bmp,.jpeg",
    auto: false,
    multiple: false,
    dataType: "json",
    data: {title: 'test'},
    //图片缩放
    // DONE(hhdem) 如果服务器是在win环境下, 打开图片缩放将无法成功上传
    // scale: {
    //     //最大图片大小(width|height)
    //     maxWidth: 700
    // },
    UI: {
        init: function () {
            console.info('UI init method');
        },
        draw: function (task) {
            var self = this,
                ops = self.ops,
                boxView = ops.view;

            if (!boxView) return;

            var name = task.name;

            var li = '';
            loadImage(task.file,
                function (img, data) {
                    img.style.width = '100%';
                    var html =
                        '<div class="u-img"></div><span class="u-loaded"></span><span class="u-total"></span>';
                    var taskId = task.id,
                        box = Q.createEle("div", "u-item", html);

                    box.taskId = taskId;

                    var boxImage = Q.getFirst(box);

                    task.box = box;
                    boxImage.appendChild(img);
                    //添加到视图中
                    boxView.appendChild(box);

                    //---------------- 预览图片并更新UI ----------------
                    $('#preview-desc').html(name);
                    $('#preview').append(img);
                },
                {orientation: true} // Options
            );


            //self.previewImage(boxImage, task, ops);
        },
        update: function (task) {

        }
    },
    on: {
        //添加之前触发
        add: function (task) {
            if (task.disabled) {return alert("允许上传的文件格式为：" + this.ops.allows)}
            $('#upload_view').show();
            $('#upload_area').hide();
        },
        //图片预览后触发
        preview: function (data) {
            console.log(data.task.name + " : " + data.src);
        },
        //图片压缩后触发,如果图片或浏览器不支持压缩,则不触发
        scale: function (data) {
            console.log(data.task.name + " : 已压缩！");
        },
        //上传之前触发
        upload: function (task) {
            //可针对单独的任务配置参数(POST方式)
            var boardSelected = $('#image_upload .right-part .boardlist .item.selected');
            uploader.data = {
                title: $('#preview-desc').val(),
                board: boardSelected.data("id")
            };
        },
        //上传完成后触发
        complete: function (task) {
            if (task.state != Q.Uploader.COMPLETE) {return console.log(task.name + ": " + Q.Uploader.getStatusText(task.state) + "!")}

            var json = task.json;
            if (!json.success) {
                $('#board_message_alert .alert-content').html(json.msg);
                $('#board_message_alert').fadeIn();
                return console.error(task.name + ": 服务器未返回正确的数据！", json.msg);
            }

            console.log(task.name + ": 服务器返回 " + (task.response || ""));
            // 如果需要插入则把新创建的图片插入到列表中
            if (insertImageBoardAfterCreate) {
                var resJson = JSON.parse(task.response);
                var item = resJson.data[0];
                var itemHtml = $("#picBoxTmp").tmpl({
                    item: item,
                    highlight: true,
                    image: $('#preview').children('canvas').html()
                });

                var jpicelements = $(itemHtml);
                // 上传成功后, 直接把预览里的 canvas 加入 _pic_box 里面
                jpicelements.children('#pic_' + item.id).children('img').remove();
                jpicelements.children('#pic_' + item.id).prepend($('#preview').children('canvas'));
                // TODO 把预览里的board信息也添加到 _pic_box 里面
                //var jpicelements = $('<div class="grid-item heightlight" id="'+resJson.id+'"><div class="grid-item-content"><img src="' + resJson.url + '" title="'+resJson.title+'" alt="'+resJson.title+'"/></div></div>');

                //gridMasonry.append(jpicelements)
                //    .masonry('prepended', jpicelements);
                gridMasonry.append(jpicelements).masonry('insertItems', 1, jpicelements);
                gridMasonry.imagesLoaded().progress(function () {
                    gridMasonry.masonry('layout');
                });
            }
            //this.list  为上传任务列表
            //this.index 为当前上传任务索引
            if (this.index >= this.list.length - 1) {
                //所有任务上传完成
                console.log("所有任务上传完成：" + new Date());
                $('#image_upload').modal('hide');
                $('#upload-submit').button('reset');
            }
        }

    }
});

// 开始上传图片
document.getElementById("upload-submit").onclick = function () {
    var $this = $(this);
    if(boardList.length == 0) {
        // 如果没有 Board 提示创建
        $('#board_message_alert .alert-content').html('请先创建一个 Board 吧!');
        $('#board_message_alert').fadeIn();
        return;
    }
    $this.button('loading');
    uploader.start();
};

$('#image_upload').on('hidden.bs.modal', function (e) {
    $('#upload-submit').button('reset');
    $('#upload_area').show();
    $('#upload_view').hide();
    $('#preview').html('');
});
$('#image_upload').on('hide.bs.modal', function (e) {
    $('#upload-submit').button('reset');
    $('#upload_area').show();
    $('#upload_view').hide();
    $('#preview').html('');
});

function isInsertImageBoardAfterCreate (isInsert) {
    insertImageBoardAfterCreate = isInsert;
}