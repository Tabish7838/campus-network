const supabase = require('../config/db');

const Post = {
  async findAll(filters = {}) {
    let query = supabase.from('posts').select(`
      *,
      author:users(id, name, avatar_url),
      collaborators:post_collaborators(user:users(id, name, avatar_url))
    `);

    if (filters.stage) {
      query = query.eq('stage', filters.stage);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }
    return data;
  },

  async create(postData) {
    const { data, error } = await supabase.from('posts').insert(postData).select().single();
    if (error) {
      throw new Error(error.message);
    }
    return data;
  },

  async addCollaborator(postId, userId) {
    const { data, error } = await supabase.from('post_collaborators').insert({ post_id: postId, user_id: userId });
    if (error) {
      throw new Error(error.message);
    }
    return data;
  },
};

module.exports = Post;
