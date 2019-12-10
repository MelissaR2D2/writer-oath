const mongoose = require('mongoose');
//const express = require("express");
const auth = require("./auth.js");
//const router = express.Router();

//
// Tickets
//

const projectSchema = new mongoose.Schema({
  username: String,
  password: String,
  name: String,
  description: String,
  goal_type: String,
  current_words: Number,
  words_goal: Number,
});

projectSchema.methods.toJSON = function() {
  var obj = this.toObject();
  delete obj.password;
  return obj;
};

const Projects = mongoose.model('Project', projectSchema);

async function getProject(req, res) {
  try {
    //will only send project if username and password matches
    let project = await Projects.findOne({ _id: req.params.id, username: req.params.username, password: req.params.password });
    return res.send(project);
  }
  catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

async function updateProject(req, res) {
  try {
    let project = await project.findOne({ _id: req.params.id, username: req.params.username, password: req.params.password });
    project.name = req.body.name;
    project.description = req.body.description;
    project.goal_type = req.body.goal_type;
    project.current_words = req.body.current_words;
    project.words_goal = req.body.words_goal;
    await project.save();
    res.send(project);
  }
  catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}

async function addProject(req, res) {
  const project = new Projects({
    username: req.body.username,
    password: req.body.password,
    name: req.body.name,
    description: req.body.description,
    goal_type: req.body.goal_type,
    current_words: req.body.current_words,
    words_goal: req.body.words_goal
  });
  try {
    await project.save();
    return res.send(project);
  }
  catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

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

/*
//finding a particular project
router.get('/:id', async(req, res) => {
  try {
    //will only send project if username and password matches
    let project = await Project.findOne({ _id: req.params.id, username: req.params.username, password: req.params.password });
    return res.send(project);
  }
  catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

//adding new project
router.post('/', async(req, res) => {
  const Projects = new Project({
    username: req.body.username,
    password: req.body.password,
    name: req.body.name,
    description: req.body.description,
    goal_type: req.body.goal_type,
    current_words: req.body.current_words,
    words_goal: req.body.words_goal
  });
  try {
    await Projects.save();
    return res.send(Projects);
  }
  catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

//deleting project
router.delete('/:id', auth.verifyToken, async(req, res) => {
  try {
    await Project.deleteOne({
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
});

//editing item
router.put('/:id', async(req, res) => {
  try {
    let project = await project.findOne({ _id: req.params.id, username: req.params.username, password: req.params.password });
    project.name = req.body.name;
    project.description = req.body.description;
    project.goal_type = req.body.goal_type;
    project.current_words = req.body.current_words;
    project.words_goal = req.body.words_goal;
    await project.save();
    res.send(project);
  }
  catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
})
*/

module.exports = {
  addProject: addProject,
  deleteProject: deleteProject,
  updateProject: updateProject,
  getProject: getProject
};
