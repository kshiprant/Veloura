import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

const interestOptions = ['Travel', 'Photography', 'Cooking', 'Hiking', 'Reading', 'Yoga', 'Music', 'Fitness', 'Coffee', 'Writing', 'Meditation', 'Film', 'Volunteering', 'Podcasts'];
const promptOptions = ['The way to my heart is...', 'A perfect first date looks like...'];
const intentionOptions = ['Long-term relationship', 'Something meaningful', 'Still figuring it out', 'New friends'];
const placeholderPhotos = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80'
];

export default function OnboardingPage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    age: user?.age || '',
    gender: user?.gender || 'Man',
    city: user?.city || '',
    photos: user?.photos?.length ? user.photos : [placeholderPhotos[0]],
    bio: user?.bio || '',
    interests: user?.interests || [],
    prompts: user?.prompts?.length ? user.prompts : promptOptions.map((question) => ({ question, answer: '' })),
    intention: user?.intention || 'New friends'
  });

  const progress = useMemo(() => `${step} of 6`, [step]);

  const save = async (overrides = {}) => {
    const payload = { ...form, ...overrides, age: Number(form.age) };
    const { data } = await api.put('/users/onboarding', payload);
    setUser(data);
    return data;
  };

  const next = async () => {
    if (step < 6) {
      setLoading(true);
      try {
        await save();
        setStep((s) => s + 1);
      } finally {
        setLoading(false);
      }
      return;
    }
    setLoading(true);
    try {
      await save({ onboardingCompleted: true });
      navigate('/discover');
    } finally {
      setLoading(false);
    }
  };

  const back = () => setStep((s) => Math.max(1, s - 1));
  const toggleInterest = (item) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(item)
        ? prev.interests.filter((v) => v !== item)
        : prev.interests.length < 8
          ? [...prev.interests, item]
          : prev.interests
    }));
  };

  return (
    <div className="auth-page onboarding-page">
      <div className="soft-card full-card">
        <div className="row between center">
          <Logo />
          <span className="muted strong">{progress}</span>
        </div>
        <div className="progress"><span style={{ width: `${(step / 6) * 100}%` }} /></div>
        <div className="muted strong step-label">{['Basics', 'Photos', 'About You', 'Interests', 'Prompts', 'Intentions'][step - 1]}</div>

        {step === 1 && (
          <div className="stack gap16 top32">
            <h1>Let's start with the basics</h1>
            <label>First Name</label>
            <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="Your first name" />
            <label>Age</label>
            <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="25" />
            <label>Gender</label>
            <div className="chip-grid three">
              {['Woman', 'Man', 'Non-binary'].map((item) => (
                <button key={item} type="button" className={`chip-button ${form.gender === item ? 'selected' : ''}`} onClick={() => setForm({ ...form, gender: item })}>{item}</button>
              ))}
            </div>
            <label>City</label>
            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Vadodara" />
          </div>
        )}

        {step === 2 && (
          <div className="stack gap16 top32">
            <h1>Add your best photos</h1>
            <p className="muted">Paste image URLs for now. Replace with Cloudinary or S3 uploads in production.</p>
            {Array.from({ length: 3 }).map((_, idx) => (
              <input
                key={idx}
                value={form.photos[idx] || ''}
                onChange={(e) => {
                  const nextPhotos = [...form.photos];
                  nextPhotos[idx] = e.target.value;
                  setForm({ ...form, photos: nextPhotos.filter(Boolean) });
                }}
                placeholder={`Photo URL ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="stack gap16 top32">
            <h1>Tell us about yourself</h1>
            <label>Bio</label>
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="What makes you, you?" rows={6} />
          </div>
        )}

        {step === 4 && (
          <div className="stack gap16 top32">
            <h1>Pick your interests</h1>
            <p className="muted">Choose 3–8 things you love ({form.interests.length} selected)</p>
            <div className="chip-grid">
              {interestOptions.map((item) => (
                <button key={item} type="button" className={`chip-button ${form.interests.includes(item) ? 'selected' : ''}`} onClick={() => toggleInterest(item)}>{item}</button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="stack gap16 top32">
            <h1>Answer a prompt</h1>
            {form.prompts.map((prompt, idx) => (
              <div className="prompt-card" key={prompt.question}>
                <div className="prompt-title">{prompt.question}</div>
                <textarea
                  rows={4}
                  value={prompt.answer}
                  onChange={(e) => {
                    const prompts = [...form.prompts];
                    prompts[idx] = { ...prompts[idx], answer: e.target.value };
                    setForm({ ...form, prompts });
                  }}
                  placeholder="Your answer..."
                />
              </div>
            ))}
          </div>
        )}

        {step === 6 && (
          <div className="stack gap16 top32">
            <h1>What are you looking for?</h1>
            <div className="stack gap12">
              {intentionOptions.map((item) => (
                <button key={item} type="button" className={`intent-card ${form.intention === item ? 'selected' : ''}`} onClick={() => setForm({ ...form, intention: item })}>{item}</button>
              ))}
            </div>
          </div>
        )}

        <div className="footer-actions">
          {step > 1 ? <button className="button outline half" onClick={back}>Back</button> : <div />}
          <button className="button primary half" onClick={next} disabled={loading}>{loading ? 'Saving...' : step === 6 ? 'Start Discovering' : 'Continue'}</button>
        </div>
      </div>
    </div>
  );
}
