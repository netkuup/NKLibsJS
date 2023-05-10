# NKDomActions
A set of helpers for basic user actions.

Demo
----------------------------------------------------------------------------
[Live demo](https://codepen.io/Netkuup/pen/PjGdbG)

Initialization
----------------------------------------------------------------------------
To use any function of this document, you **must** call this funtion **once**.

    NKActions.start();

If the HTML document content changes dinamically (Creates new NKActions elements via Javascript, etc.) you must set 'reactable = true' so that the library will automatically detect the changes and work with the new content.

    NKActions.start(true);

NKHide
----------------------------------------------------------------------------
When click on element with '.NKHide_btn', the first parent with '.NKHide_dst' will be hidden.

    <div class="NKHide_dst NKStickBO">
        This site uses cookies. <a class="NKHide_btn NKLink">Close</a>
    </div>

[Live demo](https://codepen.io/Netkuup/pen/PjGdbG)

NKDel
----------------------------------------------------------------------------
When click on element with '.NKDel_btn', the first parent with '.NKDel_dst' will be deleted.

    <div class="NKDel_dst NKStickBO">
        This site uses cookies. <a class="NKDel_btn NKLink">Close</a>
    </div>

NKToggle
----------------------------------------------------------------------------
When click on element with '.NKToggle_btn', the nearest element with '.NKToggle_dst' will be toggled.

    <div>
        <div class="NKToggle_dst">
            Hello world.
        </div>
        <a class="NKToggle_btn NKLink">Toggle</a>
    </div>

[Live demo](https://codepen.io/Netkuup/pen/PjGdbG)

If we use '.NKReact' after 'NKToggle_btn', the text 'Foo' will be automatically changed to 'Show' or 'Hide'.

    <div>
        <div class="NKToggle_dst">
            Hello world.
        </div>
        <a class="NKToggle_btn NKReact NKLink">Foo</a>
    </div>

[Live demo](https://codepen.io/Netkuup/pen/PjGdbG)


[<< Index](../../../../)