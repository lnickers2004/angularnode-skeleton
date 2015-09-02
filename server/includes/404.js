app.all('*',function(req,res,next){
	if ( fs.existsSync(app.get('documentroot')+req.originalUrl) ) {
		next();
		return;
	}

	res.status(404).send("Not found!");
});