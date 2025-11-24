# API Integration Guide

This frontend is connected to the backend running at `http://localhost:8000`.

## Usage

Import the API functions you need in your Vue components:

```javascript
import { auth, friending, playlist, review, session } from '../api/api.js';
```

## Examples

### Authentication

```javascript
// Register a new user
const result = await auth.register('username', 'password');
console.log(result.user); // User ID

// Login
const loginResult = await auth.login('username', 'password');
console.log(loginResult.user); // User ID

// Create a session after login
const sessionResult = await session.createSession(loginResult.user, 86400000); // 24 hours
console.log(sessionResult.session); // Session ID
```

### Friending

```javascript
// Send friend request
await friending.sendFriendRequest(senderId, receiverId);

// Get friends list
const friends = await friending.getFriends(userId);
console.log(friends); // Array of friends

// Get pending requests
const requests = await friending.getPendingReceivedFriendRequests(userId);

// Accept a request
await friending.acceptFriendRequest(requestId);
```

### Playlists

```javascript
// Create a playlist
const result = await playlist.createPlaylist(userId, 'My Playlist');
console.log(result.playlist); // Playlist ID

// Get user's playlists
const playlists = await playlist.getPlaylists(userId);

// Add item to playlist
await playlist.addPlaylistItem(playlistId, userId, songId);

// Get playlist items
const items = await playlist.getPlaylistItems(playlistId);
```

### Reviews

```javascript
// Post a review
const result = await review.postReview(userId, songId, 5, 'Great song!');

// Get reviews for a song
const reviews = await review.getReviewsByTarget(songId);

// Get average rating
const avgRating = await review.getAverageRating(songId);
console.log(avgRating[0].averageRating);
```

## Error Handling

All API calls return promises and will throw errors if the request fails:

```javascript
try {
  const result = await auth.login(username, password);
  // Handle success
} catch (error) {
  console.error('Login failed:', error.message);
  // Handle error
}
```