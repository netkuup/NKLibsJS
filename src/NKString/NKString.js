let NKString = {};

// hello world -> Hello world
// "apples|oranges/chocolate" ["|", "/"] -> Apples|Oranges/Chocolate
NKString.capitalize = function (str, delimiters = null) {
    if (delimiters === null) return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();

    let result = "";
    let capitalize_next = true;

    for ( let i = 0; i < str.length; i++ ) {
        result += capitalize_next ? str[i].toUpperCase() : str[i].toLowerCase();
        capitalize_next = delimiters.includes( str[i] );
    }

    return result;
}

String.prototype.nkCapitalize = function( delimiters = null ) {
    return NKString.capitalize(this, delimiters);
};



NKString.normalizeSpaces = function ( str ) {
    return (str+"").replace(/\s+/g, ' ').trim();
}

String.prototype.nkNormalizeSpaces = function() {
    return this.replace(/\s+/g, ' ').trim();
};


NKString.deleteAllSpaces = function ( str ) {
    return str.replace(/\s+/g, '');
}

String.prototype.nkDeleteAllSpaces = function() {
    return this.replace(/\s+/g, '');
};

NKString.htmlEntities = {
    '&Aacute;': 'Á',
    '&Eacute;': 'É',
    '&Iacute;': 'Í',
    '&Oacute;': 'Ó',
    '&Uacute;': 'Ú',
    '&Ntilde;': 'Ñ',
    '&Uuml;': 'Ü',
    '&aacute;': 'á',
    '&eacute;': 'é',
    '&iacute;': 'í',
    '&oacute;': 'ó',
    '&uacute;': 'ú',
    '&ntilde;': 'ñ',
    '&uuml;': 'ü',
    '&nbsp;': ' ',
    '&iexcl;': '¡',
    '&iquest;': '¿',
    '&quot;': '"',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&apos;': "'",
    '&#37;': '%',
    '&reg;': '®',
    '&deg;': 'ª',
    '&micro;': 'µ'
};

NKString.decodeHtmlEntities = function ( str ) {
    try {
        return str.replace(/&[a-zA-Z0-9#]+;/g, match => NKString.htmlEntities[match] || match);
    } catch (e) {}
    return str;
}

String.prototype.nkDecodeHtmlEntities = function() {
    try {
        return this.replace(/&[a-zA-Z0-9#]+;/g, match => NKString.htmlEntities[match] || match);
    } catch (e) {}
    return this;
};

NKString.removeAccents = function ( str ) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

String.prototype.nkRemoveAccents = function() {
    return this.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};


//Node integration
if ( NK.node ) Object.assign(module.exports, { NKString });