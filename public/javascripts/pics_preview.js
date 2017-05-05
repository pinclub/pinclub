
// preview image modal
$('#preview_modal').on('hidden.bs.modal', function (e) {
    // 在预览框消失之后恢复 body 的滚动能力
    $('body').css('overflow-y', 'scroll');
    $('#preview_modal').css({    "z-index": "0", "top": "-100%"});
});
$('#preview_modal').on('shown.bs.modal', function (e) {
    // 修复上次滚动留下的痕迹,可能会导致短暂的闪烁，不过可以接受
    // TODO: to be promote
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
    console.log(event.currentTarget.dataset);
    var repinBtn = $('#preview_modal #preview_modal_rpin_btn');
    var dataset = event.currentTarget.dataset;
    repinBtn.attr("data-id", dataset.id);
    repinBtn.attr("data-src", dataset.src);
    repinBtn.attr("data-name", dataset.name);
    $('#preview_modal').modal('show');
    $('body .modal-backdrop').css({"background-color": "#eee"});
    $.ajax({
        url: "api/v2/images/"+dataset.id
    }).done(function (response) {
        console.log(response);
        var itemHtml = $("#boardInfoTemplate").tmpl(response.data);
        $('#preview_modal .side-part .board-piece').html(itemHtml);
        $('#preview_modal .close-layer').css({"position": "fixed"});
    });
});

// 点击 Get 图片到自己的 Board, 弹出 Modal 层
$(document).on('click', '#preview_modal .get-pic-btn', function (event) {
    if (!event.currentTarget.dataset.id || !event.currentTarget.dataset.src) {
        return;
    }
    console.log(event.currentTarget.dataset.id);
    console.log(event.currentTarget.dataset.src);
    getImageObject.topic_id = event.currentTarget.dataset.id;
    $('#get-preview-image-desc').val('');
    $('#get-preview-image').html('<img src="'+event.currentTarget.dataset.src+'">');
    $('#get_image_modal').modal('show');

});