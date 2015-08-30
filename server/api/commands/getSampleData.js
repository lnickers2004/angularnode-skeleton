exports.cmd	= {
	"httpMethod": "get",
	"defaultOptions": {

	},
	"fn": function() {
		fs	= require('fs');
		data	= JSON.parse(fs.readFileSync(__dirname+"/sample-data.json"),{'encoding':'UTF8'});
		return JSON.stringify(data);
	}
}