# NKCast
Casting functions

NKCast.intByteArray
----------------------------------------------------------------------------
A __intByte__ Its a 8 bit integer [0..255].

- __Utf16String__: NKCast.intByteArray.toUtf16String( data )

        [65, 66] => "AB" (Utf 8 or 16)

- __HexString__: NKCast.intByteArray.toHexString( data, startWith0x, addSpaces )

        [65, 66] => "0x41 0x42" | "41 42" | "4142" ...

- __Int__: NKCast.intByteArray.toInt( data )

        [65, 66] => [0100 0001, 0100 0010] => 0100000101000010 => 16706


NKCast.intByte
----------------------------------------------------------------------------
A __intByte__ Its a 8 bit integer [0..255].

- __HexString__: NKCast.intByte.toHexString( data, startWith0x )

        255 => "ff" | "0xff"


NKCast.utf16String
----------------------------------------------------------------------------

- __IntByteArray__: NKCast.utf16String.toIntByteArray( data )

        "AB" => [65, 66]


NKCast.utf8String
----------------------------------------------------------------------------

- __IntByteArray__: NKCast.utf8String.toIntByteArray( data )

        "AB" => [65, 66]




