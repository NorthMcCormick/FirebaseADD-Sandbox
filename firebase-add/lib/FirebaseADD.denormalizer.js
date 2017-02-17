var	Config = require('./FirebaseADD.config.js');
var colors = require('colors');
var Q = require('q');

var vm = {
	schema: null
};

function Denormalizer(options) {
	var couldConstruct = true;

	if(validateSchema(options.schema)) {
		vm.schema = options.schema;
	}else{
		couldConstruct = false;

		console.error('Could not construct Denormalizer, invalid schema'.red);
	}

	if(couldConstruct) {
		if(Config.logs.debug) console.log('Loaded denormalizer');
		if(Config.logs.debug) console.log('With Schema: ' + JSON.stringify(vm.schema));
	}else{

	}
}

var matchExpecting = function(data) {
	var matching = true;

	switch(vm.schema.expectingType) {

		case 'object':
			Object.keys(data).forEach(function(dataKey) {
				if(vm.schema.expectingProperties.indexOf(dataKey) <= -1) {
					matching = false;
				}
			});
		break;

		default:
			matching = false;
		break;
	}

	return matching;
};

var constructPlace = function(place) {

};

var validatePlace = function(places) {
	
};

var initPlaces = function(places, data) {
	var placesValid = true;
	var placesConstructed = true;

	places.forEach(function(place) {
		if(placesValid) {
			if(!validatePlace(place)) {
				placesValid = false;
			}
		}
	});

	if(!placesValid) {
		console.error('Could not denormalize: places not valid');
	}

	if(!placesConstructed) {
		console.error('Could not denormalize: places could not be constructed');
	}

	return (placesValid && placesConstructed);
};

	
var denormalizeToPlace = function(data, place) {
	return Q.Promise(function(resolve, reject) {
		resolve(true);
	});
};

var validateSchema = function(inputSchema) {
	var schemaValid = true;

	if(inputSchema.expectingType) {
		switch(inputSchema.expectingType) {
			case 'object':

			break;

			default:
				schemaValid = false;
				if(Config.logs.debug) console.log('Schema invalid: Invalid \'expectingType\': ' + inputSchema.expectingType);
			break;
		}
	}else{
		schemaValid = false;
		if(Config.logs.debug) console.log('Schema invalid: no \'expectingType\' found');
	}

	// TODO: More validation

	return schemaValid;
};

var denormalize = function(data) {

};

Denormalizer.prototype.denormalize = function(originalData) {
	if(vm.schema !== null) {
		if(Config.logs.debug) console.log('Attempting to denormalize data');

		return Q.Promise(function(resolve, reject) {
			// Make sure we're seeing somewhat the object we need to have
			if(matchExpecting(originalData)) {



				// Start denormalizing
				var placesPromises = [];
				
				vm.schema.places.forEach(function(place) {
					placesPromises.push(denormalizeToPlace(originalData, place));
				});

				Q.allSettled(placesPromises).then(function(results) {
					if(Config.logs.debug) console.log('Finished denormalizing');
					if(Config.logs.debug) console.log(JSON.stringify(results, 4, true));
				}).catch(function(error) {
					console.error('Could not denormalize'.red);
					console.error(error);
				});

				resolve(true);
			}else{
				if(Config.logs.warn) console.warn('Could not denormalize object, schema does not match'.yellow);

				resolve(false);
			}
		});
	}else{
		console.error('Could not denormalize, invalid schema'.red);
	}
};

module.exports = Denormalizer;