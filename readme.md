# Automatic Data Denormalizer

A-D-D for short, the automatic data denormalizer takes a developer defined schema and uses an input to duplicate the data.

## Feature Goals

### Multi-database

The ability to have multiple realtime databases loaded so that you can duplicate data between them even if they are of different providers.

### Handle update and remove

The initial version of the librar is built on the idea of adding data, updating and removing will come along and will be able to utilize the same schema that the add does.

### Complex objects

The first version of the library will be able to handle the top most level properties on an object. Eventually better path parsing will be added so that you can reach into an object and select a nested property to use in the duplicated object.

## Installation

Todo

## Quick Start

Require the library into your node project:

```javascript
var ADDConfig = require('add').Config;
var ADDDenormalizer = require('add').Denormalizer;
```

Assign your database (currently only supporting a Firebase database reference):

```javascript
var db = admin.database();

ADDConfig.database.default = db;
```

Create a denormalizer object: 

```javascript
var tweetDenormalizer = new ADDDenormalizer({
	schema: {
		expectingType: 'object',
		expectingProperties: ['handle', 'tweet'],	
		places: [{
			operation: 'push',
			type: 'object',
			path: '/userTweets/{{userHandle}}',
			variables: 
				userHandle: 'handle'
			},
			properties: ['tweet']
		},
		{
			operation: 'push',
			type: 'string',
			path: '/usersWhoTweeted',
			variables: {},
			property: 'handle'
		},
		{
			operation: 'set',
			type: 'string',
			path: '/lastUser',
			variables: {},
			property: 'handle'
		}]
	}
});
```

And ask it to denormalize some data for you:

```javascript
tweetDenormalizer.denormalize(newTweet).then(function(result) {
	console.log('Denormalized', result);

}, function(error) {
	console.error('Could not denormalize', error);

}).catch(function(e) {
	console.log('Exception');
	console.log(e);
});
```

## Denormalizer Object

The denormalizer is where the magic happens. You want to create one of these for each set of data you want to denormalize. In the Quick Start example I use tweets. When I send a tweet to the server that looks like this:

```json
{
  "handle": "Sammy_Yundt36asdf",
  "tweet": "Wow hello this is my tweet, how cool is this"
}
```

It takes the data, validates that the schema matches, and then updates 3 places:

1) It pushes the tweet onto the user handle using a variable from the data
2) It adds their handle to a list of handles but just as a string, not as an object containing a string
3) It overwrites the node `lastUser` to their handle so we know who tweeted last

## Required Libraries

- Q
- Colors
- A database reference from Firebase Admin or Firebase SDK