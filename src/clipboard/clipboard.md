# NKClipboard
Easy way to set and get clipboard contents


NKClipboard.set( str )
----------------------------------------------------------------------------
Set clipboard content

    NKClipboard.set( "Hello world" );


NKClipboard.get()
----------------------------------------------------------------------------
Get clipboard content

Example 1

    NKClipboard.get().then(function (str) {
        console.log( "Clipboard content:", str );

	}).catch(function (err) {
        console.error( "Error copying clipboard" );
		
	});

Example 2

    let text = await NKClipboard.get();
    console.log(text);

