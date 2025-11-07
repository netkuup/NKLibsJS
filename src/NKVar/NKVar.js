let NKVar = {};

NKVar.isset = function( variable ) {
        if ( typeof variable === 'undefined' ) return false;
        if ( variable == null ) return false;
        if ( typeof variable === 'function' ) {
            try {
                variable();
            } catch (e) {
                return false;
            }
        }

        return true;
};

NKVar.empty = function( variable ) {
    if ( !NK.isset(variable) ) return true;
    if ( typeof variable === 'function' ) variable = variable();
    if ( variable.length === 0 ) return true;
    return false;
};


//Node integration
if ( NK.node ) Object.assign(module.exports, { NKVar });

