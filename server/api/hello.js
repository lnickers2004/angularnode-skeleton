app.all('/architect/hello',function(req,res,next){
	Robots.relay('hello','hi');
	res.status(200).send("");
});