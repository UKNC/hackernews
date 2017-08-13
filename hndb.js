const mongoose = require('mongoose');
let userSchema = new mongoose.Schema({
  name: { type: String, index: {unique: true}, required: true },
  pwdhash: { type: String, required: true },
  karma: {type: Number, min: 0}
}, {timestamps: true});


let postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  text: { type: String, required: true },
  voters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User"}],
  points: { type: Number, default: 0 }, // size of voters array
  userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true}
}, {timestamps: true});



module.exports = {
  userSchema: userSchema,
  postSchema: postSchema
};


