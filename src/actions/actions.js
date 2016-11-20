var NKActions = {};

if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before storage.js";
}


NKActions.start = function() {
    if ( NK.isset(NKActions.loaded) && NKActions.loaded === true ) return;

    window.onload = function () {

        $('.NKClose_src').on('click', function(){
            $(this).closest('.NKClose_dst').hide();
        });

    };


    NKActions.loaded = true;
};


