var NKContextMenu = {};

if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before context_menu.js";
}

var event_listener = new NKEventListener();
NKContextMenu = { ...event_listener };



NKContextMenu.start = function() {
    if ( NK.isset(NKContextMenu.loaded) && NKContextMenu.loaded === true ) return;
    NKContextMenu.loaded = true;

    if ( typeof NKPosition === 'undefined' ) {
        throw "You must include position.js before popup.js";
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


