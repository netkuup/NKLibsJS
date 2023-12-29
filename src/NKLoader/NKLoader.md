# NKLoader


NKLoader.setSelector( loader_selector, error_selector )
----------------------------------------------------------------------------
- The loader will be displayed when there is an ongoing ajax request in progress.
- Error box will be displayed when a javascript error occurs.

**Example:**

HTML

    <div>
        <div id="myLoader">Loading...</div>
        <div id="myError" class="NKHide_dst" style="color: red">
            <p> Error while loading :( </p>
            <a class="NKHide_btn NKLink">Close</a>
        </div>
    </div>

JS

    NKLoader.setSelector( '#myLoader', '#myError' );


[<< Index](../../../../)