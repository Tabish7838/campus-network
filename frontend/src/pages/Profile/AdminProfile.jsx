import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/Card/Card.jsx';
import Badge from '../../components/Badge/Badge.jsx';
import Button from '../../components/Button/Button.jsx';
import Loader from '../../components/Loader/Loader.jsx';
import { getMe, updateProfile } from '../../services/user.api.js';

const statsConfig = [
  { key: 'events_hosted', label: 'Events Hosted' },
  { key: 'participants_managed', label: 'Participants Managed' },
  { key: 'teams_supported', label: 'Teams Supported' },
];

const AdminProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMe();
        setProfile(data);
      } catch (err) {
        setError(err.message || 'Unable to load admin profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const organizerName = profile?.club_name || profile?.organizer_name || profile?.name;
  const organizerType = profile?.organizer_type || profile?.role_label || 'Campus Organizer';
  const logoUrl = profile?.logo_url || profile?.avatar_url;
  const bannerUrl = profile?.banner_url;

  const contactBlocks = useMemo(() => {
    if (!profile) return [];

    return [
      profile.official_email && {
        label: 'Official Email',
        value: profile.official_email,
        action: `mailto:${profile.official_email}`,
      },
      profile.contact_phone && {
        label: 'Phone',
        value: profile.contact_phone,
        action: `tel:${profile.contact_phone}`,
      },
      profile.website && {
        label: 'Website',
        value: profile.website.replace(/^https?:\/\//, ''),
        action: profile.website,
        external: true,
      },
      profile.social_link && {
        label: 'Social',
        value: profile.social_link.replace(/^https?:\/\//, ''),
        action: profile.social_link,
        external: true,
      },
    ].filter(Boolean);
  }, [profile]);

  const eventsManaged = useMemo(() => {
    if (!profile) return [];
    if (Array.isArray(profile.events_organized)) return profile.events_organized;
    if (Array.isArray(profile.past_events)) return profile.past_events;
    return [];
  }, [profile]);

  const handleRefresh = async () => {
    setUpdating(true);
    try {
      const data = await getMe();
      setProfile(data);
    } catch (err) {
      setError(err.message || 'Unable to refresh admin profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateAbout = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const description = formData.get('description')?.toString().trim() || null;

    try {
      setUpdating(true);
      const updated = await updateProfile({ description });
      setProfile((prev) => ({ ...prev, ...updated }));
    } catch (err) {
      setError(err.message || 'Unable to update description');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader label="Loading organizer profile" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border border-danger/30 bg-danger/10 text-danger">
        <p className="font-semibold">{error}</p>
        <Button size="sm" variant="ghost" className="mt-3" onClick={handleRefresh}>
          Retry
        </Button>
      </Card>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-card">
        <div className="relative">
          <div className="h-32 w-full bg-gradient-to-r from-[#141E30] via-[#243B55] to-[#4895EF]" />
          {bannerUrl && (
            <img
              src={bannerUrl}
              alt="Organizer banner"
              className="absolute inset-0 h-32 w-full object-cover opacity-80"
            />
          )}
        </div>
        <div className="space-y-4 p-6">
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex items-center gap-4">
              <div className="relative -mt-14 h-24 w-24 overflow-hidden rounded-2xl border-4 border-surface shadow-lg">
                {logoUrl ? (
                  <img src={logoUrl} alt={organizerName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary-light text-3xl font-semibold text-primary">
                    {organizerName?.[0]?.toUpperCase() || 'A'}
                  </div>
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold text-body">{organizerName || 'Campus Organizer'}</h1>
                  <Badge variant="primary">{organizerType}</Badge>
                  {profile.college && <Badge variant="neutral">{profile.college}</Badge>}
                </div>
                {profile.tagline && <p className="mt-1 text-sm text-muted">{profile.tagline}</p>}
              </div>
            </div>
            <div className="ml-auto flex items-start gap-2">
              <Button
                size="sm"
                variant="primary"
                className="rounded-full px-4"
                onClick={() => navigate('/events/new')}
              >
                Create Event
              </Button>
              <Button
                size="sm"
                variant="subtle"
                className="rounded-full px-4"
                onClick={handleRefresh}
                disabled={updating}
              >
                {updating ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-4 border border-border/60 bg-card p-5">
          <h2 className="text-sm font-semibold text-body">Organizer Overview</h2>
          <p className="text-sm leading-relaxed text-muted">
            {profile.description ||
              'Admins represent verified campus clubs, departments, or innovation cells. Keep your description updated so students can trust and understand your initiatives.'}
          </p>
          <form className="space-y-3" onSubmit={handleUpdateAbout}>
            <textarea
              name="description"
              rows={4}
              defaultValue={profile.description || ''}
              className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="Update your organizer description"
            />
            <div className="flex justify-end">
              <Button type="submit" size="sm" variant="primary" disabled={updating} className="rounded-full px-4">
                {updating ? 'Saving...' : 'Save description'}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="space-y-4 border border-border/60 bg-card p-5">
          <h2 className="text-sm font-semibold text-body">Contact Channels</h2>
          <div className="space-y-3 text-sm text-muted">
            {contactBlocks.length ? (
              contactBlocks.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-3 rounded-2xl bg-surface px-3 py-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">{item.label}</p>
                    <p className="text-body">{item.value}</p>
                  </div>
                  {item.action && (
                    <Button
                      as="a"
                      href={item.action}
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noopener noreferrer' : undefined}
                      size="sm"
                      variant="subtle"
                      className="rounded-full px-4"
                    >
                      {item.external ? 'Open' : 'Contact'}
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted">
                Add official contact information so students and collaborators can reach you effortlessly.
              </p>
            )}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {statsConfig.map((stat) => (
          <Card key={stat.key} className="space-y-2 border border-border/60 bg-card p-4 text-center">
            <p className="text-xs uppercase tracking-wide text-muted">{stat.label}</p>
            <p className="text-2xl font-semibold text-body">{profile[stat.key] ?? '—'}</p>
          </Card>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-body">Events Hosted</h2>
          <Button
            size="sm"
            variant="ghost"
            className="rounded-full px-4"
            onClick={() => navigate('/events')}
          >
            View all events
          </Button>
        </div>
        <div className="space-y-3">
          {eventsManaged.length ? (
            eventsManaged.map((event) => (
              <Card
                key={event.id || event.event_id || event.title}
                className="flex flex-col gap-3 border border-border/60 bg-card p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <p className="font-semibold text-body">{event.title || event.name}</p>
                  <p className="text-xs text-muted">
                    {event.date ? new Date(event.date).toLocaleDateString() : event.timeline_label || 'Schedule TBD'}
                  </p>
                  {event.description && <p className="text-sm text-muted">{event.description}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {typeof event.participant_count === 'number' && (
                    <Badge variant="neutral">{event.participant_count} participants</Badge>
                  )}
                  <Button
                    size="sm"
                    variant="primary"
                    className="rounded-full px-4"
                    onClick={() => navigate(`/events/${event.id || event.event_id}/manage`)}
                  >
                    Manage event
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <Card className="border border-dashed border-border/60 bg-card/60 p-6 text-center text-sm text-muted">
              <p>No events hosted yet. Launch your first hackathon, workshop, or challenge to engage the campus.</p>
              <Button
                size="sm"
                variant="primary"
                className="mt-3 rounded-full px-4"
                onClick={() => navigate('/events/new')}
              >
                Create your first event
              </Button>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminProfile;
