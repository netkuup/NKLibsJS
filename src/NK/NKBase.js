var NK = {};

NK.isset = function( variable ) {
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

NK.empty = function(variable) {
    if ( !NK.isset(variable) ) return true;
    if ( typeof variable === 'function' ) variable = variable();
    if ( variable.length === 0 ) return true;
    return false;
};

NK.clone = function ( obj ) {
    console.error("NK.clone() deprecated, use NKObject.clone() instead.");
    return JSON.parse(JSON.stringify(obj));
};

NK.backtrace = function ( msg = "" ) {
    let backtrace = new Error().stack.split("\n").slice(2).join("\n");
    console.log("Backtrace: " + msg + "\n" + backtrace);
};

NK.getScriptPath = function () {
    let scripts = document.querySelectorAll("script"); //Los otros tag aun no están parseados
    let script_src = scripts[scripts.length - 1].src;
    return script_src.substring(8, script_src.lastIndexOf("/"));
};

//Avoid sync = true
NK.sleep = function ( ms, sync = false ) {
    if ( !sync ) return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });

    let  inicio = new Date().getTime();

    while ( new Date().getTime() - inicio < ms ) {
        // DO NOT USE! ONLY FOR TESTING PURPOSES!
    }
};

function NKEventListener() {
    this.events = {};

    this.addEventListener = function ( name, func ) {
        if ( !NK.isset(this.events[name]) ) this.events[name] = [];

        this.events[name].push( func );
    }

    this.removeEventListener = function ( name, func ) {
        for ( var i = 0; i < this.events[name].length; i++ ) {
            var ev = this.events[name][i];

            if ( ev === func ) {
                this.events[name].splice(i, 1);
                break;
            }
        }
    }

    this.dispatchEvent = function ( name, data ) {
        if ( !NK.isset(this.events[name]) ) return;

        for ( var i = 0; i < this.events[name].length; i++ ) {
            var ev = this.events[name][i];
            ev( data );
        }

    }
}



NK.core = {};

NK.core.reloadOnDomChange = function( module ) {
    
    if ( !NK.isset(NK.core.reactableModules) ) NK.core.reactableModules = [];

    NK.core.reactableModules.push( module );

    if ( !NK.isset( NK.core.MutationObserver ) ) {
        //http://stackoverflow.com/questions/2844565/is-there-a-javascript-jquery-dom-change-listener

        MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

        NK.core.MutationObserverOffset = 1;

        NK.core.MutationObserver = new MutationObserver(function(mutations, observer) {
            if ( NK.core.MutationObserverOffset > 0 ) {
                NK.core.MutationObserverOffset--;
                return;
            }

            for( var i = 0; i < NK.core.reactableModules.length; i++ ) {
                if ( typeof NK.core.reactableModules[i].reload !== 'undefined' ) {
                    NK.core.reactableModules[i].reload();
                }
            }

        });

        NK.core.MutationObserver.observe( document, {subtree: true, childList: true} );

    }

};

NK.core.ignoreMutations = function( numMutations ) {
    if ( NK.isset(NK.core.MutationObserver) ) NK.core.MutationObserverOffset += numMutations;
};


window.addEventListener("load", function () {
    if ( !NK.isset(() => window.$) ) {
        throw "Error, you must include jquery before using NKLibsJS";
    }
    window.loaded = true;
});

/*
NK.autoload = function( modules ) {

    for( var i = 0; i < modules.length; i++ ) {
        if ( typeof modules[i].start !== 'undefined' ) {
            modules[i].start();
        }
    }
};
*/


// https://mikemcl.github.io/big.js/

Number.prototype.nksum = function(value) {
    return new Big(this).add(value).toNumber();
};
Number.prototype.nkadd = function(value) {
    return new Big(this).add(value).toNumber();
};
Number.prototype.nkminus = function(value) {
    return new Big(this).minus(value).toNumber();
};
Number.prototype.nksubtract = function(value) {
    return new Big(this).minus(value).toNumber();
};
Number.prototype.nkdiv = function(value) {
    return new Big(this).div(value).toNumber();
};
Number.prototype.nkmul = function(value) {
    return new Big(this).mul(value).toNumber();
};
Number.prototype.nkpow = function(value) {
    return new Big(this).pow(value).toNumber();
};
Number.prototype.nkmod = function(value) {
    return new Big(this).mod(value).toNumber();
};
Number.prototype.nkprec = function(value) {
    return new Big(this).prec(value).toNumber();
};
Number.prototype.nkround = function(value) {
    return new Big(this).prec(value).toNumber();
};
Number.prototype.nksqrt = function() {
    return new Big(this).sqrt().toNumber();
};
Number.prototype.nkabs = function() {
    return Math.abs(this);
};


