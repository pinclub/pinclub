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
    var datas = event.currentTarget.dataset;
    auth(function(result) {
        if (!result) {
            return;
        }
        if (!datas.id) {
            return;
        }
        followBoard(datas.id);
    });
});

