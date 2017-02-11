var cryptojs = require('crypto-js');
var FIELD    = require('./constant.js');
var _        = require('underscore');


function authorize(db, token){
	return new Promise(function(resolve,reject){
		var _accountInstance;
		if (typeof token != 'string')
			return reject('E_AUTH_HEADER');        
        var arr = token.split('Bearer');
        if (arr.length <= 1)
        	return reject('E_AUTH_HEADER');
        var message = arr[1].trim();
        db.token.findOne({
        	where:{[FIELD.PROP_TOKEN_HASH]: cryptojs.MD5(message).toString()}
        }).then(function(tokenInstance){
        	if (!_.isObject(tokenInstance)){
        		return reject('E_TOKEN');
        	}else{
        		return db.account.findById(tokenInstance.get(FIELD.PROP_ACCOUNT_ID));
        	}
        },function (e){
        	reject('E_TOKEN QUERY');
        }).then(function(accountInstance){
           _accountInstance = accountInstance;
        	if (!_.isObject(accountInstance)){
        		return reject('E_ACCOUNT');
        	}else{
        		return db.user.findById(accountInstance.get(FIELD.PROP_USER_ID));
        	}
        },function(e){
        	reject('E_ACCOUNT_QUERY');
        }).then(function(userinstance){
        	if (!_.isObject(userinstance)){
        		return reject('E_USER');
        	}else{
        		resolve({
        			user: userinstance,
        			account: _accountInstance
        		});
        	}
        },function(e){
        	return reject('E_USER_QUERY');
        });
	});
}

module.exports = function(db){
	return {
		requireAuthentication: function(req,res,next)
		{
			authorize(db,req.get('Authorization'))
			.then(function(e){
				req.user    = e.user;
				req.account = e.account;
				next();
			})
			.catch(function(e){

                console.log('AUTH ERROR: ' + e);

				return res.status(401).send();

			});
		}
	};
};

