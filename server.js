const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let users = [];

app.get('/users', (req, res) => { 
    res.json(users);
});

app.post('/users', (req, res) => {
    const user = req.body;
    users.push(user);
    res.json(user);
});

app.delete('/users/:id', (req, res) => {
    const id = req.params.id; 
    users = users.filter(u => u.id != id); 
    res.send(`User ${id} was deleted`);
});

app.put('/users/:id', (req, res) => {
    const user = req.body;
    const id = req.params.id; 
    const userIndex = users.findIndex(u => u.id == id);
    users.splice(userIndex, 1, user);
    res.send(`Data for user ${id} was changed`);
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});