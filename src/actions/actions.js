var NKActions = {};

if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before storage.js";
}


NKActions.start = function() {
    if ( NK.isset(NKActions.loaded) && NKActions.loaded === true ) return;

    window.onload = function () {

        $('.NKHide_btn').on('click', function(){
            $(this).closest('.NKHide_dst').hide();
        });

        $('.NKDel_btn').on('click', function(){
            $(this).closest('.NKDel_dst').remove();
        });

        $('.NKTemplate_btn').on('click', function(){
            var template_name = $(this).attr("class").split('NKTemplate_btn ')[1].split(' ')[0];
            $('.NKTemplate_dst.'+template_name).append(
                $('.NKTemplate_src.'+template_name).clone(true, true).removeClass('NKTemplate_src').addClass('NKTemplate').show()
            );
        });

    };


    NKActions.loaded = true;
};


