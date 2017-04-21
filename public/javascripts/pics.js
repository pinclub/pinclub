$(document).ready(function () {

    // Grid layout
    var gridMasonry = $('.grid').masonry({
        // options...
        itemSelector: '.grid-item',
        columnWidth: '.grid-sizer',
        gutter: 15,
        percentPosition: true
    });
    var lastItemId = [];

    function similarPics(picid) {
        let sid = lastItemId['all'];
        if (!picid) {
            return;
        }

        if (!!lastItemId[picid]) {
            sid = lastItemId[picid]
        }
        var data = {
            id: picid,
            sid: sid
        };
        $.ajax({
            url: "api/v2/images/sim",
            data: data
        }).done(function (responseText) {
            console.log(responseText);
            var items = gridMasonry.masonry('getItemElements');
            let rids = _.map(responseText.data, 'id');
            let aids = _.map(items, 'id');
            let needInsertItem = _.filter(responseText.data, function (o) {
                return _.includes(_.difference(rids, aids), o.id)
            });
            needInsertItem.forEach(function (item) {
                let itemHtml = $("#picBoxTmp").tmpl({item: item, highlight: true});
                lastItemId[picid] = item.id;
                let jpicelements = $(itemHtml);
                var items = gridMasonry.masonry('getItemElements');
                let clickIndex = 0;
                _.find(items, function (e) {
                    clickIndex++;
                    return e.id == picid;
                });
                gridMasonry.append(jpicelements).masonry('insertItems', clickIndex, jpicelements);
            });
            gridMasonry.imagesLoaded().progress(function () {
                gridMasonry.masonry('layout');
            });
        });
    }

    $(".grid-item .actions .right a").click(function (e) {
        console.log('e: ', e);
    });

    // Lazyload
    var topic_page = 1;
    var pic_page = 1;
    $('#page-marker').on('lazyshow', function () {
        $.ajax({
            url: "api/v2/topics?page="+topic_page
        }).done(function (responseText) {
            console.info(responseText);
            let itemLength = responseText.data.length;
            let elements = [];
            responseText.data.forEach(function(item) {
                elements.push($("#topicListTmp").tmpl({topic:item}));
            });
            $('#topic_list').append(elements);
            if (itemLength >= 10) {
                $(window).lazyLoadXT();
                $('#page-marker').lazyLoadXT({visibleOnly: false, checkDuplicates: false});
            } else {
                $("#page-marker").remove();
            }
            topic_page++;

        });

    }).lazyLoadXT({visibleOnly: false});

    $('#pic-page-marker').on('lazyshow', function () {
        $.ajax({
            url: "api/v2/topics?type=image&limit=5&page="+pic_page
        }).done(function (responseText) {
            let itemLength = responseText.data.length;
            let picelements = '';
            responseText.data.forEach(function(item) {
                let itemHtml = $("#picBoxTmp").tmpl({item:item});
                lastItemId['all'] = item.id;
                let jpicelements = $(itemHtml);
                gridMasonry.append(jpicelements)
                    .masonry( 'appended', jpicelements);
            });
            gridMasonry.imagesLoaded().progress( function() {
                gridMasonry.masonry('layout');
            });
            if (itemLength >= 5) {
                gridMasonry.masonry('layout');
                $(window).lazyLoadXT();
                $('#pic-page-marker').lazyLoadXT({visibleOnly: false, checkDuplicates: false});
            } else {
                gridMasonry.masonry('layout');
                $("#pic-page-marker").remove();
            }
            pic_page++;
        });
    }).lazyLoadXT({visibleOnly: false});

    // Upload
    var uploader = new Q.Uploader({
        url: "imageupload?type=file",
        target: document.getElementById("upload_area"),
        view: document.getElementById("preview"),
        allows: ".jpg,.png,.gif,.bmp,.jpeg",
        auto: false,
        multiple: false,
        dataType: "json",
        data: { title: 'test'},
        //图片缩放
        scale: {
            //最大图片大小(width|height)
            maxWidth: 700
        },
        UI: {
            //init: function () { },
            draw: function (task) {
                var self = this,
                    ops = self.ops,
                    boxView = ops.view;

                if (!boxView) return;

                var name = task.name;

                var html =
                    '<div class="u-img"></div><span class="u-loaded"></span><span class="u-total"></span>';

                var taskId = task.id,
                    box = Q.createEle("div", "u-item", html);

                box.taskId = taskId;

                var boxImage = Q.getFirst(box);

                task.box = box;

                //添加到视图中
                boxView.appendChild(box);

                //---------------- 预览图片并更新UI ----------------
                $('#preview-desc').html(name);
                self.previewImage(boxImage, task, ops);
            },
            update: function(task){

            }
        },
        on: {
            //添加之前触发
            add: function (task) {
                if (task.disabled) return alert("允许上传的文件格式为：" + this.ops.allows);
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
                uploader.data = {title: $('#preview-desc').val()};
            },
            //上传完成后触发
            complete: function (task) {
                if (task.state != Q.Uploader.COMPLETE) return console.log(task.name + ": " + Q.Uploader.getStatusText(task.state) + "!");

                var json = task.json;
                if (!json) return console.log(task.name + ": 服务器未返回正确的数据！<br />");

                console.log(task.name + ": 服务器返回 " + (task.response || ""));
                let resJson = JSON.parse(task.response);
                //var gridItem = document.createElement('div');
                //gridItem.classList = 'grid-item';
                //gridItem.innerHTML = '<div class="grid-item-content"><img src="' + resJson.url + '" title="'+resJson.url+'" alt="'+resJson.url+'"/></div>';
                //bricklayer.prepend(gridItem);
                let item = resJson.data[0];
                let itemHtml = $("#picBoxTmp").tmpl({item:item, highlight: true});
                let jpicelements = $(itemHtml);
                //let jpicelements = $('<div class="grid-item heightlight" id="'+resJson.id+'"><div class="grid-item-content"><img src="' + resJson.url + '" title="'+resJson.title+'" alt="'+resJson.title+'"/></div></div>');

                gridMasonry.append(jpicelements)
                    .masonry( 'prepended', jpicelements);
                gridMasonry.imagesLoaded().progress( function() {
                    gridMasonry.masonry('layout');
                });
                //this.list  为上传任务列表
                //this.index 为当前上传任务索引
                if (this.index >= this.list.length - 1) {
                    //所有任务上传完成
                    console.log("所有任务上传完成：" + new Date());
                    $('#image_upload').modal('hide');
                }
            }

        }
    });

    document.getElementById("upload-submit").onclick = function () {
        uploader.start();
    };

    $('#image_upload').on('hidden.bs.modal', function (e) {
        $('#upload_area').show();
        $('#upload_view').hide();
        $('#preview').html('');
    });
    $('#image_upload').on('hide.bs.modal', function (e) {
        $('#upload_area').show();
        $('#upload_view').hide();
        $('#preview').html('');
    });
});