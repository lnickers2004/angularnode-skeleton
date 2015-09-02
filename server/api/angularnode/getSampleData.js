app.all('/api/getSampleData',function(req,res,next){
	fs	= require('fs');
	data	= JSON.parse(fs.readFileSync(__dirname+"/sample-data.json"),{'encoding':'UTF8'});
	res.send(JSON.stringify(data));
});