var NKContextMenu = {};

if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before context_menu.js";
}

var nkcontextmenu_event_listener = new NKEventListener();
NKContextMenu = { ...nkcontextmenu_event_listener };



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

    if ( !document.getElementById("NKContextMenu") ) {
        let d = document.createElement("div");
        d.setAttribute("id", "NKContextMenu");
        document.body.appendChild(d);
    }

    document.getElementById("NKContextMenu").style.display = "none";

    let lastTarget = null;

    document.addEventListener('contextmenu', function (e){
        let target = e.target;
        lastTarget = target;

        NKContextMenu.dispatchEvent('onOpen', {target: target});
        let context_menu_element = document.getElementById("NKContextMenu");

        if ( context_menu_element?.children.length === 0 ) {
            context_menu_element.style.display = "none";

        } else {
            context_menu_element.style.display = "block";
            document.querySelectorAll("#NKContextMenu .NKSubmenu").forEach(e => e.style.display = "none");
            context_menu_element.style.left = NKPosition.getMouseX() + "px";
            context_menu_element.style.top = NKPosition.getMouseY() + "px";
            e.preventDefault();
        }

    });

    document.addEventListener('mouseup', function (e){
        if ( e.button === 2 ) return; //Right click
        let menu = document.getElementById("NKContextMenu");
        if (!menu || getComputedStyle(menu).display === "none") return;

        let target = e.target;

        if ( target.classList.contains("NKItem") ) {
            NKContextMenu.dispatchEvent('onClose', {
                id: target.getAttribute('data-id'),
                text: target.querySelector(".NKTitle")?.textContent,
                target: lastTarget,
                button: target
            });

        } else {
            NKContextMenu.dispatchEvent('onClose', {id: null, target: lastTarget, button: null});

        }

        document.getElementById("NKContextMenu").style.display = "none";


    });

    NKContextMenu.refresh();

};

NKContextMenu.setContent = function( content ) {
    var newContent = [];

    function createItem( id, name, icon_data, submenu_items ) {
        let item = document.createElement("div");
        let icon = document.createElement("div");
        let title = document.createElement("div");
        item.classList.add('NKItem');
        icon.classList.add('NKIcon');
        title.classList.add('NKTitle');

        item.setAttribute('data-id', id);
        title.textContent = name;

        if ( !NK.empty(icon_data) ) {
            if ( icon_data instanceof Node ) {
                icon.appendChild(icon_data);
            } else {
                icon.innerHTML = icon_data;
            }
            icon.style.marginRight = '5px';
        }

        item.appendChild(icon);
        item.appendChild(title);

        if ( submenu_items !== null ) {
            let submenu = document.createElement("div");
            submenu.classList.add('NKSubmenu');
            submenu_items.forEach(item => submenu.appendChild(item));
            item.classList.add('NKArrow');
            item.appendChild(submenu);
        }

        return item;
    }

    function fillData( aux ) {
        let item_list = [];

        for ( let i = 0; i < aux.length; i++ ) {
            let it = aux[i];

            if ( it.type === "item" ) {
                item_list.push( createItem(it.id, it.text, it.icon, null) );

            } else if ( it.type === "menu" ) {
                let submenu_items = fillData( it.items );
                item_list.push( createItem(it.id, it.text, it.icon, submenu_items) );

            } else if ( it.type === "divider" ) {
                let divider = document.createElement("div");
                divider.classList.add('NKDivider');
                item_list.push( divider );
            }

        }

        return item_list;
    }

    if ( !NK.empty(content) ) newContent = fillData( content );

    let wrapper = document.getElementById("NKContextMenu");
    wrapper.innerHTML = '';
    newContent.forEach(item => wrapper.appendChild(item));

    NKContextMenu.refresh();
}

NKContextMenu.refresh = function() {

    function handleMouseEnter(event) {
        let element = event.currentTarget;

        let submenus = element.parentNode.querySelectorAll('.NKSubmenu');
        submenus.forEach(submenu => submenu.style.display = 'none'); //Hide all submenus

        let submenu = element.querySelector('.NKSubmenu');
        if (!submenu) return; //Es un item normal, no un submenu

        submenu.style.display = 'block';
        submenu.style.left = (element.offsetWidth - 5) + 'px';
    }

    document.querySelectorAll('.NKItem').forEach(item => {
        item.removeEventListener('mouseenter', handleMouseEnter);
        item.addEventListener('mouseenter', handleMouseEnter);
    });

}


