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
NKForm.fileChooser = function( callback, extension_list, multiple = false, base64 = true ) {
    extension_list = extension_list || "";
    multiple = multiple ? "multiple" : "";
    $('body').append('<input type="file" id="NKtmpfile" accept="'+extension_list+'" ' + multiple +'>');
    var element = document.getElementById("NKtmpfile");
    element.addEventListener('change', async function (e) {
        var file_list = await NKForm._cleanFileList(this.files, base64);
        callback( file_list );
    } , false);
    $('#NKtmpfile').trigger('click');
    element.parentNode.removeChild(element);
};

NKForm.dirChooser = function( start_in, callback ) {
    window.showDirectoryPicker({startIn: start_in}).then((e) => {
        callback( e );
    });
};


NKForm.postFile = function( url, file_obj, args, cbk ) {
    var form_data = new FormData();
    form_data.append( 'file[]', file_obj );
    for ( var key in args ) {
        form_data.append( key, args[key] );
    }

    $.ajax({
        type: 'POST',
        url: url,
        contentType: false,
        processData: false,
        data: form_data,
        success: function ( response ) {
            cbk( response );
        }
    });
}

NKForm.fileDropzone = function ( object, cbk, base64 = true ) {

    object.addEventListener("drop", async function ( e ) {
        e.preventDefault();

        var files = e.dataTransfer.files;

        if ( files.length === 0 ) console.error( "Unable to handle dragged files." );

        var file_list = await NKForm._cleanFileList(files, base64);

        cbk( file_list );
    });

    object.addEventListener("dragover", function ( e ) {
        e.preventDefault();
    });

};

NKForm._cleanFileList = async function ( files, base64 = true ) {
    var result = [];

    for ( var i = 0; i < files.length; i++ ) {
        var file = files[i];
        var r = {
            file_obj: file,
            name: file.name,
            size: file.size,
            type: file.type,
            lastModifiedDate: file.lastModifiedDate,
            lastModified: file.lastModified
        }
        if ( base64 ) r.base64 = await NKForm.getFileBase64( file );

        result.push(r);
    }

    return result;
}

NKForm.getFileBase64 = function ( file_obj ) {

    return new Promise(function( resolve, reject ) {
        var fr = new FileReader();
        fr.onload = function(e) { resolve( this.result ); };
        fr.onerror = function ( e ) { reject(); };

        fr.readAsDataURL( file_obj );
    });

}