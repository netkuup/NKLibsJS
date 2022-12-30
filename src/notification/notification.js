var NKNotification = {};
NKNotification.timeout = null;

if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before loader.js";
}


NKNotification.start = function() {

    if ( $('#NKNotification').length < 1 ) {
        var close_icon_html = '<svg onclick="NKNotification.hide()" class="close-icon" xmlns="http://www.w3.org/2000/svg" stroke="black" width="20" height="20" viewBox="0 0 24 24" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

        var wrapper = document.createElement("div");
        var content = document.createElement("div");

        wrapper.setAttribute("id", "NKNotification");
        wrapper.style.display = "none";
        wrapper.innerHTML = close_icon_html;

        content.setAttribute("class", "content_wrapper");
        wrapper.append(content);

        document.body.appendChild(wrapper);
    }

}

NKNotification.show = function( content = ["Title", "Subtitle"], ms = 0 ) {
    clearTimeout(NKNotification.timeout);

    document.getElementById("NKNotification").style.display = "block";

    $('#NKNotification .content_wrapper').html("");

    for ( var i = 0; i < content.length; i++ ) {
        if ( typeof content[i] === "string" ) {
            var aux = document.createElement("div");
            aux.setAttribute("class", "content");
            if ( i === 0 ) aux.setAttribute("class", "content bold");
            aux.innerHTML = content[i];
            $('#NKNotification .content_wrapper').append(aux);

        } else {
            $('#NKNotification .content_wrapper').append(content[i]);

        }

    }



    if ( ms > 0 ) NKNotification.timeout = setTimeout(NKNotification.hide, ms);

}

NKNotification.hide = function() {
    clearTimeout(NKNotification.timeout);
    document.getElementById("NKNotification").style.display = "none";

}
