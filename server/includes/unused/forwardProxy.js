checkProxies	= function(){
	fs	= require('fs');
	proxies	= JSON.parse(fs.readFileSync(app.basedir+"/configs/proxies.json",'UTF-8'));
	if ( proxies.length == 0 )
		return;
	p	= proxies.pop();
	fn	= function(p){
		var p;
		request	= require('request');
		request(p,function(e,b,r){
			if ( !e ) {
				app.set('proxy',p);
			}
			else if ( proxies.length > 0 )
				fn(proxies.pop());
		})
	}
	fn(p);
}
checkProxies();
setInterval(checkProxies,60*1000*5);

app.all('*', function(req,res,next) {
	if ( typeof app.get('proxy') == "undefined" ) 
		next();
	try {
		if ( app.isLocalConnection() )
			addr	= "127.0.0.1";
		else
			addr	= req.connection.remoteAddress;
		headers	= {"REMOTE_ADDR": addr, 'x-forwarded-for': addr}
		//for (var i in req.body)
		//	headers[i]	= req.body[i];
		
		proxy.web(req,res, {
			"target": app.get('proxy'),
			"headers": headers
		});
	} catch(e){
		
	}	
});
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