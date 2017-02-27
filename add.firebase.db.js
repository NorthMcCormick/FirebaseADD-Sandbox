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

Database.prototype.push = function(path, data) {
	if(Config.logs.debug) console.log('Attempting push');
	if(Config.logs.debug) console.log(path);
	if(Config.logs.debug) console.log(data);

	return Q.promise(function(resolve, reject) {
		if(vm.db !== null) {
			vm.db.ref(path).push(data, function(error) {
				if(error) {
					console.log('Error in push!'.red);
					console.log(error);

					reject(error);
				}else{
					if(Config.logs.debug) console.log('Pushed data!');
					resolve();
				}
			});
		}else{
			reject();
		}
	});
};

Database.prototype.set = function(path, data) {
	if(Config.logs.debug) console.log('Attempting set');
	if(Config.logs.debug) console.log(path);
	if(Config.logs.debug) console.log(data);

	return Q.promise(function(resolve, reject) {
		// Todo: This should become smarter to match the database name in the path for multi-database denormalizing
		if(vm.db !== null) {
			vm.db.ref(path).set(data, function(error) {
				if(error) {
					console.log('Error in set!'.red);
					console.log(error);

					reject(error);
				}else{
					if(Config.logs.debug) console.log('Set data!');
					resolve();
				}
			});
		}else{
			reject();
		}
	});
};

Database.prototype.delete = function(path, data) {
	if(Config.logs.debug) console.log('Attempting delete');
	if(Config.logs.debug) console.log(path);
	if(Config.logs.debug) console.log(data);

	return Q.promise(function(resolve, reject) {
		// Todo: This should become smarter to match the database name in the path for multi-database denormalizing
		if(vm.db !== null) {
			vm.db.ref(path).set(null, function(error) {
				if(error) {
					console.log('Error in delete!'.red);
					console.log(error);

					reject(error);
				}else{
					if(Config.logs.debug) console.log('Deleted data!');
					resolve();
				}
			});
		}else{
			reject();
		}
	});
};

module.exports = Database;