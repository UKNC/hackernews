const app             = require('express')();
const bodyParser      = require('body-parser');
const mongoose        = require('mongoose');
const cookieParser    = require('cookie-parser');
const session         = require('express-session');
mongoose.Promise      = require('bluebird');
const hndb            = require('./hndb');

const passport        = require('passport');

/* Http digest auth 
const DigestStrategy  = require('passport-http').DigestStrategy;
*/

const LocalStrategy   = require('passport-local').Strategy;

let userModel, postModel;


/* Http digest auth
 * curl -vv --user test:testpass --digest -H "Content-type: application/json" -X POST -d '{"title":"my title", "text":"test"}' http://localhost:8080/submit
 
passport.use( new DigestStrategy( 
  { qop: "auth" }, 
  function( username, cb ) {
    console.log(`got user: ${username}`);
    cb( null, username, 'testpass' );
  })
);
*/

let testUser = {
  id: 1244,
  name: 'pizdec'
};

passport.use( new LocalStrategy( function( username, password, cb) {
  console.log(`Local auth`);
  return cb(null, testUser );
}));

passport.serializeUser( (user, cb)=>{
  cb(null, user.id);
});

passport.deserializeUser( (id, cb)=>{
  cb(null, testUser );
});


app.use( bodyParser.json());
app.use( bodyParser.urlencoded({extended: true}) );
app.use( session( { secret: 'nanit', resave: false, saveUninitialized: false } ) );
app.use( passport.initialize() );
app.use( passport.session() );

const ConnStr     = "mongodb://localhost/hn";
const APP_PORT    = 8080;

app.post('/login', passport.authenticate('local'), (req,res)=>{
  res.end();
});

//app.post('/submit', passport.authenticate('digest', { session: false }), (req,res)=>{
app.post('/submit', (req,res)=>{
  (async function() {
    try {
      await post.create( req.body );
      console.log(`Wrote to db: ${JSON.stringify( req.body )}`);
      res.status(200).end();
    }
    catch( err ) {
      console.log(`Got err: ${err.message}`);
      res.status('500').end();
    }
  })();    
});

app.put('/edit', (req,res)=>{
  let pid = req.query.id;
  res.send('ok'); 
           
});

app.get('/newest', (req,res)=>{
  
});


mongoose
.connect(ConnStr, { useMongoClient: true })
.then( db=>{
  userModel = db.model('user', hndb.userSchema );
  postModel = db.model('post', hndb.postSchema );
  app.listen(APP_PORT);
  console.log(`Listening on ${APP_PORT}`);
})
.catch(err=>{
  console.log(`Catched err: ${err.message}`);
});
