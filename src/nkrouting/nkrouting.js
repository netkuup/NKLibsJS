var nkrouting = new NK_routing();

function NK_routing() {
    this.routes = [];
}

NK_routing.prototype.set_routes = function( routes ) {
    nkrouting.routes[ routes.router_name ] = routes;

    if ( isset(routes.default_section) ) {
        $(document).ready(function(){
            nkrouting.go( routes.router_name, routes.default_section );
        });
    }
};


NK_routing.prototype.go = function( router_name, section ) {

    if ( !isset(nkrouting.routes[router_name]) ) {
        console.error( "Routes for", router_name, "not set.");
        return;
    }

    var ruta = nkrouting.routes[router_name].sections[section];

    if ( !isset(ruta) ) {
        console.error( "Routes for", router_name, "->", section, "not set.");
        return;
    }

    
    if ( isset(ruta.get) ) {
        nkrouting._perform_get( router_name, section );

    } else if ( isset(ruta.show) ) {
        nkrouting._perform_show( router_name, section );

    }

    
    

};


NK_routing.prototype._perform_show = function( router_name, section ) {

    var container = nkrouting.routes[router_name].container;
    var sections = nkrouting.routes[router_name].sections;

    if ( !isset(container) ) {
        for ( var auxSection in sections ) {
            $(sections[auxSection].show).hide();
        }

        $(sections[section].show).show();
    } else {
        
        if ( !isset(sections[section].content) ) {
            for ( var auxSection in sections ) {
                sections[auxSection].content = $(sections[auxSection].show).html();
                $(sections[auxSection].show).html("");
            }
        }

        nkrouting._replace_content( router_name, section );

    }

    nkrouting._run_controller( router_name, section );
    

};


NK_routing.prototype._perform_get = function( router_name, section ) {

    var sectionObj = nkrouting.routes[router_name].sections[section];

    if ( isset(sectionObj.loading) ) return;

    if ( !isset(sectionObj.content) ) {
        sectionObj.loading = true;

        $.ajax({
            url: sectionObj.get, 
            success: function ( result ) {
                sectionObj.content = result;
                nkrouting._replace_content( router_name, section );
                delete sectionObj.loading;
                nkrouting._run_controller( router_name, section );
            }
        });           
            
    } else {

        nkrouting._replace_content( router_name, section );
        nkrouting._run_controller( router_name, section );
    }

}



NK_routing.prototype._replace_content = function( router_name, section ) {

    var container = nkrouting.routes[router_name].container;
    var content = nkrouting.routes[router_name].sections[section].content;
    var controller = nkrouting.routes[router_name].sections[section].ctrl;

    $(container).html( content );

};


NK_routing.prototype._run_controller = function( router_name, section ) {
    var router = nkrouting.routes[router_name];
    var ruta = nkrouting.routes[router_name].sections[section];
    var controller_init = ruta.ctrl + ".init";
    var controller_enter = ruta.ctrl + ".enter";

    if ( isset(router.last_section) ) {
        var last_controller = nkrouting.routes[router_name].sections[router.last_section].ctrl;
        if ( isset(last_controller) ) {
            if ( eval('typeof ' + last_controller + ".leave") === 'function' ) {
                eval( last_controller + ".leave()" );
            }
        }
    }
    router.last_section = section;

    if ( !isset(ruta.ctrl) ) return;

    var first_time = !isset( ruta.loaded );
    ruta.loaded = true;

    if ( first_time ) {
        if ( eval('typeof ' + controller_init) === 'function' ) {
            eval( controller_init + "()" );
        }
    }

    if ( eval('typeof ' + controller_enter) === 'function' ) {
        eval( controller_enter + "()" );
    }
    
};




function isset( variable ) {
    return (typeof variable !== 'undefined');
}