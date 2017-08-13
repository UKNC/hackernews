const rp    = require('request-promise');
const base  = "http://localhost:8080";


console.log(`- Signing up vlad`);
rp({ 
  method: "POST", 
  uri: `${base}/signup`, 
  json: true,
  body: { username: "vlad", password: "vlad2017" }
})

.then( result=>{
  let r = JSON.stringify( result );

  if ( result && result.status === false ) 
    throw new Error(JSON.stringify( r ));
  
  console.log(`result: ${r}`);
  console.log(`- Signing up alex`);
  return rp({
    method: "POST",
    uri: `${base}/signup`,
    json: true,
    body: { username: "alex", password: "alex2017" }
  });
})

.then( result=>{
  
  let r = JSON.stringify( result );

  if ( result && result.status === false ) 
    throw new Error(r);
 
  console.log(`result: ${r}`);
  console.log(`- Submitting message from vlad`); 
  return rp({
    method: "POST",
    uri: `${base}/submit`,
    json: true,
    auth: {
      username: "vlad",
      password: "vlad2017"
    },
    body: { 
      title: "MyFirstPost", 
      text:"Hello from Vlad"
    }
  });
})

.then( result=>{
  let r = JSON.stringify( result );

  if ( result && result.status === false ) 
    throw new Error(r);

  console.log(`result: ${r}`);
  console.log(`Upvoting vlad's post by alex`);
  rp({
    method: "POST",
    uri: `${base}/vote`,
    json: true,
    auth: {
      username: "alex",
      password: "alex2017"
    },
    body: {
      up: 1,
      id: result.result._id
    }
  });
  return result;
})

.then( result=>{
  let r = JSON.stringify( result );

  if ( result && result.status === false ) 
    throw new Error(r);

  console.log(`result: ${r}`);
  console.log(`Upvoting vlad's post by alex again`);

  return rp({
    method: "POST",
    uri: `${base}/vote`,
    json: true,
    auth: {
      username: "alex",
      password: "alex2017"
    },
    body: {
      up: 1,
      id: result.result._id
    }
  });

})

.then( result=>{
  let r = JSON.stringify( result );

  if ( result && result.status === false ) 
    throw new Error(r);

  console.log(`result: ${r}`);
  console.log(`Getting all posts`);

  return rp({
    method: "GET",
    uri: `${base}/newest`,
  });

})

.then( result=>{
  let r = JSON.stringify( result );

  if ( result && result.status === false ) 
    throw new Error(r);

  console.log(`result: ${r}`);
  console.log(`DONE`);
})

.catch( err=>{
  console.log(`Catched error: ${err}`);
});
