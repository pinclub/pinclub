$(document).on('click', '#createTopic', function (event) {
    auth(function(result) {
        if (!result) {
            return;
        }
        window.location.href = "/topic/create";
    });
});