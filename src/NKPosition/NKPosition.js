let NKPosition = {};

let nkposition_event_listener = new NKEventListener();
NKPosition = { ...nkposition_event_listener };

NKPosition.start = function( dispatch_event = true ) {
    if ( NKPosition.loaded === true ) return;
    NKPosition.loaded = true;

    NKPosition.mouse = [0,0];

    window.addEventListener('mousemove', function (event) {
        NKPosition.mouse[0] = event.clientX;
        NKPosition.mouse[1] = event.clientY;
        if ( dispatch_event ) NKPosition.dispatchEvent('onMousemove', {
            abs: NKPosition.mouse,
            rel:  [ (NKPosition.mouse[0]).nksum(window.scrollX), (NKPosition.mouse[1]).nksum(window.scrollY) ]
        });
    }, true);

};


NKPosition.getMouse = function( absolute = false ) {
    return absolute ? NKPosition.mouse : [ (NKPosition.mouse[0]).nksum(window.scrollX), (NKPosition.mouse[1]).nksum(window.scrollY) ];
};

NKPosition.getMouseX = function( absolute = false) {
    return absolute ? NKPosition.mouse[0] : (NKPosition.mouse[0]).nksum(window.scrollX);
};

NKPosition.getMouseY = function( absolute = false ) {
    return absolute ? NKPosition.mouse[1] : (NKPosition.mouse[1]).nksum(window.scrollY);
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
