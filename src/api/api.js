const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Helper function to make API calls
async function apiCall(endpoint, body = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }
  
  return data;
}

// Friending API
export const friending = {
  sendFriendRequest: (user, target) =>
    apiCall("/api/Friending/sendFriendRequest", { user, target }),

  acceptFriendRequest: (requester, target) =>
    apiCall("/api/Friending/acceptFriendRequest", { requester, target }),

  removeFriendRequest: (requester, target) =>
    apiCall("/api/Friending/removeFriendRequest", { requester, target }),

  removeFriend: (user, friend) =>
    apiCall("/api/Friending/removeFriend", { user, friend }),

  getFriends: (user) => apiCall("/api/Friending/_getFriends", { user }),

  getIncomingRequests: (user) =>
    apiCall("/api/Friending/_getIncomingRequests", { user }),

  getOutgoingRequests: (user) =>
    apiCall("/api/Friending/_getOutgoingRequests", { user }),
};

// Playlist API
export const playlist = {
  createPlaylist: (user, playlistName) =>
    apiCall("/api/Playlist/createPlaylist", { user, playlistName }),

  deletePlaylist: (user, playlistName) =>
    apiCall("/api/Playlist/deletePlaylist", { user, playlistName }),

  addItem: (user, item, playlistName) =>
    apiCall("/api/Playlist/addItem", { user, item, playlistName }),

  deleteItem: (user, item, playlistName) =>
    apiCall("/api/Playlist/deleteItem", { user, item, playlistName }),

  getPlaylistItems: (user, playlistName) =>
    apiCall("/api/Playlist/_getPlaylistItems", { user, playlistName }),

  getUserPlaylists: (user) => apiCall("/api/Playlist/_getUserPlaylists", { user }),
};

// Review API
export const review = {
  postReview: (item, user, ratingNumber, notes) =>
    apiCall("/api/Review/postReview", { item, user, ratingNumber, notes }),

  updateReview: (review, ratingNumber, notes) =>
    apiCall("/api/Review/updateReview", { review, ratingNumber, notes }),

  deleteReview: (review) => apiCall("/api/Review/deleteReview", { review }),

  getReviewByItemAndUser: (item, user) =>
    apiCall("/api/Review/_getReviewByItemAndUser", { item, user }),

  addComment: (review, commenter, comment) =>
    apiCall("/api/Review/addComment", { review, commenter, comment }),

  deleteComment: (review, commentId) =>
    apiCall("/api/Review/deleteComment", { review, commentId }),

  getItemReviews: (item) => apiCall("/api/Review/_getItemReviews", { item }),

  getUserReviews: (user) => apiCall("/api/Review/_getUserReviews", { user }),

  getReviewComments: (review) =>
    apiCall("/api/Review/_getReviewComments", { review }),
};

// Session API
export const session = {
  createSession: (user) => 
    apiCall('/api/Session/createSession', { user }),
  
  delete: (session) => 
    apiCall('/api/Session/delete', { session }),

  getUser: (session) =>
    apiCall('/api/Session/_getUser', { session }),
};

// UserAuthentication API
export const auth = {
  register: (username, password) =>
    apiCall("/api/UserAuthentication/register", { username, password }),

  login: (username, password) =>
    apiCall("/api/UserAuthentication/authenticate", { username, password }),

  // changePassword: (user, oldPassword, newPassword) =>
  //   apiCall("/api/UserAuthentication/changePassword", {
  //     user,
  //     oldPassword,
  //     newPassword,
  //   }),

  getUsername: (user) =>
    apiCall("/api/UserAuthentication/_getUsername", { user }),

  getUserByUsername: (username) =>
    apiCall("/api/UserAuthentication/_getUserByUsername", { username }),

  userExists: (username) =>
    apiCall("/api/UserAuthentication/_userExists", { username }),
};

// MusicDiscovery API
export const musicDiscovery = {
  search: (user, query) =>
    apiCall("/api/MusicDiscovery/search", { user, query }),

  clearSearch: (user) => apiCall("/api/MusicDiscovery/clearSearch", { user }),

  getSearchResults: (user) =>
    apiCall("/api/MusicDiscovery/_getSearchResults", { user }),

  getEntityFromId: (externalId) =>
    apiCall("/api/MusicDiscovery/_getEntityFromId", { externalId }),

  getEntityFromUri: (uri) =>
    apiCall("/api/MusicDiscovery/_getEntityFromUri", { uri }),
};
