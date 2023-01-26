var NKPopup = {};

if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before popup.js";
}

NKPopup.config = {
    allow_hover: true,
    mouse_margin: 5,
    box_margin: 5
};

NKPopup.start = function( reactable ) {
    if ( NK.isset(NKPopup.loaded) && NKPopup.loaded === true ) return;
    NKPopup.loaded = true;

    if ( typeof NKPosition === 'undefined' ) {
        throw "You must include position.js";
    }
    NKPosition.start();

    window.addEventListener('load', NKPopup.reload );
    if ( window.loaded === true ) NKPopup.reload();

    if ( reactable === true ) {
        NK.core.reloadOnDomChange( NKPopup );
    }

};


NKPopup.reload = function() {

    $('.NKPopup_dst').hide();

    $('.NKPopup_src').off();

    $('.NKPopup_src').on('mousemove', function(){
        var dst = $(this).siblings('.NKPopup_dst');
        var type = NK.isset( dst.attr('nk-type') ) ? dst.attr('nk-type') : "box";
        var align = NK.isset( dst.attr('nk-align') ) ? dst.attr('nk-align').split(",") : ["top","center"];
        var offset = NK.isset( dst.attr('nk-offset') ) ? dst.attr('nk-offset').split(",").map(Number) : [0,0];
        var arrowSize = NK.isset( dst.attr('nk-arrow-size') ) ? dst.attr('nk-arrow-size').split(",").map(Number)[1] : 0;
        var fixedX = dst.attr('nk-x');
        var fixedY = dst.attr('nk-y');

        dst.show();
        var pos = {};

        if ( type === "mouse" ) {
            var src_size = [10, 22];
            var src_pos = NKPosition.getMouse();
            var margin = NKPopup.config.mouse_margin;
        } else if ( type === "box" ) {
            var src_size = [$(this).outerWidth(), $(this).outerHeight()];
            var src_pos = [$(this).offset().left, $(this).offset().top];
            var margin = NKPopup.config.box_margin;
        } else {
            throw ( "Invalid type: " + type );
        }


        if ( align[0] === "top" || align[0] === "bottom" ) {

            if ( !NK.isset(align[1]) || align[1] === "center" ) {
                pos = {left: src_pos[0] - (dst.outerWidth()/2) + (src_size[0]/2), top: src_pos[1]  - dst.outerHeight() - arrowSize - margin};
            } else if ( align[1] === "left" ) {
                pos = {left: src_pos[0] - dst.outerWidth() + src_size[0], top: src_pos[1] - dst.outerHeight() - arrowSize - margin};
            } else if ( align[1] === "right" ) {
                pos = {left: src_pos[0], top: src_pos[1] - dst.outerHeight() - arrowSize - margin};
            } else {
                throw ("Invalid param '" + align[1] + "'");
            }


            if ( align[0] === "bottom" ) pos.top += src_size[1] + dst.outerHeight() + (arrowSize*2) + (margin*2);

        } else if ( align[0] === "left" || align[0] === "right" ) {

            if ( !NK.isset(align[1]) || align[1] === "middle" ) {
                pos = {left: src_pos[0] - dst.outerWidth() - margin  - arrowSize, top: src_pos[1] - (dst.outerHeight()/2) + (src_size[1]/2)};
            } else if ( align[1] === "top" ) {
                pos = {left: src_pos[0] - dst.outerWidth() - margin - arrowSize, top: src_pos[1] - dst.outerHeight() + src_size[1] };
            } else if ( align[1] === "bottom" ) {
                pos = {left: src_pos[0] - dst.outerWidth() - margin - arrowSize, top: src_pos[1] };
            } else {
                throw ("Invalid param '" + align[1] + "'");
            }

            if ( align[0] === "right" ) pos.left += src_size[0] + dst.outerWidth() + (arrowSize*2) + (margin*2);

        } else {
            throw ("Invalid param '" + align[0] + "'");
        }


        pos.left = pos.left + offset[0];
        pos.top = pos.top + offset[1];
        if ( NK.isset(fixedX) ) pos.left = fixedX;
        if ( NK.isset(fixedY) ) pos.top = fixedY;

        dst.offset(pos);

    });

    $('.NKPopup_src').on('mouseleave', function(){
        var self = $(this);

        if ( NKPopup.config.allow_hover ) {

            // Without timeout we can't know if mouse are hover popup window.
            window.setTimeout(function(){
                if( self.siblings('.NKPopup_dst:hover').length == 0 ) {
                    self.siblings('.NKPopup_dst').hide();
                } else {
                    self.siblings('.NKPopup_dst:hover').on('mouseleave', function(){
                        $(this).off().hide();
                    });
                }
            }, 50);

        } else {
            self.siblings('.NKPopup_dst').hide();
        }

    });


    // Add arrows
    NK.core.ignoreMutations( 1 ); // Avoid infinite reload loop if (reactable === true)

    $( ".NKPopup_dst" ).each(function( index ) {
        if ( !NK.isset( $(this).attr('nk-arrow-size') ) && !NK.isset( $(this).attr('nk-arrow-offset') ) ) return;
        var arrow_size = NK.isset( $(this).attr('nk-arrow-size') ) ? $(this).attr('nk-arrow-size').split(",").map(Number) : [10,7];
        //var arrow_offset = NK.isset( $(this).attr('nk-arrow-offset') ) ? $(this).attr('nk-arrow-offset') : 0;
        var dst_offset = NK.isset( $(this).attr('nk-offset') ) ? $(this).attr('nk-offset').split(",").map(Number) : [0,0];
        var align = NK.isset( $(this).attr('nk-align') ) ? $(this).attr('nk-align').split(",") : ["top","center"];
        var src = $(this).siblings('.NKPopup_src');

        var arrow_stroke = $( document.createElement("i") );
        arrow_stroke.addClass('NKPopup_arrow_stroke');
        $(this).append(arrow_stroke);

        var arrow_fill = $( document.createElement("i") );
        arrow_fill.addClass('NKPopup_arrow_fill');
        $(this).append(arrow_fill);

        var arrow = { border: 1, stroke_border: [0,0,0,0], fill_border: [0,0,0,0], stroke_colors: ['','','',''], fill_colors: ['','','',''], left: [50,50], top: [0,0] };

        if ( align[0] === "top" ) {
            arrow.border = parseInt($(this).css('border-bottom-width').split('px')[0]);
            arrow.stroke_border = [ (arrow_size[1]+arrow.border), ((arrow_size[0]/2)+arrow.border), 0, ((arrow_size[0]/2)+arrow.border) ]; // Height Width/2 0 Width/2
            arrow.fill_border = [ arrow_size[1], (arrow_size[0]/2), 0, (arrow_size[0]/2) ];
            arrow.top = [$(this).innerHeight(), $(this).innerHeight()];
            arrow.stroke_colors[0] = $(this).css('border-bottom-color');
            arrow.fill_colors[0] = $(this).css('background-color');

        } else if ( align[0] === "bottom" ) {
            arrow.border = parseInt($(this).css('border-top-width').split('px')[0]);
            arrow.stroke_border = [ 0, ((arrow_size[0]/2)+arrow.border), (arrow_size[1]+arrow.border), ((arrow_size[0]/2)+arrow.border) ]; // 0 Width/2 Height Width/2
            arrow.fill_border = [ 0, (arrow_size[0]/2), arrow_size[1], (arrow_size[0]/2) ];
            arrow.top = [(arrow_size[1]*-1)-1, (arrow_size[1]*-1)];
            arrow.stroke_colors[2] = $(this).css('border-top-color');
            arrow.fill_colors[2] = $(this).css('background-color');

        } else if ( align[0] === "right" ) {
            arrow.border = parseInt($(this).css('border-left-width').split('px')[0]);
            arrow.stroke_border = [ ((arrow_size[0]/2)+arrow.border), (arrow_size[1]+arrow.border), ((arrow_size[0]/2)+arrow.border), 0]; // Width/2 Height Width/2 0
            arrow.fill_border = [ (arrow_size[0]/2), arrow_size[1], (arrow_size[0]/2), 0];
            arrow.stroke_colors[1] = $(this).css('border-left-color');
            arrow.fill_colors[1] = $(this).css('background-color');
            arrow.left[0] = 0 - arrow_size[1] - arrow.border;
            arrow.left[1] = arrow.left[0] + arrow.border;

        } else if ( align[0] === "left" ) {
            arrow.border = parseInt($(this).css('border-right-width').split('px')[0]);
            arrow.stroke_border = [ ((arrow_size[0]/2)+arrow.border), 0, ((arrow_size[0]/2)+arrow.border), (arrow_size[1]+arrow.border) ]; // Width/2 0 Width/2 Height
            arrow.fill_border = [ (arrow_size[0]/2), 0, (arrow_size[0]/2), arrow_size[1] ];
            arrow.stroke_colors[3] = $(this).css('border-right-color');
            arrow.fill_colors[3] = $(this).css('background-color');
            arrow.left[0] = $(this).innerWidth();
            arrow.left[1] = arrow.left[0];
        }

        if ( align[1] === "left" ) {
            arrow.left[0] = $(this).outerWidth() - (src.outerWidth()/2) - (arrow_size[0]/2) - (arrow.border*2);
            arrow.left[1] = arrow.left[0] + arrow.border
        } else if ( align[1] === "center" ) {
            arrow.left[0] = ($(this).outerWidth()/2) - (arrow_size[0]/2) - (arrow.border*2);
            arrow.left[1] = arrow.left[0] + arrow.border;
        } else if ( align[1] === "right" ) {
            arrow.left[0] = (src.outerWidth()/2) - (arrow_size[0]/2) - (arrow.border*2);
            arrow.left[1] = arrow.left[0] + arrow.border
        } else if ( align[1] === "top" ) {
            arrow.top[0] = $(this).outerHeight() - (src.outerHeight()/2) - (arrow_size[0]/2)  - arrow.border;
            arrow.top[1] = arrow.top[0] + arrow.border;
        } else if ( align[1] === "middle" ) {
            arrow.top[0] = ($(this).outerHeight()/2) - (arrow_size[0]/2) - arrow.border;
            arrow.top[1] = arrow.top[0] + arrow.border;
        } else if ( align[1] === "bottom" ) {
            arrow.top[0] = (src.outerHeight()/2) - (arrow_size[0]/2) - arrow.border;
            arrow.top[1] = arrow.top[0] + arrow.border;
        }
        arrow.left[0] -= dst_offset[0];
        arrow.left[1] -= dst_offset[0];
        arrow.top[0] -= dst_offset[1];
        arrow.top[1] -= dst_offset[1];

        arrow_stroke
            .css('top', arrow.top[0])
            .css('left', arrow.left[0])
            .css('border-top-width', arrow.stroke_border[0])
            .css('border-right-width', arrow.stroke_border[1])
            .css('border-bottom-width', arrow.stroke_border[2])
            .css('border-left-width', arrow.stroke_border[3])
            .css('border-top-color', arrow.stroke_colors[0])
            .css('border-right-color', arrow.stroke_colors[1])
            .css('border-bottom-color', arrow.stroke_colors[2])
            .css('border-left-color', arrow.stroke_colors[3]);

        arrow_fill
            .css('top', arrow.top[1])
            .css('left', arrow.left[1])
            .css('border-top-width', arrow.fill_border[0])
            .css('border-right-width', arrow.fill_border[1])
            .css('border-bottom-width', arrow.fill_border[2])
            .css('border-left-width', arrow.fill_border[3])
            .css('border-top-color', arrow.fill_colors[0])
            .css('border-right-color', arrow.fill_colors[1])
            .css('border-bottom-color', arrow.fill_colors[2])
            .css('border-left-color', arrow.fill_colors[3]);


    });

};

