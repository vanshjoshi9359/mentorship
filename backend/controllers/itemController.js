const Item = require('../models/Item');

// Simple AI tag extraction from text
const extractTags = (title, description, category) => {
  const text = `${title} ${description} ${category}`.toLowerCase();
  const tagMap = {
    'phone': ['mobile', 'phone', 'iphone', 'android', 'samsung', 'oneplus', 'redmi'],
    'laptop': ['laptop', 'macbook', 'dell', 'hp', 'lenovo', 'asus'],
    'wallet': ['wallet', 'purse', 'money', 'cash'],
    'keys': ['key', 'keys', 'keychain'],
    'id': ['id', 'card', 'identity', 'aadhar', 'pan', 'student id'],
    'bag': ['bag', 'backpack', 'satchel', 'handbag'],
    'book': ['book', 'notebook', 'notes', 'textbook'],
    'glasses': ['glasses', 'spectacles', 'specs', 'sunglasses'],
    'earphones': ['earphone', 'earbuds', 'headphone', 'airpods'],
    'charger': ['charger', 'cable', 'adapter'],
    'bottle': ['bottle', 'water bottle', 'flask'],
    'umbrella': ['umbrella'],
    'watch': ['watch', 'smartwatch'],
    'pen': ['pen', 'pencil', 'stationery'],
    'calculator': ['calculator'],
    'jacket': ['jacket', 'hoodie', 'sweater', 'coat'],
  };

  const tags = new Set([category.toLowerCase()]);
  for (const [tag, keywords] of Object.entries(tagMap)) {
    if (keywords.some(kw => text.includes(kw))) {
      tags.add(tag);
    }
  }
  return Array.from(tags);
};

// Find AI-based matches between lost and found items
const findMatches = async (item) => {
  const oppositeType = item.type === 'lost' ? 'found' : 'lost';
  const candidates = await Item.find({
    type: oppositeType,
    status: 'open',
    category: item.category
  }).limit(20);

  const scored = candidates.map(candidate => {
    let score = 0;
    // Category match (already filtered)
    score += 30;
    // Tag overlap
    const sharedTags = item.aiTags.filter(t => candidate.aiTags.includes(t));
    score += sharedTags.length * 15;
    // Location similarity
    const loc1 = item.location.toLowerCase();
    const loc2 = candidate.location.toLowerCase();
    if (loc1 === loc2) score += 25;
    else if (loc1.includes(loc2) || loc2.includes(loc1)) score += 10;
    // Date proximity (within 7 days)
    const daysDiff = Math.abs(new Date(item.date) - new Date(candidate.date)) / (1000 * 60 * 60 * 24);
    if (daysDiff <= 1) score += 20;
    else if (daysDiff <= 3) score += 10;
    else if (daysDiff <= 7) score += 5;
    // Title word overlap
    const words1 = item.title.toLowerCase().split(' ');
    const words2 = candidate.title.toLowerCase().split(' ');
    const sharedWords = words1.filter(w => w.length > 3 && words2.includes(w));
    score += sharedWords.length * 10;

    return { item: candidate, score };
  });

  return scored
    .filter(s => s.score >= 40)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(s => s.item._id);
};

// Create item
exports.createItem = async (req, res) => {
  try {
    const { type, title, description, category, location, date, imageUrl, contactInfo } = req.body;
    const aiTags = extractTags(title, description, category);

    const item = await Item.create({
      type, title, description, category, location,
      date: new Date(date),
      imageUrl: imageUrl || '',
      contactInfo: contactInfo || '',
      postedBy: req.user._id,
      aiTags
    });

    // Find matches asynchronously
    const matchIds = await findMatches(item);
    item.matches = matchIds;
    await item.save();

    // Also update matched items to include this item
    if (matchIds.length > 0) {
      await Item.updateMany(
        { _id: { $in: matchIds } },
        { $addToSet: { matches: item._id } }
      );
    }

    await item.populate('postedBy', 'name email');
    res.status(201).json(item);
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ message: 'Failed to create item' });
  }
};

// Get all items with filters
exports.getItems = async (req, res) => {
  try {
    const { type, category, status, search, page = 1, limit = 12 } = req.query;
    const query = {};

    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;
    else query.status = 'open';

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [items, total] = await Promise.all([
      Item.find(query)
        .populate('postedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Item.countDocuments(query)
    ]);

    res.json({ items, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ message: 'Failed to fetch items' });
  }
};

// Get single item with matches
exports.getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('postedBy', 'name email')
      .populate({
        path: 'matches',
        populate: { path: 'postedBy', select: 'name email' }
      });

    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ message: 'Failed to fetch item' });
  }
};

// Update item status
exports.updateItemStatus = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    item.status = req.body.status;
    await item.save();
    res.json(item);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Failed to update status' });
  }
};

// Delete item
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ message: 'Failed to delete item' });
  }
};

// Get user's items
exports.getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ postedBy: req.user._id })
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your items' });
  }
};

// Get stats
exports.getStats = async (req, res) => {
  try {
    const [totalLost, totalFound, resolved] = await Promise.all([
      Item.countDocuments({ type: 'lost', status: 'open' }),
      Item.countDocuments({ type: 'found', status: 'open' }),
      Item.countDocuments({ status: 'resolved' })
    ]);
    res.json({ totalLost, totalFound, resolved });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};
