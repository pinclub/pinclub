function loadUserTopicList (forum, author, title) {
    var params = '';
    if (!!forum) {
        params += '&forum=' + forum;
    }
    if (!!author) {
        params += '&author=' + author;
    }
    title = title || '';
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
        $('#total_count').html('<span style="color: #333;">' + title + '</span> 共 ' + responseText.total_count + ' 个话题');
        $('#child_forums').html('');
        if (!!responseText.child_forums && responseText.child_forums.length > 0) {
            _.forEach(responseText.child_forums, function(child){
                $('#child_forums').append('&nbsp;&nbsp;•&nbsp;<a href="#" onclick="return false;" class="topic-tab" style="color: #778087;" data-id="' + child._id+ '" data-author="'+author+'" data-title="'+child.title+'">' + child.title + '</a>');
            });
        }
    });
}