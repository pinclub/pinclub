var boardList = [];
$(function () {
    $.ajax({
        type: "GET",
        url: "/api/v2/boards",
        data: {}
    }).done(function (responseText) {
        console.log(responseText);
        if (!responseText.success) {
            return ;
        }
        boardList = responseText.data;
        var boardListItems = $('.pin-create .right-part .boardlist .scrollable .recent');
        console.log(boardListItems);
        for(var j=0;j<boardListItems.length;j++){
            var boardListItem = boardListItems[j];
            boardList = responseText.data;
            showBoardList($(boardListItem), boardList);
        }

    });
    $('.pin-create .right-part .boardlist .scrollable .recent').on('click', '.item', function (event) {
        if (!event.currentTarget.dataset.id) {
            return;
        }
        selectBoard (event.currentTarget);
    });
});