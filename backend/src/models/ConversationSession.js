import mongoose from 'mongoose';

const conversationSessionSchema = new mongoose.Schema(
  {
    users: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
      ],
      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length === 2;
        },
        message: 'Conversation session must have exactly 2 users.',
      },
    },

    prompt: {
      type: String,
      required: true,
    },

    isAnonymous: {
      type: Boolean,
      default: true,
    },

    isRevealed: {
      type: Boolean,
      default: false,
    },

    revealRequestedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    userMessageCounts: {
      type: Map,
      of: Number,
      default: {},
    },

    totalMessages: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ['active', 'expired', 'ended', 'revealed'],
      default: 'active',
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexes
conversationSessionSchema.index({ users: 1 });
conversationSessionSchema.index({ expiresAt: 1 });

export default mongoose.model('ConversationSession', conversationSessionSchema);
