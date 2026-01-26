import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/Card/Card.jsx';
import Badge from '../../components/Badge/Badge.jsx';
import Button from '../../components/Button/Button.jsx';
import Loader from '../../components/Loader/Loader.jsx';
import { getMe, updateProfile, requestStudentUpgrade } from '../../services/user.api.js';
import { formatLevel, formatTrustScore } from '../../utils/formatters.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRole } from '../../context/RoleContext.jsx';

const tabConfig = [
  { key: 'about', label: 'About' },
  { key: 'skills', label: 'Skills' },
  { key: 'teams', label: 'Internships Posted' },
  { key: 'events', label: 'Events Hosted' },
];

const AdminProfile = () => {
  const { signOut } = useAuth();
  const { role, refreshRole } = useRole();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('about');

  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutInput, setAboutInput] = useState('');
  const [aboutError, setAboutError] = useState('');
  const [aboutLoading, setAboutLoading] = useState(false);

  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [skillsDraft, setSkillsDraft] = useState([]);
  const [skillInputValue, setSkillInputValue] = useState('');
  const [skillsError, setSkillsError] = useState('');
  const [skillsLoading, setSkillsLoading] = useState(false);

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [nameError, setNameError] = useState('');
  const [nameLoading, setNameLoading] = useState(false);

  // Student upgrade states
  const [studentUpgradeLoading, setStudentUpgradeLoading] = useState(false);
  const [studentUpgradeMessage, setStudentUpgradeMessage] = useState('');
  const [studentUpgradeSuccess, setStudentUpgradeSuccess] = useState(false);

  const getDisplayName = (currentProfile) => {
    if (currentProfile?.name) return currentProfile.name;
    if (currentProfile?.email) return currentProfile.email.split('@')[0];
    return 'Admin';
  };

  const handleSaveAbout = async () => {
    const trimmed = aboutInput.trim();
    const currentAbout = profile?.admin_about || '';

    if (trimmed === currentAbout) {
      setAboutError('No changes to save');
      return;
    }

    if (trimmed.length > 600) {
      setAboutError('About is too long (max 600 characters)');
      return;
    }

    setAboutLoading(true);
    setAboutError('');
    try {
      const updatedProfile = await updateProfile({ admin_about: trimmed });
      setProfile(updatedProfile);
      setIsEditingAbout(false);
      setAboutInput(updatedProfile?.admin_about || trimmed);
    } catch (err) {
      setAboutError(err.message || 'Failed to update about section. Please try again.');
    } finally {
      setAboutLoading(false);
    }
  };

  const handleCancelAboutEdit = () => {
    setIsEditingAbout(false);
    setAboutInput(profile?.admin_about || '');
    setAboutError('');
  };

  const handleAddSkill = () => {
    const trimmed = skillInputValue.trim();
    if (!trimmed) {
      setSkillsError('Skill cannot be empty');
      return;
    }
    if (trimmed.length > 40) {
      setSkillsError('Skill name is too long');
      return;
    }
    if (skillsDraft.some((skill) => skill.toLowerCase() === trimmed.toLowerCase())) {
      setSkillsError('Skill already added');
      return;
    }
    setSkillsDraft((prev) => [...prev, trimmed]);
    setSkillInputValue('');
    setSkillsError('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkillsDraft((prev) => prev.filter((skill) => skill !== skillToRemove));
  };

  const handleSaveSkills = async () => {
    const normalizedSkills = normalizeSkills(skillsDraft);
    const previousSkills = Array.isArray(profile?.admin_skills) ? profile.admin_skills : [];

    if (skillsFingerprint(normalizedSkills) === skillsFingerprint(previousSkills)) {
      setSkillsError('No changes to save');
      return;
    }

    setSkillsLoading(true);
    setSkillsError('');
    try {
      const updatedProfile = await updateProfile({ admin_skills: normalizedSkills });
      setProfile(updatedProfile);
      setIsEditingSkills(false);
      const nextSkills = Array.isArray(updatedProfile?.admin_skills) ? updatedProfile.admin_skills : normalizedSkills;
      setSkillsDraft(nextSkills);
      setSkillInputValue('');
    } catch (err) {
      setSkillsError(err.message || 'Failed to update skills. Please try again.');
    } finally {
      setSkillsLoading(false);
    }
  };

  const handleCancelSkillsEdit = () => {
    setIsEditingSkills(false);
    const resetSkills = Array.isArray(profile?.admin_skills) ? profile.admin_skills : [];
    setSkillsDraft(resetSkills);
    setSkillInputValue('');
    setSkillsError('');
  };

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

  useEffect(() => {
    if (profile?.name) {
      setNameInput(profile.name);
    }

    if (profile) {
      setAboutInput(profile.admin_about || '');
      const nextSkills = Array.isArray(profile.admin_skills) ? profile.admin_skills : [];
      setSkillsDraft(nextSkills);
    }
  }, [profile]);

  const normalizeSkills = (skills) => skills.map((skill) => skill.trim()).filter(Boolean);
  const skillsFingerprint = (skills) => normalizeSkills(skills).map((skill) => skill.toLowerCase()).sort().join('|');

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();

    if (trimmed.length < 3) {
      setNameError('Name must be at least 3 characters');
      return;
    }

    if (trimmed.length > 60) {
      setNameError('Name is too long');
      return;
    }

    try {
      setNameLoading(true);
      setNameError('');
      const updatedProfile = await updateProfile({ name: trimmed });
      setProfile(updatedProfile);
      setIsEditingName(false);
    } catch (error) {
      setNameError('Failed to update name. Please try again.');
      // eslint-disable-next-line no-console
      console.error('Error updating name:', error);
    } finally {
      setNameLoading(false);
    }
  };

  const teamsJoined = useMemo(() => {
    if (!profile) return [];
    if (Array.isArray(profile.teams_joined)) return profile.teams_joined;
    return [];
  }, [profile]);

  const eventsParticipated = useMemo(() => {
    if (!profile) return [];
    if (Array.isArray(profile.events_participated)) return profile.events_participated;
    if (Array.isArray(profile.events_attended_list)) return profile.events_attended_list;
    if (Array.isArray(profile.events_organized)) return profile.events_organized;
    return [];
  }, [profile]);

  const tabContent = useMemo(() => {
    if (!profile) return null;
    switch (activeTab) {
      case 'skills':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-body">Admin Skills</h3>
              {isEditingSkills ? null : (
                <Button size="xs" variant="ghost" onClick={() => setIsEditingSkills(true)}>
                  Edit
                </Button>
              )}
            </div>

            {isEditingSkills ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    value={skillInputValue}
                    onChange={(event) => {
                      setSkillInputValue(event.target.value);
                      setSkillsError('');
                    }}
                    placeholder="Add a skill"
                    className="flex-1 rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button type="button" size="sm" variant="primary" onClick={handleAddSkill} disabled={skillsLoading}>
                    Add
                  </Button>
                </div>

                {skillsError ? <p className="text-xs text-danger">{skillsError}</p> : null}

                <div className="flex flex-wrap gap-2">
                  {skillsDraft.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="rounded-full bg-surface px-3 py-2 text-xs text-body"
                    >
                      {skill} ✕
                    </button>
                  ))}
                  {!skillsDraft.length ? <p className="text-sm text-muted">No skills added yet.</p> : null}
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="primary" onClick={handleSaveSkills} disabled={skillsLoading}>
                    {skillsLoading ? <Loader size="sm" inline /> : 'Save'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleCancelSkillsEdit} disabled={skillsLoading}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <ul className="grid gap-2 text-sm text-muted">
                {(profile.admin_skills || []).map((skill) => (
                  <li key={skill} className="rounded-2xl bg-surface px-4 py-3 text-body">
                    {skill}
                  </li>
                ))}
                {!(profile.admin_skills || []).length ? <p>No skills added yet.</p> : null}
              </ul>
            )}
          </div>
        );
      case 'teams':
        return (
          <div className="space-y-3 text-sm text-muted">
            {teamsJoined.length ? (
              teamsJoined.map((team) => (
                <Card key={team.id || team.team_id || team.name} className="space-y-1 border border-border bg-card p-4">
                  <p className="text-body font-semibold">{team.name || team.team_name}</p>
                  {team.event_name && <p className="text-xs text-muted">Event: {team.event_name}</p>}
                  {team.role && <p className="text-xs text-muted">Role: {team.role}</p>}
                </Card>
              ))
            ) : (
              <p>No teams yet. Join events to collaborate with fellow builders.</p>
            )}
          </div>
        );
      case 'events':
        return (
          <div className="space-y-3 text-sm text-muted">
            {eventsParticipated.length ? (
              eventsParticipated.map((event) => (
                <Card key={event.id || event.event_id || event.title} className="space-y-1 border border-border bg-card p-4">
                  <p className="text-body font-semibold">{event.title || event.name}</p>
                  {event.role && <p className="text-xs text-muted">Role: {event.role}</p>}
                  {event.stage && <p className="text-xs text-muted">Stage: {event.stage}</p>}
                  {event.result && <p className="text-xs text-success">Outcome: {event.result}</p>}
                </Card>
              ))
            ) : (
              <p>No event participation recorded yet. Explore events to start building your track record.</p>
            )}
          </div>
        );
      default:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-body">About</h3>
                {isEditingAbout ? null : (
                  <Button size="xs" variant="ghost" onClick={() => setIsEditingAbout(true)}>
                    Edit
                  </Button>
                )}
              </div>

              {isEditingAbout ? (
                <div className="space-y-3">
                  <textarea
                    value={aboutInput}
                    onChange={(event) => {
                      setAboutInput(event.target.value);
                      setAboutError('');
                    }}
                    rows={5}
                    className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Write something about your admin profile..."
                  />
                  {aboutError ? <p className="text-xs text-danger">{aboutError}</p> : null}
                  <div className="flex gap-2">
                    <Button size="sm" variant="primary" onClick={handleSaveAbout} disabled={aboutLoading}>
                      {aboutLoading ? <Loader size="sm" inline /> : 'Save'}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleCancelAboutEdit} disabled={aboutLoading}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm leading-relaxed text-muted">
                  {profile.admin_about ||
                    'Admin profile - manage events, oversee activities, and support the campus ecosystem.'}
                </p>
              )}
            </div>
          </div>
        );
    }
  }, [
    activeTab,
    profile,
    teamsJoined,
    eventsParticipated,
    aboutInput,
    aboutError,
    aboutLoading,
    isEditingAbout,
    isEditingSkills,
    skillInputValue,
    skillsDraft,
    skillsError,
    skillsLoading,
  ]);

  const handleStudentUpgrade = async () => {
    setStudentUpgradeLoading(true);
    setStudentUpgradeMessage('');
    setStudentUpgradeSuccess(false);
    setError(null);
    
    try {
      const response = await requestStudentUpgrade();
      setStudentUpgradeMessage(response.message);
      setStudentUpgradeSuccess(response.success);
      
      if (response.success) {
        // Update the profile with the new role
        setProfile(response.profile);
        // Refresh the role context
        if (refreshRole) {
          await refreshRole();
        }
        // Reload the profile to get updated data
        await loadProfile();
      }
    } catch (err) {
      setStudentUpgradeMessage(err.message || 'Failed to process student upgrade request');
      setStudentUpgradeSuccess(false);
    } finally {
      setStudentUpgradeLoading(false);
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
    <div className="mx-auto max-w-md space-y-6 px-3">
      <header className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-1 items-start gap-4">
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border-2 border-primary-light">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary-light text-2xl text-primary">
                  {getDisplayName(profile)[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="level">
                  Level {profile.level_badge || profile.level || formatLevel(profile.level) || 'Explorer'}
                </Badge>
                <Badge variant="primary">ADMIN</Badge>
                {typeof profile.xp_points === 'number' && <Badge variant="neutral">{profile.xp_points} XP</Badge>}
              </div>
              {!isEditingName ? (
                <div className="mt-2 flex items-center gap-2">
                  <h1 className="text-lg font-semibold text-body">{getDisplayName(profile)}</h1>
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    className="text-xs text-muted"
                    aria-label="Edit name"
                  >
                    ✏️
                  </button>
                </div>
              ) : (
                <div className="mt-2 space-y-2">
                  <input
                    value={nameInput}
                    onChange={(event) => {
                      const value = event.target.value;
                      if (!/^[A-Za-z ]*$/.test(value)) return;
                      setNameInput(value);
                      setNameError('');
                    }}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                  {nameError && <p className="text-xs text-danger">{nameError}</p>}
                  <div className="flex gap-2">
                    <Button size="sm" variant="primary" onClick={handleSaveName} disabled={nameLoading}>
                      {nameLoading ? <Loader size="sm" inline /> : 'Save'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setIsEditingName(false);
                        setNameInput(profile.name);
                        setNameError('');
                      }}
                      disabled={nameLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted">Only letters and spaces allowed.</p>
                </div>
              )}
              <p className="text-sm text-muted">
                {profile.college && profile.course && profile.branch && profile.year ? (
                  <>
                    {profile.course} - {profile.branch} • Year {profile.year}
                    <br />
                    {profile.college}
                  </>
                ) : (
                  profile.batch ? `${profile.batch} • ` : ''
                )}
                {profile.academic_year || profile.program || ''}
              </p>
              <p className="mt-3 text-sm text-muted">{profile.tagline || profile.headline || ''}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {role !== 'admin' ? (
              <div className="flex flex-col items-end gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  className="rounded-full px-4"
                  onClick={handleStudentUpgrade}
                  disabled={studentUpgradeLoading}
                >
                  {studentUpgradeLoading ? <Loader size="sm" inline /> : 'Become a Student'}
                </Button>
                {studentUpgradeMessage && (
                  <p className={`text-xs text-center ${studentUpgradeSuccess ? 'text-green-600' : 'text-red-600'}`}>
                    {studentUpgradeMessage}
                  </p>
                )}
              </div>
            ) : null}
            <Button variant="ghost" size="icon" onClick={signOut}>
              Log out
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-card p-3 shadow-card">
          <div className="space-y-1 text-center">
            <Badge variant="trust" className="mx-auto w-fit text-sm">
              {formatTrustScore(profile.trust_score)} Trust
            </Badge>
            <p className="text-xs text-muted">Based on activity</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-body">{profile.projects_joined ?? teamsJoined.length ?? 0}</p>
            <p className="text-xs uppercase tracking-wide text-muted">Teams</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-body">{profile.events_attended ?? eventsParticipated.length ?? 0}</p>
            <p className="text-xs uppercase tracking-wide text-muted">Events Joined</p>
          </div>
        </div>
      </header>

      {profile.college && profile.course && profile.branch && profile.year && (
        <Card className="space-y-2 border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-body">Academic Information</h3>
          <div className="space-y-1 text-sm text-muted">
            <p>
              <span className="font-medium">College:</span> {profile.college}
            </p>
            <p>
              <span className="font-medium">Course:</span> {profile.course}
            </p>
            <p>
              <span className="font-medium">Branch:</span> {profile.branch}
            </p>
            <p>
              <span className="font-medium">Year:</span> {profile.year}
            </p>
          </div>
        </Card>
      )}

      <Card className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          {tabConfig.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-3 py-2 text-sm font-semibold ${
                tab.key === activeTab ? 'bg-primary text-white' : 'bg-surface text-muted hover:text-body'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div>{tabContent}</div>
      </Card>
    </div>
  );
};

export default AdminProfile;
