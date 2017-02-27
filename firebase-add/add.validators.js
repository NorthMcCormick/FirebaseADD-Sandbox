var	Config = require('./add.config.js');
var colors = require('colors');

var validateSchema = function(inputSchema) {
	var schemaValid = true;

	if(inputSchema.expectingType) {
		switch(inputSchema.expectingType) {
			case 'object':
				// Todo: Validate that it is has the other properties for validating an object
			break;

			case 'string':
				// Todo: Validate that it has the other neccessary properites 
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

var fixSchema = function(inputSchema) {
	// Fix places
	
	inputSchema.places.forEach(function(place) {
		// Fix options
		if(place.options === undefined) {
			place.options = {};
		}

		// Fix options.ignore
		if(place.options.ignore === undefined) {
			place.options.ignore = {
				update: false,
				delete: false
			};
		}

		// Fix options.database
		if(place.options.database === undefined) {
			place.options.database = 'default';
		}
	});

	return inputSchema;
};

var validatePlace = function(place) {
	return true;
};

module.exports = {
	validateSchema: validateSchema,
	fixSchema: fixSchema,
	validatePlace: validatePlace
};