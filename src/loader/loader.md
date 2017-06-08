# NKLoader


NKLoader.setSelector( loader_selector, error_selector )
----------------------------------------------------------------------------
- The loader will be displayed when there is an ongoing ajax request in progress.
- Error box will be displayed when a javascript error occurs.

**Example:**

HTML

    <script src="http://code.jquery.com/jquery-3.1.1.min.js"></script>
    <script type="text/javascript" src="../base/base.js" ></script>
    <script type="text/javascript" src="./loader.js" ></script>

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