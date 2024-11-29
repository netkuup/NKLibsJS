
function NKPointChart ( wrapper_id, connect_points = true, w = 600, h = 300) {
    this.wrapper_id = wrapper_id;
    this.drawbox = null;
    this.connect_points = connect_points;
    this.px_per_second = -1;
    this.px_per_value = -1;
    this.w = w;
    this.h = h;
    this.data_ref = [];


    let is_canvas = ( document.getElementById( wrapper_id ) instanceof HTMLCanvasElement );

    this.drawbox = is_canvas ? new NKCanvas( this.wrapper_id ) : new NKDrawbox( this.wrapper_id );

}

NKPointChart.prototype.setSize = function ( w = 600, h = 300 ) {
    this.w = w;
    this.h = h;
}

NKPointChart.prototype.setScale = function ( px_per_second = 0.1, px_per_value = 0.1 ) {
    this.px_per_second = px_per_second;
    this.px_per_value = px_per_value;
}

NKPointChart.prototype.setMouseMoveCbk = function ( cbk ) {
    let self = this;

    this.drawbox.onMouseMoveCbk = function (x, y) {
        let minutes = parseInt( x.nkdiv( self.px_per_second ).nkdiv(60) );
        try {
            cbk(x, y, self.data_ref[minutes]);
        } catch (e){}

    }
}

NKPointChart.prototype.drawPoints = function ( point_array ) {
    if ( point_array.length === 0 ) return;

    this.data_ref = point_array;

    let min_value = Infinity;
    let max_value = 0;
    let min_timestamp = Infinity;
    let max_timestamp = 0;

    for ( let i = 0; i < point_array.length; i++ ) {
        if ( point_array[i].value < min_value ) min_value = point_array[i].value;
        if ( point_array[i].value > max_value ) max_value = point_array[i].value;
        if ( point_array[i].timestamp < min_timestamp ) min_timestamp = point_array[i].timestamp;
        if ( point_array[i].timestamp > max_timestamp ) max_timestamp = point_array[i].timestamp;
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
        let base_line_y = (this.h).nksum( min_value.nkmul(this.px_per_value) );
        this.drawbox.drawLine({
            x: 0,
            y: base_line_y,
            x2: this.w,
            y2: base_line_y,
            w: 1,
            color: "#E0E3EB"
        });
    }

    let last_x = null;
    let last_y = null;

    for ( let i = 0; i < point_array.length; i++ ) {
        let point = point_array[i];

        let x = (point.timestamp).nkdiv(1000).nkminus(min_timestamp).nkmul(this.px_per_second);
        let y = (this.h).nkminus( (point.value).nkminus(min_value).nkmul(this.px_per_value) );

        if ( (this.connect_points || point.connect_prev === true)  && point.connect_prev !== false && last_x !== null ) {
            this.drawbox.drawLine({
                x: last_x,
                y: last_y,
                x2: x,
                y2: y,
                w: 1,
                color: "blue",
                style: "solid"
            });
        }

        this.drawbox.drawCircle({
            x: x,
            y: y,
            r: 1.5,
            color: "blue"
        });

        last_x = x;
        last_y = y;
    }


}