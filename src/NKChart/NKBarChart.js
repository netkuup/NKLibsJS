
function NKBarChart ( wrapper_id, w = 600, h = 300) {
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

NKBarChart.prototype.setSize = function ( w = 600, h = 300 ) {
    this.w = w;
    this.h = h;
}

NKBarChart.prototype.setScale = function ( px_per_second = 0.1, px_per_value = 0.1 ) {
    this.px_per_second = px_per_second;
    this.px_per_value = px_per_value;
}

NKBarChart.prototype.setMouseMoveCbk = function ( cbk ) {
    let self = this;

    this.drawbox.onMouseMoveCbk = function (x, y) {
        let minutes = parseInt( x.nkdiv( self.px_per_second ).nkdiv(60) );
        try {
            cbk(x, y, self.data_ref[minutes]);
        } catch (e){}

    }
}

NKBarChart.prototype.drawBars = function ( bar_array ) {
    if ( bar_array.length === 0 ) return;

    this.data_ref = bar_array;

    let min_value = Infinity;
    let max_value = 0;
    let min_timestamp = Infinity;
    let max_timestamp = 0;

    for ( let i = 0; i < bar_array.length; i++ ) {
        if ( bar_array[i].value < min_value ) min_value = bar_array[i].value;
        if ( bar_array[i].value > max_value ) max_value = bar_array[i].value;
        if ( bar_array[i].timestamp < min_timestamp ) min_timestamp = bar_array[i].timestamp;
        if ( bar_array[i].timestamp > max_timestamp ) max_timestamp = bar_array[i].timestamp;
    }

    min_timestamp = min_timestamp.nkdiv(1000); //milliseconds to seconds
    max_timestamp = max_timestamp.nkdiv(1000);

    if ( this.px_per_second === -1 ) this.px_per_second = (this.w).nkdiv( max_timestamp.nkminus(min_timestamp) );
    if ( this.px_per_value === -1 ) this.px_per_value = (this.h).nkdiv( max_value.nkminus(min_value) );

    let neg_values = (min_value < 0);

    this.h = max_value.nkminus(min_value).nkmul(this.px_per_value);
    this.w = max_timestamp.nkminus(min_timestamp).nkmul(this.px_per_second);

    this.drawbox.clean();
    this.drawbox.setSize(this.w, this.h);


    if ( neg_values ) { //Base line
        let base_line_y = (this.h).nksum(min_value.nkmul(this.px_per_value));
        this.drawbox.drawLine({
            x: 0,
            y: base_line_y,
            x2: this.w,
            y2: base_line_y,
            w: 1,
            color: "#E0E3EB"
        });
    }

    let w = (50).nkmul(this.px_per_second); //Usar 50 segundos para dibujar cada candle

    for ( let i = 0; i < bar_array.length; i++ ) {
        let bar = bar_array[i];

        let x = (bar.timestamp).nkdiv(1000).nkminus(min_timestamp).nkmul(this.px_per_second);
        let h = (bar.value).nkmul(this.px_per_value);
        let y = (this.h).nkminus( (bar.value).nkminus(min_value).nkmul(this.px_per_value) );

        this.drawbox.drawRect({
            x: x,
            y: y,
            w: w,
            h: h,
            color: bar.color,
            border_px: 0
        });

    }


}