var	Config = require('./FirebaseADD.config.js');
var	Database = require('./FirebaseADD.database.js');
var colors = require('colors');
var Q = require('q');

var vm = {
	schema: null,
	database: null
};

function Denormalizer(options) {
	var couldConstruct = true;

	console.log('Database');
	console.log(Database);

	console.log('Config');
	console.log(Config);

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

var getVariablesInString = function(string) {
	var variables = [];

	if(Config.logs.debug) console.log('Attempting to get variables in string');

	string = string.replace(/\{\{(.*?)\}\}/g, "$1");

	if(Config.logs.debug) console.log(string);

	variables = string.split(' ');

	return variables;
};

var getVariableValues = function(variables, data) {
	Object.keys(variables).forEach(function(variableKey) {
		if(data[variables[variableKey]] !== undefined) {
			variables[variableKey] = data[variables[variableKey]];
		}
	});

	return variables;
};

var replaceVariablesInString = function(string, variables) {
	Object.keys(variables).forEach(function(variable) {
		string = string.replace('{{' + variable + '}}', variables[variable]);
		string = string.replace('{{ ' + variable + ' }}', variables[variable]);
	});

	return string;
};

var getValueToDuplicate = function(place, data) {
	var newValue = null;

	switch(place.type) {
		case 'object':
			newValue = {};

			place.properties.forEach(function(property) {
				if(data[property] !== undefined) {
					newValue[property] = data[property];
				}
			});
		break;

		default:
			console.log('Could not denormalize data. Place is trying to use an undefined type: ' + place.type);
		break;
	}

	return newValue;
};

var constructPlace = function(place, data) {

	if(Config.logs.debug) console.log('Attempting to construct place');
	if(Config.logs.debug) console.log(JSON.stringify(place));
	if(Config.logs.debug) console.log(JSON.stringify(data));

	var constructedPlace = {};

	// First get the variables and then construct the path from those variables

	constructedPlace._variables = getVariableValues(place.variables, data);

	if(Config.logs.debug) console.log('Variable Values');
	if(Config.logs.debug) console.log(JSON.stringify(constructedPlace._variables));
	
	constructedPlace._path = replaceVariablesInString(place.path, constructedPlace._variables);

	if(Config.logs.debug) console.log('Constructed path');
	if(Config.logs.debug) console.log(constructedPlace._path);

	// Now we need to construct the value that we are going to replicate
	
	constructedPlace._value = getValueToDuplicate(place, data);

	return constructedPlace;
};

var validatePlace = function(places) {
	// Todo: Validate that the place data is correct, variables are right, etc.
	
	return true;
};

var initPlaces = function(places, data) {
	var placesValid = true;
	var placesConstructed = true;

	if(Config.logs.debug) console.log('Attempting to init places');
	if(Config.logs.debug) console.log(JSON.stringify(places));
	if(Config.logs.debug) console.log(JSON.stringify(data));

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

	
var denormalizeToPlace = function(place, data) {
	return Q.Promise(function(resolve, reject) {

		if(Config.logs.debug) console.log('Attempting to denormalize to place');
		if(Config.logs.debug) console.log('Place: ' + JSON.stringify(place));

		switch(place.operation) {
			case 'push':
				Database.push(place._constructedPlace._path, place._constructedPlace._value).then(function(results) {
					if(Config.logs.debug) console.log('Successfully denormalized');

					resolve(true);

				}, function(error) {
					console.log('Error denormalizing'.red);
					console.log(error);

					reject(false);
				}).catch(function(error) {
					console.log('Fatal error denormalizing'.red);
					console.log(error);

					reject(false);
				});
			break;

			default:
				console.error(('Could not denormalize to place - Invalid operation: ' + place.operation).red);
				reject(false);
			break;
		}
	});
};

var validateSchema = function(inputSchema) {
	var schemaValid = true;

	if(inputSchema.expectingType) {
		switch(inputSchema.expectingType) {
			case 'object':
				// Todo: Validate that it is has the other properties for validating an object
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

Denormalizer.prototype.denormalize = function(originalData) {
	if(vm.schema !== null) {
		if(Config.logs.debug) console.log('Attempting to denormalize data');

		return Q.Promise(function(resolve, reject) {
			// Make sure we're seeing somewhat the object we need to have
			if(matchExpecting(originalData)) {

				var constructedPlaces = initPlaces(vm.schema.places, originalData);

				if(constructedPlaces) {

					if(Config.logs.debug) console.log('Constructed places');
					if(Config.logs.debug) console.log(JSON.stringify(constructedPlaces, 4, true));

					var placesPromises = [];
					
					constructedPlaces.forEach(function(place) {
						placesPromises.push(denormalizeToPlace(place));
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