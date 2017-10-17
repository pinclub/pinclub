function deletePic(picid) {
    if (!picid) {
        return;
    }
    var data = {
        id: picid
    };
    $.ajax({
        type: "DELETE",
        url: "/api/v2/images/" + picid
    }).done(function (response) {
        if(!response.success) {
            return console.error("Error：", response);
        }
        $('#'+picid + '').remove();
        gridMasonry.imagesLoaded().progress(function () {
            gridMasonry.masonry('layout');
        });
    }).error(function(res){
        if (res.status == 401) {
            $('#signin_modal').modal('show');
        }
    });
}

// 绑定删除按钮的点击事件
$(document).on('click', '.delete-btn', function (event) {
    var datas = event.currentTarget.dataset;
    auth(function(result) {
        if (!result) {
            return;
        }
        if (!datas.id) {
            return;
        }
        deletePic(datas.id);
    });
});