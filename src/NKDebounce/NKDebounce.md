# NKDebounce
[See the ./examples directory](./examples)



NKDebounce.callOnce( func, ms = 200 )
----------------------------------------------------------------------------
If you click the button very quickly, console.log will not execute until 1 second (or the spefied time) has passed since the last time you pressed the button.

    <input type="button" onclick="onClickBtn()" value="Button">
    
    <script>
        function onClickBtn() {
            NKDebounce.callOnce( function () {
                console.log("Button click!");
            }, 1000 );
        }
    </script>