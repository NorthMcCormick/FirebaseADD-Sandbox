var	Config = require('./FirebaseADD.config.js');
var colors = require('colors');
var Q = require('q');

var vm = {
	schema: null
};

function Database() {
	
}

Database.prototype.test = function(originalData) {
	console.log('Database class test!');
};

module.exports = new Database();