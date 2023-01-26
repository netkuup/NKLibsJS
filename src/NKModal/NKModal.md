# NKModal
Easy modal creation

Demo & Examples
----------------------------------------------------------------------------
[See the ./examples directory](./examples)

[Live demo](https://codepen.io/Netkuup/pen/OJpJabM)


NKModal.show( div_id )
----------------------------------------------------------------------------
Show the specified div as a modal

    <div id="my_content" hidden>
        The content <br />
        The content <br />
        The content <br />
        The content <br />
        The content <br />
    </div>

    <script>
        NKModal.show('my_content');
    </script>


NKModal.hide( div_id )
----------------------------------------------------------------------------
Hide the modal

    NKModal.hide('my_content');

NKModal.toggle( div_id )
----------------------------------------------------------------------------
Toggle modal visibility

    NKModal.toggle('my_content');