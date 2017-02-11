var        _   = require('underscore');
var cryptojs   = require('crypto-js');
var jwt        = require('jsonwebtoken');
var bcrypt     = require('bcryptjs');
var guid       = require('guid');
var FIELD      = require('../constant.js');


module.exports = function(sequelize, DataTypes){
	var dbpass = sequelize.define('tokenpass',{
		[FIELD.PROP_ACCESS_TOKEN]: {
			type: DataTypes.TEXT,
			allowNull: false,
			validate:{
				len: [1]
			}
		},
		[FIELD.PROP_TOKEN_TYPE]: {
			type: DataTypes.STRING
		},
		[FIELD.PROP_TOKEN_ACCOUNT_ID]: {
			type: DataTypes.STRING
		},
		[FIELD.PROP_TOKEN_UID]: {
			type: DataTypes.STRING
		},
		[FIELD.PROP_TOKEN_CLIENTID]: {
			type: DataTypes.STRING
		},
		[FIELD.PROP_TOKEN_REFRESH]: {
			type: DataTypes.STRING
		},
		[FIELD.PROP_TOKEN_HASH]:{
			type: DataTypes.STRING,
			allowNull: false,
		}
	},{
		hooks:{
			
		},
		classMethods:
		{
			setCredentials: function(account,token){
				return new Promise(function(accept,reject){
					var hash = cryptojs.MD5(token[FIELD.PROP_ACCESS_TOKEN]).toString();
					dbpass.findOne({
						where:{
							[FIELD.PROP_ACCOUNT_ID]: account[FIELD.PROP_ID],
							[FIELD.PROP_TOKEN_HASH]: hash
						}})
					.then(function(e){
						if (_.isObject(e) && _.pick(e,FIELD.PROP_ID)[FIELD.PROP_ID]){
							accept(e);
						}else{
							return dbpass.create({
								[FIELD.PROP_ACCOUNT_ID]:        account[FIELD.PROP_ID],
								[FIELD.PROP_ACCESS_TOKEN]:      token[FIELD.PROP_ACCESS_TOKEN],
								[FIELD.PROP_TOKEN_TYPE]:        token[FIELD.PROP_TOKEN_TYPE],
								[FIELD.PROP_TOKEN_ACCOUNT_ID]:  token[FIELD.PROP_TOKEN_ACCOUNT_ID],
								[FIELD.PROP_TOKEN_UID]:         token[FIELD.PROP_TOKEN_UID],
								[FIELD.PROP_TOKEN_CLIENTID]:    token[FIELD.PROP_TOKEN_CLIENTID],
								[FIELD.PROP_TOKEN_REFRESH]:     token[FIELD.PROP_TOKEN_REFRESH],
								[FIELD.PROP_TOKEN_HASH]: hash
							});
						}
					})
					.then(function(e){
						if (_.isObject(e) && e.get(FIELD.PROP_ID))
							accept(e);
						else
							reject();
					})
					.catch(function(e){
						reject(e);
					});
				});
			}
		},
		instanceMethods:
		{
			generateToken: function(account){
				var stringData        = JSON.stringify({
						[FIELD.PROP_ID]:           this.get(FIELD.PROP_ID),
						[FIELD.PROP_TYPE]:         account.get(FIELD.PROP_TYPE),
						[FIELD.PROP_AUTH_TYPE]:    FIELD.AUTH_TYPE_TOKEN
					});
                	var encryptedData = cryptojs.AES.encrypt(stringData,FIELD.AES_PASS).toString();
                    var token         = jwt.sign({
                    	token: encryptedData
                    }, FIELD.JWT_PASS);
                 return token;
			}

		}
	});
	return dbpass;
};
