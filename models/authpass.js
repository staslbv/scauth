var        _   = require('underscore');
var cryptojs   = require('crypto-js');
var jwt        = require('jsonwebtoken');
var bcrypt     = require('bcryptjs');
var guid       = require('guid');


var FIELD      = require('../constant.js');


module.exports = function(sequelize, DataTypes){
	var dbpass = sequelize.define('authpass',{
		[FIELD.PROP_SALT]: {
            type: DataTypes.STRING,
            allowNull: false,
            validate:{
				len: [1,250]
			}
		},
		[FIELD.PROP_PASS_HASH]: {
			type: DataTypes.STRING,
			allowNull: false,
			validate:{
				len: [1,250]
			}
		},
		[FIELD.PROP_PASSWORD]:{
			type: DataTypes.VIRTUAL,
			allowNull: false,
			validate:{
				len: [5,250]
			},
			set: function(value){
				var salt           = bcrypt.genSaltSync(10);
				var hashedPassword = bcrypt.hashSync(value,salt);
                this.setDataValue(FIELD.PROP_SALT, salt);
                this.setDataValue(FIELD.PROP_PASS_HASH, hashedPassword);
                this.setDataValue(FIELD.PROP_PASSWORD, value);
			}
		}
	},{
		hooks:{
			
		},
		classMethods:
		{
			setCredentials: function(account,password){
				return new Promise(function(accept,reject){
					dbpass.findOne({where:{[FIELD.PROP_ACCOUNT_ID]: account[FIELD.PROP_ID]}})
					.then(function(e){
						if (_.isObject(e) && _.pick(e,FIELD.PROP_ID)[FIELD.PROP_ID]){
							accept(e);
						}else{
							if (!_.isString(password) || password.length == 0)
								password = guid.create().value;
							return dbpass.create({
								[FIELD.PROP_ACCOUNT_ID]: account[FIELD.PROP_ID],
								[FIELD.PROP_PASSWORD]: password
							});
						}
					})
					.then(function(e){
						if (_.isObject(e) && _.pick(e,FIELD.PROP_ID)[FIELD.PROP_ID])
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
		instanceMethods:{
			generateToken: function(account){

				var stringData        = JSON.stringify({
						[FIELD.PROP_ID]:           this.get(FIELD.PROP_ID),
						[FIELD.PROP_TYPE]:         account.get(FIELD.PROP_TYPE),
						[FIELD.PROP_AUTH_TYPE]:    FIELD.AUTH_TYPE_PASSWORD
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
