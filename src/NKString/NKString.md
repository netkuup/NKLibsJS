# NKString



NKString.capitalize( str )
----------------------------------------------------------------------------
Makes the first letter uppercase and the remaining letters lowercase.

    let result = NKString.capitalize( "heLLO world" ); //result: Hello world
.

    let result = "heLLO world".nkcapitalize(); //result: Hello world


NKString.normalizeSpaces( str )
----------------------------------------------------------------------------
Eliminates consecutive spaces and removes any spaces at the beginning or end of the string.

    let result = NKString.normalizeSpaces( "   Hello    world    " ); //result: "Hello world"
.

    let result = "   Hello    world    ".nknormalizeSpaces(); //result: "Hello world"

NKString.deleteAllSpaces( str )
----------------------------------------------------------------------------
Remove all spaces from a string.

    let result = NKString.deleteAllSpaces( "   Hello    world    " ); //result: "Helloworld"
.

    let result = "   Hello    world    ".deleteAllSpaces(); //result: "Helloworld"


NKString.decodeHtmlEntities( str )
----------------------------------------------------------------------------
Converts HTML entities to text.

    let result = NKString.decodeHtmlEntities( "Dose &gt; 10 &micro;" ); //result: "Dose > 10 µ"
.

    let result = "Dose &gt; 10 &micro;".decodeHtmlEntities(); //result: "Dose > 10 µ"