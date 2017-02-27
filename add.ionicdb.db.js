var Q = require('q');

var vm = {
	db: null
};

var Config = {
	logs: {
		debug: true
	}
}

function Database(ref) {
	vm.db = ref;
}

function parsePath(path) {
	var ret = {
		collection: null,
		id: null
	};

	var parts = path.split('/');

	ret.collection = parts[0];
	ret.id = parts[1];

	return ret;
}


Database.prototype.push = function(path, data) {
	if(Config.logs.debug) console.log('Attempting push with Ionic DB');
	if(Config.logs.debug) console.log(path);
	if(Config.logs.debug) console.log(data);

	return Q.promise(function(resolve, reject) {
		if(vm.db !== null) {
			vm.db.collection(path).store(data).subscribe(function() {
				if(Config.logs.debug) console.log('Pushed data!');
				resolve();
			}, function(error) {
				reject(error);
			})
		}else{
			reject('Null DB');
		}
	});
};

Database.prototype.set = function(path, data) {
	if(Config.logs.debug) console.log('Attempting set with Ionic DB');
	if(Config.logs.debug) console.log(path);
	if(Config.logs.debug) console.log(data);

	return Q.promise(function(resolve, reject) {
		if(vm.db !== null) {
			var parsedPath = parsePath(path);

			console.log('Parsed path');
			console.log(parsedPath);

			if(parsedPath.collection !== null && parsedPath.id !== null) {

				if(data.id === undefined) {
					data.id = parsedPath.id;
				}

				vm.db.collection(parsedPath.collection).store(data).subscribe(function() {
					if(Config.logs.debug) console.log('Pushed data!');
					resolve();
				}, function(error) {
					reject(error);
				})
			}else{
				reject('Faulty path');
			}
		}else{
			reject('Null DB');
		}
	});
};

Database.prototype.delete = function(path) {
	if(Config.logs.debug) console.log('Attempting delete with Ionic DB');
	if(Config.logs.debug) console.log(path);

	return Q.promise(function(resolve, reject) {
		// Todo: This should become smarter to match the database name in the path for multi-database denormalizing
		if(vm.db !== null) {
			var parsedPath = parsePath(path);

			if(parsedPath.collection !== null && parsedPath.id !== null) {
				var ref = vm.db.collection(parsedPath.collection);

				ref.remove(parsedPath.id).subscribe(function() {
					if(Config.logs.debug) console.log('Removed data!');
					resolve();
				}, function(error) {
					reject(error);
				});
			}else{
				reject('Bad path');
			}
		}else{
			reject('Null DB');
		}
	});
};

module.exports = Database;