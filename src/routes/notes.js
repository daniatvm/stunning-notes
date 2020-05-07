const express = require('express');
const Note = require('../models/Note');
const {isAuthenticated} = require('../helpers/auth');
const router = express.Router();

router.get('/notes', isAuthenticated, async (req, res) => {
    const notes = await Note.find({user:req.user.id}).sort({ date: 'desc' }).lean();
    const name = req.user.name;
    res.render('notes/all-notes', { notes, name });
});

router.get('/notes/add', isAuthenticated, (req, res) => {
    res.render('notes/new-note');
});

router.post('/notes/new-note', isAuthenticated, async (req, res) => {
    const { title, description } = req.body;
    const errors = [];
    if (!title) {
        errors.push({ text: 'Please write a Title' });
    }
    if (!description) {
        errors.push({ text: 'Please write a Description' });
    }
    if (errors.length > 0) {
        res.render('notes/new-note', {
            errors,
            title,
            description
        });
    } else {
        const newNote = new Note({ title, description });
        newNote.user = req.user.id;
        await newNote.save();
        req.flash('success_msg', 'Note Added Successfully');
        res.redirect('/notes');
    }
});

router.get('/notes/edit/:id', isAuthenticated, async (req, res) => {
    const note = await Note.findById(req.params.id).lean();
    res.render('notes/edit-note', { note });
});

router.put('/notes/edit-note/:id', isAuthenticated, async (req, res) => {
    const { title, description } = req.body;
    let errors = 0;
    if ((!title) || (!description)) {
        req.flash('error_msg', 'Uh oh, we can not save a note with blank spaces');
        errors = 1;
        res.redirect('/notes/edit/'+req.params.id);
    } else {
        await Note.findByIdAndUpdate(req.params.id, { title, description });
        req.flash('success_msg', 'Note Updateted Successfully');
        res.redirect('/notes');
    }
});

router.delete('/notes/delete/:id', isAuthenticated, async (req, res) => {
    await Note.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Note Deleted Successfully')
    res.redirect('/notes');
});

module.exports = router;