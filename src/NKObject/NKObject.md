# NKObject



NKObject.setValue( variable_path, value )
----------------------------------------------------------------------------
Initialize an undefined nested variable.

    let my_var = {one: true};

    NKObject.setValue( my_var, "two.a.b.c", 123 ); // it creates the variable if not exist

    console.log( JSON.stringify(my_var) ); //Output: {"one":true,"two":{"a":{"b":{"c":123}}}}


NKObject.getValue( variable, default_value )
----------------------------------------------------------------------------
If the variable does not exist, is undefined, or is null, returns default_value

    Example 1
      let aux = NKObject.getValue( myVar, false );
    
    Example 2
      let aux = NKObject.getValue( () => my.var.a.b.c, false );


NKObject.clone( object )
----------------------------------------------------------------------------
Clone an object. The new object has a new reference.

    let array_a = [{name: "James"}, {name: "Mary"}];

    let array_b = NKObject.clone(array_a);