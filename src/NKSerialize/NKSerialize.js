let NKSerialize = { debug: false };
let NKUnserialize = {};


NKSerialize.number_types = {
    integer_positive: 0,
    integer_negative: 1,
    float_positive: 2,
    float_negative: 3
}

NKSerialize.types = {
    null: 4,
    undefined: 5,
    number: 6,
    number_array: 7,
    string: 8,
    string_array: 9,
    boolean: 10,
    object: 11,
    object_array: 12,
    sub_object: 13,
    mix_array: 14
}



// NKSerialize
// Al principio siempre añadimos la longitud
// Añadimos la opción set_type = false
// Devolvemos directamente en formato string

// NKUnserialize
// Devolvemos siempre {value: "", len: 0}


NKSerialize.integer = function ( num ) {
    if (num < 0) throw new Error("El número debe ser positivo.");

    if ( NKSerialize.debug ) console.log("Src num: ", num);
    let sbin = num.toString(2);

    if ( NKSerialize.debug ) console.log("Src num bin: ", sbin);
    let len = Math.ceil(sbin.length / 15) * 15;
    sbin = sbin.padStart( len, '0' );

    let result = [];

    for ( let i = 0; i < sbin.length; i += 15 ) result.push("0" + sbin.substring(i, i + 15));
    result[result.length-1] = "1" + result[result.length-1].slice(1);


    if ( NKSerialize.debug ) console.log("Src num bin splitted: ", result);

    let sresult = "";
    for ( let i = 0; i < result.length; i++ ) {
        result[i] = parseInt(result[i], 2);
        sresult += String.fromCharCode(result[i]);
    }

    return sresult;
}


NKUnserialize.integer = function ( encoded ) {

    let result = "";
    let aux = [];
    let i = 0;

    for ( i = 0; i < encoded.length; i++ ) {
        let bin = encoded[i].charCodeAt(0).toString(2).padStart(16, '0');
        aux.push(bin);
        result += bin.slice(-15);

        if ( bin[0] === "1" ) break;
    }

    if ( NKSerialize.debug ) console.log("Dst num bin splitted: ", aux);
    if ( NKSerialize.debug ) console.log("Dst num bin: ", result);

    result = parseInt(result, 2);

    if ( NKSerialize.debug ) console.log("Dst num: ", result);

    return {value: result, len: i+1};
}


NKSerialize.boolean = function ( value, set_type = false ) {
    let int_val = value ? 1 : 0;

    if ( !set_type ) return NKSerialize.integer(int_val);
    return NKSerialize.integer( NKSerialize.types.boolean ) + NKSerialize.integer(int_val);

}

NKUnserialize.boolean = function ( serialized_string ) {

    let int_val = NKUnserialize.integer( serialized_string );
    return {value: (int_val.value !== 0), len: int_val.len };

}

NKSerialize.string = function ( str, set_type = false ) {

    if ( !set_type ) return NKSerialize.integer(str.length) + str;
    return NKSerialize.integer( NKSerialize.types.string ) + NKSerialize.integer(str.length) + str;

}

NKUnserialize.string = function ( serialized_string ) {

    let str_len = NKUnserialize.integer( serialized_string );
    return {value: serialized_string.slice(str_len.len, str_len.len + str_len.value), len: str_len.len+str_len.value };

}

//Si serializamos un array suelto (structures=null), si hay objetos, se guarda en forma 'object' (cada uno con su listado de keys)
//Si serializamos un array dentro de un objeto, si hay objetos seran tipo sub_object, y guardamos en structures.
NKSerialize.array = function ( array, structures = null, set_type = false ) {
    let first_type = NKObject.getTypeName( array[0] );
    let all_same_type = array.every(e => NKObject.getTypeName(e) === first_type);

    let type = NKSerialize.types.mix_array;
    if ( all_same_type && array.length > 0 ) {
        if ( first_type === "string" ) type = NKSerialize.types.string_array;
        else if ( first_type === "number" ) type = NKSerialize.types.number_array;
        else if ( first_type === "object" ) type = NKSerialize.types.object_array;
        else console.error("Error, unknown type:", array[0], first_type);
    }

    let set_each_element_type = (type === NKSerialize.types.mix_array);

    let result = "";
    if ( set_type ) result += NKSerialize.integer(type);
    result += NKSerialize.integer(array.length);


    //Si no son todos del mismo tipo, le indicamos set_type
    for ( let i = 0; i < array.length; i++ ) {
        if ( NKObject.isType(array[i],"object") && (structures === null) ) {
            result += NKSerialize.object( array[i], set_each_element_type );
        } else {
            result += NKSerialize.byType( array[i], set_each_element_type, structures );
        }

    }

    return result;
}

//Contiene set_type delante de cada elemento
NKUnserialize.mixArray = function ( serialized_array, structures ) {
    let result = [];

    let index = 0;
    let i = 0;

    let array_len = NKUnserialize.integer(serialized_array);
    index += array_len.len;

    while ( i++ < array_len.value ) {
        let value = NKUnserialize.byType( serialized_array.slice(index), structures );
        result.push( value.value );
        index += value.len;
    }

    return {value: result, len: index};
}

//Si structures=null, significa que es un array de objetos simple, donde cada objeto tiene sus estructuras dentro
NKUnserialize.objectArray = function ( serialized_array, structures = null ) {
    let result = [];

    let index = 0;
    let i = 0;

    let array_len = NKUnserialize.integer(serialized_array);
    index += array_len.len;

    while ( i++ < array_len.value ) {
        let value = null;
        if ( structures === null ) {
            value = NKUnserialize.object( serialized_array.slice(index) );
        } else {
            value = NKUnserialize.sub_object( serialized_array.slice(index), structures );
        }

        result.push( value.value );
        index += value.len;
    }

    return {value: result, len: index};
}

NKSerialize.stringArray = function ( string_array, set_type = false ) {
    return NKSerialize.array(string_array, null, set_type);
}

NKUnserialize.stringArray = function ( serialized_string_array ) {
    let result = [];

    let index = 0;
    let i = 0;

    let array_len = NKUnserialize.integer(serialized_string_array);
    index += array_len.len;

    while ( i++ < array_len.value ) {
        let str = NKUnserialize.string( serialized_string_array.slice(index) );
        result.push( str.value );
        index += str.len;
    }

    return {value: result, len: index};
}




NKSerialize.number = function ( num, set_type = false ) {
    if ( num === NaN || num === Infinity || num === -Infinity ) num = 0;

    if ( isNaN(num) )  {
        console.error("Error, value (", num, ") is not a number.");
        num = 0;
    }

    let result = "";

    //1 (0001): positive int (integer)
    //2 (0010): negative int (integer)
    //3 (0011): positive float (two integers)
    //4 (0100): negative float (two integers)

    if ( Number.isInteger(num) ) {
        if ( num >= 0 ) result = NKSerialize.integer( NKSerialize.number_types.integer_positive ) + NKSerialize.integer(num);
        else result = NKSerialize.integer(NKSerialize.number_types.integer_negative) + NKSerialize.integer(-num);
    } else {
        let parts = (num+"").split(".");
        parts[0] = parseInt(parts[0]);
        parts[1] = parseInt(parts[1]);

        if ( num >= 0 ) result = NKSerialize.integer(NKSerialize.number_types.float_positive) + NKSerialize.integer(parts[0]) + NKSerialize.integer(parts[1]);
        else result = NKSerialize.integer(NKSerialize.number_types.float_negative) + NKSerialize.integer(-parts[0]) + NKSerialize.integer(parts[1]);
    }

    if ( set_type ) result = NKSerialize.integer( NKSerialize.types.number ) + result;

    return result;
}

NKUnserialize.number = function ( serialized_num ) {
    let type = NKUnserialize.integer(serialized_num);
    serialized_num = serialized_num.slice(type.len);

    let part1 = NKUnserialize.integer(serialized_num);

    if ( type.value === NKSerialize.number_types.integer_positive ) return {value: part1.value, len: type.len+part1.len};
    if ( type.value === NKSerialize.number_types.integer_negative ) return {value:-part1.value, len: type.len+part1.len};

    serialized_num = serialized_num.slice(part1.len);

    let part2 = NKUnserialize.integer(serialized_num);

    let float_num = parseFloat(part1.value + "." + part2.value );

    if ( type.value === NKSerialize.number_types.float_positive ) return {value: float_num, len: type.len+part1.len+part2.len};
    if ( type.value === NKSerialize.number_types.float_negative ) return {value: -float_num, len: type.len+part1.len+part2.len};

}

NKSerialize.numberArray = function ( number_array, set_type = false ) {
    return NKSerialize.array(number_array, null, set_type);
}

NKUnserialize.numberArray = function ( serialized_number_array ) {
    let result = [];

    let index = 0;
    let i = 0;

    let array_len = NKUnserialize.integer(serialized_number_array);
    index += array_len.len;

    while ( i++ < array_len.value ) {
        let num = NKUnserialize.number( serialized_number_array.slice(index) );
        result.push( num.value );
        index += num.len;
    }

    return {value: result, len: index};
}


NKSerialize.byType = function ( value, set_type, structures = [] ) {
    if ( NKObject.isType(value,"undefined")) return set_type ? NKSerialize.integer( NKSerialize.types.undefined ) : '';
    if ( NKObject.isType(value,"string")   ) return NKSerialize.string( value, set_type );
    if ( NKObject.isType(value,"number")   ) return NKSerialize.number( value, set_type );
    if ( NKObject.isType(value,"boolean")  ) return NKSerialize.boolean( value, set_type );
    if ( NKObject.isType(value,"array")    ) return NKSerialize.array( value, structures, set_type );
    if ( NKObject.isType(value,"null")     ) return set_type ? NKSerialize.integer( NKSerialize.types.null ) : ''; //typeof null = 'object'
    if ( NKObject.isType(value,"object")   ) return NKSerialize.sub_object( value, structures, set_type );

    return NKSerialize.string( "Not implemented (Unknown type)", value );
}




NKSerialize.sub_object = function ( obj, structures = [], set_type = false ) {
    let result = "";

    let keys = Object.keys(obj);
    keys.sort();
    let curr_structure = NKSerialize.stringArray( keys );

    let structure_index = structures.indexOf(curr_structure);

    if ( structure_index === -1 ) {
        structures.push(curr_structure);
        structure_index = structures.length - 1;
    }

    if ( set_type ) result += NKSerialize.integer( NKSerialize.types.sub_object );
    result += NKSerialize.integer( structure_index );


    let values = []; //Same order than Object.keys
    for ( let i = 0; i < keys.length; i++ ) values.push(obj[keys[i]]);



    for ( let i = 0; i < values.length; i++ ) {
        values[i] = NKSerialize.byType( values[i], true, structures );

    }

    result += values.join('');

    return result;
}

NKSerialize.object = function ( obj, set_type = false ) {
    let structures = [];

    let serialized_obj = NKSerialize.sub_object( obj, structures );

    let result = "";
    if ( set_type ) result += NKSerialize.integer( NKSerialize.types.object );
    result += NKSerialize.integer( structures.length );
    result += structures.join('');

    result += serialized_obj;

    return result;
}

NKUnserialize.byType = function ( serialized_obj, structures = [] ) {
    let type = NKUnserialize.integer(serialized_obj);
    let content = {value: null, len: null};

    if ( [NKSerialize.types.number].includes(type.value) ) {
        content = NKUnserialize.number(serialized_obj.slice(type.len));

    } else if ( type.value === NKSerialize.types.boolean ) {
        content = NKUnserialize.boolean(serialized_obj.slice(type.len));

    } else if ( type.value === NKSerialize.types.string ) {
        content = NKUnserialize.string(serialized_obj.slice(type.len));

    } else if ( type.value === NKSerialize.types.string_array ) {
        content = NKUnserialize.stringArray(serialized_obj.slice(type.len));

    } else if ( type.value === NKSerialize.types.number_array ) {
        content = NKUnserialize.numberArray(serialized_obj.slice(type.len));

    } else if ( type.value === NKSerialize.types.sub_object ) {
        content = NKUnserialize.sub_object(serialized_obj.slice(type.len), structures);

    } else if ( type.value === NKSerialize.types.object_array ) {
        content = NKUnserialize.objectArray(serialized_obj.slice(type.len), structures);

    } else if ( type.value === NKSerialize.types.mix_array ) {
        content = NKUnserialize.mixArray(serialized_obj.slice(type.len), structures);

    } else if ( type.value === NKSerialize.types.null ) {
        content = {value: null, len: 0};

    } else if ( type.value === NKSerialize.types.undefined ) {
        content = {value: undefined, len: 0};

    } else {
        console.error("Unknown type " + type.value);
    }

    return {type: type.value, value: content.value, len: type.len+content.len};
}

NKUnserialize.sub_object = function ( serialized_obj, structures ) {
    let index = 0;

    let structure_index = NKUnserialize.integer( serialized_obj.slice(index) );
    index += structure_index.len;

    let keys = structures[ structure_index.value ];

    let result = {};

    for ( let i = 0; i < keys.length; i++ ) {
        let key = keys[i];
        let value = NKUnserialize.byType( serialized_obj.slice(index), structures );

        result[key] = value.value;
        index += value.len;
    }

    return {value: result, len: index};
}

NKUnserialize.object = function ( serialized_obj ) {
    let index = 0;

    let structures_len = NKUnserialize.integer(serialized_obj);
    index += structures_len.len;

    let structures = [];
    for ( let i = 0; i < structures_len.value; i++ ) {

        let structure = NKUnserialize.stringArray( serialized_obj.slice(index) );
        index += structure.len;

        structures.push(structure.value);
    }


    let result = NKUnserialize.sub_object( serialized_obj.slice(index), structures );

    return {value: result.value, len: result.len + index};
}

//Temporal fix
NKSerialize.toUtf8 = function ( serialized_str ) {
    const arr = [""];

    for ( let i = 0; i < serialized_str.length; i++ ) {
        const code = serialized_str.charCodeAt(i);
        // Detecta sustitutos altos o bajos sin pareja válida
        if ( code >= 0xD800 && code <= 0xDFFF ) {
            arr.push(code);
            arr.push("");
        } else {
            arr[arr.length-1] += serialized_str[i];
        }
    }

    return JSON.stringify(arr);
}

//Temporal fix
NKUnserialize.fromUtf8 = function ( arr, json = false ) {
    if ( json ) arr = JSON.parse(arr);

    return arr.map(el => {
        return (typeof el === 'number') ? String.fromCharCode(el) : el;
    }).join('');
}


//Node integration
if ( NK.node ) Object.assign(module.exports, { NKSerialize, NKUnserialize });