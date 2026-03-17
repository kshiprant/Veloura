import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true, maxlength: 2000 }
  },
  { timestamps: true }
);

messageSchema.index({ matchId: 1, createdAt: 1 });

export default mongoose.model('Message', messageSchema);
