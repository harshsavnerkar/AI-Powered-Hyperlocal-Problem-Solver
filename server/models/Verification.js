import mongoose from 'mongoose';

const verificationSchema = new mongoose.Schema({
  issueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['citizen', 'volunteer'], required: true },
  status: { type: String, enum: ['Verify', 'Reject'], required: true },
  comments: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Verification = mongoose.models.Verification || mongoose.model('Verification', verificationSchema);
export default Verification;
