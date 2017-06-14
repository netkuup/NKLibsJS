# NKRouting

[See the ./examples directory](./examples)


Shared JavaScript code for all the examples:


    var Controller_1 = {
        init: function() {
            console.log("Controller_1 init");
        },
        enter: function() {
            console.log("Controller_1 enter");
        },
        leave: function() {
            console.log("Controller_1 leave");
        }
    };


    var Controller_2 = {
        init: function() {
            console.log("Controller_2 init");
        },
        enter: function() {
            console.log("Controller_2 enter");
        },
        leave: function() {
            console.log("Controller_2 leave");
        }
    };




NKRouter - Hiding system
----------------------------------------------------------------------------
Hides all divs extept the active section.
[Example](./examples/Example_2.html)

[Live demo](https://codepen.io/Netkuup/pen/yXaRar)

HTML

    <div id="theDiv1" style=" border: 1px solid black;">
        Section 1
    </div>
    <div id="theDiv2" style=" border: 1px solid black;">
        Section 2
    </div>
    <div id="theDiv3" style=" border: 1px solid black;">
        Section 3
    </div>

    <a href="#" onclick="NKRouting.go('mySecondRuter', 'sectionOne')">Show section one</a>
    <a href="#" onclick="NKRouting.go('mySecondRuter', 'sectionTwo')">Show section two</a>
    <a href="#" onclick="NKRouting.go('mySecondRuter', 'sectionThree')">Show section three</a>

JS

    var routes2 = {
        router_name: "mySecondRuter",
        default_section: "sectionOne",
        sections: {
            sectionOne: { show: "#theDiv1", ctrl: "Controller_1" },
            sectionTwo: { show: "#theDiv2", ctrl: "Controller_2" },
            sectionThree: { show: "#theDiv3" }
        }
    };

    NKRouting.set_routes( routes2 );



NKRouter - Get system
----------------------------------------------------------------------------
Performs a GET
[Example](./examples/Example_1.html)

HTML

    <div id="theDiv1" style=" border: 1px solid black; overflow: hidden;">
        This will be replaced with the sections content.
    </div>

    <a href="#" onclick="NKRouting.go('myFirstRouter', 'sectionOne')">Show section one</a>
    <a href="#" onclick="NKRouting.go('myFirstRouter', 'sectionTwo')">Show section two</a>

JS

    var routes1 = {
        router_name: "myFirstRouter",
        container: "#theDiv1",
        sections: {
            sectionOne: { get: "http://exemple.com/Page_1.html", ctrl: "Controller_1" },
            sectionTwo: { get: "http://exemple.com/Page_2.html", ctrl: "Controller_2" }
        }
    };

    NKRouting.set_routes( routes1 );



NKRouter - DOM system
----------------------------------------------------------------------------
Removes the contents of all divs and saves it to a DOM variable.
The stored html will be copied to the active secction.
[Example](./examples/Example_3.html)

[Live demo](https://codepen.io/Netkuup/pen/MojPpN)

HTML

    <div style="border: 1px solid black;">

        <div id="theDiv1"> Sections container. </div>

    </div>

    <div id="theDiv2"> Section 1 </div>
    <div id="theDiv3"> Section 2 </div>


    <a href="#" onclick="NKRouting.go('myThirdRuter', 'sectionOne')">Show section one</a>
    <a href="#" onclick="NKRouting.go('myThirdRuter', 'sectionTwo')">Show section two</a>

JS

    var routes3 = {
        router_name: "myThirdRuter",
        container: "#theDiv1",
        default_section: "sectionOne",
        sections: {
            sectionOne: { show: "#theDiv2", ctrl: "Controller_1" },
            sectionTwo: { show: "#theDiv3", ctrl: "Controller_2" }
        }
    };


    NKRouting.set_routes( routes3 );


[<< Index](../../../../)