function changeExamplePathName (obj) {
    if (!!obj && !!obj.value) {
        $('#example_path_name').html(obj.value);
    }
    return;
}

// 绑定修改Node事件
$(document).on('click', '#modify_node', function (event) {
    if (!event.currentTarget) {
        return;
    }
    $.ajax({
        type: "GET",
        url: "/admin/nodes/" + event.currentTarget.dataset.id
    }).done(function (response) {
        console.log(response);
        var data = response.data;
        var modal = $('#create_node_modal');
        modal.find('input[name=id]').val(data._id);
        modal.find('input[name=name]').val(data.name);
        modal.find('input[name=code]').val(data.code);
        modal.find('#example_path_name').html(data.code);
        modal.find('textarea[name=content]').val(data.content);
        if (!!data.parent) {
            modal.find('select[name=parent]').append('<option value="'+data.parent._id+'" selected="selected">'+data.parent.name+'</option>');
        }
        modal.modal('show');
    });
});

$('#create_node_modal').on('hidden.bs.modal', function (e) {
    var modal = $(this);
    modal.find('input[name=id]').val('');
    modal.find('input[name=name]').val('');
    modal.find('input[name=code]').val('');
    modal.find('#example_path_name').html('{code}');
    modal.find('textarea[name=content]').val('');
    modal.find('select[name=parent]').empty();
});

$.fn.select2.defaults.set( "theme", "bootstrap" );

function formatRepo (repo) {
    if (repo.loading) return repo.text;
    var markup = "<div class='select2-result-repository clearfix'>" +
        "<div class='select2-result-repository__meta'>" +
        "<div class='select2-result-repository__title'>" + repo.name + "</div>";

    if (repo.email) {
        markup += "<div class='select2-result-repository__description'>" + repo.code + "</div>";
    }

    markup += "</div></div>";

    return markup;
}

function formatRepoSelection (repo, container) {
    return repo.name || repo.text;
}

$(".js-data-example-ajax").select2({
    ajax: {
        url: "/api/v2/nodes",
        dataType: 'json',
        delay: 250,
        data: function (params) {
            return {
                q: params.term
            };
        },
        processResults: function (result, params) {
            if (!result.success) {
                return ;
            } else {
                var select2Data = $.map(result.data, function (obj) {
                    obj.id = obj._id;
                    obj.text = obj.name;

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