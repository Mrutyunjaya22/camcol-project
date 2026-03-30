import { Link } from 'react-router-dom';
import type { Project } from '../types';
import Avatar from './ui/avatar';
import Badge from './ui/badge';
import { formatCurrency } from '../utils/utils';

const statusVariant: Record<string, 'green' | 'blue' | 'default' | 'red'> = {
  open: 'green', in_progress: 'blue', completed: 'default', closed: 'red',
};

export default function ProjectCard({ project }: { project: Project }) {
  const owner = { name: project.owner_name ?? '', avatar: project.owner_avatar, college: project.owner_college };

  return (
    <Link to={`/projects/${project.id}`}>
      <div className="group bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 h-full flex flex-col">
        <div className="p-5 flex flex-col gap-4 flex-1">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <Badge>{project.category}</Badge>
            <Badge variant={statusVariant[project.status] ?? 'default'}>
              {project.status.replace('_', ' ')}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="font-display font-bold text-neutral-100 text-base leading-snug line-clamp-2">
            {project.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-neutral-500 leading-relaxed line-clamp-3 flex-1">
            {project.description}
          </p>

          {/* Skills */}
          {project.required_skills?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.required_skills.slice(0, 4).map(s => (
                <span key={s} className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700">{s}</span>
              ))}
              {project.required_skills.length > 4 && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-500">+{project.required_skills.length - 4}</span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-neutral-800 mt-auto">
            <div className="flex items-center gap-2.5">
              <Avatar user={owner} size="sm" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-neutral-300 truncate">{owner.name}</p>
                {owner.college && <p className="text-xs text-neutral-600 truncate">{owner.college}</p>}
              </div>
            </div>
            <div className="text-right shrink-0">
              {project.is_paid && project.budget ? (
                <p className="font-display font-extrabold text-yellow-400 text-base">{formatCurrency(Number(project.budget))}</p>
              ) : (
                <Badge variant="green">Volunteer</Badge>
              )}
              <p className="text-xs text-neutral-600 mt-0.5">
                👥 {project.team_size} · {project.duration ?? 'Flexible'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}