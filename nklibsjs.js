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

NK.backtrace = function ( msg = "" ) {
    let backtrace = new Error().stack.split("\n").slice(2).join("\n");
    console.log("Backtrace: " + msg + "\n" + backtrace);
}

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


if ( !NK.isset(() => $) ) {
    throw "Error, you must include jquery before using NKLibsJS";
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


window.addEventListener("load", function () { window.loaded = true; });

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
    if ( window.loaded === true ) NKActions.reload();

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
    toUtf8String: function( data ) {
        var result = '';
        for ( var i = 0; i < data.length; i++ ) {
            if ( data[i] < 0 || data[i] > 255 ) {
                console.error("Error NKCast.intByteArray.toUtf8String(): ("+data[i]+") Out of range [0..255]");
            }
            result += String.fromCharCode( data[i] );
        }
        return result;
    },

    toUtf16String: function( data ) {
        // The input is 8 bit.
        return NKCast.intByteArray.toUtf8String( data );
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

;var NKContextMenu = {};

if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before context_menu.js";
}

var event_listener = new NKEventListener();
NKContextMenu = { ...event_listener };



NKContextMenu.start = function() {
    if ( NK.isset(NKContextMenu.loaded) && NKContextMenu.loaded === true ) return;
    NKContextMenu.loaded = true;

    if ( typeof NKPosition === 'undefined' ) {
        throw "You must include position.js";
    }
    NKPosition.start();

    if ( $('#NKContextMenu').length < 1 ) {
        var d = document.createElement("div");
        d.setAttribute("id", "NKContextMenu");
        document.body.appendChild(d);
    }

    $('#NKContextMenu').hide();

    var lastTarget = null;

    document.addEventListener('contextmenu', function (e){
        var target = e.target;
        lastTarget = target;

        NKContextMenu.dispatchEvent('onOpen', {target: target});

        if ( $('#NKContextMenu').children().length === 0 ) {
            $('#NKContextMenu').hide();

        } else {
            $('#NKContextMenu').show();
            $('#NKContextMenu .NKSubmenu').hide();
            $("#NKContextMenu").css('left', NKPosition.getMouseX());
            $("#NKContextMenu").css('top', NKPosition.getMouseY());
            e.preventDefault();
        }

    });

    document.addEventListener('mouseup', function (e){
        if ( e.button === 2 ) return; //Right click
        if ( !$('#NKContextMenu').is(":visible") ) return;
        var target = e.target;

        if ( $(target).hasClass( "NKItem" ) ) {
            NKContextMenu.dispatchEvent('onClose', {
                id: target.getAttribute('data-id'),
                text: $(target).children('.NKTitle').text(),
                target: lastTarget,
                button: target
            });

        } else {
            NKContextMenu.dispatchEvent('onClose', {id: null, target: lastTarget, button: null});

        }

        $('#NKContextMenu').hide();


    });

    NKContextMenu.refresh();

};

NKContextMenu.setContent = function( content ) {
    var newContent = [];

    function createItem( id, name, icon_data, submenu_items ) {
        var item = $( document.createElement("div") );
        var icon = $( document.createElement("div") );
        var title = $( document.createElement("div") );
        item.addClass('NKItem');
        icon.addClass('NKIcon');
        title.addClass('NKTitle');

        item.attr('data-id', id);
        title.text( name );

        if ( !NK.empty(icon_data) ) {
            icon.append( icon_data );
            icon.css('margin-right', '5px' );
        }

        item.append(icon);
        item.append(title);

        if ( submenu_items !== null ) {
            var submenu = $( document.createElement("div") );
            submenu.addClass('NKSubmenu');
            submenu.append(submenu_items);
            item.addClass('NKArrow');
            item.append(submenu);
        }

        return item;
    }

    function fillData( aux ) {
        var item_list = [];

        for ( var i = 0; i < aux.length; i++ ) {
            var it = aux[i];

            if ( it.type === "item" ) {
                item_list.push( createItem(it.id, it.text, it.icon, null) );

            } else if ( it.type === "menu" ) {
                var submenu_items = fillData( it.items );
                item_list.push( createItem(it.id, it.text, it.icon, submenu_items) );

            } else if ( it.type === "divider" ) {
                var divider = $( document.createElement("div") );
                divider.addClass('NKDivider');
                item_list.push( divider );
            }

        }

        return item_list;
    }

    if ( !NK.empty(content) ) newContent = fillData( content );

    var wrapper = $("#NKContextMenu");
    wrapper.empty();
    wrapper.append(newContent);

    NKContextMenu.refresh();
}

NKContextMenu.refresh = function() {
    $('.NKItem').off();
    $('.NKSubmenu').hide();

    $('.NKItem').on('mouseenter', function () {
        var element = $(this);

        $(this).parent().find( '.NKSubmenu' ).hide(); //Hide all submenus

        var submenu = $(this).children( '.NKSubmenu' );

        if ( submenu.length !== 1 ) return; //Es un item normal, no un submenu

        submenu.show();
        submenu.css('left', element.width() + 30 );

    });

}


;var NKDrag = {};

//if ( typeof NK === 'undefined' ) {
//    throw "You must include base.js before drag.js";
//}

NKDrag.selection = { element: null };

NKDrag.start = function( reactable ) {
    if ( NK.isset(NKDrag.loaded) && NKDrag.loaded === true ) return;
    NKDrag.loaded = true;

    if ( typeof NKPosition === 'undefined' ) {
        throw "You must include position.js";
    }
    NKPosition.start();

    window.addEventListener('load', NKDrag.reload );
    if ( window.loaded === true ) NKDrag.reload();

    if ( reactable === true ) {
        NK.core.reloadOnDomChange( NKDrag );
    }

    $(document).on('mousemove', function() {
        if ( NKDrag.selection.element != null ) {
            NKDrag.selection.element.offset({
                left: NKPosition.getMouseX() - NKDrag.selection.offset[0],
                top: NKPosition.getMouseY() - NKDrag.selection.offset[1]
            });
        }
    });
};

NKDrag.reload = function() {

    $('.NKDrag_src').on('mousedown', function() {
        NKDrag.selection.element = $(this).closest('.NKDrag_dst');
        NKDrag.selection.offset = NKPosition.getMouse();

        var pos = NKDrag.selection.element.offset();
        NKDrag.selection.offset[0] -= pos.left;
        NKDrag.selection.offset[1] -= pos.top;
    });

    $('.NKDrag_src').on('mouseup', function() {
        NKDrag.selection.element = null;
    });

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

            var type = $(this).attr('type');

            if ( type === 'checkbox' ) {
                values[this.name] = $(this).prop('checked');
            } else {
                values[this.name] = $(this).val();
            }

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
        if ( NK.empty(field_data[this.name]) ) return;

        var type = $(this).attr('type');

        if ( type === 'checkbox' ) {
            $(this).prop('checked', (/^(true|1)$/i).test(field_data[this.name]));
        } else {
            $(this).val( field_data[this.name] );
        }

    });

};

NKForm.clearFields = function( form_selector ) {

    $( form_selector + ' :input' ).each(function() {
        var type = $(this).attr('type');

        if ( type === 'checkbox' ) {
            $(this).prop('checked', false);
        } else {
            $(this).val("");
        }

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
    $('body').append('<input type="file" id="NKtmpfile" accept="'+extension_list+'">');
    var element = document.getElementById("NKtmpfile");
    element.addEventListener('change', function (e) { callback( e.path[0].value ) } , false);
    $('#NKtmpfile').trigger('click');
    element.parentNode.removeChild(element);
};

NKForm.dirChooser = function( callback ) {
    $('body').append('<input type="file" id="NKtmpfile" webkitdirectory directory multiple/>');
    var element = document.getElementById("NKtmpfile");
    element.addEventListener('change', function (e) { callback( e.path[0].value ) } , false);
    $('#NKtmpfile').trigger('click');
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



;var NKModal = {};

NKModal.config = {
    add_close_icon: true,
    close_on_click_outside: true
};

NKModal.reload = function() {

    $('.NKModal .NKCloseIcon').off().on('click', function () {
        $(this).parents('.NKModal').hide();
    });

    if ( NKModal.config.close_on_click_outside ) {
        $('.NKModal').off().on('click', function ( e ) {
            if ( e.target !== this ) return;
            $(this).hide();
        });
    }

};

NKModal.show = function ( div_id ) {
    var id = '#' + div_id;

    if ( $(id).length === 0 ) {
        console.error( "Element " + id + " not found." );
        return;
    }

    var modal_content = $( '.NKModal ' + id );

    if ( modal_content.length === 0 ) {
        let close_icon = NKModal.config.add_close_icon ? '<i class="NKCloseIcon"></i>' : '';
        let new_html = '<div class="NKModal ' + div_id + '">' +
            '            <div class="NKContent">' +
            '                ' + close_icon +
            '            </div>' +
            '        </div>';

        $( id ).after( new_html );
        $( id ).appendTo( ".NKModal." + div_id + " .NKContent" );
        $( id ).show();

        NKModal.reload();
    }

    var modal = $( id ).parents('.NKModal');

    modal.show();
    modal_content.show(); //Hidded by the user
};

NKModal.hide = function ( div_id ) {
    var id = '#' + div_id;

    var modal_content = $( '.NKModal ' + id );
    if ( modal_content.length === 0 ) return;

    var modal = $( id ).parents('.NKModal');
    modal.hide();
};

NKModal.toggle = function ( div_id ) {
    var modal_content = $( '.NKModal #' + div_id );

    if ( modal_content.length === 0 ) {
        NKModal.show( div_id );
    } else {

        var modal = $( "#" + div_id ).parents('.NKModal');

        if ( modal.is(':visible') ) {
            NKModal.hide( div_id );
        } else {
            NKModal.show( div_id );
        }

    }

}
;var NKPopup = {};

if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before popup.js";
}

NKPopup.config = {
    allow_hover: true,
    mouse_margin: 5,
    box_margin: 5
};

NKPopup.start = function( reactable ) {
    if ( NK.isset(NKPopup.loaded) && NKPopup.loaded === true ) return;
    NKPopup.loaded = true;

    if ( typeof NKPosition === 'undefined' ) {
        throw "You must include position.js";
    }
    NKPosition.start();

    window.addEventListener('load', NKPopup.reload );
    if ( window.loaded === true ) NKPopup.reload();

    if ( reactable === true ) {
        NK.core.reloadOnDomChange( NKPopup );
    }

};


NKPopup.reload = function() {

    $('.NKPopup_dst').hide();

    $('.NKPopup_src').off();

    $('.NKPopup_src').on('mousemove', function(){
        var dst = $(this).siblings('.NKPopup_dst');
        var type = NK.isset( dst.attr('nk-type') ) ? dst.attr('nk-type') : "box";
        var align = NK.isset( dst.attr('nk-align') ) ? dst.attr('nk-align').split(",") : ["top","center"];
        var offset = NK.isset( dst.attr('nk-offset') ) ? dst.attr('nk-offset').split(",").map(Number) : [0,0];
        var arrowSize = NK.isset( dst.attr('nk-arrow-size') ) ? dst.attr('nk-arrow-size').split(",").map(Number)[1] : 0;
        var fixedX = dst.attr('nk-x');
        var fixedY = dst.attr('nk-y');

        dst.show();
        var pos = {};

        if ( type === "mouse" ) {
            var src_size = [10, 22];
            var src_pos = NKPosition.getMouse();
            var margin = NKPopup.config.mouse_margin;
        } else if ( type === "box" ) {
            var src_size = [$(this).outerWidth(), $(this).outerHeight()];
            var src_pos = [$(this).offset().left, $(this).offset().top];
            var margin = NKPopup.config.box_margin;
        } else {
            throw ( "Invalid type: " + type );
        }


        if ( align[0] === "top" || align[0] === "bottom" ) {

            if ( !NK.isset(align[1]) || align[1] === "center" ) {
                pos = {left: src_pos[0] - (dst.outerWidth()/2) + (src_size[0]/2), top: src_pos[1]  - dst.outerHeight() - arrowSize - margin};
            } else if ( align[1] === "left" ) {
                pos = {left: src_pos[0] - dst.outerWidth() + src_size[0], top: src_pos[1] - dst.outerHeight() - arrowSize - margin};
            } else if ( align[1] === "right" ) {
                pos = {left: src_pos[0], top: src_pos[1] - dst.outerHeight() - arrowSize - margin};
            } else {
                throw ("Invalid param '" + align[1] + "'");
            }


            if ( align[0] === "bottom" ) pos.top += src_size[1] + dst.outerHeight() + (arrowSize*2) + (margin*2);

        } else if ( align[0] === "left" || align[0] === "right" ) {

            if ( !NK.isset(align[1]) || align[1] === "middle" ) {
                pos = {left: src_pos[0] - dst.outerWidth() - margin  - arrowSize, top: src_pos[1] - (dst.outerHeight()/2) + (src_size[1]/2)};
            } else if ( align[1] === "top" ) {
                pos = {left: src_pos[0] - dst.outerWidth() - margin - arrowSize, top: src_pos[1] - dst.outerHeight() + src_size[1] };
            } else if ( align[1] === "bottom" ) {
                pos = {left: src_pos[0] - dst.outerWidth() - margin - arrowSize, top: src_pos[1] };
            } else {
                throw ("Invalid param '" + align[1] + "'");
            }

            if ( align[0] === "right" ) pos.left += src_size[0] + dst.outerWidth() + (arrowSize*2) + (margin*2);

        } else {
            throw ("Invalid param '" + align[0] + "'");
        }


        pos.left = pos.left + offset[0];
        pos.top = pos.top + offset[1];
        if ( NK.isset(fixedX) ) pos.left = fixedX;
        if ( NK.isset(fixedY) ) pos.top = fixedY;

        dst.offset(pos);

    });

    $('.NKPopup_src').on('mouseleave', function(){
        var self = $(this);

        if ( NKPopup.config.allow_hover ) {

            // Without timeout we can't know if mouse are hover popup window.
            window.setTimeout(function(){
                if( self.siblings('.NKPopup_dst:hover').length == 0 ) {
                    self.siblings('.NKPopup_dst').hide();
                } else {
                    self.siblings('.NKPopup_dst:hover').on('mouseleave', function(){
                        $(this).off().hide();
                    });
                }
            }, 50);

        } else {
            self.siblings('.NKPopup_dst').hide();
        }

    });


    // Add arrows
    NK.core.ignoreMutations( 1 ); // Avoid infinite reload loop if (reactable === true)

    $( ".NKPopup_dst" ).each(function( index ) {
        if ( !NK.isset( $(this).attr('nk-arrow-size') ) && !NK.isset( $(this).attr('nk-arrow-offset') ) ) return;
        var arrow_size = NK.isset( $(this).attr('nk-arrow-size') ) ? $(this).attr('nk-arrow-size').split(",").map(Number) : [10,7];
        //var arrow_offset = NK.isset( $(this).attr('nk-arrow-offset') ) ? $(this).attr('nk-arrow-offset') : 0;
        var dst_offset = NK.isset( $(this).attr('nk-offset') ) ? $(this).attr('nk-offset').split(",").map(Number) : [0,0];
        var align = NK.isset( $(this).attr('nk-align') ) ? $(this).attr('nk-align').split(",") : ["top","center"];
        var src = $(this).siblings('.NKPopup_src');

        var arrow_stroke = $( document.createElement("i") );
        arrow_stroke.addClass('NKPopup_arrow_stroke');
        $(this).append(arrow_stroke);

        var arrow_fill = $( document.createElement("i") );
        arrow_fill.addClass('NKPopup_arrow_fill');
        $(this).append(arrow_fill);

        var arrow = { border: 1, stroke_border: [0,0,0,0], fill_border: [0,0,0,0], stroke_colors: ['','','',''], fill_colors: ['','','',''], left: [50,50], top: [0,0] };

        if ( align[0] === "top" ) {
            arrow.border = parseInt($(this).css('border-bottom-width').split('px')[0]);
            arrow.stroke_border = [ (arrow_size[1]+arrow.border), ((arrow_size[0]/2)+arrow.border), 0, ((arrow_size[0]/2)+arrow.border) ]; // Height Width/2 0 Width/2
            arrow.fill_border = [ arrow_size[1], (arrow_size[0]/2), 0, (arrow_size[0]/2) ];
            arrow.top = [$(this).innerHeight(), $(this).innerHeight()];
            arrow.stroke_colors[0] = $(this).css('border-bottom-color');
            arrow.fill_colors[0] = $(this).css('background-color');

        } else if ( align[0] === "bottom" ) {
            arrow.border = parseInt($(this).css('border-top-width').split('px')[0]);
            arrow.stroke_border = [ 0, ((arrow_size[0]/2)+arrow.border), (arrow_size[1]+arrow.border), ((arrow_size[0]/2)+arrow.border) ]; // 0 Width/2 Height Width/2
            arrow.fill_border = [ 0, (arrow_size[0]/2), arrow_size[1], (arrow_size[0]/2) ];
            arrow.top = [(arrow_size[1]*-1)-1, (arrow_size[1]*-1)];
            arrow.stroke_colors[2] = $(this).css('border-top-color');
            arrow.fill_colors[2] = $(this).css('background-color');

        } else if ( align[0] === "right" ) {
            arrow.border = parseInt($(this).css('border-left-width').split('px')[0]);
            arrow.stroke_border = [ ((arrow_size[0]/2)+arrow.border), (arrow_size[1]+arrow.border), ((arrow_size[0]/2)+arrow.border), 0]; // Width/2 Height Width/2 0
            arrow.fill_border = [ (arrow_size[0]/2), arrow_size[1], (arrow_size[0]/2), 0];
            arrow.stroke_colors[1] = $(this).css('border-left-color');
            arrow.fill_colors[1] = $(this).css('background-color');
            arrow.left[0] = 0 - arrow_size[1] - arrow.border;
            arrow.left[1] = arrow.left[0] + arrow.border;

        } else if ( align[0] === "left" ) {
            arrow.border = parseInt($(this).css('border-right-width').split('px')[0]);
            arrow.stroke_border = [ ((arrow_size[0]/2)+arrow.border), 0, ((arrow_size[0]/2)+arrow.border), (arrow_size[1]+arrow.border) ]; // Width/2 0 Width/2 Height
            arrow.fill_border = [ (arrow_size[0]/2), 0, (arrow_size[0]/2), arrow_size[1] ];
            arrow.stroke_colors[3] = $(this).css('border-right-color');
            arrow.fill_colors[3] = $(this).css('background-color');
            arrow.left[0] = $(this).innerWidth();
            arrow.left[1] = arrow.left[0];
        }

        if ( align[1] === "left" ) {
            arrow.left[0] = $(this).outerWidth() - (src.outerWidth()/2) - (arrow_size[0]/2) - (arrow.border*2);
            arrow.left[1] = arrow.left[0] + arrow.border
        } else if ( align[1] === "center" ) {
            arrow.left[0] = ($(this).outerWidth()/2) - (arrow_size[0]/2) - (arrow.border*2);
            arrow.left[1] = arrow.left[0] + arrow.border;
        } else if ( align[1] === "right" ) {
            arrow.left[0] = (src.outerWidth()/2) - (arrow_size[0]/2) - (arrow.border*2);
            arrow.left[1] = arrow.left[0] + arrow.border
        } else if ( align[1] === "top" ) {
            arrow.top[0] = $(this).outerHeight() - (src.outerHeight()/2) - (arrow_size[0]/2)  - arrow.border;
            arrow.top[1] = arrow.top[0] + arrow.border;
        } else if ( align[1] === "middle" ) {
            arrow.top[0] = ($(this).outerHeight()/2) - (arrow_size[0]/2) - arrow.border;
            arrow.top[1] = arrow.top[0] + arrow.border;
        } else if ( align[1] === "bottom" ) {
            arrow.top[0] = (src.outerHeight()/2) - (arrow_size[0]/2) - arrow.border;
            arrow.top[1] = arrow.top[0] + arrow.border;
        }
        arrow.left[0] -= dst_offset[0];
        arrow.left[1] -= dst_offset[0];
        arrow.top[0] -= dst_offset[1];
        arrow.top[1] -= dst_offset[1];

        arrow_stroke
            .css('top', arrow.top[0])
            .css('left', arrow.left[0])
            .css('border-top-width', arrow.stroke_border[0])
            .css('border-right-width', arrow.stroke_border[1])
            .css('border-bottom-width', arrow.stroke_border[2])
            .css('border-left-width', arrow.stroke_border[3])
            .css('border-top-color', arrow.stroke_colors[0])
            .css('border-right-color', arrow.stroke_colors[1])
            .css('border-bottom-color', arrow.stroke_colors[2])
            .css('border-left-color', arrow.stroke_colors[3]);

        arrow_fill
            .css('top', arrow.top[1])
            .css('left', arrow.left[1])
            .css('border-top-width', arrow.fill_border[0])
            .css('border-right-width', arrow.fill_border[1])
            .css('border-bottom-width', arrow.fill_border[2])
            .css('border-left-width', arrow.fill_border[3])
            .css('border-top-color', arrow.fill_colors[0])
            .css('border-right-color', arrow.fill_colors[1])
            .css('border-bottom-color', arrow.fill_colors[2])
            .css('border-left-color', arrow.fill_colors[3]);


    });

};

;var NKPosition = {};

if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before position.js";
}


NKPosition.start = function() {
    if ( NK.isset(NKPosition.loaded) && NKPosition.loaded === true ) return;
    NKPosition.loaded = true;

    NKPosition.mouse = [0,0];

    window.addEventListener('mousemove', function (event) {
        NKPosition.mouse = [event.clientX, event.clientY];
    }, true);

};


NKPosition.getMouse = function( absolute ) {
    absolute = absolute || false;
    if ( absolute === true ) return NKPosition.mouse;
    return [ NKPosition.mouse[0] + window.scrollX, NKPosition.mouse[1] + window.scrollY ];
};

NKPosition.getMouseX = function( absolute ) {
    absolute = absolute || false;
    if ( absolute === true ) return NKPosition.mouse[0];
    return NKPosition.mouse[0] + window.scrollX;
};

NKPosition.getMouseY = function( absolute ) {
    absolute = absolute || false;
    if ( absolute === true ) return NKPosition.mouse[1];
    return NKPosition.mouse[1] + window.scrollY;
};

NKPosition.getScroll = function() {
    return [window.scrollX, window.scrollY];
};

NKPosition.getScrollX = function() {
    return window.scrollX;
};

NKPosition.getScrollY = function() {
    return window.scrollY;
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
};;var NKResize = {};

if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before context_menu.js";
}

var event_listener = new NKEventListener();
NKResize = { ...event_listener };

NKResize.config = {
    column_resize_cursor: 'col-resize',
    row_resize_cursor: 'row-resize'
};



NKResize.start = function( reactable ) {
    if ( NK.isset(NKResize.loaded) && NKResize.loaded === true ) return;
    NKResize.loaded = true;

    if ( typeof NKPosition === 'undefined' ) {
        throw "You must include position.js";
    }
    NKPosition.start();

    $( ".NKDrag_colums" ).each(function( i ) {
        var sizes = [];

        $(this).children('div').each(function ( j ) {
            $(this).attr('nk-i', j);
            var size = $(this).attr('nk-width');
            size = NK.empty(size) ? "auto" : size;
            sizes.push( size );
        });

        $(this).css( 'display', 'grid' );
        $(this).css( 'grid-template-columns', sizes.join(" ") );
    });

    $( ".NKDrag_rows" ).each(function( i ) {
        var sizes = [];

        $(this).children('div').each(function ( j ) {
            $(this).attr('nk-i', j);
            var size = $(this).attr('nk-height');
            size = NK.empty(size) ? "auto" : size;
            sizes.push( size );
        });

        $(this).css( 'display', 'grid' );
        $(this).css( 'grid-template-rows', sizes.join(" ") );
    });

    window.addEventListener('load', NKResize.reload );
    if ( window.loaded === true ) NKResize.reload();

    if ( reactable === true ) {
        NK.core.reloadOnDomChange( NKResize );
    }

};

NKResize.reload = function() {
    var self = this;
    $('.NKDrag_colums').off();

    NKResize.resizing_vertical_element = null;
    NKResize.resizing_horizontal_element = null;

    function calculateSizes( parent, child, new_width, columns ) {
        var curr_colums = [];
        var new_columns = [];
        var col_i = parseFloat(child.attr('nk-i'));

        if ( columns ) {
            curr_colums = parent.css('grid-template-columns').split(" ");
        } else {
            curr_colums = parent.css('grid-template-rows').split(" ");
        }

        if ( col_i === curr_colums.length-1 ) return curr_colums.join(" ");

        for ( var i = 0; i < curr_colums.length; i++ ) {
            if ( i === col_i ) {
                new_columns.push( new_width + "px" );

            } else if ( i === col_i + 1 ) {
                new_columns.push("auto");

            } else {
                new_columns.push( curr_colums[i] );

            }
        }

        return new_columns.join(" ");
    }


    function onMouse( e ) {
        var column_pos = [$(this).offset().left, $(this).offset().top];
        var mouse_pos = NKPosition.getMouse();
        var diff_pos = [mouse_pos[0]-column_pos[0], mouse_pos[1]-column_pos[1]];
        var div_size = [$(this).width(), $(this).height()];
        var in_vertical_border = (diff_pos[0] >= (div_size[0]-5));
        var in_horizontal_border = (diff_pos[1] >= (div_size[1]-5));
        var is_last_child = $(this).is(':last-child');
        var action = e.type;


        if ( action === 'mousedown' ) {
            if ( in_vertical_border && !is_last_child ) {
                NKResize.resizing_vertical_element = this;
                NKResize.start_columns = $(this).parent().css('grid-template-columns').split(" ");
                NKResize.start_pos = mouse_pos;
                NKResize.start_size = div_size;
            }
            if ( in_horizontal_border && !is_last_child ) {
                NKResize.resizing_horizontal_element = this;
                NKResize.start_rows = $(this).parent().css('grid-template-rows').split(" ");
                NKResize.start_pos = mouse_pos;
                NKResize.start_size = div_size;
            }

        } else if ( action === 'mousemove' ) {
            var r_v_e = NKResize.resizing_vertical_element;
            var r_h_e = NKResize.resizing_horizontal_element;

            if ( r_v_e !== null ) {
                var parent = $(r_v_e).parent();
                var border_right = parseInt($(r_v_e).css("border-right-width").slice(0, -2));
                var new_width = NKResize.start_size[0] + (mouse_pos[0] - NKResize.start_pos[0]) + border_right;

                parent.css('grid-template-columns', calculateSizes(parent, $(r_v_e), new_width, true));

                $(this).css('cursor', NKResize.config.column_resize_cursor);

            } else if ( r_h_e !== null ) {
                var parent = $(r_h_e).parent();
                var border_bottom = parseInt($(r_h_e).css("border-bottom-width").slice(0, -2));
                var new_height = NKResize.start_size[1] + (mouse_pos[1] - NKResize.start_pos[1]) + border_bottom;

                parent.css('grid-template-rows', calculateSizes(parent, $(r_h_e), new_height, false));

                $(this).css('cursor', NKResize.config.row_resize_cursor);

            } else {
                if ( in_vertical_border && !is_last_child ) {
                    $(this).css('cursor', NKResize.config.column_resize_cursor);

                } else  if ( in_horizontal_border && !is_last_child ) {
                    $(this).css('cursor', NKResize.config.row_resize_cursor);

                } else {
                    $(this).css('cursor', '');

                }

            }

        } else if ( action === 'mouseup' ) {
            var r_v_e = NKResize.resizing_vertical_element;
            var r_h_e = NKResize.resizing_horizontal_element;

            if ( r_v_e !== null ) {
                var sizes = $(r_v_e).parent().css('grid-template-columns').split(" ");
                var col_i = parseFloat($(r_v_e).attr('nk-i'));
                NKResize.dispatchEvent('onResize', {
                    start: NKResize.start_columns,
                    end: sizes,
                    i: col_i,
                    e: $(r_v_e)[0],
                    parent: $(r_v_e).parent()[0]
                });
            }
            if ( r_h_e !== null ) {
                var sizes = $(r_h_e).parent().css('grid-template-rows').split(" ");
                var col_i = parseFloat($(r_h_e).attr('nk-i'));
                NKResize.dispatchEvent('onResize', {
                    start: NKResize.start_rows,
                    end: sizes,
                    i: col_i,
                    e: $(r_h_e)[0],
                    parent: $(r_h_e).parent()[0]
                });
            }

            NKResize.resizing_vertical_element = null;
            NKResize.resizing_horizontal_element = null;
            $(this).css('cursor', '');
        }

       // console.log("diff_pos", diff_pos);
       // console.log("div_size", div_size);
    }

    $('.NKDrag_colums').on('mouseleave', function (){
        NKResize.resizing_vertical_element = null;
        $(this).css('cursor', '');
    });
    $('.NKDrag_rows').on('mouseleave', function (){
        NKResize.resizing_horizontal_element = null;
        $(this).css('cursor', '');
    });

    $('.NKDrag_colums div')
        .on('mousemove', onMouse)
        .on('mousedown', onMouse)
        .on('mouseup', onMouse);
    $('.NKDrag_rows div')
        .on('mousemove', onMouse)
        .on('mousedown', onMouse)
        .on('mouseup', onMouse);
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


;var NKStick = {};

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

        if ( $(this).css('position') === "fixed" ) {
            var top = parseInt($(this).css('top'));

            if ( scroll_top < top ) {
                $(this).css('margin-top', -scroll_top );
            } else {
                $(this).css('margin-top', -top );
            }

        } else {
            if ( scroll_top > $(this).offset().top ) {
                $('.NKStickTD').addClass('NKStickTO');
            }

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
        localStorage.setItem( 'NKStorage', JSON.stringify({}) );
        NKStorage.p = JSON.parse('{}');
    }

    try {
        NKStorage.np = JSON.parse( sessionStorage.getItem('NKStorage') );
    } catch (e) {}

    if ( !NK.isset(NKStorage.np) ) {
        sessionStorage.setItem( 'NKStorage', JSON.stringify({}) );
        NKStorage.np = JSON.parse('{}');
    }

    NKStorage.loaded = true;
};

NKStorage.clear = function() {
    localStorage.setItem( 'NKStorage', JSON.stringify({}) );
    NKStorage.p = JSON.parse('{}');
    sessionStorage.setItem( 'NKStorage', JSON.stringify({}) );
    NKStorage.np = JSON.parse('{}');
};

// On page leave
NKStorage.oldLeaveHandler = window.onbeforeunload;
window.onbeforeunload = function (e) {
    if (NKStorage.oldLeaveHandler) NKStorage.oldLeaveHandler(e);

    if ( NKStorage.saveOnLeave === true) {
        NKStorage.save( true );
    }
};

