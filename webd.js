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
	
	//var playerString =  fs.readFileSync("players.json");
	
	
	
	////////
/*	if (req.params.type == "newFeature" || req.params.type == "updateFeature")
	{
		var tesPlanString =  fs.readFileSync("./data/testPlans/testPlans.json");
		var testPlans = JSON.parse(tesPlanString);
		var testPlan = null;
		var newFeatures = JSON.parse(req.body);
		
		debug("Test Plan File contains " + testPlans.length + " test plan.");
		
		if (newFeatures.testPlanId < 3)
		{
			debug("\tToken is valid.");
			/*fs.writeFileSync("./data/testPlans/testPlans.json",
				req.body, 
				"utf8",
				errorProcessing);
			*/
/*			res.send('Test Plan Closed.  Not change possible.');
		}
		else
		{
			for(var i = 0 ; i < testPlans.length && testPlan == null; i++)
			{
				debug("Looking for " + i);
				if (testPlans[i].id == newFeatures.testPlanId)
				{
					testPlan = testPlans[i];
				}					
			}
			
			if (testPlan != null && req.params.type == "newFeature")
			{
				for(var nt = 0; nt < newFeatures.features.length; nt++)
				{
					var featureExist = false;
					for(var featureCounter = 0; featureCounter < testPlan.features.length; featureCounter++)
					{
						console.log("New Test " + nt + " feature of testPlan " + testPlan.id + " : " + testPlan.features[featureCounter].id);
						if (testPlan.features[featureCounter].id == newFeatures.features[nt].id)
						{
							featureExist = true;
						}
					}
					if (featureExist == false)
					{
						var newFeatureObj = new Object();
						newFeatureObj.id = newFeatures.features[nt].id;
						newFeatureObj.priority = newFeatures.features[nt].priority;
						newFeatureObj.testCases = new Array();
						
						testPlan.features.push(newFeatureObj);
					}
				}
				fs.writeFileSync("./data/testPlans/testPlans.json",
					JSON.stringify(testPlans, null, 1),
					"utf8",
					errorProcessing);
				
				res.send('Test Plan Updated.  Success.');
				
			}
			else if (testPlan != null && req.params.type == "updateFeature")
			{
				var featureFound = false;
				debug("Test plan found, looking through " + testPlan.features.length + " features.");
				debug(req.body);
				for (var featureCounter = 0; featureCounter < newFeatures.feature.length; featureCounter++)
				{
					featureFound = false;
					for (var i =0; i < testPlan.features.length && featureFound == false; i++)
					{
						debug("Comparing " + testPlan.features[i].id + " and " + newFeatures.feature[featureCounter].id);
						if (testPlan.features[i].id == newFeatures.feature[featureCounter].id)
						{
							featureFound = true;
							testPlan.features[i] = newFeatures.feature[featureCounter]
						}
					}
					
				}
				if (true)
				{
					fs.writeFileSync("./data/testPlans/testPlans.json",
						JSON.stringify(testPlans, null, 1),
						"utf8",
						errorProcessing);
					
					res.send('Test Plan Updated.  Success.');
				}
				else
				{
					res.send('Feature could not be found. Fail.');
				}
			}
			else
			{
				res.send('Failure could not find test plan ' + newFeatures.testPlanId);
				
			}
			
		}
	}
	else
	{
		debug("Unknown request type");
		res.send('Unknown request type');
	}
*/
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

