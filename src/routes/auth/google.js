const passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const {User,Product,Order,Membership,Purchase} = require('../DatabaseSchema.js');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, cb) {
    
    User.findOrCreate({ 'email':  profile.emails[0].value },{
        'googleId' : profile.id,
        'name' : profile.displayName,
        'image' : profile.photos?.[0]?.value 
    }, function (err, user) {
        
      return cb(err, user);
    });
  }
));