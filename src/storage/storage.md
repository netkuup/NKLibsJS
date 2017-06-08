# NKStorage
An easy way to **store and retrieve local data** from the browser session. (localStorage/sessionStorage)

- __Persistent storage__: Persists until explicitly deleted.
- __Non persistent storage__: Closing the browser window clears the storage.


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
    NKStorage.save();

You can write non persistent data like: 

    NKStorage.np.myVariable1 = "Hello world";
    NKStorage.np.myUser = {
        name: "John",
        age: 23
    }
    NKStorage.save();


About NKStorage.start()
----------------------------------------------------------------------------
This function will set 'NKStorage.p' and 'NKStorage.np' with the values stored on localStorage/sessionStorage.

    NKStorage.start();

About NKStorage.save()
----------------------------------------------------------------------------
This function will save 'NKStorage.p' to localStorage and 'NKStorage.np' to sessionStorage **WHEN THE USER LEAVES** the current page, tab, etc. 

    NKStorage.save(); //It can be called multiple times and only runs once when user leaves current page.

If you want to force save the data **WHEN THE FUNCTION IS CALLED** use:

    NKStorage.save( true ); //It runs each call

**Params:**

NKStorage.save( force )

| param | Values | Mandatory | Description |
|:---|:---|:---|:---|
| force | true/**false** | No | If false saves the data when the user leaves the page. |

