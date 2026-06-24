import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Issue from '../models/Issue.js';
import Verification from '../models/Verification.js';
import Notification from '../models/Notification.js';
import { getStore, saveStore } from '../config/db.js';

export const seedDatabase = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashCitizen = await bcrypt.hash('Harsh@2886', salt);
    const hashVolunteer = await bcrypt.hash('Yash@12', salt);
    const hashAdmin = await bcrypt.hash('Teju@12', salt);

    if (global.dbFallback) {
      const store = getStore();

      // Clear old seed data if present
      if (store.users.some(u => u.email === 'aarav@civic.com')) {
        console.log('🧹 Clearing old JSON fallback seed data...');
        store.users = [];
        store.issues = [];
        store.verifications = [];
        store.notifications = [];
      }

      if (store.users.length > 0) return; // Already seeded

      console.log('🌱 Seeding local JSON database with custom users...');

      const u1 = {
        _id: 'u_harsh',
        name: 'Harsh Savnerkar',
        email: 'harsh@citizen.com',
        phone: '9876543210',
        password: hashCitizen,
        role: 'citizen',
        points: 250,
        rank: 15,
        badges: ['Community Reporter', 'Problem Solver', 'Active Citizen', 'Top Contributor'],
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      const u2 = {
        _id: 'u_yash',
        name: 'Yash Foundation',
        email: 'yashfoundation@volunteer.com',
        phone: '9876543211',
        password: hashVolunteer,
        role: 'volunteer',
        points: 180,
        rank: 8,
        badges: ['Active Citizen', 'Community Validator'],
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
      };

      const u3 = {
        _id: 'u_tejas',
        name: 'Tejas Controller',
        email: 'tejas@admin.com',
        phone: '9876543212',
        password: hashAdmin,
        role: 'admin',
        points: 0,
        rank: 0,
        badges: [],
        createdAt: new Date().toISOString()
      };

      store.users = [u1, u2, u3];

      const i1 = {
        _id: 'i_pothole',
        title: 'Pothole on main road',
        description: 'Large, dangerous pothole near the roundabout blocking traffic.',
        category: 'Pothole',
        priority: 'High',
        status: 'In Progress',
        location: { latitude: 28.6145, longitude: 77.2085, address: 'Sector 15, Main Road' },
        media: { imageUrl: '', videoUrl: '' },
        reportedBy: 'u_harsh',
        assignedTeam: 'Public Works Division',
        trustScore: 85,
        aiAnalysis: { categoryConfidence: 0.94, duplicateChecked: true, possibleDuplicateOf: null, smartSummary: 'Pothole on main road', hotspotScore: 1 },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      };

      const i2 = {
        _id: 'i_leakage',
        title: 'Water leakage',
        description: 'Clean drinking water leaking from underground joint.',
        category: 'Water Leakage',
        priority: 'High',
        status: 'Assigned',
        location: { latitude: 28.6120, longitude: 77.2100, address: 'Sector 12, Near School' },
        media: { imageUrl: '', videoUrl: '' },
        reportedBy: 'u_harsh',
        assignedTeam: 'Water & Sewage Board',
        trustScore: 90,
        aiAnalysis: { categoryConfidence: 0.91, duplicateChecked: true, possibleDuplicateOf: null, smartSummary: 'Water leakage', hotspotScore: 1 },
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      };

      const i3 = {
        _id: 'i_garbage',
        title: 'Garbage pile near market',
        description: 'Piles of wet and dry garbage left uncollected, creating foul smell.',
        category: 'Garbage',
        priority: 'Medium',
        status: 'Resolved',
        location: { latitude: 28.6170, longitude: 77.2050, address: 'Sector 8, City Market' },
        media: { imageUrl: '', videoUrl: '' },
        reportedBy: 'u_harsh',
        assignedTeam: 'Municipal Cleaners',
        trustScore: 100,
        aiAnalysis: { categoryConfidence: 0.98, duplicateChecked: true, possibleDuplicateOf: null, smartSummary: 'Garbage pile near market', hotspotScore: 1 },
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      };

      const i4 = {
        _id: 'i_manhole',
        title: 'Open manhole cover',
        description: 'Manhole cover is completely missing, extremely dangerous for pedestrians.',
        category: 'Open Manhole',
        priority: 'Critical',
        status: 'Reported',
        location: { latitude: 28.6135, longitude: 77.2095, address: 'Sector 10, Main Road' },
        media: { imageUrl: '', videoUrl: '' },
        reportedBy: 'u_harsh',
        assignedTeam: 'Unassigned',
        trustScore: 0,
        aiAnalysis: { categoryConfidence: 0.96, duplicateChecked: true, possibleDuplicateOf: null, smartSummary: 'Open manhole cover', hotspotScore: 2 },
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 hr ago
      };

      const i5 = {
        _id: 'i_streetlight',
        title: 'Streetlight not working',
        description: 'Three consecutive streetlights are out, whole lane is pitch black.',
        category: 'Streetlight',
        priority: 'Low',
        status: 'Resolved',
        location: { latitude: 28.6150, longitude: 77.2110, address: 'Sector 8, Park Street' },
        media: { imageUrl: '', videoUrl: '' },
        reportedBy: 'u_harsh',
        assignedTeam: 'Electricity Dept',
        trustScore: 100,
        aiAnalysis: { categoryConfidence: 0.89, duplicateChecked: true, possibleDuplicateOf: null, smartSummary: 'Streetlight not working', hotspotScore: 1 },
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      };

      store.issues = [i1, i2, i3, i4, i5];

      const v1 = { _id: 'v1', issueId: 'i_pothole', userId: 'u_yash', role: 'volunteer', status: 'Verify', comments: 'Verified, it is huge.', createdAt: new Date().toISOString() };
      const v2 = { _id: 'v2', issueId: 'i_leakage', userId: 'u_yash', role: 'volunteer', status: 'Verify', comments: 'Confirmed, leaking water.', createdAt: new Date().toISOString() };
      store.verifications = [v1, v2];

      const n1 = { _id: 'n1', userId: 'u_harsh', title: 'Points Earned!', message: 'Yash Foundation verified an issue you reported. +5 points earned.', type: 'info', read: false, createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString() };
      const n2 = { _id: 'n2', userId: 'u_harsh', title: 'Issue Reported!', message: 'Harsh reported an issue. +10 points earned.', type: 'success', read: false, createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() };
      const n3 = { _id: 'n3', userId: 'u_harsh', title: 'Issue Resolved!', message: 'Garbage pile resolved. +20 points earned.', type: 'success', read: true, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() };
      store.notifications = [n1, n2, n3];

      saveStore(store);
      console.log('✅ Local JSON database seeded successfully with custom users.');
    } else {
      // Clear old seed data if present in MongoDB
      const oldUserExists = await User.findOne({ email: 'aarav@civic.com' });
      if (oldUserExists) {
        console.log('🧹 Clearing old MongoDB seed data...');
        await User.deleteMany({});
        await Issue.deleteMany({});
        await Verification.deleteMany({});
        await Notification.deleteMany({});
      }

      const userCount = await User.countDocuments({});
      if (userCount > 0) return; // Already seeded

      console.log('🌱 Seeding MongoDB database with custom users...');

      const u1 = await User.create({ name: 'Harsh Savnerkar', email: 'harsh@citizen.com', phone: '9876543210', password: hashCitizen, role: 'citizen', points: 250, rank: 15, badges: ['Community Reporter', 'Problem Solver', 'Active Citizen', 'Top Contributor'] });
      const u2 = await User.create({ name: 'Yash Foundation', email: 'yashfoundation@volunteer.com', phone: '9876543211', password: hashVolunteer, role: 'volunteer', points: 180, rank: 8, badges: ['Active Citizen', 'Community Validator'] });
      const u3 = await User.create({ name: 'Tejas Controller', email: 'tejas@admin.com', phone: '9876543212', password: hashAdmin, role: 'admin', points: 0, rank: 0, badges: [] });

      const i1 = await Issue.create({ title: 'Pothole on main road', description: 'Large, dangerous pothole near the roundabout blocking traffic.', category: 'Pothole', priority: 'High', status: 'In Progress', location: { latitude: 28.6145, longitude: 77.2085, address: 'Sector 15, Main Road' }, reportedBy: u1._id, assignedTeam: 'Public Works Division', trustScore: 85, aiAnalysis: { categoryConfidence: 0.94, duplicateChecked: true, smartSummary: 'Pothole on main road', hotspotScore: 1 } });
      const i2 = await Issue.create({ title: 'Water leakage', description: 'Clean drinking water leaking from underground joint.', category: 'Water Leakage', priority: 'High', status: 'Assigned', location: { latitude: 28.6120, longitude: 77.2100, address: 'Sector 12, Near School' }, reportedBy: u1._id, assignedTeam: 'Water & Sewage Board', trustScore: 90, aiAnalysis: { categoryConfidence: 0.91, duplicateChecked: true, smartSummary: 'Water leakage', hotspotScore: 1 } });
      const i3 = await Issue.create({ title: 'Garbage pile near market', description: 'Piles of wet and dry garbage left uncollected, creating foul smell.', category: 'Garbage', priority: 'Medium', status: 'Resolved', location: { latitude: 28.6170, longitude: 77.2050, address: 'Sector 8, City Market' }, reportedBy: u1._id, assignedTeam: 'Municipal Cleaners', trustScore: 100, aiAnalysis: { categoryConfidence: 0.98, duplicateChecked: true, smartSummary: 'Garbage pile near market', hotspotScore: 1 }, resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) });
      const i4 = await Issue.create({ title: 'Open manhole cover', description: 'Manhole cover is completely missing, extremely dangerous for pedestrians.', category: 'Open Manhole', priority: 'Critical', status: 'Reported', location: { latitude: 28.6135, longitude: 77.2095, address: 'Sector 10, Main Road' }, reportedBy: u1._id, trustScore: 0, aiAnalysis: { categoryConfidence: 0.96, duplicateChecked: true, smartSummary: 'Open manhole cover', hotspotScore: 2 } });
      const i5 = await Issue.create({ title: 'Streetlight not working', description: 'Three consecutive streetlights are out, whole lane is pitch black.', category: 'Streetlight', priority: 'Low', status: 'Resolved', location: { latitude: 28.6150, longitude: 77.2110, address: 'Sector 8, Park Street' }, reportedBy: u1._id, assignedTeam: 'Electricity Dept', trustScore: 100, aiAnalysis: { categoryConfidence: 0.89, duplicateChecked: true, smartSummary: 'Streetlight not working', hotspotScore: 1 }, resolvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) });

      await Verification.create({ issueId: i1._id, userId: u2._id, role: 'volunteer', status: 'Verify', comments: 'Verified, it is huge.' });
      await Verification.create({ issueId: i2._id, userId: u2._id, role: 'volunteer', status: 'Verify', comments: 'Confirmed, leaking water.' });

      await Notification.create({ userId: u1._id, title: 'Points Earned!', message: 'Yash Foundation verified an issue you reported. +5 points earned.', type: 'info', read: false });
      await Notification.create({ userId: u1._id, title: 'Issue Reported!', message: 'Harsh reported an issue. +10 points earned.', type: 'success', read: false });
      await Notification.create({ userId: u1._id, title: 'Issue Resolved!', message: 'Garbage pile resolved. +20 points earned.', type: 'success', read: true });

      console.log('✅ MongoDB database seeded successfully with custom users.');
    }
  } catch (error) {
    console.error('❌ Failed to seed database:', error);
  }
};
