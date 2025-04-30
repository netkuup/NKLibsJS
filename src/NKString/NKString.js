let NKString = {};

// hello world -> Hello world
NKString.capitalize = function ( str ) {
    return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
}

String.prototype.nkcapitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
};



NKString.normalizeSpaces = function ( str ) {
    return str.replace(/\s+/g, ' ').trim();
}

String.prototype.nknormalizeSpaces = function() {
    return this.replace(/\s+/g, ' ').trim();
};


NKString.deleteAllSpaces = function ( str ) {
    return str.replace(/\s+/g, '');
}

String.prototype.deleteAllSpaces = function() {
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

String.prototype.decodeHtmlEntities = function() {
    try {
        return this.replace(/&[a-zA-Z0-9#]+;/g, match => NKString.htmlEntities[match] || match);
    } catch (e) {}
    return this;
};