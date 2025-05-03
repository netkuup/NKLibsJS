/*if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before loader.js";
}*/

function NKDrawbox ( wrapper_id, w = 400, h = 200 ) {
    this.wrapper = null;
    this.shadow = null;
    this.onMouseMoveCbk = null;
    this.drawings = [];
    this.h = h;
    this.w = w;

    this.wrapper = document.getElementById(wrapper_id);

    if ( this.wrapper === null ) return console.error("NKDrawbox: Error, invalid id '" + wrapper_id + "'");
    this.wrapper.style.display = 'inline-block';
    this.wrapper.style.width = w + 'px';
    this.wrapper.style.height = h + 'px';
    this.wrapper.style.overflow = 'hidden';
    this.wrapper.style.position = 'relative';
    this.wrapper.innerHTML = '';

    //If initialized, get the existent shadowRoot
    this.shadow = this.wrapper.shadowRoot || this.wrapper.attachShadow({ mode: 'open' });

    this.wrapper.addEventListener("mousemove", (event) => {
        /*const rect = this.shadow.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        console.log(`Posición del mouse en el div: X: ${x}, Y: ${y}`);*/

        /*const x = event.offsetX;
        const y = event.offsetY;
        console.log(`Posición del mouse en el div: X: ${x}, Y: ${y}`);*/
        if ( this.onMouseMoveCbk !== null ) this.onMouseMoveCbk(event.offsetX, event.offsetY);
    });
}

NKDrawbox.prototype.clean = function () {
    this.shadow.innerHTML = '';
    this.first_time = false;
}

NKDrawbox.prototype.setSize = function ( w = 400, h = 200 ) {
    this.wrapper.style.width = w + 'px';
    this.wrapper.style.height = h + 'px';
    this.h = h;
    this.w = w;
}


NKDrawbox.prototype._drawDiv = function ( args ) {
   // console.log(args);
    const new_div = document.createElement('div');

    if ( !this.first_time ) {
        this.first_time = true;
        
        const style = document.createElement('style');
        //Todo lo de dentro del shadow son divs, sino pondria un nombre de clase
        style.textContent = `
        div {
            position: absolute;
        }
        `;
        //transform-origin: left top;
        this.shadow.appendChild(style);
    }
    

    let class_array = [];
    
    if ( typeof args.class === 'string' ) {
        class_array.push(args.class);
    } else if ( Array.isArray(args.class) ) {
        class_array.push(...args.class);
    }

    if ( class_array.length > 0 ) new_div.className = class_array.join(' ');
    

    //new_div.style.position = 'absolute';
    //new_div.style.transformOrigin = args.origin ? args.origin : 'top left';

    if ( NK.isset(args.origin) ) new_div.style.transformOrigin = args.origin;

    if ( NK.isset(args.h) && args.h < 0 ) { //Si le ponemos una altura negativa
        args.h = (args.h).nkabs();
        if ( NK.isset(args.y) ) args.y = (args.y).nksubtract(args.h);
    }

    if ( NK.isset(args.x) ) new_div.style.left = args.x + 'px';
    if ( NK.isset(args.y) ) new_div.style.top = args.y + 'px';

    if ( NK.isset(args.w) ) new_div.style.width = args.w + 'px';
    if ( NK.isset(args.h) ) new_div.style.height = args.h + 'px';

    if ( NK.isset(args.color) ) new_div.style.backgroundColor = args.color;

    if ( NK.isset(args.border_radius) ) new_div.style.borderRadius = args.border_radius + '%';

    if ( args.border_px || args.border_color || args.border_style ) {
        if ( !NK.isset(args.border_px) ) args.border_px = 1;
        if ( !NK.isset(args.border_color) ) args.border_color = "black";
        if ( !NK.isset(args.border_style) ) args.border_style = "solid"; //dotted
        if ( args.border_px > 0 ) new_div.style.border  =  args.border_px + 'px ' + args.border_style + ' ' + args.border_color;
    }

    if ( args.border_top_px || args.border_top_color || args.border_top_style ) {
        if ( !NK.isset(args.border_top_px) ) args.border_top_px = 1;
        if ( !NK.isset(args.border_top_color) ) args.border_top_color = "black";
        if ( !NK.isset(args.border_top_style) ) args.border_top_style = "solid"; //dotted
        if ( args.border_top_px > 0 ) new_div.style.borderTop  =  args.border_top_px + 'px ' + args.border_top_style + ' ' + args.border_top_color;
    }

    if ( args.border_right_px || args.border_right_color || args.border_right_style ) {
        if ( !NK.isset(args.border_right_px) ) args.border_right_px = 1;
        if ( !NK.isset(args.border_right_color) ) args.border_right_color = "black";
        if ( !NK.isset(args.border_right_style) ) args.border_right_style = "solid"; //dotted
        if ( args.border_right_px > 0 ) new_div.style.borderRight  =  args.border_right_px + 'px ' + args.border_right_style + ' ' + args.border_right_color;
    }

    if ( args.border_left_px || args.border_left_color || args.border_left_style ) {
        if ( !NK.isset(args.border_left_px) ) args.border_left_px = 1;
        if ( !NK.isset(args.border_left_color) ) args.border_left_color = "black";
        if ( !NK.isset(args.border_left_style) ) args.border_left_style = "solid"; //dotted
        if ( args.border_left_px > 0 ) new_div.style.borderLeft  =  args.border_left_px + 'px ' + args.border_left_style + ' ' + args.border_left_color;
    }

    let transform = "";
    if ( NK.isset(args.rotate) ) transform += `rotate(${args.rotate}deg) `;
    new_div.style.transform = transform;

    if ( NK.isset(args.text) ) new_div.textContent = args.text;
    if ( NK.isset(args.font_color) ) new_div.style.color = args.font_color;
    if ( NK.isset(args.font_size) ) new_div.style.fontSize = isNaN(args.font_size) ? args.font_size : args.font_size + "px";
    if ( NK.isset(args.font_family) ) new_div.style.fontFamily = args.font_family;
    if ( NK.isset(args.font_weight) ) new_div.style.fontWeight = args.font_weight;

    

    this.shadow.appendChild(new_div);
}


NKDrawbox.prototype.drawRect = function( args ) {
    if ( NK.isset(args.by) ) args.y = (this.h).nkminus(args.by); //Bottom y
    if ( NK.isset(args.by2) ) args.y2 = (this.h).nkminus(args.by2); //Bottom y2

    let props = {
        x: args.x ?? 0,
        y: args.y ?? 0,
        w: args.w ?? 0,
        h: args.h ?? 0
    }

    if ( NK.isset(args.border_px) && args.border_px > 0 ) props.border_px = args.border_px;
    if ( NK.isset(args.border_color) ) props.border_color = args.border_color;

    if ( args.x && args.x2 ) props.w = (args.x2).nkminus(args.x);
    if ( args.y && args.y2 ) props.h = (args.y2).nkminus(args.y);

    if ( args.class ) props.class = args.class;
    if ( args.color ) props.color = args.color;
    if ( args.border_style ) props.border_style = args.border_style;

    this._drawDiv( props );
};

NKDrawbox.prototype.drawLine = function( args ) {
    if ( NK.isset(args.by) ) args.y = (this.h).nkminus(args.by); //Bottom y
    if ( NK.isset(args.by2) ) args.y2 = (this.h).nkminus(args.by2); //Bottom y2
    
    if ( args.x === args.x2 ) return this._drawVerticalLine( args );

    let props = {
        x: args.x ?? 0,
        y: args.y ?? 0,
        border_top_px: args.w ?? 1,
        border_top_color: args.color ?? "black",
        border_top_style: args.style ?? "solid"
    }

    // Line length
    props.w = ((args.x2??0).nkminus(args.x??0).nkpow(2).nksum( (args.y2??0).nkminus(args.y??0).nkpow(2) )).nksqrt();

    // Angle
    props.rotate = Math.atan2( (args.y2??0).nkminus(args.y??0), (args.x2??0).nkminus(args.x??0) ).nkmul( (180).nkdiv(Math.PI) );

    if ( args.class ) props.class = args.class;

    this._drawDiv(props);
}

NKDrawbox.prototype._drawVerticalLine = function( args ) {
    
    let props = {
        x: args.x, //La posicion es top left, no el centro. No modificar.
        y: args.y ?? 0,
        h: (args.y2??0).nkminus(args.y??0),
        border_left_px: args.w ?? 1,
        border_left_color: args.color ?? "black",
        border_left_style: args.style ?? "solid"
    }


    this._drawDiv(props);
}

NKDrawbox.prototype.drawCircle = function( args ) {
    if ( !NK.isset(args.r) ) args.r = 10;
    let d = (args.r).nkmul(2);

    let props = {
        x: (args.x ?? 0).nkminus( args.r ),
        y: (args.y ?? 0).nkminus( args.r ),
        w: d,
        h: d,
        color: args.color ?? "black",
        border_radius: 50 //Circle
    }

    if ( args.class ) props.class = args.class;

    this._drawDiv(props);
}

NKDrawbox.prototype.drawText = function( args ) {
    if ( !args.text ) return;
    if ( NK.isset(args.by) ) args.y = (this.h).nkminus(args.by); //Bottom y

    let props = {
        x: args.x ?? 0,
        y: args.y ?? 0,
        text: args.text,
    }

    if ( args.class ) props.class = args.class;
    if ( args.font_color ) props.font_color = args.font_color;
    if ( args.font_size ) props.font_size = args.font_size;
    if ( args.font_family ) props.font_family = args.font_family;
    if ( args.font_weight ) props.font_weight = args.font_weight;

    this._drawDiv(props);
};