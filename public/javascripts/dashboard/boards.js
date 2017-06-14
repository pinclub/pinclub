// 绑定修改User事件
$(document).on('click', '#modify_board', function (event) {
    if (!event.currentTarget) {
        return;
    }
    $.ajax({
        type: "GET",
        url: "/api/v2/boards/" + event.currentTarget.dataset.id
    }).done(function (response) {
        console.log(response);
        var modal = $('#create_board_modal');
        modal.modal('show');
    });
});