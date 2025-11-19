let NKFile = {};

//If default_content !== null, create the file
if ( NK.node ) NKFile.readSync = function( file_path, default_content = null ) {
    const fs = require('fs');

    if ( default_content !== null && !fs.existsSync(file_path) ) {
        NKDir.create( file_path );
        fs.writeFileSync( file_path, default_content, 'utf8' );
    }

    return fs.readFileSync(file_path, 'utf8');
}

if ( NK.node ) NKFile.writeSync = function( file_path, data ) {
    const fs = require('fs');

    NKDir.create( file_path );

    fs.writeFileSync( file_path, data, 'utf8' );
}




if ( NK.node ) NKFile.download = function( url, download_dir, file_name, unzip_dir_name = null ) {
    let p = new NKPromise();

    let dst_file_path = download_dir + "/" + file_name;
    
    const options = {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
                        "AppleWebKit/537.36 (KHTML, like Gecko) " +
                        "Chrome/128.0.0.0 Safari/537.36",
            "Accept": "*/*",
            "Accept-Language": "es-ES,es;q=0.9",
            "Connection": "keep-alive",
        },
        rejectUnauthorized: false, // Desactiva la validación SSL (no recomendado, pero sino a veces falla)
    };

    const https = require('https');
    const fs = require('fs');

    https.get(url, options, async (response) => {

        if ( [301, 302, 303, 307, 308].includes(response.statusCode) ) {
            return p.reject({status: "redirect", err: response.headers.location});

        } else if ( response.statusCode !== 200 ) {
            return p.reject({status: "error", err: "Status code: " + response.statusCode});

        }

        await NKDir.create( dst_file_path );

        const file_stream = fs.createWriteStream(dst_file_path);

        response.pipe(file_stream);

        file_stream.on('finish', () => {
            if ( unzip_dir_name === null ) return p.resolve({status: "success"});
            
            const unzipper = require('unzipper');
            let dst_uncompressed_path = download_dir + "/" + unzip_dir_name;

            fs.createReadStream(dst_file_path)
                .pipe(unzipper.Extract({ path: dst_uncompressed_path }))
                .on('close', () => { p.resolve({status: "success"}); })
                .on('error', (err) => { return p.reject({status: "error", err: "Unzip error: " + err}); });
        });

        file_stream.on('error', (error) => { p.reject({status: "error", err: "Download error: " . error}); });
        
    }).on('error', (error) => { 
        fs.unlink(dst_file_path, () => {}); // Elimina el archivo parcialmente descargado
        p.reject({status: "error", err: "Download url error: " . error}); 
    });


    return p;
}


//Node integration
if ( NK.node ) Object.assign(module.exports, { NKFile });