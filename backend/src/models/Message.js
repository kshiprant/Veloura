import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    // For normal chat (existing system)
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      default: null, // ❗ was required → now optional
    },

    // For Conversation Mode (NEW)
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ConversationSession',
      default: null,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // ❗ system messages will use null
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    // Message type (NEW)
    type: {
      type: String,
      enum: ['text', 'system', 'reveal_request'],
      default: 'text',
    },

    // Used for reveal request targeting (NEW)
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes
messageSchema.index({ matchId: 1, createdAt: 1 });
messageSchema.index({ session: 1, createdAt: 1 });

export default mongoose.model('Message', messageSchema);
