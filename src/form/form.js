var NKForm = {};

if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before form.js";
}

NKForm.errors = {
    duplicated_fields: true
};


NKForm.getFields = function( form_selector ) {

    var values = {};

    $( form_selector + ' :input' ).each(function() {
        if ( NKForm.errors.duplicated_fields && NK.isset(values[this.name]) ) {
            throw( 'NKForm.getFields: Duplicated input field with name (' + this.name + ')' );
        }
        values[this.name] = $(this).val();
    });

    return values;

};


NKForm.setFields = function( form_selector, field_data ) {
    if ( NK.empty(field_data) ) return;

    $( form_selector + ' :input' ).each(function() {
        if ( !NK.empty(field_data[this.name]) )
            $(this).val( field_data[this.name] );
    });

};