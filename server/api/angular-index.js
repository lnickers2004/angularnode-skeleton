compile				= require(app.basedir+'/includes/angularnode/compile.js').compile;
compileModules		= require(app.basedir+'/includes/angularnode/compile.js').compileModules;
compileTemplates	= require(app.basedir+'/includes/angularnode/compile.js').compileTemplates;
compileDirectives	= require(app.basedir+'/includes/angularnode/compile.js').compileDirectives;

var auth	= require(app.basedir+'/includes/angularnode/auth.js').auth;
var output	= require(app.basedir+'/includes/angularnode/output.js').output;

app.set('views', app.basedir); // only 1 view!
app.set('view engine', 'jade');
app.set('env', 'development');

//app.use(compile);

cookieParser	= require('cookie-parser');
app.use(cookieParser());
//bodyParser	= require('body-parser');
//app.use(bodyParser());
app.use(function(req,res,next) {
  module.exports.output	= output(req,res);
  return next();	
});

// are we looking for a jade file?  render it.
app.get('*.jade', function(req,res,next) {
	jade.renderFile("./"+req.path, {}, function(err,html) {
		res.send(html);
	});
});

// usually if we are accessing the modules folder
// or the directives folder we want to do a compile step
app.all('/modules/', function(req,res,next){
	compileModules(req,res);
});
app.all('/templates/', function(req,res,next){
	compileTemplates(req,res);
});
app.all('/directives/', function(req,res,next){
	compileDirectives(req,res);
});


// this is our "index" route
app.all('/', function(req,res,next) {
	page	= req.cookies.page;
	if ( req.cookies.page == undefined ) {
		res.cookie('page','hello');
		page	= 'hello';
	}

	query	= getHTTPQuery(req);
	if ( query.page != undefined ) {
		page	= query.page;
	}
	// return HTTP query regardless of the type (POST or GET)
	getHTTPQuery	= function(req) {
		// HACK: this allows us to read HTTP request key/val pairs across GET/POST
		query = require('url').parse(req.url,true).query;
		if ( query.q == undefined )
			query = req.body;
		if ( typeof query == "undefined" || typeof query.q == "undefined" )
			return {};
		query = JSON.parse(query.q);

		return query;
	}

	module.exports.output.setResponsePage(page);
	module.exports.output.render(res);
});