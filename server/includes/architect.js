// List all files in a directory in Node.js recursively in a synchronous fashion

module.exports	= (function(){
	architect	= {};
	Module	= require('module');
	architect.load	= function(){
		var walkSync = function(dir, filelist) {
			var fs = fs || require('fs'),
			files = fs.readdirSync(dir);
			filelist = filelist || [];
			files.forEach(function(file) {
				if (fs.statSync(dir + '/' +file).isDirectory())
					filelist = walkSync(dir + '/' + file + '/', filelist);
				else
					filelist.push(dir+'/'+file);
			});
			return filelist;
		}; 
		var cwd	= process.cwd();
		process.chdir(path.resolve(app.basedir+"/api/"));
		files	= walkSync(process.cwd());
		process.chdir(cwd);
		// include all architect
		for( var i in files ) {
			if ( files[i].substr(-3) == ".js") {
				//contents	= fs.readFileSync(path.resolve(files[i]),'utf8');
				name	= require.resolve(files[i]);
				delete require.cache[name];
				require(files[i]);
			}
		}
		process.chdir(cwd);

		return files;
	}

	architect.loadScripts	= function(){
		var walkSync = function(dir, filelist) {
			var fs = fs || require('fs'),
			files = fs.readdirSync(dir);
			filelist = filelist || [];
			files.forEach(function(file) {
				if (fs.statSync(dir + '/' +file).isDirectory())
					filelist = walkSync(dir + '/' + file + '/', filelist);
				else
					filelist.push(dir+'/'+file);
			});
			return filelist;
		}; 
		var cwd	= process.cwd();
		process.chdir(path.resolve(app.basedir+"/signals/"));
		files	= walkSync(process.cwd());
		// include all architect
		for( var i in files ) {
			if ( files[i].substr(-3) == ".js") {
				signal	= files[i].split('/')[files[i].split('/').length-1];
				signal	= signal.substr(0,signal.length-".js".length);
				fn	= require(files[i]);
				Robots.register(signal,fn);
			}
		}
		process.chdir(cwd);

		return files;
	}

	architect.load();
	architect.loadScripts();
	return architect;
})();