var	Config = require('./add.config.js');
var colors = require('colors');

var Variables = require('./add.variables.js');
var Validators = require('./add.validators.js');

var initPlaces = function(places, data) {
	var placesValid = true;
	var placesConstructed = true;

	if(Config.logs.debug) console.log('Attempting to init places');
	if(Config.logs.debug) console.log(JSON.stringify(places));
	if(Config.logs.debug) console.log(JSON.stringify(data));

	places.forEach(function(place) {
		if(placesValid && placesConstructed) {
			if(!Validators.validatePlace(place)) {
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

var constructPlace = function(place, data) {

	if(Config.logs.debug) console.log('Attempting to construct place');
	if(Config.logs.debug) console.log(JSON.stringify(place));
	if(Config.logs.debug) console.log(JSON.stringify(data));

	var constructedPlace = {};

	// First get the variables and then construct the path from those variables

	constructedPlace._variables = Variables.getVariableValues(place.variables, data);

	if(Config.logs.debug) console.log('Variable Values');
	if(Config.logs.debug) console.log(JSON.stringify(constructedPlace._variables));
	
	constructedPlace._path = Variables.replaceVariablesInString(place.path, constructedPlace._variables);

	if(Config.logs.debug) console.log('Constructed path');
	if(Config.logs.debug) console.log(constructedPlace._path);

	// Now we need to construct the value that we are going to replicate
	
	constructedPlace._value = Variables.getValueToDuplicate(place, data);

	constructedPlace._options = place.options;

	return constructedPlace;
};

module.exports = {
	initPlaces: initPlaces
};