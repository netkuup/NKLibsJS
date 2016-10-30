window.setInterval(function(){
    if ($.active > 0) {
        $('#loader').css('display', 'block');
    } else {
        $.active = 0;
        $('#loader').css('display', 'none');
    }
}, 500);

$( document ).ajaxError(function() {
    $.active = 0;
});

if ( document.domain != "localhost" ) {
    window.onerror = function(message, url, lineNumber) {
        $.active = 0;
        console.log("Error: ", message, url, lineNumber);
        return true;
    };
}