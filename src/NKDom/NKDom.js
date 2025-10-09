NKDomTemplate = {};
NKDom = {};

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

NKDom.parseIdOrClass = function ( element_id_or_class ) {
    let result = {
        is_class: false,
        is_id: false,
        name: ""
    };
    if ( element_id_or_class.length === 0 ) return result;

    result.is_id = ( element_id_or_class[0] === "#" );
    result.is_class = ( element_id_or_class[0] === "." );
    result.name = element_id_or_class.slice(1);

    return result;
}

NKDom.select = function ( element_id_or_class ) {
    let result = document.querySelectorAll( element_id_or_class );
    return ( element_id_or_class[0] === "#" ) ? result[0] : result;
}


//Para uso interno
NKDom.getElementList = function ( element ) {
    if ( typeof element === 'string' ) element = NKDom.select( element );
    if ( element instanceof NodeList ) return element;
    if ( element instanceof Node ) return [element];
    return [];
}

//Para uso interno
NKDom.getElement = function ( element ) {
    if ( typeof element === 'string' ) element = NKDom.select( element );
    if ( element instanceof NodeList && element.length > 0 ) return element[0];
    if ( element instanceof Node ) return element;
}

// tag_name = "div"
NKDom.getChildren = function ( element, tag_name = "" ) {
    let result = [];
    tag_name = tag_name.toLowerCase();

    NKDom.getElementList(element).forEach(function( el, i ) {
        for ( let i = 0; i < el.children.length; i++ ) {
            if ( tag_name === "" || el.children[i].tagName.toLowerCase() === tag_name ) {
                result.push(el.children[i]);
            }
        }
    });

    //Pasamos el array a NodeList
    var emptyNodeList = document.createDocumentFragment().childNodes;
    var resultNodeList = Object.create(emptyNodeList, {
        'length': {value: result.length, enumerable: false},
        'item': {"value": function(i) {return this[+i || 0];}, enumerable: false}
    });
    result.forEach((v, i) => resultNodeList[i] = v);

    return resultNodeList;
}

NKDom.getClosest = function ( element, id_or_class ) {
    element = NKDom.getElement(element);
    id_or_class = NKDom.parseIdOrClass(id_or_class);

    if ( id_or_class.is_class ) {
        while (element && element.classList && !element.classList.contains(id_or_class.name)) element = element.parentNode;
        if ( !element.classList || !element.classList.contains(id_or_class.name) ) element = null;
    } else if ( id_or_class.is_id ) {
        while (element && element.id !== id_or_class.name) element = element.parentNode;
        if ( element.id !== id_or_class.name ) element = null;
    }

    return element;
}


NKDom.setCss = function ( element, css_property_name, css_property_value ) {
    let css_prop = css_property_name.replace(/-([a-z])/g, function(match, letra) {return letra.toUpperCase();});

    NKDom.getElementList(element).forEach(function( el, i ) {
        el.style[css_prop] = css_property_value;
    });
}

NKDom.getCss = function ( element, css_property_name ) {
    let css_prop = css_property_name.replace(/-([a-z])/g, function(match, letra) {return letra.toUpperCase();});

    let result = [];

    NKDom.getElementList(element).forEach(function( el, i ) {
        result.push( window.getComputedStyle(el)[css_prop] );
    });

    if ( result.length === 0 ) return;
    if ( result.length === 1 ) return result[0];
    return result;
}

NKDom.setAttribute = function ( element, attribute_name, attribute_value ) {
    NKDom.getElementList(element).forEach(function( el, i ) {
        el.setAttribute(attribute_name, attribute_value);
    });
}

NKDom.getAttribute = function ( element, attribute_name ) {
    element = NKDom.getElementList(element);
    if ( element.length === 0 ) return;

    return element[0].getAttribute( attribute_name );
}

NKDom.addClass = function ( element, class_name ) {
    NKDom.getElementList(element).forEach(function( el, i ) {
        el.classList.add(class_name);
    });
}

NKDom.removeClass = function ( element, class_name ) {
    NKDom.getElementList(element).forEach(function( el, i ) {
        el.classList.remove(class_name);
    });
}

NKDom.hasClass = function ( element, class_name ) {
    let elements = NKDom.getElementList(element);

    for ( var i = 0; i < elements.length; i++ ) {
        if ( elements[i].classList.contains(class_name) ) return true;
    }

    return false;
}

NKDom.setHtml = function ( element, element_html ) {
    NKDom.getElementList(element).forEach(function( el, i ) {
        el.innerHTML = element_html;
    });
}

NKDom.appendHtml = function ( element_id_or_class, element_html ) {
    NKDom.getElementList(element).forEach(function( el, i ) {
        el.insertAdjacentHTML("afterend", element_html);
    });
}

NKDom.addEventListener = function ( element, event_name, event_listener_function, remove_previous = true ) {
    NKDom.getElementList(element).forEach(function( el, i ) {
        if ( remove_previous ) el.removeEventListener(event_name, event_listener_function);
        el.addEventListener(event_name, event_listener_function);
    });
}