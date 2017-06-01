module.exports = function (accessToken, refreshToken, profile, expires_in, done) {
  profile.accessToken = accessToken;
  done(null, profile);
};
