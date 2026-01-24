import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/Card/Card.jsx';
import Badge from '../../components/Badge/Badge.jsx';
import Button from '../../components/Button/Button.jsx';
import Loader from '../../components/Loader/Loader.jsx';
import { getMe, endorsePeer, updateProfile, requestAdminUpgrade } from '../../services/user.api.js';
import { createStartup, getMyStartup } from '../../services/startup.api.js';
import { formatLevel, formatTrustScore } from '../../utils/formatters.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRole } from '../../context/RoleContext.jsx';

const tabConfig = [
  { key: 'about', label: 'About' },
  { key: 'skills', label: 'Skills' },
  { key: 'teams', label: 'Teams Joined' },
  { key: 'events', label: 'Events' },
];

const StudentProfile = () => {
  const { signOut } = useAuth();
  const { role, refreshRole } = useRole();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const [endorsementTarget, setEndorsementTarget] = useState('');
  const [endorsementRating, setEndorsementRating] = useState(5);
  const [endorsementComment, setEndorsementComment] = useState('');
  const [endorsementLoading, setEndorsementLoading] = useState(false);
  const [endorsementSuccess, setEndorsementSuccess] = useState(null);

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [nameError, setNameError] = useState('');
  const [nameLoading, setNameLoading] = useState(false);

  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [skillsDraft, setSkillsDraft] = useState([]);
  const [skillInputValue, setSkillInputValue] = useState('');
  const [skillsError, setSkillsError] = useState('');
  const [skillsLoading, setSkillsLoading] = useState(false);

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState('');
  const [bioError, setBioError] = useState('');
  const [bioLoading, setBioLoading] = useState(false);

  const [startupLoading, setStartupLoading] = useState(false);
  const [startupError, setStartupError] = useState('');
  const [startupStatus, setStartupStatus] = useState('NONE');
  const [startupStatusMessage, setStartupStatusMessage] = useState('');
  const [startupReapplyAfter, setStartupReapplyAfter] = useState(null);
  const [myStartup, setMyStartup] = useState(null);
  const [startupLoadedOnce, setStartupLoadedOnce] = useState(false);

  const [startupName, setStartupName] = useState('');
  const [startupProblem, setStartupProblem] = useState('');
  const [startupDomain, setStartupDomain] = useState('');
  const [startupStage, setStartupStage] = useState('IDEA');
  const [startupTotalMembers, setStartupTotalMembers] = useState('');
  const [startupHeadName, setStartupHeadName] = useState('');
  const [startupHeadEmail, setStartupHeadEmail] = useState('');
  const [startupRevenue, setStartupRevenue] = useState(false);
  const [startupActive, setStartupActive] = useState(true);
  const [startupSubmitLoading, setStartupSubmitLoading] = useState(false);
  const [startupSubmitError, setStartupSubmitError] = useState('');

  const normalizeSkills = (skills) => skills.map((skill) => skill.trim()).filter(Boolean);
  const skillsFingerprint = (skills) => normalizeSkills(skills).map((skill) => skill.toLowerCase()).sort().join('|');

  // Admin upgrade states
  const [adminUpgradeLoading, setAdminUpgradeLoading] = useState(false);
  const [adminUpgradeMessage, setAdminUpgradeMessage] = useState('');
  const [adminUpgradeSuccess, setAdminUpgradeSuccess] = useState(false);

  const getDisplayName = (currentProfile) => {
    if (currentProfile?.name) return currentProfile.name;
    if (currentProfile?.email) return currentProfile.email.split('@')[0];
    return 'User';
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

  const tabsToRender = useMemo(() => {
    if (role === 'student') {
      return [...tabConfig, { key: 'startup', label: 'Add Your Startup' }];
    }
    return tabConfig;
  }, [role]);

  useEffect(() => {
    if (role !== 'student' && activeTab === 'startup') {
      setActiveTab('about');
    }
  }, [role, activeTab]);

  useEffect(() => {
    if (role !== 'student') return;
    if (activeTab !== 'startup') return;
    if (startupLoadedOnce) return;

    const loadStartup = async () => {
      setStartupLoading(true);
      setStartupError('');
      try {
        const data = await getMyStartup();
        if (!data) {
          setStartupStatus('NONE');
          setStartupStatusMessage('');
          setStartupReapplyAfter(null);
          setMyStartup(null);
        } else if (data?.status === 'APPROVED') {
          setStartupStatus('APPROVED');
          setStartupStatusMessage('');
          setStartupReapplyAfter(null);
          setMyStartup(data?.startup || null);
        } else if (data?.status === 'PENDING') {
          setStartupStatus('PENDING');
          setStartupStatusMessage(data?.message || 'Application submitted. Please stay tuned for updates.');
          setStartupReapplyAfter(null);
          setMyStartup(null);
        } else if (data?.status === 'REJECTED') {
          setStartupStatus('REJECTED');
          setStartupStatusMessage(data?.message || 'Your application was denied.');
          setStartupReapplyAfter(data?.reapply_after || null);
          setMyStartup(null);
        } else {
          setStartupStatus('NONE');
          setStartupStatusMessage('');
          setStartupReapplyAfter(null);
          setMyStartup(null);
        }
      } catch (err) {
        setStartupError(err.message || 'Unable to load your startup');
      } finally {
        setStartupLoadedOnce(true);
        setStartupLoading(false);
      }
    };

    loadStartup();
  }, [activeTab, role, startupLoadedOnce]);

  useEffect(() => {
    if (profile?.name) {
      setNameInput(profile.name);
    }
    if (profile) {
      const nextSkills = Array.isArray(profile.skills) ? profile.skills : [];
      setSkillsDraft(nextSkills);
      setBioInput(profile.bio || profile.about || '');
    }
  }, [profile]);

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
    return [];
  }, [profile]);
 
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
    const previousSkills = Array.isArray(profile?.skills) ? profile.skills : [];

    if (skillsFingerprint(normalizedSkills) === skillsFingerprint(previousSkills)) {
      setSkillsError('No changes to save');
      return;
    }

    setSkillsLoading(true);
    setSkillsError('');
    try {
      const updatedProfile = await updateProfile({ skills: normalizedSkills });
      setProfile(updatedProfile);
      setIsEditingSkills(false);
      const nextSkills = Array.isArray(updatedProfile?.skills) ? updatedProfile.skills : normalizedSkills;
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
    const resetSkills = Array.isArray(profile?.skills) ? profile.skills : [];
    setSkillsDraft(resetSkills);
    setSkillInputValue('');
    setSkillsError('');
  };

  const handleSaveBio = async () => {
    const trimmed = bioInput.trim();
    const currentBio = profile?.bio || profile?.about || '';

    if (trimmed === currentBio) {
      setBioError('No changes to save');
      return;
    }

    if (trimmed.length > 600) {
      setBioError('Bio is too long (max 600 characters)');
      return;
    }
    setBioLoading(true);
    setBioError('');
    try {
      const updatedProfile = await updateProfile({ bio: trimmed });
      setProfile(updatedProfile);
      setIsEditingBio(false);
      setBioInput(updatedProfile?.bio || updatedProfile?.about || trimmed);
    } catch (err) {
      setBioError(err.message || 'Failed to update about section. Please try again.');
    } finally {
      setBioLoading(false);
    }
  };

  const handleCancelBioEdit = () => {
    setIsEditingBio(false);
    setBioInput(profile?.bio || profile?.about || '');
    setBioError('');
  };

  const handleCreateStartup = async (event) => {
    event.preventDefault();

    const payload = {
      name: startupName.trim(),
      problem: startupProblem.trim(),
      domain: startupDomain.trim(),
      stage: startupStage,
      total_members: startupTotalMembers === '' ? null : Number(startupTotalMembers),
      head_name: startupHeadName.trim(),
      head_email: startupHeadEmail.trim(),
      revenue: Boolean(startupRevenue),
      active: Boolean(startupActive),
    };

    if (!payload.name) {
      setStartupSubmitError('Startup name is required');
      return;
    }
    if (!payload.problem) {
      setStartupSubmitError('Problem statement is required');
      return;
    }
    if (!payload.domain) {
      setStartupSubmitError('Domain is required');
      return;
    }
    if (!payload.stage) {
      setStartupSubmitError('Stage is required');
      return;
    }
    if (!payload.head_name) {
      setStartupSubmitError('Head name is required');
      return;
    }
    if (!payload.head_email) {
      setStartupSubmitError('Head email is required');
      return;
    }

    setStartupSubmitLoading(true);
    setStartupSubmitError('');
    try {
      const response = await createStartup(payload);
      setStartupStatus(response?.status || 'PENDING');
      setStartupStatusMessage(response?.message || 'Application submitted. Please stay tuned for updates.');
      setStartupReapplyAfter(null);
      setMyStartup(null);
      setStartupLoadedOnce(true);
    } catch (err) {
      setStartupSubmitError(err.message || 'Failed to create startup');
    } finally {
      setStartupSubmitLoading(false);
    }
  };

  const renderTabContent = () => {
    if (!profile) return null;

    switch (activeTab) {
      case 'startup':
        if (role !== 'student') {
          return null;
        }

        if (startupLoading) {
          return (
            <div className="py-6">
              <Loader label="Loading startup" />
            </div>
          );
        }

        if (startupError) {
          return (
            <Card className="border border-danger/20 bg-danger/5 text-danger">
              <p className="text-sm">{startupError}</p>
            </Card>
          );
        }

        const reapplyDate = startupReapplyAfter ? new Date(startupReapplyAfter) : null;
        const isReapplyLocked =
          startupStatus === 'REJECTED' && reapplyDate && !Number.isNaN(reapplyDate.getTime()) && new Date() <= reapplyDate;

        if (startupStatus === 'PENDING') {
          return (
            <Card className="space-y-2 border border-border bg-card p-4">
              <Badge variant="neutral">PENDING</Badge>
              <p className="text-sm text-body">{startupStatusMessage || 'Application submitted. Please stay tuned for updates.'}</p>
            </Card>
          );
        }

        if (startupStatus === 'REJECTED' && isReapplyLocked) {
          return (
            <Card className="space-y-2 border border-border bg-card p-4">
              <Badge variant="neutral">REJECTED</Badge>
              <p className="text-sm text-body">{startupStatusMessage || 'Your application was denied.'}</p>
              <p className="text-xs text-muted">You can reapply after {reapplyDate.toLocaleString()}.</p>
            </Card>
          );
        }

        if (startupStatus === 'APPROVED' && myStartup) {
          return (
            <div className="space-y-4">
              <Card className="space-y-3 border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-body">{myStartup.name}</p>
                    <p className="mt-1 text-xs text-muted">{myStartup.domain || '—'}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {myStartup.stage ? <Badge variant="neutral">{myStartup.stage}</Badge> : null}
                    <Badge variant={myStartup.active ? 'success' : 'neutral'}>{myStartup.active ? 'Active' : 'Inactive'}</Badge>
                    <Badge variant={myStartup.revenue ? 'primary' : 'neutral'}>
                      {myStartup.revenue ? 'Revenue' : 'No Revenue'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-muted">What are you solving?</p>
                    <p className="mt-1 text-sm text-body">{myStartup.problem || '—'}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold text-muted">Total Members</p>
                      <p className="mt-1 text-sm text-body">{myStartup.total_members ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted">Head</p>
                      <p className="mt-1 text-sm text-body">{myStartup.head_name || '—'}</p>
                      <p className="text-xs text-muted">{myStartup.head_email || ''}</p>
                    </div>
                  </div>
                </div>
              </Card>
              <p className="text-xs text-muted">You can only create one startup.</p>
            </div>
          );
        }

        const disableForm = startupSubmitLoading || startupStatus === 'PENDING' || startupStatus === 'APPROVED' || isReapplyLocked;

        return (
          <form className="space-y-4" onSubmit={handleCreateStartup}>
            {startupStatus === 'REJECTED' ? (
              <Card className="space-y-1 border border-border bg-card p-4">
                <Badge variant="neutral">REJECTED</Badge>
                <p className="text-sm text-body">{startupStatusMessage || 'Your application was denied.'}</p>
                {reapplyDate && !Number.isNaN(reapplyDate.getTime()) ? (
                  <p className="text-xs text-muted">You can reapply after {reapplyDate.toLocaleString()}.</p>
                ) : null}
              </Card>
            ) : null}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted">Startup Name</label>
              <input
                value={startupName}
                onChange={(event) => {
                  setStartupName(event.target.value);
                  setStartupSubmitError('');
                }}
                required
                disabled={disableForm}
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter startup name"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted">What are you solving?</label>
              <textarea
                value={startupProblem}
                onChange={(event) => {
                  setStartupProblem(event.target.value);
                  setStartupSubmitError('');
                }}
                rows={4}
                disabled={disableForm}
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="Describe the problem you are solving"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted">Domain</label>
                <input
                  value={startupDomain}
                  onChange={(event) => {
                    setStartupDomain(event.target.value);
                    setStartupSubmitError('');
                  }}
                  disabled={disableForm}
                  className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. FinTech"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted">Current Stage</label>
                <select
                  value={startupStage}
                  onChange={(event) => {
                    setStartupStage(event.target.value);
                    setStartupSubmitError('');
                  }}
                  disabled={disableForm}
                  className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                >
                  {['IDEA', 'MVP', 'SCALING'].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted">Total Members</label>
              <input
                type="number"
                min={1}
                value={startupTotalMembers}
                onChange={(event) => {
                  setStartupTotalMembers(event.target.value);
                  setStartupSubmitError('');
                }}
                disabled={disableForm}
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. 3"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted">Head Name</label>
                <input
                  value={startupHeadName}
                  onChange={(event) => {
                    setStartupHeadName(event.target.value);
                    setStartupSubmitError('');
                  }}
                  disabled={disableForm}
                  className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Full name"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted">Head Email</label>
                <input
                  type="email"
                  value={startupHeadEmail}
                  onChange={(event) => {
                    setStartupHeadEmail(event.target.value);
                    setStartupSubmitError('');
                  }}
                  disabled={disableForm}
                  className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted">Revenue Generating?</p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={startupRevenue ? 'primary' : 'ghost'}
                    onClick={() => setStartupRevenue(true)}
                    className="flex-1"
                    disabled={disableForm}
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={!startupRevenue ? 'primary' : 'ghost'}
                    onClick={() => setStartupRevenue(false)}
                    className="flex-1"
                    disabled={disableForm}
                  >
                    No
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted">Active Startup?</p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={startupActive ? 'primary' : 'ghost'}
                    onClick={() => setStartupActive(true)}
                    className="flex-1"
                    disabled={disableForm}
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={!startupActive ? 'primary' : 'ghost'}
                    onClick={() => setStartupActive(false)}
                    className="flex-1"
                    disabled={disableForm}
                  >
                    No
                  </Button>
                </div>
              </div>
            </div>

            {startupSubmitError ? <p className="text-xs text-danger">{startupSubmitError}</p> : null}
            <Button type="submit" variant="primary" className="w-full" disabled={disableForm}>
              {startupSubmitLoading ? <Loader size="sm" label="Creating" inline /> : 'Create startup'}
            </Button>
            <p className="text-xs text-muted">You can only create one startup.</p>
          </form>
        );
      case 'skills':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-body">Skills</h3>
              {isEditingSkills ? null : (
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => {
                    setIsEditingSkills(true);
                    const nextSkills = Array.isArray(profile.skills) ? profile.skills : [];
                    setSkillsDraft(nextSkills);
                    setSkillInputValue('');
                    setSkillsError('');
                  }}
                >
                  Edit
                </Button>
              )}
            </div>

            {isEditingSkills ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {skillsDraft.length ? (
                    skillsDraft.map((skill) => (
                      <span
                        key={skill}
                        className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-body"
                      >
                        {skill}
                        <button
                          type="button"
                          className="text-xs text-danger"
                          onClick={() => handleRemoveSkill(skill)}
                          aria-label={`Remove ${skill}`}
                        >
                          ✕
                        </button>
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-muted">No skills added yet.</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    value={skillInputValue}
                    onChange={(event) => {
                      setSkillInputValue(event.target.value);
                      setSkillsError('');
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    placeholder="Add a skill and press enter"
                    className="flex-1 min-w-[180px] rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button size="sm" variant="primary" onClick={handleAddSkill}>
                    Add
                  </Button>
                </div>

                {skillsError ? <p className="text-xs text-danger">{skillsError}</p> : null}

                <div className="flex gap-2">
                  <Button size="sm" variant="primary" onClick={handleSaveSkills} disabled={skillsLoading}>
                    {skillsLoading ? <Loader size="sm" inline /> : 'Save skills'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleCancelSkillsEdit} disabled={skillsLoading}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <ul className="grid gap-2 text-sm text-muted">
                {(profile.skills || []).map((skill) => (
                  <li key={skill} className="rounded-2xl bg-surface px-4 py-3 text-body">
                    {skill}
                  </li>
                ))}
                {!(profile.skills || []).length ? <p>No skills added yet.</p> : null}
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
            {profile.college && profile.course && profile.branch && profile.year && (
              <div className="rounded-2xl bg-surface p-4">
                <h3 className="mb-2 text-sm font-semibold text-body">Academic Information</h3>
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
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-body">About</h3>
                {isEditingBio ? null : (
                  <Button size="xs" variant="ghost" onClick={() => setIsEditingBio(true)}>
                    Edit
                  </Button>
                )}
              </div>
              {isEditingBio ? (
                <div className="space-y-3">
                  <textarea
                    value={bioInput}
                    onChange={(event) => {
                      setBioInput(event.target.value);
                      setBioError('');
                    }}
                    rows={4}
                    placeholder="Share your passions, projects, and what you're looking to build."
                    className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                  {bioError ? <p className="text-xs text-danger">{bioError}</p> : null}
                  <div className="flex gap-2">
                    <Button size="sm" variant="primary" onClick={handleSaveBio} disabled={bioLoading}>
                      {bioLoading ? <Loader size="sm" inline /> : 'Save about'}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleCancelBioEdit} disabled={bioLoading}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm leading-relaxed text-muted">
                  {profile.bio ||
                    profile.about ||
                    'Add a short bio to tell others about your passions, projects, and what you are looking to build.'}
                </p>
              )}
            </div>
          </div>
        );
    }
  };

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

  const handleAdminUpgrade = async () => {
    setAdminUpgradeLoading(true);
    setAdminUpgradeMessage('');
    setAdminUpgradeSuccess(false);
    setError(null);
    
    try {
      const response = await requestAdminUpgrade();
      setAdminUpgradeMessage(response.message);
      setAdminUpgradeSuccess(response.success);
      
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
      setAdminUpgradeMessage(err.message || 'Failed to process admin upgrade request');
      setAdminUpgradeSuccess(false);
    } finally {
      setAdminUpgradeLoading(false);
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
                <Badge variant="primary">{profile.role?.toUpperCase()}</Badge>
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
            {role === 'student' && (
              <div className="flex flex-col items-end gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  className="rounded-full px-4"
                  onClick={handleAdminUpgrade}
                  disabled={adminUpgradeLoading}
                >
                  {adminUpgradeLoading ? <Loader size="sm" inline /> : 'Become an Admin'}
                </Button>
                {adminUpgradeMessage && (
                  <p className={`text-xs text-center ${adminUpgradeSuccess ? 'text-green-600' : 'text-red-600'}`}>
                    {adminUpgradeMessage}
                  </p>
                )}
              </div>
            )}
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
            <p className="text-xs text-muted">Based on activity and endorsements</p>
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

      <Card className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          {tabsToRender.map((tab) => (
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
        <div>{renderTabContent()}</div>
      </Card>

      <div className="space-y-6">
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

export default StudentProfile;
