import Analysis from '../models/Analysis.js';
import { scraperUrl } from '../services/scraperService.js';
import { analyzeSeoData } from '../services/geminiService.js';

// @desc    Start SEO analysis for a URL
// @route   POST /api/analysis/analyze
export const analyzeUrl = async (req, res) => {
  let analysis = null;

  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL is required',
      });
    }

    // Validate the provided URL
    let validUrl;

    try {
      validUrl = new URL(
        url.startsWith('http') ? url : `https://${url}`
      );
    } catch {
      return res.status(400).json({
        success: false,
        message: 'Invalid URL format',
      });
    }

    // Create a new analysis with processing status
    analysis = await Analysis.create({
      userId: req.userId,
      url: validUrl.href,
      status: 'processing',
    });

    // Return the response immediately
    res.status(202).json({
      success: true,
      message: 'Analysis started',
      analysisId: analysis._id,
    });

    try {
      // Step 1: Scrape the website
      const scraperResult = await scraperUrl(validUrl.href);

      if (!scraperResult.success) {
        analysis.status = 'failed';
        await analysis.save();

        console.error(
          'Scraping failed for analysis',
          analysis._id
        );

        return;
      }

      // Step 2: Analyze the scraped data using Gemini
      const aiResult = await analyzeSeoData(
        scraperResult.data
      );

      if (!aiResult.success) {
        analysis.status = 'failed';
        await analysis.save();

        console.error(
          'AI analysis failed for analysis',
          analysis._id
        );

        return;
      }

      // Step 3: Save the analysis results
      const data = aiResult.data;

      analysis.overallScore = data.overallScore || 0;
      analysis.categories = data.categories || {};
      analysis.keywords = data.keywords || [];
      analysis.issues = data.issues || [];

      // Save the scraped website data
      const scraped = scraperResult.data;

      analysis.metaData = scraped.metaData || {};
      analysis.headings = scraped.headings || {};
      analysis.links = scraped.links || {};
      analysis.images = scraped.images || {};
      analysis.loadTime = scraped.loadTime || 0;
      analysis.pageSize = scraped.pageSize || 0;
      analysis.wordCount = scraped.wordCount || 0;

      analysis.status = 'completed';

      await analysis.save();
    } catch (bgError) {
      console.error(
        'Background analysis error:',
        bgError.message
      );

      try {
        if (analysis) {
          analysis.status = 'failed';
          await analysis.save();
        }
      } catch (saveErr) {
        console.error(
          'Failed to update analysis status:',
          saveErr.message
        );
      }
    }
  } catch (error) {
    console.error('Analyze URL error:', error.message);

    // Return an error response only if no response has been sent yet
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  }
};

// @desc    Get all analyses for the authenticated user
// @route   GET /api/analysis/list
export const getAnalysisList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [analyses, total] = await Promise.all([
      Analysis.find({ userId: req.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-issues -keywords'),
      Analysis.countDocuments({
        userId: req.userId,
      }),
    ]);

    res.status(200).json({
      success: true,
      analyses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(
      'Get analysis list error:',
      error.message
    );

    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get a single analysis by ID
// @route   GET /api/analysis/:id
export const getAnalysisById = async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found',
      });
    }

    res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error(
      'Get analysis by id error:',
      error.message
    );

    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Delete an analysis
// @route   DELETE /api/analysis/:id
export const deleteAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Analysis deleted',
    });
  } catch (error) {
    console.error(
      'Delete analysis error:',
      error.message
    );

    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};