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
            if (!response.success) {
                console.error('signin error ', response);
                $('#signin_message').html(response.err_message);
            }
            if (response.two_factor) {
                $('.modal').modal('hide');
                $('#two_factor_modal').modal('show');
                $('#two_factor_name').val(loginname);
            } else {
                localStorage.jiuyanlouUser = response.user;
                location.reload();
            }
        }).error(function(response){
            console.error('signin error ', response);
            var resJson = response.responseJSON;
            $('#signin_message').html(resJson.err_message);
        });
    });

    $('#signin_two_factor_button').click(function (e) {
        var tfv = $('#two_factor_code').val();
        var loginname = $('#two_factor_name').val();
        $.ajax({
            type: "POST",
            url: "/api/v2/auth/signin/two_factor",
            data: {
                tfv: tfv,
                name: loginname
            }
        }).done(function (response) {
            if (!response.success) {
                console.error('signin error ', response);
            } else {
                // FIXME not save this localStorage if user singin from /signin page
                localStorage.jiuyanlouUser = response.user;
                location.reload();
            }
        }).error(function(response){
            console.error('two factor error ', response);
        });
    });
});

function auth(callback) {
    if (localStorage.jiuyanlouUser) {

        $.ajax({
            type: "POST",
            url: "/api/v2/auth/check"
        }).done(function (response) {
            if (!response.success) {
                $('.modal').modal('hide');
                $('#signin_modal').modal('show');
                callback(false);
            } else {
                callback(true);
            }
        }).error(function(response){
            $('.modal').modal('hide');
            $('#signin_modal').modal('show');
            callback(false);
        });
    } else {
        callback(true);
    }
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
    var file_path = '';
    // FIXME: can not find pic if photo uploaded to 7niu
    if (avatar.indexOf('images.shiyix.org') > -1) {
        file_path = avatar + '_' + size;
    } else if (avatar.indexOf('githubusercontent.com') > -1 || avatar.indexOf('gravatar.com') > -1) {
        file_path = avatar;
    } else {
        var extname = avatar.substring(avatar.lastIndexOf('.') + 1);
        var path = avatar.substring(0, avatar.lastIndexOf('.'));
        file_path = path + '_' + size + '.' + extname;
    }
    return file_path;
}

