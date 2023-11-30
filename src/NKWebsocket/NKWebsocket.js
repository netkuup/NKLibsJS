

var NKWebsocketClient = function ( host, port ) {
    this.host = host;
    this.port = port;
    this.socket = null;
    this.writePromises = {};

    this.connect = function () {
        let self = this;

        this.socket = new WebSocket('ws://' + this.host + ":" + this.port );

        this.socket.addEventListener('open', (event) => this.onOpen(event) );
        this.socket.addEventListener('close', (event) => this.onClose(event) );
        this.socket.addEventListener('error', (event) => this.onError(event) );
        this.socket.addEventListener('message', (event) => {
            let data = event.data.toString();
            let num_cli = data.charCodeAt(0);
            let num_serv = data.charCodeAt(1);
            data = data.substring(2);


            if ( num_cli === 0 ) {
                var sendResponse = function ( msg ) {
                    self.socket.send( String.fromCharCode(num_cli) + String.fromCharCode(num_serv) + msg );
                }

                this.onMessage( data, sendResponse, event );
            } else {
                this.writePromises[num_cli](data);
                delete this.writePromises[num_cli];
            }

        } );
    }

    this.connected = function () {
        return (this.socket.readyState !== WebSocket.CLOSED);
    }

    this.reconnect = async function () {
        while ( !this.connected() ) {
            this.connect();
            await NK.sleep(5000);
        }
    }

    this.write = function ( msg ) {
        this.socket.send( String.fromCharCode(0) + String.fromCharCode(0) + msg );
    }

    this.writeAndWait = function ( msg, timeout_ms ) {
        let self = this;
        let num_cli = 0;
        let num_serv = 0;

        for ( let i = 1; i < 255; i++ ) {
            if ( this.writePromises[i] === undefined ) {
                num_cli = i;
                break;
            }
        }

        if ( num_cli === 0 ) {
            return new Promise(function(resolve, reject) {
                reject( "Error, too many writeAndWait" );
            });
        }

        let p = new Promise(function(resolve, reject) {
            self.writePromises[num_cli] = resolve;
            setTimeout( function() { reject( "Timeout" ); }, timeout_ms);
        });

        this.socket.send( String.fromCharCode(num_cli) + String.fromCharCode(num_serv) + msg );

        return p;
    }

    this.onOpen = function ( e ) {};
    this.onMessage = function ( data, sendResponse, e ) {};
    this.onClose = function ( e ) {};
    this.onError = function ( e ) {};
}