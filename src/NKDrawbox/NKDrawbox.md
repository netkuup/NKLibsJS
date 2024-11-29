# NKDrawbox
New way to draw without using canvas


    <div id="my_drawbox" style="background-color: gray;">
        Draw area
    </div>


drawRect( args )
----------------------------------------------------------------------------
Draw a rectangle

    let draw_box = new NKDrawbox('my_drawbox');
    draw_box.drawRect({
        x: 100,
        y: 100,
        w: 50,
        h: 50,
        color: "red",
        border_px: 3,
        borderolor: "black",
        border_style: "dotted",
        origin: "top left" //Default
    });
.

    let draw_box = new NKDrawbox('my_drawbox');
    draw_box.drawRect({
        x: 100,
        y: 100,
        x2: 150,
        y2: 150,
        color: "red",
        border_px: 3,
        borderolor: "black",
        border_style: "solid"
    });



| param | Values                                                                                                                                                                | Mandatory | Description                                                     |
|:---|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------|:----------|:----------------------------------------------------------------|
|color| "red", "blue". etc. <br> "#000000", "#111111", etc. | No | Background color name or hex.
| origin | 'top left' <br> 'top center' <br> 'top right' <br> 'center left' <br> 'center center' <br> 'center right' <br> 'bottom left' <br> 'bottom center' <br> 'bottom right' | No        | The reference point.                                            |
|border_style| solid <br> dashed <br> dotted <br> double <br> groove <br> ridge <br> inset <br> outset                                                                                     | No        | Border style |

drawLine( args )
----------------------------------------------------------------------------
Draw a line

    let draw_box = new NKDrawbox('my_drawbox');
    draw_box.drawLine({
        x: 0,
        y: 0,
        x2: 400,
        y2: 200,
        w: 1,
        color: "black",
        style: "dashed"
    });