app.all('*.php',function(req,res,next){
	if ( req.connection.encrypted ) {
		var options = {
		  hostname: '127.0.0.1',
		  port: app.get('httpd-ssl-port'),
		  rejectUnauthorized: false,
		  key: fs.readFileSync(app.basedir+"/ssl/ssl.key.pem"),
		  cert: fs.readFileSync(app.basedir+"/ssl/ssl.crt.pem")
		};
		agent = new https.Agent(options);
		try {
			if ( app.isLocalConnection() )
				addr	= "127.0.0.1";
			else
				addr	= req.connection.remoteAddress;
			headers	= {"REMOTE_ADDR": addr, 'x-forwarded-for': addr}
			p.web(req,res, {
				target: "https://localhost:"+app.get('httpd-ssl-port'),
	  			agent: agent,
	  			"headers": headers
			});
		} catch(e) {
		}
	}
	else
		next();
})
index	= function(req,res,next){
	if ( req.connection.encrypted ) {
		var options = {
		  hostname: '127.0.0.1',
		  port: app.get('httpd-ssl-port'),
		  rejectUnauthorized: false,
		  key: fs.readFileSync(app.basedir+"/ssl/ssl.key.pem"),
		  cert: fs.readFileSync(app.basedir+"/ssl/ssl.crt.pem")
		};

		agent = new https.Agent(options);
		try {
			if ( req.connection.remoteAddress == "::1" )
				addr	= "127.0.0.1";
			else
				addr	= req.connection.remoteAddress;
			headers	= {"REMOTE_ADDR": addr, 'x-forwarded-for': addr}
			httpsProxy.web(req,res, {
				target: "https://localhost:"+app.get('httpd-ssl-port'),
	  			agent: agent,
	  			"headers": headers
			});
		} catch(e) {
		}
	}
	else
		next();
}
module.exports = index;
app.all('/', index);
app.all('*/', index);
httpsProxy	= httpProxy.createProxyServer();
httpsProxy.on('error', function (err,req, res) {
	console.log("==================");
	console.log("proxy error has occurred");
	console.log("------------------");
	console.log(req.originalUrl);
	console.log(JSON.stringify(err));
	console.log("("+(new Date()).getTime()+")"+err);
	console.log("==================");
    res.status(500).send(req.originalUrl+" failed: "+err);
});