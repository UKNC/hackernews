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

passport.use( new BasicStrategy( async (username, password, cb)=>{
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

}));


app.use( bodyParser.json());

//const ConnStr     = "mongodb://mongodb/hn";
const ConnStr       = "mongodb://localhost/hn";
const APP_PORT      = 8080;

app.post('/signup', async (req,res)=>{
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
});

app.post('/submit', passport.authenticate('basic', { session: false }), async (req,res)=>{
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
});

app.put('/edit', passport.authenticate('basic', { session: false }), async (req,res)=>{
  try {
    let id      = req.body.id;
    let text    = req.body.text; 
    let result  = await Post.findByIdAndUpdate( id, { text: text } );
    res.json( {status: true, result: result});
  }
  catch( err ) {
    res.json( {status: false, result: err.message });
  }
});

app.post('/vote', passport.authenticate('basic', { session: false}), async (req,res)=>{
  try {
    let id      = req.body.id;
    let userId  = req.user._id;
    let up      = req.body.up ? true : false; // upvoting or downvoting
    let result;
    if ( up ) {
      result = await Post.findOneAndUpdate({_id: id}, {$addToSet: { voters: userId }}, {"new":true} );
    }
    else {
      result = await Post.findOneAndUpdate({_id: id}, {$pull: { voters: userId } }, {"new": true} );
    }
    result = await Post.findOneAndUpdate( {_id: id}, { $set: { points: result.voters.length }}, {"new": true} );
    res.json( {status: true, result: result});
  }
  catch( err ) {
    res.json({status: false, result: err.message});
  }
  
});

app.get('/newest', async (req,res)=>{
  const MaxPosts = 32;
  try {
    let n = parseInt( req.query.n );
    if ( isNaN(n) ) 
      n = MaxPosts;

    let last = req.query.last; // last post id
         
    const cursor = await Post.find({}).sort( {updatedAt: -1, points: -1} ).cursor();
    let result = [];
    let fStarted = last ? false : true; // if last post id is unspecified, start collect posts in result right now
    let post = await cursor.next();

    let loop = 0;
    while ( post ) {
      if ( fStarted === false ) {
        if ( last == post._id.toString() ) 
          fStarted = true;
      }
      else {
        if ( result.length < n ) {
          result.push( post );
        }
      }

      post = await cursor.next();
    }
    res.json( {status: true, result: result });

  }
  catch( err ) {
    res.json({ status: false, result: err.message});
  }
  
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
