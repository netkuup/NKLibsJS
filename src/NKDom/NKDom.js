NKDomTemplate = {};
NKDomElement = {};

NKDomTemplate.register = function ( template_name, template_code ) {

    if ( typeof customElements.get(template_name) !== "undefined" ) {
        console.error("Error, " + template_name + " is already registered.");
        return;
    }

    customElements.define(template_name,
        class extends HTMLElement {
            connectedCallback() {
                this.attachShadow({mode: 'open'});
                this.shadowRoot.innerHTML = template_code;
            }
        }
    );

}


NKDomTemplate.start = function () {
    let doc_templates = document.querySelectorAll( 'template' );

    for ( let i = 0; i < doc_templates.length; i++ ) {
        NKDomTemplate.register( doc_templates[i].attributes.name.value, doc_templates[i].innerHTML );
    }

}


NKDomTemplate.fill = function ( template_name, template_data ) {
    let content_array = Array.isArray(template_data) ? template_data : [template_data];
    let html_result = "";

    for ( let i = 0; i < content_array.length; i++ ) {

        html_result += "<" + template_name + ">";

        for (const [key, value] of Object.entries(content_array[i])) {
            html_result += '<span slot="' + key + '">' + value + '</span>';
        }

        html_result += "</" + template_name + ">";

    }

    return html_result;
}

NKDomElement.setHtml = function ( element_id_or_class, element_html ) {
    document.getElementById( element_id_or_class.slice(1) ).innerHTML = element_html;
}

NKDomElement.appendHtml = function ( element_id_or_class, element_html ) {
    document.getElementById( element_id_or_class.slice(1) ).insertAdjacentHTML("afterend", element_html);
}