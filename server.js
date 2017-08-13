const app             = require('express')();
const bodyParser      = require('body-parser');
const mongoose        = require('mongoose');
const bcrypt          = require('bcrypt');
mongoose.Promise      = require('bluebird');
const hndb            = require('./hndb');


const passport        = require('passport');
const BasicStrategy   = require('passport-http').BasicStrategy;

process.on('uncaughtException', err=>{
  console.log(`From process: ${err}`);
});

let User, Post;

passport.use( new BasicStrategy( (username, password, cb)=>{
  (async function() {
    try {
      let user = await User.findOne({name: username});
      if ( !user ) 
        return cb(null, false );
      let isEq = await bcrypt.compare( password, user.pwdhash );
      cb( null, isEq ? user: false );
    }

    catch( err ) {
      cb(err);
    }
  })();

}));


app.use( bodyParser.json());

const ConnStr     = "mongodb://mongodb/hn";
//const ConnStr       = "mongodb://localhost/hn";
const APP_PORT      = 8080;

app.post('/signup', (req,res)=>{
  (async function() {
    try {
      let { password: pwd, username: name }  = req.body;
      if ( pwd && pwd.length < 8 ) 
        return res.json( { status: false, result: 'password should be at least 8 chars'});
      if ( name && name.length < 4 ) 
        return res.json( { status: false, result: 'username should be at least 4 chars'});
      let pwdhash = await bcrypt.hash( pwd, 10 );
      let result = await User.create( { name: name, pwdhash: pwdhash } );
      res.json( { status: true, result: result} );
    }
    catch(err) {
      res.json({ status: false, result: err.message} );
    } 
  })();
  
});

app.post('/submit', passport.authenticate('basic', { session: false }), (req,res)=>{
  (async function() {
    try {
      let post = {
        title:  req.body.title,
        text:   req.body.text,
        userId: req.user._id
      };

      let result = await Post.create(post);
      res.json( {status: true, result: result });
    }
    catch( err ) {
      res.json( {status: false, result: err.message} );
    }
  })();    
});

app.put('/edit', passport.authenticate('basic', { session: false }), (req,res)=>{

  (async function() {
    try {
      let id      = req.body.id;
      let text    = req.body.text; 
      let result  = await Post.findByIdAndUpdate( id, { text: text } );
      res.json( {status: true, result: result});
    }
    catch( err ) {
      res.json( {status: false, result: err.message });
    }
  })();

});

mongoose
.connect(ConnStr, { useMongoClient: true })
.then( db=>{
  User = db.model('User', hndb.userSchema );
  Post = db.model('Post', hndb.postSchema );
  app.listen(APP_PORT);
  console.log(`Listening on ${APP_PORT}`);
})
.catch(err=>{
  console.log(`Catched err: ${err.message}`);
});
