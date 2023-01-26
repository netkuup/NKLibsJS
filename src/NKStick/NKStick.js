var NKStick = {};

if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before stick.js";
}

// TODO Same functions but with nkdata-container="theContainer"

NKStick.start = function() {
    if ( NK.isset(NKStick.loaded) && NKStick.loaded === true ) return;

    $.each( $('.NKStickBD'), function( key, value ) {
        $(this).attr('nkdata-top', $(this).offset().top );
    });


    window.addEventListener('load', NKStick.reload );
    window.addEventListener('resize', NKStick.reload );
    window.addEventListener('scroll',  NKStick.reload );

    NKStick.loaded = true;
};

NKStick.reload = function() {

    var scroll_visible = $(document).height() > $(window).height();
    var scroll_top = $(document).scrollTop();

    // NKStickBN
    if ( scroll_visible ) {
        $('.NKStickBN').removeClass('NKStickBO');
    } else {
        $('.NKStickBN').addClass('NKStickBO');
    }

    if ( !scroll_visible ) return;

    // NKStickBD
    $('.NKStickBD').removeClass('NKStickBO');

    $.each( $('.NKStickBD'), function( key, value ) {
        if ( scroll_top + $(window).height() < $(this).offset().top + $(this).height() ) {
            $('.NKStickBD').addClass('NKStickBO');
        }
    });


    // NKStickTD
    $('.NKStickTD').removeClass('NKStickTO');

    $.each( $('.NKStickTD'), function( key, value ) {

        if ( $(this).css('position') === "fixed" ) {
            var top = parseInt($(this).css('top'));

            if ( scroll_top < top ) {
                $(this).css('margin-top', -scroll_top );
            } else {
                $(this).css('margin-top', -top );
            }

        } else {
            if ( scroll_top > $(this).offset().top ) {
                $('.NKStickTD').addClass('NKStickTO');
            }

        }


    });



};
