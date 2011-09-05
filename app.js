var express = require('express'),
	app = express.createServer(),
	http = require('http'),
	connect = require('connect'),
	redis = require('connect-redis')(express),
	everyauth = require('everyauth'),
	config = require('./lib/config'),
	sesh = new redis(),
	//ghClient = http.createClient(80, 'https://api.github.com');
	ghClient = http.createClient(80, 'github.com');

everyauth.github
  .appId(config.gh_clientId)
  .appSecret(config.gh_secret)
  .findOrCreateUser( function (session, accessToken, accessTokenExtra, githubUserMetadata) {
    // find or create user logic goes here
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
    	//request = ghClient.request('GET', '/users/' + req.session.uid + '/repos?access_token=' + req.session.oauth, {"host":"https://api.github.com"});
    	request = ghClient.request('GET', '/api/v2/json/repos/show/' + req.session.uid, {"host":"github.com"});
    request.addListener("response", function(response) { 
    	var data = "";
        response.addListener("data", function(d) {
            data += d; 
        });
        response.addListener("end", function() { 
        	repos = JSON.parse(data); 
			res.render('board',{username: req.session.uid, repos: repos.repositories});
        });
    });
    request.end();
});


app.listen(process.env.PORT || 8001);