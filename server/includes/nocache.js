nocache	= JSON.parse(fs.readFileSync(app.basedir+'/configs/nocache.json'));
for ( var i in nocache ) {
	(function(path){
		app.all(path,function(req,res,next){
			arr	= path.split('*');
			file	= "";
			for ( var i in arr ) {
				file+=arr[i]+req.params[i];
			}
			stats	= fs.statSync(app.get('documentroot')+"/"+file);
			res.header('Cache-Control', 'no-store, no-cache, must-revalidate');
			res.header('Pragma', 'no-cache');
			res.header('last-modified', stats.mtime); // used by ambassador.js
			res.status(200).send(fs.readFileSync(app.get('documentroot')+"/"+file, "utf8"));
		});
	})(nocache[i]);
}