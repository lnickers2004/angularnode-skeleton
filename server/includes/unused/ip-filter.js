var geoip		= require('geoip-lite');
var countries	= {};
var hosts		= {};

var checkCountry	= function(country) {
	if ( !countries.hasOwnProperty(country) )
		countries[country] = 1;
	countries[country]++;
	if ( countries[country] >= 1000 ) {
		countries[country] = 0;
		file = JSON.parse(fs.readFileSync(__dirname+"/../data/access-countries.json"));
		if ( !file.hasOwnProperty(country) )
			file[country] = 1;
		file[country] = parseInt(file[country])+1;
		fs.writeFileSync(__dirname+"/../data/access-countries.json", JSON.stringify(file,null,4));
	}
}

var checkHost	= function(host, country) {
	domestic	= (country=="US");
	if ( !hosts.hasOwnProperty(host) )
		hosts[host] = {"total": 0, "domestic": 0, "foreign": 0};
	hosts[host].total++;
	hosts[host].domestic+= (domestic)?1:0;
	hosts[host].foreign	+= (domestic)?0:1;
	if ( hosts[host].total >= 1000 ) {
		if ( hosts[host].foreign == 0 )
			ratio = 1;
		else
			ratio = parseFloat(hosts[host].domestic)/parseFloat(hosts[host].total);
		hosts[host] = {"total": 0, "domestic": 0, "foreign": 0};
		file = JSON.parse(fs.readFileSync(__dirname+"/../data/access-hosts.json"));
		if ( !file.hasOwnProperty(host) ) {
			file[host] = {};
			file[host].total = 1;
			file[host].ratio = ratio;
		}
		file[host].total++;
		file[host].ratio	= parseFloat(((file[host].total-1)*file[host].ratio)+1*ratio)/parseFloat(file[host].total);
		fs.writeFileSync(__dirname+"/../data/access-hosts.json", JSON.stringify(file,null,4));
	}
}
url  = require('url');
request  = require('request');
/*
app.all('*',function(req,res,next){
	parts	= url.parse(req.url);
	path	= parts.pathname;
	if ( parts.search != null )
		path	+= parts.search;
	r = request('http://localhost:3020/'+path);
	r.pipe(res);
	return;
});
*/
app.all('*',function(req,res,next){
	var ip	= req.connection.remoteAddress;
	if ( ip.substr(0,"::ffff:".length) == "::ffff:" )
		ip	= ip.substr("::ffff:".length);
	else {
		next();
		return;
	}
	if ( app.isLocalConnection(req) ) {
		next();
		return;
	}
	else if ( ip.substr(0,"192.168.".length) == "192.168." )
		next();
	else {
		var geo = geoip.lookup(ip);
		checkCountry(geo.country);
		var host= req.get('host');
		checkHost(host,geo.country);
		if ( geo.country != "US" ) {
			parts	= url.parse(req.url);
			path	= parts.pathname;
			if ( parts.search != null )
				path	+= parts.search;
			r = request('http://localhost:3020/'+path);
			try {
				r.pipe(res);
			} catch(e) {console.log("PIPE ERROR",e)}
		}
		else
			next();
	}
});
