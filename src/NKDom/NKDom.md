# NKDom
Easy way to manipulate dom elements

NKDom.parseIdOrClass( element_id_or_class )
----------------------------------------------------------------------------
Parse string element name

    NKDom.parseIdOrClass("#foo");

    Output:
        {
            is_class: false,
            is_id: true,
            name: "foo"
        }

NKDom.select( element_id_or_class )
----------------------------------------------------------------------------
Select elements by id or class

    NKDom.select("#foo");

    Ourput: NodeList(3) [div.foo, div.foo, div.foo]


NKDom.setCss( element, css_property_name, css_property_value )
----------------------------------------------------------------------------
Set css property

    NKDom.setCss( "#myDiv", "background-color", "red" );

    NKDom.setCss( document.getElementById("myDiv"), "background-color", "red" );


NKDom.setAttribute( element, attribute_name, attribute_value )
----------------------------------------------------------------------------
Set attribute

    NKDom.setAttribute( "#myDiv", "data", "foo" );

    NKDom.setAttribute( document.getElementById("myDiv"), "data", "foo" );

    Output: <div id="myDiv" data="foo"></div>


NKDom.getAttribute( element, attribute_name )
----------------------------------------------------------------------------
Get attribute

    NKDom.getAttribute( "#myDiv", "data" );

    NKDom.getAttribute( document.getElementById("myDiv"), "data" );


NKDom.setHtml( element, element_html )
----------------------------------------------------------------------------
Set element html content

    NKDom.setHtml( "#myDiv", "<b>Foo</b>" );

    NKDom.setHtml( document.getElementById("myDiv"), "<b>Foo</b>" );

NKDom.appendHtml( element, element_html )
----------------------------------------------------------------------------
Append html content to an element

    NKDom.appendHtml( "#myDiv", "<b>Foo</b>" );

    NKDom.appendHtml( document.getElementById("myDiv"), "<b>Foo</b>" );



NKDom.addClass( element, class_name ) NKDom.removeClass( element, class_name )
----------------------------------------------------------------------------
Add or remove a class

    NKDom.addClass( "#myDiv", "blue-button" );
    NKDom.removeClass( "#myDiv", "red-button" );

    NKDom.addClass( document.getElementById("myDiv"), "blue-button" );
    NKDom.removeClass( document.getElementById("myDiv"), "red-button" );




NKDomTemplate.register( template_name, template_code )
----------------------------------------------------------------------------
Register template via javascript

    NKDomTemplate.register('personal-info', `
        <div class="menu" style="border: 1px solid black;">
            <slot name="name">Default name</slot>
            <slot name="mobile">Default mobile number</slot>
        </div>
    `);

NKDomTemplate.fill( template_name, template_code )
----------------------------------------------------------------------------
Example 1

    // HTML Code
    <div id="list"></div>

    // Javascript code
    NKDomTemplate.register('personal-info', `
        <div class="menu" style="border: 1px solid black;">
            <slot name="name">Default name</slot>
            <slot name="mobile">Default nobile number</slot>
        </div>
    );

    let data = [
        {name: "James", mobile: "123123"},
        {name: "Albert", mobile: "123123"},
    ];
    let html_code = NKDomTemplate.fill( "personal-info", data );
    NKDom.setHtml( "#list", html_code );


Example 2

    // HTML Code
    <div id="list"></div>

    <template name="personal-info">
        <div class="menu" style="border: 1px solid black;">
            <slot name="name">Default name</slot>
            <slot name="mobile">Default nobile number</slot>
        </div>
    </template>

    // Javascript code
    NKDomTemplate.start();

    let data = [
        {name: "James", mobile: "123123"},
        {name: "Albert", mobile: "123123"},
    ];
    let html_code = NKDomTemplate.fill( "personal-info", data );
    NKDom.setHtml( "#list", html_code );