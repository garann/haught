var express = require('express'),
	app = express.createServer(),
	http = require('http'),
	https = require('https'),
	connect = require('connect'),
	connr = require('connect-redis')(express),
	everyauth = require('everyauth'),
	config = require('./lib/config'),
	sesh = new connr(),
	redis = require('redis'),
	db = redis.createClient(),
	io = require('socket.io').listen(app);

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
	    return res.redirect('/user');
	}
	res.render('login');
});

app.get('/user',function(req,res) {
	if (!req.session.uid) {
        return res.redirect('/');
    }
    var repos,
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
				res.render('user',{username: req.session.uid, repos: repos});
			});
    	});

    request.end();
});

app.get('/board/:owner/:repo', function(req, res) {
	if (!req.session.uid) {
        return res.redirect('/');
    }
    var issues,
	    opts = {
				host: "api.github.com",
				path: '/repos/' + req.params.owner + '/' + req.params.repo + '/issues?access_token=' + req.session.oauth,
				method: "GET"
			},
    	request = https.request(opts, function(resp) {
    		var data = "";
    		resp.setEncoding('utf8');
			resp.on('data', function (chunk) {
				console.log(chunk);
				data += chunk;
			});
			resp.on('end', function () {
				issues = JSON.parse(data); 
				res.render('board',{username: req.session.uid, repo: req.params.repo, issues: issues});
			});
    	});

    request.end();
});

app.listen(process.env.PORT || 8001);