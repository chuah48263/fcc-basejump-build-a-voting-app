var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

exports.setup = function(User, config) {
	passport.use(new FacebookStrategy({
			clientID: config.facebook.clientID,
			clientSecret: config.facebook.clientSecret,
			callbackURL: config.facebook.callbackURL,
			profileFields: [
				'displayName',
				'emails'
			]
		},
		function(accessToken, refreshToken, profile, done) {
			User.findOne({
					'facebook.id': profile.id
				},
				function(err, user) {
					console.log(profile);
					if (err) {
						return done(err);
					}
					if (!user) {
						user = new User({
							name: profile.emails[0].value.toLowerCase().replace(/@.+/, ''),
							email: profile.emails[0].value.toLowerCase(),
							role: 'user',
							provider: 'facebook',
							facebook: profile._json
						});
						user.save(function(err) {
							if (err) {
								// console.log(err);
								return done(err);
							}
							console.log(user);
							done(err, user);
						});
					} else {
						return done(err, user);
					}
				})
		}
	));
};
