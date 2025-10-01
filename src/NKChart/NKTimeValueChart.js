
function NKTimeValueChart ( wrapper_id, valueline_wrapper_id = null, timeline_wrapper_id = null, eventline_wrapper_id = null) {
    this.drawbox = new NKDrawbox( wrapper_id );
    this.valueline_drawbox = (valueline_wrapper_id === null) ? null : new NKDrawbox( valueline_wrapper_id );
    this.timeline_drawbox = (timeline_wrapper_id === null) ? null : new NKDrawbox( timeline_wrapper_id );
    this.eventline_drawbox = (eventline_wrapper_id === null) ? null : new NKDrawbox( eventline_wrapper_id );

    this.zoom_x = 1;
    this.zoom_y = 1;
    this.rectangle_w = 5; //Ancho de la vela, tiene que ser IMPAR para poner la linea central.
    this.rectangle_dist = 8; //Ancho de la vela + ancho del espacio entre velas. Puede ser PAR O IMPAR.

    this.chart_h = 300;
    this.chart_w = 300;
    
    this.drawings = {
        candles: [],
        events: [],
        point_lines: {},
        simple_lines: {},
        rectangles: {}
    }
    this.drawings_calc = {
        num_rectangles: 0,
        min_price: 0,
        max_price: 0,
    }

    this.config = {
        rectangle_w: 5, //Este no se toca, el otro se modifica segun el zoom.
        rectangle_dist: 8,
        chart_h: 300,
        gap_h: 25
    }

    
    if ( window.devicePixelRatio !== 1 ) {
        console.warn( "NKTimeValueChart: The browser zoom level is not set to 100%. This may affect visual rendering." );
    }

}


NKTimeValueChart.prototype.setSize = function ( rectangle_w = 5, gap_x_px = 3, chart_h = 300, gap_h_px = 25 ) {
   
    this.config.rectangle_w = rectangle_w;
    this.config.rectangle_dist = rectangle_w.nksum( gap_x_px );

    this.config.chart_h = chart_h;
    this.config.gap_h = gap_h_px;

    if ( rectangle_w % 2 === 0 ) {
        console.error("NKPixelPerfect.configCandles: rectangle_w debe ser impar para que la linea central quede bien alineada.");
    }

    this.setZoom(null, null, false);
}


NKTimeValueChart.prototype.setZoom = function ( zoom_x = null, zoom_y = null, repaint = true ) {
    this.zoom_x = (zoom_x !== null) ? parseInt(zoom_x) : this.zoom_x; //Tiene que ser un valor entero.
    this.zoom_y = (zoom_y !== null) ? parseInt(zoom_y) : this.zoom_y; 

    let rectangle_growth = (2).nkmul( this.zoom_x - 1 ); //Cada unidad de zoom crece 2px el ancho de la vela (1px por lado).
    let chart_h_growth = (10).nkmul( this.zoom_y - 1 ); //Cada unidad de zoom crece 10px la altura del chart.

    this.rectangle_w = this.config.rectangle_w.nksum(rectangle_growth);
    this.rectangle_dist = this.config.rectangle_dist.nksum(rectangle_growth);
    this.chart_h = this.config.chart_h.nksum(chart_h_growth);

    if ( repaint ) this.repaint();
}




NKTimeValueChart.prototype.getYFromValue = function ( price ) {
    //console.log( price, this.chart_h, this.drawings_calc.max_price, this.drawings_calc.min_price );
    let px_per_value = (this.chart_h).nkdiv( this.drawings_calc.max_price.nkminus(this.drawings_calc.min_price) );
    return price.nkminus(this.drawings_calc.min_price).nkmul(px_per_value);
}
NKTimeValueChart.prototype.getValueFromY = function ( y ) {
    let px_per_value = (this.chart_h).nkdiv( this.drawings_calc.max_price.nkminus(this.drawings_calc.min_price) );
    let by = (this.chart_h).nkminus(y);
    return by.nkdiv(px_per_value).nksum(this.drawings_calc.min_price);
}
NKTimeValueChart.prototype.getTimeFromX = function ( x ) {
    let gap = this.rectangle_dist - this.rectangle_w;
    return Math.trunc( (x + (gap/2)) / this.rectangle_dist );
}
NKTimeValueChart.prototype.getXFromTimei = function ( time_i ) {
    let gap = this.rectangle_dist - this.rectangle_w;
    return time_i.nkmul(this.rectangle_dist).nkminus(gap/2);
}


NKTimeValueChart.prototype.addCandle = function ( time_i, timestamp, high, open, close, low, color = null ) {

    this.drawings.candles.push({
        time_i: time_i,
        t: timestamp,
        high: high,
        open: open,
        close: close,
        low: low,
        color: color
    });

    //this.drawCandle( time_i, high, open, close, low, color );
}

NKTimeValueChart.prototype.addLinePoint = function ( sid, time_i, value ) {
    if ( typeof this.drawings.point_lines[sid] === 'undefined' ) this.drawings.point_lines[sid] = [];
    this.drawings.point_lines[sid][time_i] = value;
}

NKTimeValueChart.prototype.addLineArray = function ( sid, line_points_array ) {
    this.drawings.point_lines[sid] = line_points_array;
}

NKTimeValueChart.prototype.addHorizontalLine = function ( sid, value, color = "lightblue" ) {
    
    this.drawings.simple_lines[sid] = {
        t1: 0,
        t2: null,
        v1: value,
        v2: value,
        color: color
    };

}

NKTimeValueChart.prototype.addRectangle = function ( sid, time_i, value_start, value_end, color = null ) {
    if ( typeof this.drawings.rectangles[sid] === 'undefined' ) this.drawings.rectangles[sid] = [];
    this.drawings.rectangles[sid][time_i] = [value_start, value_end, color];
}

NKTimeValueChart.prototype.addRectangleArray = function ( sid, rectangle_array ) {
    this.drawings.rectangles[sid] = rectangle_array;
}

NKTimeValueChart.prototype.addEvent = function ( time_i, title = "Event title", text = "Event text", args = null ) {
    this.drawings.events.push({time_i: time_i, title: title, text: text, args: args});
}


NKTimeValueChart.prototype._drawingsLoop = function ( cbk = function( type, sid, i, data ) {}, return_empty = true ) {

    for ( let i = 0; i < this.drawings.candles.length; i++ ) {
        if ( !return_empty ) {
            if ( this.drawings.candles[i].c === null ) continue;
        }

        cbk( "candle", "default", i, this.drawings.candles[i] );
    }

    for (let [line_sid, line_points_array] of Object.entries(this.drawings.point_lines)) {
        for ( let i = 0; i < line_points_array.length; i++ ) {

            if ( !return_empty && line_points_array[i] === null ) continue;

            cbk( "line", line_sid, i, line_points_array[i] );
        }
    }

    for (let [sid, line_data] of Object.entries(this.drawings.simple_lines)) {
        
        cbk( "simple_line", sid, null, line_data );
        
    }

    for (let [sid, rectangles_array] of Object.entries(this.drawings.rectangles)) {
        
        for ( let i = 0; i < rectangles_array.length; i++ ) {

            if ( !return_empty ) {
                if ( typeof rectangles_array[i] === 'undefined' ) continue;
                if ( rectangles_array[i] === null ) continue;
                if ( rectangles_array[i][0] === null || rectangles_array[i][1] === null ) continue;
            }

            cbk( "rectangle", sid, i, rectangles_array[i] );
        }
    }
}


NKTimeValueChart.prototype.repaint = function () {
   
    //Calcular maximos y minimos para saber el tamaño del canvas
    
    this.drawings_calc = {
        num_rectangles: 0,
        min_price: Infinity,
        max_price: 0,
    }
    
    this._drawingsLoop( (type, sid, i, data) => {
        if ( (i+1) > this.drawings_calc.num_rectangles ) this.drawings_calc.num_rectangles = i+1;

        let value_max = null;
        let value_min = null;

        if ( type === "candle" ) {
            value_max = data.high;
            value_min = data.low;
        
        } else if ( type === "line" ) {
            value_max = data;
            value_min = data;

        } else if ( type === "simple_line" ) {
            value_max = Math.max( data.v1, data.v2);
            value_min = Math.min( data.v1, data.v2);

        } else if ( type === "rectangle" ) {
            value_max = Math.max( data[0], data[1]);
            value_min = Math.min( data[0], data[1]);
        }

        if ( value_max !== null && value_max > this.drawings_calc.max_price ) this.drawings_calc.max_price = value_max;
        if ( value_min !== null && value_min < this.drawings_calc.min_price ) this.drawings_calc.min_price = value_min;
        

    }, false);
    
    this.chart_w = (this.drawings_calc.num_rectangles-1).nkmul(this.rectangle_dist).nksum(this.rectangle_w);

    this.drawbox.clean();
    this.drawbox.setSize(this.chart_w, this.chart_h);

    //this.configTimeLine( this.timeline_drawbox.wrapper_id, new Date(this.drawings.candles[0].time_i), new Date(this.drawings.candles[1].time_i) );
    //this.configValueLine( this.valueline_drawbox.wrapper_id, 25 );

    for ( let i = 0; i < this.drawings.candles.length; i++ ) {
        let candle = this.drawings.candles[i];
        this.drawCandle( candle.time_i, candle.high, candle.open, candle.close, candle.low, candle.color );
    }

    for (let [line_sid, line_points_array] of Object.entries(this.drawings.point_lines)) {
        let last_x = null;
        let last_y = null;

        for ( let i = 0; i < line_points_array.length; i++ ) {
            if ( line_points_array[i] === null ) continue;

            let x = i.nkmul(this.rectangle_dist);
            let y = this.getYFromValue(line_points_array[i]).nkfixed(2);

            if ( last_x !== null ) {
                this.drawbox.drawLine({
                    x: last_x,
                    x2: x,
                    by: last_y,
                    by2: y,
                    color: "lightblue"
                });
            }

            last_x = x;
            last_y = y;
        }
    }

    for (let [sid, rectangles_array] of Object.entries(this.drawings.rectangles)) {
        
        for ( let i = 0; i < rectangles_array.length; i++ ) {
            if ( typeof rectangles_array[i] === 'undefined' ) continue;
            if ( rectangles_array[i] === null ) continue;
            if ( rectangles_array[i][0] === null || rectangles_array[i][1] === null ) continue;
            
            this.drawRectangle( i, rectangles_array[i][0], rectangles_array[i][1], rectangles_array[i][2] );
        }
    }

    for (let [sid, line_data] of Object.entries(this.drawings.simple_lines)) {
        let x1 = line_data.t1.nkmul(this.rectangle_dist);
        let x2 = (line_data.t2 === null) ? this.chart_w : line_data.t2.nkmul(this.rectangle_dist);
        let y1 = this.getYFromValue(line_data.v1).nkfixed(2);
        let y2 = this.getYFromValue(line_data.v2).nkfixed(2);

        this.drawbox.drawLine({
            x: x1,
            x2: x2,
            by: y1,
            by2: y2,
            color: line_data.color
        });

    }

    this.drawTimeLine();
    this.drawValueLine();
    this.drawEventLine();

}

NKTimeValueChart.prototype.drawCandle = function ( time_i, high, open, close, low, color = null ) {
    
    let default_color = open < close ? "#EF5350" : "#26A69A";
    if ( color === null ) color = default_color;
    

    let candle_x = time_i.nkmul(this.rectangle_dist);
    let line_x = candle_x.nksum( this.rectangle_w.nkminus(1).nkdiv(2) );

    
    if ( high !== null && low !== null ) {
        high = this.getYFromValue(high);
        low = this.getYFromValue(low);

        this.drawbox.drawLine({
            x: line_x,
            by: high,
            x2: line_x,
            by2: low,
            w: 1,
            color: color,
        });
    }

    if ( open !== null && close !== null ) {
        open = this.getYFromValue(open);
        close = this.getYFromValue(close);

        this.drawbox.drawRect({
            x: candle_x,
            by: Math.max(open, close),
            w: this.rectangle_w,
            h: open.nkminus(close).nkabs(),
            color: color
        });
    }

}

NKTimeValueChart.prototype.drawRectangle = function ( time_i, value_start, value_end, color = null ) {
    
    let default_color = value_start > value_end ? "#EF5350" : "#26A69A";
    if ( color === null ) color = default_color;
    
    let candle_x = time_i.nkmul(this.rectangle_dist);

    let y1 = this.getYFromValue(value_start);
    let y2 = this.getYFromValue(value_end);


    this.drawbox.drawRect({
        x: candle_x,
        by: Math.max(y1, y2),
        w: this.rectangle_w,
        h: y1.nkminus(y2).nkabs(),
        color: color
    });

}





NKTimeValueChart.prototype.drawTimeLine = function () {
    if ( this.timeline_drawbox === null ) return;

    this.timeline_drawbox.clean();
    this.timeline_drawbox.setSize( this.chart_w, 28 );
    
    let total_rectangles = this.drawings_calc.num_rectangles;

   
    let candles = this.drawings.candles;

    for ( let i = 0; i < total_rectangles; i++ ) {
        if ( i % 10 !== 0 ) continue;

        let x = i.nkmul(this.rectangle_dist).nksum( this.rectangle_w.nkminus(1).nkdiv(2) );

        this.timeline_drawbox.drawLine({
            x: x,
            y: 0,
            x2: x,
            y2: 4,
        });

        
        if ( typeof candles[i] === 'undefined' ) continue;

        //El mercado no está abierto las 24h
        let date_aux = new Date(candles[i].t);
        console.log(i, candles[i].t);

        let h_text = NKDate.getString( date_aux, "hh:mm" );
        let d_text =  NKDate.getString( date_aux, "DD/MM/YY" )

        this.timeline_drawbox.drawText({
            x: x,
            y: 5,
            text: h_text,
            font_size: 10,
            font_family: "Arial, sans-serif",
        });
        this.timeline_drawbox.drawText({
            x: x,
            y: 14,
            text: d_text,
            font_size: 10,
            font_family: "Arial, sans-serif",
        });
        
    }

}

NKTimeValueChart.prototype.drawEventLine = function () {
    if ( this.eventline_drawbox === null ) return;

    let event_array = this.drawings.events;

    this.eventline_drawbox.clean();
    this.eventline_drawbox.setSize( this.chart_w, 20 );

    for ( let i = 0; i < event_array.length; i++ ) {
        let event = event_array[i];
        let x = (event.time_i).nkmul(this.rectangle_dist).nksum( this.rectangle_w.nkminus(1).nkdiv(2) );


        this.eventline_drawbox.drawLine({
            x: x,
            y: 0,
            x2: x,
            y2: 4,
        });

        this.eventline_drawbox.drawText({
            x: x,
            y: 5,
            text: event.title,
            font_size: 12,
            font_family: "Arial, sans-serif",
        });
    }

    
}


NKTimeValueChart.prototype.drawValueLine = function () {
    if ( this.valueline_drawbox === null ) return;

    this.valueline_drawbox.clean();
    this.valueline_drawbox.setSize( 50, this.chart_h );

    let h_aux = 7;

    while ( h_aux < this.chart_h ) {
        this.valueline_drawbox.drawLine({
            x: 0,
            y: h_aux,
            x2: 5,
            y2: h_aux,
        });

        this.valueline_drawbox.drawText({
            x: 8,
            y: h_aux - 5,
            text: this.getValueFromY(h_aux).toFixed(2),
            font_size: 10,
            font_family: "Arial, sans-serif",
        });

        h_aux += this.config.gap_h;
    }

}


NKTimeValueChart.prototype.setMouseMoveCbk = function ( cbk = (x, y, time_i, price_value) => {} ) {
    let self = this;
    
    this.drawbox.onMouseMoveCbk = function (x, y) {
        cbk(x, y, self.getTimeFromX(x), self.getValueFromY(y) );
    }
}
