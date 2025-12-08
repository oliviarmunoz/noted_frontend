// In development, use relative URLs (proxied by Vite)
// In production, use the environment variable or default to the production API
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "" : "http://localhost:8000");

// Helper function to make API calls
async function apiCall(endpoint, body = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "API request failed");
  }

  return data;
}

// Helper function for file uploads (multipart/form-data)
async function apiCallWithFile(endpoint, formData) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    body: formData, // Don't set Content-Type - browser sets it with boundary
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "API request failed");
  }

  return data;
}

// Friending API
export const friending = {
  sendFriendRequest: (session, targetUsername) =>
    apiCall("/api/Friending/sendFriendRequest", { session, targetUsername }),

  acceptFriendRequest: (session, requester) =>
    apiCall("/api/Friending/acceptFriendRequest", { session, requester }),

  removeFriendRequest: (session, requester, target) =>
    apiCall("/api/Friending/removeFriendRequest", {
      session,
      requester,
      target,
    }),

  removeFriend: (session, friend) =>
    apiCall("/api/Friending/removeFriend", { session, friend }),

  getFriends: (user) => apiCall("/api/Friending/_getFriends", { user }),

  getIncomingRequests: (user) =>
    apiCall("/api/Friending/_getIncomingRequests", { user }),

  getOutgoingRequests: (user) =>
    apiCall("/api/Friending/_getOutgoingRequests", { user }),
};

// Playlist API
export const playlist = {
  createPlaylist: (session, playlistName) =>
    apiCall("/api/Playlist/createPlaylist", { session, playlistName }),

  deletePlaylist: (session, playlistName) =>
    apiCall("/api/Playlist/deletePlaylist", { session, playlistName }),

  addItem: (session, item, playlistName) =>
    apiCall("/api/Playlist/addItem", { session, item, playlistName }),

  addItemToFriendPlaylist: (session, friend, item, playlistName) => {
    // Validate friend parameter
    if (!friend) {
      throw new Error("Friend ID is required");
    }
    return apiCall("/api/Playlist/addItemToFriend", {
      session,
      friend,
      item,
      playlistName,
    });
  },

  deleteItem: (session, item, playlistName) =>
    apiCall("/api/Playlist/deleteItem", { session, item, playlistName }),

  getPlaylistItems: (user, playlistName) =>
    apiCall("/api/Playlist/_getPlaylistItems", { user, playlistName }),

  getUserPlaylists: (user) =>
    apiCall("/api/Playlist/_getUserPlaylists", { user }),
};

// Review API
export const review = {
  postReview: (session, item, ratingNumber, notes) =>
    apiCall("/api/Review/postReview", { session, item, ratingNumber, notes }),

  updateReview: (session, review, ratingNumber, notes) =>
    apiCall("/api/Review/updateReview", {
      session,
      review,
      ratingNumber,
      notes,
    }),

  deleteReview: (session, review) =>
    apiCall("/api/Review/deleteReview", { session, review }),

  getReviewByItemAndUser: (item, user) =>
    apiCall("/api/Review/_getReviewByItemAndUser", { item, user }),

  addComment: (session, review, comment) =>
    apiCall("/api/Review/addComment", { session, review, comment }),

  deleteComment: (session, review, comment) =>
    apiCall("/api/Review/deleteComment", { session, review, comment }),

  getItemReviews: (item) => apiCall("/api/Review/_getItemReviews", { item }),

  getUserReviews: (user) => apiCall("/api/Review/_getUserReviews", { user }),

  getReviewComments: (review) =>
    apiCall("/api/Review/_getReviewComments", { review }),
};

// User Authentication API
export const auth = {
  register: (username, password) =>
    apiCall("/api/UserAuthentication/register", { username, password }),

  login: (username, password) => apiCall("/api/login", { username, password }),

  logout: (session) => apiCall("/api/logout", { session }),

  getSessionUser: (session) => apiCall("/api/Session/_getUser", { session }),

  getUsername: (user) =>
    apiCall("/api/UserAuthentication/_getUsername", { user }),

  getUserByUsername: (username) =>
    apiCall("/api/UserAuthentication/_getUserByUsername", { username }),
};

// MusicDiscovery API
export const musicDiscovery = {
  search: (session, query) =>
    apiCall("/api/MusicDiscovery/search", { session, query }),

  clearSearch: (session) =>
    apiCall("/api/MusicDiscovery/clearSearch", { session }),

  getSearchResults: (user) =>
    apiCall("/api/MusicDiscovery/_getSearchResults", { user }),

  getEntity: (id) => apiCall("/api/MusicDiscovery/_getEntity", { id }),

  getEntityFromId: (externalId) =>
    apiCall("/api/MusicDiscovery/_getEntityFromId", { externalId }),

  getEntityFromUri: (uri) =>
    apiCall("/api/MusicDiscovery/_getEntityFromUri", { uri }),
};

// User Profile API
export const userProfile = {
  updateBio: (session, bio) =>
    apiCall("/api/Profile/updateBio", { session, bio }),

  updateThumbnail: async (session, thumbnailUrlOrFile) => {
    // If it's a File object, convert to data URL and send as JSON
    if (thumbnailUrlOrFile instanceof File) {
      // Convert file to base64 data URL
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(thumbnailUrlOrFile);
      });
      // Send as JSON with thumbnailUrl field
      return apiCall("/api/Profile/updateThumbnail", {
        session,
        thumbnailUrl: dataUrl,
      });
    }
    // Otherwise, treat it as a URL string and use JSON
    return apiCall("/api/Profile/updateThumbnail", {
      session,
      thumbnailUrl: thumbnailUrlOrFile,
    });
  },

  deleteProfile: (session) =>
    apiCall("/api/Profile/deleteProfile", { session }),

  getBio: (user) => apiCall("/api/Profile/_getBio", { user }),

  getThumbnail: (user) => apiCall("/api/Profile/_getThumbnail", { user }),

  getProfile: (user) => apiCall("/api/UserProfile/_getProfile", { user }),
};
