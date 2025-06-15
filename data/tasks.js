// In-memory data storage (in production, you'd use a database)
let tasks = [
    { id: 1, title: 'Learn Node.js', completed: false, createdAt: new Date() },
    { id: 2, title: 'Build a web app', completed: true, createdAt: new Date() },
    { id: 3, title: 'Deploy to production', completed: false, createdAt: new Date() }
];

let nextId = 4;

// Get all tasks
function getTasks() {
    return tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// Add new task
function addTask(title) {
    const newTask = {
        id: nextId++,
        title,
        completed: false,
        createdAt: new Date()
    };
    
    tasks.push(newTask);
    return newTask;
}

// Update task
function updateTask(id, updates) {
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
        return null;
    }
    
    tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
    return tasks[taskIndex];
}

// Delete task
function deleteTask(id) {
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
        return false;
    }
    
    tasks.splice(taskIndex, 1);
    return true;
}

module.exports = {
    getTasks,
    addTask,
    updateTask,
    deleteTask
};