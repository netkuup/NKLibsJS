# NKArray


NKArray.getCombinations( join_str, array1, array2, array3, ... )
----------------------------------------------------------------------------
Make all possible combinations.

    let join_str = "-";
    let aux1 = ["a", "b", "c"];
    let aux2 = ["A", "B", "C"];
    
    let result = NKArray.getCombinations( join_str, aux1, aux2 );
    
    console.log( result ); //Output: ['a-A', 'a-B', 'a-C', 'b-A', 'b-B', 'b-C', 'c-A', 'c-B', 'c-C']

NKArray.clone( object )
----------------------------------------------------------------------------
Clone an object. The new object has a new reference.

    let array_a = [{name: "James"}, {name: "Mary"}];

    let array_b = NKArray.clone(array_a);