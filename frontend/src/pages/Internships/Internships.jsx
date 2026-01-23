import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/Card/Card.jsx';
import Button from '../../components/Button/Button.jsx';
import Badge from '../../components/Badge/Badge.jsx';
import Loader from '../../components/Loader/Loader.jsx';
import FilterBar from '../../components/FilterBar/FilterBar.jsx';
import {
  fetchInternships,
  fetchInternshipById,
  applyToInternship,
} from '../../services/internship.api.js';
import { formatSkills } from '../../utils/formatters.js';

const typeFilters = [
  { label: 'All', value: 'all' },
  { label: 'Internship', value: 'Internship' },
  { label: 'Full-time', value: 'Full-time' },
  { label: 'Project', value: 'Project' },
];

const Internships = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [error, setError] = useState(null);
  const [applyLoading, setApplyLoading] = useState(false);
  const [resumeLink, setResumeLink] = useState('');
  const [successMessage, setSuccessMessage] = useState(null);

  const loadInternships = async (filterValue = activeFilter) => {
    setLoading(true);
    setError(null);
    try {
      const params = filterValue !== 'all' ? { type: filterValue } : undefined;
      const data = await fetchInternships(params);
      const results = Array.isArray(data?.results) ? data.results : data || [];
      setJobs(results);
      if (results.length && !selectedJob) {
        setSelectedJob(results[0]);
      }
    } catch (err) {
      setError(err.message || 'Unable to load internships');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInternships();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredJobs = useMemo(() => {
    if (activeFilter === 'all') return jobs;
    return jobs.filter((job) => job.type === activeFilter);
  }, [jobs, activeFilter]);

  const handleFilterChange = (value) => {
    setActiveFilter(value);
    loadInternships(value);
  };

  const handleSelectJob = async (jobId) => {
    setSuccessMessage(null);
    setResumeLink('');
    try {
      const jobDetails = await fetchInternshipById(jobId);
      setSelectedJob(jobDetails || jobs.find((job) => job.id === jobId) || null);
    } catch (err) {
      setError(err.message || 'Unable to load internship details');
    }
  };

  const handleApply = async (event) => {
    event.preventDefault();
    if (!selectedJob?.id) return;
    setApplyLoading(true);
    setSuccessMessage(null);
    setError(null);
    try {
      await applyToInternship(selectedJob.id, { resumeLink });
      setSuccessMessage('Application sent successfully!');
    } catch (err) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setApplyLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-body">Internships</h1>
        <p className="mt-1 text-sm text-muted">
          Discover opportunities tailored to your skills and interests.
        </p>
      </header>

      <FilterBar filters={typeFilters} activeFilter={activeFilter} onFilterChange={handleFilterChange} />

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader label="Loading internships" />
        </div>
      ) : error ? (
        <Card className="border border-danger/20 bg-danger/5 text-danger">
          <p>{error}</p>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-body">{job.role_title}</h3>
                    <p className="mt-1 text-sm text-muted">{job.company_name}</p>
                  </div>
                  <Badge variant="neutral" className="capitalize">
                    {job.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted">{job.description}</p>
                <div className="flex flex-wrap gap-2">
                  {formatSkills(job.skill_tags || job.required_skills).map((skill) => (
                    <Badge key={skill} variant="neutral">
                      {skill}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-muted">
                    {job.location ? <p>{job.location}</p> : null}
                    {job.mode ? <p>{job.mode}</p> : null}
                  </div>
                  <div className="flex gap-3">
                    <Button variant="subtle" size="sm" onClick={() => handleSelectJob(job.id)}>
                      View Details
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => setSelectedJob(job)}>
                      Apply
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {!filteredJobs.length && (
              <Card className="text-center text-sm text-muted">
                No opportunities found. Try adjusting your filters.
              </Card>
            )}
          </div>

          {selectedJob && (
            <Card className="sticky top-6 space-y-5">
              <div>
                <h2 className="text-xl font-semibold text-body">{selectedJob.role_title}</h2>
                <p className="mt-1 text-sm text-muted">
                  {selectedJob.company_name}
                </p>
              </div>
              <div className="space-y-3 text-sm text-muted">
                <p>{selectedJob.description}</p>
                {selectedJob.salary_range ? <p>Stipend: {selectedJob.salary_range}</p> : null}
                {selectedJob.location ? <p>Location: {selectedJob.location}</p> : null}
                {selectedJob.mode ? <p>Mode: {selectedJob.mode}</p> : null}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Skills</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formatSkills(selectedJob.skill_tags || selectedJob.required_skills).map((skill) => (
                    <Badge key={skill} variant="neutral">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <form className="space-y-3" onSubmit={handleApply}>
                <div className="space-y-2">
                  <label htmlFor="resumeLink" className="text-xs font-semibold text-muted">
                    Resume / Portfolio Link
                  </label>
                  <input
                    id="resumeLink"
                    type="url"
                    required
                    value={resumeLink}
                    onChange={(event) => setResumeLink(event.target.value)}
                    placeholder="https://"
                    className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button type="submit" variant="primary" className="w-full" disabled={applyLoading}>
                  {applyLoading ? <Loader size="sm" label="Submitting" inline /> : 'Submit Application'}
                </Button>
              </form>

              {successMessage ? <p className="text-sm text-success">{successMessage}</p> : null}
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default Internships;
