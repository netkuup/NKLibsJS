let NKResize = {};

if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before context_menu.js";
}

let nkresize_event_listener = new NKEventListener();
NKResize = { ...nkresize_event_listener };

NKResize.config = {
    column_resize_cursor: 'col-resize',
    row_resize_cursor: 'row-resize'
};



NKResize.start = function( reactable ) {
    if ( NKResize.loaded === true ) return;
    NKResize.loaded = true;

    if ( typeof NKDom === 'undefined' ) {
        throw "You must include NKDom.js";
    }
    if ( typeof NKPosition === 'undefined' ) {
        throw "You must include NKPosition.js";
    }
    NKPosition.start();

    window.addEventListener('load', NKResize.reload );
    if ( window.loaded === true ) NKResize.reload();

    if ( reactable === true ) {
        NK.core.reloadOnDomChange( NKResize );
    }

};

NKResize.reload = function() {

    let cols = NKDom.select(".NKResize_columns");
    let rows = NKDom.select(".NKResize_rows");

    cols.forEach(function( col, i ) {
        let sizes = [];

        let children = NKDom.getChildren(col, 'div');

        children.forEach(function ( child, j ) {
            NKDom.setAttribute( child, 'nk-i', j );
            NKDom.setCss( child, 'overflow', 'hidden' );

            let size = NKDom.getAttribute( child, 'nk-width' );
            size = NK.empty(size) ? "auto" : size;
            sizes.push( size );
        });

        NKDom.setCss( col, 'display', 'grid' );
        NKDom.setCss( col, 'grid-template-columns', sizes.join(" ") );
        NKDom.setCss( col, 'overflow', 'hidden' );
    });

    rows.forEach(function( row, i ) {
        let sizes = [];

        let children = NKDom.getChildren(row, 'div');

        children.forEach(function ( child, j ) {
            NKDom.setAttribute( child, 'nk-i', j );
            NKDom.setCss( child, 'overflow', 'hidden' );

            let size = NKDom.getAttribute( child, 'nk-height' );
            size = NK.empty(size) ? "auto" : size;
            sizes.push( size );
        });

        NKDom.setCss( row, 'display', 'grid' );
        NKDom.setCss( row, 'grid-template-rows', sizes.join(" ") );
        NKDom.setCss( row, 'overflow', 'hidden' );
    });

    NKResize.resizing_vertical_element = null;
    NKResize.resizing_horizontal_element = null;

    function calculateSizes( parent, child, new_width, columns ) {
        let curr_colums = [];
        let new_columns = [];
        let col_i = parseInt( NKDom.getAttribute(child, 'nk-i') );

        if ( columns ) {
            curr_colums = NKDom.getCss(parent, 'grid-template-columns').split(" ");
        } else {
            curr_colums = NKDom.getCss(parent, 'grid-template-rows').split(" ");
        }

        if ( col_i === curr_colums.length-1 ) return curr_colums.join(" ");

        for ( let i = 0; i < curr_colums.length; i++ ) {
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
        let column_pos = [this.offsetLeft, this.offsetTop];
        let mouse_pos = NKPosition.getMouse();
        let diff_pos = [mouse_pos[0]-column_pos[0], mouse_pos[1]-column_pos[1]];
        //let div_size = [this.offsetWidth, this.offsetHeight];
        let div_size = [this.clientWidth, this.clientHeight];
        let in_vertical_border = (diff_pos[0] >= (div_size[0]-5));
        let in_horizontal_border = (diff_pos[1] >= (div_size[1]-5));
        let is_last_child = (this === this.parentNode.lastElementChild);
        let action = e.type;

        if ( action === 'mousedown' ) {
            if ( in_vertical_border && !is_last_child ) {
                NKResize.resizing_vertical_element = this;
                NKResize.start_columns = NKDom.getCss( this.parentNode, 'grid-template-columns' ).split(" ");
                NKResize.start_pos = mouse_pos;
                NKResize.start_size = div_size;
                NKDom.addClass( NKDom.getChildren(NKDom.getChildren('.NKResize_columns', 'div')), "NKResize_disable_temp" );
            }
            if ( in_horizontal_border && !is_last_child ) {
                NKResize.resizing_horizontal_element = this;
                NKResize.start_rows = NKDom.getCss( this.parentNode, 'grid-template-rows' ).split(" ");
                NKResize.start_pos = mouse_pos;
                NKResize.start_size = div_size;
                NKDom.addClass( NKDom.getChildren(NKDom.getChildren('.NKResize_rows', 'div')), "NKResize_disable_temp" );
            }


        } else if ( action === 'mousemove' ) {
            let r_v_e = NKResize.resizing_vertical_element;
            let r_h_e = NKResize.resizing_horizontal_element;

            if ( r_v_e !== null ) {
                let parent = r_v_e.parentNode;
                let border_right = parseInt( NKDom.getCss(r_v_e, "border-right-width") );
                let new_width = NKResize.start_size[0] + (mouse_pos[0] - NKResize.start_pos[0]) + border_right;
                let new_sizes = calculateSizes(parent, r_v_e, new_width, true);

                NKDom.setCss( parent, 'grid-template-columns', new_sizes.join(" ") );

                NKDom.getChildren(parent, 'div').forEach(function (child, i) {
                    NKDom.setAttribute( child, 'nk-width', new_sizes[i] );
                });

                NKDom.setCss( this, 'cursor', NKResize.config.column_resize_cursor );

            } else if ( r_h_e !== null ) {
                let parent = r_h_e.parentNode;
                let border_bottom = parseInt( NKDom.getCss(r_h_e, "border-bottom-width") );
                let new_height = NKResize.start_size[1] + (mouse_pos[1] - NKResize.start_pos[1]) + border_bottom;
                let new_sizes = calculateSizes(parent, r_h_e, new_height, false);

                NKDom.setCss( parent, 'grid-template-rows', new_sizes.join(" ") );

                NKDom.getChildren(parent, 'div').forEach(function (child, i) {
                    NKDom.setAttribute( child, 'nk-height', new_sizes[i] );
                });

                NKDom.setCss( this, 'cursor', NKResize.config.row_resize_cursor );

            } else {
                if ( in_vertical_border && !is_last_child && NKDom.hasClass( this.parentNode, 'NKResize_columns' ) ) {
                    NKDom.setCss( this, 'cursor', NKResize.config.column_resize_cursor );

                } else  if ( in_horizontal_border && !is_last_child && NKDom.hasClass( this.parentNode, 'NKResize_rows' ) ) {
                    NKDom.setCss( this, 'cursor', NKResize.config.row_resize_cursor );

                } else {
                    NKDom.setCss( this, 'cursor', '' );

                }

            }

        } else if ( action === 'mouseup' ) {
            let r_v_e = NKResize.resizing_vertical_element;
            let r_h_e = NKResize.resizing_horizontal_element;

            if ( r_v_e !== null ) {
                let sizes = NKDom.getCss( r_v_e.parentNode, 'grid-template-columns' ).split(" ");
                let col_i = parseInt( NKDom.getAttribute(r_v_e, 'nk-i') );
                NKResize.dispatchEvent('onResize', {
                    start: NKResize.start_columns,
                    end: sizes,
                    i: col_i,
                    e: r_v_e,
                    parent: r_v_e.parentNode
                });
                NKDom.removeClass( NKDom.getChildren(NKDom.getChildren('.NKResize_columns', 'div')), "NKResize_disable_temp" );
            }
            if ( r_h_e !== null ) {
                let sizes = NKDom.getCss( r_h_e.parentNode, 'grid-template-rows' ).split(" ");
                let col_i = parseInt( NKDom.getAttribute(r_h_e, 'nk-i') );
                NKResize.dispatchEvent('onResize', {
                    start: NKResize.start_rows,
                    end: sizes,
                    i: col_i,
                    e: r_h_e,
                    parent: r_h_e.parentNode
                });
                NKDom.removeClass( NKDom.getChildren(NKDom.getChildren('.NKResize_rows', 'div')), "NKResize_disable_temp" );
            }

            NKResize.resizing_vertical_element = null;
            NKResize.resizing_horizontal_element = null;
            NKDom.setCss( this, 'cursor', '' );

        }

    }


    function onMouseLeaveColumns() {
        NKResize.resizing_vertical_element = null;
        NKDom.setCss( this, 'cursor', '' );
    }
    function onMouseLeaveRows() {
        NKResize.resizing_horizontal_element = null;
        NKDom.setCss( this, 'cursor', '' );
    }

    NKDom.addEventListener('.NKResize_columns', 'mouseleave', onMouseLeaveColumns);
    NKDom.addEventListener('.NKResize_rows', 'mouseleave', onMouseLeaveRows);

    NKDom.addEventListener(NKDom.getChildren( '.NKResize_columns', 'div' ), 'mousemove', onMouse);
    NKDom.addEventListener(NKDom.getChildren( '.NKResize_columns', 'div' ), 'mousedown', onMouse);
    NKDom.addEventListener(NKDom.getChildren( '.NKResize_columns', 'div' ), 'mouseup', onMouse);

    NKDom.addEventListener(NKDom.getChildren( '.NKResize_rows', 'div' ), 'mousemove', onMouse);
    NKDom.addEventListener(NKDom.getChildren( '.NKResize_rows', 'div' ), 'mousedown', onMouse);
    NKDom.addEventListener(NKDom.getChildren( '.NKResize_rows', 'div' ), 'mouseup', onMouse);
};


