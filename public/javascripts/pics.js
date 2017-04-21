var gridMasonry = $('.grid').masonry({
    // options...
    itemSelector: '.grid-item',
    columnWidth: '.grid-sizer',
    gutter: 15,
    percentPosition: true
});
var lastItemId=[];
function similarPics(picid) {
    let sid = lastItemId['all'];
    if (!picid) {
        return ;
    }

    if (!!lastItemId[picid]) {
        sid = lastItemId[picid]
    }
    var data = {
        id: picid,
        sid: sid
    };
    $.ajax({
        url: "api/v2/topics/sim",
        data: data
    }).done(function (responseText) {
        console.log(responseText);
        var items = gridMasonry.masonry('getItemElements');
        let rids = _.map(responseText.data, 'id');
        let aids = _.map(items, 'id');
        let needInsertItem = _.filter(responseText.data, function(o) { return _.includes(_.difference(rids, aids), o.id) });
        needInsertItem.forEach(function(item) {
            let itemHtml = $("#picBoxTmp").tmpl({item: item, highlight: true});
            lastItemId[picid] = item.id;
            let jpicelements = $(itemHtml);
            var items = gridMasonry.masonry('getItemElements');
            let clickIndex = 0;
            _.find(items, function(e){
                clickIndex++;
                return e.id == picid;
            });
            gridMasonry.append(jpicelements).masonry('insertItems', clickIndex, jpicelements);
        });
        gridMasonry.imagesLoaded().progress( function() {
            gridMasonry.masonry('layout');
        });
    });
}