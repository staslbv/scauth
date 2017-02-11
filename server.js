var express    = require('express');
var parserBody = require('body-parser');
var _          = require('underscore');
var db         = require('./db.js');


var FIELD      = require('./constant.js');

var app        = express();
var PORT       = (process.env.PORT || 3000);

var middleware = require('./middleware.js')(db);

app.use(parserBody.json());

function logError(e){
	if (_.isObject(e))
		console.log('ERROR: ' + JSON.stringify(e));
    else
        console.log('ERROR HAD OCCURED');
	
	return e;
}

app.get('/authorize', middleware.requireAuthentication, function(req,res){
    var obj = {
       user: req.user,
       account: req.account
    };
    res.json(obj);
});

app.post('/login/account/:type',function(req,res){
	if (!req.body.hasOwnProperty(FIELD.PROP_EMAIL) ||
		!req.body.hasOwnProperty(FIELD.PROP_TOKEN) ||
	    !req.body[FIELD.PROP_TOKEN].hasOwnProperty(FIELD.PROP_ACCESS_TOKEN) ||
	    !_.isString(req.body[FIELD.PROP_TOKEN][FIELD.PROP_ACCESS_TOKEN]))
		return res.status(412).send();
	if (req.body[FIELD.PROP_TOKEN].length == 0)
		return res.status(412).send();
	var type      = req.params.type.toUpperCase().trim();
	var email     = req.body[FIELD.PROP_EMAIL].toLowerCase().trim();
	var fpass     =  (type == FIELD.ACCOUNT_TYPE_USER || type == FIELD.ACCOUNT_TYPE_SHIELDOX);
    var user_object;
    var account_object;
    var token_instance;
    db.user.findByEmail(req.body[FIELD.PROP_EMAIL])
    .then(function(resolve){
    	user_object = resolve;
    	return new Promise(function(resolve,reject){
    		resolve(user_object);
    	});
    }, function(reject){
    	return db.user.createRecord(email);
    })
    .then(function(resolve){
    	user_object = resolve;
    	return db.account.getAccountRef(resolve, type, email);
    },function(reject){
    	return res.status(500).send();
    })
    .then(function(resolve){
    	account_object = resolve;
        if (fpass){
        	return db.authpass.setCredentials(resolve,  req.body[FIELD.PROP_TOKEN][FIELD.PROP_ACCESS_TOKEN]);
        }
        else{
        	return db.tokenpass.setCredentials(resolve, req.body[FIELD.PROP_TOKEN]);
        }
    })
    .then(function(pass){
    	return db.token.register(account_object, (token_instance = pass.generateToken(account_object)));
    })
    .then(function(token){
        res.header('Authorization', 'Bearer ' + token_instance);
        res.json();
    })
    .catch(function(e){
    	logError(e);
    	return res.status(500).send();
    });
});







db.sequelize.authenticate()
.then(function(e){
	return db.sequelize.sync({force: db.FORCE_INIT});
})
.then(function(e){
    app.listen(PORT, function(success){
		console.log('app listening on port: ' + PORT);
	});
})
.catch(function(e){
	console.log('connection error ..' + e);
})
