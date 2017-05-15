var NK = {};

NK.isset = function( variable ) {
    if ( typeof variable === 'undefined' ) return false;
    if ( variable == null ) return false;
    return true;
};

NK.empty = function(variable) {
    if ( !NK.isset(variable) ) return true;
    if ( variable.length == 0 ) return true;
    return false;
};


NK.core = {};

NK.core.reloadOnDomChange = function( module ) {
    
    if ( !NK.isset(NK.core.reactableModules) ) NK.core.reactableModules = [];

    NK.core.reactableModules.push( module );

    if ( !NK.isset( NK.core.MutationObserver ) ) {
        //http://stackoverflow.com/questions/2844565/is-there-a-javascript-jquery-dom-change-listener

        MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

        NK.core.MutationObserver = new MutationObserver(function(mutations, observer) {

            for( var i = 0; i < NK.core.reactableModules.length; i++ ) {
                if ( typeof NK.core.reactableModules[i].reload !== 'undefined' ) {
                    NK.core.reactableModules[i].reload();
                }
            }
            
        });

        NK.core.MutationObserver.observe( document, {subtree: true} );

    }

};


/*
NK.autoload = function( modules ) {

    for( var i = 0; i < modules.length; i++ ) {
        if ( typeof modules[i].start !== 'undefined' ) {
            modules[i].start();
        }
    }
};
*/