import { useCallback, useMemo, useRef, useState } from 'react';
import { fetchFeed } from '../services/feed.api.js';
import { getUserProfileById } from '../services/user.api.js';

const normalizePostsResponse = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.results)) return payload.results;
  return [];
};

const useFeedPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentFilter, setCurrentFilter] = useState('all');
  const authorCacheRef = useRef(new Map());

  const loadPosts = useCallback(async (stageFilter = 'all') => {
    setLoading(true);
    setError(null);
    setCurrentFilter(stageFilter);

    try {
      const params = stageFilter !== 'all' ? { stage: stageFilter } : undefined;
      const feedResponse = await fetchFeed(params);
      const postsData = normalizePostsResponse(feedResponse);

      const authorIds = Array.from(new Set(postsData.map((post) => post.author_id).filter(Boolean)));

      const authorEntries = await Promise.all(
        authorIds.map(async (authorId) => {
          if (authorCacheRef.current.has(authorId)) {
            return [authorId, authorCacheRef.current.get(authorId)];
          }

          try {
            const profile = await getUserProfileById(authorId);
            authorCacheRef.current.set(authorId, profile);
            return [authorId, profile];
          } catch (profileError) {
            authorCacheRef.current.set(authorId, null);
            return [authorId, null];
          }
        }),
      );

      const authorMap = new Map(authorEntries);
      const postsWithAuthor = postsData.map((post) => ({
        ...post,
        authorProfile: authorMap.get(post.author_id) || null,
      }));

      setPosts(postsWithAuthor);
    } catch (fetchError) {
      setPosts([]);
      setError(fetchError.message || 'Unable to load feed');
    } finally {
      setLoading(false);
    }
  }, []);

  const resetCache = useCallback(() => {
    authorCacheRef.current = new Map();
  }, []);

  const value = useMemo(
    () => ({
      posts,
      loading,
      error,
      currentFilter,
      loadPosts,
      resetCache,
    }),
    [posts, loading, error, currentFilter, loadPosts, resetCache],
  );

  return value;
};

export default useFeedPosts;
