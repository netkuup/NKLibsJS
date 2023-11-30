var NKCanvas = {};

NKCanvas.getPixelColor = function ( canvas, x, y ) {
    x = parseFloat(x);
    y = parseFloat(y);

    var ctx = canvas.getContext('2d');
    var data = ctx.getImageData(0, 0, canvas.width, canvas.height, {willReadFrequently: true}).data;
    var cw = canvas.width;

    var pixel = (cw * y) + x;
    var position = pixel * 4;

    return {
        rgba: [data[position], data[position + 1], data[position + 2], data[position + 3]]
    };
}

NKCanvas.searchPixelCoords = function ( canvas, rgba_color = [0, 0, 0] ) {

    var ctx = canvas.getContext('2d');
    var cw = canvas.width;

    var data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    var pos_i = -1;
    for ( var i = 0; i < data.length; i = i+4 ) {
        if ( data[i] === rgba_color[0] && data[i+1] === rgba_color[1] && data[i+2] === rgba_color[2] ) {
            pos_i = i;
            break;
        }
    }

    var pixel_i = pos_i / 4;
    var row = Math.floor(pixel_i / cw);
    var col = pixel_i % cw;

    return {x: col, y: row};
}


NKCanvas.extractPortion = function ( canvas, x, y, w, h, ctx_options = {} ) {
    var aux_canvas = document.createElement("canvas");
    var aux_ctx = aux_canvas.getContext("2d", ctx_options);

    aux_canvas.hidden = true;
    aux_canvas.width = w;
    aux_canvas.height = h;
    aux_ctx.drawImage(canvas, x, y, w, h, 0, 0, w, h);

    return aux_canvas;
}


NKCanvas.replaceColor = function ( canvas, old_color, new_color ) {
    var ctx = canvas.getContext('2d');
    var image_data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = image_data.data;
    var replace_times = 0;

    if ( old_color.length === 4 && new_color.length === 4 ) {
        for (var i = 0; i < data.length; i += 4) {
            if ( data[i] === old_color[0] && data[i+1] === old_color[1] && data[i+2] === old_color[2] && data[i+3] === old_color[3] ) {
                data[i] = new_color[0];
                data[i+1] = new_color[1];
                data[i+2] = new_color[2];
                data[i+3] = new_color[3];
                replace_times++;
            }
        }
    } else {
        for (var i = 0; i < data.length; i += 4) {
            if ( data[i] === old_color[0] && data[i+1] === old_color[1] && data[i+2] === old_color[2] ) {
                data[i] = new_color[0];
                data[i+1] = new_color[1];
                data[i+2] = new_color[2];
                replace_times++;
            }
        }
    }

    ctx.putImageData(image_data, 0, 0);
    return replace_times;
}



NKCanvas.compare = function ( canvas1, canvas2 ) {
    const ctx1 = canvas1.getContext("2d");
    const ctx2 = canvas2.getContext("2d");

    const width = canvas1.width;
    const height = canvas1.height;

    function comparePixels(pixel1, pixel2) {
        return (
            pixel1[0] === pixel2[0] &&
            pixel1[1] === pixel2[1] &&
            pixel1[2] === pixel2[2] &&
            pixel1[3] === pixel2[3]
        );
    }

    if (canvas1.width !== canvas2.width || canvas1.height !== canvas2.height) {
        return console.error("Los canvas tienen dimensiones diferentes.");
    }

    const imageData1 = ctx1.getImageData(0, 0, width, height);
    const imageData2 = ctx2.getImageData(0, 0, width, height);

    const data1 = imageData1.data;
    const data2 = imageData2.data;

    var differences = [];
    for (var i = 0; i < data1.length; i += 4) {
        const pixel1 = data1.slice(i, i + 4);
        const pixel2 = data2.slice(i, i + 4);

        if (!comparePixels(pixel1, pixel2)) {
            const x = (i / 4) % width;
            const y = Math.floor(i / 4 / width);
            differences.push({x: x, y: y, color_1: pixel1, color_2: pixel2});
        }
    }

    return differences;
}