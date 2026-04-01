const Task = require('../models/Task');
const Group = require('../models/Group');

// Create a task
exports.createTask = async (req, res) => {
  try {
    const { groupId, title, description, dueDate, points } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check membership - compare as strings to handle ObjectId vs string
    const userId = req.user._id.toString();
    const isMember = group.members.some(
      member => member.userId.toString() === userId
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Not a member of this group' });
    }

    const isAdmin = group.members.some(
      member => member.userId.toString() === userId && member.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).json({ message: 'Only group admins can create tasks' });
    }

    const task = await Task.create({
      groupId,
      title,
      description,
      dueDate,
      points: points || 10,
      createdBy: req.user._id
    });

    await task.populate('createdBy', 'name email');
    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Failed to create task' });
  }
};

// Get tasks for a group
exports.getGroupTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ groupId: req.params.groupId })
      .populate('createdBy', 'name email')
      .populate('completions.userId', 'name email')
      .sort({ dueDate: 1 });

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};

// Mark task as complete
exports.completeTask = async (req, res) => {
  try {
    const { notes } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const alreadyCompleted = task.completions.some(
      completion => completion.userId.toString() === req.user._id.toString()
    );

    if (alreadyCompleted) {
      return res.status(400).json({ message: 'Task already completed' });
    }

    task.completions.push({
      userId: req.user._id,
      notes: notes || ''
    });

    await task.save();
    await task.populate('createdBy', 'name email');
    await task.populate('completions.userId', 'name email');

    res.json(task);
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({ message: 'Failed to complete task' });
  }
};

// Uncomplete task
exports.uncompleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.completions = task.completions.filter(
      completion => completion.userId.toString() !== req.user._id.toString()
    );

    await task.save();
    await task.populate('createdBy', 'name email');
    await task.populate('completions.userId', 'name email');

    res.json(task);
  } catch (error) {
    console.error('Uncomplete task error:', error);
    res.status(500).json({ message: 'Failed to uncomplete task' });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const group = await Group.findById(task.groupId);
    const isAdmin = group.members.some(
      member => member.userId.toString() === req.user._id.toString() && member.role === 'admin'
    );

    if (!isAdmin && task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Failed to delete task' });
  }
};
