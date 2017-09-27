$(document).on('click', '#createTopic', function (event) {
    if (!auth()) {
        return;
    }
    window.location.href="/topic/create";
});