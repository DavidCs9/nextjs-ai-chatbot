# Next.js AI Chatbot

An intelligent chatbot application built with Next.js, featuring AI-powered conversations, document artifacts, and real-time streaming responses.

## 🚀 Features

- **AI-Powered Chat**: Multiple AI models including GPT-4o, o1-mini, and GPT-4.1
- **Document Artifacts**: Create and edit text, code, images, and spreadsheets within conversations
- **Real-time Streaming**: Live AI responses with data streaming
- **Authentication**: Secure user sessions with guest mode support
- **File Attachments**: Upload and process images in conversations
- **AWS Integration**: CloudFormation resource querying and management
- **Modern UI**: Built with shadcn/ui and Tailwind CSS
- **Database**: PostgreSQL with Drizzle ORM for data persistence

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **AI SDK**: Vercel AI SDK with OpenAI integration
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS + shadcn/ui
- **Package Manager**: pnpm
- **TypeScript**: Full type safety

## 📋 Prerequisites

Before setting up the project, ensure you have:

- **Node.js** 18.x or later
- **pnpm** (recommended) or npm
- **PostgreSQL** database (local or cloud)
- **OpenAI API key**
- **Git**

## 🔧 Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd nextjs-ai-chatbot
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env.local
```

Configure the following required environment variables in `.env.local`:

#### Essential Variables

```bash
# Authentication Secret (generate with: openssl rand -base64 32)
AUTH_SECRET=your_random_32_character_secret

# OpenAI API Key (get from: https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-your_openai_api_key

# PostgreSQL Database URL
POSTGRES_URL=postgresql://username:password@localhost:5432/chatbot_db

# Vercel Blob Storage (for file uploads)
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token

# Redis (for caching and sessions)
REDIS_URL=redis://localhost:6379

# AWS
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_SESSION_TOKEN=your_aws_session_token  # if using temporary credentials
AWS_DEFAULT_REGION=eu-west-1
```

### 4. Database Setup

#### Option A: Docker

1. Docker needs to be installed (Docker Destop >= 4.43.2 or Docker Engine >= 28.3.2)
2. At the root directory run `pnpm docker:resources:up`
3. Once you are done, remember to `pnpm docker:resources:down`.

#### Option B: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a new database:
   ```sql
   CREATE DATABASE chatbot_db;
   ```
3. Update `POSTGRES_URL` in `.env.local`

#### Option C: Cloud Database

Use a cloud provider like:

- [Neon](https://neon.tech/) (recommended)
- [Supabase](https://supabase.com/)
- [PlanetScale](https://planetscale.com/)
- [Railway](https://railway.app/)

### 5. Run Database Migrations

```bash
pnpm db:migrate
```

### 6. Start Development Server

```bash
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### 7. Start Local Production Server

#### 7.1 Create .env.production.local

```bash
# Authentication Secret (generate with: openssl rand -base64 32)
AUTH_SECRET=your_random_32_character_secret

# OpenAI API Key (get from: https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-your_openai_api_key

# PostgreSQL Database URL
POSTGRES_URL=postgresql://username:password@postgres:5432/chatbot_db

# Vercel Blob Storage (for file uploads)
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token

# Redis (for caching and sessions)
REDIS_URL=redis://redis:6379

# AWS
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_SESSION_TOKEN=your_aws_session_token  # if using temporary credentials
AWS_DEFAULT_REGION=eu-west-1
```

#### 7.2 Run from root of project

```bash
pnpm docker:local-prod:up
```

The application will be available at [http://localhost:3000](http://localhost:3000)

#### 7.3 Clean up


```bash
pnpm docker:local-prod:down
```

## 📦 Available Scripts

| Command            | Description                         |
| ------------------ | ----------------------------------- |
| `pnpm dev`         | Start development server with Turbo |
| `pnpm build`       | Build production application        |
| `pnpm start`       | Start production server             |
| `pnpm lint`        | Run ESLint and Biome linting        |
| `pnpm lint:fix`    | Fix linting issues automatically    |
| `pnpm format`      | Format code with Biome              |
| `pnpm db:generate` | Generate database migrations        |
| `pnpm db:migrate`  | Run database migrations             |
| `pnpm db:studio`   | Open Drizzle Studio (database GUI)  |
| `pnpm db:push`     | Push schema changes to database     |
| `pnpm test`        | Run Playwright tests                |

## 🗄 Database Schema

The application uses PostgreSQL with the following main tables:

- **Users**: User accounts and authentication
- **Chats**: Chat sessions with metadata
- **Messages_v2**: Chat messages with parts system
- **Documents**: Artifact documents (text, code, images, sheets)
- **Votes**: Message voting/rating system
- **Suggestions**: Document editing suggestions

## 🔐 Authentication

The app supports:

- **Regular Users**: Email/password authentication
- **Guest Users**: Temporary sessions without registration
- **Session Management**: Secure JWT-based sessions

## 🎨 UI Components

Built with:

- **shadcn/ui**: High-quality React components
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component primitives
- **Lucide React**: Beautiful icons

## 🧪 Testing

Run the test suite:

```bash
pnpm test
```

The project uses Playwright for end-to-end testing.

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on git push

### Other Platforms

The app can be deployed to any Node.js hosting platform:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📱 Features Overview

### Chat Interface

- Real-time AI responses with streaming
- Multiple AI model selection
- Message history and persistence
- File upload support (images)

### Artifacts System

- **Text Editor**: Rich text editing with ProseMirror
- **Code Editor**: Syntax highlighting with CodeMirror
- **Image Editor**: Basic image manipulation
- **Sheet Editor**: Spreadsheet functionality

### AWS Integration

- CloudFormation stack querying
- Resource visualization
- Infrastructure management tools

## 🔧 Development Tips

### Database Management

```bash
# View database in browser
pnpm db:studio

# Reset database (destructive!)
pnpm db:push --force

# Generate new migration
pnpm db:generate
```

### Code Quality

```bash
# Fix all linting issues
pnpm lint:fix

# Format all files
pnpm format
```
