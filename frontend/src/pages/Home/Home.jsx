import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/Card/Card.jsx';
import Button from '../../components/Button/Button.jsx';
import Badge from '../../components/Badge/Badge.jsx';
import Loader from '../../components/Loader/Loader.jsx';
import FilterBar from '../../components/FilterBar/FilterBar.jsx';
import { fetchFeed, createFeedPost } from '../../services/feed.api.js';
import { formatSkills, formatName } from '../../utils/formatters.js';

const stageFilters = [
  { label: 'All', value: 'all' },
  { label: 'Ideation', value: 'Ideation' },
  { label: 'MVP', value: 'MVP' },
  { label: 'Scaling', value: 'Scaling' },
];

const initialFormState = {
  title: '',
  description: '',
  stage: 'Ideation',
  required_skills: '',
};

const Home = () => {
  const navigate = useNavigate();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialFormState);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const loadFeed = async (selectedFilter = filter) => {
    setLoading(true);
    setError(null);
    try {
      const params = selectedFilter !== 'all' ? { stage: selectedFilter } : undefined;
      const data = await fetchFeed(params);
      setFeed(Array.isArray(data?.results) ? data.results : data || []);
    } catch (err) {
      setError(err.message || 'Unable to load feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredFeed = useMemo(() => {
    if (filter === 'all') return feed;
    return feed.filter((item) => item.stage === filter);
  }, [feed, filter]);

  const handleFilterChange = (value) => {
    setFilter(value);
    loadFeed(value);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreatePost = async (event) => {
    event.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      await createFeedPost({
        title: form.title,
        description: form.description,
        stage: form.stage,
        required_skills: form.required_skills.split(',').map((skill) => skill.trim()).filter(Boolean),
      });
      setShowForm(false);
      setForm(initialFormState);
      loadFeed();
    } catch (err) {
      setFormError(err.message || 'Failed to create post');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-3">
  {/* Top row */}
  <div className="flex items-center justify-between">
    <h1 className="text-xl font-semibold text-body">
      Startup Ideas
    </h1>

    <div className="flex items-center gap-2">
      {/* Search icon */}
      <button
        className="rounded-xl border border-border bg-surface px-3 py-2 text-sm"
        aria-label="Search"
      >
        🔍
      </button>

      {/* Add post */}
      <Button
        size="sm"
        variant="primary"
        onClick={() => setShowForm(true)}
      >
        Add
      </Button>
    </div>
  </div>

  {/* Search input */}
  <input
    type="text"
    placeholder="Search ideas, projects, people"
    className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
  />
</header>


      {showForm && (
        <Card className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Share a new idea</h2>
            <p className="text-sm text-muted">Highlight your project to invite collaborators.</p>
          </div>
          <form className="space-y-4" onSubmit={handleCreatePost}>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted" htmlFor="title">
                Title
              </label>
              <input
                id="title"
                name="title"
                required
                value={form.title}
                onChange={handleFormChange}
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. AI Study Buddy"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                value={form.description}
                onChange={handleFormChange}
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="Describe your idea, goals, and what you need"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted" htmlFor="stage">
                  Stage
                </label>
                <select
                  id="stage"
                  name="stage"
                  value={form.stage}
                  onChange={handleFormChange}
                  className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Ideation">Ideation</option>
                  <option value="MVP">MVP</option>
                  <option value="Scaling">Scaling</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted" htmlFor="required_skills">
                  Required Skills
                </label>
                <input
                  id="required_skills"
                  name="required_skills"
                  value={form.required_skills}
                  onChange={handleFormChange}
                  className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Separate multiple skills with commas"
                />
              </div>
            </div>
            {formError && <p className="text-sm text-danger">{formError}</p>}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={formLoading}>
                {formLoading ? <Loader size="sm" label="Posting" inline /> : 'Publish'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <FilterBar filters={stageFilters} activeFilter={filter} onFilterChange={handleFilterChange} />

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader label="Loading feed" />
        </div>
      ) : error ? (
        <Card className="border border-danger/20 bg-danger/5 text-danger">
          <p>{error}</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredFeed.map((post) => (
            <Card key={post.id} className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-body">{post.title}</h3>
                  <p className="mt-1 text-sm text-muted">{post.description}</p>
                </div>
                <Badge variant="primary">{post.stage}</Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                {formatSkills(post.required_skills).map((skill) => (
                  <Badge key={skill} variant="neutral">
                    {skill}
                  </Badge>
                ))}
              </div>

              {Array.isArray(post.collaborators) && post.collaborators.length > 0 && (
                <div className="rounded-2xl bg-surface p-4">
                  <p className="text-xs font-semibold text-muted">Collaborators</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-sm text-body">
                    {post.collaborators.map((person) => {
                      const collaborator =
                        typeof person === 'string'
                          ? person
                          : person?.name || person?.user?.name || person?.user_name || '';
                      return (
                        <span key={person.id || person?.user?.id || collaborator} className="rounded-full bg-card px-3 py-1 shadow">
                          {formatName(collaborator)}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button variant="subtle">View Details</Button>
                <Button variant="primary" onClick={() => navigate('/lets-build')}>
                  Let's Build
                </Button>
              </div>
            </Card>
          ))}

          {!filteredFeed.length && (
            <Card className="text-center text-sm text-muted">
              No projects found for this filter yet. Try exploring other stages or share something new.
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
