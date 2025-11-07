const {NKSerialize, NKUnserialize} = require('./nklibsjs.js');

let my_object = [{
    name: "James",
    number: 123,
    numbers: [123.456, 12, 15, 283],
    strings: ["Hello world", "Foo bar"],
    objects: [{foo: 12}, {bar: 34}],
    mix_array: [123, "foo", {bar: 56}]
}];

console.log("Original object:", my_object );

let result_serialized = NKSerialize.object( my_object );
console.log("Result serialized:", result_serialized);

let result_unserialized = NKUnserialize.object( result_serialized );
console.log("Result unserialized:", result_unserialized);