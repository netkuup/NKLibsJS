
function NKCanvas( canvas_element_or_id = null ) {
    this.canvas = null;
    this.ctx = null;
    this.w = 0;
    this.h = 0;

    if ( canvas_element_or_id === null ) {
        this.canvas = document.createElement('canvas');

    } else if ( canvas_element_or_id instanceof HTMLCanvasElement ) {
        this.canvas = canvas_element_or_id;

    } else if ( typeof canvas_element_or_id === "string" ) {
        this.canvas = document.getElementById( canvas_element_or_id );

    } else {
        console.error("NKCanvas invalid argument.");
        return;
    }

    this.canvas.style.imageRendering = 'pixelated'; //Important!

    this.ctx = this.canvas.getContext('2d');
    //this.ctx.imageSmoothingEnabled = false;

    this.w = this.canvas.width;
    this.h = this.canvas.height;

}

NKCanvas.prototype.setSize = function ( w = 400, h = 200 ) {
    this.canvas.width = w;
    this.canvas.height = h;
    this.w = w;
    this.h = h;
}

NKCanvas.prototype.clean = function () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
}

NKCanvas.prototype.getPixelColor = function ( x = 0, y = 0 ) {

    let data = this.ctx.getImageData(0, 0, this.w, this.h, {willReadFrequently: true}).data;

    let pixel = (this.w).nkmul(y).nksum(x);
    let position = pixel.nkmul(4);

    return {
        rgba: [data[position], data[position + 1], data[position + 2], data[position + 3]]
    };
}

NKCanvas.prototype.searchPixelCoords = function ( rgba_color = [0, 0, 0] ) {

    let data = this.ctx.getImageData(0, 0, this.w, this.h).data;

    let pos_i = -1;
    for ( let i = 0; i < data.length; i = i+4 ) {
        if ( data[i] === rgba_color[0] && data[i+1] === rgba_color[1] && data[i+2] === rgba_color[2] ) {
            pos_i = i;
            break;
        }
    }

    let pixel_i = pos_i.nkdiv(4);
    let row = Math.floor( pixel_i.nkdiv(this.w) );
    let col = pixel_i % this.w;

    return {x: col, y: row};

}

NKCanvas.prototype.extractPortion = function ( x, y, w, h, ctx_options = {}  ) {
    let aux_canvas = document.createElement("canvas");
    let aux_ctx = aux_canvas.getContext("2d", ctx_options);

    aux_canvas.hidden = true;
    aux_canvas.width = w;
    aux_canvas.height = h;
    aux_ctx.drawImage(this.canvas, x, y, w, h, 0, 0, w, h);

    return aux_canvas;
}

NKCanvas.prototype.replaceColor = function ( old_color, new_color ) {
    let image_data = this.ctx.getImageData(0, 0, this.w, this.h);
    let data = image_data.data;
    let replace_times = 0;

    if ( old_color.length === 4 && new_color.length === 4 ) {
        for (let i = 0; i < data.length; i += 4) {
            if ( data[i] === old_color[0] && data[i+1] === old_color[1] && data[i+2] === old_color[2] && data[i+3] === old_color[3] ) {
                data[i] = new_color[0];
                data[i+1] = new_color[1];
                data[i+2] = new_color[2];
                data[i+3] = new_color[3];
                replace_times++;
            }
        }
    } else {
        for (let i = 0; i < data.length; i += 4) {
            if ( data[i] === old_color[0] && data[i+1] === old_color[1] && data[i+2] === old_color[2] ) {
                data[i] = new_color[0];
                data[i+1] = new_color[1];
                data[i+2] = new_color[2];
                replace_times++;
            }
        }
    }

    this.ctx.putImageData(image_data, 0, 0);
    return replace_times;
}


NKCanvas.prototype.compare = function ( canvas_2_element ) {
    const ctx1 = this.ctx;
    const ctx2 = canvas_2_element.getContext("2d");

    function comparePixels(pixel1, pixel2) {
        return (
            pixel1[0] === pixel2[0] &&
            pixel1[1] === pixel2[1] &&
            pixel1[2] === pixel2[2] &&
            pixel1[3] === pixel2[3]
        );
    }

    if (this.h !== canvas_2_element.width || this.h !== canvas_2_element.height) {
        return console.error("Los canvas tienen dimensiones diferentes.");
    }

    const imageData1 = ctx1.getImageData(0, 0, this.w, this.h);
    const imageData2 = ctx2.getImageData(0, 0, this.w, this.h);

    const data1 = imageData1.data;
    const data2 = imageData2.data;

    let differences = [];
    for (let i = 0; i < data1.length; i += 4) {
        const pixel1 = data1.slice(i, i + 4);
        const pixel2 = data2.slice(i, i + 4);

        if (!comparePixels(pixel1, pixel2)) {
            const x = (i / 4) % this.w;
            const y = Math.floor(i / 4 / this.w);
            differences.push({x: x, y: y, color_1: pixel1, color_2: pixel2});
        }
    }

    return differences;
}

NKCanvas.prototype.drawRect = function ( args ) {
    let border = NK.var(args.border_px, 0);
    let x = NK.var(args.x, 0);
    let y = NK.var(args.y, 0);
    let w = NK.var(args.w, 0);
    let h = NK.var(args.h, 0);

    if ( args.x && args.x2 ) w = (args.x2).nkminus(args.x).nksum(border*2);
    if ( args.y && args.y2 ) h = (args.y2).nkminus(args.y).nksum(border*2);


    if ( NK.isset(args.color) ) this.ctx.fillStyle = args.color;
    if ( NK.isset(args.border_px) ) this.ctx.lineWidth = args.border_px;
    if ( NK.isset(args.border_color) ) this.ctx.strokeStyle = args.border_color;
    if ( NK.isset(args.border_pattern) ) this.ctx.setLineDash(args.border_pattern); //array(2): [longitud del segmento, espacio]

    if ( NK.isset(args.color) ) this.ctx.fillRect(x+border, y+border, w, h);
    if ( NK.isset(args.border_color) || (NK.isset(args.border_px) && args.border_px > 0) ) this.ctx.strokeRect( x+border, y+border, w, h );

}

NKCanvas.prototype.drawCircle = function ( args ) {

    let r = NK.var( args.r, NK.var(args.d, 10).nkdiv(2) );
    let x = NK.var( (args.x).nksum(r), 0 ).nkminus( args.r );
    let y = NK.var( (args.y).nksum(r), 0 ).nkminus( args.r );


    this.ctx.beginPath();

    this.ctx.arc(x, y, r, 0, Math.PI * 2);
    if ( NK.isset(args.color) ) this.ctx.fillStyle = args.color;
    if ( NK.isset(args.color) ) this.ctx.fill();

    if ( NK.isset(args.border_px) ) this.ctx.lineWidth = args.border_px;
    if ( NK.isset(args.border_color) ) this.ctx.strokeStyle = args.border_color;
    if ( NK.isset(args.border_color) || NK.isset(args.border_px) ) this.ctx.stroke();

}

NKCanvas.prototype.drawLine = function ( args ) {

    if ( NK.isset(args.color) ) this.ctx.strokeStyle = args.color;
    if ( NK.isset(args.w) ) this.ctx.lineWidth = args.w;
    if ( NK.isset(args.pattern) ) this.ctx.setLineDash(args.pattern); //array(2): [longitud del segmento, espacio]

    this.ctx.beginPath();
    this.ctx.moveTo(args.x, args.y);
    this.ctx.lineTo(NK.var(args.x2, args.x), NK.var(args.y2, args.y));
    this.ctx.stroke();


}

NKCanvas.prototype.drawText = function ( args ) {
    let font_size = NK.var( args.font_size, 12 );
    if ( !isNaN(font_size) ) font_size = font_size + "px";

    let font_weight = NK.var( args.font_weight, "normal" ); //bold
    let font_family = NK.var( args.font_family, "Arial" );
    let font_color = NK.var( args.font_color, "black" );

    this.ctx.font = font_weight + " " + font_size + " " + font_family; //'bold 20px Arial'
    this.ctx.fillStyle = font_color;
    this.ctx.textBaseline = 'top'; //Top left
    this.ctx.fillText(NK.var(args.text, "Text"), NK.var(args.x, 0), NK.var(args.y, 0));
}
