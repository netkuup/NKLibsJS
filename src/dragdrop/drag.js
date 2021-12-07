var NKDrag = {};

//if ( typeof NK === 'undefined' ) {
//    throw "You must include base.js before drag.js";
//}

NKDrag.selection = { element: null };

NKDrag.start = function( reactable ) {
    if ( NK.isset(NKDrag.loaded) && NKDrag.loaded === true ) return;
    NKDrag.loaded = true;

    if ( typeof NKPosition === 'undefined' ) {
        throw "You must include position.js";
    }
    NKPosition.start();

    window.addEventListener('load', NKDrag.reload );
    if ( window.loaded === true ) NKDrag.reload();

    if ( reactable === true ) {
        NK.core.reloadOnDomChange( NKDrag );
    }

    $(document).on('mousemove', function() {
        if ( NKDrag.selection.element != null ) {
            NKDrag.selection.element.offset({
                left: NKPosition.getMouseX() - NKDrag.selection.offset[0],
                top: NKPosition.getMouseY() - NKDrag.selection.offset[1]
            });
        }
    });
};

NKDrag.reload = function() {

    $('.NKDrag_src').on('mousedown', function() {
        NKDrag.selection.element = $(this).closest('.NKDrag_dst');
        NKDrag.selection.offset = NKPosition.getMouse();

        var pos = NKDrag.selection.element.offset();
        NKDrag.selection.offset[0] -= pos.left;
        NKDrag.selection.offset[1] -= pos.top;
    });

    $('.NKDrag_src').on('mouseup', function() {
        NKDrag.selection.element = null;
    });

};
