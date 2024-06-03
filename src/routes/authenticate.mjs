import { Router } from 'express'
import { User } from '../models/db.mjs'
import passport from 'passport';
import argon2 from 'argon2';
import express from 'express'
import { Strategy as LocalStrategy } from 'passport-local';


const router = Router();
router.use(express.json());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

router.post('/login', function(req,res,next) {
    passport.authenticate('local', function(err,user) {
      if(user) {
        req.logIn(user, function(err) {
          res.status(200).json({data: 'login successful', user : user});
        });
      } else {
        res.status(401).json({error: "incorrect username or password"});
      }
    })(req, res, next);
});


router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            res.status(404).json({ error: 'User already exists', data: null });
        } else {
            User.register(new User({ username }), password, (err, newUser) => {
                if (err) {
                    console.error('Error registering user:', err);
                    return res.status(500).json({ error: 'Internal server error', data: null });
                }
                res.json({ error: null, data: 'User registered successfully' });
            });
        }
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal server error', data: null });
    }
});

router.post('/change-username', async (req, res) => {
    const { newUsername } = req.body;
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        user.username = newUsername;
        await user.save();
        res.json({ error: null, data: 'Username changed successfully' });
    } catch (error) {
        console.error('Error changing username:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.post('/change-password', async (req, res) => {
    const {oldPassword, newPassword } = req.body;
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        await user.changePassword(oldPassword, newPassword);
        await user.save();
        res.json({ error: null, data: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;