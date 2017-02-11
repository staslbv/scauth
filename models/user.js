var        _ = require('underscore');

var FIELD    = require('../constant.js');


module.exports = function(sequelize, DataTypes){
	var dbuser = sequelize.define('user',{
		[FIELD.PROP_EMAIL]:{
			type: DataTypes.STRING,
			allowNull: false,
			validate:{
				len: [1,250],
				isEmail: true
			},
			unique: true
		}
	},{
		hooks:{
			beforeValidate: function(user,option){
				if (_.isString(user[FIELD.PROP_EMAIL]))
					user[FIELD.PROP_EMAIL] = (user[FIELD.PROP_EMAIL]).toLowerCase().trim();
			}
		},
		instanceMethods: {

		},
		classMethods: {
			findByEmail: function(email){
				return new Promise(function(resolve,reject)
				{
					if (!_.isString(email)){
						reject(undefined);
					}
					console.log(email);
					var query = {
						where: {
							[FIELD.PROP_EMAIL]: email.toLowerCase().trim()
						}
					};
					dbuser.findOne(query)
					.then(function(e){
						if ((e) && (_.isObject(e)) && (_.pick(e,FIELD.PROP_ID)[FIELD.PROP_ID])){
							resolve(e);
						}else{
							reject(undefined);
						}
					})
					.catch(function(e){
						reject(e);
					});
				});
			},
			createRecord: function(email){
				return new Promise(function(resolve,reject){
					dbuser.create({[FIELD.PROP_EMAIL]:email}).then(function(e){
						if ((e) && (_.isObject(e)) && (_.pick(e,FIELD.PROP_ID)[FIELD.PROP_ID])){
							resolve(e);
						}else{
							reject();
						}
					}).catch(function(e){reject(e)});
				});
			}
		}
	});
	return dbuser;
};
