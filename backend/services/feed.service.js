const Post = require('../models/Post');

const getFeed = async (filters) => {
  try {
    const feed = await Post.findAll(filters);
    return feed;
  } catch (error) {
    throw new Error(`Error fetching feed: ${error.message}`);
  }
};

const createPost = async (authorId, postDetails) => {
  const { title, description, stage, required_skills } = postDetails;

  if (!title || !description || !stage) {
    throw new Error('Title, description, and stage are required');
  }

  try {
    const newPost = await Post.create({
      author_id: authorId,
      title,
      description,
      stage,
      required_skills,
    });
    return newPost;
  } catch (error) {
    throw new Error(`Error creating post: ${error.message}`);
  }
};

const joinPost = async (postId, userId) => {
  if (!postId || !userId) {
    throw new Error('Post ID and User ID are required to join');
  }

  try {
    await Post.addCollaborator(postId, userId);
    // In a real application, you might also want to trigger a notification here.
    return { message: 'Successfully joined post' };
  } catch (error) {
    throw new Error(`Error joining post: ${error.message}`);
  }
};

module.exports = {
  getFeed,
  createPost,
  joinPost,
};
