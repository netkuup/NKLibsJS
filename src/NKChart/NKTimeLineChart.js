
function NKTimeLineChart ( wrapper_id, w = 600 ) {
    this.wrapper_id = wrapper_id;
    this.drawbox = null;
    this.horizontal = true;
    this.px_per_second = -1;
    this.w = w;


    let is_canvas = ( document.getElementById( wrapper_id ) instanceof HTMLCanvasElement );

    this.drawbox = is_canvas ? new NKCanvas( this.wrapper_id ) : new NKDrawbox( this.wrapper_id );
}

NKTimeLineChart.prototype.setSize = function ( w = 600 ) {
    this.w = w;
}

NKTimeLineChart.prototype.setScale = function ( px_per_second = 0.1 ) {
    this.px_per_second = px_per_second;
}

NKTimeLineChart.prototype.setMouseMoveCbk = function ( cbk ) {
    let self = this;

    this.drawbox.onMouseMoveCbk = function (x, y) {
        cbk(x, y, null);
    }
}


NKTimeLineChart.prototype.drawValues = function ( min_timestamp, max_timestamp, milliseconds = true ) {
    let min_timestamp_s = min_timestamp.nkdiv(1000); //milliseconds to seconds
    let max_timestamp_s = max_timestamp.nkdiv(1000);


    if ( this.px_per_second === -1 ) this.px_per_second = (this.w).nkdiv( max_timestamp_s.nkminus(min_timestamp_s) );

    this.w = max_timestamp_s.nkminus(min_timestamp_s).nkmul(this.px_per_second);//3600s = 1h

    this.drawbox.clean();

    if ( this.horizontal ) {
        this.drawbox.setSize( this.w, 28 );
    } else {
        this.drawbox.setSize( 50, this.w );

        console.error("NKScaleChart vertical: Not implemented.");
        return;
    }

    let min_timestamp_obj = new Date( min_timestamp );
    let next_hour = new Date( min_timestamp );
    next_hour.setHours(min_timestamp_obj.getHours() + 1, 0, 0, 0);
    let diff_ms = NKDate.getUnixTimestamp(next_hour) - min_timestamp_obj;

    let total_hours = Math.floor( max_timestamp.nkminus(min_timestamp).nkdiv(3600000) );

    let first_line_x = diff_ms.nkdiv(1000).nkmul(this.px_per_second);



    for ( let i = 0; i < total_hours; i++ ) {
        this.drawbox.drawLine({
            x: first_line_x,
            y: 0,
            x2: first_line_x,
            y2: 4,
        });


        let h_text = NKDate.getString( next_hour, "hh:mm" );
        let d_text =  NKDate.getString( next_hour, "DD/MM" )

        this.drawbox.drawText({
            x: first_line_x,
            y: 5,
            text: h_text,
            font_size: 10,
            font_family: "Arial, sans-serif",
        });
        this.drawbox.drawText({
            x: first_line_x,
            y: 14,
            text: d_text,
            font_size: 10,
            font_family: "Arial, sans-serif",
        });

        first_line_x += (3600).nkmul(this.px_per_second); //3600s = 1h

        NKDate.addHours(next_hour, 1);
    }



}