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


NKArray.mountTree( data, id_name, parent_id_name, child_array_name )
----------------------------------------------------------------------------
    let item_list = [
        {id: 1, name: "Folder 1", parent_item_id: 0},
        {id: 2, name: "Folder 2", parent_item_id: 0},
        {id: 3, name: "Folder 3", parent_item_id: 0},
        {id: 4, name: "Folder 2.1", parent_item_id: 2},
        {id: 5, name: "Folder 2.2", parent_item_id: 2},
        {id: 6, name: "File 1", parent_item_id: 4}
    ];

    let tree = NKArray.mountTree( item_list, "id", "parent_item_id", "children" );

    console.log(tree);
    
    // Output:
    // [
    //     {"id": 1, "name": "Folder 1", "parent_item_id": 0, "children": []},
    //     {"id": 2, "name": "Folder 2", "parent_item_id": 0,
    //         "children": [
    //              {"id": 4, "name": "Folder 2.1", "parent_item_id": 2,
    //                  "children": [{"id": 6, "name": "File 1", "parent_item_id": 4, "children": []}]
    //              },
    //              {"id": 5, "name": "Folder 2.2", "parent_item_id": 2, "children": []}
    //          ]
    //     },
    //     {"id": 3, "name": "Folder 3", "parent_item_id": 0, "children": []}
    // ]