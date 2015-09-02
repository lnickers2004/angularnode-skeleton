/**
 * Shutdown
 */

var readLine = require("readline");
if (process.platform === "win32"){
    var rl = readLine.createInterface ({
        input: process.stdin,
        output: process.stdout
    });

    rl.on ("SIGINT", function (){
    	// updated 2/2/15
    	process.emit("SIGINT");
    });
}

chalk	= require('chalk');
app.set('shutdown',false);
var shutdown 	= function() {
	request	= require('request');
	if ( app.get('shutdown') )
		return;
	app.set('shutdown',true);
	console.log(chalk.red("Ambassador Shutting Down"));
	setTimeout(function(){
		for ( var i in dependencies) {
			console.log("Shutting down "+dependencies[i].pid);
			if (process.platform === "win32")
				(function(p){
					setTimeout(function(){
						p.kill('SIGTERM');
					},50)
				})(spawn(app.basedir+'/dependencies/process.exe',[dependencies[i].pid]))
			dependencies[i].kill('SIGTERM');
		}

		setTimeout(function() {
		   process.exit();
		}, 1000);
	},0);
}


// listen for TERM signal .e.g. kill 
process.on('SIGTERM', shutdown);
// listen for INT signal e.g. Ctrl-C
process.on('SIGINT', shutdown);   