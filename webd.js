var express = require("express");
var router = express.Router();
var http = require('http');
var fs = require('fs');
var bodyParser = require('body-parser');



var webRoot = "./";
var port = 8080;

var passwords = null;
var config = null;
var players = null;


//A sample GET request    
router.route("/stats").get(function(req, res) {
	console.log("Got a GET request");
    res.send(fs.readFileSync("results.json", "utf8"));
});    

//A sample POST request
router.route("/results").post(function(req, res, next) {
	console.log("Got POST Data " + req.body);
	fs.appendFile("./results.json",
                ",\n" + req.body, 
                "utf8",
				errorProcessing);
   res.send('Got Post Data');
   next();
   
});

var app = express();
app.use(bodyParser.text());
app.use(bodyParser.json());
app.use('/',router);
app.use('/',express.static(webRoot));

var errorProcessing = function(err)
{
	if (err) 
	{
		throw err;
	}
	else
	{
		console.log('The "data to append" was appended to file!');
	}
}

var expressServer = app.listen(port,function()
{
	console.log("Parsing password");
	var passwordsString = fs.readFileSync("password.json");
	passwords = JSON.parse(passwordsString);
	console.log("Parsing config");
	var configString = fs.readFileSync("config.json");
	config = JSON.parse(configString);
	var playersString = fs.readFileSync("players.json");
	players = JSON.parse(playersString);
	console.log("Express Started");
});





/*
var handleRequest = function(request, response)
{

    try 
	{
        //log the request on console
        console.log(request.url);
        //Disptach
        dispatcher.dispatch(request, response);
   } 
	catch(err) 
	{
        console.log(err);
	}
}
var server = http.createServer(handleRequest);
server.listen(8080, "apaulinlaptop");



var postResults = function(req, res)
{
	console.log("Got a results " + req.method + " " + req.body);
	res.send("POST REPLY");
}

var getStats = function(req, res)
{
	console.log("Got a GET request " + req.body);
	res.send("GET REPLY");
}

//app.post('/results', postResults);
//app.get('/stats', getStats);
*/
router.route("/getplayers/:type/:arg1").get(function(req, res, next) 															 
{
	console.log("GET Players");
	var playersString = fs.readFileSync("players.json", "utf8");
	var playersObj = JSON.parse(playersString);
	if (config.draftPeriod == true)
	{
		for(var p = 0; p < playersObj.length; p++)
		{
			for(var w=0; w < playersObj[p].weeks.length; w++)
			{
				if (playersObj[p].weeks[w].week == config.week)
				{
					playersObj[p].weeks[w].pick5 = "";
					playersObj[p].weeks[w].pick4 = "";
					playersObj[p].weeks[w].pick3 = "";
					playersObj[p].weeks[w].pick2 = "";
					playersObj[p].weeks[w].pick1 = "";
					playersObj[p].weeks[w].designatedMatchUp = "";
				}
			}
		}
	}
    res.send(JSON.stringify(playersObj, null, 2));
});
															 
router.route("/changeconfig/:type/:arg1").post(function(req, res, next) 
{
	var newConfigString = req.body;
	var newConfigObj = JSON.parse(newConfigString);

	if (newConfigObj != null)
	{
		if (newConfigObj.week != undefined && newConfigObj.draftPeriod != undefined)
		{
			config = newConfigObj;
			fs.writeFileSync("config.json",
				JSON.stringify(config, null, 1),
				"utf8",
				errorProcessing);
			
			res.send('SUCCESS: Config changed.');
			
		}
	}
   next();
});
															 
router.route("/submitPicks/:type/:arg1").post(function(req, res, next) 
{
	console.log("!!!!!! " + req.ip + " : " + "Got testplans POST Data " + req.params.type + " : " + req.params.arg1);
	var newPick = JSON.parse(req.body);
	console.log(newPick);
	if (newPick != null)
	{
		if (checkPassword(newPick) == true)
		{
			if (newPick.pick.week == config.week && config.draftPeriod == true)
			{
				var ret = placePick(newPick)
				if (ret == 1)
				{
					res.send('SUCCESS: Added Pick.');
				}
				else if (ret == 2)
				{
					res.send('SUCCESS: Replaced Pick.');
				}
				else
				{
					res.send('FAIL: Cannot place pick.');
				}
			}
			else
			{
				res.send('FAIL: Wrong week or not in draft period');
			}
		}
		else
		{
			res.send('FAIL: Invalid Password');
		}
	}
	else
	{
		res.send('FAIL: Invalid Request');
	}
	
   next();
   
});

var placePick = function(newPick)
{
	for(var i=0; i < players.length; i++)
	{
		console.log("Checking " + players[i].name);
		if (players[i].name == newPick.name)
		{
			for(var w=0; w < players[i].weeks.length; w++)
			{
				if (players[i].weeks[w].week == newPick.pick.week)
				{
					players[i].weeks[w] = newPick.pick;
					fs.writeFileSync("players.json",
						JSON.stringify(players, null, 1),
						"utf8",
						errorProcessing);
					return 2;
				}
			}
			players[i].weeks.push(newPick.pick);
			fs.writeFileSync("players.json",
				JSON.stringify(players, null, 1),
				"utf8",
				errorProcessing);
			return 1;
		}
		
	}
	
	console.log("Cannot place: " + newPick.name + " Week: " + newPick.pick.week);
	return -1;
}

var checkPassword = function(newPick)
{
	var ret = false;
	
	for(var i = 0; i < passwords.length && ret==false; i++)
	{
		if (passwords[i].name == newPick.name && (passwords[i].password == newPick.password || passwords[i].password == ""))
		{
			ret = true;
		}
	}
		 
	return ret;
}

