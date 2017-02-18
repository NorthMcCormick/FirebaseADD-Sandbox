# Automatic Data Denormalizer

A-D-D for short, the automatic data denormalizer takes a developer defined schema and uses an input to duplicate the data.

## Feature Goals

### Multi-database

The ability to have multiple realtime databases loaded so that you can duplicate data between them even if they are of different providers.

### Handle update and remove

The initial version of the lib is built on the idea of adding data, updating and removing will come along and will be able to utilize the same schema that the add does.

### Complex objects

The first version of the lib will be able to handle the top most level properties on an object. Eventually better path parsing will be added so that you can reach into an object and select a nested property to use in the duplicated object.

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
  "handle": "Sammy_Yundt36",
  "tweet": "Wow hello this is my tweet, how cool is this"
}
```

It takes the data, validates that the schema matches, and then updates 3 places:

1. It pushes the tweet onto the user handle using a variable from the data
2. It adds their handle to a list of handles but just as a string, not as an object containing a string
3. It overwrites the node `lastUser` to their handle so we know who tweeted last

### Options

#### schema: Object *required*

`schema` holds the information for the input and output of your data. 

#### schema.expectingType: String *required*

`expectingType` is the type we expect to see. This keeps malformed data from clogging your denormalization process.

The available types are: `object`

#### schema.expectingProperties: Array<String> *required when `expectingType` is `object`*

An array of properties that the object *must* have to be denormalized. If the object is missing a property, it will not duplicate.

#### schema.places: Array<Object> *required*

An array of objects, each object describing where and how you want the data to be duplicated

#### schema.places.operation: String *required*

The type of operation to perform. The available operations are `set` and `push`.

#### schema.places.type: String *required*

What type you want to duplicate the data as. The avaiable types are `object` and `string`.

#### schema.places.properties: Array<String> *required if `type` is `object`*

An array of properties that you want to pull from the original data input. You must have at least one property to pull. The library does not support selecting nested properties at this time. If your object looks like this:

```json
{
	"a": {
		"aa": true,
		"bb": true
	},
	"b": {
		"cc": true
	}
}
```

And your properties looks like this:

```javascript
{
	properties: ['a']
}
```

The value it will duplicate is:

```javascript
{
	a: {
		aa: true,
		bb: true
	}
}
```

#### schema.places.property: String *required if `type` is `string`, `number`, or `boolean`*

The property from the object you want to use. This propety must be one of the above 3 types. It will fail if it is an object or an array.

If we have this as our original data:

```json
{
	"a": {
		"aa": true,
		"bb": true
	},
	"b": "I am a beautiful butterfly"
}
```

And our property looks like this:

```javascript
{
	property: 'b'
}
```

The value it will duplicate is:

```javascript
{
	b: 'I am a beautiful butterfly'
}
```

#### schema.places.path: String *required*

Where you want to save the new data. The path string can contain variable names (more on those below) and must be the absolute path.

Example: `/userTweets/{{userHandle}}` or `/users`

#### schema.places.variables: Object *required if a variable is defined in the path* 

`variables` is an object where the key is the name of the variable in the path and the value is the key of the original input.

Example:

```javascript
variables: {
	userHandle: 'handle'
}
```

`userHandle` is what it will search for in the path (like our previous path example). The parser will pull the value for `handle` (from the data we gave at the beginning of the denormalizer object) and use it there. 

Our data:

```json
{
  "handle": "Sammy_Yundt36",
  "tweet": "Wow hello this is my tweet, how cool is this"
}
```

What our final path will be:

`/userTweets/Sammy_Yundt36`

## Required Libraries

- Q
- Colors
- A database reference from Firebase Admin or Firebase SDK