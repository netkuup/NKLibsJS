# NKBase
Set of basic functions.

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



NK.backtrace( message )
----------------------------------------------------------------------------
Prints the current backtrace to the console. An optional message can be indicated.


NK.getScriptPath()
----------------------------------------------------------------------------
Returns the current .js file path.


NK.sleep( milliseconds )
----------------------------------------------------------------------------
Sleep x milliseconds

    await NK.sleep(1000);


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