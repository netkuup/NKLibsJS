# NKVar


NKVar.isset( variable )
----------------------------------------------------------------------------
Returns false if any of these conditions are met:
- typeof variable === 'undefined'
- variable == null
- object.a.lot.of.properties -> Some of the keys does not exist.
    - For this case you must pass the object as function () => obj.key1.key2. See the example.
    
    
    let foo = "bar";
    
    if ( NKVar.isset(foo) ) console.log( "Is set" );
    
    if ( NKVar.isset(() => foo.a.lot.of.properties) ) console.log( "Is set" );


NKVar.empty( variable )
----------------------------------------------------------------------------
Returns false if any of these conditions are met:
- typeof variable === 'undefined'
- variable == null
- variable.length == 0 (Works with strings and arrays)