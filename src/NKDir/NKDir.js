let NKDir = {};


if ( NK.node ) NKDir.getContents = function ( dir ) {
    let contents = fs.readdirSync( dir );
    let result = [];

    for ( let i = 0; i < contents.length; i++ ) {
        result.push({
            name: contents[i],
            dir: dir,
            path: dir + "/" + contents[i],
            is_dir: fs.statSync(dir + "/" + contents[i]).isDirectory()
        });
    }

    return result;
}

if ( NK.node ) NKDir.create = function( dir ) {
    const path = require('path');
    const fs = require('fs');
    if ( path.basename(dir).includes(".") ) dir = path.dirname(dir); //Si le pasamos un path a un archivo, lo convierte al directorio.
    if ( !fs.existsSync(dir) ) fs.mkdirSync(dir, { recursive: true });
}



//Node integration
if ( NK.node ) Object.assign(module.exports, { NKDir });
