# NKStick
[See the ./examples directory](./examples)

.NKStickBN (Bottom Normal)
----------------------------------------------------------------------------
When page content is large you must make stroll to see. When the content is short the element will be visible on the bottom.
- If the page has visible scrollbar: Does nothing.
- If the page does not have a scroll bar: Acts like .NKStickBO

        <html>
            <head>
                <title>Document title</title>
            </head>

            <body>
                <div>Short content</div>
                <footer class="NKStickBN">The footer</footer>
            </body>

        </html>

.NKStickBO (Bottom Overlapped)
----------------------------------------------------------------------------
Always visible on bottom, above the web content.

    <div class="NKStickBO">
        This site uses cookies.
    </div>


.NKStickBD (Bottom Dynamic)
----------------------------------------------------------------------------
The element can be anywhere on the page, on scroll never will be hided.

    <div class="NKStickBD">I never hide</div>




.NKStickTN (Top Normal)
----------------------------------------------------------------------------
Not apply.



.NKStickTO (Top Overlapped)
----------------------------------------------------------------------------
Always visible on top.

    <div class="NKStickTO NKHide_dst">
        This site uses cookies. <a class="NKHide_btn NKLink">Close</a>
    </div>


.NKStickTD (Top Dynamic)
----------------------------------------------------------------------------
The element can be anywhere on the page, on scroll never will be hided.

    <div class="NKStickTD">I never hide</div>


[<< Index](../../../../)