function followBoard(boardid) {
    if (!boardid) {
        return;
    }
    var data = {
        id: boardid
    };
    $.ajax({
        type: "POST",
        url: "/board/collect",
        data: data
    }).done(function (response) {
        if(!response.success) {
            return console.error("Error：", response);
        }
        var likeA = $('button.follow-board');
        if (likeA.hasClass('rbtn')) {
            likeA.removeClass('rbtn');
        } else {
            likeA.addClass('rbtn');
        }
    }).error(function(res){
        if (res.status == 401) {
            $('#signin_modal').modal('show');
        }
    });
}

// 关注 Board
$(document).on('click', 'button.follow-board', function (event) {
    console.info('follow board');
    if (!auth()) {
        return;
    }
    if (!event.currentTarget.dataset.id) {
        return;
    }
    console.log(event.currentTarget.dataset.id);
    followBoard (event.currentTarget.dataset.id);
});

