const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let students = [];

app.get('/students', (req, res) => { 
    res.json(students);
});

app.post('/students', (req, res) => {
    const student = req.body;
    students.push(student);
    res.json(student);
});

app.delete('/students/:id', (req, res) => {
    const id = req.params.id; 
    students = students.filter(u => u.id != id); 
    res.send(JSON.stringify(`Student ${id} was deleted`));
});

app.put('/students/:id', (req, res) => {
    const student = req.body;
    const id = req.params.id; 
    const studentIndex = students.findIndex(u => u.id == id);
    students.splice(studentIndex, 1, student);
    res.send(JSON.stringify(`Data for Student ${id} was changed`));
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});