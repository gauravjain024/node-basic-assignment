var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/nodeassigndb', {useNewUrlParser: true});
var state = {
  db: null,
}
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  state.db = true;
  console.log("we are Connected");
});


/* 
exports.get = function() {
  return state.db
} */

module.exports = db;
//var db = require('../db')

//Collections
/**
 * user_profiles
 * leader_profiles
 * leader_works
 * complaints
 * vidhansabha_details 
 * 
 */
/* 
db.connect(function(err) {
  if (err) {
    console.log(err);
    console.log('Unable to connect to Mongo.')
  } else {
    console.log('Connect to Mongo : Successfull');
    db.close(function(err){
        //console.log(err);
    });
  }
})
 */




