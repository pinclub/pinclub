/**
 * TODO 考虑使用 alasql 或者 localForage 存储客户端的访问信息, 不知道可不可行
 * 存储最后一个每个相似图片请求的最后一个返回id的边界,总的key为 all, 其他的key为id
 * [{all:'object id'},{ 'request object id': 'response object id'}]
  */
var lastItemId = [];

var getImageObject = {};

var gridMasonry = $('.grid').masonry({
    // options...
    itemSelector: '.grid-item',
    columnWidth: '.grid-sizer',
    percentPosition: true
});

// Grid layout
$(".grid-item .actions .right a").click(function (e) {
    console.log('e: ', e);
});

// Lazyload
var topic_page = 1;
var pic_page = 1;
var topic_forum = '';
var forum_title = '全部';
$('#page-marker').on('lazyshow', function () {
    loadTopicList(topic_page, topic_forum, forum_title, true);
}).lazyLoadXT({visibleOnly: false, checkDuplicates: true});

$('#pic-page-marker').on('lazyshow', function () {
    // $.ajax({
    //     url: "/api/v2/images?type=image&limit=5&page=" + pic_page
    // }).done(function (responseText) {
    //     var itemLength = responseText.data.length;
    //     responseText.data.forEach(function (item) {
    //         var itemHtml = $("#picBoxTmp").tmpl({item: item});
    //         lastItemId['all'] = item.id;
    //         var jpicelements = $(itemHtml);
    //         gridMasonry.append(jpicelements)
    //             .masonry('appended', jpicelements);
    //     });
    //     gridMasonry.imagesLoaded().progress(function () {
    //         gridMasonry.masonry('layout');
    //     });
    //     if (itemLength >= 5) {
    //         gridMasonry.masonry('layout');
    //         $(window).lazyLoadXT();
    //         $('#pic-page-marker').lazyLoadXT({visibleOnly: false, checkDuplicates: false});
    //     } else {
    //         gridMasonry.masonry('layout');
    //         $("#pic-page-marker").remove();
    //     }
    //     // $("#content_text").trigger("sticky_kit:recalc");
    //     $("#content_pic").parent().getNiceScroll().resize();
    //     pic_page++;
    // });
    loadPicList(pic_page++);
}).lazyLoadXT({visibleOnly: true, checkDuplicates: false});

// TODO 考虑是否使用 http://www.dropzonejs.com/ 上传插件修改上传代码, 支持拖拽上传


// 绑定首页板块连接的点击事件
$(document).on('click', '.topic-tab', function (event) {
    topic_page = 1;
    var title;
    if (!!event.currentTarget.dataset.id) {
        topic_forum = event.currentTarget.dataset.id;
    }
    if (!!event.currentTarget.dataset.title) {
        title = event.currentTarget.dataset.title;
    }
    $('#topic_list').html('');
    $('#content_text .topic-tab').removeClass('current-tab');
    $(this).addClass('current-tab');
    forum_title = title;
    loadTopicList(topic_page, topic_forum, title, true);
});

// 绑定更多相似图片按钮点击事件
$(document).on('click', '.more-similar-btn', function (event) {
    if (!event.currentTarget.dataset.id) {
        return;
    }
    similarPics(event.currentTarget.dataset.id);
});

// chrome插件的弹出页面，进行Get图片操作
$(document).on('click', '#get-image-chrome-submit', function (event) {
    console.log(event.currentTarget.dataset);
    $('#get-image-chrome-submit').button('loading');
    var getImageChromeObj = {};
    getImageChromeObj.desc = $('#get-image-desc').val();
    getImageChromeObj.media = event.currentTarget.dataset.src;
    getImageChromeObj.profile_source = event.currentTarget.dataset.url;
    getImageChromeObj.board_id = $('.right-part .boardlist .selected').attr("data-id");
    $.ajax({
        type: "POST",
        url: "/image/create/bookmarklet",
        data: getImageChromeObj
    }).done(function (response) {
        console.info(response);
        if (!response.success) {
            $('#get_image_chrome_error_modal').modal('show');
            return;
        }
        window.close();
    }).error(function(res){
        console.error(res);
        $('#get_image_chrome_error_modal').modal('show');
    });
});

//
//// 绑定Board 查询事件
//$(document).on('keyup', '.pin-create .right-part .search-input', function (event) {
//    if (!event.currentTarget) {
//        return;
//    }
//    // TODO 根据输入的关键词模糊查询Board列表,并刷新 boardlist 的显示列表
//    searchBoard ($(this), event.currentTarget.value);
//});
//
//// 绑定添加Board按钮
//$(document).on('click', '.pin-create .right-part .createboard', function (event) {
//    if (!event.currentTarget) {
//        return;
//    }
//    $(this).parent().prev().prev().css({"height":"220px"});
//    $(this).hide();
//    createBoard (event.currentTarget.dataset.text);
//});

// 绑定预览图片的查看
//$(document).on('click', '#pic_list .preview-image', function (event) {
//    console.log(event.currentTarget.dataset.id);
//    console.log(event.currentTarget.dataset.src);
//    $('#get-preview-image-desc').val('');
//    $('#baidu_image_holder').html('<img src="'+event.currentTarget.dataset.src+'">');
//});

function similarPics(picid) {
    var sid = lastItemId['all'];
    if (!picid) {
        return;
    }

    if (!!lastItemId[picid]) {
        sid = lastItemId[picid];
    }
    var data = {
        id: picid,
        sid: sid
    };
    $.ajax({
        url: "/api/v2/images/sim",
        data: data
    }).done(function (responseText) {
        console.log(responseText);
        var items = gridMasonry.masonry('getItemElements');
        var rids = _.map(responseText.data, 'id');
        var aids = _.map(items, 'id');
        var needInsertItem = _.filter(responseText.data, function (o) {
            return _.includes(_.difference(rids, aids), o.id)
        });
        needInsertItem.forEach(function (item) {
            var itemHtml = $("#picBoxTmp").tmpl({item: item, highlight: true});
            lastItemId[picid] = item.id;
            var jpicelements = $(itemHtml);
            var items = gridMasonry.masonry('getItemElements');
            var clickIndex = 0;
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

function loadPicList(page) {
    $.ajax({
        url: "/api/v2/images?type=image&limit=5&page=" + page
    }).done(function (responseText) {
        var itemLength = responseText.data.length;
        responseText.data.forEach(function (item) {
            var itemHtml = $("#picBoxTmp").tmpl({item: item});
            lastItemId['all'] = item.id;
            var jpicelements = $(itemHtml);
            gridMasonry.append(jpicelements)
                .masonry('appended', jpicelements);
        });
        gridMasonry.imagesLoaded().progress(function () {
            gridMasonry.masonry('layout');
        });
        if (itemLength >= 5) {
            gridMasonry.masonry('layout');
            $('#pic-page-marker').lazyLoadXT({visibleOnly: false, checkDuplicates: false});
        } else {
            gridMasonry.masonry('layout');
            $("#pic-page-marker").remove();
        }
        $("#content_text").trigger("sticky_kit:recalc");
        // $("#content_pic").parent().getNiceScroll().resize();
    });
}
