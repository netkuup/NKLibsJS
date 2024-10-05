/*if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before loader.js";
}*/

function NKDrawbox ( wrapper_id, w = 400, h = 200 ) {
    this.wrapper = null;
    this.drawings = [];

    let wrapper_div = document.getElementById(wrapper_id);

    if ( wrapper_div === null ) return console.error("NKDrawbox: Error, invalid id '" + wrapper_id + "'");
    wrapper_div.style.display = 'inline-block';
    wrapper_div.style.width = w + 'px';
    wrapper_div.style.height = h + 'px';
    wrapper_div.innerHTML = '';

    this.wrapper = wrapper_div.attachShadow({ mode: 'open' });
}


NKDrawbox.prototype._drawDiv = function ( args ) {
   // console.log(args);
    const new_div = document.createElement('div');

    new_div.style.position = 'absolute';
    new_div.style.transformOrigin = 'top left';

    if ( args.x ) new_div.style.left = args.x + 'px';
    if ( args.y ) new_div.style.top = args.y + 'px';

    if ( args.w ) new_div.style.width = args.w + 'px';
    if ( args.h ) new_div.style.height = args.h + 'px';

    if ( args.color ) new_div.style.backgroundColor = args.color;

    if ( args.border_px || args.border_color || args.border_style ) {
        if ( !args.border_px ) args.border_px = 1;
        if ( !args.border_color ) args.border_color = "black";
        if ( !args.border_style ) args.border_style = "solid"; //dotted
        new_div.style.border  =  args.border_px + 'px ' + args.border_style + ' ' + args.border_color;
    }

    if ( args.border_top_px || args.border_top_color || args.border_top_style ) {
        if ( !args.border_top_px ) args.border_top_px = 1;
        if ( !args.border_top_color ) args.border_top_color = "black";
        if ( !args.border_top_style ) args.border_top_style = "solid"; //dotted
        new_div.style.borderTop  =  args.border_top_px + 'px ' + args.border_top_style + ' ' + args.border_top_color;
    }

    let transform = "";
    if ( args.rotate ) transform += `rotate(${args.rotate}deg) `;
    new_div.style.transform = transform;

    this.wrapper.appendChild(new_div);
}


NKDrawbox.prototype.drawRect = function( args ) {
    if ( args.x && args.x2 ) args.w = (args.x2).nkminus(args.x);
    if ( args.y && args.y2 ) args.h = (args.y2).nkminus(args.y);

    this._drawDiv( args );
};

NKDrawbox.prototype.drawLine = function( args ) {

    const length = ((args.x2).nkminus(args.x).nkpow(2).nksum( (args.y2).nkminus(args.y).nkpow(2) )).nksqrt();
    const angle = Math.atan2( (args.y2).nkminus(args.y), (args.x2).nkminus(args.x) ).nkmul( (180).nkdiv(Math.PI) );

    this._drawDiv({
        x: args.x,
        y: args.y,
        w: length,
        rotate: angle,
        border_top_px: args.w || 1,
        border_top_color: args.color || "black",
        border_top_style: args.style || "solid"
    });
}