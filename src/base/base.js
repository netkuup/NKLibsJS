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