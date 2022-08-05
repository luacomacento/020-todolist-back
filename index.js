require('dotenv').config();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const express = require('express');
const validateToken = require('./middlewares/token');
const app = express();
const PORT = process.env.API_PORT || 3004;

const jwtConfig = {
  expiresIn: '7d',
  algorithm: 'HS256'
}

app.use(express.json());
app.use(cors());

const validateUser = async (username, password) => {
  const usersRaw = await fs.readFile('users.json');
  const users = JSON.parse(usersRaw);
  const selectedUser = users.find((user) => user.username === username && user.password === password);
  return selectedUser;
}

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({message: 'Invalid data'})

  const selectedUser = await validateUser(username, password);
  if (!selectedUser) return res.status(401).json({message: 'User not found'});
  
  const token = jwt.sign(req.body, process.env.JWT_SECRET, jwtConfig);
  res.status(200).json({token});
})

app.get('/tasks', async (req, res) => {
  const tasks = await fs.readFile('tasks.json')
    .then((result) => JSON.parse(result));
  res.status(200).json(tasks);
})

app.post('/tasks', validateToken, async (req, res) => {
  const { task } = req.body;
  const {username, password} = res.locals.user;
  const selectedUser = validateUser(username, password);
  if (!selectedUser) return res.status(401).json({message: 'User not found'});
  
  const tasks = await fs.readFile('tasks.json')
    .then((result) => JSON.parse(result));
  const newTask = { id: tasks.length + 1, task }
  tasks.push(newTask);
  await fs.writeFile('tasks.json', JSON.stringify(tasks));
  res.status(201).json(newTask);
})

app.get('/', (req, res) => {
  res.status(200).json({message: 'ok'});
});

app.listen(PORT, console.log(`Ouvindo a porta ${PORT}...`))