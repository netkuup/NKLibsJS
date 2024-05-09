# NKHttp

NKHttp.mountGETUrl( url, params = {} )
----------------------------------------------------------------------------
Mount GET url.

**Example:**

    let my_url = NKHttp.mountGETUrl( "http://google.es", {} );

    Output: 'http://google.es'

**Example:**

    let my_url = NKHttp.mountGETUrl( "http://google.es", {foo:1, bar:"hello"} );

    Output: 'http://google.es?foo=1&bar=hello'


NKHttp.syncGET( url, params = {}, json = false )
----------------------------------------------------------------------------
Perform synchronous GET request.

**Example:**

    let result = NKHttp.syncGET( "http://google.es/search", {q: "foo"} );

    Output:
    {
        success: true,
        status: 200,
        data: "<!doctype html><html itemscope=\"\" itemtype=\"...
    }




NKHttp.asyncGET( url, params = {}, json = false )
----------------------------------------------------------------------------
Perform asynchronous GET request.

**Example:**

    let result = await NKHttp.asyncGET( "http://google.es/search", {q: "foo"} );

    Output:
    {
        success: true,
        status: 200,
        data: "<!doctype html><html itemscope=\"\" itemtype=\"...
    }