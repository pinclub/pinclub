
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
            $('#get_image_chrome_message_modal .modal-body').html('Get 图片时出错了, OMG......, 再试一次');
            return;
        } else {
            $('#get_image_chrome_message_modal .modal-body').html('Get 图片成功');
        }
        $('#get_image_chrome_message_modal').modal('show');
    }).error(function(res){
        console.error(res);
        $('#get_image_chrome_message_modal .modal-body').html('Get 图片时出错了, OMG......, 再试一次');
        $('#get_image_chrome_message_modal').modal('show');
    });
});

$('#get_image_chrome_message_modal').on('hidden.bs.modal', function (e) {
    window.close();
});
$('#get_image_chrome_message_modal').on('hide.bs.modal', function (e) {
    window.close();
});