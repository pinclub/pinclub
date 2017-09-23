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

function loadTopicList (page, forum, title, selfrefresh) {
    var params = 'show_type=index';
    if (!page) {
        page = 1;
    }
    if (!selfrefresh) {
        selfrefresh = false;
    }
    params += '&page=' + page;
    if (!!forum) {
        params += '&forum=' + forum;
        if (typeof (topic_forum) != 'undefined') {
            topic_forum = forum;
        }
    }
    title = title || '';
    $.ajax({
        url: "/api/v2/topics?" + params
    }).done(function (responseText) {
        var itemLength = 0;
        if (!!responseText.data && _.isArray(responseText.data)) {
            itemLength = _.size(responseText.data);
        }
        var elements = [];
        responseText.data.forEach(function (item) {
            if (!!item.author && !!item.author.avatar_url) {
                item.author.avatar_url = avatarPath(item.author.avatar_url, 54);
            }
            elements.push($("#topicListTmp").tmpl({topic: item, avator: true}));
        });
        $('#topic_list').append(elements);
        $('#total_count').html('<span style="color: #333;">' + title + '</span> 共 ' + responseText.total_count + ' 个话题');
        $('#child_forums').html('');
        if (!!responseText.child_forums && responseText.child_forums.length > 0) {
            _.forEach(responseText.child_forums, function(child){
                var sr = '';
                if (selfrefresh) {
                    sr = ' onclick="return false;"';
                }
                $('#child_forums').append('&nbsp;&nbsp;•&nbsp;<a href="/forums/' + child._id+ '" '+ sr +' class="topic-tab" style="color: #778087;" data-id="' + child._id+ '" data-title="'+child.title+'">' + child.title + '</a>');
            });
        }
        if (itemLength >= 10) {
            $(window).lazyLoadXT();
            $('#page-marker').lazyLoadXT({visibleOnly: false, checkDuplicates: false});
        } else {
            $('#no_more_topic').show();
        }
        if (typeof (topic_page) != 'undefined') {
            topic_page++;
        }
    });
}