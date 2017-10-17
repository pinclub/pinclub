var insertImageBoardAfterGet = true;
// import this file need
var getImageObject = {};
// 点击 Get 图片到自己的 Board, 弹出 Modal 层
$(document).on('click', '#pic_list .get-pic-btn', function (event) {
    var datas = event.currentTarget.dataset;
    auth(function(result){
        if (!result) {
            return;
        }
        if (!datas.id || !datas.src) {
            return;
        }
        getImageObject.topic_id = datas.id;
        $('#get-preview-image-desc').val('');
        $('#get-preview-image').html('<img src="'+datas.src+'">');
        $('#get-image-submit').attr('data-id', datas.id);
        $('#get-image-submit').attr('data-image', datas.src);
        $('#get_image_modal').modal('show');
    });

});

// 保存要Get的图片信息
// will insert got pic when element has insertGot class
$(document).on('click', '#get-image-submit', function (event) {
    var datas = event.currentTarget.dataset;
    auth(function(result){
        if (!result) {
            return;
        }
        getImageObject.desc = $('#get-preview-image-desc').val();
        getImageObject.image_fixed = datas.image;
        $.ajax({
            type: "POST",
            url: "/api/v2/images/get",
            data: getImageObject
        }).done(function (response) {
            console.log(response);
            if (response.success) {
                // DONE (hhdem) get的图片，免刷新直接插入图片列表中
                if (insertImageBoardAfterGet && gridMasonry) {
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

});

function isInsertImageBoardAfterGet (isInsert) {
    insertImageBoardAfterGet = isInsert;
}