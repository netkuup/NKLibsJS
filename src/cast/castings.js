var NKCast = {};

if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before form.js";
}

NKCast.decimalByteArray = {
    // [65, 66] => "AB" (Utf 8 or 16)
    toUtf16String: function( data ) {
        var result = '';
        for ( var i = 0; i < data.length; i++ ) result += String.fromCharCode( data[i] );
        return result;
    },

    // "AB" => [65, 66] (Utf 8 or 16)
    fromUtf16String: function( data ) {
        var result = '';
        for ( var i = 0; i < data.length; i++ ) result += data.charCodeAt( i );
        return result;
    },

    // [65, 66] => "0x41 0x42" | "41 42" | "4142" ...
    toHexString: function( data, startWith0x, addSpaces ) {
        if ( !NK.isset(data) ) return '';
        var result = '';
        for ( var i = 0; i < data.length; i++ ) {
            if ( addSpaces && i != 0 ) result += ' ';
            result += NKCast.decimalByte.toHexString( data[i], startWith0x );
        }
        return result;
    },

    toDecimal: function ( data ) {
        var result = 0, mult = 1;
        for ( var i = data.length-1; i >= 0; i-- ) {
            result += data[i] * mult;
            mult *= 256;
        }
        return result;
    }

};

console.log( NKCast.decimalByteArray.toDecimal([8,0]) );

NKCast.decimalByte = {
    // 1000 => "3e8"
    toHexString: function ( data, startWith0x ) {
        if ( !startWith0x ) return data.toString( 16 );
        return "0x" + data.toString( 16 );
    }

};

/*
NKCast.arrayBuffer = {
    toString: function ( data ) {
        return String.fromCharCode.apply( null, new Uint16Array(buff) );
    },

    fromString: function ( data ) {
        var buf = new ArrayBuffer( data.length*2 ); //2 bytes for each char
        var bufView = new Uint16Array( buf );
        for ( var i = 0; i < data.length; i++ ) {
            bufView[i] = str.charCodeAt( i );
        }
        return buf;
    }
};
*/

