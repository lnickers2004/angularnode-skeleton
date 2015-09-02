app.all('/architect/reload',function(req,res,next){
	if ( !app.isLocalConnection(req) ) {
		next();
		return;
	}
    Robots.Callbacks  = {};
    Robots.OnetimeCallbacks   = {};
    Robots.PanelCallbacks  = {};
    Robots.numRegistered  = 0;
    //this.currentPanel   = -1;
    Robots.lastRegistration   = []; 

    var routes = app.routes.get;
	routes.forEach(removeMiddlewares);
    var routes = app.routes.post;
	routes.forEach(removeMiddlewares);
    var routes = app.routes.delete;
	routes.forEach(removeMiddlewares);
    var routes = app.routes.put;
	routes.forEach(removeMiddlewares);
	function removeMiddlewares(route, i, routes) {
	    if (route.path.substr(0,'/architect/'.length) == "/architect/" || route.path.substr(0,'/api/'.length) == "/api/" )
	        routes.splice(i, 1);
	    if (route.route)
	        route.route.stack.forEach(removeMiddlewares);
	}

    app.architect.load();

    var routes = app.routes.get;
	routes.forEach(prioritizeMiddlewares);
    var routes = app.routes.post;
	routes.forEach(prioritizeMiddlewares);
    var routes = app.routes.delete;
	routes.forEach(prioritizeMiddlewares);
    var routes = app.routes.put;
	routes.forEach(prioritizeMiddlewares);

	function prioritizeMiddlewares(route, i, routes) {
	    if (route.path.substr(0,'/architect/'.length) == "/architect/" || route.path.substr(0,'/api/'.length) == "/api/" ) {
	        routes.unshift(routes.splice(i, 1)[0]);
	    }
	    if (route.route)
	        route.route.stack.forEach(removeMiddlewares);
	}

    app.architect.loadScripts();
	res.send("Reloaded all API routes and Refreshed Scripts");
});