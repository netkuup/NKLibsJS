
function NKCandleChart ( wrapper_id, w = 600, h = 300 ) {
    this.wrapper_id = wrapper_id;
    this.drawbox = null;
    this.nkpixelperfect = new NKPixelPerfect();

    this.data_ref = [];

    let is_canvas = ( document.getElementById( wrapper_id ) instanceof HTMLCanvasElement );

    this.drawbox = is_canvas ? new NKCanvas( this.wrapper_id ) : new NKDrawbox( this.wrapper_id );

    this.nkpixelperfect.configCandles();

}

NKCandleChart.prototype.setZoom = function ( zoom_x = 1, zoom_y = 1 ) {
    this.nkpixelperfect.setCandlesZoom( zoom_x, zoom_y );
}


NKCandleChart.prototype.setMouseMoveCbk = function ( cbk = (x, y, candle_i) => {} ) {
    let self = this;
    
    this.drawbox.onMouseMoveCbk = function (x, y) {
        let gap = self.nkpixelperfect.candles.rectangle_dist - self.nkpixelperfect.candles.rectangle_w;
        let candle_i = Math.trunc( (x + (gap/2)) /self.nkpixelperfect.candles.rectangle_dist);

        cbk(x, y, candle_i);
    }
}




NKCandleChart.prototype.getCandleData = function ( candle_array ) {
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

    return {
        min_price: min_price,
        max_price: max_price,
        min_timestamp: min_timestamp,
        max_timestamp: max_timestamp,
    };
}


NKCandleChart.prototype.drawCandles = function ( candle_array ) {
    if ( candle_array.length === 0 ) return;

    this.data_ref = candle_array;

    let cd = this.getCandleData( candle_array );

    let px_per_value = this.nkpixelperfect.calcCandlesPxPerValue( cd.min_price, cd.max_price );


    let drawbox_h = this.nkpixelperfect.candles.chart_h;
    let drawbox_w = this.nkpixelperfect.calcCandlesTotalWidth( candle_array.length );

    this.drawbox.clean();
    this.drawbox.setSize(drawbox_w, drawbox_h);



    for ( let i = 0; i < candle_array.length; i++ ) {
        let candle = candle_array[i];


        let low = (candle.low-cd.min_price) * px_per_value;
        let high =  (candle.high-cd.min_price) * px_per_value;
        let open =  (candle.open-cd.min_price) * px_per_value;
        let close =  (candle.close-cd.min_price) * px_per_value;


        //Red: #EF5350
        //Green: #26A69A
        let default_color = open < close ? "#EF5350" : "#26A69A";
        let color = candle.color ? candle.color : default_color;

        
        let candle_x = this.nkpixelperfect.candles.rectangle_dist.nkmul(i);
        let line_x = candle_x.nksum( this.nkpixelperfect.candles.rectangle_w.nkminus(1).nkdiv(2) );


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
            w: this.nkpixelperfect.candles.rectangle_w,
            h: open.nkminus(close).nkabs(),
            color: color,
            border_px: 0
        });



    }


}