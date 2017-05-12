# NKBase JS
A set of basic functions.

NK.isset( variable )
----------------------------------------------------------------------------
Returns false if any of these conditions are met:
- typeof variable === 'undefined'
- variable == null


NK.empty( variable )
----------------------------------------------------------------------------
Returns false if any of these conditions are met:
- typeof variable === 'undefined'
- variable == null
- variable.length == 0 (Works with strings and arrays)


# Base CSS
A set of basic styles

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

.NKWFSize
----------------------------------------------------------------------------
Element width full size.
- Width: 100%

