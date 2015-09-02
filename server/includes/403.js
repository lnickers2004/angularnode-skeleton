restricted	= JSON.parse(fs.readFileSync(app.basedir+'/configs/403.json'));
for ( var i in restricted ) {
	(function(path){
		app.all(path,function(req,res,next){
			res.status(403).send("Forbidden");
		});
	})(restricted[i]);
}