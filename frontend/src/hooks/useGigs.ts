import { useState, useEffect } from 'react';
import api from '../api/api';
import type { Gig } from '../types';

interface GigFilters {
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: number;
}

export const useGigs = (filters: GigFilters = {}) => {
  const [gigs, setGigs] = useState<Gig[]>([]);
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
        const { data } = await api.get('/gigs', { params, signal: controller.signal });
        setGigs(data.gigs);
        setTotal(data.total);
        setPages(data.pages);
      } catch (e: any) {
        if (e.name !== 'CanceledError') setError(e.response?.data?.message ?? 'Failed to load gigs');
      } finally {
        setLoading(false);
      }
    };
    fetch();
    return () => controller.abort();
  }, [JSON.stringify(filters)]);

  return { gigs, total, pages, loading, error };
};

export const useGig = (id: string) => {
  const [gig, setGig] = useState<Gig | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/gigs/${id}`)
      .then(({ data }) => { setGig(data.gig); setReviews(data.reviews); setIsSaved(data.isSaved); })
      .catch(e => setError(e.response?.data?.message ?? 'Failed to load gig'))
      .finally(() => setLoading(false));
  }, [id]);

  return { gig, reviews, isSaved, setIsSaved, loading, error };
};