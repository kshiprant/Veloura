import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
  {
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastMessageAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

matchSchema.index({ users: 1 });

export default mongoose.model('Match', matchSchema);
