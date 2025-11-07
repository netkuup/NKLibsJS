let NKHttp = {};


NKHttp.mountGETUrl = function( url, params = {} ) {
    if ( Object.keys(params).length === 0 ) return url;

    let queryString = url + '?';

    for ( let param in params ) queryString += param + '=' + encodeURIComponent(params[param]) + '&';

    queryString = queryString.slice( 0, -1 ); // Eliminar el último carácter "&"

    return queryString;
}


NKHttp.syncGET = function( url, params = {}, json = false ) {

    let get_url = NKHttp.mountGETUrl( url, params );

    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", get_url, false ); // false for synchronous request
    xmlHttp.send( null ); //En caso de error 500, no se puede evitar el error aunque ponga un try{}catch(e){}

    if ( xmlHttp.readyState === 4 && xmlHttp.status === 200 ) {
        let data = xmlHttp.responseText;
        if ( json ) {
            try {
                data = JSON.parse(data);
            } catch (e){
                return {success: false, data: xmlHttp.responseText, err: "Error converting to json.", status: xmlHttp.status };
            }
        }
        return {success: true, data: data, err: null, status: xmlHttp.status};
    }

    return {success: false, data: null, err: xmlHttp.statusText, status: xmlHttp.status };
}


NKHttp.asyncGET = function( url, params = {}, json = false ) {

    let get_url = NKHttp.mountGETUrl( url, params );

    let p = new Promise(function(resolve, reject) {
        let xmlHttp = new XMLHttpRequest();

        xmlHttp.onreadystatechange = function() {
            if ( xmlHttp.readyState === 4 ) {
                if ( xmlHttp.status === 200 ) {
                    let data = xmlHttp.responseText;
                    if ( json ) {
                        try {
                            data = JSON.parse(data);
                        } catch (e){
                            resolve( {success: false, data: xmlHttp.responseText, err: "Error converting to json.", status: xmlHttp.status });
                            return;
                        }
                    }
                    resolve( {success: true, data: data, err: null, status: xmlHttp.status} );
                } else {
                    resolve( {success: false, data: null, err: xmlHttp.statusText, status: xmlHttp.status} );
                }
            }
        };

        xmlHttp.open("GET", get_url, true);
        xmlHttp.send(null);
    });

    return p;
}


if ( NK.node ) NKHttp.asyncGET = function( url, params = {}, json = false ) {
    let get_url = NKHttp.mountGETUrl( url, params );

    let p = new Promise(async function(resolve, reject) {

        const puppeteer = require('puppeteer');
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto(get_url);

        let content = await page.evaluate(() => document.body.textContent);

        await browser.close();

        if ( json ) {
            try {
                content = JSON.parse(content);
            } catch (e){
                resolve( {success: false, data: content, err: "Error converting to json." });
                return;
            }
        }

        resolve( {success: true, data: content} );
    });

    return p;
}



//Node integration
if ( NK.node ) Object.assign(module.exports, { NKHttp });