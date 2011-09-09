var express = require('express'),
	app = express.createServer(),
	http = require('http'),
	https = require('https'),
	connect = require('connect'),
	redis = require('connect-redis')(express),
	everyauth = require('everyauth'),
	config = require('./lib/config'),
	sesh = new redis();
	//ghClient = http.createClient(80, 'github.com');

everyauth.github
  .appId(config.gh_clientId)
  .appSecret(config.gh_secret)
  .findOrCreateUser( function (session, accessToken, accessTokenExtra, githubUserMetadata) {
    // find or create user logic goes here
    session.oauth = accessToken;
    return session.uid = githubUserMetadata.login;
  })
  .redirectPath('/');
 everyauth.everymodule.handleLogout( function (req, res) {
  req.logout(); 
  req.session.uid = null;
  res.writeHead(303, { 'Location': this.logoutRedirectPath() });
  res.end();
});


app.configure(function(){
    app.set('view engine', 'html');
  	app.register('.html', require('jqtpl').express);
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({store: sesh, secret: config.redis_secret}));
    app.use(everyauth.middleware());
});
 
app.get('/',function(req,res) {
	if (req.session && req.session.uid) {
	    return res.redirect('/board');
	}
	res.render('login');
});

app.get('/board',function(req,res) {
	if (!req.session.uid) {
        return res.redirect('/');
    }
    var repos, 
    	/*request = ghClient.request('GET', '/users/' + req.session.uid + '/repos?access_token=' + req.session.oauth, {"host":"https://api.github.com"});
    	//request = ghClient.request('GET', '/api/v2/json/repos/show/' + req.session.uid, {"host":"github.com"});
    request.addListener("response", function(response) { 
    	var data = "";
        response.addListener("data", function(d) {
            data += d; 
        });
        response.addListener("end", function() { 
        	repos = JSON.parse(data); 
			res.render('board',{username: req.session.uid, repos: repos.repositories});
        });
    });*/
	    opts = {
				host: "api.github.com",
				path: '/user/repos?access_token=' + req.session.oauth,
				method: "GET"
			},
    	request = https.request(opts, function(resp) {
    		var data = "";
    		resp.setEncoding('utf8');
			resp.on('data', function (chunk) {
				data += chunk;
			});
			resp.on('end', function () {
				repos = JSON.parse(data); 
				res.render('board',{username: req.session.uid, repos: repos});
			});
    	});

    request.end();


});

app.get('/auth', function(req, res) {
	var opts = {
			host: "github.com",
			path: "/login/oauth/authorize?redirect_uri=http://local.host:8001/github&client_id=" + config.gh_clientId,
			port: 443
		},
		request = https.get(opts).on('error', function(res) {
			console.log(res.message);
		});
		console.log("attempting auth");
});

app.get('/github', function(req, res) {
	console.log("auth callback");
	var token,
		data = querystring.stringify({
			"client_id": config.gh_clientId,
			"client_secret": config.gh_secret,
			"code": req.query["code"]
		}),
		opts = {
			host: "https://api.github.com",
			path: "/login/oauth/access_token",
			method: "POST",
			headers: {
	          'Content-Type': 'application/x-www-form-urlencoded',
	          'Content-Length': data.length
	      	}
		},
		request = https.request(opts, function(res) {
			res.setEncoding('utf8');
			res.on('data', function (chunk) {
				token = req.session.oauth = JSON.parse(chunk).access_token;
				var opts2 = {
					host: "https://api.github.com",
					path: "/user?access_token=" + token,
					method: "GET"
				},
				request2 = http.request(opts2, function(res2) {
					req.session.uid = JSON.parse(res2).login;
				});
				request2.end();

			});
		});
		request.write(data);
		request.end();
		return res.redirect('/board');
});


app.listen(process.env.PORT || 8001);