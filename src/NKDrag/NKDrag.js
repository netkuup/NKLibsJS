let NKDrag = {};

let event_listener = new NKEventListener();
NKDrag = { ...event_listener };

NKDrag.selection = { element: null };

NKDrag.start = function( reactable ) {
    if ( NK.isset(NKDrag.loaded) && NKDrag.loaded === true ) return;
    NKDrag.loaded = true;

    if ( typeof NKPosition === 'undefined' ) {
        throw "You must include NKPosition.js";
    }
    NKPosition.start();

    window.addEventListener('load', NKDrag.reload );
    if ( window.loaded === true ) NKDrag.reload();

    if ( reactable === true ) {
        NK.core.reloadOnDomChange( NKDrag );
    }
    function onMouseMove(e) {
        if ( NKDrag.selection.element != null ) {
            let left = NKPosition.getMouseX() - NKDrag.selection.offset[0];
            let top = NKPosition.getMouseY() - NKDrag.selection.offset[1];

            NKDrag.selection.element.style.left = left + "px";
            NKDrag.selection.element.style.top = top+ "px";

            NKDrag.dispatchEvent('onDrag', {
                e: NKDrag.selection.element,
                position: {left: left, top: top}
            });
        }
    }

    NKDom.addEventListener( document, 'mousemove', onMouseMove );
};

NKDrag.reload = function() {

    function onMouseDown( e ) {
        NKDrag.selection.element = NKDom.getClosest(this, '.NKDrag_dst');
        NKDrag.selection.offset = NKPosition.getMouse();

        // let pos = NKDrag.selection.element.offset;
        NKDrag.selection.offset[0] -= NKDrag.selection.element.offsetLeft;
        NKDrag.selection.offset[1] -= NKDrag.selection.element.offsetTop;
    }

    NKDom.addEventListener( '.NKDrag_src', 'mousedown', onMouseDown );

    function onMouseUp( e ) {
        NKDrag.selection.element = null;
    }

    NKDom.addEventListener( '.NKDrag_src', 'mouseup', onMouseUp );

};
