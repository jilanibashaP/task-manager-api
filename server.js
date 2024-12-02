const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// In-memory database (or replace with file storage)
let tasks = [];
const DATA_FILE = './tasks.json';

// Load tasks from file into a arrrau
const loadTasks = () => {
    // firat we need to check the file is avaliable or not
    if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE);
        tasks = JSON.parse(data);
    }
};

//save the tasks into a file
const saveTasks = () => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
};

// calling the loadtask fucntion, we are storing the taks into a file
loadTasks();

// Task 1: Set up the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Task 2: Create a Task
app.post('/tasks', (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required.' });
    }

    // we can add the duplizte check code, if the duplicte found we need to return 409 status code

    // default status is pending
    const task = { id: tasks.length + 1, title, description, status: 'pending' };
    tasks.push(task);
    saveTasks();

    res.status(201).json({
        message: 'Task created successfully',
        task,
    });
});

// Task 3: Get All Tasks
app.get('/tasks', (req, res) => {
    res.json(tasks);
});

// Task 4: Update a Task
app.put('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const task = tasks.find((t) => t.id === parseInt(id));

    if (!task) {
        return res.status(404).json({ error: 'Task not found' });
    }

    if (!['pending', 'completed'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
    }

    task.status = status;
    saveTasks();

    res.json({
        message: 'Task updated successfully',
        task,
    });
});

// Task 5: Delete a Task
app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;

    const taskIndex = tasks.findIndex((t) => t.id === parseInt(id));

    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found' });
    }

    tasks.splice(taskIndex, 1);
    saveTasks();

    res.json({ message: 'Task deleted successfully' });
});

// Task 6: Filter Tasks by Status
app.get('/tasks/status/:status', (req, res) => {
    const { status } = req.params;

    if (!['pending', 'completed'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
    }

    const filteredTasks = tasks.filter((task) => task.status === status);
    res.json(filteredTasks);
});

// Handle invalid routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
