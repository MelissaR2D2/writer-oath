const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const express = require("express");
const auth = require("./auth.js");
//const projects = require("./ticket.js")
const router = express.Router();


const SALT_WORK_FACTOR = 10;

//
// Tickets
//

const projectSchema = new mongoose.Schema({
    username: String,
    password: String,
    name: String,
    description: String,
    goal_type: String,
    progress: Number,
    goal: Number,
});

projectSchema.methods.toJSON = function() {
    var obj = this.toObject();
    delete obj.password;
    return obj;
};

const Projects = mongoose.model('Project', projectSchema);



async function deleteProject(req, res) {
    try {
        await Projects.deleteOne({
            _id: req.params.id,
            username: req.params.username,
            password: req.params.password
        });
        return res.sendStatus(200);
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
}

//
// Users
//

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    tokens: [],
    projects: [],

});

userSchema.pre('save', async function(next) {
    // only hash the password if it has been modified (or is new)
    if (!this.isModified('password'))
        return next();

    try {
        // generate a salt
        const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);

        // hash the password along with our new salt
        const hash = await bcrypt.hash(this.password, salt);

        // override the plaintext password with the hashed one
        this.password = hash;
        next();
    }
    catch (error) {
        console.log(error);
        next(error);
    }
});

userSchema.methods.comparePassword = async function(password) {
    try {
        const isMatch = await bcrypt.compare(password, this.password);
        return isMatch;
    }
    catch (error) {
        return false;
    }
};

userSchema.methods.toJSON = function() {
    var obj = this.toObject();
    delete obj.password;
    delete obj.tokens;
    return obj;
};

userSchema.methods.addToken = function(token) {
    this.tokens.push(token);
};

userSchema.methods.removeToken = function(token) {
    this.tokens = this.tokens.filter(t => t != token);
};

userSchema.methods.removeOldTokens = function() {
    this.tokens = auth.removeOldTokens(this.tokens);
};

const User = mongoose.model('User', userSchema);

// create a new user
router.post('/', async(req, res) => {
    if (!req.body.username || !req.body.password)
        return res.status(400).send({
            message: "username and password are required"
        });


    try {

        //  check to see if username already exists
        const existingUser = await User.findOne({
            username: req.body.username
        });
        if (existingUser)
            return res.status(403).send({
                message: "username already exists"
            });

        // create new user
        const user = new User({
            username: req.body.username,
            password: req.body.password
        });
        await user.save();
        login(user, res);
        console.log("past log in");
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
});

// login
router.post('/login', async(req, res) => {
    console.log("logging in");
    if (!req.body.username || !req.body.password)
        return res.sendStatus(400);

    try {
        //  lookup user record
        const existingUser = await User.findOne({
            username: req.body.username
        });
        if (!existingUser)
            return res.status(403).send({
                message: "username or password is wrong"
            });

        // check password
        if (!await existingUser.comparePassword(req.body.password))
            return res.status(403).send({
                message: "username or password is wrong"
            });

        login(existingUser, res);
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
});

// Logout
router.delete("/", auth.verifyToken, async(req, res) => {
    // look up user account
    const user = await User.findOne({
        _id: req.user_id
    });
    if (!user)
        return res.clearCookie('token').status(403).send({
            error: "must login"
        });

    user.removeToken(req.token);
    await user.save();
    res.clearCookie('token');
    res.sendStatus(200);
});

// Get current user if logged in.
router.get('/', auth.verifyToken, async(req, res) => {
    // look up user account
    const user = await User.findOne({
        _id: req.user_id
    });
    if (!user)
        return res.status(403).send({
            error: "must login"
        });

    return res.send(user);
});

//get project
router.get("/userProject/:id", auth.verifyToken, async(req, res) => {
    const user = await User.findOne({ _id: req.user_id });
    req.params.username = user.username;
    req.params.password = user.password;
    let project = await Projects.findOne({ _id: req.params.id, username: req.params.username, password: req.params.password });
    return res.send(project);
});

//create project
router.post('/userProject', auth.verifyToken, async(req, res) => {
    const user = await User.findOne({ _id: req.user_id });
    const project = new Projects({
        username: user.username,
        password: user.password,
        name: req.body.name,
        description: req.body.description,
        goal_type: req.body.goal_type,
        progress: req.body.progress,
        goal: req.body.goal
    });
    console.log(project);
    try {
        await project.save();
        user.projects.push(project._id);
        await user.save();
        console.log(user);
        return res.send(project);
    }
    catch (error) {
        console.log(error);
        return res.status(500).send({
            message: "Invalid input"
        });
    }

});

//edit project
router.put("/userProject/:id", auth.verifyToken, async(req, res) => {
    try {
        const user = await User.findOne({ _id: req.user_id });
        req.params.username = user.username;
        req.params.password = user.password;
        let project = await Projects.findOne({ _id: req.params.id, username: req.params.username, password: req.params.password });
        project.name = req.body.name;
        project.description = req.body.description,
            project.goal_type = req.body.goal_type,
            project.progress = req.body.progress,
            project.goal = req.body.goal
        await project.save();
        res.send(project);
    }
    catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Invalid input"
        });
    }

});

//delete project
router.delete("/userProject/:id", auth.verifyToken, async(req, res) => {
    try {
        const user = await User.findOne({ _id: req.user_id });
        req.params.username = user.username;
        req.params.password = user.password;
        var index = user.projects.indexOf(req.params.id);
        console.log(index);
        if (index > -1) {
            console.log("removed from user");
            user.projects.splice(index, 1);
        }
        await user.save();
        await Projects.deleteOne({ _id: req.params.id, username: req.params.username, password: req.params.password });
        return res.sendStatus(200);
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
});

async function login(user, res) {
    console.log("in login")
    let token = auth.generateToken({
        id: user._id
    }, "24h");

    user.removeOldTokens();
    user.addToken(token);
    await user.save();

    return res
        .cookie("token", token, {
            expires: new Date(Date.now() + 86400 * 1000)
        })
        .status(200).send(user);
}

module.exports = router;
