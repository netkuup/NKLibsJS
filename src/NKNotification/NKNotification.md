# NKNotification
Easy notification messages

Demo & Examples
----------------------------------------------------------------------------
[See the ./examples directory](./examples)

[Live demo](https://codepen.io/Netkuup/pen/NWBNEgJ)

Initialization
----------------------------------------------------------------------------
To use any function of this document, you **must** call this funtion **once**.

    NKNotification.start();


NKNotification.show( content_array, miliseconds )
----------------------------------------------------------------------------
Show the notification 2 seconds

    NKNotification.show( ["Title", "Subtitle"], 2000 );

Show the notification until user closes it

    NKNotification.show( ["Title", "Subtitle 1", "Subtitle 2"] );

Set the notification content elements

    var title_el = document.createElement("div");
    var subtitle_el = document.createElement("div");
    title_el.innerHTML = "Title";
    subtitle_el.innerHTML = "Subtitle";

    NKNotification.show( [title_el, subtitle_el], 2000 );
NKNotification.hide()
----------------------------------------------------------------------------
Hide the notification

    NKNotification.hide();

