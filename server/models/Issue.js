import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Pothole', 'Garbage', 'Water Leakage', 'Streetlight', 'Open Manhole', 'Road Damage', 'Public Safety', 'Others'], 
    default: 'Others' 
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'], 
    default: 'Medium' 
  },
  status: { 
    type: String, 
    enum: ['Reported', 'Verified', 'Assigned', 'In Progress', 'Resolved'], 
    default: 'Reported' 
  },
  location: {
    latitude: { type: Number },
    longitude: { type: Number },
    address: { type: String }
  },
  media: {
    imageUrl: { type: String },
    videoUrl: { type: String }
  },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTeam: { type: String, default: 'Unassigned' },
  trustScore: { type: Number, default: 0 },
  aiAnalysis: {
    categoryConfidence: { type: Number, default: 0 },
    duplicateChecked: { type: Boolean, default: false },
    possibleDuplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' },
    smartSummary: { type: String },
    hotspotScore: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date }
});

const Issue = mongoose.models.Issue || mongoose.model('Issue', issueSchema);
export default Issue;
