var admin = require('firebase-admin');
var serviceAccount = require('./firebase-creds.json');

var ADDConfig = require('./firebase-add/index.js').Config;
var ADDDenormalizer = require('./firebase-add/index.js').Denormalizer;

var faker = require('faker');

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: 'https://fir-add-lib.firebaseio.com'
});

var db = admin.database();

ADDConfig.database.default = db;

var emailDenormalizer = new ADDDenormalizer({
	schema: {
		expectingType: 'string',					// The type, could be number, string, object, array
		places: [{
			operation: 'push',						// Should we overwrite (set) or add to the list (push) these?
			type: 'string',							// What are we saving? If object, we expect 'properties' and if not we are just saving the value
			path: '/privateEmailList',				// Where should we put this? 
			variables: {}
		},
		{
			operation: 'set',						// Should we overwrite (set) or add to the list (push) these?
			type: 'string',							// What are we saving? If object, we expect 'properties' and if not we are just saving the value
			path: '/lastEmailUsed',					// Where should we put this? 
			variables: {}
		}]
	}
});

db.ref('emailList').on('child_added', function(snapshot) {
	var newEmail = snapshot.val();


	emailDenormalizer.denormalize(newEmail).then(function(result) {
		console.log('Denormalized', result);

	}, function(error) {
		console.error('Could not denormalize', error);

	}).catch(function(e) {
		console.log('Exception');
		console.log(e);
	});
});

// For testing


/*setTimeout(function() {
	db.ref('emailList').push(faker.internet.email());
})*/