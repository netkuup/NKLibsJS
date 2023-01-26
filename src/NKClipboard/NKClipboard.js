var NKClipboard = {};

NKClipboard.set = function( str ) {
    const el = document.createElement('textarea');
    el.style.position = 'absolute';
    el.style.left = '-10000px';
    el.readonly = true;
    el.value = str;

    document.body.appendChild( el );
    const selected = (document.getSelection().rangeCount > 0) ? document.getSelection().getRangeAt(0) : false;
    el.select();

    document.execCommand( 'copy' );
    document.body.removeChild( el );

    if ( selected ) {
        document.getSelection().removeAllRanges();
        document.getSelection().addRange( selected );
    }
};

NKClipboard.get = function() {
    return navigator.clipboard.readText();
};
