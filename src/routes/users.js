const express = require('express');
const User = require('../models/User');
const passport = require('passport');
const router = express.Router();

router.get('/users/signin', (req, res) => {
    if (req.user) {
        res.redirect('/');
    } else {
        res.render('users/signin');
    }
});

router.post('/users/signin', passport.authenticate('local', {
    successRedirect: '/notes',
    failureRedirect: '/users/signin',
    failureFlash: true
}));

router.get('/users/signup', (req, res) => {
    if (req.user) {
        res.redirect('/');
    } else {
        res.render('users/signup');
    }
});

router.post('/users/signup', async (req, res) => {
    const { name, email, password, confirm_password } = req.body;
    const emailUser = await User.findOne({ email: email });
    const errors = [];
    if (password != confirm_password) {
        errors.push({ text: 'Passwords do not match.' });
    }
    if (password.length < 4) {
        errors.push({ text: 'Password must have at least 4 characters.' });
    }
    if (emailUser) {
        errors.push({ text: 'The email is already in use.' });
    }
    if (!email || !name) {
        errors.push({ text: 'Please fill all the blanks.' })
    }
    if (errors.length > 0) {
        res.render('users/signup', {
            errors,
            name,
            email
        });
    } else {
        const newUser = new User({ name, email, password });
        newUser.password = await newUser.encryptPassword(password);
        await newUser.save();
        req.flash('success_msg', 'Congratulations, now you have an account.');
        res.redirect('/users/signin');
    }
});

router.get('/users/logout', (req, res) => {
    req.logOut();
    res.redirect('/');
})

module.exports = router;