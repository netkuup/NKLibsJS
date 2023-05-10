var NKActions = {};

if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before actions.js";
}


NKActions.start = function( reactable ) {
    if ( NK.isset(NKActions.loaded) && NKActions.loaded === true ) return;

    window.addEventListener('load', NKActions.reload );
    if ( window.loaded === true ) NKActions.reload();

    if ( reactable === true ) {
        NK.core.reloadOnDomChange( NKActions );
    }
    
    NKActions.loaded = true;
};


NKActions.reload = function() {

    $('.NKHide_btn').off().on('click', function(){
        $(this).closest('.NKHide_dst').hide();
    });

    $('.NKDel_btn').off().on('click', function(){
        $(this).closest('.NKDel_dst').remove();
    });

    function reactLabel( orig, dst ) {
        var labelName = $(orig).html();
        if ( labelName.toLowerCase().startsWith("hide") || labelName.toLowerCase().startsWith("show") ) {
            labelName = labelName.substring(4);
        }
        if ( labelName.length > 0 && !labelName.startsWith(" ") ) labelName = " " + labelName;

        if ( dst.is(':visible') ) {
            $(orig).html("Hide" + labelName);
        } else {
            $(orig).html("Show" + labelName);
        }
        console.log("entra");
    }

    $('.NKToggle_btn').off().on('click', function(){
        var e = $(this).siblings('.NKToggle_dst');
        e.toggle();
        if ( $(this).hasClass('NKReact') ) reactLabel(this, e);
    });

    $('.NKToggle_btn.NKReact').each(function() {
        var e = $(this).siblings('.NKToggle_dst');
        reactLabel(this, e);
    });

};


