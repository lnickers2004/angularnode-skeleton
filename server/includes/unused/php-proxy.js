// all PHP files goto Lighty
app.all('*.php', function(req,res,next) {
	try {
		if ( app.isLocalConnection(req) )
			addr	= "127.0.0.1";
		else
			addr	= req.connection.remoteAddress;
		headers	= {"REMOTE_ADDR": addr, 'x-forwarded-for': addr}
		//for (var i in req.body)
		//	headers[i]	= req.body[i];
		
		proxy.web(req,res, {
			"target": "http://127.0.0.1:"+app.get('httpd-port'),
			"headers": headers
		});
	} catch(e){
		
	}	
});

// this is our "index" route
index	= function(req,res,next){
	if ( req.originalUrl.substr(0,"/architect".length) == "/architect" ) {
		next();
		return;
	}
	try {
		if ( app.isLocalConnection(req) )
			addr	= "127.0.0.1";
		else
			addr	= req.connection.remoteAddress;
		headers	= {"REMOTE_ADDR": addr, 'x-forwarded-for': addr};
		proxy.web(req,res, {
			"target": "http://127.0.0.1:"+app.get('httpd-port'),
			"headers": headers
		});
	} catch(e){

	}	
}
module.exports = index;
app.all('/', index);
app.all('*/', index);
proxy	= httpProxy.createProxyServer();
proxy.on('error', function (err,req, res) {
	console.log("==================");
	console.log("proxy error has occurred in proxy.js");
	console.log("------------------");
	console.log(req.originalUrl);
	console.log(JSON.stringify(err));
	console.log("("+(new Date()).getTime()+")"+err);
	console.log("==================");
    res.status(500).send(req.originalUrl+" failed: "+err);
});