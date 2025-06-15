// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Get references to DOM elements
    const addTaskForm = document.getElementById('add-task-form');
    const taskInput = document.getElementById('task-input');
    const tasksContainer = document.getElementById('tasks-container');
    
    // Add task form submission
    addTaskForm.addEventListener('submit', async function(e) {
        e.preventDefault(); // Prevent form from submitting normally
        
        const title = taskInput.value.trim();
        
        if (!title) {
            alert('Please enter a task title');
            return;
        }
        
        try {
            // Send POST request to our API
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title })
            });
            
            if (response.ok) {
                // Clear input and reload tasks
                taskInput.value = '';
                await loadTasks();
            } else {
                const error = await response.json();
                alert('Error: ' + error.error);
            }
        } catch (error) {
            console.error('Error adding task:', error);
            alert('Failed to add task. Please try again.');
        }
    });
    
    // Handle task interactions (checkboxes and delete buttons)
    tasksContainer.addEventListener('click', async function(e) {
        const taskItem = e.target.closest('.task-item');
        const taskId = taskItem ? parseInt(taskItem.dataset.id) : null;
        
        if (!taskId) return;
        
        // Handle checkbox clicks
        if (e.target.classList.contains('task-checkbox')) {
            const completed = e.target.checked;
            
            try {
                const response = await fetch(`/api/tasks/${taskId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ completed })
                });
                
                if (response.ok) {
                    // Update UI immediately
                    taskItem.classList.toggle('completed', completed);
                } else {
                    // Revert checkbox if request failed
                    e.target.checked = !completed;
                    alert('Failed to update task');
                }
            } catch (error) {
                console.error('Error updating task:', error);
                e.target.checked = !completed;
                alert('Failed to update task. Please try again.');
            }
        }
        
        // Handle delete button clicks
        if (e.target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this task?')) {
                try {
                    const response = await fetch(`/api/tasks/${taskId}`, {
                        method: 'DELETE'
                    });
                    
                    if (response.ok) {
                        await loadTasks();
                    } else {
                        alert('Failed to delete task');
                    }
                } catch (error) {
                    console.error('Error deleting task:', error);
                    alert('Failed to delete task. Please try again.');
                }
            }
        }
    });
    
    // Function to reload all tasks
    async function loadTasks() {
        try {
            const response = await fetch('/api/tasks');
            const tasks = await response.json();
            
            // Clear current tasks
            tasksContainer.innerHTML = '';
            
            if (tasks.length === 0) {
                tasksContainer.innerHTML = '<p class="no-tasks">No tasks yet. Add one above!</p>';
                return;
            }
            
            // Create task elements
            tasks.forEach(task => {
                const taskElement = createTaskElement(task);
                tasksContainer.appendChild(taskElement);
            });
            
        } catch (error) {
            console.error('Error loading tasks:', error);
            tasksContainer.innerHTML = '<p class="no-tasks">Error loading tasks. Please refresh the page.</p>';
        }
    }
    
    // Helper function to create task DOM element
    function createTaskElement(task) {
        const taskDiv = document.createElement('div');
        taskDiv.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskDiv.dataset.id = task.id;
        
        taskDiv.innerHTML = `
            <div class="task-content">
                <input 
                    type="checkbox" 
                    class="task-checkbox" 
                    ${task.completed ? 'checked' : ''}
                >
                <span class="task-title">${escapeHtml(task.title)}</span>
            </div>
            <div class="task-actions">
                <button class="delete-btn" data-id="${task.id}">Delete</button>
            </div>
        `;
        
        return taskDiv;
    }
    
    // Helper function to escape HTML (prevent XSS attacks)
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});