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
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [stepError, setStepError] = useState('');

  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    age: user?.age || '',
    gender: user?.gender || '',
    city: user?.city || '',
    photos: user?.photos?.length ? user.photos : [],
    bio: user?.bio || '',
    interests: user?.interests || [],
    prompts: user?.prompts?.length
      ? user.prompts
      : promptOptions.map((question) => ({ question, answer: '' })),
    intention: user?.intention || ''
  });

  const progress = useMemo(() => `${step} of 6`, [step]);

  const save = async (overrides = {}) => {
    const payload = {
      ...form,
      ...overrides,
      age: form.age ? Number(form.age) : undefined
    };

    const { data } = await api.put('/users/onboarding', payload);
    setUser(data);
    return data;
  };

  const validateStep = () => {
    const trimmedName = form.firstName.trim();
    const trimmedCity = form.city.trim();
    const numericAge = Number(form.age);
    const trimmedBio = form.bio.trim();
    const answeredPrompts = form.prompts.filter((p) => p.answer?.trim());

    if (step === 1) {
      if (!trimmedName) return 'First name is required.';
      if (!form.age || Number.isNaN(numericAge)) return 'Age is required.';
      if (numericAge < 18 || numericAge > 100) return 'Age must be between 18 and 100.';
      if (!form.gender) return 'Please select your gender.';
      if (!trimmedCity) return 'City is required.';
    }

    if (step === 2) {
      if (!form.photos.length) return 'Please upload a photo before continuing.';
    }

    if (step === 3) {
      if (!trimmedBio) return 'Bio is required.';
      if (trimmedBio.length < 10) return 'Bio should be at least 10 characters.';
    }

    if (step === 4) {
      if (form.interests.length < 3) return 'Please choose at least 3 interests.';
    }

    if (step === 5) {
      if (!answeredPrompts.length) return 'Please answer at least one prompt.';
    }

    if (step === 6) {
      if (!form.intention) return 'Please select what you are looking for.';
    }

    return '';
  };

  const next = async () => {
    setStepError('');
    setPhotoError('');

    const validationMessage = validateStep();
    if (validationMessage) {
      setStepError(validationMessage);
      return;
    }

    if (step < 6) {
      setLoading(true);
      try {
        await save();
        setStep((s) => s + 1);
      } catch (error) {
        console.error('Onboarding save failed:', error);
        setStepError(error?.response?.data?.message || 'Could not save this step.');
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      await save({ onboardingCompleted: true });
      navigate('/discover');
    } catch (error) {
      console.error('Onboarding completion failed:', error);
      setStepError(error?.response?.data?.message || 'Could not complete onboarding.');
    } finally {
      setLoading(false);
    }
  };

  const back = () => {
    setStepError('');
    setPhotoError('');
    setStep((s) => Math.max(1, s - 1));
  };

  const toggleInterest = (item) => {
    setStepError('');
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(item)
        ? prev.interests.filter((v) => v !== item)
        : prev.interests.length < 8
          ? [...prev.interests, item]
          : prev.interests
    }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError('');
    setStepError('');
    setPhotoUploading(true);

    try {
      const photoData = new FormData();
      photoData.append('photo', file);

      const { data } = await api.post('/users/profile/photo', photoData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (data?.photoUrl) {
        setForm((prev) => ({
          ...prev,
          photos: [data.photoUrl]
        }));
      }
    } catch (error) {
      console.error('Photo upload failed:', error);
      setPhotoError(error?.response?.data?.message || 'Photo upload failed');
    } finally {
      setPhotoUploading(false);
    }
  };

  return (
    <div className="auth-page onboarding-page">
      <div className="soft-card full-card">
        <div className="row between center">
          <Logo />
          <span className="muted strong">{progress}</span>
        </div>

        <div className="progress">
          <span style={{ width: `${(step / 6) * 100}%` }} />
        </div>

        <div className="muted strong step-label">
          {['Basics', 'Photos', 'About You', 'Interests', 'Prompts', 'Intentions'][step - 1]}
        </div>

        {step === 1 && (
          <div className="stack gap16 top32">
            <h1>Let's start with the basics</h1>

            <label>First Name</label>
            <input
              value={form.firstName}
              onChange={(e) => {
                setStepError('');
                setForm({ ...form, firstName: e.target.value });
              }}
              placeholder="Your first name"
            />

            <label>Age</label>
            <input
              type="number"
              value={form.age}
              onChange={(e) => {
                setStepError('');
                setForm({ ...form, age: e.target.value });
              }}
              placeholder="25"
            />

            <label>Gender</label>
            <div className="chip-grid three">
              {['Woman', 'Man', 'Non-binary'].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`chip-button ${form.gender === item ? 'selected' : ''}`}
                  onClick={() => {
                    setStepError('');
                    setForm({ ...form, gender: item });
                  }}
                >
                  {item}
                </button>
              ))}
            </div>

            <label>City</label>
            <input
              value={form.city}
              onChange={(e) => {
                setStepError('');
                setForm({ ...form, city: e.target.value });
              }}
              placeholder="Vadodara"
            />
          </div>
        )}

        {step === 2 && (
          <div className="stack gap16 top32">
            <h1>Add your best photo</h1>
            <p className="muted">Upload a clear photo from your device.</p>

            <div className="onboarding-photo-card">
              <div className="onboarding-photo-preview-wrap">
                <img
                  src={form.photos[0] || placeholderPhotos[0]}
                  alt="preview"
                  className="onboarding-photo-preview"
                />
              </div>

              <label className="button outline onboarding-upload-button">
                {photoUploading ? 'Uploading...' : 'Upload Photo'}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handlePhotoUpload}
                  disabled={photoUploading}
                />
              </label>

              {photoError ? <div className="auth-error">{photoError}</div> : null}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="stack gap16 top32">
            <h1>Tell us about yourself</h1>

            <label>Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => {
                setStepError('');
                setForm({ ...form, bio: e.target.value });
              }}
              placeholder="What makes you, you?"
              rows={6}
            />
          </div>
        )}

        {step === 4 && (
          <div className="stack gap16 top32">
            <h1>Pick your interests</h1>
            <p className="muted">Choose 3–8 things you love ({form.interests.length} selected)</p>

            <div className="chip-grid">
              {interestOptions.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`chip-button ${form.interests.includes(item) ? 'selected' : ''}`}
                  onClick={() => toggleInterest(item)}
                >
                  {item}
                </button>
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
                    setStepError('');
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
                <button
                  key={item}
                  type="button"
                  className={`intent-card ${form.intention === item ? 'selected' : ''}`}
                  onClick={() => {
                    setStepError('');
                    setForm({ ...form, intention: item });
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {stepError ? <div className="auth-error top16">{stepError}</div> : null}

        <div className="footer-actions">
          {step > 1 ? (
            <button className="button outline half" onClick={back}>
              Back
            </button>
          ) : (
            <div />
          )}

          <button className="button primary half" onClick={next} disabled={loading || photoUploading}>
            {photoUploading ? 'Uploading...' : loading ? 'Saving...' : step === 6 ? 'Start Discovering' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
