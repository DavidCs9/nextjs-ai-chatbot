# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server with Turbo
pnpm dev

# Build for production (includes database migration)
pnpm build

# Start production server
pnpm start

# Linting and formatting
pnpm lint              # ESLint + Biome lint with auto-fix
pnpm lint:fix          # ESLint fix + Biome lint with auto-fix
pnpm format            # Biome format

# Database operations
pnpm db:generate       # Generate migrations
pnpm db:migrate        # Run migrations
pnpm db:studio         # Open Drizzle Studio
pnpm db:push           # Push schema changes
pnpm db:pull           # Pull schema from database

# Testing
pnpm test              # Run Playwright e2e tests
```

## Architecture Overview

This is a Next.js 15 AI chatbot application built with the AI SDK, featuring:

### Core Structure
- **Next.js App Router** with TypeScript and React 19 RC
- **AI SDK** for language model integration with streaming responses
- **Drizzle ORM** with PostgreSQL for data persistence
- **NextAuth.js** for authentication with guest and registered users
- **Artifacts System** for creating interactive documents (text, code, image, sheet)

### Key Directories
- `app/(auth)/` - Authentication routes and components
- `app/(chat)/` - Main chat interface and API routes
- `artifacts/` - Document creation and management system
- `components/` - Reusable UI components with shadcn/ui
- `lib/ai/` - AI provider configuration, models, and tools
- `lib/db/` - Database schema, queries, and migrations
- `hooks/` - Custom React hooks
- `tests/` - Playwright e2e tests

### Data Flow
1. User interactions trigger Server Actions in route groups
2. Chat API (`app/(chat)/api/chat/route.ts`) handles AI streaming responses
3. AI tools can create documents via the artifacts system
4. Database operations use Drizzle ORM with PostgreSQL
5. Authentication middleware protects routes and handles guest sessions

### AI Integration
- Models configured in `lib/ai/models.ts` with provider abstraction
- Tools defined in `lib/ai/tools/` for document creation, weather, suggestions
- Streaming responses with data stream handlers for real-time updates
- Message parts system for handling different content types

### Authentication
- NextAuth.js with custom guest session support
- Middleware redirects unauthenticated users to guest auth
- User sessions persist across chat interactions

### Database Schema
- Users, Chats, Messages (v2 with parts), Votes, Documents, Suggestions
- Includes deprecated tables for backwards compatibility
- Foreign key relationships with proper constraints

## Code Conventions

- **Formatting**: Biome with 2-space indentation, 80 character line width
- **TypeScript**: Strict mode enabled with path aliases (`@/*`)
- **Styling**: Tailwind CSS with custom theme configuration
- **Components**: shadcn/ui component library with Radix UI primitives
- **Database**: Drizzle ORM with migrations in `lib/db/migrations/`
- **Testing**: Playwright for e2e tests with custom page objects

## AWS CloudFormation Integration

The application now supports querying AWS resources through natural language using the AWS CloudFormation MCP integration:

### Features
- **Resource Listing**: Query EC2 instances, S3 buckets, Lambda functions, RDS databases, and 1,100+ other AWS resource types
- **Resource Details**: Get specific resource properties and configurations
- **CloudFormation Stacks**: List and describe CloudFormation stacks
- **Natural Language Interface**: Ask questions like "What EC2 instances are running?" or "Show me my S3 buckets"

### Tool Actions
- `list_resources` - Enumerate resources by type (e.g., AWS::EC2::Instance)
- `get_resource` - Retrieve specific resource details by identifier
- `list_stacks` - Show CloudFormation stacks with their status
- `describe_stack` - Get detailed stack information including parameters and outputs
- `describe_stack_resources` - List all resources within a specific CloudFormation stack
- `list_log_groups` - List CloudWatch Log Groups with retention and storage information
- `list_s3_buckets` - List S3 buckets with creation dates and regions

### Usage Examples
Users can ask natural language questions such as:
- "List all my EC2 instances"
- "Show me the properties of S3 bucket my-app-bucket"
- "What CloudFormation stacks are currently running?"
- "Describe the production-stack CloudFormation stack"
- "Show me all resources in the production-stack CloudFormation stack"
- "What resources are created by the my-web-app stack?"

## Environment Setup

Required environment variables (see `.env.example`):
- `AUTH_SECRET` - NextAuth.js secret
- Database connection variables for PostgreSQL
- AI provider API keys
- Vercel-specific variables for deployment

### AWS Configuration
- `AWS_ACCESS_KEY_ID` - AWS access key (optional if using IAM roles)
- `AWS_SECRET_ACCESS_KEY` - AWS secret key (optional if using IAM roles)
- `AWS_DEFAULT_REGION` - AWS region for resource queries (defaults to us-east-1)

### Required AWS Permissions
The application requires these IAM permissions for AWS resource querying:
- `cloudcontrol:ListResources`
- `cloudcontrol:GetResource`
- `cloudformation:ListStacks`
- `cloudformation:DescribeStacks`
- `cloudformation:DescribeStackResources`