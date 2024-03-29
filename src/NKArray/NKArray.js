let NKArray = {};

NKArray.clone = function ( obj ) {
    return JSON.parse(JSON.stringify(obj));
}

// Arguments: Multiple arrays, get all possible combinations
NKArray.getCombinations = function(){
    if ( typeof arguments[0] !== "string" ) {
        console.error("First argument must be a string.");
        return [];
    }

    let join_str = arguments[0];
    let array_of_arrays = [];

    for ( let i = 1; i < arguments.length; i++ ) {
        if( !Array.isArray(arguments[i]) ) {
            console.error("One of the parameters is not an array.");
            return [];
        }
        array_of_arrays.push( arguments[i] );
    }


    function formCombination( odometer, array_of_arrays ){
        return odometer.reduce(
            function(accumulator, odometer_value, odometer_index){
                return "" + accumulator + array_of_arrays[odometer_index][odometer_value] + join_str;
            },
            ""
        );
    }

    function odometer_increment( odometer, array_of_arrays ){

        for ( let i_odometer_digit = odometer.length-1; i_odometer_digit >= 0; i_odometer_digit-- ){

            let maxee = array_of_arrays[i_odometer_digit].length - 1;

            if( odometer[i_odometer_digit] + 1 <= maxee ){
                odometer[i_odometer_digit]++;
                return true;
            }
            if ( i_odometer_digit - 1 < 0 ) return false;
            odometer[i_odometer_digit] = 0;

        }

    }


    let odometer = new Array( array_of_arrays.length ).fill( 0 );
    let output = [];

    let newCombination = formCombination( odometer, array_of_arrays );

    output.push( newCombination.slice(0, -1) );

    while ( odometer_increment( odometer, array_of_arrays ) ){
        newCombination = formCombination( odometer, array_of_arrays );
        output.push( newCombination.slice(0, -1) );
    }

    return output;
};


NKArray.mountTree = function ( data, id_name, parent_id_name, child_arr_name ) {
    let refs = {};
    let result = [];

    for (let i = 0; i < data.length; i++ ) {
        if ( typeof refs[data[i][id_name]] === 'undefined' ) {
            refs[data[i][id_name]] = {};
            refs[data[i][id_name]][child_arr_name] = [];
        }
        if ( typeof refs[data[i][parent_id_name]] === 'undefined' ) {
            refs[data[i][parent_id_name]] = {};
            refs[data[i][parent_id_name]][child_arr_name] = [];
        }
        refs[data[i][id_name]] = {...data[i], ...refs[data[i][id_name]]};

        if ( parseInt(data[i][parent_id_name]) === 0 ) {
            result.push(refs[data[i][id_name]]);
        } else {
            refs[data[i][parent_id_name]][child_arr_name].push(refs[data[i][id_name]]);
        }
    }

    return result;
};
