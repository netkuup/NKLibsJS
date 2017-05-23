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
*/;var NKActions = {};

if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before actions.js";
}


NKActions.start = function( reactable ) {
    if ( NK.isset(NKActions.loaded) && NKActions.loaded === true ) return;

    window.addEventListener('load', NKActions.reload );

    if ( reactable === true ) {
        NK.core.reloadOnDomChange( NKActions );
    }
    
    NKActions.loaded = true;
};


NKActions.reload = function() {

    $('.NKHide_btn').off().on('click', function(){
        $(this).closest('.NKHide_dst').hide();
    });

    $('.NKDel_btn').off().on('click', function(){
        $(this).closest('.NKDel_dst').remove();
    });

    function reactLabel( orig, dst ) {
        var labelName = $(orig).html();
        if ( labelName.toLowerCase().startsWith("hide") || labelName.toLowerCase().startsWith("show") ) {
            labelName = labelName.substring(4);
        }
        if ( labelName.length > 0 && !labelName.startsWith(" ") ) labelName = " " + labelName;

        if ( dst.is(':visible') ) {
            $(orig).html("Hide" + labelName);
        } else {
            $(orig).html("Show" + labelName);
        }
        console.log("entra");
    }

    $('.NKToggle_btn').off().on('click', function(){
        var e = $(this).siblings('.NKToggle_dst');
        e.toggle();
        if ( $(this).hasClass('NKReact') ) reactLabel(this, e);
    });

    $('.NKToggle_btn.NKReact').each(function() {
        var e = $(this).siblings('.NKToggle_dst');
        reactLabel(this, e);
    });

    $('.NKTemplate_btn').off().on('click', function(){
        var template_name = $(this).attr("class").split('NKTemplate_btn ')[1].split(' ')[0];
        $('.NKTemplate_dst.'+template_name).append(
            $('.NKTemplate_src.'+template_name).clone(true, true).removeClass('NKTemplate_src').addClass('NKTemplate').show()
        );
    });

};


;var NKCast = {};

if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before cast.js";
}

NKCast.intByteArray = {
    // [65, 66] => "AB" (Utf 8 or 16)
    toUtf16String: function( data ) {
        var result = '';
        for ( var i = 0; i < data.length; i++ ) {
            if ( data[i] < 0 || data[i] > 255 ) {
                console.error("Error NKCast.intByteArray.toUtf16String(): ("+data[i]+") Out of range [0..255]");
            }
            result += String.fromCharCode( data[i] );
        }
        return result;
    },
    
    // [65, 66] => "0x41 0x42" | "41 42" | "4142" ...
    toHexString: function( data, startWith0x, addSpaces ) {
        if ( !NK.isset(data) ) return '';
        var result = '';
        for ( var i = 0; i < data.length; i++ ) {
            if ( addSpaces && i != 0 ) result += ' ';
            result += NKCast.intByte.toHexString( data[i], startWith0x );
        }
        return result;
    },

    toInt: function ( data ) {
        var result = 0, mult = 1;
        for ( var i = data.length-1; i >= 0; i-- ) {
            if ( data[i] < 0 || data[i] > 255 ) {
                console.error("Error NKCast.intByteArray.toUtf16String(): ("+data[i]+") Out of range [0..255]");
            }
            result += data[i] * mult;
            mult *= 256;
        }
        return result;
    }

};


NKCast.intByte = {
    // 255 => "ff" || "0xff"
    toHexString: function ( data, startWith0x ) {
        if ( data < 0 || data > 255 ) console.error("Error NKCast.intByte.toHexString(): ("+data+") Out of range [0..255]");
        if ( !startWith0x ) return data.toString( 16 );
        return "0x" + data.toString( 16 );
    }

};

NKCast.utf16String = {
    // "AB" => [65, 66] (Utf 8 or 16)
    toIntByteArray: function( data ) {
        var result = '';
        for ( var i = 0; i < data.length; i++ ) result += data.charCodeAt( i );
        return result;
    }
};

NKCast.utf8String = {
    // "AB" => [65, 66] (Utf 8 or 16)
    toIntByteArray: function( data ) {
        return NKCast.utf16String.toIntByteArray( data );
    }
};

;var NKForm = {};

if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before form.js";
}

NKForm.errors = {
    duplicated_fields: true,
    invalid_json: true
};

// TODO change to getInputs
// TODO Works with textarea's ? Are not inputs..
// TODO Best if elements have class NKField
NKForm.getFields = function( form_selector, json ) {

    var values = {};

    $( form_selector + ' :input' ).each(function() {
        if ( NK.empty(this.name) ) return;

        if ( this.name.slice(-2) === "[]" ) {
            var field_name = this.name.substr(0, this.name.length-2);

            if ( !NK.isset(values[field_name]) ) values[field_name] = [];

            values[field_name].push($(this).val());

        } else {

            if ( NKForm.errors.duplicated_fields && NK.isset(values[this.name]) ) {
                throw( 'NKForm.getFields: Duplicated input field with name (' + this.name + ')' );
            }

            values[this.name] = $(this).val();
        }

    });

    if ( json === true ) return JSON.stringify(values);
    return values;

};

NKForm.setFields = function( form_selector, field_data, json ) {
    if ( NK.empty(field_data) ) return;

    if ( json === true ) {
        try {
            field_data = JSON.parse(field_data);
        } catch (e) {
            if ( NKForm.errors.invalid_json ) throw "NKForm.setFields: Invalid input json. (" + field_data + ")";
            return;
        }
    }

    $( form_selector + ' :input' ).each(function() {
        if ( !NK.empty(field_data[this.name]) )
            $(this).val( field_data[this.name] );

    });

};


NKForm.send = function( form_selector, url, callback ) {

    $.post(
        url,
        NKForm.getFields(form_selector),
        function( data, status ) {

            if( NK.isset(callback) ) {
                callback( data, status );
            } else {
                location.reload();
            }

        }
    );

};


// ExtensionList = accept=".gif,.jpg,.jpeg,.png,.doc,.docx";
NKForm.fileChooser = function( callback, extension_list ) {
    extension_list = extension_list || "";
    $('body').append('<input type="file" id="tmpfile" accept="'+extension_list+'">');
    var element = document.getElementById("tmpfile");
    element.addEventListener('change', function (e) { callback( e.path[0].value ) } , false);
    $('#tmpfile').trigger('click');
    element.parentNode.removeChild(element);
};

;var NKLoader = {};

if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before loader.js";
}


NKLoader.setSelector = function( loader_selector, error_selector ) {

    $(loader_selector).css('display', 'none');
    $(error_selector).css('display', 'none');

    window.setInterval(function(){
        if ($.active > 0) {
            $(loader_selector).css('display', 'block');
        } else {
            $.active = 0;
            $(loader_selector).css('display', 'none');
        }
    }, 500);

    $( document ).ajaxError(function() {
        $.active = 0; // AJAX Post abort.
    });

    if ( document.domain != "localhost" ) {
        window.onerror = function(message, url, lineNumber) {
            $.active = 0;

            if ( NK.isset(error_selector) ) {
                $(error_selector).css('display', 'block');
            }

            console.log("Error: ", message, url, lineNumber);
            return true;
        };
    }

};



;var NKRouting = {
    routes: []
};


NKRouting.get_url = function() {
    return [
        window.location.protocol + "//",
        window.location.host,
        window.location.pathname.split('/').slice(0, -1).join('/') + "/",
        window.location.pathname.split('/').pop(),
        window.location.search
    ];
};

NKRouting.set_routes = function( routes ) {
    NKRouting.routes[ routes.router_name ] = routes;

    if ( NK.isset(routes.default_section) ) {
        $(document).ready(function(){
            NKRouting.go( routes.router_name, routes.default_section );
        });
    }
};


NKRouting.go = function( router_name, section ) {

    if ( !NK.isset(NKRouting.routes[router_name]) ) {
        console.error( "Routes for", router_name, "not set.");
        return;
    }

    var ruta = NKRouting.routes[router_name].sections[section];

    if ( !NK.isset(ruta) ) {
        console.error( "Routes for", router_name, "->", section, "not set.");
        return;
    }

    
    if ( NK.isset(ruta.get) ) {
        NKRouting._perform_get( router_name, section );

    } else if ( NK.isset(ruta.show) ) {
        NKRouting._perform_show( router_name, section );

    }

    
    

};


NKRouting._perform_show = function( router_name, section ) {

    var container = NKRouting.routes[router_name].container;
    var sections = NKRouting.routes[router_name].sections;

    if ( !NK.isset(container) ) {
        for ( var auxSection in sections ) {
            $(sections[auxSection].show).hide();
        }

        $(sections[section].show).show();
    } else {
        
        if ( !NK.isset(sections[section].content) ) {
            for ( var auxSection in sections ) {
                sections[auxSection].content = $(sections[auxSection].show).html();
                $(sections[auxSection].show).html("");
            }
        }

        NKRouting._replace_content( router_name, section );

    }

    NKRouting._run_controller( router_name, section );
    

};


NKRouting._perform_get = function( router_name, section ) {

    var sectionObj = NKRouting.routes[router_name].sections[section];

    if ( NK.isset(sectionObj.loading) ) return;

    if ( !NK.isset(sectionObj.content) ) {
        sectionObj.loading = true;

        $.ajax({
            url: sectionObj.get, 
            success: function ( result ) {
                sectionObj.content = result;
                NKRouting._replace_content( router_name, section );
                delete sectionObj.loading;
                NKRouting._run_controller( router_name, section );
            }
        });           
            
    } else {

        NKRouting._replace_content( router_name, section );
        NKRouting._run_controller( router_name, section );
    }

}



NKRouting._replace_content = function( router_name, section ) {

    var container = NKRouting.routes[router_name].container;
    var content = NKRouting.routes[router_name].sections[section].content;
    var controller = NKRouting.routes[router_name].sections[section].ctrl;

    $(container).html( content );

};


NKRouting._run_controller = function( router_name, section ) {
    var router = NKRouting.routes[router_name];
    var ruta = NKRouting.routes[router_name].sections[section];
    var controller_init = ruta.ctrl + ".init";
    var controller_enter = ruta.ctrl + ".enter";

    if ( NK.isset(router.last_section) ) {
        var last_controller = NKRouting.routes[router_name].sections[router.last_section].ctrl;
        if ( NK.isset(last_controller) ) {
            if ( eval('typeof ' + last_controller + ".leave") === 'function' ) {
                eval( last_controller + ".leave()" );
            }
        }
    }
    router.last_section = section;

    if ( !NK.isset(ruta.ctrl) ) return;

    var first_time = !NK.isset( ruta.loaded );
    ruta.loaded = true;

    if ( first_time ) {
        if ( eval('typeof ' + controller_init) === 'function' ) {
            eval( controller_init + "()" );
        }
    }

    if ( eval('typeof ' + controller_enter) === 'function' ) {
        eval( controller_enter + "()" );
    }
    
};


;
// -------------------------------------------------------------------------
// String
// -------------------------------------------------------------------------

// Escape html characters.
String.prototype.escape = function() {
    var tagsToReplace = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
    };
    return this.replace(/[&<>]/g, function(tag) {
        return tagsToReplace[tag] || tag;
    });
};;var NKStick = {};

if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before stick.js";
}

// TODO Same functions but with nkdata-container="theContainer"

NKStick.start = function() {
    if ( NK.isset(NKStick.loaded) && NKStick.loaded === true ) return;

    $.each( $('.NKStickBD'), function( key, value ) {
        $(this).attr('nkdata-top', $(this).offset().top );
    });


    window.addEventListener('load', NKStick.reload );
    window.addEventListener('resize', NKStick.reload );
    window.addEventListener('scroll',  NKStick.reload );

    NKStick.loaded = true;
};

NKStick.reload = function() {

    var scroll_visible = $(document).height() > $(window).height();
    var scroll_top = $(document).scrollTop();

    // NKStickBN
    if ( scroll_visible ) {
        $('.NKStickBN').removeClass('NKStickBO');
    } else {
        $('.NKStickBN').addClass('NKStickBO');
    }

    if ( !scroll_visible ) return;

    // NKStickBD
    $('.NKStickBD').removeClass('NKStickBO');

    $.each( $('.NKStickBD'), function( key, value ) {
        if ( scroll_top + $(window).height() < $(this).offset().top + $(this).height() ) {
            $('.NKStickBD').addClass('NKStickBO');
        }
    });


    // NKStickTD
    $('.NKStickTD').removeClass('NKStickTO');

    $.each( $('.NKStickTD'), function( key, value ) {
        if ( scroll_top > $(this).offset().top ) {
            $('.NKStickTD').addClass('NKStickTO');
        }
    });



};
;var NKStorage = {};

if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before storage.js";
}

NKStorage.p = null;
NKStorage.np = null;


NKStorage.save = function( force ) {
    if ( force === true ) {
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
        NKStorage.p = JSON.parse('{}');
    }

    try {
        NKStorage.np = JSON.parse( sessionStorage.getItem('NKStorage') );
    } catch (e) {}

    if ( !NK.isset(NKStorage.np) ) {
        sessionStorage.setItem( 'NKStorage', JSON.stringify('{}') );
        NKStorage.np = JSON.parse('{}');
    }

    NKStorage.loaded = true;
};

// On page leave
NKStorage.oldLeaveHandler = window.onbeforeunload;
window.onbeforeunload = function (e) {
    if (NKStorage.oldLeaveHandler) NKStorage.oldLeaveHandler(e);

    if ( NKStorage.saveOnLeave == true) {
        NKStorage.save( true );
    }
};

