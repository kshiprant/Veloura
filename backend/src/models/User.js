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
    likesSent: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likesReceived: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Match' }],
    lastActiveAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
