import { useEffect, useState } from 'react';
import Card from '../../components/Card/Card.jsx';
import Loader from '../../components/Loader/Loader.jsx';
import Badge from '../../components/Badge/Badge.jsx';
import Button from '../../components/Button/Button.jsx';
import { fetchEvents, joinEventTeam } from '../../services/event.api.js';
import { formatSkills } from '../../utils/formatters.js';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [joinLoadingId, setJoinLoadingId] = useState(null);
  const [successId, setSuccessId] = useState(null);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEvents();
      setEvents(Array.isArray(data?.results) ? data.results : data || []);
    } catch (err) {
      setError(err.message || 'Unable to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleJoinTeam = async (eventId) => {
    setJoinLoadingId(eventId);
    setSuccessId(null);
    setError(null);
    try {
      await joinEventTeam(eventId);
      setSuccessId(eventId);
      await loadEvents();
    } catch (err) {
      setError(err.message || 'Failed to join team');
    } finally {
      setJoinLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-body">Events</h1>
        <p className="mt-1 text-sm text-muted">Hackathons, competitions, and campus innovation challenges.</p>
      </header>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader label="Loading events" />
        </div>
      ) : error ? (
        <Card className="border border-danger/20 bg-danger/5 text-danger">
          <p>{error}</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((eventItem) => (
            <Card key={eventItem.id} className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-body">{eventItem.name}</h3>
                  <p className="mt-1 text-sm text-muted">{eventItem.description}</p>
                </div>
                <Badge variant="neutral">{eventItem.registration_status}</Badge>
              </div>

              <div className="grid gap-3 text-sm text-muted sm:grid-cols-2">
                <p>
                  <span className="font-semibold text-body">Duration:</span> {eventItem.duration}
                </p>
                <p>
                  <span className="font-semibold text-body">Team Size:</span> {eventItem.team_size || 'Varies'}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Required Skills</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formatSkills(eventItem.required_skills).map((skill) => (
                    <Badge key={skill} variant="neutral">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                {successId === eventItem.id ? (
                  <span className="text-sm font-medium text-success">Joined successfully!</span>
                ) : (
                  <span className="text-xs text-muted">{eventItem.schedule || 'Stay tuned for key dates.'}</span>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleJoinTeam(eventItem.id)}
                  disabled={joinLoadingId === eventItem.id}
                >
                  {joinLoadingId === eventItem.id ? <Loader size="sm" label="Joining" inline /> : 'Join Team'}
                </Button>
              </div>
            </Card>
          ))}

          {!events.length && (
            <Card className="text-center text-sm text-muted">
              No events available right now. Check back soon!
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default Events;
