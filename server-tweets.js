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

var tweetDenormalizer = new ADDDenormalizer({
	schema: {
		expectingType: 'object',							// The type, could be number, string, object, array
		expectingProperties: ['handle', 'tweet'],			// The properties of the object (not required for other types, maybe)
		places: [{
			operation: 'set',								// Should we overwrite (set) or add to the list (push) these?
			type: 'object',									// What are we saving? If object, we expect 'properties' and if not we are just saving the value
			path: '/userTweets/{{userHandle}}/{{key}}',	// Where should we put this? 
			variables: {									// We can use variables in handlebars that map our input data to the path
				userHandle: 'handle',						// This will place our input handle to userHandle in the path
				key: '$key'
			},	
			properties: ['tweet']							// We only want to duplicate the tweet, not the handle over
		},
		{
			operation: 'push',								// Should we overwrite (set) or add to the list (push) these?
			type: 'string',									// What are we saving? If object, we expect 'properties' and if not we are just saving the value
			path: '/usersWhoTweeted',						// Where should we put this? 
			variables: {},
			property: 'handle'
		},
		{
			operation: 'set',								// Should we overwrite (set) or add to the list (push) these?
			type: 'string',									// What are we saving? A string, so it will just be a value in the database with a key
			path: '/lastUser',								// Where should we put this? 
			variables: {},
			property: 'handle'
		}]
	}
});

db.ref('tweets').on('child_added', function(snapshot) {
	var newTweet 		= snapshot.val();
		newTweet.$key 	= snapshot.key;

	console.log('Child added');
	console.log(newTweet);

	tweetDenormalizer.denormalize(newTweet).then(function(result) {
		console.log('Denormalized', result);

	}, function(error) {
		console.error('Could not denormalize', error);

	}).catch(function(e) {
		console.log('Exception');
		console.log(e);
	});
});

db.ref('tweets').on('child_changed', function(snapshot) {
	var newTweet 		= snapshot.val();
		newTweet.$key 	= snapshot.key;

	tweetDenormalizer.update(newTweet).then(function(result) {
		console.log('Updated', result);

	}, function(error) {
		console.error('Could not update', error);

	}).catch(function(e) {
		console.log('Exception');
		console.log(e);
	});
});

db.ref('tweets').on('child_removed', function(snapshot) {
	var deletedTweet		= snapshot.val();
		deletedTweet.$key 	= snapshot.key;

	tweetDenormalizer.delete(deletedTweet).then(function(result) {
		console.log('Deleted', result);
	}, function(error) {
		console.error(error);
	}).catch(function(e) {
		console.error('Exception');
		console.error(e);
	})
});

// For testing


setTimeout(function() {

	var tweetSample = {
		"handle": faker.name.firstName() + '_' + faker.name.lastName(),
		"tweet": "Wow hello this is my tweet, how cool is this"
	};

	db.ref('tweets').push(tweetSample);
});