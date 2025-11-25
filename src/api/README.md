# API Integration Guide

This frontend is connected to the backend running at `http://localhost:8000`.

## Usage

Import the API functions you need in your Vue components:

```javascript
import {
  auth,
  friending,
  playlist,
  review,
  session,
  musicDiscovery,
} from "../api/api.js";
```

## Examples

### Authentication

```javascript
// Register a new user
const result = await auth.register("username", "password");
console.log(result.user); // User ID

// Login
const loginResult = await auth.login("username", "password");
console.log(loginResult.user); // User ID

// Create a session after login
const sessionResult = await session.createSession(loginResult.user);
console.log(sessionResult.session); // Session ID

// Get user from session
const sessionUser = await session.getUser(sessionId);

// Delete a session
await session.delete(sessionId);
```

### Friending

```javascript
// Send friend request
await friending.sendFriendRequest(userId, targetId);

// Accept a friend request
await friending.acceptFriendRequest(requesterId, targetId);

// Remove a friend request
await friending.removeFriendRequest(requesterId, targetId);

// Remove a friend
await friending.removeFriend(userId, friendId);

// Get friends list
const friends = await friending.getFriends(userId);
console.log(friends); // Array of friends

// Get incoming friend requests
const incomingRequests = await friending.getIncomingRequests(userId);

// Get outgoing friend requests
const outgoingRequests = await friending.getOutgoingRequests(userId);
```

### Playlists

```javascript
// Create a playlist
const result = await playlist.createPlaylist(userId, "My Playlist");
console.log(result.playlist); // Playlist ID

// Delete a playlist
await playlist.deletePlaylist(userId, "My Playlist");

// Get user's playlists
const playlists = await playlist.getUserPlaylists(userId);

// Add item to playlist
await playlist.addItem(userId, songId, "My Playlist");

// Delete item from playlist
await playlist.deleteItem(userId, songId, "My Playlist");

// Get playlist items
const items = await playlist.getPlaylistItems(userId, "My Playlist");
```

### Reviews

```javascript
// Post a review
const result = await review.postReview(songId, userId, 5, "Great song!");

// Update a review
await review.updateReview(reviewId, 4, "Updated review text");

// Delete a review
await review.deleteReview(reviewId);

// Get review by item and user
const userReview = await review.getReviewByItemAndUser(songId, userId);

// Add a comment to a review
await review.addComment(reviewId, userId, "Nice review!");

// Delete a comment
await review.deleteComment(reviewId, commentId);

// Get reviews for an item
const reviews = await review.getItemReviews(songId);

// Get reviews by a user
const userReviews = await review.getUserReviews(userId);

// Get comments for a review
const comments = await review.getReviewComments(reviewId);
```

### Music Discovery

```javascript
// Search for music
await musicDiscovery.search(userId, "search query");

// Get search results
const results = await musicDiscovery.getSearchResults(userId);

// Clear search
await musicDiscovery.clearSearch(userId);

// Get entity from external ID
const entity = await musicDiscovery.getEntityFromId(externalId);

// Get entity from URI
const entity = await musicDiscovery.getEntityFromUri(uri);
```

## Error Handling

All API calls return promises and will throw errors if the request fails:

```javascript
try {
  const result = await auth.login(username, password);
  // Handle success
} catch (error) {
  console.error("Login failed:", error.message);
  // Handle error
}
```
