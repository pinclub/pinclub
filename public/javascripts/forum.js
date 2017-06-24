function loadUserTopicList (forum, author) {
    var params = '';
    if (!!forum) {
        params += '&forum=' + forum;
    }
    if (!!author) {
        params += '&author=' + author;
    }
    $.ajax({
        url: "/api/v2/topics?" + params
    }).done(function (responseText) {
        var elements = [];
        if (responseText.data.length === 0) {
            elements.push('<div class="cell">No topics</div>');
        } else {
            responseText.data.forEach(function (item) {
                elements.push($("#topicListTmp").tmpl({topic: item, avator: false}));
            });
        }
        $('#topic_list').append(elements);

    });
}