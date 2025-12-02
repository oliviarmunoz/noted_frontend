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
    "_id": "ID",
    "item": "ID",
    "user": "ID",
    "rating": "number",
    "date": "Date",
    "notes": "string (optional)",
    "comments": [
      {
        "commentId": "ID",
        "commenter": "ID",
        "notes": "string",
        "date": "Date"
      }
    ]
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
    "_id": "ID",
    "item": "ID",
    "user": "ID",
    "rating": "number",
    "date": "Date",
    "notes": "string (optional)",
    "comments": [
      {
        "commentId": "ID",
        "commenter": "ID",
        "notes": "string",
        "date": "Date"
      }
    ]
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
    "_id": "ID",
    "item": "ID",
    "user": "ID",
    "rating": "number",
    "date": "Date",
    "notes": "string (optional)",
    "comments": [
      {
        "commentId": "ID",
        "commenter": "ID",
        "notes": "string",
        "date": "Date"
      }
    ]
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
    "commentId": "ID",
    "commenter": "ID",
    "notes": "string",
    "date": "Date"
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

**Purpose:** maintain a user's logged-in state across multiple requests without re-sending credentials.

---

## API Endpoints

### POST /api/Session/create

**Description:** Creates a new session and associates it with a given user.

**Requirements:**
- true.

**Effects:**
- a new session is created; the session is associated with the given user; returns the session created

**Request Body:**
```json
{
  "user": "ID"
}
```

**Success Response Body (Action):**
```json
{
  "session": "ID"
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

**Description:** Deletes an existing session.

**Requirements:**
- the given session exists

**Effects:**
- the session is removed

**Request Body:**
```json
{
  "session": "ID"
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

### POST /api/Session/_getUser

**Description:** Retrieves the user associated with a given session.

**Requirements:**
- the given session exists

**Effects:**
- returns the user associated with the session.

**Request Body:**
```json
{
  "session": "ID"
}
```

**Success Response Body (Query):**
```json
[
  {
    "user": "ID"
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

**Purpose:** enable users to register and verify their identity using a username and password.

---

## API Endpoints

### POST /api/UserAuthentication/register

**Description:** Registers a new user with a unique username and password.

**Requirements:**
- the username must not already exist in the system

**Effects:**
- create a new User with this username and password, returns the user

**Request Body:**
```json
{
  "username": "String",
  "password": "String"
}
```

**Success Response Body (Action):**
```json
{
  "user": "User"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/UserAuthentication/authenticate

**Description:** Authenticates a user using their username and password.

**Requirements:**
- there exists a user with the given username and password

**Effects:**
- returns the registered user that matches with the given username and password

**Request Body:**
```json
{
  "username": "String",
  "password": "String"
}
```

**Success Response Body (Action):**
```json
{
  "user": "User"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/UserAuthentication/_getUsername

**Description:** Retrieves the username associated with a given user ID.

**Requirements:**
- user exists

**Effects:**
- returns the username associated with the user

**Request Body:**
```json
{
  "user": "User"
}
```

**Success Response Body (Query):**
```json
[
  {
    "username": "String"
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

### POST /api/UserAuthentication/_getUserByUsername

**Description:** Retrieves a user ID by their username.

**Requirements:**
- a user with the given username exists

**Effects:**
- if a user with the given username exists, returns that user; otherwise returns an error

**Request Body:**
```json
{
  "username": "String"
}
```

**Success Response Body (Query):**
```json
[
  {
    "user": "User"
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

**Description:** Performs a search against the external music service (Spotify), updates the user's search history, and returns the matching music entities.

**Requirements:**
- `query` is not empty.

**Effects:**
- Updates `lastQuery` of the user.
- Removes all existing `SearchResults` for the user.
- Fetches data from the external service.
- Creates or updates `MusicEntities` based on results.
- Creates `SearchResults` linking the user to the new entities.

**Request Body:**
```json
{
  "user": "string",
  "query": "string"
}
```

**Success Response Body (Action):**
```json
{
  "musicEntities": [
    {
      "_id": "string",
      "externalId": "string",
      "type": "string", 
      "name": "string",
      "uri": "string",
      "imageUrl": "string",
      "description": "string",
      "releaseDate": "string",
      "durationMs": "number",
      "artistName": "string"
      "externalUrl": "string,
    }
  ]
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/MusicDiscovery/clearSearch

**Description:** Clears the search results associated with a specific user.

**Requirements:**
- None specified (User must exist).

**Effects:**
- Removes all `SearchResults` where the owner is the user.

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

### POST /api/MusicDiscovery/loadEntityDetails

**Description:** Fetches and updates detailed information for a specific music entity from the external service.

**Requirements:**
- `externalId` is valid.

**Effects:**
- Fetches detailed info from external service.
- Updates the specific `MusicEntity` with richer data (dates, popularity, etc.).
- Returns the corresponding `MusicEntity`.

**Request Body:**
```json
{
  "externalId": "string",
  "type": "string"
}
```

**Success Response Body (Action):**
```json
{
  "music": {
    "_id": "string",
    "externalId": "string",
    "type": "string",
    "name": "string",
    "uri": "string",
    "imageUrl": "string",
    "description": "string",
    "releaseDate": "string",
    "durationMs": "number",
    "artistName": "string"
    "externalUrl": "string,
  }
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/MusicDiscovery/_getSearchResults

**Description:** Retrieves the music entities currently associated with the user's last search results.

**Requirements:**
- None specified.

**Effects:**
- Returns the music entities tied to the search results that correspond to the given user.

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
    "musicEntity": {
      "_id": "string",
      "externalId": "string",
      "type": "string",
      "name": "string",
      "uri": "string",
      "imageUrl": "string",
      "description": "string",
      "releaseDate": "string",
      "durationMs": "number",
      "artistName": "string"
      "externalUrl": "string,
    }
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

### POST /api/MusicDiscovery/_getEntityFromId

**Description:** Retrieves a specific music entity by its external service ID.

**Requirements:**
- None specified.

**Effects:**
- Returns the music entity with the given external id.

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
    "musicEntity": {
      "_id": "string",
      "externalId": "string",
      "type": "string",
      "name": "string",
      "uri": "string",
      "imageUrl": "string",
      "description": "string",
      "releaseDate": "string",
      "durationMs": "number",
      "artistName": "string"
      "externalUrl": "string"
    }
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

### POST /api/MusicDiscovery/_getEntityFromUri

**Description:** Retrieves a specific music entity by its URI.

**Requirements:**
- None specified.

**Effects:**
- Returns the music entity with the given external uri.

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
    "musicEntity": {
      "_id": "string",
      "externalId": "string",
      "type": "string",
      "name": "string",
      "uri": "string",
      "imageUrl": "string",
      "description": "string",
      "releaseDate": "string",
      "durationMs": "number",
      "artistName": "string"
      "externalUrl": "string,
    }
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```