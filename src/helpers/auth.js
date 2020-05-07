const helpers = {};

helpers.isAuthenticated = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    }
    req.flash('warning_msg', 'Uh oh, seems like you\'re not logged in.');
    res.redirect('/users/signin');
}

module.exports = helpers;