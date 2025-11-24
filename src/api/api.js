const API_BASE_URL = 'http://localhost:8000';

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
  sendFriendRequest: (sender, receiver) => 
    apiCall('/api/Friending/sendFriendRequest', { sender, receiver }),
  
  acceptFriendRequest: (request) => 
    apiCall('/api/Friending/acceptFriendRequest', { request }),
  
  rejectFriendRequest: (request) => 
    apiCall('/api/Friending/rejectFriendRequest', { request }),
  
  unfriend: (userA, userB) => 
    apiCall('/api/Friending/unfriend', { userA, userB }),
  
  getFriends: (user) => 
    apiCall('/api/Friending/_getFriends', { user }),
  
  getPendingSentFriendRequests: (sender) => 
    apiCall('/api/Friending/_getPendingSentFriendRequests', { sender }),
  
  getPendingReceivedFriendRequests: (receiver) => 
    apiCall('/api/Friending/_getPendingReceivedFriendRequests', { receiver }),
};

// Playlist API
export const playlist = {
  createPlaylist: (owner, name) => 
    apiCall('/api/Playlist/createPlaylist', { owner, name }),
  
  deletePlaylist: (playlist, owner) => 
    apiCall('/api/Playlist/deletePlaylist', { playlist, owner }),
  
  renamePlaylist: (playlist, owner, newName) => 
    apiCall('/api/Playlist/renamePlaylist', { playlist, owner, newName }),
  
  addPlaylistItem: (playlist, owner, item) => 
    apiCall('/api/Playlist/addPlaylistItem', { playlist, owner, item }),
  
  removePlaylistItem: (playlist, owner, item) => 
    apiCall('/api/Playlist/removePlaylistItem', { playlist, owner, item }),
  
  movePlaylistItem: (playlist, owner, item, fromIndex, toIndex) => 
    apiCall('/api/Playlist/movePlaylistItem', { playlist, owner, item, fromIndex, toIndex }),
  
  getPlaylists: (owner) => 
    apiCall('/api/Playlist/_getPlaylists', { owner }),
  
  getPlaylistDetails: (playlist) => 
    apiCall('/api/Playlist/_getPlaylistDetails', { playlist }),
  
  getPlaylistItems: (playlist) => 
    apiCall('/api/Playlist/_getPlaylistItems', { playlist }),
};

// Review API
export const review = {
  postReview: (author, target, rating, text) => 
    apiCall('/api/Review/postReview', { author, target, rating, text }),
  
  updateReview: (review, author, rating, text) => 
    apiCall('/api/Review/updateReview', { review, author, rating, text }),
  
  deleteReview: (review, author) => 
    apiCall('/api/Review/deleteReview', { review, author }),
  
  getReviewsByTarget: (target) => 
    apiCall('/api/Review/_getReviewsByTarget', { target }),
  
  getReviewsByAuthor: (author) => 
    apiCall('/api/Review/_getReviewsByAuthor', { author }),
  
  getAverageRating: (target) => 
    apiCall('/api/Review/_getAverageRating', { target }),
};

// Session API
export const session = {
  createSession: (user, durationMs) => 
    apiCall('/api/Session/createSession', { user, durationMs }),
  
  endSession: (session, user) => 
    apiCall('/api/Session/endSession', { session, user }),
  
  getSessionUser: (session) => 
    apiCall('/api/Session/_getSessionUser', { session }),
  
  getSessionExpiry: (session) => 
    apiCall('/api/Session/_getSessionExpiry', { session }),
  
  cleanupExpiredSessions: () => 
    apiCall('/api/Session/cleanupExpiredSessions', {}),
};

// UserAuthentication API
export const auth = {
  register: (username, password) => 
    apiCall('/api/UserAuthentication/register', { username, password }),
  
  login: (username, password) => 
    apiCall('/api/UserAuthentication/login', { username, password }),
  
  changePassword: (user, oldPassword, newPassword) => 
    apiCall('/api/UserAuthentication/changePassword', { user, oldPassword, newPassword }),
  
  getUsername: (user) => 
    apiCall('/api/UserAuthentication/_getUsername', { user }),
  
  userExists: (username) => 
    apiCall('/api/UserAuthentication/_userExists', { username }),
};
