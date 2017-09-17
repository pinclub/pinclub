function deletePic(picid) {
    if (!picid) {
        return;
    }
    var data = {
        id: picid
    };
    $.ajax({
        type: "DELETE",
        url: "/api/v2/images/delete",
        data: data
    }).done(function (response) {
        if(!response.success) {
            return console.error("Error：", response);
        }
        $('#'+picid + '').remove();
    }).error(function(res){
        if (res.status == 401) {
            $('#signin_modal').modal('show');
        }
    });
}

// 绑定删除按钮的点击事件
$(document).on('click', '.delete-btn', function (event) {
    if (!auth()) {
        return;
    }
    if (!event.currentTarget.dataset.id) {
        return;
    }
    deletePic (event.currentTarget.dataset.id);
});