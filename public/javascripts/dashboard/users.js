// 绑定修改User事件
$(document).on('click', '#modify_user', function (event) {
    if (!event.currentTarget) {
        return;
    }
    $.ajax({
        type: "GET",
        url: "/api/v1/user/" + event.currentTarget.dataset.loginname
    }).done(function (response) {
        console.log(response);
        var modal = $('#create_user_modal');
        modal.modal('show');
    });
});