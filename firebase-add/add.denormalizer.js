var	Config = require('./add.config.js');
var	Database = require('./add.database.js');
var Validators = require('./add.validators.js');
var Places = require('./add.places.js');
var colors = require('colors');
var Q = require('q');

var vm = {
	schema: null,
	database: null,
	constructed: false
};

function Denormalizer(options) {
	var couldConstruct = true;

	console.log('Database');
	console.log(Database);

	console.log('Config');
	console.log(Config);

	if(Validators.validateSchema(options.schema)) {
		vm.schema = options.schema;

		vm.schema = Validators.fixSchema(vm.schema);
	}else{
		couldConstruct = false;

		console.error('Could not construct Denormalizer, invalid schema'.red);
	}

	if(couldConstruct) {
		if(Config.logs.debug) console.log('Loaded denormalizer');
		if(Config.logs.debug) console.log('With Schema: ' + JSON.stringify(vm.schema));
	}

	vm.constructed = couldConstruct;
}

var matchExpectingForDenormalize = function(data) {
	var matching = true;

	switch(vm.schema.expectingType) {

		case 'object':
			vm.schema.expectingProperties.forEach(function(expectedProperty) {
				if(data[expectedProperty] === undefined) {
					if(Config.logs.debug) console.log('Failed to match expected property: ' + expectedProperty);
					matching = false;
				}
			});
		break;

		case 'string':
			// TODO: Better validation
			if(data === undefined) {
				matching = false;
			}
		break;

		case 'number':
			// TODO: Better validation
			if(data === undefined) {
				matching = false;
			}
		break;

		case 'boolean':
			// TODO: Better validation
			if(data === undefined) {
				matching = false;
			}
		break;

		default:
			matching = false;
		break;
	}

	return matching;
};

/*
 * Matching For update will be extended to allow for partial updates
 */
var matchExpectingForUpdate = function(data) {
	var matching = true;

	switch(vm.schema.expectingType) {

		case 'object':
			vm.schema.expectingProperties.forEach(function(expectedProperty) {
				if(data[expectedProperty] === undefined) {
					if(Config.logs.debug) console.log('Failed to match expected property: ' + expectedProperty);
					matching = false;
				}
			});
		break;

		case 'string':
			// TODO: Better validation
			if(data === undefined) {
				matching = false;
			}
		break;

		case 'number':
			// TODO: Better validation
			if(data === undefined) {
				matching = false;
			}
		break;

		case 'boolean':
			// TODO: Better validation
			if(data === undefined) {
				matching = false;
			}
		break;

		default:
			matching = false;
		break;
	}

	return matching;
};
	
var denormalizeToPlace = function(place, data) {
	return Q.Promise(function(resolve, reject) {

		if(Config.logs.debug) console.log('Attempting to denormalize to place');
		if(Config.logs.debug) console.log('Place: ' + JSON.stringify(place));

		switch(place.operation) {
			case 'push':
				Database.push(place._constructedPlace._path, place._constructedPlace._value, place._constructedPlace._options.database).then(function(results) {
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

			case 'set':
				Database.set(place._constructedPlace._path, place._constructedPlace._value, place._constructedPlace._options.database).then(function(results) {
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

var updatePlace = function(place, data) {
	return Q.Promise(function(resolve, reject) {

		if(Config.logs.debug) console.log('Attempting to denormalize to place');
		if(Config.logs.debug) console.log('Place: ' + JSON.stringify(place));

		switch(place.operation) {
			case 'set':
				Database.set(place._constructedPlace._path, place._constructedPlace._value, place._constructedPlace._options.database).then(function(results) {
					if(Config.logs.debug) console.log('Successfully updated denormalized value');

					resolve(true);

				}, function(error) {
					console.log('Error updating denormalized value'.red);
					console.log(error);

					reject(false);
				}).catch(function(error) {
					console.log('Fatal error updating denormalized value'.red);
					console.log(error);

					reject(false);
				});
			break;

			default:
				console.error(('Could not update denormalized value with place - Invalid operation: ' + place.operation).red);
				reject(false);
			break;
		}
	});
};

var removePlace = function(place, data) {
	return Q.Promise(function(resolve, reject) {

		if(Config.logs.debug) console.log('Attempting to remove data from place');
		if(Config.logs.debug) console.log('Place: ' + JSON.stringify(place));

		switch(place.operation) {
			case 'set':
				Database.delete(place._constructedPlace._path, place._constructedPlace._options.database).then(function(results) {
					if(Config.logs.debug) console.log('Successfully updated denormalized value');

					resolve(true);

				}, function(error) {
					console.log('Error updating denormalized value'.red);
					console.log(error);

					reject(false);
				}).catch(function(error) {
					console.log('Fatal error updating denormalized value'.red);
					console.log(error);

					reject(false);
				});
			break;

			default:
				console.error(('Could not update denormalized value with place - Invalid operation: ' + place.operation).red);
				reject(false);
			break;
		}
	});
};

Denormalizer.prototype.denormalize = function(originalData) {
	if(vm.schema !== null) {
		if(Config.logs.debug) console.log('Attempting to denormalize data');

		return Q.Promise(function(resolve, reject) {
			// Make sure we're seeing somewhat the object we need to have
			if(matchExpectingForDenormalize(originalData)) {

				var constructedPlaces = Places.initPlaces(vm.schema.places, originalData);

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

				reject(false);
			}
		});
	}else{
		console.error('Could not denormalize, invalid schema'.red);
		reject(false);
	}
};

Denormalizer.prototype.update = function(newData) {
	if(vm.schema !== null) {
		if(Config.logs.debug) console.log('Attempting to update denormalized data');

		return Q.Promise(function(resolve, reject) {
			var constructedPlaces = Places.initPlaces(vm.schema.places, newData);

			if(constructedPlaces) {

				if(Config.logs.debug) console.log('Constructed places');
				if(Config.logs.debug) console.log(JSON.stringify(constructedPlaces, 4, true));

				var placesPromises = [];
				
				constructedPlaces.forEach(function(place) {
					if(place.operation === 'set') {
						if(place._constructedPlace._options.ignore.update !== true) {
							placesPromises.push(updatePlace(place));
						}
					}
				});

				Q.allSettled(placesPromises).then(function(results) {
					if(Config.logs.debug) console.log('Finished updating denormalized data');
					if(Config.logs.debug) console.log(JSON.stringify(results, 4, true));

					resolve(true);
				}).catch(function(error) {
					console.error('Could not update denormalized data'.red);
					console.error(error);
					reject(false);
				});

			}else{
				reject(false);
			}
		});
	}
};

Denormalizer.prototype.delete = function(dataToRemove) {
	if(vm.schema !== null) {
		if(Config.logs.debug) console.log('Attempting to delete denormalized data');

		return Q.Promise(function(resolve, reject) {
			if(matchExpectingForUpdate(dataToRemove)) {
				var constructedPlaces = Places.initPlaces(vm.schema.places, dataToRemove);

				if(constructedPlaces) {
					if(Config.logs.debug) console.log('Constructed places');
					if(Config.logs.debug) console.log(JSON.stringify(constructedPlaces, 4, true));

					var placesPromises = [];
					
					constructedPlaces.forEach(function(place) {
						if(place.operation === 'set') {
							if(place._constructedPlace._options.ignore.delete !== true) {
								placesPromises.push(removePlace(place));
							}
						}
					});

					Q.allSettled(placesPromises).then(function(results) {
						if(Config.logs.debug) console.log('Finished deleting denormalized data');
						if(Config.logs.debug) console.log(JSON.stringify(results, 4, true));

						resolve(true);
					}).catch(function(error) {
						console.error('Could not delete denormalized data'.red);
						console.error(error);

						reject(false);
					});

				}else{
					reject(false);
				}
			};
		});
	}
};

// Helpers

Denormalizer.prototype.isConstructed = function() {
	return vm.constructed;
};

module.exports = Denormalizer;