var	Config = require('./add.config.js');
var colors = require('colors');

var getVariableValues = function(inputVariables, data) {

	if(Config.logs.debug) console.log('Grabbing variable values. Variables:');
	if(Config.logs.debug) console.log(inputVariables);
	if(Config.logs.debug) console.log('Data:');
	if(Config.logs.debug) console.log(data);
	
	var variables = {};

	Object.keys(inputVariables).forEach(function(variableKey) {
		if(data[inputVariables[variableKey]] !== undefined) {
			variables[variableKey] = data[inputVariables[variableKey]];
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

		case 'string':
			if(place.property) {
				newValue = data[place.property];
			}else{
				newValue = data;
			}
		break;

		case 'number':
			if(place.property) {
				newValue = data[place.property];
			}else{
				newValue = data;
			}
		break;

		case 'boolean':
			if(place.property) {
				newValue = data[place.property];
			}else{
				newValue = data;
			}
		break;

		default:
			console.log('Could not denormalize data. Place is trying to use an undefined type: ' + place.type);
		break;
	}

	return newValue;
};

module.exports = {
	getVariableValues: getVariableValues,
	replaceVariablesInString: replaceVariablesInString,
	getValueToDuplicate: getValueToDuplicate
};