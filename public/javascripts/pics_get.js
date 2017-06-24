// import this file need
var getImageObject = {};
// 点击 Get 图片到自己的 Board, 弹出 Modal 层
$(document).on('click', '#pic_list .get-pic-btn', function (event) {
    if (!auth()) {
        return;
    }
    if (!event.currentTarget.dataset.id || !event.currentTarget.dataset.src) {
        return;
    }
    console.log(event.currentTarget.dataset.id);
    console.log(event.currentTarget.dataset.src);
    getImageObject.topic_id = event.currentTarget.dataset.id;
    $('#get-preview-image-desc').val('');
    $('#get-preview-image').html('<img src="'+event.currentTarget.dataset.src+'">');
    $('#get-image-submit').attr('data-id', event.currentTarget.dataset.id);
    $('#get-image-submit').attr('data-image', event.currentTarget.dataset.src);
    $('#get_image_modal').modal('show');
});

// 保存要Get的图片信息
// will insert got pic when element has insertGot class
$(document).on('click', '#get-image-submit', function (event) {
    if (!auth()) {
        return;
    }
    console.log(event.currentTarget.dataset);
    getImageObject.desc = $('#get-preview-image-desc').val();
    getImageObject.image_fixed = event.currentTarget.dataset.image;
    console.log('getImageObject:', getImageObject);
    var insertGot = event.currentTarget.classList.contains('insertGot');
    $.ajax({
        type: "POST",
        url: "/api/v2/images/get",
        data: getImageObject
    }).done(function (response) {
        console.log(response);
        if (response.success) {
            // DONE (hhdem) get的图片，免刷新直接插入图片列表中
            if (insertGot && gridMasonry) {
                var itemHtml = $("#picBoxTmp").tmpl({item: response.data, highlight: true});
                var jpicelements = $(itemHtml);
                gridMasonry.append(jpicelements).masonry('insertItems', 1, jpicelements);
                gridMasonry.imagesLoaded().progress(function () {
                    gridMasonry.masonry('layout');
                });
            }
            $('#got_success_image_modal .modal-body').html('图片已经成功获取到<a href="/boards/'+getImageObject.board_id+'">' + getImageObject.board_title + '</a>');
            $('#got_success_image_modal').modal('show');
            $('#get_image_modal').modal('hide');
        }
    }).error(function(res){
        if (res.status == 401) {
            $('#get_image_modal').modal('hide');
            $('#signin_modal').modal('show');
        }
    });
});