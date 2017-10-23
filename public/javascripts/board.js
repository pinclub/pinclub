
// 绑定Board 查询事件
$('.pin-create .right-part .search-input').unbind("keyup").on('keyup', function (event) {

    if (!event.currentTarget) {
        return;
    }
    // TODO 根据输入的关键词模糊查询Board列表,并刷新 boardlist 的显示列表
    searchBoard ($(this), event.currentTarget.value);
});

// 绑定添加Board按钮
$('.pin-create .right-part #createboard').unbind("click").on('click', function (event) {
    var datas = event.currentTarget.dataset;
    auth(function(result){
        if (!result) {
            return;
        }
        if (!event.currentTarget) {
            return;
        }
        $(this).parent().prev().prev().css({"height":"220px"});
        $(this).hide();
        // console.info(event.currentTarget);
        createBoard (datas.text);

    });
});

// 绑定修改Board事件
$('.modify_board').unbind("click").on('click', function (event) {
    var datas = event.currentTarget.dataset;
    auth(function(result){
        if (!result) {
            return;
        }
        if (!datas) {
            return;
        }
        var modal = $('#modify_board_modal');
        modal.find('form').prop('action', '/boards/'+datas.id+'/edit');
        modal.find('input[name=title]').val(datas.title);
        if (datas.type == 'private') {
            modal.find('input[name=type][value="private"]').prop("checked", true);
        } else {
            modal.find('input[name=type][value="public"]').prop("checked", true);
        }
        modal.modal('show');
    });
});

// 绑定新建Board事件
$('.add-board').unbind("click").on('click', function (event) {
    var datas = event.currentTarget.dataset;
    auth(function(result){
        if (!result) {
            return;
        }
        if (!datas) {
            return;
        }
        var modal = $('#modify_board_modal');
        modal.find('form').prop('action', '/boards');
        modal.modal('show');
    });
});

// 绑定修改Board事件
$('.delete_board').unbind("click").on('click', function (event) {
    var datas = event.currentTarget.dataset;
    auth(function(result){
        if (!result) {
            return;
        }
        if (!datas) {
            return;
        }
        var modal = $('#delete_board_modal');
        modal.find('form').prop('action', '/boards/'+datas.id+'/delete');
        modal.find('.board-name').html(datas.title);
        modal.modal('show');
    });
});

function selectBoard (selectedElem) {
    var boardid = selectedElem.dataset.id;
    if (!boardid) {
        return;
    }
    var boardtitle = selectedElem.dataset.title;
    var selectedBoard = $(selectedElem);

    var boardE = selectedBoard.parent().children('#'+boardid);
    var selectedE = selectedBoard.parent().children('.selected');
    if ("undefined" != typeof getImageObject) {
        getImageObject.board_id = boardid;
        getImageObject.board_title = boardtitle;
    }
    if (!boardE.hasClass('selected')) {
        selectedE.removeClass('selected');
        boardE.addClass('selected');
    }
}

function searchBoard (obj, searchText) {
    if (!obj) {
        return;
    }
    var refreshListTarget = obj.next().next();
    var createTextTarget = obj.next().next().next().next();
    if (searchText) {
        refreshListTarget.css({"height":"180px"});
        createTextTarget.find('.createboard').show();
        createTextTarget.find('.createboard').attr("data-text", searchText);
        createTextTarget.find('.text').html(searchText);
    } else {
        refreshListTarget.css({"height":"220px"});
        createTextTarget.find('.createboard').hide();
        createTextTarget.find('.text').html('');
    }

}

function createBoard (boardName) {
    if (!boardName) {
        return;
    }
    var boardItem = {
        title: boardName
    };
    $.ajax({
        type: "POST",
        url: "/api/v2/boards",
        data: {
            title: boardName
        }
    }).done(function (responseText) {
        if (!responseText.success) {
            return ;
        }
        boardItem._id = responseText.board;
        boardItem.title = responseText.title;
        boardList.splice(0, 0, boardItem);
        showBoardList($('.pin-create .right-part .boardlist .scrollable .recent'), boardList);
    });
}

function showBoardList (target, boards) {
    if (!target || !boards) {
        return;
    }
    target.html('');
    var markup = '{{each boards}}<div class="item {{if $index == 0}}selected{{/if}}" data-id="${boards[$index]._id}" id="${boards[$index]._id}" data-title="${boards[$index].title}">' +
        '<i class="icon history"></i>${boards[$index].title}<div class="controller"></div>' +
        '</div>{{/each}}';
    if (boards.length) {
        if ("undefined" != typeof getImageObject) {
            getImageObject.board_id = boards[0]._id;
            getImageObject.board_title = boards[0].title;
        }
    } else {
        $('#board_message_alert .alert-content').html('创建一个 Board 吧!');
        $('#board_message_alert').fadeIn();
    }
    $("#boardTemplate").tmpl({boards: boards}).appendTo(target);

    //$.template( "boardTemplate", markup );
    //$.tmpl( "boardTemplate", {boards: boards} )
    //    .appendTo(target);
}

