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

// 绑定屏蔽User事件
$(document).on('click', '#block_user', function (event) {
    if (!event.currentTarget) {
        return;
    }
    var target = event.currentTarget;
    var action = target.dataset.block;
    var actionStr = $(target).html();
    $.ajax({
        type: "POST",
        url: "/user/" + target.dataset.loginname + "/block",
        data: {
            action: action
        }
    }).done(function (response) {
        console.log(response);
        var modal = $('#message_modal');
        var message = '失败';
        if (response.success) {
            message = '成功'+actionStr+'用户' + target.dataset.loginname;
            if (action == 'set_block') {
                $(target).html('解禁');
                $(target).attr('data-block', 'cancel_block');
            } else {
                $(target).html('禁言');
                $(target).attr('data-block', 'set_block');
            }
        }
        modal.find('#message').html(message);
        modal.modal('show');
    });
});

// 绑定设置User为达人事件
$(document).on('click', '#star_user', function (event) {
    if (!event.currentTarget) {
        return;
    }
    var target = event.currentTarget;
    var actionStr = $(target).html();
    $.ajax({
        type: "POST",
        url: "/user/" + target.dataset.loginname + "/star"
    }).done(function (response) {
        console.log(response);
        var modal = $('#message_modal');
        var message = '失败';
        if (response.success) {
            message = '成功设置用户'+target.dataset.loginname+'为' + actionStr;
            if (actionStr == '达人') {
                $(target).html('非达人');
            } else {
                $(target).html('达人');
            }
        }
        modal.find('#message').html(message);
        modal.modal('show');
    });
});

// 绑定刷新数据事件
$(document).on('click', '#refreshCount', function (event) {
    if (!event.currentTarget) {
        return;
    }
    var id = event.currentTarget.dataset.id;
    $.ajax({
        type: "POST",
        url: "/admin/users/refresh/count/" + id
    }).done(function (result) {
        if (!result.success) {
            return ;
        } else {
            $('#board_count_' + id).html(result.board_count);
            $('#topic_count_' + id).html(result.topic_count);
            $('#image_count_' + id).html(result.image_count);
        }
    });
});