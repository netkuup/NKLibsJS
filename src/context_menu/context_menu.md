# NKContextMenu
Easy right click Context Menu creation

Demo & Examples
----------------------------------------------------------------------------
[See the ./examples directory](./examples)

[Live demo](https://codepen.io/Netkuup/pen/zYoxVwe)


Initialization
----------------------------------------------------------------------------
To use any function of this document, you **must** call this funtion **once**.

    NKContextMenu.start();


Creating the menu items
----------------------------------------------------------------------------
They can be created through an array or directly using div's

**Example: Using array**

    let content_1 = [
        {type: "item", id: 1, text: "Add", icon:""},
        {type: "item", id: 2, text: "Delete", icon:""},

        {type: "divider"},

        {type: "menu", id: 3, text: "Menu 1", icon:"", items: [
            {type: "item", id: 7, text: "Subitem 1", icon:""},
            {type: "item", id: 8, text: "Subitem 2", icon:""},

            {type: "menu", id: 4, text: "Menu 2", icon:"", items: [
                {type: "item", id: 5, text: "Subitem 3", icon:""},
                {type: "item", id: 6, text: "Subitem 4", icon:""}
            ]},
        ]},
    ];

    NKContextMenu.setContent( content_1 );

**Example: Using div's**

    <div id="NKContextMenu">
        <div class="NKItem" data-id="1">
            <div class="NKIcon"></div>
            <div class="NKTitle">Delete</div>
        </div>
        <div class="NKItem NKArrow" data-id="2">
            <div class="NKIcon"></div>
            <div class="NKTitle">New</div>

            <div class="NKSubmenu" data-id="3">
                <div class="NKItem" data-id="4">
                    <div class="NKIcon"></div>
                    <div class="NKTitle">File</div>
                </div>
                <div class="NKItem" data-id="5">
                    <div class="NKIcon"></div>
                    <div class="NKTitle">Folder</div>
                </div>
            </div>
        </div>
        <div class="NKDivider"></div>
        <div class="NKItem" data-id="6">
            <div class="NKIcon"></div>
            <div class="NKTitle">Update</div>
        </div>
    </div>

Event listeners
----------------------------------------------------------------------------
    NKContextMenu.addEventListener('onOpen', function( data ) {
        console.log( "Showing context menu" );
        console.log( "Clicked element:", data.target );

        // You can change the content of the menu depending on the item clicked
        if ( data.target.id === "my_div" ) {
            NKContextMenu.setContent( content_1 );
        } else {
            NKContextMenu.setContent( content_2 );
        }
    
    });

.

    NKContextMenu.addEventListener('onClose', function( data ) {
        console.log( "Closing context menu" );
        console.log( "Selected menu item:", data.id );
    });




[<< Index](../../../../)
