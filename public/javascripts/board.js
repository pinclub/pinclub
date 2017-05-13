
// 绑定Board 查询事件
$(document).on('keyup', '.pin-create .right-part .search-input', function (event) {
    if (!event.currentTarget) {
        return;
    }
    // TODO 根据输入的关键词模糊查询Board列表,并刷新 boardlist 的显示列表
    searchBoard ($(this), event.currentTarget.value);
});

// 绑定添加Board按钮
$(document).on('click', '.pin-create .right-part .createboard', function (event) {
    if (!event.currentTarget) {
        return;
    }
    $(this).parent().prev().prev().css({"height":"220px"});
    $(this).hide();
    createBoard (event.currentTarget.dataset.text);
});


function selectBoard (selectedElem) {
    var boardid = selectedElem.dataset.id;
    if (!boardid) {
        return;
    }
    var selectedBoard = $(selectedElem);

    var boardE = selectedBoard.parent().children('#'+boardid);
    var selectedE = selectedBoard.parent().children('.selected');
    if ("undefined" != typeof getImageObject) {
        getImageObject.board_id = boardid;
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

