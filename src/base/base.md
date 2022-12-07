# NKBase JS
A set of basic functions.

NK.isset( variable )
----------------------------------------------------------------------------
Returns false if any of these conditions are met:
- typeof variable === 'undefined'
- variable == null
- object.a.lot.of.properties -> Some of the keys does not exist.
  - For this case you must pass the object as function () => obj.key1.key2. See the example.


        var foo = "bar";

        if ( NK.isset(foo) ) console.log( "Is set" );

        if ( NK.isset(() => foo.a.lot.of.properties) ) console.log( "Is set" );
        


NK.empty( variable )
----------------------------------------------------------------------------
Returns false if any of these conditions are met:
- typeof variable === 'undefined'
- variable == null
- variable.length == 0 (Works with strings and arrays)

NK.clone( object )
----------------------------------------------------------------------------
Clone an object. The new object has a new reference.

    var array_a = [{name: "James"}, {name: "Mary"}];

    var array_b = NK.clone(array_a);


NK.set( variable_path, value )
----------------------------------------------------------------------------
Initialize an undefined nested variable

    NK.set( "my.var.a.b.c", 123 );
    // Same as "my.var.a.b.c = 123", but it creates the variable if not exist.


NK.get( variable, default_value )
----------------------------------------------------------------------------
If the variable does not exist, is undefined, or is null, returns default_value

    Example 1
      let aux = NK.get( myVar, false );
    
    Example 2
      let aux = NK.get( () => my.var.a.b.c, false );


NK.backtrace( message )
----------------------------------------------------------------------------
Prints the current backtrace to the console. An optional message can be indicated.



# NKBase CSS
A set of basic styles

Demo
----------------------------------------------------------------------------
[Live demo](https://codepen.io/Netkuup/pen/RgGewV)

.NKLink
----------------------------------------------------------------------------
Makes a text look like a link.
- Blue color
- Hand cursor
- Underline


        <div class="NKLink">It looks like a link</div>

.NKUrl
----------------------------------------------------------------------------
Makes a text look like a url.
- Blue color
- Pointer cursor

.NKUnlink
----------------------------------------------------------------------------
Make a link look like normal text.
- Avoids blue color
- Avoids underline

.NKUnselectable
----------------------------------------------------------------------------
Make an element unselectable.
- Avoids mouse selection

.NKBtn
----------------------------------------------------------------------------
Make an element look like a button.
- Hand cursor


.NKHideScroll
----------------------------------------------------------------------------
Make the scrollbar invisible but usable

- Invisible scroll


# NKBase Icons

.NKCloseIcon
----------------------------------------------------------------------------
Close icon floated right

    <i class="NKCloseIcon"></i>

[<< Index](../../../../)