var	Config = require('./add.config.js');
var colors = require('colors');
var Q = require('q');

var vm = {
	schema: null
};

function Database() {

}

Database.prototype.push = function(path, data, databaseName) {

	if(Config.logs.debug) console.log('Attempting push');
	if(Config.logs.debug) console.log(path);
	if(Config.logs.debug) console.log(data);

	return Config.database[databaseName].push(path, data);
};

Database.prototype.set = function(path, data, databaseName) {
	if(Config.logs.debug) console.log('Attempting set');
	if(Config.logs.debug) console.log(path);
	if(Config.logs.debug) console.log(data);

	return Config.database[databaseName].set(path, data);
};

Database.prototype.delete = function(path, databaseName) {
	if(Config.logs.debug) console.log('Attempting delete');
	if(Config.logs.debug) console.log(path);

	return Config.database[databaseName].delete(path);
};

module.exports = new Database();