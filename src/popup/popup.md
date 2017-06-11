# NKPopup
Easy popup creation

[See the ./examples directory](./examples)

Initialization
----------------------------------------------------------------------------
To use any function of this document, you **must** call this funtion **once**.

    NKPopup.start();

If the HTML document content changes dinamically (Creates new NKPopups via Javascript, etc.) you must set 'reactable = true' so that the library will automatically detect the changes and work with the new content.

    NKActions.start(true);
    
    

.NKPopup_src .NKPopup_dst
----------------------------------------------------------------------------

- __.NKPopup_src:__ The popup selector.
- __.NKPopup_dst:__ The popup window.

        <div>
            <div class="NKPopup_src">The icon/text/etc.</div>
            <div class="NKPopup_dst" nk-type="box" nk-align="top,center">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </div>
        </div>

**.NKPopup_dst Params:**

| param | Values | Mandatory | Description |
|:---|:---|:---|:---|
| nk-type | **box**/mouse | No | Whether the popup position is relative to src_icon or mouse position. |
| nk-align | top,left<br>**top,center**<br>top,right<br>bottom,left<br>bottom,center<br>bottom,right<br>left,top<br>left,middle<br>left,bottom<br>right,top<br>right,middle<br>right,bottom  | No | The popup alignment. |
| nk-arrow-size | **10,7**<br>&lt;Width&gt;,&lt;Height&gt; | No | The arrow size. If it is not set, no arrow appears. |
| nk-offset | **0,0**<br>&lt;OffsetX&gt;,&lt;OffsetY&gt; | No | Set a margin for the popup box. |
| nk-x | &lt;StaticX&gt; | No | Set a static x popup position.|
| nk-y | &lt;StaticY&gt; | No | Set a static y popup position.|

[<< Index](../../../../)
