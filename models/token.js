var _          = require('underscore');
var cryptojs   = require('crypto-js');
var FIELD      = require('../constant.js');

module.exports = function(sequelize, DataTypes){
	var dbtoken = sequelize.define('token',{
		[FIELD.PROP_TOKEN]:{
			type: DataTypes.VIRTUAL,
			set: function (value){
				console.log('setting virtual value ...');
				this.setDataValue(FIELD.PROP_TOKEN,value);
				this.setDataValue(FIELD.PROP_TOKEN_HASH,cryptojs.MD5(value).toString());
				console.log('end setting virtual value ');
			}
		},
		[FIELD.PROP_TOKEN_HASH]:{
			type: DataTypes.STRING
		}
	},{
		hooks:{
			
		},
		instanceMethods: {

		},
		classMethods: {
			register: function(account, token){
                return new Promise(function(resolve,reject){
                    var hash = cryptojs.MD5(token).toString();
                	dbtoken.findOne({
                		where:{
                			[FIELD.PROP_ACCOUNT_ID]: account.get(FIELD.PROP_ID),
                			[FIELD.PROP_TOKEN_HASH] : hash
                		}
                	})
                	.then(function(e){
                		if (_.isObject(e) && e.get(FIELD.PROP_ID)){
                			resolve(e);
                		}else{
                			return dbtoken.create({
                				[FIELD.PROP_ACCOUNT_ID]: account[FIELD.PROP_ID],
                				[FIELD.PROP_TOKEN] : token
                			});
                		}
                	})
                	.then(function(e){
                		if (_.isObject(e) && e.get(FIELD.PROP_ID)){
                			resolve(e);
                		}
                		else{
                			reject(e);
                		}
                	})
                	.catch(function(e){
                		reject(e);
                	});

                });
			}
			
		}
	});
	return dbtoken;
};
