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

NK.sleep = function (ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
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

};


;let NKArray = {};

NKArray.clone = function ( obj ) {
    return JSON.parse(JSON.stringify(obj));
}

// Arguments: Multiple arrays, get all possible combinations
NKArray.getCombinations = function(){
    if ( typeof arguments[0] !== "string" ) {
        console.error("First argument must be a string.");
        return [];
    }

    let join_str = arguments[0];
    let array_of_arrays = [];

    for ( let i = 1; i < arguments.length; i++ ) {
        if( !Array.isArray(arguments[i]) ) {
            console.error("One of the parameters is not an array.");
            return [];
        }
        array_of_arrays.push( arguments[i] );
    }


    function formCombination( odometer, array_of_arrays ){
        return odometer.reduce(
            function(accumulator, odometer_value, odometer_index){
                return "" + accumulator + array_of_arrays[odometer_index][odometer_value] + join_str;
            },
            ""
        );
    }

    function odometer_increment( odometer, array_of_arrays ){

        for ( let i_odometer_digit = odometer.length-1; i_odometer_digit >= 0; i_odometer_digit-- ){

            let maxee = array_of_arrays[i_odometer_digit].length - 1;

            if( odometer[i_odometer_digit] + 1 <= maxee ){
                odometer[i_odometer_digit]++;
                return true;
            }
            if ( i_odometer_digit - 1 < 0 ) return false;
            odometer[i_odometer_digit] = 0;

        }

    }


    let odometer = new Array( array_of_arrays.length ).fill( 0 );
    let output = [];

    let newCombination = formCombination( odometer, array_of_arrays );

    output.push( newCombination.slice(0, -1) );

    while ( odometer_increment( odometer, array_of_arrays ) ){
        newCombination = formCombination( odometer, array_of_arrays );
        output.push( newCombination.slice(0, -1) );
    }

    return output;
};


NKArray.mountTree = function ( data, id_name, parent_id_name, child_arr_name ) {
    let refs = {};
    let result = [];

    for (let i = 0; i < data.length; i++ ) {
        if ( typeof refs[data[i][id_name]] === 'undefined' ) {
            refs[data[i][id_name]] = {};
            refs[data[i][id_name]][child_arr_name] = [];
        }
        if ( typeof refs[data[i][parent_id_name]] === 'undefined' ) {
            refs[data[i][parent_id_name]] = {};
            refs[data[i][parent_id_name]][child_arr_name] = [];
        }
        refs[data[i][id_name]] = {...data[i], ...refs[data[i][id_name]]};

        if ( parseInt(data[i][parent_id_name]) === 0 ) {
            result.push(refs[data[i][id_name]]);
        } else {
            refs[data[i][parent_id_name]][child_arr_name].push(refs[data[i][id_name]]);
        }
    }

    return result;
};
;var NKCanvas = {};

NKCanvas.getPixelColor = function ( canvas, x, y ) {
    x = parseFloat(x);
    y = parseFloat(y);

    var ctx = canvas.getContext('2d');
    var data = ctx.getImageData(0, 0, canvas.width, canvas.height, {willReadFrequently: true}).data;
    var cw = canvas.width;

    var pixel = (cw * y) + x;
    var position = pixel * 4;

    return {
        rgba: [data[position], data[position + 1], data[position + 2], data[position + 3]]
    };
}

NKCanvas.searchPixelCoords = function ( canvas, rgba_color = [0, 0, 0] ) {

    var ctx = canvas.getContext('2d');
    var cw = canvas.width;

    var data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    var pos_i = -1;
    for ( var i = 0; i < data.length; i = i+4 ) {
        if ( data[i] === rgba_color[0] && data[i+1] === rgba_color[1] && data[i+2] === rgba_color[2] ) {
            pos_i = i;
            break;
        }
    }

    var pixel_i = pos_i / 4;
    var row = Math.floor(pixel_i / cw);
    var col = pixel_i % cw;

    return {x: col, y: row};
}


NKCanvas.extractPortion = function ( canvas, x, y, w, h, ctx_options = {} ) {
    var aux_canvas = document.createElement("canvas");
    var aux_ctx = aux_canvas.getContext("2d", ctx_options);

    aux_canvas.hidden = true;
    aux_canvas.width = w;
    aux_canvas.height = h;
    aux_ctx.drawImage(canvas, x, y, w, h, 0, 0, w, h);

    return aux_canvas;
}


NKCanvas.replaceColor = function ( canvas, old_color, new_color ) {
    var ctx = canvas.getContext('2d');
    var image_data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = image_data.data;
    var replace_times = 0;

    if ( old_color.length === 4 && new_color.length === 4 ) {
        for (var i = 0; i < data.length; i += 4) {
            if ( data[i] === old_color[0] && data[i+1] === old_color[1] && data[i+2] === old_color[2] && data[i+3] === old_color[3] ) {
                data[i] = new_color[0];
                data[i+1] = new_color[1];
                data[i+2] = new_color[2];
                data[i+3] = new_color[3];
                replace_times++;
            }
        }
    } else {
        for (var i = 0; i < data.length; i += 4) {
            if ( data[i] === old_color[0] && data[i+1] === old_color[1] && data[i+2] === old_color[2] ) {
                data[i] = new_color[0];
                data[i+1] = new_color[1];
                data[i+2] = new_color[2];
                replace_times++;
            }
        }
    }

    ctx.putImageData(image_data, 0, 0);
    return replace_times;
}



NKCanvas.compare = function ( canvas1, canvas2 ) {
    const ctx1 = canvas1.getContext("2d");
    const ctx2 = canvas2.getContext("2d");

    const width = canvas1.width;
    const height = canvas1.height;

    function comparePixels(pixel1, pixel2) {
        return (
            pixel1[0] === pixel2[0] &&
            pixel1[1] === pixel2[1] &&
            pixel1[2] === pixel2[2] &&
            pixel1[3] === pixel2[3]
        );
    }

    if (canvas1.width !== canvas2.width || canvas1.height !== canvas2.height) {
        return console.error("Los canvas tienen dimensiones diferentes.");
    }

    const imageData1 = ctx1.getImageData(0, 0, width, height);
    const imageData2 = ctx2.getImageData(0, 0, width, height);

    const data1 = imageData1.data;
    const data2 = imageData2.data;

    var differences = [];
    for (var i = 0; i < data1.length; i += 4) {
        const pixel1 = data1.slice(i, i + 4);
        const pixel2 = data2.slice(i, i + 4);

        if (!comparePixels(pixel1, pixel2)) {
            const x = (i / 4) % width;
            const y = Math.floor(i / 4 / width);
            differences.push({x: x, y: y, color_1: pixel1, color_2: pixel2});
        }
    }

    return differences;
};var NKCast = {};

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

;var NKClipboard = {};

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

    if ( document.body === null ) {
        throw "The \<body\> tag must be fully loaded before calling NKContextMenu.start()";
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


;let NKDate = {};


NKDate.set = function( date_obj, dd = null, mm = null, yyyy = null, h = null, m = null, s = null, ms = null ) {
    date_obj.setTime( new Date( yyyy, mm-1, dd, h, m, s, ms ).getTime() );
    return date_obj;
};

NKDate.clone = function ( date_obj ) {
    return new Date(date_obj.getTime());
};

NKDate.setFromString = function( date_obj, str_date, date_pattern ) {

    let date_parts = str_date.split(/(?:\/|-| |:|\\)+/);
    let pattern_parts = date_pattern.split(/(?:\/|-| |:|\\)+/);

    if ( date_parts.length !== pattern_parts.length ) {
        throw "Date (" + str_date + ") does not fit the pattern (" + date_pattern + ")";
    }

    date_obj.setHours(0,0,0,0);
    for ( let i = 0; i < pattern_parts.length; i++ ) {
        switch ( pattern_parts[i] ) {
            case 'DD': NKDate.setDay(date_obj, date_parts[i]); break;
            case 'MM': NKDate.setMonth(date_obj, date_parts[i]); break;
            case 'YYYY': NKDate.setYear(date_obj, date_parts[i]); break;
            case 'YY': NKDate.setYear(date_obj, date_parts[i]); break;
            case 'hh': NKDate.setHour(date_obj, date_parts[i]); break;
            case 'mm': NKDate.setMinute(date_obj, date_parts[i]); break;
            case 'sss': NKDate.setMilisecond(date_obj, date_parts[i]); break;
            case 'ss': NKDate.setSecond(date_obj, date_parts[i]); break;
        }
    }

    return date_obj;
};

NKDate.getString = function( date_obj, format = 'DD/MM/YYYY' ) {
    let result = format;

    result = result.replaceAll('DD', NKDate.getDay(date_obj, true));
    result = result.replaceAll('MM', NKDate.getMonth(date_obj, true));
    result = result.replaceAll('YYYY', NKDate.getYear(date_obj, true));
    result = result.replaceAll('YY', NKDate.getYear(date_obj, false));
    result = result.replaceAll('hh', NKDate.getHour(date_obj, true));
    result = result.replaceAll('mm', NKDate.getMinute(date_obj, true));
    result = result.replaceAll('sss', NKDate.getMillisecond(date_obj, true));
    result = result.replaceAll('ss', NKDate.getSecond(date_obj, true));

    return result;
};

NKDate.getDay = function( date_obj, two_digits = true ) {
    let d = date_obj.getDate();
    if ( two_digits ) d = d.toString().padStart(2, "0");
    return d;
};

NKDate.setDay = function( date_obj, day ) {
    if ( day === null ) return;
    date_obj.setDate( day );
    return date_obj;
};

NKDate.getMonth = function( date_obj, two_digits = true ) {
    let m = date_obj.getMonth()+1;
    if ( two_digits ) m = m.toString().padStart(2, "0");
    return m;
};

NKDate.setMonth = function( date_obj, month ) {
    if ( month === null ) return;
    date_obj.setMonth( parseInt(month)-1 );
    return date_obj;
};

NKDate.getYear = function( date_obj, four_digits = true ) {
    if ( four_digits ) return date_obj.getFullYear();
    let y = date_obj.getYear();
    if ( y > 100 ) y -= 100;
    return y;
};

NKDate.setYear = function( date_obj, year ) {
    if ( year === null ) return;
    if ( parseInt(year) < 100) year = "20"+year;
    date_obj.setFullYear( year );
    return date_obj;
};

NKDate.getHour = function( date_obj, two_digits = true ) {
    let h = date_obj.getHours();
    if ( two_digits ) h = h.toString().padStart(2, "0");
    return h;
};

NKDate.setHour = function( date_obj, hour ) {
    if ( hour === null ) return;
    date_obj.setHours( hour );
    return date_obj;
};

NKDate.getMinute = function( date_obj, two_digits = true ) {
    let m = date_obj.getMinutes();
    if ( two_digits ) m = m.toString().padStart(2, "0");
    return m;
};

NKDate.setMinute = function( date_obj, minute ) {
    if ( minute === null ) return;
    date_obj.setMinutes( minute );
    return date_obj;
};

NKDate.getSecond = function( date_obj, two_digits = true ) {
    let s = date_obj.getSeconds();
    if ( two_digits ) s = s.toString().padStart(2, "0");
    return s;
};

NKDate.setSecond = function( date_obj, second ) {
    if ( second === null ) return;
    date_obj.setSeconds( second );
    return date_obj;
};

NKDate.getMillisecond = function( date_obj, three_digits = true ) {
    let ms = date_obj.getMilliseconds();
    if ( three_digits ) ms = ms.toString().padStart(3, "0");
    return ms;
};

NKDate.setMilisecond = function( date_obj, milisecond ) {
    if ( milisecond === null ) return;
    date_obj.setMilliseconds( milisecond );
    return date_obj;
};

NKDate.getUnixTimestamp = function ( date_obj ) {
    return date_obj.getTime();
};

NKDate.addMonths = function( date_obj, months ) {
    date_obj.setMonth(date_obj.getMonth() + months);
    return date_obj;
};

NKDate.addHours = function ( date_obj, hours ) {
    return NKDate.addMiliseconds(date_obj, (hours * 60) * 60000);
};

NKDate.addMinutes = function ( date_obj, minutes ) {
    return NKDate.addMiliseconds(date_obj, minutes * 60 * 1000);
};

NKDate.addSeconds = function ( date_obj, seconds ) {
    return NKDate.addMiliseconds(date_obj, seconds * 1000);
};

NKDate.addMiliseconds = function ( date_obj, miliseconds ) {
    date_obj.setTime( date_obj.getTime() + miliseconds );
    return date_obj;
};

NKDate.print = function ( date_obj ) {
    console.log( date_obj.toLocaleString() );
};

NKDate.equals = function ( date_1, date_2, compare_time = true ) {
    if ( compare_time ) return (date_1.getTime() === date_2.getTime());
    if ( date_1.getDate() !== date_2.getDate() ) return false;
    if ( date_1.getMonth() !== date_2.getMonth() ) return false;
    if ( date_1.getFullYear() !== date_2.getFullYear() ) return false;
    return true;
}

NKDate.daysInMonth = function( year, month ) {
    if ( month === 0 ) throw "Month 0 does not exist, January is month 1.";
    return 32 - new Date(year, month-1, 32).getDate();
};


// start_on_sunday = false; 0: Monday, 1: Tuesday, 2: Wednesday ...
// start_on_sunday = true;  0: Sunday, 1: Monday, 2: Tuesday, 3: Wednesday ...
NKDate.firstDayOfMonth = function ( year, month, start_on_sunday = false ) {
    if ( month === 0 ) throw "Month 0 does not exist, January is month 1.";
    let fd = new Date(year, month-1).getDay();
    if ( start_on_sunday ) return fd;
    return (fd === 0) ? 6 : fd-1;
};


NKDate.getDatesBetween = function ( date_start_obj, date_end_obj = null ) {
    if ( date_end_obj === null ) date_end_obj = date_start_obj;

    let dateArray = [];
    let currentDate = new Date(date_start_obj);

    while ( currentDate <= date_end_obj ) {
        dateArray.push( new Date( currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0,0,0,0 ) );
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dateArray;
};



NKDate.getCalendar = function( year, month, add_empty_days = true, start_on_sunday = false) {
    let calendar = [];
    let today = new Date();
    let current_year_month = (year === today.getFullYear() && month === today.getMonth()+1);

    if ( add_empty_days ) {
        let firstDay = NKDate.firstDayOfMonth(year, month, start_on_sunday);
        for ( let i = 0; i < firstDay; i++ ) calendar.push({day: "", today: false, date: null});
    }

    let daysInMonth = NKDate.daysInMonth(year, month);
    for ( let i = 0; i < daysInMonth; i++ ) {
        calendar.push({day: i+1, today: (current_year_month && i+1 === today.getDate()), date: new Date(year, month-1, i+1)});
    }

    return calendar;
};

NKDate.setCalendarTasks = function ( calendar, tasks, cal_date_name, cal_tasklist_name, task_startdate_name, task_enddate_name ) {

    for ( let i = 0; i < tasks.length; i++ ) {
        let task = tasks[i];
        let task_start = ( task[task_startdate_name] === "0000-00-00 00:00:00" ) ? null : new Date(task[task_startdate_name].replace(/-/g, "/")).getTime();
        let task_end = ( task[task_enddate_name] === "0000-00-00 00:00:00" ) ? null : new Date(task[task_enddate_name].replace(/-/g, "/")).getTime();

        for ( let c = 0; c < calendar.length; c++ ) {
            let cal = calendar[c];
            if ( cal[cal_date_name] === null ) continue;

            let day_start = cal[cal_date_name].getTime();
            let day_end = day_start + 86399999;

            if ( task_end === null ) {
                if (task_start >= day_start && task_start <= day_end) { //1day = 86400000ms
                    cal[cal_tasklist_name].push(NKObject.clone(task));
                }
            } if ( task_start === null ) {
                console.error("Task with date_end without date_start");
            } else {
                if ( task_end >= day_start && task_start <= day_end) {
                    cal[cal_tasklist_name].push(NKObject.clone(task));
                }
            }
        }
    }
};
;NKDomTemplate = {};
NKDom = {};

NKDomTemplate.register = function ( template_name, template_code ) {

    if ( typeof customElements.get(template_name) !== "undefined" ) {
        console.error("Error, " + template_name + " is already registered.");
        return;
    }

    customElements.define(template_name,
        class extends HTMLElement {
            connectedCallback() {
                this.attachShadow({mode: 'open'});
                this.shadowRoot.innerHTML = template_code;
            }
        }
    );

}


NKDomTemplate.start = function () {
    let doc_templates = document.querySelectorAll( 'template' );

    for ( let i = 0; i < doc_templates.length; i++ ) {
        NKDomTemplate.register( doc_templates[i].attributes.name.value, doc_templates[i].innerHTML );
    }

}


NKDomTemplate.fill = function ( template_name, template_data ) {
    let content_array = Array.isArray(template_data) ? template_data : [template_data];
    let html_result = "";

    for ( let i = 0; i < content_array.length; i++ ) {

        html_result += "<" + template_name + ">";

        for (const [key, value] of Object.entries(content_array[i])) {
            html_result += '<span slot="' + key + '">' + value + '</span>';
        }

        html_result += "</" + template_name + ">";

    }

    return html_result;
}

NKDom.parseIdOrClass = function ( element_id_or_class ) {
    let result = {
        is_class: false,
        is_id: false,
        name: ""
    };
    if ( element_id_or_class.length === 0 ) return result;

    result.is_id = ( element_id_or_class[0] === "#" );
    result.is_class = ( element_id_or_class[0] === "." );
    result.name = element_id_or_class.slice(1);

    return result;
}

NKDom.select = function ( element_id_or_class ) {
    let result = document.querySelectorAll( element_id_or_class );
    return ( element_id_or_class[0] === "#" ) ? result[0] : result;
}


//Para uso interno
NKDom.getElementList = function ( element ) {
    if ( typeof element === 'string' ) element = NKDom.select( element );
    if ( element instanceof NodeList ) return element;
    if ( element instanceof Node ) return [element];
    return [];
}

//Para uso interno
NKDom.getElement = function ( element ) {
    if ( typeof element === 'string' ) element = NKDom.select( element );
    if ( element instanceof NodeList && element.length > 0 ) return element[0];
    if ( element instanceof Node ) return element;
}

// tag_name = "div"
NKDom.getChildren = function ( element, tag_name = "" ) {
    let result = [];
    tag_name = tag_name.toLowerCase();

    NKDom.getElementList(element).forEach(function( el, i ) {
        for ( let i = 0; i < el.children.length; i++ ) {
            if ( tag_name === "" || el.children[i].tagName.toLowerCase() === tag_name ) {
                result.push(el.children[i]);
            }
        }
    });

    //Pasamos el array a NodeList
    var emptyNodeList = document.createDocumentFragment().childNodes;
    var resultNodeList = Object.create(emptyNodeList, {
        'length': {value: result.length, enumerable: false},
        'item': {"value": function(i) {return this[+i || 0];}, enumerable: false}
    });
    result.forEach((v, i) => resultNodeList[i] = v);

    return resultNodeList;
}

NKDom.getClosest = function ( element, id_or_class ) {
    element = NKDom.getElement(element);
    id_or_class = NKDom.parseIdOrClass(id_or_class);

    if ( id_or_class.is_class ) {
        while (element && !element.classList.contains(id_or_class.name)) element = element.parentNode;
    } else if ( id_or_class.is_id ) {
        while (element && element.id !== id_or_class.name) element = element.parentNode;
    }

    return element;
}


NKDom.setCss = function ( element, css_property_name, css_property_value ) {
    let css_prop = css_property_name.replace(/-([a-z])/g, function(match, letra) {return letra.toUpperCase();});

    NKDom.getElementList(element).forEach(function( el, i ) {
        el.style[css_prop] = css_property_value;
    });
}

NKDom.getCss = function ( element, css_property_name ) {
    let css_prop = css_property_name.replace(/-([a-z])/g, function(match, letra) {return letra.toUpperCase();});

    let result = [];

    NKDom.getElementList(element).forEach(function( el, i ) {
        result.push( window.getComputedStyle(el)[css_prop] );
    });

    if ( result.length === 0 ) return;
    if ( result.length === 1 ) return result[0];
    return result;
}

NKDom.setAttribute = function ( element, attribute_name, attribute_value ) {
    NKDom.getElementList(element).forEach(function( el, i ) {
        el.setAttribute(attribute_name, attribute_value);
    });
}

NKDom.getAttribute = function ( element, attribute_name ) {
    element = NKDom.getElementList(element);
    if ( element.length === 0 ) return;

    return element[0].getAttribute( attribute_name );
}

NKDom.addClass = function ( element, class_name ) {
    NKDom.getElementList(element).forEach(function( el, i ) {
        el.classList.add(class_name);
    });
}

NKDom.removeClass = function ( element, class_name ) {
    NKDom.getElementList(element).forEach(function( el, i ) {
        el.classList.remove(class_name);
    });
}

NKDom.hasClass = function ( element, class_name ) {
    let elements = NKDom.getElementList(element);

    for ( var i = 0; i < elements.length; i++ ) {
        if ( elements[i].classList.contains(class_name) ) return true;
    }

    return false;
}

NKDom.setHtml = function ( element, element_html ) {
    NKDom.getElementList(element).forEach(function( el, i ) {
        el.innerHTML = element_html;
    });
}

NKDom.appendHtml = function ( element_id_or_class, element_html ) {
    NKDom.getElementList(element).forEach(function( el, i ) {
        el.insertAdjacentHTML("afterend", element_html);
    });
}

NKDom.addEventListener = function ( element, event_name, event_listener_function, remove_previous = true ) {
    NKDom.getElementList(element).forEach(function( el, i ) {
        if ( remove_previous ) el.removeEventListener(event_name, event_listener_function);
        el.addEventListener(event_name, event_listener_function);
    });
};let NKDrag = {};

let event_listener = new NKEventListener();
NKDrag = { ...event_listener };

NKDrag.selection = { element: null };

NKDrag.start = function( reactable ) {
    if ( NK.isset(NKDrag.loaded) && NKDrag.loaded === true ) return;
    NKDrag.loaded = true;

    if ( typeof NKPosition === 'undefined' ) {
        throw "You must include NKPosition.js";
    }
    NKPosition.start();

    window.addEventListener('load', NKDrag.reload );
    if ( window.loaded === true ) NKDrag.reload();

    if ( reactable === true ) {
        NK.core.reloadOnDomChange( NKDrag );
    }
    function onMouseMove(e) {
        if ( NKDrag.selection.element != null ) {
            let left = NKPosition.getMouseX() - NKDrag.selection.offset[0];
            let top = NKPosition.getMouseY() - NKDrag.selection.offset[1];

            NKDrag.selection.element.style.left = left + "px";
            NKDrag.selection.element.style.top = top+ "px";

            NKDrag.dispatchEvent('onDrag', {
                e: NKDrag.selection.element,
                position: {left: left, top: top}
            });
        }
    }

    NKDom.addEventListener( document, 'mousemove', onMouseMove );
};

NKDrag.reload = function() {

    function onMouseDown( e ) {
        NKDrag.selection.element = NKDom.getClosest(this, '.NKDrag_dst');
        NKDrag.selection.offset = NKPosition.getMouse();

        // let pos = NKDrag.selection.element.offset;
        NKDrag.selection.offset[0] -= NKDrag.selection.element.offsetLeft;
        NKDrag.selection.offset[1] -= NKDrag.selection.element.offsetTop;
    }

    NKDom.addEventListener( '.NKDrag_src', 'mousedown', onMouseDown );

    function onMouseUp( e ) {
        NKDrag.selection.element = null;
    }

    NKDom.addEventListener( '.NKDrag_src', 'mouseup', onMouseUp );

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
NKForm.fileChooser = function( callback, extension_list, multiple = false, base64 = true ) {
    extension_list = extension_list || "";
    multiple = multiple ? "multiple" : "";
    $('body').append('<input type="file" id="NKtmpfile" accept="'+extension_list+'" ' + multiple +'>');
    var element = document.getElementById("NKtmpfile");
    element.addEventListener('change', async function (e) {
        var file_list = await NKForm._cleanFileList(this.files, base64);
        callback( file_list );
    } , false);
    $('#NKtmpfile').trigger('click');
    element.parentNode.removeChild(element);
};

NKForm.dirChooser = function( start_in, callback ) {
    window.showDirectoryPicker({startIn: start_in}).then((e) => {
        callback( e );
    });
};


NKForm.postFile = function( url, file_obj, args, cbk ) {
    var form_data = new FormData();
    form_data.append( 'file[]', file_obj );
    for ( var key in args ) {
        form_data.append( key, args[key] );
    }

    $.ajax({
        type: 'POST',
        url: url,
        contentType: false,
        processData: false,
        data: form_data,
        success: function ( response ) {
            cbk( response );
        }
    });
}

NKForm.fileDropzone = function ( object, cbk, base64 = true ) {

    object.addEventListener("drop", async function ( e ) {
        e.preventDefault();

        var files = e.dataTransfer.files;

        if ( files.length === 0 ) console.error( "Unable to handle dragged files." );

        var file_list = await NKForm._cleanFileList(files, base64);

        cbk( file_list );
    });

    object.addEventListener("dragover", function ( e ) {
        e.preventDefault();
    });

};

NKForm._cleanFileList = async function ( files, base64 = true ) {
    var result = [];

    for ( var i = 0; i < files.length; i++ ) {
        var file = files[i];
        var r = {
            file_obj: file,
            name: file.name,
            size: file.size,
            type: file.type,
            lastModifiedDate: file.lastModifiedDate,
            lastModified: file.lastModified
        }
        if ( base64 ) r.base64 = await NKForm.getFileBase64( file );

        result.push(r);
    }

    return result;
}

NKForm.getFileBase64 = function ( file_obj ) {

    return new Promise(function( resolve, reject ) {
        var fr = new FileReader();
        fr.onload = function(e) { resolve( this.result ); };
        fr.onerror = function ( e ) { reject(); };

        fr.readAsDataURL( file_obj );
    });

};let NKLoader = {};

if ( typeof NK === 'undefined' ) {
    throw "You must include NKBase.js before loader.js";
}


NKLoader.setSelector = function( loader_selector, error_selector ) {

    NKDom.setCss( loader_selector, 'display', 'none' );
    NKDom.setCss( error_selector, 'display', 'none' );

    window.setInterval(function(){
        if ($.active > 0) {
            NKDom.setCss( loader_selector, 'display', 'block' );
        } else {
            $.active = 0;
            NKDom.setCss( loader_selector, 'display', 'none' );
        }
    }, 500);

    $( document ).ajaxError(function() {
        $.active = 0; // AJAX Post abort.
    });

    if ( document.domain != "localhost" ) {
        window.onerror = function(message, url, lineNumber) {
            $.active = 0;

            if ( NK.isset(error_selector) ) {
                NKDom.setCss( error_selector, 'display', 'block' );
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
;var NKNotification = {};
NKNotification.timeout = null;

if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before loader.js";
}


NKNotification.start = function() {

    if ( $('#NKNotification').length < 1 ) {
        var close_icon_html = '<svg onclick="NKNotification.hide()" class="close-icon" xmlns="http://www.w3.org/2000/svg" stroke="black" width="20" height="20" viewBox="0 0 24 24" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

        var wrapper = document.createElement("div");
        var content = document.createElement("div");

        wrapper.setAttribute("id", "NKNotification");
        wrapper.style.display = "none";
        wrapper.innerHTML = close_icon_html;

        content.setAttribute("class", "content_wrapper");
        wrapper.append(content);

        document.body.appendChild(wrapper);
    }

}

NKNotification.show = function( content = ["Title", "Subtitle"], ms = 0 ) {
    clearTimeout(NKNotification.timeout);

    document.getElementById("NKNotification").style.display = "block";

    $('#NKNotification .content_wrapper').html("");

    for ( var i = 0; i < content.length; i++ ) {
        if ( typeof content[i] === "string" ) {
            var aux = document.createElement("div");
            aux.setAttribute("class", "content");
            if ( i === 0 ) aux.setAttribute("class", "content bold");
            aux.innerHTML = content[i];
            $('#NKNotification .content_wrapper').append(aux);

        } else {
            $('#NKNotification .content_wrapper').append(content[i]);

        }

    }



    if ( ms > 0 ) NKNotification.timeout = setTimeout(NKNotification.hide, ms);

}

NKNotification.hide = function() {
    clearTimeout(NKNotification.timeout);
    document.getElementById("NKNotification").style.display = "none";

}
;let NKObject = {};

NKObject.clone = function ( obj ) {
    return JSON.parse(JSON.stringify(obj));
}

NKObject.setValue = function ( start_obj, str_obj_path, value ) {
    let path_parts = str_obj_path.split(".");
    let aux_path = "start_obj";

    for ( let i = 0; i < path_parts.length; i++ ) {
        aux_path += "." + path_parts[i];
        if ( eval("typeof " + aux_path) === "undefined" ) eval(aux_path + " = {}");
    }

    eval(aux_path + " = " + JSON.stringify(value));
}

NKObject.getValue = function ( variable, default_value = undefined ) {
    if ( typeof variable === 'undefined' ) return default_value;
    if ( variable == null ) return default_value;
    if ( typeof variable === 'function' ) {
        try {
            return variable();
        } catch (e) {
            return default_value;
        }
    }
    return variable;
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
;class NKPromise {

    constructor() {
        let aux_resolve = null;
        let aux_reject = null;
        let p = new Promise((resolve, reject) => {
            aux_resolve = resolve;
            aux_reject = reject;
        });
        p.resolve = aux_resolve;
        p.reject = aux_reject;
        return p;
    }

};let NKResize = {};

if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before context_menu.js";
}

let event_listener = new NKEventListener();
NKResize = { ...event_listener };

NKResize.config = {
    column_resize_cursor: 'col-resize',
    row_resize_cursor: 'row-resize'
};



NKResize.start = function( reactable ) {
    if ( NKResize.loaded === true ) return;
    NKResize.loaded = true;

    if ( typeof NKDom === 'undefined' ) {
        throw "You must include NKDom.js";
    }
    if ( typeof NKPosition === 'undefined' ) {
        throw "You must include NKPosition.js";
    }
    NKPosition.start();

    window.addEventListener('load', NKResize.reload );
    if ( window.loaded === true ) NKResize.reload();

    if ( reactable === true ) {
        NK.core.reloadOnDomChange( NKResize );
    }

};

NKResize.reload = function() {

    let cols = NKDom.select(".NKResize_columns");
    let rows = NKDom.select(".NKResize_rows");

    cols.forEach(function( col, i ) {
        let sizes = [];

        let children = NKDom.getChildren(col, 'div');

        children.forEach(function ( child, j ) {
            NKDom.setAttribute( child, 'nk-i', j );
            NKDom.setCss( child, 'overflow', 'hidden' );

            let size = NKDom.getAttribute( child, 'nk-width' );
            size = NK.empty(size) ? "auto" : size;
            sizes.push( size );
        });

        NKDom.setCss( col, 'display', 'grid' );
        NKDom.setCss( col, 'grid-template-columns', sizes.join(" ") );
        NKDom.setCss( col, 'overflow', 'hidden' );
    });

    rows.forEach(function( row, i ) {
        let sizes = [];

        let children = NKDom.getChildren(row, 'div');

        children.forEach(function ( child, j ) {
            NKDom.setAttribute( child, 'nk-i', j );
            NKDom.setCss( child, 'overflow', 'hidden' );

            let size = NKDom.getAttribute( child, 'nk-height' );
            size = NK.empty(size) ? "auto" : size;
            sizes.push( size );
        });

        NKDom.setCss( row, 'display', 'grid' );
        NKDom.setCss( row, 'grid-template-rows', sizes.join(" ") );
        NKDom.setCss( row, 'overflow', 'hidden' );
    });

    NKResize.resizing_vertical_element = null;
    NKResize.resizing_horizontal_element = null;

    function calculateSizes( parent, child, new_width, columns ) {
        let curr_colums = [];
        let new_columns = [];
        let col_i = parseInt( NKDom.getAttribute(child, 'nk-i') );

        if ( columns ) {
            curr_colums = NKDom.getCss(parent, 'grid-template-columns').split(" ");
        } else {
            curr_colums = NKDom.getCss(parent, 'grid-template-rows').split(" ");
        }

        if ( col_i === curr_colums.length-1 ) return curr_colums.join(" ");

        for ( let i = 0; i < curr_colums.length; i++ ) {
            if ( i === col_i ) {
                new_columns.push( new_width + "px" );

            } else if ( i === col_i + 1 ) {
                new_columns.push("auto");

            } else {
                new_columns.push( curr_colums[i] );

            }
        }

        return new_columns;
    }


    function onMouse( e ) {
        let column_pos = [this.offsetLeft, this.offsetTop];
        let mouse_pos = NKPosition.getMouse();
        let diff_pos = [mouse_pos[0]-column_pos[0], mouse_pos[1]-column_pos[1]];
        //let div_size = [this.offsetWidth, this.offsetHeight];
        let div_size = [this.clientWidth, this.clientHeight];
        let in_vertical_border = (diff_pos[0] >= (div_size[0]-5));
        let in_horizontal_border = (diff_pos[1] >= (div_size[1]-5));
        let is_last_child = (this === this.parentNode.lastElementChild);
        let action = e.type;

        if ( action === 'mousedown' ) {
            if ( in_vertical_border && !is_last_child ) {
                NKResize.resizing_vertical_element = this;
                NKResize.start_columns = NKDom.getCss( this.parentNode, 'grid-template-columns' ).split(" ");
                NKResize.start_pos = mouse_pos;
                NKResize.start_size = div_size;
                NKDom.addClass( NKDom.getChildren(NKDom.getChildren('.NKResize_columns', 'div')), "NKResize_disable_temp" );
            }
            if ( in_horizontal_border && !is_last_child ) {
                NKResize.resizing_horizontal_element = this;
                NKResize.start_rows = NKDom.getCss( this.parentNode, 'grid-template-rows' ).split(" ");
                NKResize.start_pos = mouse_pos;
                NKResize.start_size = div_size;
                NKDom.addClass( NKDom.getChildren(NKDom.getChildren('.NKResize_rows', 'div')), "NKResize_disable_temp" );
            }


        } else if ( action === 'mousemove' ) {
            let r_v_e = NKResize.resizing_vertical_element;
            let r_h_e = NKResize.resizing_horizontal_element;

            if ( r_v_e !== null ) {
                let parent = r_v_e.parentNode;
                let border_right = parseInt( NKDom.getCss(r_v_e, "border-right-width") );
                let new_width = NKResize.start_size[0] + (mouse_pos[0] - NKResize.start_pos[0]) + border_right;
                let new_sizes = calculateSizes(parent, r_v_e, new_width, true);

                NKDom.setCss( parent, 'grid-template-columns', new_sizes.join(" ") );

                NKDom.getChildren(parent, 'div').forEach(function (child, i) {
                    NKDom.setAttribute( child, 'nk-width', new_sizes[i] );
                });

                NKDom.setCss( this, 'cursor', NKResize.config.column_resize_cursor );

            } else if ( r_h_e !== null ) {
                let parent = r_h_e.parentNode;
                let border_bottom = parseInt( NKDom.getCss(r_h_e, "border-bottom-width") );
                let new_height = NKResize.start_size[1] + (mouse_pos[1] - NKResize.start_pos[1]) + border_bottom;
                let new_sizes = calculateSizes(parent, r_h_e, new_height, false);

                NKDom.setCss( parent, 'grid-template-rows', new_sizes.join(" ") );

                NKDom.getChildren(parent, 'div').forEach(function (child, i) {
                    NKDom.setAttribute( child, 'nk-height', new_sizes[i] );
                });

                NKDom.setCss( this, 'cursor', NKResize.config.row_resize_cursor );

            } else {
                if ( in_vertical_border && !is_last_child && NKDom.hasClass( this.parentNode, 'NKResize_columns' ) ) {
                    NKDom.setCss( this, 'cursor', NKResize.config.column_resize_cursor );

                } else  if ( in_horizontal_border && !is_last_child && NKDom.hasClass( this.parentNode, 'NKResize_rows' ) ) {
                    NKDom.setCss( this, 'cursor', NKResize.config.row_resize_cursor );

                } else {
                    NKDom.setCss( this, 'cursor', '' );

                }

            }

        } else if ( action === 'mouseup' ) {
            let r_v_e = NKResize.resizing_vertical_element;
            let r_h_e = NKResize.resizing_horizontal_element;

            if ( r_v_e !== null ) {
                let sizes = NKDom.getCss( r_v_e.parentNode, 'grid-template-columns' ).split(" ");
                let col_i = parseInt( NKDom.getAttribute(r_v_e, 'nk-i') );
                NKResize.dispatchEvent('onResize', {
                    start: NKResize.start_columns,
                    end: sizes,
                    i: col_i,
                    e: r_v_e,
                    parent: r_v_e.parentNode
                });
                NKDom.removeClass( NKDom.getChildren(NKDom.getChildren('.NKResize_columns', 'div')), "NKResize_disable_temp" );
            }
            if ( r_h_e !== null ) {
                let sizes = NKDom.getCss( r_h_e.parentNode, 'grid-template-rows' ).split(" ");
                let col_i = parseInt( NKDom.getAttribute(r_h_e, 'nk-i') );
                NKResize.dispatchEvent('onResize', {
                    start: NKResize.start_rows,
                    end: sizes,
                    i: col_i,
                    e: r_h_e,
                    parent: r_h_e.parentNode
                });
                NKDom.removeClass( NKDom.getChildren(NKDom.getChildren('.NKResize_rows', 'div')), "NKResize_disable_temp" );
            }

            NKResize.resizing_vertical_element = null;
            NKResize.resizing_horizontal_element = null;
            NKDom.setCss( this, 'cursor', '' );

        }

    }


    function onMouseLeaveColumns() {
        NKResize.resizing_vertical_element = null;
        NKDom.setCss( this, 'cursor', '' );
    }
    function onMouseLeaveRows() {
        NKResize.resizing_horizontal_element = null;
        NKDom.setCss( this, 'cursor', '' );
    }

    NKDom.addEventListener('.NKResize_columns', 'mouseleave', onMouseLeaveColumns);
    NKDom.addEventListener('.NKResize_rows', 'mouseleave', onMouseLeaveRows);

    NKDom.addEventListener(NKDom.getChildren( '.NKResize_columns', 'div' ), 'mousemove', onMouse);
    NKDom.addEventListener(NKDom.getChildren( '.NKResize_columns', 'div' ), 'mousedown', onMouse);
    NKDom.addEventListener(NKDom.getChildren( '.NKResize_columns', 'div' ), 'mouseup', onMouse);

    NKDom.addEventListener(NKDom.getChildren( '.NKResize_rows', 'div' ), 'mousemove', onMouse);
    NKDom.addEventListener(NKDom.getChildren( '.NKResize_rows', 'div' ), 'mousedown', onMouse);
    NKDom.addEventListener(NKDom.getChildren( '.NKResize_rows', 'div' ), 'mouseup', onMouse);
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


;let NKStick = {};

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
;var NKStorage = {};

if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before storage.js";
}

var event_listener = new NKEventListener();
NKStorage = { ...event_listener };

NKStorage.p = null;
NKStorage.np = null;


NKStorage.save = function( force ) {
    if ( force === true || NKStorage.is_safari ) {
        localStorage.setItem( 'NKStorage', JSON.stringify(NKStorage.p) );
        sessionStorage.setItem( 'NKStorage', JSON.stringify(NKStorage.np) );
        NKStorage.saveOnLeave = false;
    } else {
        NKStorage.saveOnLeave = true;
    }
};


NKStorage.start = function( save_on_leave = true ) {
    NKStorage.saveOnLeave = save_on_leave;

    if ( NK.isset(NKStorage.loaded) && NKStorage.loaded === true ) return;

    NKStorage.is_safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

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

NKStorage.broadcast = function ( path ) {
    var path_parts = path.split(".");
    var path_aux = [];
    for ( var i in path_parts ) {
        path_aux.push( path_parts[i] );
        NKStorage.dispatchEvent( path_aux.join(".") );
    }
}

NKStorage.listen = function ( path, cbk ) {
    NKStorage.addEventListener( path, cbk );
}


// On page leave
NKStorage.oldLeaveHandler = window.onbeforeunload;
window.onbeforeunload = function (e) {
    if (NKStorage.oldLeaveHandler) NKStorage.oldLeaveHandler(e);

    if ( NKStorage.saveOnLeave === true) {
        NKStorage.save( true );
    }
};

;let NKVar = {};

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


;

var NKWebsocketClient = function ( host, port ) {
    this.host = host;
    this.port = port;
    this.socket = null;
    this.writePromises = {};

    this.connect = function () {
        let self = this;

        this.socket = new WebSocket('ws://' + this.host + ":" + this.port );

        this.socket.addEventListener('open', (event) => this.onOpen(event) );
        this.socket.addEventListener('close', (event) => this.onClose(event) );
        this.socket.addEventListener('error', (event) => this.onError(event) );
        this.socket.addEventListener('message', (event) => {
            let data = event.data.toString();
            let num_cli = data.charCodeAt(0);
            let num_serv = data.charCodeAt(1);
            data = data.substring(2);


            if ( num_cli === 0 ) {
                var sendResponse = function ( msg ) {
                    self.socket.send( String.fromCharCode(num_cli) + String.fromCharCode(num_serv) + msg );
                }

                this.onMessage( data, sendResponse, event );
            } else {
                this.writePromises[num_cli](data);
                delete this.writePromises[num_cli];
            }

        } );
    }

    this.connected = function () {
        return (this.socket.readyState !== WebSocket.CLOSED);
    }

    this.reconnect = async function () {
        while ( !this.connected() ) {
            this.connect();
            await NK.sleep(5000);
        }
    }

    this.write = function ( msg ) {
        this.socket.send( String.fromCharCode(0) + String.fromCharCode(0) + msg );
    }

    this.writeAndWait = function ( msg, timeout_ms ) {
        let self = this;
        let num_cli = 0;
        let num_serv = 0;

        for ( let i = 1; i < 255; i++ ) {
            if ( this.writePromises[i] === undefined ) {
                num_cli = i;
                break;
            }
        }

        if ( num_cli === 0 ) {
            return new Promise(function(resolve, reject) {
                reject( "Error, too many writeAndWait" );
            });
        }

        let p = new Promise(function(resolve, reject) {
            self.writePromises[num_cli] = resolve;
            setTimeout( function() { reject( "Timeout" ); }, timeout_ms);
        });

        this.socket.send( String.fromCharCode(num_cli) + String.fromCharCode(num_serv) + msg );

        return p;
    }

    this.onOpen = function ( e ) {};
    this.onMessage = function ( data, sendResponse, e ) {};
    this.onClose = function ( e ) {};
    this.onError = function ( e ) {};
};
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
};