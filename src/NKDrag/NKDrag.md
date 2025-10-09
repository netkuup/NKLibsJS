# NKDrag
Easy way to drag elements

Demo & Examples
----------------------------------------------------------------------------
[See the ./examples directory](./examples)

[Live demo (Drag Window)](https://codepen.io/Netkuup/pen/OxBVWw)

[Live demo (Drag List)](https://codepen.io/Netkuup/pen/dPGWawJ)


Initialization
----------------------------------------------------------------------------
To use any function of this document, you **must** call this funtion **once**.

    NKDrag.start();

If the HTML document content changes dinamically (Creates new divs with NKDrag class via Javascript, etc.) you must set 'reactable = true' so that the library will automatically detect the changes and work with the new content.

    NKDrag.start(true);
    
    
Drag window
----------------------------------------------------------------------------

- __.NKDrag_src:__ Part you can click to drag.
- __.NKDrag_dst:__ Container to be dragged.

**Example:**

    <div class="NKDrag_dst">
        <div class="NKDrag_src">Draggable window title</div>
        <div>Window content<br>Window content</div>
    </div>

    <script>
        NKDrag.start();
    
        NKDrag.addEventListener('onDrag', function( data ) {
            console.log( "Dragged", data );
        });
    </script>


Drag vertical list item
----------------------------------------------------------------------------

- __.NKDrag_wrapper:__ List container (flex)
- __.NKDrag_src:__ Part you can click to drag.
- __.NKDrag_dst:__ Container to be dragged.

**Example:**

    <div class="NKDrag_wrapper" style="flex-direction: column; gap: 5px;">

        <div class="NKDrag_dst">
            <div class="NKDrag_src">Drag me 1</div>
            Lorem Ipsum<br />Lorem Ipsum
        </div>

        <div class="NKDrag_dst">
            <div class="NKDrag_src">Drag me 2</div>
            Lorem Ipsum<br />Lorem Ipsum
        </div>

        <div class="NKDrag_dst">
            <div class="NKDrag_src">Drag me 3</div>
            Lorem Ipsum<br />Lorem Ipsum
        </div>

        <div class="NKDrag_dst">
            <div class="NKDrag_src">Drag me 4</div>
            Lorem Ipsum<br />Lorem Ipsum
        </div>
    </div>

    <script>
        NKDrag.start();

        NKDrag.addEventListener('onDrag', function( data ) {
            //console.log( "onDrag", data );
        });

            NKDrag.addEventListener('onDragEnd', function( data ) {
            console.log( "onDragEnd", data );
        });
    </script>


Drag horizontal list item
----------------------------------------------------------------------------

- __.NKDrag_wrapper:__ List container (flex)
- __.NKDrag_src:__ Part you can click to drag.
- __.NKDrag_dst:__ Container to be dragged.


**Example:**

    <div class="NKDrag_wrapper foo_list" style="flex-direction: row; gap: 5px;">

        <div class="NKDrag_dst">
            <div class="NKDrag_src">Drag 1</div>
            Lorem Ipsum<br />Lorem Ipsum
        </div>

        <div class="NKDrag_dst">
            <div class="NKDrag_src">Drag 2</div>
            Lorem Ipsum<br />Lorem Ipsum
        </div>

        <div class="NKDrag_dst">
            <div class="NKDrag_src">Drag 3</div>
            Lorem Ipsum<br />Lorem Ipsum
        </div>

    </div>

    <script>
        NKDrag.start();

        NKDrag.addEventListener('onDrag', function( data ) {
            //console.log( "onDrag", data );
        });

            NKDrag.addEventListener('onDragEnd', function( data ) {
            console.log( "onDragEnd", data );
        });
    </script>