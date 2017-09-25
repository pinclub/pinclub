// 绑定修改Forum事件
$(document).on('click', '#deleteAllImages', function (event) {
    if (!event.currentTarget) {
        return;
    }
    $.ajax({
        type: "GET",
        url: "/admin/dashboard/deleteAllImages"
    }).done(function (response) {
        if (response.success) {
            $('#deleteAllImageResult').html('删除 ' + response.count + ' 条');
        } else {
            $('#deleteAllImageResult').html('删除失败');
        }
    });
});