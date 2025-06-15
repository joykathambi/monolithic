const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// Import our data (we'll create this next)
const { getTasks, addTask, updateTask, deleteTask } = require('./data/tasks');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware Setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes

// HOME PAGE - Display all tasks
app.get('/', (req, res) => {
    try {
        const tasks = getTasks();
        res.render('index', { 
            title: 'Task Manager', 
            tasks: tasks 
        });
    } catch (error) {
        console.error('Error rendering home page:', error);
        res.status(500).send('Server Error');
    }
});

// API Routes (these handle AJAX requests from frontend)

// GET all tasks (API endpoint)
app.get('/api/tasks', (req, res) => {
    try {
        res.json(getTasks());
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// ADD new task
app.post('/api/tasks', (req, res) => {
    try {
        const { title } = req.body;
        
        if (!title || title.trim() === '') {
            return res.status(400).json({ error: 'Task title is required' });
        }
        
        if (title.trim().length > 200) {
            return res.status(400).json({ error: 'Task title must be less than 200 characters' });
        }
        
        const newTask = addTask(title.trim());
        res.status(201).json(newTask);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
});

// UPDATE task (mark complete/incomplete)
app.put('/api/tasks/:id', (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        const { completed } = req.body;
        
        if (isNaN(taskId)) {
            return res.status(400).json({ error: 'Invalid task ID' });
        }
        
        const updatedTask = updateTask(taskId, { completed });
        
        if (!updatedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        res.json(updatedTask);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// DELETE task
app.delete('/api/tasks/:id', (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        
        if (isNaN(taskId)) {
            return res.status(400).json({ error: 'Invalid task ID' });
        }
        
        const success = deleteTask(taskId);
        
        if (!success) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Monolithic server running on http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop the server');
});