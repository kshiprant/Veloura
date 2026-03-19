import mongoose from 'mongoose';

const promptSchema = new mongoose.Schema(
  {
    question: { type: String, trim: true },
    answer: { type: String, trim: true }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    firstName: { type: String, trim: true, default: '' },
    age: { type: Number, min: 18, max: 100 },
    gender: { type: String, enum: ['Man', 'Woman', 'Non-binary', ''], default: '' },
    city: { type: String, trim: true, default: '' },

    location: {
      city: { type: String, trim: true, default: '' },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
      source: {
        type: String,
        enum: ['manual', 'gps', ''],
        default: '',
      },
    },

    showDistance: { type: Boolean, default: true },

    bio: { type: String, maxlength: 500, default: '' },
    photos: [{ type: String }],
    interests: [{ type: String }],
    prompts: { type: [promptSchema], default: [] },
    intention: {
      type: String,
      enum: ['Long-term relationship', 'Something meaningful', 'Still figuring it out', 'New friends', ''],
      default: ''
    },
    onboardingCompleted: { type: Boolean, default: false },

    plan: {
      type: String,
      enum: ['free', 'premium', 'pro'],
      default: 'free'
    },

    subscription: {
      provider: { type: String, default: '' },
      status: { type: String, default: '' },
      billingCycle: { type: String, default: '' },
      paymentMethod: { type: String, default: '' },
      amount: { type: Number, default: 0 },
      startedAt: { type: Date },
      expiresAt: { type: Date },
      autoRenew: { type: Boolean, default: false }
    },

    likesSent: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likesReceived: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likesTodayCount: { type: Number, default: 0 },
    likesResetAt: { type: Date },

    // Conversation Mode daily limit
    conversationSessionsUsed: { type: Number, default: 0 },
    conversationSessionResetAt: { type: Date, default: null },

    matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Match' }],
    lastActiveAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
