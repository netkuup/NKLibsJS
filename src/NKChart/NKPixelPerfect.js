

function NKPixelPerfect() {
    this.zoom_x = 3;
    this.zoom_y = 1;
    this.candles = {
        rectangle_w: 5, //Ancho de la vela, tiene que ser IMPAR para poner la linea central.
        rectangle_dist: 8, //Ancho de la vela + ancho del espacio entre velas. Puede ser PAR O IMPAR.
        chart_h: 200,
        raw: {
            rectangle_w: 8,
            rectangle_dist: 7,
            chart_h: 200,
        }
    };
    
    if ( window.devicePixelRatio !== 1 ) {
        console.warn( "NKPixelPerfect: The browser zoom level is not set to 100%. This may affect visual rendering." );
    }

}


NKPixelPerfect.prototype.configCandles = function ( rectangle_w = 5, gap_px = 3, chart_h = 200 ) {
    this.candles.raw.rectangle_w = rectangle_w;
    this.candles.raw.rectangle_dist = rectangle_w.nksum( gap_px );
    this.candles.raw.chart_h = chart_h;
    
    if ( rectangle_w % 2 === 0 ) {
        console.error("NKPixelPerfect.configCandles: rectangle_w debe ser impar para que la linea central quede bien alineada.");
    }

    this.setCandlesZoom( this.zoom_x, this.zoom_y );
}

NKPixelPerfect.prototype.setCandlesZoom = function ( zoom_x = 1, zoom_y = 1 ) {
    this.zoom_x = parseInt(zoom_x); //Tiene que ser un valor entero.
    this.zoom_y = parseInt(zoom_y);

    let rectangle_growth = (2).nkmul( this.zoom_x - 1 ); //Cada unidad de zoom crece 2px el ancho de la vela (1px por lado).
    let chart_h_growth = (10).nkmul( this.zoom_y - 1 ); //Cada unidad de zoom crece 10px la altura del chart.

    this.candles.rectangle_w = this.candles.raw.rectangle_w.nksum(rectangle_growth);
    this.candles.rectangle_dist = this.candles.raw.rectangle_dist.nksum(rectangle_growth);
    this.candles.chart_h = this.candles.raw.chart_h.nksum(chart_h_growth);
}

NKPixelPerfect.prototype.calcCandlesTotalWidth = function ( num_candles ) {
    return this.candles.rectangle_dist.nkmul(num_candles-1).nksum( this.candles.rectangle_w );
}

NKPixelPerfect.prototype.calcCandlesPxPerValue = function ( min_price, max_price ) {
    return this.candles.chart_h.nkdiv( max_price.nkminus(min_price) );
}

NKPixelPerfect.prototype.calcCandlePos = function ( min_price, max_price, current_price ) {
    let px_per_value = this.candles.chart_h.nkdiv( max_price.nkminus(min_price) );
    return current_price.nkminus(min_price).nkmul(px_per_value);
}


NKPixelPerfect.prototype.configBars = function ( x_gap_px ) {
    //this.x_gap_px = x_gap_px;
}