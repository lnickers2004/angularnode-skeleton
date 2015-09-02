module.exports	=(function(){
	dependencies	= [];
	spawn	= function(cmd) {
		try {
			if ( arguments.length > 1 && arguments[1] != undefined )
				args = arguments[1];
			else
				args = [];

			if ( arguments.length > 2 && arguments[2] != undefined )
				options = arguments[2];
			else
				options = {};
			
			dep = require('child_process').spawn(cmd, args, options)
			dependencies.push(dep);

			//console.log(dep.pid);
			return dep;
		}catch(e){
			console.log(chalk.yellow("Error spawning process: "+cmd));
		}
	} 
	exec	= function(cmd) {
		if ( arguments.length > 1 && arguments[1] != undefined )
			fn = arguments[1];
		else
			fn = function(){};
		
		dep = require('child_process').exec(cmd, fn)
		dependencies.push(dep);

		//console.log(dep.pid);
		return dep;
	}

	fork	= function(cmd) {
		if ( arguments.length > 1 && arguments[1] != undefined )
			args = arguments[1];
		else
			args = [];

		if ( arguments.length > 2 && arguments[2] != undefined )
			options = arguments[2];
		else
			options = {};
		
		dep = require('child_process').fork(cmd, args, options)
		dependencies.push(dep);
		return dep;
	}

	return dependencies;
})();