# Qylon Integration Management Service

This service handles third-party integrations with video conferencing platforms like Zoom, Google Meet, and Microsoft Teams. It provides a unified API to manage OAuth 2.0 authentication, store tokens, and fetch data such as upcoming meetings.

## Features

- **OAuth 2.0 Flows:** Manages the complete OAuth 2.0 authorization code flow for Zoom, Google, and Microsoft Teams.
- **Secure Token Storage:** Stores access and refresh tokens in a PostgreSQL database.
- **Unified API:** Provides a consistent API to initiate authentication and retrieve data from different platforms.
- **Extensible:** Designed to be easily extensible with other third-party services.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Python 3.11+
- Docker and Docker Compose
- A PostgreSQL database

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd integration-management
    ```

2.  **Create a virtual environment and install dependencies:**

    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    pip install -r requirements.txt
    ```

3.  **Set up the database:**
    The service uses a PostgreSQL database. You can either set one up manually or use the provided Docker Compose file.

    To start a PostgreSQL container:

    ```bash
    docker-compose up -d db
    ```

### Environment Variables

Create a `.env` file in the root directory and add the following environment variables. Replace the placeholder values with your actual credentials.

```env
# ------------------------------
# Application Settings
# ------------------------------
APP_JWT_SECRET="your-super-secret-jwt-key"
APP_JWT_ALGORITHM="HS256"
APP_JWT_EXPIRES_SECONDS=3600

# ------------------------------
# Database
# ------------------------------
# Example for local Docker container
DATABASE_URL="postgresql+asyncpg://myapp_user:MyApp2025!@localhost:5432/myapp_db"

# ------------------------------
# Zoom Integration
# ------------------------------
ZOOM_CLIENT_ID="your-zoom-client-id"
ZOOM_CLIENT_SECRET="your-zoom-client-secret"
ZOOM_REDIRECT_URI="http://localhost:8000/auth/zoom/callback"

# ------------------------------
# Google Integration
# ------------------------------
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:8000/google/callback"

# ------------------------------
# Microsoft Teams Integration
# ------------------------------
MS_CLIENT_ID="your-ms-client-id"
MS_CLIENT_SECRET="your-ms-client-secret"
MS_REDIRECT_URI="http://localhost:8000/auth/microsoft/callback"

# ------------------------------
# Recall.ai (Optional)
# ------------------------------
RECALL_API_KEY="your-recall-api-key"
RECALL_WEBHOOK_URL="http://localhost:8000/google/recall/webhook"

# ------------------------------
# Supabase (Optional)
# ------------------------------
SUPABASE_URL="your-supabase-url"
SUPABASE_KEY="your-supabase-key"
```

### Running the Application

#### Locally

To run the FastAPI application locally for development:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`.

#### With Docker

To build and run the entire stack (application and database) using Docker Compose:

```bash
docker-compose up --build
```

The API will be available at `http://localhost:8000`.

## API Endpoints

Here is a summary of the available API endpoints:

### Health Check

- `GET /health`: Checks if the service is running.

### Zoom Integration

- `GET /auth/zoom/auth/{user_id}`: Generates the OAuth 2.0 authorization URL for Zoom.
- `GET /auth/zoom/callback`: Handles the OAuth 2.0 callback from Zoom.
- `GET /auth/zoom/meetings/{user_id}`: Fetches upcoming meetings for a user.

### Google Integration

- `GET /google/auth/{user_id}`: Generates the OAuth 2.0 authorization URL for Google.
- `GET /google/callback`: Handles the OAuth 2.0 callback from Google.
- `GET /google/calendar/{user_id}`: Fetches calendar events for a user.
- `POST /google/recall/webhook`: Webhook to receive transcriptions from Recall.ai.
- `GET /google/transcripts/{bot_id}/{user_id}`: Retrieves a meeting transcript.

### Microsoft Teams Integration

- `GET /teams/auth/{user_id}`: Generates the OAuth 2.0 authorization URL for Microsoft Teams.
- `GET /teams/callback`: Handles the OAuth 2.0 callback from Microsoft Teams.
- `GET /teams/meetings/{user_id}`: Fetches upcoming meetings for a user.

### General Integrations

- `GET /integrations/me`: Lists all active integrations for the currently authenticated user.

## Running Tests

The project includes placeholders for unit and integration tests. To run them, you can use `pytest`:

```bash
pytest
```
psql -U myapp_user -d myapp_db -h 127.0.0.1 -p 5432
