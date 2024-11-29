let NKObject = {};

NKObject.clone = function ( obj ) {
    return JSON.parse(JSON.stringify(obj));
}

NKObject.setValue = function ( start_obj, str_obj_path, value ) {
    let path_parts = str_obj_path.split(".");
    let aux_path = "start_obj";

    for ( let i = 0; i < path_parts.length; i++ ) {
        aux_path += "." + path_parts[i];
        if ( eval("typeof " + aux_path) === "undefined" ) eval(aux_path + " = {}");
    }

    eval(aux_path + " = " + JSON.stringify(value));
}

NKObject.getValue = function ( variable, default_value = undefined ) {
    if ( typeof variable === 'undefined' ) return default_value;
    if ( variable == null ) return default_value;
    if ( typeof variable === 'function' ) {
        try {
            return variable();
        } catch (e) {
            return default_value;
        }
    }
    return variable;
}

NKObject.getTypeName = function ( value ) {
    let type = typeof value;
    if ( value === undefined ) return 'undefined';
    if ( type === "string" ) return 'string';
    if ( type === "number" ) return 'number';
    if ( type === "boolean" ) return 'boolean';
    if ( type === "object" && Array.isArray(value) ) return 'array';
    if ( type === "object" && (value === null) ) return 'null';
    if ( type === "object" ) return 'object';
    return 'unknown';
}

NKObject.isType = function ( value, type_str ) {
    return (NKObject.getTypeName(value) === type_str);
}
