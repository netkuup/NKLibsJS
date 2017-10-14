# NKDrag
Easy way to drag elements

Demo & Examples
----------------------------------------------------------------------------
[See the ./examples directory](./examples)

[Live demo](https://codepen.io/Netkuup/pen/OxBVWw)


Initialization
----------------------------------------------------------------------------
To use any function of this document, you **must** call this funtion **once**.

    NKDrag.start();

If the HTML document content changes dinamically (Creates new divs with NKDrag class via Javascript, etc.) you must set 'reactable = true' so that the library will automatically detect the changes and work with the new content.

    NKDrag.start(true);
    
    
.NKDrag_src .NKDrag_dst
----------------------------------------------------------------------------

- __.NKDrag_src:__ Part you can click to drag.
- __.NKDrag_dst:__ Container to be dragged.

**Example:**

        <div class="NKDrag_dst">
            <div class="NKDrag_src">Draggable window title</div>
            <div>Window content<br>Window content</div>
        </div>