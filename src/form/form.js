var NKForm = {};

if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before form.js";
}

NKForm.errors = {
    duplicated_fields: true,
    invalid_json: true
};

// TODO change to getInputs
// TODO Works with textarea's ? Are not inputs..
// TODO Best if elements have class NKField
NKForm.getFields = function( form_selector, json ) {

    var values = {};

    $( form_selector + ' :input' ).each(function() {
        if ( NK.empty(this.name) ) return;

        if ( this.name.slice(-2) === "[]" ) {
            var field_name = this.name.substr(0, this.name.length-2);

            if ( !NK.isset(values[field_name]) ) values[field_name] = [];

            values[field_name].push($(this).val());

        } else {

            if ( NKForm.errors.duplicated_fields && NK.isset(values[this.name]) ) {
                throw( 'NKForm.getFields: Duplicated input field with name (' + this.name + ')' );
            }

            var type = $(this).attr('type');

            if ( type === 'checkbox' ) {
                values[this.name] = $(this).prop('checked');
            } else {
                values[this.name] = $(this).val();
            }

        }

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
        if ( NK.empty(field_data[this.name]) ) return;

        var type = $(this).attr('type');

        if ( type === 'checkbox' ) {
            $(this).prop('checked', (/^(true|1)$/i).test(field_data[this.name]));
        } else {
            $(this).val( field_data[this.name] );
        }

    });

};

NKForm.clearFields = function( form_selector ) {

    $( form_selector + ' :input' ).each(function() {
        var type = $(this).attr('type');

        if ( type === 'checkbox' ) {
            $(this).prop('checked', false);
        } else {
            $(this).val("");
        }

    });

};


NKForm.send = function( form_selector, url, callback ) {

    $.post(
        url,
        NKForm.getFields(form_selector),
        function( data, status ) {

            if( NK.isset(callback) ) {
                callback( data, status );
            } else {
                location.reload();
            }

        }
    );

};


// ExtensionList = accept=".gif,.jpg,.jpeg,.png,.doc,.docx";
NKForm.fileChooser = function( callback, extension_list ) {
    extension_list = extension_list || "";
    $('body').append('<input type="file" id="NKtmpfile" accept="'+extension_list+'">');
    var element = document.getElementById("NKtmpfile");
    element.addEventListener('change', function (e) { callback( e.path[0].value ) } , false);
    $('#NKtmpfile').trigger('click');
    element.parentNode.removeChild(element);
};

NKForm.dirChooser = function( callback ) {
    $('body').append('<input type="file" id="NKtmpfile" webkitdirectory directory multiple/>');
    var element = document.getElementById("NKtmpfile");
    element.addEventListener('change', function (e) { callback( e.path[0].value ) } , false);
    $('#NKtmpfile').trigger('click');
    element.parentNode.removeChild(element);
};

