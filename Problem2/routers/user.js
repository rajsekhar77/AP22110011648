import express from "express";
import axios from "axios";
const router = express.Router();

const BEARER_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQyNDc1MTMzLCJpYXQiOjE3NDI0NzQ4MzMsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjViMmRlYWYxLTNmNDYtNGVhYS1hZDAzLWY3NDNmNDNkMzRkNyIsInN1YiI6InJhamFzZWtoYXJfYkBzcm1hcC5lZHUuaW4ifSwiY29tcGFueU5hbWUiOiJBRkZPUkQgTUVESUNBTCBURUNITk9MT0dJRVMgUFZULiBMVEQiLCJjbGllbnRJRCI6IjViMmRlYWYxLTNmNDYtNGVhYS1hZDAzLWY3NDNmNDNkMzRkNyIsImNsaWVudFNlY3JldCI6IndreExoUEp3Tm9DZFFmaWEiLCJvd25lck5hbWUiOiJSYWphIFNla2hhciIsIm93bmVyRW1haWwiOiJyYWphc2VraGFyX2JAc3JtYXAuZWR1LmluIiwicm9sbE5vIjoiQVAyMjExMDAxMTY0OCJ9.hrZzGzHIVMuLaCewhZogCDJBH-0DrvkdcpNj8F95ZMg";
const API_BASE_URL = "http://20.244.56.144/test";

async function fetchNumbers(type) {
  try {
    const response = await axios.get(API_BASE_URL, {
      timeout: 500,
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
      },
    });
    return response.data.users || {};
  } catch (error) {
    console.error('Error fetching users:', error.message);
    return {};
  }
}

async function fetchPostsByUser(userId) {
  try {
      const response = await axios.get(`${API_BASE_URL}/users/${userId}/posts`, {
          headers: { Authorization: `Bearer ${BEARER_TOKEN}` }
      });
      return response.data.posts || [];
  } catch (error) {
      return [];
  }
}

// Fetch Comments for a Post
async function fetchCommentsForPost(postId) {
  try {
      const response = await axios.get(`${API_BASE_URL}/posts/${postId}/comments`, {
          headers: { Authorization: `Bearer ${BEARER_TOKEN}` }
      });
      return response.data.comments || [];
  } catch (error) {
      return [];
  }
}

// GET /users - Fetch Top 5 Users with Most Posts
router.get('/users', async (req, res) => {
  const users = await fetchUsers();
  const userPostCounts = [];

  for (const userId in users) {
      const posts = await fetchPostsByUser(userId);
      userPostCounts.push({ userId, name: users[userId], postCount: posts.length });
  }

  userPostCounts.sort((a, b) => b.postCount - a.postCount);
  res.json(userPostCounts.slice(0, 5));
});

// GET /posts?type=latest|popular - Fetch Latest or Most Popular Posts
router.get('/posts', async (req, res) => {
  const { type } = req.query;
  if (!type || (type !== 'latest' && type !== 'popular')) {
      return res.status(400).json({ error: 'Invalid type parameter. Use latest or popular.' });
  }

  const users = await fetchUsers();
  let allPosts = [];

  for (const userId in users) {
      const posts = await fetchPostsByUser(userId);
      allPosts = allPosts.concat(posts);
  }

  if (type === 'latest') {
      allPosts.sort((a, b) => b.id - a.id);
      return res.json(allPosts.slice(0, 5));
  }

  if (type === 'popular') {
      const postCommentCounts = [];

      for (const post of allPosts) {
          const comments = await fetchCommentsForPost(post.id);
          postCommentCounts.push({ ...post, commentCount: comments.length });
      }

      postCommentCounts.sort((a, b) => b.commentCount - a.commentCount);
      return res.json(postCommentCounts.filter(p => p.commentCount > 0));
  }
});

export default router;
