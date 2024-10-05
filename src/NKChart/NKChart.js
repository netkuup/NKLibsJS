
function NKCandleChart ( wrapper_id, px_per_second = -1, px_per_coin = 8 ) {
    this.wrapper_id = wrapper_id;
    this.drawbox = null;
    this.px_per_second = px_per_second;
    this.px_per_coin = px_per_coin;
    this.w = -1;
    this.h = -1;
}

NKCandleChart.prototype.drawCandles = function ( candle_array ) {
    if ( this.px_per_second === -1 ) this.px_per_second = 0.1; //Hay una candle cada 1min
    if ( this.px_per_coin === -1 ) this.px_per_coin = 1;  //(layerh/(this.max_price-this.min_price))*this.zoom_y;
    //this.px_per_coin = ( isFinite(px_per_coin) ) ? px_per_coin : 1;

    if ( candle_array.length === 0 ) return;

    let min_price = Infinity;
    let max_price = 0;

    for ( let i = 0; i < candle_array.length; i++ ) {
        if ( candle_array[i].low < min_price ) min_price = candle_array[i].low;
        if ( candle_array[i].high > max_price ) max_price = candle_array[i].high;
    }

    this.h = max_price.nkminus(min_price).nkmul(this.px_per_coin);
    this.w = (candle_array.length).nkmul(60).nkmul(this.px_per_second); //60 seg per candle (1min)

    this.drawbox = new NKDrawbox( this.wrapper_id, this.w, this.h );


    let timestamp0_secs = (candle_array[0].timestamp).nkdiv(1000);

    let rw = 1;


    for ( let i = 0; i < candle_array.length; i++ ) {
        let candle = candle_array[i];


        let low = this.h - (candle.low-min_price) * this.px_per_coin;
        let high = this.h - (candle.high-min_price) * this.px_per_coin;
        let open = this.h - (candle.open-min_price) * this.px_per_coin;
        let close = this.h - (candle.close-min_price) * this.px_per_coin;

        let x = (candle.timestamp).nkdiv(1000).nkminus(timestamp0_secs).nkmul(this.px_per_second);

        let y1 = high;
        let y2 = low;

        let color = open < close ? "red" : "green";

        let w = (60).nkmul(this.px_per_second); //Usar 60 segundos para dibujar cada candle
        //let x_rect = x.nkminus( (35).nkmul(this.px_per_second) )
        let line_x = x.nkadd( (35).nkmul(this.px_per_second) )


        this.drawbox.drawLine({
            x: line_x,
            y: y1,
            x2: line_x,
            y2: y2,
            w: 1,
            color: "gray",
        });

        this.drawbox.drawRect({
            x: x,
            y: Math.min(open, close),
            w: w,
            h: Math.abs(open-close),
            color: color
        });



    }


}