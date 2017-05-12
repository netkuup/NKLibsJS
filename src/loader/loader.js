var NKLoader = {};

if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before loader.js";
}

// TODO Documentation & examples

NKLoader.setSelector = function( loader_selector, error_selector ) {

    $(loader_selector).css('display', 'none');
    $(error_selector).css('display', 'none');

    window.setInterval(function(){
        if ($.active > 0) {
            $(loader_selector).css('display', 'block');
        } else {
            $.active = 0;
            $(loader_selector).css('display', 'none');
        }
    }, 500);

    $( document ).ajaxError(function() {
        $.active = 0; // AJAX Post abort.
    });

    if ( document.domain != "localhost" ) {
        window.onerror = function(message, url, lineNumber) {
            $.active = 0;

            if ( NK.isset(error_selector) ) {
                $(error_selector).css('display', 'block');
            }

            console.log("Error: ", message, url, lineNumber);
            return true;
        };
    }

};



