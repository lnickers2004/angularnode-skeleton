/**
 * Module dependencies
 */

// basic includes
express 	= require('express');
fs		 	= require('fs-extra');
http	   	= require('http');
https   	= require('https');
httpProxy   = require('http-proxy');
url			= require('url');
path    	= require('path');
chalk		= require('chalk'); // pretty console
jade   		= require('jade');


var app		= module.exports.app = express();
app.basedir	= __dirname;
settings	= JSON.parse(fs.readFileSync(app.basedir+'/settings.json'));
if ( settings.hasOwnProperty('basedir') )
	app.basedir	= __dirname+"/"+settings.basedir;
// handles ipv4 and ipv6
app.isLocalConnection	= function(req){
 	return (req.connection.remoteAddress == "127.0.0.1" || req.connection.remoteAddress.substr(-"127.0.0.1".length) == "127.0.0.1" || req.connection.remoteAddress == "::1"  || req.connection.remoteAddress == "::ffff:127.0.0.1");
}

/**
 * Processes
 */
require(app.basedir+'\\includes\\modules.js');
require(app.basedir+'/includes/dependencies.js');
require(app.basedir+'/includes/shutdown.js');
var robots = Robots = require(app.basedir+'/includes/robots.js');

/**
 * Configuration
 */

app.set('settings',settings);
app.set('port', process.env.PORT || settings.port || 3000); // we sometimes change the port
app.set('ssl-port', settings['ssl-port'] || 3001);
app.set('server-name','development');
app.set('documentroot',app.basedir+"\\www\\");
if ( settings.hasOwnProperty('documentroot') )
	app.set('documentroot',app.basedir+"\\"+settings.documentroot+"\\");

console.log(app.get('documentroot'));
/**
 * Dependencies
 */
for ( var i in settings.dependencies ) {
	dep	= settings.dependencies[i];
	if ( dep.hasOwnProperty('disabled') && dep.disabled ) 
		continue;
	method	= "spawn";
	if ( !dep.hasOwnProperty('method') )
		method	= dep.method;
	switch( method ) {
		case "spawn": 
			spawn(dep.path,dep.arguments);
		break;
		case "exec":
			// should combine path and arguments to a single string
		break;
	}
}

/**
 * proxies
 */
//require(app.basedir+'\\includes\\forwardProxy.js');

/**
 * Query Population & Authorization
 */
app.architect	= require(app.basedir+'\\includes\\architect.js');

/**
 * Middleware
 */
//if ( app.get('settings').useThrottling )
//	require(app.basedir+'\\includes\\throttler.js');
require(app.basedir+'\\includes\\nocache.js');
require(app.basedir+'\\includes\\403.js');
//require(app.basedir+'\\includes\\ip-filter.js');
//var routes			= require(app.basedir+'\\includes\\routes.js');
//var httpsProxy		= require(app.basedir+'\\includes\\php-https-proxy.js');
//var proxy			= require(app.basedir+'\\includes\\php-proxy.js'); // used for PHPv
require(app.basedir+'\\includes\\404.js');
app.all('*',express.static(app.get('documentroot')));
require(app.basedir+'\\includes\\500.js'); // don't know what to do, eek!

/**	
 * Start Server
 */
 
server	= module.exports.server	= http.createServer(app.handle.bind(app)).listen(app.get('port'), function () {
  console.log('Listening on port ' + chalk.green(app.get('port')));
});

var options = {
  key: fs.readFileSync(app.basedir+"/ssl/ssl.key.pem"),
  cert: fs.readFileSync(app.basedir+"/ssl/ssl.crt.pem")
};
secureServer	= https.createServer(options,app.handle.bind(app)).listen(app.get('ssl-port'), function () {
  console.log('Running HTTPS server on port ' + chalk.green(app.get('ssl-port')));
});
console.log(chalk.cyan("Welcome to Ambassador"));
