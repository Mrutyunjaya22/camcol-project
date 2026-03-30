import { useState, useEffect } from 'react';
import api from '../api/api';
import type { Project } from '../types';

interface ProjectFilters {
  search?: string;
  category?: string;
  status?: string;
  is_paid?: string;
  skill?: string;
  page?: number;
}

export const useProjects = (filters: ProjectFilters = {}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = Object.fromEntries(
          Object.entries(filters).filter(([, v]) => v !== undefined && v !== '')
        );
        const { data } = await api.get('/projects', { params, signal: controller.signal });
        setProjects(data.projects);
        setTotal(data.total);
        setPages(data.pages);
      } catch (e: any) {
        if (e.name !== 'CanceledError') setError(e.response?.data?.message ?? 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };
    fetch();
    return () => controller.abort();
  }, [JSON.stringify(filters)]);

  return { projects, total, pages, loading, error };
};

export const useProject = (id: string) => {
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [userApplication, setUserApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = () => {
    setLoading(true);
    api.get(`/projects/${id}`)
      .then(({ data }) => {
        setProject(data.project);
        setMembers(data.members);
        setUserApplication(data.userApplication);
      })
      .catch(e => setError(e.response?.data?.message ?? 'Failed to load project'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (id) refetch(); }, [id]);

  return { project, members, userApplication, loading, error, refetch };
};