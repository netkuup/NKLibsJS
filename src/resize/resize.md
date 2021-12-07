# NKResize
Create resizable div colums or rows

Demo & Examples
----------------------------------------------------------------------------
[See the ./examples directory](./examples)

[Live demo (Columns)](https://codepen.io/Netkuup/pen/vYeGLGy) <br />
[Live demo (Rows)](https://codepen.io/Netkuup/pen/XWedXdL)

Initialization
----------------------------------------------------------------------------
To use any function of this document, you **must** call this funtion **once**.

    NKResize.start();


Example columns
----------------------------------------------------------------------------


    <div class="NKDrag_colums" style="height: 200px;">
        <div nk-width="300px" style="background-color: green; border-right: 11px solid black;">
            Zone 1
        </div>
        <div nk-width="auto" style="background-color: lightblue">
            Zone 2
        </div>
        <div nk-width="200px" style="background-color: lightcoral">
            Zone 3
        </div>
    </div>

    <script>
        NKResize.start();

        NKResize.addEventListener('onResize', function( data ) {
            console.log( "Column resized", data );
        });
    </script>

Example Rows
----------------------------------------------------------------------------


    <div class="NKDrag_rows" style="height: 600px;">
        <div nk-height="100px" style="background-color: green; border-bottom: 11px solid black;">
            Zone 1
        </div>
        <div nk-height="auto" style="background-color: lightblue">
            Zone 2
        </div>
        <div nk-height="200px" style="background-color: lightcoral">
            Zone 3
        </div>
    </div>

    <script>
        NKResize.start();
    
        NKResize.addEventListener('onResize', function( data ) {
            console.log( "Row resized", data );
        });
    </script>




[<< Index](../../../../)
