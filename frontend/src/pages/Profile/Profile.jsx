import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/Card/Card.jsx';
import Badge from '../../components/Badge/Badge.jsx';
import Button from '../../components/Button/Button.jsx';
import Loader from '../../components/Loader/Loader.jsx';
import { getMe, endorsePeer } from '../../services/user.api.js';
import { formatLevel, formatTrustScore } from '../../utils/formatters.js';
import { useAuth } from '../../context/AuthContext.jsx';

const tabConfig = [
  { key: 'about', label: 'About' },
  { key: 'skills', label: 'Skills' },
  { key: 'startups', label: 'Startups Joined' },
];

const Profile = () => {
  const { signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const [endorsementTarget, setEndorsementTarget] = useState('');
  const [endorsementRating, setEndorsementRating] = useState(5);
  const [endorsementComment, setEndorsementComment] = useState('');
  const [endorsementLoading, setEndorsementLoading] = useState(false);
  const [endorsementSuccess, setEndorsementSuccess] = useState(null);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMe();
      setProfile(data);
    } catch (err) {
      setError(err.message || 'Unable to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const tabContent = useMemo(() => {
    if (!profile) return null;
    switch (activeTab) {
      case 'skills':
        return (
          <ul className="grid gap-2 text-sm text-muted">
            {(profile.skills || []).map((skill) => (
              <li key={skill} className="rounded-2xl bg-surface px-4 py-3 text-body">
                {skill}
              </li>
            ))}
            {!(profile.skills || []).length ? <p>No skills added yet.</p> : null}
          </ul>
        );
      case 'startups':
        return (
          <ul className="grid gap-3 text-sm text-muted">
            {(profile.startups_joined || []).map((startup) => (
              <li key={startup.id || startup} className="rounded-2xl border border-border bg-card p-4 text-body">
                <p className="font-semibold">{startup.name || startup}</p>
                {startup.role ? <p className="text-xs text-muted">Role: {startup.role}</p> : null}
              </li>
            ))}
            {!(profile.startups_joined || []).length ? <p>No startups joined yet.</p> : null}
          </ul>
        );
      default:
        return (
          <p className="text-sm text-muted leading-relaxed">
            {profile.bio ||
              'Add a short bio to tell others about your passions, projects, and what you are looking to build.'}
          </p>
        );
    }
  }, [activeTab, profile]);

  const handleEndorse = async (event) => {
    event.preventDefault();
    setEndorsementLoading(true);
    setEndorsementSuccess(null);
    setError(null);
    try {
      await endorsePeer({ targetUserId: endorsementTarget, rating: Number(endorsementRating), comment: endorsementComment });
      setEndorsementSuccess('Endorsement submitted!');
      setEndorsementTarget('');
      setEndorsementRating(5);
      setEndorsementComment('');
    } catch (err) {
      setError(err.message || 'Unable to submit endorsement');
    } finally {
      setEndorsementLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader label="Loading profile" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border border-danger/20 bg-danger/5 text-danger">
        <p>{error}</p>
      </Card>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border-4 border-primary-light">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary-light text-2xl text-primary">
                {profile.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="level">Level {profile.level_badge || profile.level}</Badge>
              <Badge variant="primary">{profile.role?.toUpperCase()}</Badge>
            </div>
            <h1 className="mt-2 text-2xl font-semibold text-body">{profile.name}</h1>
            <p className="text-sm text-muted">
              {profile.batch ? `${profile.batch} • ` : ''}
              {profile.academic_year || profile.program || ''}
            </p>
            <p className="mt-3 text-sm text-muted">{profile.tagline || profile.headline || ''}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>
            Log out
          </Button>
        </div>

        <div className="grid gap-4 rounded-3xl bg-card p-5 shadow-card sm:grid-cols-3">
          <div className="space-y-1 text-center">
            <Badge variant="trust" className="mx-auto w-fit text-sm">
              {formatTrustScore(profile.trust_score)} Trust
            </Badge>
            <p className="text-xs text-muted">Based on activity and endorsements</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-body">{profile.projects_joined ?? 0}</p>
            <p className="text-xs uppercase tracking-wide text-muted">Projects</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-body">{profile.events_attended ?? 0}</p>
            <p className="text-xs uppercase tracking-wide text-muted">Events</p>
          </div>
        </div>
      </header>

      <Card className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          {tabConfig.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-4 py-2 text-xs font-semibold ${
                tab.key === activeTab ? 'bg-primary text-white' : 'bg-surface text-muted hover:text-body'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div>{tabContent}</div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-body">Peer Endorsements</h2>
            <Badge variant="neutral">{profile.endorsements?.length || 0}</Badge>
          </div>
          <div className="space-y-3">
            {profile.endorsements?.map((endorsement) => (
              <div key={endorsement.id} className="rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-body">{endorsement.from_user_name}</p>
                    <p className="text-xs text-muted">Rating: {endorsement.rating}/5</p>
                  </div>
                  <Badge variant="trust">{endorsement.rating * 20}%</Badge>
                </div>
                <p className="mt-3 text-sm text-muted">{endorsement.comment}</p>
              </div>
            ))}
            {!profile.endorsements?.length && (
              <p className="text-sm text-muted">No endorsements yet. Invite peers to recognize your work.</p>
            )}
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-body">Endorse a peer</h2>
            <p className="mt-1 text-sm text-muted">Celebrate teammates who delivered impact.</p>
          </div>
          <form className="space-y-3" onSubmit={handleEndorse}>
            <div className="space-y-2">
              <label htmlFor="targetUser" className="text-xs font-semibold text-muted">
                Peer user ID
              </label>
              <input
                id="targetUser"
                required
                value={endorsementTarget}
                onChange={(event) => setEndorsementTarget(event.target.value)}
                placeholder="UUID of teammate"
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="rating" className="text-xs font-semibold text-muted">
                Rating
              </label>
              <select
                id="rating"
                value={endorsementRating}
                onChange={(event) => setEndorsementRating(event.target.value)}
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value} - {value === 5 ? 'Outstanding' : value === 4 ? 'Great' : value === 3 ? 'Solid' : 'Needs Improvement'}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="comment" className="text-xs font-semibold text-muted">
                Comment (optional)
              </label>
              <textarea
                id="comment"
                rows={3}
                value={endorsementComment}
                onChange={(event) => setEndorsementComment(event.target.value)}
                placeholder="Share why they stood out"
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button type="submit" variant="primary" className="w-full" disabled={endorsementLoading}>
              {endorsementLoading ? <Loader size="sm" label="Submitting" inline /> : 'Submit endorsement'}
            </Button>
            {endorsementSuccess && <p className="text-sm text-success">{endorsementSuccess}</p>}
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
