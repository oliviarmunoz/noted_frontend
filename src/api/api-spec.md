# API Specification: Friending Concept

**Purpose:** allow users to establish one-way or two-way "friend" relationships with other users

---

## API Endpoints

### POST /api/Friending/sendFriendRequest

**Description:** Creates a new friend request from one user to another.

**Requirements:**

- `sender` and `receiver` exist; `sender` is not `receiver`; `sender` and `receiver` are not already friends;
- no pending `FriendRequest` from `sender` to `receiver` or `receiver` to `sender`

**Effects:**

- creates a new `FriendRequest` `r`; sets `sender` of `r` to `sender`; sets `receiver` of `r` to `receiver`;
- returns `r` as `request`

**Request Body:**

```json
{
  "user": "string",
  "target": "string"
}
```

**Success Response Body (Action):**

```json
{
  "request": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/Friending/acceptFriendRequest

**Description:** Accepts a pending friend request, making the users friends.

**Requirements:**

- `requester` and `target` exist; pending friend request exists from `requester` to `target`

**Effects:**

- adds `requester` to `friends` of `target`;
- adds `target` to `friends` of `requester`;
- deletes the friend request

**Request Body:**

```json
{
  "requester": "string",
  "target": "string"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/Friending/removeFriendRequest

**Description:** Removes a pending friend request, deleting it.

**Requirements:**

- `requester` and `target` exist; pending friend request exists from `requester` to `target`

**Effects:**

- deletes the friend request from `requester` to `target`

**Request Body:**

```json
{
  "requester": "string",
  "target": "string"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/Friending/removeFriend

**Description:** Removes the friendship between two users.

**Requirements:**

- `user` and `friend` exist and are friends

**Effects:**

- removes `friend` from `friends` of `user`;
- removes `user` from `friends` of `friend`

**Request Body:**

```json
{
  "user": "string",
  "friend": "string"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/Friending/\_getFriends

**Description:** Returns a list of users who are friends with the specified user.

**Requirements:**

- `user` exists

**Effects:**

- returns set of all `User`s that are friends with `user`

**Request Body:**

```json
{
  "user": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "friend": "string"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/Friending/\_getOutgoingRequests

**Description:** Returns a list of pending friend requests sent by the specified user.

**Requirements:**

- `user` exists

**Effects:**

- returns set of all `FriendRequest`s sent by `user` that are pending, along with their `target`

**Request Body:**

```json
{
  "user": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "request": "string",
    "target": "string"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/Friending/\_getIncomingRequests

**Description:** Returns a list of pending friend requests received by the specified user.

**Requirements:**

- `user` exists

**Effects:**

- returns set of all `FriendRequest`s received by `user` that are pending, along with their `requester`

**Request Body:**

```json
{
  "user": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "request": "string",
    "requester": "string"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

# API Specification: Playlist Concept

**Purpose:** allow users to create and manage ordered lists of generic items

---

## API Endpoints

### POST /api/Playlist/createPlaylist

**Description:** Creates a new playlist for a given owner with a specified name.

**Requirements:**

- `user` exists; no `Playlist` with `playlistName` exists for `user`

**Effects:**

- creates a new `Playlist` `p`; sets `owner` of `p` to `user`; sets `name` of `p` to `playlistName`;
- sets `items` of `p` to empty list; returns `p` as `playlist`

**Request Body:**

```json
{
  "user": "string",
  "playlistName": "string"
}
```

**Success Response Body (Action):**

```json
{
  "playlist": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/Playlist/deletePlaylist

**Description:** Deletes a playlist, provided the correct owner is specified.

**Requirements:**

- `user` exists; `Playlist` with `playlistName` exists for `user`

**Effects:**

- deletes the playlist with `playlistName` owned by `user`

**Request Body:**

```json
{
  "user": "string",
  "playlistName": "string"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/Playlist/addPlaylistItem

**Description:** Adds a generic item to the end of a playlist.

**Requirements:**

- `user` exists; `Playlist` with `playlistName` exists for `user`; `item` exists (externally defined)

**Effects:**

- adds `item` to the end of `items` of the playlist with `playlistName` owned by `user`

**Request Body:**

```json
{
  "user": "string",
  "item": "string",
  "playlistName": "string"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/Playlist/removePlaylistItem

**Description:** Removes the first occurrence of a specified item from a playlist.

**Requirements:**

- `user` exists; `Playlist` with `playlistName` exists for `user`; `item` is in `items` of the playlist

**Effects:**

- removes first occurrence of `item` from `items` of the playlist with `playlistName` owned by `user`

**Request Body:**

```json
{
  "user": "string",
  "item": "string",
  "playlistName": "string"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/Playlist/\_getUserPlaylists

**Description:** Returns a list of playlists owned by a specified user, along with their names.

**Requirements:**

- `user` exists

**Effects:**

- returns set of all `Playlist`s owned by `user`, with their `name`

**Request Body:**

```json
{
  "user": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "playlist": "string",
    "name": "string"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/Playlist/\_getPlaylistItems

**Description:** Returns an ordered list of items contained within a specified playlist.

**Requirements:**

- `user` exists; `Playlist` with `playlistName` exists for `user`

**Effects:**

- returns ordered list of `item`s in the playlist with `playlistName` owned by `user`

**Request Body:**

```json
{
  "user": "string",
  "playlistName": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "item": "string"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

# API Specification: Review Concept

**Purpose:** allow users to rate and provide textual feedback on generic targets

---

## API Endpoints

### POST /api/Review/postReview

**Description:** Allows a user to post a new review for an item with a rating and notes.

**Requirements:**

- `user` exists; `item` exists; `ratingNumber` is between 1 and 5 inclusive;
- `user` has not previously reviewed `item`

**Effects:**

- creates a new `Review` `r`; sets `author` of `r` to `user`; sets `target` of `r` to `item`;
- sets `rating` of `r` to `ratingNumber`; sets `text` of `r` to `notes`; returns `r` as `review`

**Request Body:**

```json
{
  "item": "string",
  "user": "string",
  "ratingNumber": "number",
  "notes": "string"
}
```

**Success Response Body (Action):**

```json
{
  "review": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/Review/updateReview

**Description:** Updates the rating and notes of an existing review.

**Requirements:**

- `review` exists; `ratingNumber` is between 1 and 5 inclusive

**Effects:**

- sets `rating` of `review` to `ratingNumber`; sets `text` of `review` to `notes`

**Request Body:**

```json
{
  "review": "string",
  "ratingNumber": "number",
  "notes": "string"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/Review/deleteReview

**Description:** Deletes an existing review.

**Requirements:**

- `review` exists

**Effects:**

- deletes `review`

**Request Body:**

```json
{
  "review": "string"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/Review/\_getReviewByItemAndUser

**Description:** Returns the review for a specific item by a specific user.

**Requirements:**

- `item` exists; `user` exists

**Effects:**

- returns the `Review` for `item` by `user`, if it exists

**Request Body:**

```json
{
  "item": "string",
  "user": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "review": "string",
    "rating": "number",
    "text": "string"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/Review/addComment

**Description:** Adds a comment to a review.

**Requirements:**

- `review` exists; `commenter` exists

**Effects:**

- creates a new comment on `review` by `commenter` with text `comment`

**Request Body:**

```json
{
  "review": "string",
  "commenter": "string",
  "comment": "string"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/Review/deleteComment

**Description:** Deletes a comment from a review.

**Requirements:**

- `review` exists; `commentId` exists and is a comment on `review`

**Effects:**

- deletes the comment with `commentId` from `review`

**Request Body:**

```json
{
  "review": "string",
  "commentId": "string"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/Review/\_getItemReviews

**Description:** Returns a list of all reviews for a specific item, including author, rating, and text.

**Requirements:**

- `item` exists

**Effects:**

- returns set of all `Review`s for `item`, with their `author`, `rating`, and `text`

**Request Body:**

```json
{
  "item": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "review": "string",
    "author": "string",
    "rating": "number",
    "text": "string"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/Review/\_getUserReviews

**Description:** Returns a list of all reviews posted by a specific user, including target, rating, and text.

**Requirements:**

- `user` exists

**Effects:**

- returns set of all `Review`s by `user`, with their `target`, `rating`, and `text`

**Request Body:**

```json
{
  "user": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "review": "string",
    "target": "string",
    "rating": "number",
    "text": "string"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/Review/\_getReviewComments

**Description:** Returns all comments for a specific review.

**Requirements:**

- `review` exists

**Effects:**

- returns set of all comments on `review`, with their `commenter` and `comment` text

**Request Body:**

```json
{
  "review": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "commentId": "string",
    "commenter": "string",
    "comment": "string"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

# API Specification: Session Concept

**Purpose:** support authentication and user state across multiple requests via session tokens

---

## API Endpoints

### POST /api/Session/createSession

**Description:** Creates a new session for a user, returning a session ID.

**Requirements:**

- `user` exists

**Effects:**

- creates a new `Session` `s`; sets `user` of `s` to `user`;
- returns `s` as `session`

**Request Body:**

```json
{
  "user": "string"
}
```

**Success Response Body (Action):**

```json
{
  "session": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/Session/delete

**Description:** Deletes an active session.

**Requirements:**

- `session` exists

**Effects:**

- deletes `session`

**Request Body:**

```json
{
  "session": "string"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/Session/\_getUser

**Description:** Returns the user associated with a given active session.

**Requirements:**

- `session` exists and is not expired

**Effects:**

- returns the `user` associated with `session`

**Request Body:**

```json
{
  "session": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "user": "string"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

# API Specification: UserAuthentication Concept

**Purpose:** allow users to register with a unique username and password, and then login to authenticate

---

## API Endpoints

### POST /api/UserAuthentication/register

**Description:** Registers a new user with a unique username and password.

**Requirements:**

- `username` is unique; `password` meets complexity requirements (e.g., min length)

**Effects:**

- creates a new `User` `u`; sets `username` of `u` to `username`;
- sets `password` of `u` to a hashed version of `password`; returns `u` as `user`

**Request Body:**

```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response Body (Action):**

```json
{
  "user": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/UserAuthentication/login

**Description:** Authenticates a user with a username and password, returning the user ID on success.

**Requirements:**

- `username` and `password` match an existing user

**Effects:**

- returns the `user` if credentials are valid

**Request Body:**

```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response Body (Action):**

```json
{
  "user": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/UserAuthentication/changePassword

**Description:** Allows a user to change their password, requiring the old password for verification.

**Requirements:**

- `user` exists; `oldPassword` matches current password of `user`; `newPassword` meets complexity requirements

**Effects:**

- sets `password` of `user` to a hashed version of `newPassword`

**Request Body:**

```json
{
  "user": "string",
  "oldPassword": "string",
  "newPassword": "string"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/UserAuthentication/\_getUsername

**Description:** Returns the username for a given user ID.

**Requirements:**

- `user` exists

**Effects:**

- returns the `username` of `user`

**Request Body:**

```json
{
  "user": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "username": "string"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/UserAuthentication/\_getUserByUsername

**Description:** Returns the user ID for a given username.

**Requirements:**

- `username` exists

**Effects:**

- returns the `user` ID associated with `username`

**Request Body:**

```json
{
  "username": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "user": "string"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/UserAuthentication/\_userExists

**Description:** Checks if a user with the specified username exists.

**Requirements:**

- true

**Effects:**

- returns `true` if a user with `username` exists, `false` otherwise

**Request Body:**

```json
{
  "username": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "exists": "boolean"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

# API Specification: MusicDiscovery Concept

**Purpose:** allow users to search for music and retrieve entity information

---

## API Endpoints

### POST /api/MusicDiscovery/search

**Description:** Performs a search for music entities based on a query string.

**Requirements:**

- `user` exists

**Effects:**

- performs a search for music entities matching `query` and stores results for `user`

**Request Body:**

```json
{
  "user": "string",
  "query": "string"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/MusicDiscovery/clearSearch

**Description:** Clears the search results for a user.

**Requirements:**

- `user` exists

**Effects:**

- clears stored search results for `user`

**Request Body:**

```json
{
  "user": "string"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/MusicDiscovery/\_getSearchResults

**Description:** Returns the search results for a user.

**Requirements:**

- `user` exists

**Effects:**

- returns the stored search results for `user`

**Request Body:**

```json
{
  "user": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "entity": "string",
    "name": "string",
    "type": "string"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/MusicDiscovery/\_getEntityFromId

**Description:** Returns entity information from an external ID.

**Requirements:**

- `externalId` exists

**Effects:**

- returns entity information for the entity with `externalId`

**Request Body:**

```json
{
  "externalId": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "entity": "string",
    "name": "string",
    "type": "string",
    "uri": "string"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/MusicDiscovery/\_getEntityFromUri

**Description:** Returns entity information from a URI.

**Requirements:**

- `uri` exists

**Effects:**

- returns entity information for the entity with `uri`

**Request Body:**

```json
{
  "uri": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "entity": "string",
    "name": "string",
    "type": "string",
    "externalId": "string"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```
