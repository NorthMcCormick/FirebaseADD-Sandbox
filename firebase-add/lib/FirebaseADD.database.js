var	Config = require('./FirebaseADD.config.js');
var colors = require('colors');
var Q = require('q');

var vm = {
	schema: null
};

function Database() {
	console.log('Config');
	console.log(Config);

	if(Config.logs.debug) console.log('Using database: ');
	if(Config.logs.debug) console.log(Config.database.default);
}

Database.prototype.test = function(originalData) {
	console.log('Database class test!')
};

Database.prototype.push = function(path, data) {

	if(Config.logs.debug) console.log('Attempting push');
	if(Config.logs.debug) console.log(path);
	if(Config.logs.debug) console.log(data);

	return Q.promise(function(resolve, reject) {
		// Todo: This should become smarter to match the database name in the path for multi-database denormalizing

		Config.database.default.ref(path).push(data, function(error) {
			if(error) {
				console.log('Error in push!'.red);
				console.log(error);

				reject(error);
			}else{
				if(Config.logs.debug) console.log('Pushed data!');
				resolve();
			}
		});
	});
};

module.exports = new Database();