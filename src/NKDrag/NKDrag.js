let NKDrag = {};

let nkdrag_event_listener = new NKEventListener();
NKDrag = { ...nkdrag_event_listener };

NKDrag.selection = { element: null, wrapper: null, original_list: [] };

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

            NKDrag.moveElement( NKDrag.selection.element, left, top );
        }
    }

    NKDom.addEventListener( document, 'mousemove', onMouseMove );

    function onMouseUp( e ) {
        
        // Si es lista (flex) vuelve a su sitio, sino se queda donde lo arrastramos.
        if ( NKDrag.selection.wrapper !== null ) {
            NKDrag.selection.element.style.transition = "transform 0.5s ease";
            NKDrag.selection.element.style.transform = "";

            let original_list = NKDrag.selection.original_list;
            let new_list = Array.from(NKDrag.selection.wrapper.querySelectorAll('.NKDrag_dst'));

            const igual = new_list.every((el, index) => el === original_list[index]);

            if ( !igual ) {
                NKDrag.dispatchEvent('onDragEnd', {
                    e: NKDrag.selection.element,
                    items: new_list
                });
            }
            
        }

        NKDrag.selection.element = null;
        NKDrag.selection.wrapper = null;
    }

    NKDom.addEventListener( document, 'mouseup', onMouseUp );
};



NKDrag.moveElement = function( element, left = 0, top = 0 ) {

    if ( NKDrag.selection.wrapper_direction === "column" ) { //Es un listado/flex
        let wrapper = NKDrag.selection.wrapper;
        let items = Array.from(wrapper.querySelectorAll('.NKDrag_dst'));

        let igual = true;
        items.sort( function(a, b) {
            let r = a.getBoundingClientRect().y - b.getBoundingClientRect().y;
            if ( r <= 0 ) igual = false;
            return r;
        });

        let original_top = element.getBoundingClientRect().y;
    
        items.forEach(item => wrapper.appendChild(item));
   
        if ( !igual ) {
            let new_top = element.getBoundingClientRect().y;
            let diff_top = new_top - original_top;

            top -= diff_top;
            NKDrag.selection.offset[1] += diff_top;
        }
    }

    if ( NKDrag.selection.wrapper_direction === "row" ) { //Es un listado/flex
        let wrapper = NKDrag.selection.wrapper;
        let items = Array.from(wrapper.querySelectorAll('.NKDrag_dst'));

        let igual = true;
        items.sort( function(a, b) {
            let r = a.getBoundingClientRect().x - b.getBoundingClientRect().x;
            if ( r <= 0 ) igual = false;
            return r;
        });

        let original_left = element.getBoundingClientRect().x;
    
        items.forEach(item => wrapper.appendChild(item));
   
        if ( !igual ) {
            let new_left = element.getBoundingClientRect().x;
            let diff_left = new_left - original_left;

            left -= diff_left;
            NKDrag.selection.offset[0] += diff_left;
        }
    }


    NKDrag.selection.element.style.transition = "";
    element.style.transform = `translate(${left}px, ${top}px)`;

    NKDrag.dispatchEvent('onDrag', {
        e: element,
        position: {left: left, top: top}
    });
}

NKDrag.reload = function() {

    function onMouseDown( e ) {
        let wrapper = NKDom.getClosest(this, '.NKDrag_wrapper');
        let original_list = (wrapper === null) ? [] : Array.from(wrapper.querySelectorAll('.NKDrag_dst'));
        NKDrag.selection.wrapper = wrapper
        NKDrag.selection.wrapper_direction = (wrapper === null) ? null : getComputedStyle(NKDrag.selection.wrapper).flexDirection;
        NKDrag.selection.original_list = [...original_list];

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
