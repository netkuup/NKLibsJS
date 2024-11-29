let NKDrag = {};

let nkdrag_event_listener = new NKEventListener();
NKDrag = { ...nkdrag_event_listener };

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

            NKDrag.selection.element.style.transform = `translate(${left}px, ${top}px)`;

            NKDrag.dispatchEvent('onDrag', {
                e: NKDrag.selection.element,
                position: {left: left, top: top}
            });
        }
    }

    NKDom.addEventListener( document, 'mousemove', onMouseMove );

    function onMouseUp( e ) {
        NKDrag.selection.element = null;
    }

    NKDom.addEventListener( document, 'mouseup', onMouseUp );
};

NKDrag.reload = function() {

    function onMouseDown( e ) {
        NKDrag.selection.element = NKDom.getClosest(this, '.NKDrag_dst');
        NKDrag.selection.offset = NKPosition.getMouse();

        try {
            const regex = /translate\(\s*([-+]?\d*\.?\d+px)\s*,\s*([-+]?\d*\.?\d+px)\s*\)/;
            const match = NKDrag.selection.element.style.transform.match(regex);

            NKDrag.selection.offset[0] -= parseFloat(match[1]); //translateX
            NKDrag.selection.offset[1] -= parseFloat(match[2]); //translateY
        } catch (e){}

    }

    NKDom.addEventListener( '.NKDrag_src', 'mousedown', onMouseDown );

};
