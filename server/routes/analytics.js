import express from 'express';
import Issue from '../models/Issue.js';
import Verification from '../models/Verification.js';
import { getStore } from '../config/db.js';
import { protect, authorize } from '../middleware/auth.js';
import { generateAIInsights } from '../services/gemini.js';

const router = express.Router();

// Helper to compute average resolution time in hours
const calculateAvgResolutionTime = (resolvedIssues) => {
  if (resolvedIssues.length === 0) return 24; // Default: 24 hrs
  let totalTime = 0;
  resolvedIssues.forEach(issue => {
    const created = new Date(issue.createdAt);
    const resolved = new Date(issue.resolvedAt);
    totalTime += (resolved - created) / (1000 * 60 * 60); // In hours
  });
  return Math.round(totalTime / resolvedIssues.length) || 12;
};

// @desc    Get dashboard metrics & charts (for Admin/Authority Dashboard)
// @route   GET /api/analytics/dashboard
// @access  Private (Admin)
router.get('/dashboard', protect, authorize('admin'), async (req, res) => {
  let issues = [];
  let verifications = [];

  if (global.dbFallback) {
    const store = getStore();
    issues = store.issues;
    verifications = store.verifications;
  } else {
    try {
      issues = await Issue.find({});
      verifications = await Verification.find({});
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // 1. Calculations
  const total = issues.length;
  const pending = issues.filter(i => ['Reported', 'Verified'].includes(i.status)).length;
  const inProgress = issues.filter(i => ['Assigned', 'In Progress'].includes(i.status)).length;
  const resolved = issues.filter(i => i.status === 'Resolved').length;

  const resolvedIssues = issues.filter(i => i.status === 'Resolved' && i.resolvedAt);
  const avgResolutionTime = calculateAvgResolutionTime(resolvedIssues);

  // 2. Chart 1: Issues by Category
  const categoryMap = {};
  const categories = ['Pothole', 'Garbage', 'Water Leakage', 'Streetlight', 'Open Manhole', 'Road Damage', 'Public Safety', 'Others'];
  categories.forEach(c => { categoryMap[c] = 0; });
  issues.forEach(i => {
    categoryMap[i.category] = (categoryMap[i.category] || 0) + 1;
  });
  const issuesByCategory = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  // 3. Chart 2: Status Overview (Bar Chart)
  const statusOverview = [
    { name: 'Pending', value: pending },
    { name: 'In Progress', value: inProgress },
    { name: 'Resolved', value: resolved }
  ];

  // 4. Chart 3: Monthly Trends (Line Chart)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyTrendsMap = {};
  months.forEach(m => { monthlyTrendsMap[m] = 0; });

  issues.forEach(i => {
    const date = new Date(i.createdAt);
    const mName = months[date.getMonth()];
    monthlyTrendsMap[mName]++;
  });
  const monthlyTrends = Object.entries(monthlyTrendsMap).map(([month, count]) => ({ month, count }));

  // 5. Chart 4: Verification Stats (Area Chart)
  const verifyCount = verifications.filter(v => v.status === 'Verify').length;
  const rejectCount = verifications.filter(v => v.status === 'Reject').length;
  const verificationStats = [
    { name: 'Verified', count: verifyCount },
    { name: 'Rejected', count: rejectCount }
  ];

  // 6. Heatmap Locations (Area-wise Distribution)
  const heatmapData = issues.map(i => ({
    latitude: i.location?.latitude || 28.6139,
    longitude: i.location?.longitude || 77.2090,
    category: i.category,
    priority: i.priority,
    status: i.status,
    title: i.title
  }));

  // 7. AI Insights
  const aiInsights = generateAIInsights(issues);

  res.json({
    metrics: {
      totalIssues: total,
      pendingIssues: pending,
      inProgressIssues: inProgress,
      resolvedIssues: resolved,
      avgResolutionTime: `${avgResolutionTime} hrs`
    },
    charts: {
      issuesByCategory,
      statusOverview,
      monthlyTrends,
      verificationStats,
      heatmapData
    },
    aiInsights
  });
});

export default router;
