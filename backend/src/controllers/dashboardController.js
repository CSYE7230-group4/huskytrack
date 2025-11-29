/**
 * Dashboard Controller
 * Handles HTTP requests for user dashboard feed
 */

const dashboardService = require('../services/dashboardService');
const { asyncHandler } = require('../utils/errors');

/**
 * Get dashboard feed for authenticated user
 * GET /api/v1/dashboard/feed
 */
const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.userId || (req.user && req.user._id);

  const data = await dashboardService.getDashboardFeed(userId.toString());

  res.status(200).json({
    success: true,
    data
  });
});

module.exports = {
  getDashboard
};


