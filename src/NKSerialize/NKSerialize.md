# NKSerialize
[See the ./examples directory](./examples)



NKSerialize.object / NKUnserialize.object
----------------------------------------------------------------------------
This function is designed to serialize an object, ensuring it takes up significantly less space compared to storing it in JSON format.


    let my_object = {
        name: "James",
        number: 123,
        numbers: [123.456, 12, 15, 283],
        strings: ["Hello world", "Foo bar"],
        objects: [{foo: 12}, {bar: 34}],
        mix_array: [123, "foo", {bar: 56}]
    };
    
    let result_serialized = NKSerialize.object( my_object );
    console.log("Result serialized:", result_serialized);
    
    let result_unserialized = NKUnserialize.object( result_serialized );
    console.log("Result unserialized:", result_unserialized);
