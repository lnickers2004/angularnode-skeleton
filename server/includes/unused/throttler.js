block	= function(ip) {
	blocklist[ip]	= (new Date()).getTime();
	time			= (new Date()).getMonth()+(new Date()).getYear();
	if ( !fs.existsSync(app.basedir+"/data/blocklist"+time+".json") )
		fs.writeFileSync(app.basedir+"/data/blocklist"+time+".json",JSON.stringify({},null,4));
	file 			= JSON.parse(fs.readFileSync(app.basedir+"/data/blocklist"+time+".json"));
	if ( !file.hasOwnProperty(ip) )
		file[ip]	= [];
	file[ip].push((new Date()).getTime());
	fs.writeFileSync(app.basedir+"/data/blocklist"+time+".json",JSON.stringify(file,null,4));
	(function(addr){
		setTimeout(function(){
			chalk	= require('chalk');
			console.log(chalk.green('Unblocking'));
			//console.log(blocklist);
			delete blocklist[addr];
		}, blockTimeout);
	})(ip);
}


blocklist	= {};
ips	= {};
blockTimeout= 1000*60*5; // 5 minutes
timeout		= 500;
maxTimeout	= 3000;
perMinute	= 500;
perMinuteMax= 5000;
app.all('*',function(req,res,next){
	ip = req.connection.remoteAddress.substr(0,"255.255.".length);
	if ( !ips.hasOwnProperty(ip) )
		ips[ip] = 1;
	ips[ip]++;
	if ( blocklist.hasOwnProperty(ip) )
		res.status(403).send("Blocked until "+(new Date(blockTimeout+blocklist[ip])).toLocaleString());
	else if ( ips[ip] > perMinuteMax ) {
		block(ip);
		res.status(403).send("Blocked");
	}
	else if ( ips[ip] > perMinute ) {
		//console.log("throttling: "+(timeout+(maxTimeout-timeout)*Math.log(Math.max(1,Math.min(Math.E,(Math.E-1)*ips[ip]/(perMinuteMax-perMinute)+1)))));
		setTimeout(function(){next()},timeout+(maxTimeout-timeout)*Math.log(Math.max(1,Math.min(Math.E,(Math.E-1)*ips[ip]/(perMinuteMax-perMinute)+1))));
	}
	else
		next();
});

setInterval(function(){
	for ( var i in ips ) {
		if ( ips[i] < perMinute )
			adder = 0;
		else if ( ips[i] >= perMinute && ips[i] < perMinute*2 )
			adder = 0.5*((perMinute*2)-ips[i]);
		else
			adder = 0.5*perMinute+0.5*(1-(-Math.pow(Math.min(1,(ips[i]-(perMinute*2))/(perMinuteMax-(perMinute*2))),2)+1));
		ips[i] -= perMinute+adder;
		ips[i] = Math.max(0,ips[i]);
		if ( ips[i] < perMinute*0.1 ) {
			delete ips[i];
		}
	}
},60000)