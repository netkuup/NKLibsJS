var NKPosition = {};

if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before position.js";
}


NKPosition.start = function() {
    if ( NK.isset(NKPosition.loaded) && NKPosition.loaded === true ) return;
    NKPosition.loaded = true;

    NKPosition.mouse = [0,0];

    window.addEventListener('mousemove', function (event) {
        NKPosition.mouse = [event.clientX, event.clientY];
    }, true);

};


NKPosition.getMouse = function( absolute ) {
    absolute = absolute || false;
    if ( absolute === true ) return NKPosition.mouse;
    return [ NKPosition.mouse[0] + window.scrollX, NKPosition.mouse[1] + window.scrollY ];
};

NKPosition.getMouseX = function( absolute ) {
    absolute = absolute || false;
    if ( absolute === true ) return NKPosition.mouse[0];
    return NKPosition.mouse[0] + window.scrollX;
};

NKPosition.getMouseY = function( absolute ) {
    absolute = absolute || false;
    if ( absolute === true ) return NKPosition.mouse[1];
    return NKPosition.mouse[1] + window.scrollY;
};

NKPosition.getScroll = function() {
    return [window.scrollX, window.scrollY];
};

NKPosition.getScrollX = function() {
    return window.scrollX;
};

NKPosition.getScrollY = function() {
    return window.scrollY;
};
