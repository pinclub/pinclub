function changeExamplePathName (obj) {
    if (!!obj && !!obj.value) {
        $('#example_path_name').html(obj.value);
    }
    return;
}

// 绑定修改Forum事件
$(document).on('click', '#modify_forum', function (event) {
    if (!event.currentTarget) {
        return;
    }
    $.ajax({
        type: "GET",
        url: "/admin/forums/" + event.currentTarget.dataset.id
    }).done(function (response) {
        console.log(response);
        var data = response.data;
        var modal = $('#create_forum_modal');
        modal.find('input[name=id]').val(data._id);
        modal.find('input[name=title]').val(data.title);
        modal.find('input[name=path_name]').val(data.path_name);
        modal.find('#example_path_name').html(data.path_name);
        modal.find('textarea[name=content]').val(data.content);
        modal.find('input[name=order]').val(data.order);
        modal.find('input[name=type][value="'+data.type+'"]').attr("checked", true);
        modal.find('textarea[name=css_text]').val(data.css_text);
        modal.find('textarea[name=js_text]').val(data.js_text);
        if (!!data.managers && data.managers.length > 0) {
            _.forEach(data.managers, function(manager){
                modal.find('select[name=managers]').append('<option value="'+manager._id+'" selected="selected">'+manager.loginname+'</option>');
            });
        }
        if (!!data.members && data.members.length > 0) {
            _.forEach(data.members, function(member){
                modal.find('select[name=members]').append('<option value="'+member._id+'" selected="selected">'+member.loginname+'</option>');
            });
        }
        modal.modal('show');
    });
});

$('#create_forum_modal').on('hidden.bs.modal', function (e) {
    var modal = $(this);
    modal.find('input[name=id]').val('');
    modal.find('input[name=title]').val('');
    modal.find('input[name=path_name]').val('');
    modal.find('#example_path_name').html('{path_name}');
    modal.find('textarea[name=content]').val('');
    modal.find('input[name=order]').val(0);
    modal.find('input[name=type][value="internal"]').attr("checked", false);
    modal.find('input[name=type][value="private"]').attr("checked", false);
    modal.find('input[name=type][value="public"]').attr("checked",true);
    modal.find('textarea[name=css_text]').val('');
    modal.find('textarea[name=js_text]').val('');
    modal.find('select[name=managers]').empty();
    modal.find('select[name=members]').empty();
});

$.fn.select2.defaults.set( "theme", "bootstrap" );

function formatRepo (repo) {
    if (repo.loading) return repo.text;
    var markup = "<div class='select2-result-repository clearfix'>" +
        "<div class='select2-result-repository__avatar'><img src='" + repo.avatar + "' /></div>" +
        "<div class='select2-result-repository__meta'>" +
        "<div class='select2-result-repository__title'>" + repo.loginname + "</div>";

    if (repo.email) {
        markup += "<div class='select2-result-repository__description'>" + repo.email + "</div>";
    }

    markup += "<div class='select2-result-repository__statistics'>" +
        "<div class='select2-result-repository__forks'><i class='fa fa-flash'></i> " + repo.topic_count + " 主题</div>" +
        "<div class='select2-result-repository__stargazers'><i class='fa fa-star'></i> " + repo.image_count + " 图片</div>" +
        "<div class='select2-result-repository__watchers'><i class='fa fa-eye'></i> " + repo.score + " 积分</div>" +
        "</div>" +
        "</div></div>";

    return markup;
}

function formatRepoSelection (repo, container) {
    return repo.loginname || repo.text;
}

$(".js-data-example-ajax").select2({
    ajax: {
        url: "/api/v1/users",
        dataType: 'json',
        delay: 250,
        data: function (params) {
            return {
                q: params.term,
                page: params.page
            };
        },
        processResults: function (result, params) {
            if (!result.success) {
                return ;
            } else {
                var select2Data = $.map(result.data, function (obj) {
                    obj.id = obj._id;
                    obj.text = obj.loginname;

                    return obj;
                });
                return {
                    results: select2Data,
                    pagination: {
                        more: (params.page * 30) < result.data.length
                    }
                };
            }
        },
        cache: true
    },
    width : null,
    escapeMarkup: function (markup) { return markup; }, // let our custom formatter work
    minimumInputLength: 1,
    dropdownAutoWidth: true,
    containerCssClass: ':all:',
    templateResult: formatRepo, // omitted for brevity, see the source of this page
    templateSelection: formatRepoSelection // omitted for brevity, see the source of this page
});

