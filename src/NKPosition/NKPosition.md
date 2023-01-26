# NKPosition
A set of basic set of positioning functions

[See the ./examples directory](./examples)

Initialization
----------------------------------------------------------------------------
To use any function of this document, you **must** call this funtion **once**.

    NKPosition.start();


NKPosition.getMouse() / .getMouseX() / .getMouseY()
----------------------------------------------------------------------------
Get the mouse position.

- Relative: Screen starts at [ScollX,ScrollY]
- Absolute: Screen starts at [0,0]

        console.log( "Relative [X,Y]:", NKPosition.getMouse() );
        console.log( "Absolute [X,Y]:", NKPosition.getMouse(true) );
        
        console.log( "Relative X:", NKPosition.getMouseX() );
        console.log( "Absolute Y:", NKPosition.getMouseY(true) );
    
**Params:**

NKPosition.getMouse( absolute )

NKPosition.getMouseX( absolute )

NKPosition.getMouseY( absolute )

| param | Values | Mandatory | Description |
|:---|:---|:---|:---|
| absolute | true/**false** | No | <b>Absolute:</b> Screen starts at [0,0] <br> <b>Relative:</b> Screen starts at [ScollX,ScrollY] |


NKPosition.getStroll() / .getStrollX() / .getStrollY()
----------------------------------------------------------------------------
Get the scroll offset.

    console.log( NKPosition.getStroll() );
    console.log( NKPosition.getStrollX() );
    console.log( NKPosition.getStrollY() );

[<< Index](../../../../)
