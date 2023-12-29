let NKLoader = {};

if ( typeof NK === 'undefined' ) {
    throw "You must include NKBase.js before loader.js";
}


NKLoader.setSelector = function( loader_selector, error_selector ) {

    NKDom.setCss( loader_selector, 'display', 'none' );
    NKDom.setCss( error_selector, 'display', 'none' );

    window.setInterval(function(){
        if ($.active > 0) {
            NKDom.setCss( loader_selector, 'display', 'block' );
        } else {
            $.active = 0;
            NKDom.setCss( loader_selector, 'display', 'none' );
        }
    }, 500);

    $( document ).ajaxError(function() {
        $.active = 0; // AJAX Post abort.
    });

    if ( document.domain != "localhost" ) {
        window.onerror = function(message, url, lineNumber) {
            $.active = 0;

            if ( NK.isset(error_selector) ) {
                NKDom.setCss( error_selector, 'display', 'block' );
            }

            console.log("Error: ", message, url, lineNumber);
            return true;
        };
    }

};



