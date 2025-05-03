
function NKTimeValueChart ( wrapper_id ) {
    this.drawbox = new NKDrawbox( wrapper_id );
    this.timeline_drawbox = null;
    this.valueline_drawbox = null;

    this.zoom_x = 1;
    this.zoom_y = 1;
    this.rectangle_w = 5; //Ancho de la vela, tiene que ser IMPAR para poner la linea central.
    this.rectangle_dist = 8; //Ancho de la vela + ancho del espacio entre velas. Puede ser PAR O IMPAR.
    
    this.drawings = {
        candles: [],
    }

    this.config = {
        min_price: 0,
        max_price: 0,
        num_rectangles: 0,
        rectangle_w: 5, //Este no se toca, el otro se modifica segun el zoom.
        rectangle_dist: 8,
    }

    
    if ( window.devicePixelRatio !== 1 ) {
        console.warn( "NKTimeValueChart: The browser zoom level is not set to 100%. This may affect visual rendering." );
    }

    this.configRectangles();
}

NKTimeValueChart.prototype.configTimeLine = function ( wrapper_id, candle_1_date, candle_2_date ) {
    this.timeline_drawbox = new NKDrawbox( wrapper_id );
    this.timeline_drawbox.setSize( this.drawbox.w, 28 );

    let total_rectangles = this.config.num_rectangles;

    let miliseconds_diff = candle_2_date - candle_1_date;
    //let date_aux = new Date(candle_1_date.getTime());

    for ( let i = 0; i < total_rectangles; i++ ) {
        if ( i % 10 !== 0 ) continue;

        let x = i.nkmul(this.rectangle_dist).nksum( this.rectangle_w.nkminus(1).nkdiv(2) );

        this.timeline_drawbox.drawLine({
            x: x,
            y: 0,
            x2: x,
            y2: 4,
        });

        let date_aux = new Date(candle_1_date.getTime() + miliseconds_diff.nkmul(i) );

        let h_text = NKDate.getString( date_aux, "hh:mm" );
        let d_text =  NKDate.getString( date_aux, "DD/MM" )

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

NKTimeValueChart.prototype.configValueLine = function ( wrapper_id, gap_px = 25 ) {
    this.valueline_drawbox = new NKDrawbox( wrapper_id );
    this.valueline_drawbox.setSize( 50, this.drawbox.h );

    let h_aux = 1;

    while ( h_aux < this.drawbox.h ) {
        this.valueline_drawbox.drawLine({
            x: 0,
            by: h_aux,
            x2: 5,
            by2: h_aux,
        });

        this.valueline_drawbox.drawText({
            x: 8,
            by: h_aux + 6,
            text: this.getValueFromY(h_aux).toFixed(2),
            font_size: 10,
            font_family: "Arial, sans-serif",
        });

        h_aux += gap_px;
    }

}


NKTimeValueChart.prototype.getYFromValue = function ( price ) {
    let px_per_value = (this.drawbox.h).nkdiv( this.config.max_price.nkminus(this.config.min_price) );
    return price.nkminus(this.config.min_price).nkmul(px_per_value);
}
NKTimeValueChart.prototype.getValueFromY = function ( y ) {
    let px_per_value = (this.drawbox.h).nkdiv( this.config.max_price.nkminus(this.config.min_price) );
    let by = (this.drawbox.h).nkminus(y);
    return by.nkdiv(px_per_value).nksum(this.config.min_price);
}
NKTimeValueChart.prototype.getTimeFromX = function ( x ) {
    let gap = this.rectangle_dist - this.rectangle_w;
    return Math.trunc( (x + (gap/2)) / this.rectangle_dist );
}
NKTimeValueChart.prototype.getXFromTime = function ( time_i ) {
    let gap = this.rectangle_dist - this.rectangle_w;
    return time_i.nkmul(this.rectangle_dist).nkminus(gap/2);
}

NKTimeValueChart.prototype.setConfig = function ( num_rectangles = 0, min_price = 0, max_price = 100 ) {
    this.config.num_rectangles = num_rectangles;
    this.config.min_price = min_price;
    this.config.max_price = max_price;

    let drawbox_h = 300;
    let drawbox_w = (num_rectangles-1).nkmul(this.rectangle_dist).nksum(this.rectangle_w);

    this.drawbox.clean();
    this.drawbox.setSize(drawbox_w, drawbox_h);
} 


NKTimeValueChart.prototype.configRectangles = function ( rectangle_w = 5, gap_px = 3 ) {
    this.config.rectangle_w = rectangle_w;
    this.config.rectangle_dist = rectangle_w.nksum( gap_px );

    if ( rectangle_w % 2 === 0 ) {
        console.error("NKPixelPerfect.configCandles: rectangle_w debe ser impar para que la linea central quede bien alineada.");
    }

    //this.setZoom( this.zoom_x, this.zoom_y );
}

NKTimeValueChart.prototype.setZoom = function ( zoom_x = null, zoom_y = null ) {
    this.zoom_x = (zoom_x !== null ) ? parseInt(zoom_x) : this.zoom_x; //Tiene que ser un valor entero.
    this.zoom_y = (zoom_y !== null ) ? parseInt(zoom_y) : this.zoom_y; 

    let rectangle_growth = (2).nkmul( this.zoom_x - 1 ); //Cada unidad de zoom crece 2px el ancho de la vela (1px por lado).
    let chart_h_growth = (10).nkmul( this.zoom_y - 1 ); //Cada unidad de zoom crece 10px la altura del chart.

    this.rectangle_w = this.config.rectangle_w.nksum(rectangle_growth);
    this.rectangle_dist = this.config.rectangle_dist.nksum(rectangle_growth);
    //this.chart_h = this.config.chart_h.nksum(chart_h_growth);

    this.repaint();
}


NKTimeValueChart.prototype.addCandle = function ( time_i, high, open, close, low, color = null ) {

    this.drawings.candles.push({
        time_i: time_i,
        high: high,
        open: open,
        close: close,
        low: low,
        color: color
    });

    this.drawCandle( time_i, high, open, close, low, color );
}

NKTimeValueChart.prototype.repaint = function () {
    this.drawbox.clean();
    //this.timeline_drawbox.clean();
    //this.valueline_drawbox.clean();

    this.setConfig( this.config.num_rectangles, this.config.min_price, this.config.max_price );
    //this.configTimeLine( this.timeline_drawbox.wrapper_id, new Date(this.drawings.candles[0].time_i), new Date(this.drawings.candles[1].time_i) );
    //this.configValueLine( this.valueline_drawbox.wrapper_id, 25 );

    for ( let i = 0; i < this.drawings.candles.length; i++ ) {
        let candle = this.drawings.candles[i];
        this.drawCandle( candle.time_i, candle.high, candle.open, candle.close, candle.low, candle.color );
    }
}

NKTimeValueChart.prototype.drawCandle = function ( time_i, high, open, close, low, color = null ) {
    
    let default_color = open < close ? "#EF5350" : "#26A69A";
    if ( color === null ) color = default_color;
    

    let candle_x = time_i.nkmul(this.rectangle_dist);
    let line_x = candle_x.nksum( this.rectangle_w.nkminus(1).nkdiv(2) );

    open = this.getYFromValue(open);
    close = this.getYFromValue(close);
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

    this.drawbox.drawRect({
        x: candle_x,
        by: Math.max(open, close),
        w: this.rectangle_w,
        h: open.nkminus(close).nkabs(),
        color: color
    });

}


NKTimeValueChart.prototype.setMouseMoveCbk = function ( cbk = (x, y, time_i, price_value) => {} ) {
    let self = this;
    
    this.drawbox.onMouseMoveCbk = function (x, y) {
        cbk(x, y, self.getTimeFromX(x), self.getValueFromY(y) );
    }
}
