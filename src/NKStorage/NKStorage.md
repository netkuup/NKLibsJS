# NKStorage
An easy way to **store and retrieve local data** from the browser session. (localStorage/sessionStorage)

- __Persistent storage__: Persists until explicitly deleted.
- __Non persistent storage__: Closing the browser window clears the storage.

Demo & Examples
----------------------------------------------------------------------------
[See the ./examples directory](./examples)


Initialization
----------------------------------------------------------------------------
To use NKStorage, you **must** call this funtion **once** at the beginning.

    NKStorage.start();

Note: Multiple calls to this function have no effect.

Read data
----------------------------------------------------------------------------
You can read persistent data directly from:

    NKStorage.start(); // Call this function only once
    var myVar = NKStorage.p.myVariable;

You can read non persistent data directly from: 

    NKStorage.start(); // Call this function only once
    var myVar = NKStorage.np.myVariable;
    


Write data
----------------------------------------------------------------------------
You can write persistent data like:

    NKStorage.p.myVariable1 = "Hello world";
    NKStorage.p.myVariable2 = 123;
    NKStorage.save(); //Optional in chrome/firefox, mandatory on safari

You can write non persistent data like: 

    NKStorage.np.myVariable1 = "Hello world";
    NKStorage.np.myUser = {
        name: "John",
        age: 23
    }
    NKStorage.save(); //Optional in chrome/firefox, mandatory on safari


Detect data changes
----------------------------------------------------------------------------
    NKStorage.listen('NKStorage.p.profile', function( path ) {
        console.log( "Changes detected.", path ); //This function will be called
    });
    NKStorage.listen('NKStorage.p.profile.name', function( path ) {
        console.log( "Changes detected.", path ); //This function will be called
    });
    NKStorage.listen('NKStorage.p.profile.surname', function( path ) {
        console.log( "Changes detected.", path ); //This function will NOT be called
    });

    NKStorage.p.profile.name = "James";
    NKStorage.save();
    NKStorage.broadcast( 'NKStorage.p.profile.name' ); //This function is the only one that calls NKStorage.listen, regardless of the data that is modified

Note: NKStorage.broadcast and NKStorage.listen can be used independently of NKStorage.save and others.


About NKStorage.start()
----------------------------------------------------------------------------
This function will set 'NKStorage.p' and 'NKStorage.np' with the values stored on localStorage/sessionStorage.

    NKStorage.start();

About NKStorage.save()
----------------------------------------------------------------------------
This function will save 'NKStorage.p' to localStorage and 'NKStorage.np' to sessionStorage.

Calling this function is optional in chrome/firefox (they save the information before closing the tab), but mandatory in safari (safari doesn't allow detecting when the user closes the tab)

    NKStorage.save();

On chrome/firefox use this function if you want to force save the data **WHEN THE FUNCTION IS CALLED**,
otherwise they will save the information before closing the tab.

    NKStorage.save( true ); //It runs each call



**Params:**

NKStorage.save( force )

| param | Values | Mandatory | Description |
|:---|:---|:---|:---|
| force | true/**false** | No | If false saves the data when the user leaves the page. |


[<< Index](../../../../)