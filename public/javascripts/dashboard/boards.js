// 绑定修改User事件
$(document).on('click', '#modify_board', function (event) {
    if (!event.currentTarget) {
        return;
    }
    var data = event.currentTarget;
    var modal = $('#modify_board_modal');
    modal.find('form').prop('action', '/admin/boards/'+data.dataset.id+'/edit');
    modal.find('input[name=title]').val(data.dataset.title);
    if (data.dataset.type == 'private') {
        modal.find('input[name=type][value="private"]').prop("checked", true);
    } else {
        modal.find('input[name=type][value="public"]').prop("checked", true);
    }
    modal.modal('show');
});

// 绑定删除Board事件
$(document).on('click', '#delete_board', function (event) {
    if (!event.currentTarget) {
        return;
    }
    var data = event.currentTarget;
    var id = data.dataset.id;
    if (!id) {
        return;
    }

    $.ajax({
        type: "DELETE",
        url: "/api/v2/boards/" + data.dataset.id
    }).done(function (response) {
        if(!response.success) {
            return console.error("Error：", response);
        }
        window.location.href="/admin/boards";
    });
});
