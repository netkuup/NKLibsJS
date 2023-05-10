# NKDom
Easy way to manipulate dom elements

NKDomElement.setHtml( element_id_or_class, element_html )
----------------------------------------------------------------------------
Set element html content

    NKDomElement.setHtml( "#myDiv", "<b>Foo</b>" );


NKDomElement.appendHtml( element_id_or_class, element_html )
----------------------------------------------------------------------------
Append html content to an element

    NKDomElement.appendHtml( "#myDiv", "<b>Foo</b>" );


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
    NKDomElement.setHtml( "#list", html_code );


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
    NKDomElement.setHtml( "#list", html_code );