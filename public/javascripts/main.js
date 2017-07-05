$(document).ready(function () {
    var windowHeight = $(window).height();
    var $backtotop = $('#backtotop');
    var top = windowHeight - $backtotop.height() - 200;


    function moveBacktotop() {
        $backtotop.css({top: top, right: 0});
    }

    function footerFixBottom() {
        if ($(document.body).height() < windowHeight) {
            $("#footer").addClass('fix-bottom');
        } else {
            $("#footer").removeClass('fix-bottom');
        }
    }

    $backtotop.click(function () {
        $('html,body').animate({scrollTop: 0});
        return false;
    });
    $(window).scroll(function () {
        var windowHeight = $(window).scrollTop();
        if (windowHeight > 200) {
            $backtotop.fadeIn();
        } else {
            $backtotop.fadeOut();
        }
    });

    moveBacktotop();
    footerFixBottom();
    $(window).resize(moveBacktotop);
    $(window).resize(footerFixBottom);

    $('.topic_content a,.reply_content a').attr('target', '_blank');

    // pretty code
    prettyPrint();

    // data-loading-text="提交中"
    $('.submit_btn').click(function () {
        $(this).button('loading');
    });

    // 广告的统计信息
    $('.sponsor_outlink').click(function () {
        var $this = $(this);
        var label = $this.data('label');
        ga('send', 'event', 'banner', 'click', label, 1.00, {'nonInteraction': 1});
    });

    // ajax 登录
    $('#signin_modal_button').click(function(e) {
        var loginname = $('#signin_modal_name').val();
        var password = $('#signin_modal_pass').val();
        $.ajax({
            type: "POST",
            url: "/api/v2/auth/signin",
            data: {
                loginname: loginname,
                password: password
            }
        }).done(function (response) {
            localStorage.jiuyanlouUser = response.user;
            location.reload();
        }).error(function(response){
            console.error('signin error ', response);
        });
    });
});

function auth() {
    if (!localStorage.jiuyanlouUser) {
        $('.modal').modal('hide');
        $('#signin_modal').modal('show');
        return false;
    }
    return true;
}

function signout() {
    $.ajax({
        type: "POST",
        url: "/signout"
    }).done(function (response) {
        localStorage.removeItem('jiuyanlouUser');
        location.reload();
    }).error(function(response){
        console.error('signout error ', response);
    });
}

function avatarPath(avatar, size) {
    if (!avatar || !size) {
        return avatar;
    }
    var extname = avatar.substring(avatar.lastIndexOf('.') + 1);
    var path = avatar.substring(0, avatar.lastIndexOf('.'));
    var file_path = path + '_' + size + '.' + extname;
    return file_path;
}

