const mongoose = require('mongoose');
let userSchema = new mongoose.Schema({
  name: String,
  pwd: String,
  karma: {type: Number, min: 0}
});


let postSchema = new mongoose.Schema({
  title: { type: String, required: true},
  text: { type: String, required: true},
  userId: {type: mongoose.Schema.Types.ObjectId, ref: "User"}
});



module.exports = {
  userSchema: userSchema,
  postSchema: postSchema
};


