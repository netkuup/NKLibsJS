var NKActions = {};

if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before storage.js";
}


NKActions.start = function( ) {
    if ( NK.isset(NKActions.loaded) && NKActions.loaded === true ) return;

    window.onload = function () {
        NKActions.refresh();
    };
    
    NKActions.loaded = true;
};


NKActions.refresh = function() {

    $('.NKHide_btn').off().on('click', function(){
        $(this).closest('.NKHide_dst').hide();
    });

    $('.NKDel_btn').off().on('click', function(){
        $(this).closest('.NKDel_dst').remove();
    });

    // TODO In test phase.
    $('.NKToggle_btn').off().on('click', function(){
        var e = $(this).siblings('.NKToggle_dst');
        e.toggle();
        if ( $(this).hasClass('NKReact') ) {
            e.is(':visible') ? $(this).html("Hide") : $(this).html("Show");
        }
    });

    $('.NKToggle_btn.NKReact').each(function() {
        var e = $(this).siblings('.NKToggle_dst');
        e.is(':visible') ? $(this).html("Hide") : $(this).html("Show");
    });

    $('.NKTemplate_btn').off().on('click', function(){
        var template_name = $(this).attr("class").split('NKTemplate_btn ')[1].split(' ')[0];
        $('.NKTemplate_dst.'+template_name).append(
            $('.NKTemplate_src.'+template_name).clone(true, true).removeClass('NKTemplate_src').addClass('NKTemplate').show()
        );
    });

};


