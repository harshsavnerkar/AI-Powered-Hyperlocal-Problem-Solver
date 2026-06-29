import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Issue from '../models/Issue.js';
import User from '../models/User.js';
import Verification from '../models/Verification.js';
import Notification from '../models/Notification.js';
import { getStore, saveStore } from '../config/db.js';
import { protect, authorize } from '../middleware/auth.js';
import { analyzeIssue, detectDuplicate, getDistanceInMeters } from '../services/gemini.js';
import { dispatchIssueToMunicipality } from '../services/dispatch.js';
import { broadcastCriticalSmsAlert } from '../services/sms.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '../uploads');

// Helper to save base64 image upload locally
const saveBase64Image = (base64String) => {
  if (!base64String || !base64String.startsWith('data:')) return null;

  try {
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return null;
    }

    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');

    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    const extension = mimeType.split('/')[1] || 'png';
    const fileName = `img_${Date.now()}_${Math.random().toString(36).substr(2, 5)}.${extension}`;
    const filePath = path.join(UPLOADS_DIR, fileName);

    fs.writeFileSync(filePath, buffer);

    return {
      url: `/uploads/${fileName}`,
      mimeType,
      base64Data: matches[2]
    };
  } catch (error) {
    console.error('Failed to save base64 image:', error);
    return null;
  }
};

// Helper to assign points and check badges
const awardPointsAndBadges = (userObj, pointsToAdd, isFallback = false, store = null) => {
  userObj.points = (userObj.points || 0) + pointsToAdd;
  const badges = userObj.badges || [];

  if (userObj.role === 'citizen') {
    // 1 report points threshold or count-based badge logic
    if (userObj.points >= 10 && !badges.includes('Community Reporter')) {
      badges.push('Community Reporter');
    }
    if (userObj.points >= 50 && !badges.includes('Problem Solver')) {
      badges.push('Problem Solver');
    }
    if (userObj.points >= 100 && !badges.includes('Community Hero')) {
      badges.push('Community Hero');
    }
    if (userObj.points >= 200 && !badges.includes('City Guardian')) {
      badges.push('City Guardian');
    }
    if (userObj.points >= 300 && !badges.includes('Top Contributor')) {
      badges.push('Top Contributor');
    }
  } else if (userObj.role === 'volunteer') {
    if (userObj.points >= 10 && !badges.includes('Active Citizen')) {
      badges.push('Active Citizen');
    }
    if (userObj.points >= 50 && !badges.includes('Community Validator')) {
      badges.push('Community Validator');
    }
    if (userObj.points >= 150 && !badges.includes('Top Contributor')) {
      badges.push('Top Contributor');
    }
  }

  userObj.badges = badges;

  if (isFallback && store) {
    const userIdx = store.users.findIndex(u => u._id === userObj._id);
    if (userIdx !== -1) {
      store.users[userIdx] = userObj;
    }
  }
  return userObj;
};

// Helper to create notifications
const createNotificationHelper = async (userId, title, message, type = 'info', isFallback = false, store = null) => {
  const newNotif = {
    _id: 'n_' + Math.random().toString(36).substr(2, 9),
    userId,
    title,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString()
  };

  if (isFallback && store) {
    store.notifications.push(newNotif);
  } else if (!isFallback) {
    try {
      await Notification.create({
        userId,
        title,
        message,
        type,
        read: false
      });
    } catch (err) {
      console.error('Failed to save Mongoose notification:', err);
    }
  }
};

// @desc    Get all issues
// @route   GET /api/issues
// @access  Private
router.get('/', protect, async (req, res) => {
  if (global.dbFallback) {
    const store = getStore();
    // Hydrate reportedBy user data
    const hydrated = store.issues.map(issue => {
      const user = store.users.find(u => u._id === issue.reportedBy);
      return {
        ...issue,
        reportedBy: user ? { _id: user._id, name: user.name, role: user.role } : null
      };
    });
    res.json(hydrated);
  } else {
    try {
      const issues = await Issue.find({})
        .populate('reportedBy', 'name role email')
        .sort({ createdAt: -1 });
      res.json(issues);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
});

// @desc    Get issues nearby coordinates
// @route   GET /api/issues/nearby
// @access  Private
router.get('/nearby', protect, async (req, res) => {
  const { latitude, longitude, radius = 2000 } = req.query; // Radius in meters (default 2km)

  if (!latitude || !longitude) {
    return res.status(400).json({ message: 'Latitude and Longitude are required' });
  }

  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);

  if (global.dbFallback) {
    const store = getStore();
    const nearby = store.issues
      .map(issue => {
        const user = store.users.find(u => u._id === issue.reportedBy);
        const dist = issue.location?.latitude 
          ? getDistanceInMeters(lat, lon, issue.location.latitude, issue.location.longitude)
          : Infinity;
        return {
          ...issue,
          distance: dist,
          reportedBy: user ? { _id: user._id, name: user.name } : null
        };
      })
      .filter(issue => issue.distance <= radius);

    res.json(nearby);
  } else {
    try {
      const issues = await Issue.find({}).populate('reportedBy', 'name');
      const nearby = issues
        .map(issue => {
          const dist = issue.location?.latitude
            ? getDistanceInMeters(lat, lon, issue.location.latitude, issue.location.longitude)
            : Infinity;
          return {
            ...issue.toObject(),
            distance: dist
          };
        })
        .filter(issue => issue.distance <= radius);

      res.json(nearby);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
});

// @desc    Report new issue (Triggers Gemini AI analysis and duplicate detection)
// @route   POST /api/issues/report
// @access  Private (Citizen)
router.post('/report', protect, authorize('citizen'), async (req, res) => {
  const { description, latitude, longitude, address, imageBase64, videoUrl } = req.body;

  if (!description) {
    return res.status(400).json({ message: 'Description is required' });
  }

  const lat = latitude ? parseFloat(latitude) : 28.6139; // Default coordinates
  const lon = longitude ? parseFloat(longitude) : 77.2090;

  // Process file upload locally if imageBase64 is present
  let uploadedImageUrl = '';
  let aiResult = { category: 'Others', confidence: 0.5, priority: 'Medium', smartSummary: 'Issue reported' };
  
  const savedImage = saveBase64Image(imageBase64);
  if (savedImage) {
    uploadedImageUrl = savedImage.url;
    // Invoke Gemini vision analysis
    aiResult = await analyzeIssue(description, savedImage.base64Data, savedImage.mimeType);
  } else {
    // Description text-only Gemini analysis
    aiResult = await analyzeIssue(description);
  }

  if (global.dbFallback) {
    const store = getStore();

    // Check duplicate
    const dupCheck = detectDuplicate(lat, lon, aiResult.category, store.issues);

    const newIssue = {
      _id: 'i_' + Math.random().toString(36).substr(2, 9),
      title: aiResult.smartSummary,
      description,
      category: aiResult.category,
      priority: aiResult.priority,
      status: 'Reported',
      location: {
        latitude: lat,
        longitude: lon,
        address: address || 'Current Location'
      },
      media: {
        imageUrl: uploadedImageUrl,
        videoUrl: videoUrl || ''
      },
      reportedBy: req.user._id,
      assignedTeam: 'Unassigned',
      trustScore: 0,
      aiAnalysis: {
        categoryConfidence: aiResult.confidence,
        duplicateChecked: true,
        possibleDuplicateOf: dupCheck.isDuplicate ? dupCheck.duplicateOf._id : null,
        smartSummary: aiResult.smartSummary,
        hotspotScore: dupCheck.isDuplicate ? 2 : 1
      },
      createdAt: new Date().toISOString()
    };

    store.issues.push(newIssue);

    // Award Points & Badges to user
    const user = store.users.find(u => u._id === req.user._id);
    if (user) {
      awardPointsAndBadges(user, 10, true, store);
    }

    // Create notifications
    await createNotificationHelper(
      req.user._id,
      'Issue Reported!',
      `AI classified category: ${newIssue.category} (${Math.round(newIssue.aiAnalysis.categoryConfidence * 100)}% confidence). Priority: ${newIssue.priority}. +10 Points awarded!`,
      'success',
      true,
      store
    );

    if (newIssue.priority === 'Critical') {
      // Notify admins
      store.users
        .filter(u => u.role === 'admin')
        .forEach(admin => {
          createNotificationHelper(
            admin._id,
            'CRITICAL ISSUE REPORTED',
            `A critical priority ${newIssue.category} has been reported in ${newIssue.location.address}.`,
            'alert',
            true,
            store
          );
        });
      
      // Broadcast SMS alert to nearby volunteers
      broadcastCriticalSmsAlert(newIssue, store.users).catch(err => console.error('SMS broadcast failed:', err));
    }

    saveStore(store);
    res.status(201).json({
      issue: newIssue,
      possibleDuplicate: dupCheck.isDuplicate
    });
  } else {
    try {
      const existingIssues = await Issue.find({ status: { $ne: 'Resolved' } });
      const dupCheck = detectDuplicate(lat, lon, aiResult.category, existingIssues);

      const issue = await Issue.create({
        title: aiResult.smartSummary,
        description,
        category: aiResult.category,
        priority: aiResult.priority,
        status: 'Reported',
        location: {
          latitude: lat,
          longitude: lon,
          address: address || 'Current Location'
        },
        media: {
          imageUrl: uploadedImageUrl,
          videoUrl: videoUrl || ''
        },
        reportedBy: req.user._id,
        aiAnalysis: {
          categoryConfidence: aiResult.confidence,
          duplicateChecked: true,
          possibleDuplicateOf: dupCheck.isDuplicate ? dupCheck.duplicateOf._id : null,
          smartSummary: aiResult.smartSummary,
          hotspotScore: dupCheck.isDuplicate ? 2 : 1
        }
      });

      // Award Points & Badges
      const dbUser = await User.findById(req.user._id);
      if (dbUser) {
        awardPointsAndBadges(dbUser, 10, false);
        await dbUser.save();
      }

      // Citizen notification
      await createNotificationHelper(
        req.user._id,
        'Issue Reported!',
        `AI classified category: ${issue.category} (${Math.round(issue.aiAnalysis.categoryConfidence * 100)}% confidence). Priority: ${issue.priority}. +10 Points awarded!`,
        'success',
        false
      );

      // Admin notification for Critical priority
      if (issue.priority === 'Critical') {
        const admins = await User.find({ role: 'admin' });
        for (const admin of admins) {
          await createNotificationHelper(
            admin._id,
            'CRITICAL ISSUE REPORTED',
            `A critical priority ${issue.category} has been reported in ${issue.location.address}.`,
            'alert',
            false
          );
        }
        
        // Broadcast SMS alert to nearby volunteers
        User.find({}).then(allUsers => {
          broadcastCriticalSmsAlert(issue, allUsers);
        }).catch(err => console.error('SMS broadcast failed:', err));
      }

      res.status(201).json({
        issue,
        possibleDuplicate: dupCheck.isDuplicate
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
});

// @desc    Verify or Reject an issue
// @route   POST /api/issues/:id/verify
// @access  Private (Volunteer or Citizen)
router.post('/:id/verify', protect, authorize('volunteer', 'citizen'), async (req, res) => {
  const { status, comments } = req.body; // status: 'Verify' or 'Reject'
  const issueId = req.params.id;

  if (!status || !['Verify', 'Reject'].includes(status)) {
    return res.status(400).json({ message: 'Status must be Verify or Reject' });
  }

  if (global.dbFallback) {
    const store = getStore();
    const issue = store.issues.find(i => i._id === issueId);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Prevent double verification by same user
    const alreadyVerified = store.verifications.some(
      v => v.issueId === issueId && v.userId === req.user._id
    );
    if (alreadyVerified) {
      return res.status(400).json({ message: 'You have already verified this issue' });
    }

    const newVerification = {
      _id: 'v_' + Math.random().toString(36).substr(2, 9),
      issueId,
      userId: req.user._id,
      role: req.user.role,
      status,
      comments: comments || '',
      createdAt: new Date().toISOString()
    };
    store.verifications.push(newVerification);

    // Compute trust score
    const verificationsForIssue = store.verifications.filter(v => v.issueId === issueId);
    const verifyVotes = verificationsForIssue.filter(v => v.status === 'Verify').length;
    issue.trustScore = Math.round((verifyVotes / verificationsForIssue.length) * 100);

    // Update status to Verified if there is a volunteer validation or multiple citizen validations
    const volunteerVotes = verificationsForIssue.filter(v => v.status === 'Verify' && v.role === 'volunteer').length;
    if (issue.status === 'Reported' && (volunteerVotes >= 1 || verifyVotes >= 3)) {
      issue.status = 'Verified';
      // Trigger municipal dispatch asynchronously
      dispatchIssueToMunicipality(issue, true, store).catch(err => console.error('Dispatch failed:', err));
    }

    // Award Points
    const user = store.users.find(u => u._id === req.user._id);
    if (user) {
      // Award +5 points for verifying
      awardPointsAndBadges(user, 5, true, store);
    }

    // Notify Reporter
    await createNotificationHelper(
      issue.reportedBy,
      'Issue Verification Update',
      `Your reported issue was ${status.toLowerCase()}ed. Trust score is now ${issue.trustScore}%.`,
      'info',
      true,
      store
    );

    // Notify Volunteer
    await createNotificationHelper(
      req.user._id,
      'Points Earned!',
      `Thank you for verification! +5 Points awarded.`,
      'success',
      true,
      store
    );

    saveStore(store);
    res.json({ issue, verification: newVerification });
  } else {
    try {
      const issue = await Issue.findById(issueId);
      if (!issue) {
        return res.status(404).json({ message: 'Issue not found' });
      }

      const alreadyVerified = await Verification.findOne({ issueId, userId: req.user._id });
      if (alreadyVerified) {
        return res.status(400).json({ message: 'You have already verified this issue' });
      }

      const verification = await Verification.create({
        issueId,
        userId: req.user._id,
        role: req.user.role,
        status,
        comments
      });

      const verifications = await Verification.find({ issueId });
      const verifyVotes = verifications.filter(v => v.status === 'Verify').length;
      issue.trustScore = Math.round((verifyVotes / verifications.length) * 100);

      const volunteerVotes = verifications.filter(v => v.status === 'Verify' && v.role === 'volunteer').length;
      if (issue.status === 'Reported' && (volunteerVotes >= 1 || verifyVotes >= 3)) {
        issue.status = 'Verified';
        // Trigger municipal dispatch asynchronously
        dispatchIssueToMunicipality(issue, false).catch(err => console.error('Dispatch failed:', err));
      }

      await issue.save();

      // Award User Points
      const dbUser = await User.findById(req.user._id);
      if (dbUser) {
        awardPointsAndBadges(dbUser, 5, false);
        await dbUser.save();
      }

      // Notify citizen reporter
      await createNotificationHelper(
        issue.reportedBy,
        'Issue Verification Update',
        `Your reported issue was ${status.toLowerCase()}ed. Trust score is now ${issue.trustScore}%.`,
        'info',
        false
      );

      // Notify verifier
      await createNotificationHelper(
        req.user._id,
        'Points Earned!',
        `Thank you for verification! +5 Points awarded.`,
        'success',
        false
      );

      res.json({ issue, verification });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
});

// @desc    Update status (Assigned, In Progress, Resolved)
// @route   PATCH /api/issues/:id/status
// @access  Private (Admin)
router.patch('/:id/status', protect, authorize('admin'), async (req, res) => {
  const { status, assignedTeam } = req.body;
  const issueId = req.params.id;

  if (!status || !['Assigned', 'In Progress', 'Resolved'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  if (global.dbFallback) {
    const store = getStore();
    const issue = store.issues.find(i => i._id === issueId);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    issue.status = status;
    if (assignedTeam) {
      issue.assignedTeam = assignedTeam;
    }

    if (status === 'Resolved') {
      issue.resolvedAt = new Date().toISOString();

      // Award reporter +20 points
      const reporter = store.users.find(u => u._id === issue.reportedBy);
      if (reporter) {
        awardPointsAndBadges(reporter, 20, true, store);
        await createNotificationHelper(
          reporter._id,
          'Issue Resolved! 🎉',
          `Your reported issue: "${issue.title}" has been resolved by authorities. +20 Points awarded!`,
          'success',
          true,
          store
        );
      }
    } else {
      // Notify reporter about in progress/assignment
      await createNotificationHelper(
        issue.reportedBy,
        'Issue Status Updated',
        `Your issue status is now "${status}"${assignedTeam ? ' assigned to ' + assignedTeam : ''}.`,
        'info',
        true,
        store
      );
    }

    saveStore(store);
    res.json(issue);
  } else {
    try {
      const issue = await Issue.findById(issueId);
      if (!issue) {
        return res.status(404).json({ message: 'Issue not found' });
      }

      issue.status = status;
      if (assignedTeam) {
        issue.assignedTeam = assignedTeam;
      }

      if (status === 'Resolved') {
        issue.resolvedAt = Date.now();

        // Award reporter
        const reporter = await User.findById(issue.reportedBy);
        if (reporter) {
          awardPointsAndBadges(reporter, 20, false);
          await reporter.save();

          await createNotificationHelper(
            reporter._id,
            'Issue Resolved! 🎉',
            `Your reported issue: "${issue.title}" has been resolved by authorities. +20 Points awarded!`,
            'success',
            false
          );
        }
      } else {
        await createNotificationHelper(
          issue.reportedBy,
          'Issue Status Updated',
          `Your issue status is now "${status}"${assignedTeam ? ' assigned to ' + assignedTeam : ''}.`,
          'info',
          false
        );
      }

      await issue.save();
      res.json(issue);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
});

// @desc    Merge duplicate issue
// @route   POST /api/issues/merge
// @access  Private (Admin)
router.post('/merge', protect, authorize('admin'), async (req, res) => {
  const { duplicateIssueId, primaryIssueId } = req.body;

  if (!duplicateIssueId || !primaryIssueId) {
    return res.status(400).json({ message: 'Both duplicateIssueId and primaryIssueId are required' });
  }

  if (global.dbFallback) {
    const store = getStore();
    const duplicateIssue = store.issues.find(i => i._id === duplicateIssueId);
    const primaryIssue = store.issues.find(i => i._id === primaryIssueId);

    if (!duplicateIssue || !primaryIssue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    duplicateIssue.status = 'Resolved';
    duplicateIssue.aiAnalysis.possibleDuplicateOf = primaryIssueId;

    // Notify duplicate reporter
    await createNotificationHelper(
      duplicateIssue.reportedBy,
      'Complaint Merged',
      `Your complaint was merged with an existing report ("${primaryIssue.title}"). You will track progress via the main report.`,
      'info',
      true,
      store
    );

    saveStore(store);
    res.json({ message: 'Issues merged successfully', duplicateIssue });
  } else {
    try {
      const duplicateIssue = await Issue.findById(duplicateIssueId);
      const primaryIssue = await Issue.findById(primaryIssueId);

      if (!duplicateIssue || !primaryIssue) {
        return res.status(404).json({ message: 'Issue not found' });
      }

      duplicateIssue.status = 'Resolved';
      duplicateIssue.aiAnalysis.possibleDuplicateOf = primaryIssueId;
      await duplicateIssue.save();

      await createNotificationHelper(
        duplicateIssue.reportedBy,
        'Complaint Merged',
        `Your complaint was merged with an existing report ("${primaryIssue.title}"). You will track progress via the main report.`,
        'info',
        false
      );

      res.json({ message: 'Issues merged successfully', duplicateIssue });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
});

// @desc    Toggle like on an issue
// @route   POST /api/issues/:id/like
// @access  Private
router.post('/:id/like', protect, async (req, res) => {
  const issueId = req.params.id;
  const userId = req.user._id.toString();

  if (global.dbFallback) {
    const store = getStore();
    const issue = store.issues.find(i => i._id === issueId);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    if (!issue.likes) issue.likes = [];
    
    const index = issue.likes.indexOf(userId);
    let liked = false;
    if (index > -1) {
      issue.likes.splice(index, 1);
    } else {
      issue.likes.push(userId);
      liked = true;
    }

    saveStore(store);
    res.json({ likes: issue.likes, likesCount: issue.likes.length, liked });
  } else {
    try {
      const issue = await Issue.findById(issueId);
      if (!issue) {
        return res.status(404).json({ message: 'Issue not found' });
      }

      if (!issue.likes) issue.likes = [];

      const index = issue.likes.indexOf(req.user._id);
      let liked = false;
      if (index > -1) {
        issue.likes.splice(index, 1);
      } else {
        issue.likes.push(req.user._id);
        liked = true;
      }

      await issue.save();
      res.json({ likes: issue.likes, likesCount: issue.likes.length, liked });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
});

// @desc    Add comment on an issue
// @route   POST /api/issues/:id/comment
// @access  Private
router.post('/:id/comment', protect, async (req, res) => {
  const issueId = req.params.id;
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ message: 'Comment text is required' });
  }

  const commentObj = {
    _id: 'c_' + Math.random().toString(36).substr(2, 9),
    userId: req.user._id,
    userName: req.user.name,
    text: text.trim(),
    createdAt: new Date().toISOString()
  };

  if (global.dbFallback) {
    const store = getStore();
    const issue = store.issues.find(i => i._id === issueId);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    if (!issue.comments) issue.comments = [];
    issue.comments.push(commentObj);

    saveStore(store);
    res.json({ comments: issue.comments });
  } else {
    try {
      const issue = await Issue.findById(issueId);
      if (!issue) {
        return res.status(404).json({ message: 'Issue not found' });
      }

      if (!issue.comments) issue.comments = [];
      issue.comments.push({
        userId: req.user._id,
        userName: req.user.name,
        text: text.trim()
      });

      await issue.save();
      res.json({ comments: issue.comments });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
});

export default router;
