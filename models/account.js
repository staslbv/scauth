var        _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt      = require('jsonwebtoken');
var bcrypt   = require('bcryptjs');
var FIELD    = require('../constant.js');



module.exports = function(sequelize, DataTypes){
	var dbacc = sequelize.define('account',{
		[FIELD.PROP_KEY]: {
            type: DataTypes.STRING,
            allowNull: false,
            validate:{
				len: [1,250]
			}
		},
		[FIELD.PROP_TYPE]: {
			type: DataTypes.STRING,
			allowNull: false,
			validate:{
				len: [1,250]
			},
			defaultValue: FIELD.ACCOUNT_TYPE_USER
		},
		[FIELD.PROP_AUTH_TYPE]: {
            type: DataTypes.STRING,
            allowNull: false,
            validate:{
				len: [1,250]
			},
			defaultValue: FIELD.AUTH_TYPE_PASSWORD
		}
	},{
		hooks:{
			beforeValidate: function(account,option){
				if (_.isString(account[FIELD.PROP_TYPE]))
					account[FIELD.PROP_TYPE]      = account[FIELD.PROP_TYPE].toUpperCase().trim();
				if (_.isString(account[FIELD.PROP_AUTH_TYPE]))
					account[FIELD.PROP_AUTH_TYPE] = account[FIELD.PROP_AUTH_TYPE].toUpperCase().trim();
			}
		},
		instanceMethods: {
			
		},
		classMethods:{
			getAccountRef: function(user, type, key ){
				return new Promise(function(accept,reject){
					if (!_.isString(key) || !_.isString(type)){
						reject();
					}else{
						var accType  = type.toUpperCase().trim();
						var authType = FIELD.AUTH_TYPE_TOKEN;
						if (accType == FIELD.ACCOUNT_TYPE_USER || accType == FIELD.ACCOUNT_TYPE_SHIELDOX)
							authType = FIELD.AUTH_TYPE_PASSWORD;
						var hash     = cryptojs.MD5(key.toLowerCase().trim()).toString();
						var filter   = {
							where:{
								[FIELD.PROP_USER_ID]:user.id,
								[FIELD.PROP_TYPE]:accType,
								[FIELD.PROP_KEY]:hash
							}
						}; 
						dbacc.findOne(filter)
						.then(function(acc){
							if (_.isObject(acc) && (_.pick(acc,FIELD.PROP_ID)[FIELD.PROP_ID])){
								accept(acc);
							}else{
								var obj = {
									[FIELD.PROP_USER_ID]:   user.id,
									[FIELD.PROP_KEY]:       hash,
									[FIELD.PROP_TYPE]:      accType,
									[FIELD.PROP_AUTH_TYPE]: authType
								};
								dbacc.create(obj)
							   .then(function(acc){
                                  if (_.isObject(acc)){
                                  	 accept(acc);
                                  }else{
                                  	reject();
                                  }
							   })
							   .catch(function(e){
							   	  reject(e);
							   });
							}
						})
						.catch(function(e){
							reject(e);
						});
					}
				});
			}
		}
	});

	return dbacc;
};
