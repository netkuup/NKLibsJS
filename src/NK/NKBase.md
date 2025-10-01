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

Math functions
----------------------------------------------------------------------------
Special thanks to the developers of `big.js` for their incredible library, which is licensed under the MIT License and has greatly assisted this project.

[Big.js Docs](https://mikemcl.github.io/big.js)

    let number_1 = 1.7;
    let number_2 = 3.4;

    number_1.nkadd(number_2);
    number_1.nksum(number_2); //Same as add
    number_1.nkminus(number_2);
    number_1.nksubtract(number_2); //Same as minus
    number_1.nkdiv(number_2);
    number_1.nkmul(number_2);
    number_1.nkpow(number_2);
    number_1.nkprec(2);  //(123.456).nkprec(2) => 12
    number_1.nkround(2); //(123.456).nkround(2) => 123.46
    number_1.nkfixed(2); //Same as nkround
    number_1.nktruncate(2); //(123.456).nktruncate(2) => 123.45
    number_1.nksqrt();

    (-1.7).nkabs(); //1.7
    



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