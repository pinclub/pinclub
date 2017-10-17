// 绑定like按钮的点击事件
$(document).on('click', '.like-btn', function (event) {
    var datas = event.currentTarget.dataset;
    auth(function(result) {
        if (!result) {
            return;
        }
        if (!datas.id) {
            return;
        }
        likePic(datas.id);
    });
});

function likePic(picid) {
    if (!picid) {
        return;
    }
    var data = {
        id: picid
    };
    $.ajax({
        type: "POST",
        url: "/api/v2/images/like",
        data: data
    }).done(function (response) {
        if(!response.success) {

            return console.error("Error：", response);
        }
        var likeA = $('#'+picid + ' .actions .right a');
        if (likeA.hasClass('unlike')) {
            $('#'+picid + ' .actions .right a').removeClass('unlike');
        } else {
            $('#'+picid + ' .actions .right a').addClass('unlike');
        }
        var likePreviewBtn = $('#preview_modal #preview_modal_like_btn');
        if (likePreviewBtn.hasClass('unlike')) {
            likePreviewBtn.removeClass('unlike');
        } else {
            likePreviewBtn.addClass('unlike');
        }
    }).error(function(res){
        if (res.status == 401) {
            $('#signin_modal').modal('show');
        }
    });
}