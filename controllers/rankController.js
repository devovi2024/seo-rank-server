import KeywordTracking from '../models/KeywordTracking.js';
import { keywordTracking } from '../services/keywordTrackingService.js';

// @desc    Add a new keyword for rank tracking
// @route   POST /api/rank
export const addKeyword = async (req, res) => {
  try {
    const { keyword, url } = req.body;

    if (!keyword || !url) {
      return res.status(400).json({ success: false, message: 'Keyword and URL are required' });
    }

    // Extract the domain from the provided URL
    let domain;
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      domain = urlObj.hostname.replace('www.', '');
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid URL format' });
    }

    // Check if the keyword is already being tracked for this domain
    const existing = await KeywordTracking.findOne({
      userId: req.userId,
      keyword: keyword.toLowerCase().trim(),
      domain,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Already tracking this keyword for this domain',
      });
    }

    // Create a new tracking record
    const tracking = await KeywordTracking.create({
      userId: req.userId,
      keyword: keyword.toLowerCase().trim(),
      url: url.startsWith('http') ? url : `https://${url}`,
      domain,
      status: 'checking',
    });

    // Start rank tracking in the background
    keywordTracking(tracking);

    res.status(201).json({
      success: true,
      message: 'Keyword tracking started',
      tracking,
    });
  } catch (error) {
    console.error('Add keyword error:', error.message);

    // Handle duplicate index errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Already tracking this keyword',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get all tracked keywords for the authenticated user
// @route   GET /api/rank
export const getKeywords = async (req, res) => {
  try {
    const keywords = await KeywordTracking.find({ userId: req.userId })
      .sort({ lastChecked: -1 })
      .select('-rankHistory');

    res.status(200).json({
      success: true,
      keywords,
    });
  } catch (error) {
    console.error('Get keywords error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get a single tracked keyword with history and competitors
// @route   GET /api/rank/:id
export const getKeywordById = async (req, res) => {
  try {
    const tracking = await KeywordTracking.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!tracking) {
      return res.status(404).json({
        success: false,
        message: 'Keyword not found',
      });
    }

    res.status(200).json({
      success: true,
      tracking,
    });
  } catch (error) {
    console.error('Get keyword by id error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Manually refresh a tracked keyword
// @route   POST /api/rank/:id/refresh
export const refreshKeyword = async (req, res) => {
  try {
    const tracking = await KeywordTracking.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!tracking) {
      return res.status(404).json({
        success: false,
        message: 'Keyword not found',
      });
    }

    tracking.status = 'checking';
    await tracking.save();

    // Start a background rank check
    keywordTracking(tracking);

    res.status(200).json({
      success: true,
      message: 'Keyword refresh started',
      tracking,
    });
  } catch (error) {
    console.error('Refresh keyword error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Enable or disable keyword tracking
// @route   PATCH /api/rank/:id/toggle
export const toggleTracking = async (req, res) => {
  try {
    const tracking = await KeywordTracking.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!tracking) {
      return res.status(404).json({
        success: false,
        message: 'Keyword not found',
      });
    }

    tracking.active = !tracking.active;
    await tracking.save();

    res.status(200).json({
      success: true,
      message: `Tracking ${tracking.active ? 'enabled' : 'disabled'}`,
      tracking,
    });
  } catch (error) {
    console.error('Toggle tracking error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Delete a tracked keyword
// @route   DELETE /api/rank/:id
export const deleteKeyword = async (req, res) => {
  try {
    const tracking = await KeywordTracking.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!tracking) {
      return res.status(404).json({
        success: false,
        message: 'Keyword not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Keyword tracking deleted',
    });
  } catch (error) {
    console.error('Delete keyword error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};