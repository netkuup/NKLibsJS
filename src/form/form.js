var NKForm = {};

if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before form.js";
}

NKForm.errors = {
    duplicated_fields: true,
    invalid_json: true
};


NKForm.getFields = function( form_selector, json ) {

    var values = {};

    $( form_selector + ' :input' ).each(function() {
        if ( NK.empty(this.name) ) return;

        if ( NKForm.errors.duplicated_fields && NK.isset(values[this.name]) ) {
            throw( 'NKForm.getFields: Duplicated input field with name (' + this.name + ')' );
        }

        values[this.name] = $(this).val();
    });

    if ( json === true ) return JSON.stringify(values);
    return values;

};


NKForm.setFields = function( form_selector, field_data, json ) {
    if ( NK.empty(field_data) ) return;

    if ( json === true ) {
        try {
            field_data = JSON.parse(field_data);
        } catch (e) {
            if ( NKForm.errors.invalid_json ) throw "NKForm.setFields: Invalid input json. (" + field_data + ")";
            return;
        }
    }

    $( form_selector + ' :input' ).each(function() {
        if ( !NK.empty(field_data[this.name]) )
            $(this).val( field_data[this.name] );

    });

};