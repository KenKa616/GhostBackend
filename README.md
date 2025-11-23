# GhostTalk Backend

A private, invite-only social network backend.

## Features
- **Authentication**: Invite-only registration, JWT login.
- **Profiles**: Private by default, visible only to followers.
- **Follow System**: Request/Accept/Reject logic.
- **Posts**: Image posts with likes and comments.
- **Stories**: 30-second disappearing stories.
- **Chat**: Real-time messaging with Socket.io.

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Ensure `.env` exists with:
    ```
    DATABASE_URL="file:./dev.db"
    JWT_SECRET="your_secret_key"
    PORT=3000
    ```

3.  **Database Setup**:
    ```bash
    npx prisma generate
    npx prisma db push
    ```

4.  **Run Server**:
    ```bash
    npm run dev
    ```

## API Endpoints

### Authentication
- `POST /auth/register`: `{ email, password, name, inviteToken }`
- `POST /auth/login`: `{ email, password }`
- `POST /auth/invite`: (Auth required) Generates new invite link.

### Users
- `GET /users/:id`: Get profile (privacy rules apply).
- `PUT /users/me`: Update profile `{ name, bio, profilePhotoURL }`.

### Follow System
- `POST /follow/:targetUserId`: Send follow request.
- `POST /follow/accept/:requestId`: Accept request.
- `POST /follow/reject/:requestId`: Reject request.
- `GET /follow/requests`: List pending requests.

### Posts
- `POST /posts`: `{ imageURL, caption }`
- `GET /posts/feed`: Get posts from following.
- `POST /posts/:postId/like`: Like a post.
- `DELETE /posts/:postId/like`: Unlike.
- `POST /posts/:postId/comment`: `{ text }`.

### Stories
- `POST /stories`: `{ imageURL }` (Expires in 30s).
- `GET /stories`: Get active stories from following.

### Upload
- `POST /upload`: Upload image (form-data `image`). Returns `{ imageURL }`.

## Real-Time Chat (Socket.io)
- Connect to `/`.
- Events:
    - `join_room` (roomId)
    - `send_message` ({ chatId, text, ... }) -> Broadcasts `receive_message`
    - `typing` -> Broadcasts `user_typing`
