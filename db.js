var FLAG_START_FROM_SCRATCH = true;

var Sequelize               = require('sequelize');

var DATABESE_NAME           = "scuser";

/*
var sequelize = new Sequelize(
	DATABESE_NAME, "scnull@q631ozbdob","Osafe1341",{
		 "dialect": "mssql",
		 "port": 1433,
		 "host": "q631ozbdob.database.windows.net",
		 "dialectOptions":{
		 	"encrypt": true,
		 	"loginTimeout": 30
		 }
	});
*/
sequelize = new Sequelize(undefined,undefined,undefined,{
		"dialect": "sqlite",
		"storage": __dirname + "/basic-sqlite-database.sqlite"

	});


var db = {};

db.sequelize   = sequelize;
db.Sequelize   = Sequelize;
db.FORCE_INIT  = true;

db.user        = sequelize.import(__dirname + '/models/user.js');
db.account     = sequelize.import(__dirname + '/models/account.js');
db.authpass    = sequelize.import(__dirname + '/models/authpass.js');
db.tokenpass   = sequelize.import(__dirname + '/models/tokenpass.js');
db.token       = sequelize.import(__dirname + '/models/token.js');

// set up so user has many accounts
db.account.belongsTo(db.user);
db.user.hasMany(db.account);

// set up so accounts have various password passes
db.authpass.belongsTo(db.account);
db.account.hasMany(db.authpass);

// set up so accounts have various token passes
db.tokenpass.belongsTo(db.account);
db.account.hasMany(db.tokenpass);

// set up token belong to account
db.token.belongsTo(db.account);
db.account.hasMany(db.token);


module.exports = db;

