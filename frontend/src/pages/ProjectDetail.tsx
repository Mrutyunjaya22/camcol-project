import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProject } from '../hooks/useProjects';
import { useAuth } from '../context/AuthContext';
import { PageLoader, EmptyState } from '../components/ui/Loader';
import Avatar from '../components/ui/avatar';
import Badge from '../components/ui/badge';
import Stars from '../components/ui/Stars';
import api from '../api/api';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '../lib/utils';

const statusVariant: Record<string, 'green' | 'blue' | 'default' | 'red'> = {
  open: 'green', in_progress: 'blue', completed: 'default', closed: 'red',
};

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { project, members, userApplication, loading, error, refetch } = useProject(id!);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applying, setApplying] = useState(false);
  const [role, setRole] = useState('');
  const [showModal, setShowModal] = useState(false);

  if (loading) return <PageLoader />;
  if (error || !project) return <EmptyState icon="😕" title="Project not found" message={error ?? ''} />;

  const isOwner = user?.id === project.owner_id;
  const owner = { name: project.owner_name ?? '', avatar: project.owner_avatar, college: project.owner_college };

  const handleApply = async () => {
    if (!user) { navigate('/login?redirect=/projects/' + id); return; }
    setApplying(true);
    try {
      await api.post(`/projects/${id}/apply`, { role });
      toast.success('Application submitted!');
      setShowModal(false);
      refetch();
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Application failed');
    } finally {
      setApplying(false);
    }
  };

  const handleMemberStatus = async (userId: string, status: 'accepted' | 'rejected') => {
    try {
      await api.put(`/projects/${id}/members/${userId}`, { status });
      toast.success(`Member ${status}`);
      refetch();
    } catch {
      toast.error('Action failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-6">
            <Link to="/projects" className="hover:text-neutral-400 transition-colors">Projects</Link>
            <span>/</span>
            <Badge>{project.category}</Badge>
          </div>

          <div className="flex items-start gap-3 mb-4 flex-wrap">
            <h1 className="font-display font-extrabold text-3xl md:text-4xl text-white leading-tight flex-1">
              {project.title}
            </h1>
            <Badge variant={statusVariant[project.status] ?? 'default'}>
              {project.status.replace('_', ' ')}
            </Badge>
          </div>

          {/* Owner */}
          <Link to={`/profile/${project.owner_id}`} className="flex items-center gap-3 mb-8 group w-fit">
            <Avatar user={owner} size="md" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-200 group-hover:text-yellow-400 transition-colors">{owner.name}</span>
                {project.owner_verified && <Badge variant="yellow">✓ Verified</Badge>}
              </div>
              <span className="text-sm text-neutral-500">{owner.college}</span>
            </div>
            {project.owner_rating && project.owner_rating > 0 && (
              <Stars rating={project.owner_rating} size="sm" />
            )}
          </Link>

          {/* Description */}
          <section className="mb-8">
            <h2 className="font-display font-bold text-xl text-white mb-3">About this project</h2>
            <p className="text-neutral-400 leading-relaxed whitespace-pre-wrap text-sm">{project.description}</p>
          </section>

          {/* Skills */}
          {project.required_skills?.length > 0 && (
            <section className="mb-8">
              <h2 className="font-display font-bold text-xl text-white mb-3">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {project.required_skills.map(s => (
                  <span key={s} className="text-sm px-3 py-1.5 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300">{s}</span>
                ))}
              </div>
            </section>
          )}

          {/* Members */}
          {members.length > 0 && (
            <section className="mb-8">
              <h2 className="font-display font-bold text-xl text-white mb-4">Team Members ({members.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {members.map((m: any) => (
                  <Link key={m.id} to={`/profile/${m.id}`} className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors">
                    <Avatar user={m} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-200 truncate">{m.name}</p>
                      <p className="text-xs text-neutral-600 truncate">{m.role ?? m.college}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Applicants (owner only) */}
          {isOwner && (
            <section className="mb-8">
              <ApplicantsPanel projectId={id!} onUpdate={refetch} onStatusChange={handleMemberStatus} />
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-80 shrink-0">
          <div className="sticky top-20">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 mb-4">
              <h3 className="font-display font-bold text-lg text-white mb-5">Project Details</h3>

              <div className="flex flex-col gap-3 mb-6">
                {[
                  ['Team Size', `👥 ${project.team_size} members`],
                  ['Duration', `⏱ ${project.duration ?? 'Flexible'}`],
                  ['Type', project.is_paid ? `💰 Paid${project.budget ? ` · ${formatCurrency(Number(project.budget))}` : ''}` : '🎓 Volunteer'],
                  ['Posted', `📅 ${formatDate(project.created_at)}`],
                  ['College Only', project.college_only ? '🔒 Yes' : '🌐 Open to all'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-neutral-500">{label}</span>
                    <span className="text-neutral-200 font-medium">{value}</span>
                  </div>
                ))}
              </div>

              {isOwner ? (
                <Link to={`/projects/${id}/edit`} className="w-full text-center block bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-bold py-3 rounded-xl transition-colors text-sm">
                  Edit Project
                </Link>
              ) : userApplication ? (
                <div className="text-center py-3 rounded-xl bg-neutral-800 border border-neutral-700">
                  <p className="text-sm text-neutral-400">
                    Application: <span className={`font-semibold ${userApplication.status === 'accepted' ? 'text-emerald-400' : userApplication.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'}`}>
                      {userApplication.status}
                    </span>
                  </p>
                </div>
              ) : project.status === 'open' ? (
                <button onClick={() => { if (!user) { navigate('/login'); return; } setShowModal(true); }}
                  className="w-full bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-bold py-3 rounded-xl transition-colors text-sm">
                  Apply to Join
                </button>
              ) : (
                <div className="text-center py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-sm text-neutral-500">
                  Not accepting applications
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Apply Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="font-display font-bold text-xl text-white mb-5">Apply to Join</h3>
            <p className="text-sm text-neutral-500 mb-4">What role are you applying for?</p>
            <input
              value={role} onChange={e => setRole(e.target.value)}
              placeholder="e.g. Frontend Developer, Designer, Content Writer..."
              className="w-full bg-neutral-800 border border-neutral-700 focus:border-yellow-400 rounded-xl px-4 py-3 text-sm text-neutral-100 placeholder-neutral-600 outline-none transition-all mb-5"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl text-sm border border-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors">Cancel</button>
              <button onClick={handleApply} disabled={applying} className="flex-1 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-neutral-950 font-bold py-3 rounded-xl text-sm transition-colors">
                {applying ? 'Applying...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ApplicantsPanel({ projectId, onUpdate, onStatusChange }: { projectId: string; onUpdate: () => void; onStatusChange: (uid: string, s: 'accepted' | 'rejected') => void }) {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/projects/${projectId}/applicants`)
      .then(({ data }) => setApplicants(data.applicants))
      .finally(() => setLoading(false));
  }, [projectId]);

  const pending = applicants.filter(a => a.status === 'pending');
  if (pending.length === 0 && !loading) return null;

  return (
    <div>
      <h2 className="font-display font-bold text-xl text-white mb-4">Pending Applications ({pending.length})</h2>
      {loading ? <p className="text-sm text-neutral-600">Loading...</p> : (
        <div className="flex flex-col gap-3">
          {pending.map((a: any) => (
            <div key={a.id} className="flex items-center gap-3 p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
              <Avatar user={a} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-200">{a.name}</p>
                <p className="text-xs text-neutral-500">{a.role ?? a.college}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onStatusChange(a.id, 'accepted')}
                  className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
                  Accept
                </button>
                <button onClick={() => onStatusChange(a.id, 'rejected')}
                  className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors">
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// need to import useEffect inside the component file
import { useEffect } from 'react';