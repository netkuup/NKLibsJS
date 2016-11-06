var NKStorage = {};

if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before storage.js";
}

NKStorage.p = {};
NKStorage.np = {};


NKStorage.save = function( force ) {
    if ( force === true ) {
        console.log("Entra");
        localStorage.setItem( 'NKStorage', JSON.stringify(NKStorage.p) );
        sessionStorage.setItem( 'NKStorage', JSON.stringify(NKStorage.np) );
        NKStorage.saveOnLeave = false;
    } else {
        NKStorage.saveOnLeave = true;
    }
};


NKStorage.start = function() {
    if ( NK.isset(NKStorage.loaded) && NKStorage.loaded === true ) return;

    try {
        NKStorage.p = JSON.parse( localStorage.getItem('NKStorage') );
    } catch (e) {}

    if ( !NK.isset(NKStorage.p) ) {
        localStorage.setItem( 'NKStorage', JSON.stringify('{}') );
        NKStorage.p = {};
    }

    try {
        NKStorage.np = JSON.parse( sessionStorage.getItem('NKStorage') );
    } catch (e) {}

    if ( !NK.isset(NKStorage.np) ) {
        sessionStorage.setItem( 'NKStorage', JSON.stringify('{}') );
        NKStorage.np = {};
    }

    NKStorage.loaded = true;
};

// On page leave
window.onbeforeunload = function (e) {
    if ( NKStorage.saveOnLeave == true) {
        NKStorage.save( true );
        console.log("NKStorage Save");
    }
};