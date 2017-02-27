var admin = require('firebase-admin');
var WebSocket = require('ws');
var IonicDB = require('@ionic/db').IonicDB

var serviceAccount = require('./firebase-creds.json');
var ionidbCreds = require('./ionicdb-creds.json');

var ADDConfig = require('./firebase-add/index.js').Config;
var ADDDenormalizer = require('./firebase-add/index.js').Denormalizer;

var ADDDatabase_Firebase = require('./add.firebase.db.js');
var ADDDatabase_IonicDB = require('./add.ionicdb.db.js');

var faker = require('faker');

// Start up the firebase db
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: 'https://fir-add-lib.firebaseio.com'
});

var firebaseAdminDB = admin.database();

var myFirebaseDatabase = new ADDDatabase_Firebase(firebaseAdminDB);

// Start up the ionic db

var db_settings = {
	app_id: ionidbCreds.appid,
	authType: "authenticated",
	WebSocketCtor: WebSocket
};

var ionicAdminDb = new IonicDB(db_settings);

ionicAdminDb.setToken(ionidbCreds.key);
ionicAdminDb.onConnected().subscribe(function(){
	console.log("Connected to IonicDB!");

	firebaseAdminDB.ref('tweets').on('child_added', function(snapshot) {
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

	firebaseAdminDB.ref('tweets').on('child_changed', function(snapshot) {
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

	firebaseAdminDB.ref('tweets').on('child_removed', function(snapshot) {
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
});

ionicAdminDb.connect();

var myIonicDatabase = new ADDDatabase_IonicDB(ionicAdminDb);

// Add the databases 

ADDConfig.database.ionic = myIonicDatabase;
ADDConfig.database.default = myFirebaseDatabase;

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
			property: 'handle',
			options: {
				ignore: {
					delete: true
				}
			}
		},
		{
			operation: 'set',
			type: 'object',
			path: 'allTweets/{{key}}',
			variables: {
				userHandle: 'handle',
				key: '$key'
			},	
			properties: ['tweet'],
			options: {
				database: 'ionic'
			}
		}]
	}
});

// For testing

/*setTimeout(function() {

	var tweetSample = {
		"handle": faker.name.firstName() + '_' + faker.name.lastName(),
		"tweet": "Wow hello this is my tweet, how cool is this"
	};

	firebaseAdminDB.ref('tweets').push(tweetSample);
});*/
