// preview image modal
$('#preview_modal').on('hidden.bs.modal', function (e) {
    // 在预览框消失之后恢复 body 的滚动能力
    $('body').css('overflow-y', 'scroll');
    $('#preview_modal').css({    "z-index": "0", "top": "-100%"});
});
$('#preview_modal').on('shown.bs.modal', function (e) {
    // 修复上次滚动留下的痕迹,可能会导致短暂的闪烁，不过可以接受
    $('#preview_modal').scrollTop(0);
    $('#preview_modal').css({    "z-index": "1041", "top": "0", "padding": "40px"});
    $('body').css('overflow-y', 'hidden');
});

// 绑定Preview弹出层的右上角关闭按钮的点击事件
$(document).on('click', '#preview_modal .close-layer', function (event) {
    $('#preview_modal').modal('hide');
    $('#preview_modal .close-layer').css({"position": "none"});
});

// 绑定Preview点击后事件
$(document).on('click', '.preview_image_btn', function(event){
    var repinBtn = $('#preview_modal #preview_modal_rpin_btn');
    var likeBtn = $('#preview_modal #preview_modal_like_btn');
    var dataset = event.currentTarget.dataset;
    repinBtn.attr("data-id", dataset.id);
    repinBtn.attr("data-src", dataset.src);
    repinBtn.attr("data-name", dataset.name);
    likeBtn.attr("data-id", dataset.id);
    likeBtn.attr("data-src", dataset.src);
    likeBtn.attr("data-name", dataset.name);
    $('#preview_modal').modal('hide');

    $('#get-preview-image-desc').val('');
    $('#baidu_image_holder').html('<img src="'+event.currentTarget.dataset.src+'">');
    $('#preview_modal #zoomBtn').attr('href', event.currentTarget.dataset.src);
    $('#preview_modal').modal('show');
    $.ajax({
        url: "/api/v2/images/"+dataset.id
    }).done(function (response) {
        var result = response.data;
        var boardImages = result.board.images;
        var profileSourceHtml = $("#profileSourceTemplate").tmpl(result);
        var itemHtml = $("#boardInfoTemplate").tmpl(result);
        // set the board title to global title
        var sitename = $('title').html();
        if (sitename.indexOf(' - ') > 0) {
            sitename = sitename.split(' - ')[1];
        }
        $('title').html(result.board.title + ' - ' + sitename);
        // Board 部分内容
        $('#preview_modal .side-part .board-piece').html(itemHtml);
        $('#preview_modal .close-layer').css({"position": "fixed"});
        // 显示Get和like数量
        $('#preview_modal .repin-btn .num').html(result.geted_count);
        $('#preview_modal .like-btn .num').html(result.like_count);

        // Profile_source
        $('#preview_modal .tool-bar-bottom .right-part').html(profileSourceHtml);

        var imageInfoHtml = $("#imageInfoTemplate").tmpl(result);
        $('#preview_modal .main-part .info-piece').html(imageInfoHtml);

        if (result.liked) {
            likeBtn.addClass('unlike');
        } else {
            likeBtn.removeClass('unlike');
        }

        var gridBoardImagesMasonry = $('.board_grid').masonry({
            // options...
            itemSelector: '.item',
            columnWidth: 86,
            gutter: 2
        });
        boardImages.forEach(function(image) {
            if (dataset.id == image.id || dataset.id == image._id) {
                image.selected = true;
            }

            var itemHtml = $("#boardImageTemplate").tmpl(image);
            var jpicelements = $(itemHtml);
            gridBoardImagesMasonry.append(jpicelements)
                .masonry('appended', jpicelements);
        });
        gridBoardImagesMasonry.imagesLoaded().progress(function () {
            gridBoardImagesMasonry.masonry('layout');
        });
    });
});

// 点击 Get 图片到自己的 Board, 弹出 Modal 层
$(document).on('click', '#preview_modal_rpin_btn', function (event) {
    var datas = event.currentTarget.dataset;
    auth(function(result) {
        if (!result) {
            return;
        }
        if (!datas.id || !datas.src) {
            return;
        }
        getImageObject.topic_id = datas.id;
        $('#get-preview-image-desc').val('');
        $('#get-preview-image').html('<img src="' + datas.src + '">');
        $('#get_image_modal').modal('show');
    });
});