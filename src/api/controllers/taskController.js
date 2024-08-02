const Task = require('../../models/taskModel');

// Listet alle Aufgaben auf
const listTasks = async (req, res) => {
    try {
        const tasks = await Task.find().populate('assignedTo').populate('team');
        res.status(200).json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Erstellt eine neue Aufgabe
const createTask = async (req, res) => {
    try {
        const { title, description, category, status, assignedTo, team, dueDate } = req.body;
        if (!title || !assignedTo || !team) {
            return res.status(400).json({ error: 'Title, Assigned To, and Team are required' });
        }

        const newTask = new Task({
            title,
            description,
            category,
            status,
            assignedTo,
            team,
            dueDate
        });

        await newTask.save();
        res.status(201).json(newTask);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Zeigt Details einer bestimmten Aufgabe an
const getTaskDetails = async (req, res) => {
    try {
        const { taskId } = req.params;
        if (!taskId) {
            return res.status(400).json({ error: 'Task ID is required' });
        }

        const task = await Task.findById(taskId).populate('assignedTo').populate('team');
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.status(200).json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Aktualisiert eine Aufgabe
const updateTask = async (req, res) => {
    try {
        const { taskId, title, description, category, status, assignedTo, team, dueDate } = req.body;
        if (!taskId) {
            return res.status(400).json({ error: 'Task ID is required' });
        }

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        if (title) task.title = title;
        if (description) task.description = description;
        if (category) task.category = category;
        if (status) task.status = status;
        if (assignedTo) task.assignedTo = assignedTo;
        if (team) task.team = team;
        if (dueDate) task.dueDate = dueDate;

        await task.save();
        res.status(200).json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Entfernt eine Aufgabe
const deleteTask = async (req, res) => {
    try {
        const { taskId } = req.body;
        if (!taskId) {
            return res.status(400).json({ error: 'Task ID is required' });
        }

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        await task.remove();
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    listTasks,
    createTask,
    getTaskDetails,
    updateTask,
    deleteTask
};