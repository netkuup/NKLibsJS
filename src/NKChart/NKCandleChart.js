
function NKCandleChart ( wrapper_id, w = 600, h = 300 ) {
    this.wrapper_id = wrapper_id;
    this.drawbox = null;
    this.px_per_second = -1;
    this.px_per_value = -1;
    this.w = w;
    this.h = h;
    this.data_ref = [];

    let is_canvas = ( document.getElementById( wrapper_id ) instanceof HTMLCanvasElement );

    this.drawbox = is_canvas ? new NKCanvas( this.wrapper_id ) : new NKDrawbox( this.wrapper_id );
}

NKCandleChart.prototype.setSize = function ( w = 600, h = 300 ) {
    this.w = w;
    this.h = h;
}

NKCandleChart.prototype.setScale = function ( px_per_second = 0.1, px_per_value = 0.1 ) {
    this.px_per_second = px_per_second;
    this.px_per_value = px_per_value;
}

NKCandleChart.prototype.setMouseMoveCbk = function ( cbk ) {
    let self = this;

    this.drawbox.onMouseMoveCbk = function (x, y) {
        let minutes = parseInt( x.nkdiv( self.px_per_second ).nkdiv(60) );
        try {
            cbk(x, y, self.data_ref[minutes]);
        } catch (e){}

    }
}

/*
NKCandleChart.prototype.zoomW = function ( x ) {
    this.px_per_second = (this.px_per_second).nksum(x);
}

NKCandleChart.prototype.zoomH = function ( y ) {
    this.px_per_value = (this.px_per_value).nksum(y);
}*/

NKCandleChart.prototype.drawCandles = function ( candle_array ) {
    if ( candle_array.length === 0 ) return;

    this.data_ref = candle_array;

    let min_price = Infinity;
    let max_price = 0;
    let min_timestamp = Infinity;
    let max_timestamp = 0;

    for ( let i = 0; i < candle_array.length; i++ ) {
        if ( candle_array[i].low < min_price ) min_price = candle_array[i].low;
        if ( candle_array[i].high > max_price ) max_price = candle_array[i].high;
        if ( candle_array[i].timestamp < min_timestamp ) min_timestamp = candle_array[i].timestamp;
        if ( candle_array[i].timestamp > max_timestamp ) max_timestamp = candle_array[i].timestamp;
    }

    min_timestamp = min_timestamp.nkdiv(1000); //milliseconds to seconds
    max_timestamp = max_timestamp.nkdiv(1000);

    if ( this.px_per_second === -1 ) this.px_per_second = (this.w).nkdiv( max_timestamp.nkminus(min_timestamp) );
    if ( this.px_per_value === -1 ) this.px_per_value = (this.h).nkdiv( max_price.nkminus(min_price) );

    this.h = max_price.nkminus(min_price).nkmul(this.px_per_value);
    this.w = (candle_array.length).nkmul(60).nkmul(this.px_per_second); //60 seg per candle (1min)

    this.drawbox.clean();
    this.drawbox.setSize(this.w, this.h);


    let rw = 1;


    for ( let i = 0; i < candle_array.length; i++ ) {
        let candle = candle_array[i];


        let low = this.h - (candle.low-min_price) * this.px_per_value;
        let high = this.h - (candle.high-min_price) * this.px_per_value;
        let open = this.h - (candle.open-min_price) * this.px_per_value;
        let close = this.h - (candle.close-min_price) * this.px_per_value;


        let x = (candle.timestamp).nkdiv(1000).nkminus(min_timestamp).nkmul(this.px_per_second);

        let y1 = high;
        let y2 = low;

        //Red: #EF5350
        //Green: #26A69A
        let default_color = open < close ? "#EF5350" : "#26A69A";
        let color = candle.color ? candle.color : default_color;

        let w = (50).nkmul(this.px_per_second); //Usar 60 segundos para dibujar cada candle

        //let x_rect = x.nkminus( (35).nkmul(this.px_per_second) )
        let line_x = x.nkadd( (35).nkmul(this.px_per_second) );
        let candle_x = x.nksum( (5).nkmul(this.px_per_second) ); //Como el ancho del candle es 50seg en vez de 60, le sumamos 5seg por lado




        this.drawbox.drawLine({
            x: line_x,
            y: y1,
            x2: line_x,
            y2: y2,
            w: 1,
            color: color,
        });

        this.drawbox.drawRect({
            x: candle_x,
            y: Math.min(open, close),
            w: w,
            h: Math.abs(open-close),
            color: color,
            border_px: 0
        });



    }


}