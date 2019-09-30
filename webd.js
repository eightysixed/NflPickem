var express = require("express");
var router = express.Router();
var http = require('http');
var fs = require('fs');
var bodyParser = require('body-parser');
//var nodemailer = require('nodemailer');



var webRoot = "./";
var port = 8080;

var passwords = null;
var config = null;
var players = null;
var transporter = null;

var endPhrases = new Array(
	"I think I have been hacked.  Those can't possibly be your choices.  Someone must really wants to put a joke on you to submit these to your name!",
	"I am looking at these choices and I cannot stop laughing!!!",
	"Maybe next year you should enroll in a badminton Pickem!!",
	"Based on these choices, I wouldn't watch TV on Sunday if I were you...",
	"You can change these picks until Thursday noon.  I strongly recommend that you do!",
	"Mppffffftttt, mppffffftttt, mppffffftttt  POUHAHAHAHAHAHAAHA!!!!!  Those are f-u-n-n-y!!!!!\nThank you for that, my day was boring so far.",
	"Are you picking your teams because you like their shirt color?  Sure looks like it...",
	"Reminder, the goal of this game is to finish on top.  Looking at your picks, I figured you didn't know that.",
	"You could at least make the effort of looking at the screen while making your picks!",
	"I hope you at least have a great personality...",
	"If your place in society was based based on these choices, you would have to go to jail.  These are a crime against football!!!!!!",
	"Up until now the worst decision in gambling history was made by Pete Rose, you sadly beat him by a long stretch!",
	"Maybe I should make an 'Insta-pick' feature just for you...",
	"Geeeeeese... If you don't want to play anymore, just quit!",
	"You are lucky my 'Rejected for stupidity' feature is not yet implemented."

);

var endPhrasesPerso = [
//	{ 		
//		name: "Jean-Francois",
//		phrases: ["Criss pourtant cette année t'as tes deux jambes?  C'est quoi ton excuse!?!?"]
//		phrases: ["Tabarnak.... C'est pas comme ça que tu vas sortir de la cave du classement! "]
//	},
//	{ 
//		name: "Andre Charette",
//		phrases : ["Avec des choix comme ça, moi aussi j'irais me cacher sur un bateau de croisière à la fin de l'année!  Ce n'est pas que tu le mérites mais ça va te permettre de te faire oublier un peu..."]
//		phrases: ["Simonac, vas-tu avoir besoin d'un technical manual pour comprendre comment ca marche!?!?! Je connais quelqu'un qui en écrit des bons!"]
//	},
//	{ 
//		name: "Kevin Ranger",
//		phrases: ["Admit that all those test equipments are not used to test the modems but to help you in your picks!?!?!"]
//	},
//	{
//		name: "Pascale Paulin",
//		phrases: ["(Avec l'air de Vive le vent!) Clavicule, clavicule, clavicule petée. Aaron a mal, Les Packs sont out, y'a pas d'playoffs c't'année!"]
//		phrases: ["Y'a tellement d'hommes qui connaissent le football dans ton entourage, tu devrais définitivement les consulter avec de faire tes choix!"]
//		phrases: ["C'est ca tes choix!?!?!  Tu dois vraiment manquer de sommeil!  Reste couché le matin..."]
//		phrases: ["Moi qui me disais qu'en allant voir une game live tu finirais par comprendre la game.  Tu devais être trop saoule..."]
//	},
//	{
//		name: "Ted Knowles",
//		phrases : ["After seeing the game that close, I tought you would finally understand it.  I guess I was wrong!"]
//	},
	{
		name: "Dede",
		phrases : ["Wow! Quels choix!  Tu es sur le point d'être le premier pooleur à être intronisé au temple de la renommé du football!"]
	},
	{
//		name: "Ariane",
//		phrases : ["Au moins cette année tu n'es pas toute seule dans la cave..."]
//		phrases : ["Aaaaaa le confort de la cave du classement, avec ces choix on dirait que tu y encore cette saison!  Je suis tellement content de renouer avec toi!"]
//		phrases : ["Fa que..... Tu trouves que je ne me renouvelle pas assez?  Messemble que si je regarde le classement, ça fait un p'tit boute que tu n'as pas RENOUVELLÉ ta position!!! Un sérieux cas du chaudron qui se moque de la poêle!"]
	},
/*	{
		name: "M-A Leblanc",
		phrases : ["Tes choix semblent être basés sur les résultats de 10 ans passés.  J'imagine que vous venez de recevoir le journal de Montréal de 2007 à St-Zotique!?!?!"]
	},

//	{
//		name: "Genevieve",
//		phrases : ["Tout ce temps d'analyse pour si peu de points...  On t'appellera pas Capitaine Efficacité!"]
//		phrases : ["J'espere que ta progeniture, n'a pas herite de ton talent d'analyste!"]
//		phrases : ["Ok Maxime tu peux arrêter de niasier!  Je sais que c'est toi!!!  (Junior Duguay en 2ieme position, c'est pas crédible...)"]
	},

	{
		name: "Jacques Sr. Duguay",
		phrases : ["Je pensais qu'avec l'age venait la sagesse.  Pauvre toi, il ne te reste pas grand chose."]
	},
	{
		name: "Marc-Andre Castonguay",
		phrases : ["La bible dit: Le derniers seront les premiers.  Toi tu appliques le contraire..."]
	},
*/
//	{
//		name : "Gabriel Duguay",
//		phrases : ["Pauvre nouveau, On m'avait dit que tu étais mauvais mais je ne pensais pas pas que c'était si pire que ça!",
//		           "Je vois que les anciens se sont trouvés un 10$ facile...",
//		           "Je ne sais pas si c'est la moustache que coupe le sang au cerveau mais se sont les choix les plus cave que j'ai vu depuis longtemps!"
//		          ]
//	},
//	{
//		name: "Emilie Daigle",
//		phrases : ["Criss, tes choix de pool sont presqu'aussi pire que ton choix de chum!  La saison va etre loooooongue...."]
//		phrases : ["Arrête de copier sur ton chum, tu vois ben qu'il ne connait rien!"]
//	},
//	{
//		name : "David Robert",
//		phrases : ["Je vois que les anciens se sont trouvés un 10$ facile..."
//
//		          ]
//	},
	{
		name : "Andre Charette",
		phrases : ["C'est ça ton choix de match désigné!?!!?  Iiiiiiishhhh.....  Tu as jusqu'à jeudi pour y repenser!"]
	},
//	{
//		name : "Sebastien Leblanc",
//		phrases : ["Encore cette semaine, tu n'as pas trouvé les bonnes équipes...  Mais comme tu n'as pas réussi à trouver le Mont Orford, ce n'est pas surprenant..."]
//	},
	{
		name: "Andre Claude",
		phrases : ["Wow! Look at those choices!  You'll probably be the firt Pickem player to be inducted in the football Hall of Fame!!"]
	}
];


//A sample GET request    
router.route("/stats").get(function(req, res) {
	debug("Got a GET request");
    res.send(fs.readFileSync("results.json", "utf8"));
});    

//A sample POST request
router.route("/results").post(function(req, res, next) {
	debug("Got POST Data " + req.body);
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
		debug('The "data to append" was appended to file!');
	}
}

var expressServer = app.listen(port,function()
{
	debug("Parsing password");
	var passwordsString = fs.readFileSync("password.json");
	passwords = JSON.parse(passwordsString);
	// Verify that the admin info is present
	if (passwords[0].name != "admin" || passwords[0].password == undefined)
	{
		debug("Invalid password file, admin info not present");
		process.exit(1);
	}
	debug("Parsing config");
	var configString = fs.readFileSync("config.json");
	config = JSON.parse(configString);
	var playersString = fs.readFileSync("players.json");
	players = JSON.parse(playersString);
	debug("Express Started");
	//debug ("Configuring Email Service");
	//var emailString = fs.readFileSync("emailconfig.json");
	//emailConfig = JSON.parse(emailString);

	//transporter = nodemailer.createTransport({
	//  service: emailConfig.service,
	//  auth: {
	//	 user: emailConfig.user,
	//	 pass: emailConfig.password
	//  }
	//});

});





/*
var handleRequest = function(request, response)
{

    try 
	{
        //log the request on console
        //Disptach
        dispatcher.dispatch(request, response);
   } 
	catch(err) 
	{
	}
}
var server = http.createServer(handleRequest);
server.listen(8080, "apaulinlaptop");



*/

router.route("/login/:type/:arg1").post(function(req, res, next) 															 
{
	debug("Login attempt " + req.body);
	var newLoginString = req.body;
	var newLoginObj = JSON.parse(newLoginString);
	debug(newLoginObj.name + " : " + newLoginObj.password);
	
	var playersString = fs.readFileSync("players.json", "utf8");
	var playersObj = new Object();
	playersObj.picks = JSON.parse(playersString);
	if (checkPassword(newLoginObj) != true)
	{
		playersObj = new Object();
		playersObj.returnCode = "WRONg PASSWORD";
	}
	else
	{
		for(var p = 0; p < playersObj.picks.length; p++)
		{
			for(var w=0; w < playersObj.picks[p].weeks.length; w++)
			{
				//debug("Checking for " + newLoginObj.name + " : " + playersObj.picks[p].name + " : " + w  + " : " + config.week);
				if ((newLoginObj.name != playersObj.picks[p].name && w > (config.week-1)) ||
					(newLoginObj.name != playersObj.picks[p].name && w == (config.week-1) && config.draftPeriod == "true"))
				{
					//debug("Removing week " + (w+1) + " for " +  newLoginObj.name);
					playersObj.picks[p].weeks[w].pick5 = "";
					playersObj.picks[p].weeks[w].pick4 = "";
					playersObj.picks[p].weeks[w].pick3 = "";
					playersObj.picks[p].weeks[w].pick2 = "";
					playersObj.picks[p].weeks[w].pick1 = "";
					playersObj.picks[p].weeks[w].designatedMatchUp = "";
				}
				
			}
		}
		debug("Return Code = OK");
		playersObj.returnCode = "OK";
	}
    res.send(JSON.stringify(playersObj, null, 2));
});


router.route("/getplayers/:type/:arg1").get(function(req, res, next) 															 
{
	//debug("GET Players");
	var playersString = fs.readFileSync("players.json", "utf8");
	var playersObj = JSON.parse(playersString);
	if (config.draftPeriod == "true")
	{
		for(var p = 0; p < playersObj.length; p++)
		{
			for(var w=0; w < playersObj[p].weeks.length; w++)
			{
				//debug("Cleaning up player " + playersObj[p].name + " : week " + w);
				playersObj[p].weeks[w].pick5 = "";
				playersObj[p].weeks[w].pick4 = "";
				playersObj[p].weeks[w].pick3 = "";
				playersObj[p].weeks[w].pick2 = "";
				playersObj[p].weeks[w].pick1 = "";
				playersObj[p].weeks[w].designatedMatchUp = "";
			}
		}
	}
    res.send(JSON.stringify(playersObj, null, 2));
});

router.route("/getseason/:type/:arg1").get(function(req, res, next) 															 
{
	//debug("GET Players");
	var seasonString = fs.readFileSync("season.json", "utf8");
	var seasonObj = JSON.parse(seasonString);
   res.send(JSON.stringify(seasonObj, null, 2));
});
								
router.route("/changeconfig/:type/:arg1").post(function(req, res, next) 
{
	var newConfigString = req.body;
	var newConfigObj = JSON.parse(newConfigString);
	debug((new Date()).toString() + ": Changing Config " + newConfigString);

	if (newConfigObj != null)
	{
		if (newConfigObj.password == passwords[0].password)
		{
			if (newConfigObj.config.week != undefined && newConfigObj.config.draftPeriod != undefined)
			{
				config = newConfigObj.config;
				fs.writeFileSync("config.json",
					JSON.stringify(config, null, 1),
					"utf8",
					errorProcessing);
				
				res.send('SUCCESS: Config changed.');
				
			}
			else
			{
				res.send('FAIL: missing info');
			}
		}
		else
		{
			res.send('FAIL: Wrong password');
		}
	}
   next();
});
															 
router.route("/changeseason/:type/:arg1").post(function(req, res, next) 
{
	var newSeasonString = req.body;
	var newSeasonObj = JSON.parse(newSeasonString);

	if (newSeasonObj != null)
	{
		if (newSeasonObj.password == passwords[0].password)
		{
			season = newSeasonObj.season;
			var ret = validateSeason(season);
			if (ret == true)
			{
				fs.writeFileSync("season.json",
					JSON.stringify(season, null, 1),
					"utf8",
					errorProcessing);
				
				res.send('SUCCESS: Season changed.');
			}
			else
			{
				res.send("Wrong season format " + JSON.stringify(season, null, 2));
			}
				
		}
		else
		{
			res.send('FAIL: Wrong password');
		}
	}
   next();
});

router.route("/changeresults/:type/:arg1").post(function(req, res, next) 
{
	var newResultsString = req.body;
	var newResultsObj = JSON.parse(newResultsString);
	//debug((new Date()).toString() + ": Changing Result " + newResultsString);

	if (newResultsObj != null)
	{
		if (newResultsObj.password == passwords[0].password)
		{
			if (newResultsObj.results != undefined && newResultsObj.results != "")
			{
				fs.writeFileSync("results.js",
					newResultsObj.results,
					"utf8",
					errorProcessing);
				
				res.send('SUCCESS: Results changed.');
				
			}
			else
			{
				res.send('FAIL: missing info');
			}
		}
		else
		{
			res.send('FAIL: Wrong password');
		}
	}
   next();
});
															 
router.route("/submitPicks/:type/:arg1").post(function(req, res, next) 
{
	debug(req.body);
	var newPick = JSON.parse(req.body);
	if (newPick != null)
	{
		if (checkPassword(newPick) == true)
		{
			var ret = placePick(newPick)
			var emailbody = "The picks were received from " + newPick.name + ": \n" + "\n\n";
			emailbody += findEndPhrase(newPick.name);
			
			if (ret == 1)
			{
				//sendEmail(newPick, 1);
				debug('SUCCESS: Added Pick.\n' + emailbody);
				res.send('SUCCESS: Added Pick.\n' + emailbody);
			}
			else if (ret == 2)
			{
				//sendEmail(newPick, 2);
				debug('SUCCESS: Replaced Pick.\n' + emailbody);
				res.send('SUCCESS: Replaced Pick.\n' + emailbody);
			}
			else
			{
				debug('FAIL: Cannot place pick.');
				res.send('FAIL: Cannot place pick.');
			}
		}
		else
		{
			debug('FAIL: Invalid Password');
			res.send('FAIL: Invalid Password');
		}
	}
	else
	{
		debug('FAIL: Invalid Request');
		res.send('FAIL: Invalid Request');
	}
	
   next();
   
});

var placePick = function(newPick)
{
	debug("Placing new pick: \n" + JSON.stringify(newPick, null, 2));
	for(var i=0; i < players.length; i++)
	{
		if (players[i].name == newPick.name && players[i].password == newPick.password)
		{
			players[i].weeks = newPick.weeks;
			fs.writeFileSync("players.json",
				JSON.stringify(players, null, 1),
				"utf8",
				errorProcessing);
			return 2;
		}
		
	}
	
	debug("Cannot place: " + newPick.name + " Week: " + newPick.pick.week);
	return -1;
}

var checkPassword = function(loginInfo)
{
	var ret = false;

	var playersString = fs.readFileSync("players.json", "utf8");
	var playersObj = JSON.parse(playersString);
	for(var p = 0; p < playersObj.length && ret == false; p++)
	{
		if(loginInfo.name == playersObj[p].name && loginInfo.password == playersObj[p].password)
		{
			debug("Comparing " + loginInfo.password + " : " +  playersObj[p].password);
			debug("Found it");
			ret = true;
		}
	}
		 
	return ret;
}



var sendEmail = function(newPick, retCode)
{
	var ret = false;
	for(var i = 0; i < passwords.length && ret==false; i++)
	{
		if (passwords[i].name == newPick.name && passwords[i].email != undefined && passwords[i].email != "")
		{
			var emailbody = "The following picks were received : \n" + newPick.pick + "\n\n" + endPhrases[Math.floor(Math.random() * endPhrases.length)] + "\n\nThe WebServer";
			var mailOptions = {
			  from: emailConfig.use,
			  to: passwords[i].email,
			  subject: "NFL Pickem Week " + config.week + ". Your pick were received.",
			  text: emailbody
			};

			transporter.sendMail(mailOptions, function(error, info){
			  if (error) {
				 debug(error);
			  } else {
				 debug('Email sent: ' + info.response);
			  }
			});			
			ret = true;
		}
	}
	
	return ret;
	
}

var validateSeason = function(s)
{
	var ret = true;
	
	if (s.length != 17)
	{
		ret = false;
	}
	else
	{
		for (var i = 0; i < s.length && ret == true; i++)
		{
			if (s[i].matchups.length <= 10)
			{
				ret = false;
				debug ("Not enough game in week " + (i+1)); 
			}
			else if (s[i].bye == undefined)
			{
				ret = false;
				debug ("No bye member in week " + (i+1));
			}
			else if (s[i].designatedMatchUp == undefined)
			{
				ret = false;
				debug ("No designatedMatchUp member in week " + (i+1));
			}
		}
	}
	
	
	return ret;
}

var findEndPhrase = function(name)
{
	var ret =  endPhrases[Math.floor(Math.random() * endPhrases.length)];
	
	for(var i=0; i < endPhrasesPerso.length; i++)
	{
		if (endPhrasesPerso[i].name == name)
		{
			var phrases = endPhrasesPerso[i].phrases
			ret = phrases[Math.floor(Math.random() * phrases.length)];
		}
	}
	ret +=  "\n\nThe WebServer";
	
	return ret;
}

var debug = function(str)
{
	console.log("----- " + (new Date()).toString() + " ----");
	console.log(str);
}
