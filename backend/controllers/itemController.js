const Item = require('../models/Item');

// ─── AI ENGINE ────────────────────────────────────────────────────────────────

// Extract descriptive tags from text
const extractTags = (title, description, category) => {
  const text = `${title} ${description} ${category}`.toLowerCase();
  const tagMap = {
    'phone': ['mobile', 'phone', 'iphone', 'android', 'samsung', 'oneplus', 'redmi', 'realme', 'vivo', 'oppo', 'pixel'],
    'laptop': ['laptop', 'macbook', 'dell', 'hp', 'lenovo', 'asus', 'acer', 'notebook', 'computer'],
    'wallet': ['wallet', 'purse', 'money', 'cash', 'billfold'],
    'keys': ['key', 'keys', 'keychain', 'keyring'],
    'id': ['id', 'card', 'identity', 'aadhar', 'pan', 'student id', 'college id', 'driving license'],
    'bag': ['bag', 'backpack', 'satchel', 'handbag', 'tote', 'pouch', 'sling'],
    'book': ['book', 'notebook', 'notes', 'textbook', 'copy', 'register'],
    'glasses': ['glasses', 'spectacles', 'specs', 'sunglasses', 'eyewear'],
    'earphones': ['earphone', 'earbuds', 'headphone', 'airpods', 'earpiece', 'headset'],
    'charger': ['charger', 'cable', 'adapter', 'power bank', 'powerbank'],
    'bottle': ['bottle', 'water bottle', 'flask', 'sipper'],
    'umbrella': ['umbrella', 'raincoat'],
    'watch': ['watch', 'smartwatch', 'fitbit', 'band'],
    'pen': ['pen', 'pencil', 'stationery', 'marker', 'highlighter'],
    'calculator': ['calculator', 'casio', 'scientific'],
    'jacket': ['jacket', 'hoodie', 'sweater', 'coat', 'sweatshirt'],
    'shoes': ['shoes', 'sneakers', 'sandals', 'slippers', 'footwear', 'boots'],
    'jewellery': ['ring', 'chain', 'necklace', 'bracelet', 'earring', 'pendant', 'gold', 'silver'],
    'black': ['black', 'dark'],
    'white': ['white', 'light', 'cream'],
    'blue': ['blue', 'navy', 'cyan'],
    'red': ['red', 'maroon', 'crimson'],
    'green': ['green', 'olive'],
    'yellow': ['yellow', 'golden', 'gold'],
    'brown': ['brown', 'tan', 'beige'],
  };

  const tags = new Set([category.toLowerCase()]);
  for (const [tag, keywords] of Object.entries(tagMap)) {
    if (keywords.some(kw => text.includes(kw))) tags.add(tag);
  }
  return Array.from(tags);
};

// Tokenize text into meaningful words
const tokenize = (text) => {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !['the', 'and', 'was', 'for', 'are', 'with', 'this', 'that', 'have', 'from', 'not', 'but'].includes(w));
};

// Calculate Jaccard similarity between two token sets
const jaccardSimilarity = (tokens1, tokens2) => {
  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);
  const intersection = [...set1].filter(t => set2.has(t)).length;
  const union = new Set([...set1, ...set2]).size;
  return union === 0 ? 0 : intersection / union;
};

// Core AI scoring function
const scoreMatch = (item, candidate) => {
  let score = 0;
  const breakdown = {};

  // 1. Category match (mandatory filter, bonus points)
  if (item.category === candidate.category) {
    score += 20;
    breakdown.category = 20;
  }

  // 2. Tag overlap (AI-extracted features)
  const sharedTags = item.aiTags.filter(t => candidate.aiTags.includes(t));
  const tagScore = Math.min(sharedTags.length * 12, 36);
  score += tagScore;
  breakdown.tags = tagScore;
  breakdown.sharedTags = sharedTags;

  // 3. Title similarity (Jaccard)
  const titleSim = jaccardSimilarity(tokenize(item.title), tokenize(candidate.title));
  const titleScore = Math.round(titleSim * 25);
  score += titleScore;
  breakdown.title = titleScore;

  // 4. Description similarity
  const descSim = jaccardSimilarity(tokenize(item.description), tokenize(candidate.description));
  const descScore = Math.round(descSim * 30);
  score += descScore;
  breakdown.description = descScore;

  // 5. Location match
  const loc1 = item.location.toLowerCase().trim();
  const loc2 = candidate.location.toLowerCase().trim();
  if (loc1 === loc2) {
    score += 20;
    breakdown.location = 20;
  } else if (loc1.includes(loc2) || loc2.includes(loc1)) {
    score += 8;
    breakdown.location = 8;
  } else {
    breakdown.location = 0;
  }

  // 6. Date proximity
  const daysDiff = Math.abs(new Date(item.date) - new Date(candidate.date)) / (1000 * 60 * 60 * 24);
  let dateScore = 0;
  if (daysDiff <= 1) dateScore = 20;
  else if (daysDiff <= 3) dateScore = 14;
  else if (daysDiff <= 7) dateScore = 8;
  else if (daysDiff <= 14) dateScore = 3;
  score += dateScore;
  breakdown.date = dateScore;

  // Normalize to 0-100
  const maxPossible = 20 + 36 + 25 + 30 + 20 + 20;
  const normalized = Math.round((score / maxPossible) * 100);

  return { score: normalized, breakdown };
};

// Find and rank matches for an item
const findMatches = async (item) => {
  const oppositeType = item.type === 'lost' ? 'found' : 'lost';
  const candidates = await Item.find({
    type: oppositeType,
    status: 'open',
    _id: { $ne: item._id }
  }).limit(50);

  const scored = candidates
    .map(candidate => ({ item: candidate, ...scoreMatch(item, candidate) }))
    .filter(s => s.score >= 35)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return scored.map(s => s.item._id);
};

// ─── CONTROLLERS ──────────────────────────────────────────────────────────────

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

    const matchIds = await findMatches(item);
    item.matches = matchIds;
    await item.save();

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

exports.getItems = async (req, res) => {
  try {
    const { type, category, status, search, page = 1, limit = 12 } = req.query;
    const query = {};
    if (type) query.type = type;
    if (category) query.category = category;
    query.status = status || 'open';
    if (search) query.$text = { $search: search };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [items, total] = await Promise.all([
      Item.find(query).populate('postedBy', 'name email').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Item.countDocuments(query)
    ]);

    res.json({ items, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch items' });
  }
};

exports.getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('postedBy', 'name email')
      .populate({ path: 'matches', populate: { path: 'postedBy', select: 'name email' } });

    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch item' });
  }
};

// Get AI match score between two specific items
exports.getMatchScore = async (req, res) => {
  try {
    const [item1, item2] = await Promise.all([
      Item.findById(req.params.id1),
      Item.findById(req.params.id2)
    ]);

    if (!item1 || !item2) return res.status(404).json({ message: 'Item not found' });

    const result = scoreMatch(item1, item2);

    res.json({
      score: result.score,
      breakdown: result.breakdown,
      verdict: result.score >= 70 ? 'Strong Match' : result.score >= 50 ? 'Possible Match' : 'Weak Match',
      item1: { title: item1.title, type: item1.type },
      item2: { title: item2.title, type: item2.type }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to calculate match score' });
  }
};

exports.updateItemStatus = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.postedBy.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    item.status = req.body.status;
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update status' });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.postedBy.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete item' });
  }
};

exports.getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your items' });
  }
};

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
