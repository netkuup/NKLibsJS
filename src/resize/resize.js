var NKResize = {};

if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before context_menu.js";
}

var event_listener = new NKEventListener();
NKResize = { ...event_listener };

NKResize.config = {
    column_resize_cursor: 'col-resize',
    row_resize_cursor: 'row-resize'
};



NKResize.start = function( reactable ) {
    if ( NK.isset(NKResize.loaded) && NKResize.loaded === true ) return;
    NKResize.loaded = true;

    if ( typeof NKPosition === 'undefined' ) {
        throw "You must include position.js";
    }
    NKPosition.start();

    window.addEventListener('load', NKResize.reload );
    if ( window.loaded === true ) NKResize.reload();

    if ( reactable === true ) {
        NK.core.reloadOnDomChange( NKResize );
    }

};

NKResize.reload = function() {
    var self = this;
    $('.NKDrag_colums').off();
    $('.NKDrag_rows').off();
    $('.NKDrag_colums').children('div').off();
    $('.NKDrag_rows').children('div').off();

    $( ".NKDrag_colums" ).each(function( i ) {
        var sizes = [];

        $(this).children('div').each(function ( j ) {
            $(this).attr('nk-i', j);
            $(this).css( 'overflow', 'hidden' );
            var size = $(this).attr('nk-width');
            size = NK.empty(size) ? "auto" : size;
            sizes.push( size );
        });

        $(this).css( 'display', 'grid' );
        $(this).css( 'grid-template-columns', sizes.join(" ") );
        $(this).css( 'overflow', 'hidden' );
    });

    $( ".NKDrag_rows" ).each(function( i ) {
        var sizes = [];

        $(this).children('div').each(function ( j ) {
            $(this).attr('nk-i', j);
            $(this).css( 'overflow', 'hidden' );
            var size = $(this).attr('nk-height');
            size = NK.empty(size) ? "auto" : size;
            sizes.push( size );
        });

        $(this).css( 'display', 'grid' );
        $(this).css( 'grid-template-rows', sizes.join(" ") );
        $(this).css( 'overflow', 'hidden' );
    });

    NKResize.resizing_vertical_element = null;
    NKResize.resizing_horizontal_element = null;

    function calculateSizes( parent, child, new_width, columns ) {
        var curr_colums = [];
        var new_columns = [];
        var col_i = parseFloat(child.attr('nk-i'));

        if ( columns ) {
            curr_colums = parent.css('grid-template-columns').split(" ");
        } else {
            curr_colums = parent.css('grid-template-rows').split(" ");
        }

        if ( col_i === curr_colums.length-1 ) return curr_colums.join(" ");

        for ( var i = 0; i < curr_colums.length; i++ ) {
            if ( i === col_i ) {
                new_columns.push( new_width + "px" );

            } else if ( i === col_i + 1 ) {
                new_columns.push("auto");

            } else {
                new_columns.push( curr_colums[i] );

            }
        }

        return new_columns;
    }


    function onMouse( e ) {
        var column_pos = [$(this).offset().left, $(this).offset().top];
        var mouse_pos = NKPosition.getMouse();
        var diff_pos = [mouse_pos[0]-column_pos[0], mouse_pos[1]-column_pos[1]];
        var div_size = [$(this).width(), $(this).height()];
        var in_vertical_border = (diff_pos[0] >= (div_size[0]-5));
        var in_horizontal_border = (diff_pos[1] >= (div_size[1]-5));
        var is_last_child = $(this).is(':last-child');
        var action = e.type;


        if ( action === 'mousedown' ) {
            if ( in_vertical_border && !is_last_child ) {
                NKResize.resizing_vertical_element = this;
                NKResize.start_columns = $(this).parent().css('grid-template-columns').split(" ");
                NKResize.start_pos = mouse_pos;
                NKResize.start_size = div_size;
            }
            if ( in_horizontal_border && !is_last_child ) {
                NKResize.resizing_horizontal_element = this;
                NKResize.start_rows = $(this).parent().css('grid-template-rows').split(" ");
                NKResize.start_pos = mouse_pos;
                NKResize.start_size = div_size;
            }

            // Disable iframe interactions while dragging
            $("iframe").addClass( "NKResize_disable_temp" );

        } else if ( action === 'mousemove' ) {
            var r_v_e = NKResize.resizing_vertical_element;
            var r_h_e = NKResize.resizing_horizontal_element;

            if ( r_v_e !== null ) {
                var parent = $(r_v_e).parent();
                var border_right = parseInt($(r_v_e).css("border-right-width").slice(0, -2));
                var new_width = NKResize.start_size[0] + (mouse_pos[0] - NKResize.start_pos[0]) + border_right;
                var new_sizes = calculateSizes(parent, $(r_v_e), new_width, true);

                parent.css('grid-template-columns', new_sizes.join(" "));
                parent.children('div').each(function ( i ) {
                    $(this).attr('nk-width', new_sizes[i]);
                });


                $(this).css('cursor', NKResize.config.column_resize_cursor);

            } else if ( r_h_e !== null ) {
                var parent = $(r_h_e).parent();
                var border_bottom = parseInt($(r_h_e).css("border-bottom-width").slice(0, -2));
                var new_height = NKResize.start_size[1] + (mouse_pos[1] - NKResize.start_pos[1]) + border_bottom;
                var new_sizes = calculateSizes(parent, $(r_h_e), new_height, false);

                parent.css('grid-template-rows', new_sizes.join(" "));
                parent.children('div').each(function ( i ) {
                    $(this).attr('nk-height', new_sizes[i]);
                });

                $(this).css('cursor', NKResize.config.row_resize_cursor);

            } else {
                if ( in_vertical_border && !is_last_child ) {
                    $(this).css('cursor', NKResize.config.column_resize_cursor);

                } else  if ( in_horizontal_border && !is_last_child ) {
                    $(this).css('cursor', NKResize.config.row_resize_cursor);

                } else {
                    $(this).css('cursor', '');

                }

            }

        } else if ( action === 'mouseup' ) {
            var r_v_e = NKResize.resizing_vertical_element;
            var r_h_e = NKResize.resizing_horizontal_element;

            if ( r_v_e !== null ) {
                var sizes = $(r_v_e).parent().css('grid-template-columns').split(" ");
                var col_i = parseFloat($(r_v_e).attr('nk-i'));
                NKResize.dispatchEvent('onResize', {
                    start: NKResize.start_columns,
                    end: sizes,
                    i: col_i,
                    e: $(r_v_e)[0],
                    parent: $(r_v_e).parent()[0]
                });
            }
            if ( r_h_e !== null ) {
                var sizes = $(r_h_e).parent().css('grid-template-rows').split(" ");
                var col_i = parseFloat($(r_h_e).attr('nk-i'));
                NKResize.dispatchEvent('onResize', {
                    start: NKResize.start_rows,
                    end: sizes,
                    i: col_i,
                    e: $(r_h_e)[0],
                    parent: $(r_h_e).parent()[0]
                });
            }

            NKResize.resizing_vertical_element = null;
            NKResize.resizing_horizontal_element = null;
            $(this).css('cursor', '');
            $("iframe").removeClass( "NKResize_disable_temp" );
        }

       // console.log("diff_pos", diff_pos);
       // console.log("div_size", div_size);
    }

    $('.NKDrag_colums').on('mouseleave', function (){
        NKResize.resizing_vertical_element = null;
        $(this).css('cursor', '');
    });
    $('.NKDrag_rows').on('mouseleave', function (){
        NKResize.resizing_horizontal_element = null;
        $(this).css('cursor', '');
    });

    $('.NKDrag_colums').children('div')
        .on('mousemove', onMouse)
        .on('mousedown', onMouse)
        .on('mouseup', onMouse);
    $('.NKDrag_rows').children('div')
        .on('mousemove', onMouse)
        .on('mousedown', onMouse)
        .on('mouseup', onMouse);
};


