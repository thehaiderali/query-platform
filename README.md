# Query Platform Backend

A robust backend API for a Q&A platform with AI-powered answering capabilities, built with Node.js, Express, and MongoDB.

## 🚀 Features

### Core Functionality
- **User Authentication**: JWT-based auth with role-based permissions (user/admin)
- **Q&A System**: Post questions, provide answers, upvote, and accept answers
- **AI Integration**: Multiple AI agents can answer questions using Gemini API
- **Background Processing**: Asynchronous task processing with Inngest
- **RESTful API**: Clean, structured endpoints with proper error handling

### AI Capabilities
- Configurable AI agents with custom system prompts
- Automatic answer generation via Gemini API
- Task queuing and retry mechanisms for reliable AI processing
- Agent performance tracking (tasks completed)

## 🏗️ Architecture

```
├── controllers/     # Business logic controllers
├── models/         # MongoDB schemas
├── routes/         # Express route handlers
├── middleware/     # Authentication & validation
├── inngest/        # Background job processing
│   ├── client.js
│   ├── handler.js
│   └── functions/  # Background job functions
├── lib/           # External service integrations
└── validation/    # Zod validation schemas
```

## 📦 Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt password hashing
- **AI Integration**: Google Gemini API
- **Background Jobs**: Inngest for task processing
- **Validation**: Zod schema validation
- **Testing**: Vitest for E2E testing

## 🔧 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd query-platform-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**
Create a `.env` file:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/query-platform
JWT_SECRET=your-jwt-secret-key-here
GEMINI_API_KEY=your-google-gemini-api-key
```

4. **Start the server**
```bash
# Development
npm run dev

# Production
node index.js
```

## 📡 API Endpoints

### Authentication (`/auth`)
- `POST /signup` - Register new user
- `POST /login` - User login
- `GET /me` - Get current user profile

### Questions (`/questions`)
- `GET /` - List questions with pagination
- `POST /` - Create a new question
- `GET /:id` - Get question details with answers
- `DELETE /:id` - Delete a question
- `POST /:id/upvote` - Upvote a question
- `POST /:id/answers` - Post an answer to a question
- `POST /:id/assign-agent` - Assign AI agent to answer question
- `GET /:id/ai-tasks` - Get AI processing tasks for a question

### Answers (`/answers`)
- `PUT /:id` - Update an answer
- `DELETE /:id` - Delete an answer
- `POST /:id/upvote` - Upvote an answer
- `POST /:id/accept` - Mark answer as accepted

### AI Agents (`/ai-agents`)
- `GET /` - List all available AI agents
- `POST /` - Create new AI agent (admin only)

### Users (`/users`)
- `GET /:id` - Get user profile
- `GET /:id/questions` - Get user's questions
- `GET /:id/answers` - Get user's answers

## 🔐 Authentication

Protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 🤖 AI Agent System

### Creating an AI Agent
```json
POST /ai-agents
{
  "name": "Programming Expert",
  "description": "Specializes in coding questions",
  "systemPrompt": "You are an expert programmer..."
}
```

### Assigning AI to a Question
```json
POST /questions/:id/assign-agent
{
  "agentId": "agent_object_id_here"
}
```

### Task Processing Flow
1. User assigns AI agent to question
2. Task created with "pending" status
3. Inngest processes task in background
4. Gemini API generates answer
5. Answer saved, task marked "completed"
6. Question status updated to "answered"


## 🔄 Background Processing

The system uses Inngest for reliable background job processing:
- Automatic retries for failed AI calls
- Cron job to retry pending tasks every 5 minutes
- Event-driven architecture for scalability


## 📄 License

ISC License
