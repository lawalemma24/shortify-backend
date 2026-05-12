const Url = require('../models/Url');
const Stat = require('../models/Stats.js');
const shortid = require('shortid');

// Generate a short URL

exports.encodeUrl = async (req, res) => {
  try {
    const { originalUrl } = req.body;
    
    if (!originalUrl) {
      return res.status(400).json({ error: 'Original URL is required' });
    }

    // Check if URL already exists
    const existingUrl = await Url.findOne({ originalUrl });
    if (existingUrl) {
      return res.json({
        originalUrl: existingUrl.originalUrl,
        shortUrl: `${req.headers.host}/api/${existingUrl.urlPath}`,
        urlPath: existingUrl.urlPath,
        message: 'URL already shortened',
      });
    }

    // Generate a unique URL path (minimum 3 characters)
    let urlPath;
    let isUnique = false;
    
    while (!isUnique) {
      urlPath = shortid.generate();
      // Ensure it's at least 3 characters
      if (urlPath.length < 3) {
        urlPath = urlPath.padEnd(3, 'a');
      }
      // Check uniqueness
      const exists = await Url.findOne({ urlPath });
      if (!exists) isUnique = true;
    }

    const shortUrl = `${req.headers.host}/api/${urlPath}`;

    const url = new Url({
      originalUrl,
      shortUrl,
      urlPath,
    });

    await url.save();

    res.status(201).json({
      originalUrl,
      shortUrl,
      urlPath,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Decode a short URL
exports.decodeUrl = async (req, res) => {
  try {
    const { shortUrl } = req.query;
    
    if (!shortUrl) {
      return res.status(400).json({ error: 'Short URL is required' });
    }

    const urlPath = shortUrl.split('/').pop();
    const url = await Url.findOne({ urlPath });

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    res.json({
      originalUrl: url.originalUrl,
      shortUrl: url.shortUrl,
      urlPath: url.urlPath,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Redirect to original URL
exports.redirectUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;
    
    const url = await Url.findOneAndUpdate(
      { shortCode },
      { $inc: { clicks: 1 } },
      { new: true }
    );

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    // Record the access statistics
    const stat = new Stat({
      urlPath,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      referrer: req.get('Referrer'),
    });

    await stat.save();

    res.redirect(url.originalUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// List all URLs
exports.listUrls = async (req, res) => {
  try {
    const urls = await Url.find().sort({ createdAt: -1 });
    res.json(urls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};