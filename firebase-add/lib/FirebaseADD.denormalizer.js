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



var constructPlace = function(place, data) {
	return {
		thisIsAnExample: 'test'
	};
};

var validatePlace = function(places) {
	// Todo: Validate that the place data is correct, variables are right, etc.
	
	return true;
};

var initPlaces = function(places, data) {
	var placesValid = true;
	var placesConstructed = true;

	places.forEach(function(place) {
		if(placesValid && placesConstructed) {
			if(!validatePlace(place)) {
				placesValid = false;
			}else{
				var constructedPlace = constructPlace(place, data);

				if(!constructedPlace) {
					placesConstructed = false;
				}else{
					place._constructedPlace = constructedPlace;
				}
			}
		}
	});

	if(!placesValid) {
		console.error('Could not denormalize: places not valid');
	}

	if(!placesConstructed) {
		console.error('Could not denormalize: places could not be constructed');
	}

	if(placesValid && placesConstructed) {
		return places;
	}else{
		return false;
	}
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

				var constructedPlaces = initPlaces(vm.schema.places);

				if(constructedPlaces) {

					if(Config.logs.debug) console.log('Constructed places');
					if(Config.logs.debug) console.log(JSON.stringify(constructedPlaces, 4, true));

					var placesPromises = [];
					
					constructedPlaces.forEach(function(place) {
						placesPromises.push(denormalizeToPlace(originalData, place));
					});

					Q.allSettled(placesPromises).then(function(results) {
						if(Config.logs.debug) console.log('Finished denormalizing');
						if(Config.logs.debug) console.log(JSON.stringify(results, 4, true));

						resolve(true);
					}).catch(function(error) {
						console.error('Could not denormalize'.red);
						console.error(error);
					});

				}else{
					reject(false);
				}
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