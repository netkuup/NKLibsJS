let NKStick = {};

if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before stick.js";
}

// TODO Same functions but with nkdata-container="theContainer"

NKStick.start = function() {
    if ( NK.isset(NKStick.loaded) && NKStick.loaded === true ) return;


    NKDom.select('.NKStickBD').forEach(function ( el, i ){
        NKDom.setAttribute( el, 'nkdata-top', el.offsetTop )
    });


    window.addEventListener('load', NKStick.reload );
    window.addEventListener('resize', NKStick.reload );
    window.addEventListener('scroll',  NKStick.reload );

    NKStick.loaded = true;
};

NKStick.reload = function() {

    let scroll_visible = document.documentElement.scrollHeight > window.innerHeight;
    let scroll_top = document.documentElement.scrollTop;

    // NKStickBN
    if ( scroll_visible ) {
        NKDom.removeClass('.NKStickBN', 'NKStickBO');
    } else {
        NKDom.addClass('.NKStickBN', 'NKStickBO');
    }

    if ( !scroll_visible ) return;

    // NKStickBD
    NKDom.removeClass('.NKStickBD', 'NKStickBO');

    NKDom.select('.NKStickBD').forEach(function (el, i){
        if ( scroll_top + window.innerHeight < el.offsetTop + el.clientHeight ) {
            NKDom.addClass('.NKStickBD', 'NKStickBO');
        }
    });


    // NKStickTD
    NKDom.removeClass('.NKStickTD', 'NKStickTO');

    NKDom.select('.NKStickTD').forEach(function (el, i){
        if ( NKDom.getCss(el, 'position') === "fixed" ) {
            let top = parseInt( NKDom.getCss(el, 'top') );

            if ( scroll_top < top ) {
                NKDom.setCss(el, 'margin-top', -scroll_top);
            } else {
                NKDom.setCss(el, 'margin-top', -top);
            }

        } else {
            if ( scroll_top > el.offsetTop ) {
                NKDom.addClass('.NKStickTD', 'NKStickTO');
            }

        }
    });


};
