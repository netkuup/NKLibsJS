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
        border_style: "dotted"
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