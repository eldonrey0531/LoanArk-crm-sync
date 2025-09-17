# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/d02bfcda-b2b7-4df1-a75e-a5363285a3ca

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/d02bfcda-b2b7-4df1-a75e-a5363285a3ca) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Set up environment variables
cp .env.example .env
# Edit .env and add your SUPABASE_SERVICE_ROLE_KEY and HUBSPOT_API_KEY

# Step 5: Start both frontend and backend servers
npm run dev:full

# Alternative: Start servers separately
# Terminal 1: npm run server
# Terminal 2: npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Netlify Functions + Express server (development)
- **Database**: Supabase (PostgreSQL)
- **External API**: HubSpot CRM API v3+
- **UI Framework**: Radix UI + Tailwind CSS
- **State Management**: React Query + Context API
- **Testing**: Vitest + React Testing Library + Playwright + MSW
- **Build Tools**: Vite + SWC + TypeScript
- **Code Quality**: ESLint + Prettier + Husky + lint-staged
- **Deployment**: Netlify (frontend) + Netlify Functions (backend)

## CI/CD Pipeline

This project uses GitHub Actions for automated testing, building, and deployment.

### 🚀 Automated Workflows

- **Continuous Integration**: Automated testing and linting on every push and PR
- **Continuous Deployment**: Automatic deployment to Netlify on main branch pushes
- **Security Scanning**: Weekly security audits and dependency checks
- **Database Migrations**: Automated Supabase schema updates
- **Release Management**: Automated changelog generation and release creation

### 📋 Setup Requirements

1. **Set up GitHub Secrets**:
   ```bash
   npm run setup-secrets
   ```

2. **Required Secrets**:
   - `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY`
   - `VITE_HUBSPOT_CLIENT_ID` & `VITE_HUBSPOT_CLIENT_SECRET`
   - `NETLIFY_AUTH_TOKEN` & `NETLIFY_SITE_ID`
   - `SUPABASE_ACCESS_TOKEN` & `SUPABASE_PROJECT_REF`

### 📖 Documentation

For detailed CI/CD documentation, see [docs/CI-CD.md](./docs/CI-CD.md)

## HubSpot OAuth Authentication

This project uses OAuth 2.0 for secure HubSpot API authentication, providing enhanced security and user experience compared to API keys.

### 🔐 OAuth Setup

1. **Create a HubSpot App**:
   - Go to [HubSpot Developer Portal](https://developers.hubspot.com/)
   - Create a new Public App
   - Configure OAuth settings:
     - **Redirect URI**: `https://yourdomain.com/auth/hubspot/callback`
     - **Scopes**: `crm.objects.contacts.read`, `crm.objects.contacts.write`, `crm.objects.companies.read`, `crm.objects.companies.write`, `crm.objects.deals.read`, `crm.objects.deals.write`, `oauth`

2. **Environment Variables**:
   ```bash
   # OAuth Configuration
   VITE_HUBSPOT_CLIENT_ID=your_client_id_here
   VITE_HUBSPOT_CLIENT_SECRET=your_client_secret_here
   VITE_HUBSPOT_REDIRECT_URI=https://yourdomain.com/auth/hubspot/callback

   # Legacy API Key (for backward compatibility during transition)
   VITE_HUBSPOT_API_KEY=your_api_key_here
   ```

3. **GitHub Secrets** (for CI/CD):
   ```
   VITE_HUBSPOT_CLIENT_ID
   VITE_HUBSPOT_CLIENT_SECRET
   VITE_HUBSPOT_REDIRECT_URI
   ```

### 🔄 OAuth Flow

The authentication flow follows these steps:

1. **Initiate Login**: User clicks "Connect HubSpot" in the Settings page
2. **Authorization**: User is redirected to HubSpot's OAuth authorization page
3. **Callback**: HubSpot redirects back with authorization code
4. **Token Exchange**: Application exchanges code for access/refresh tokens
5. **API Access**: Tokens are automatically used for all HubSpot API calls
6. **Token Refresh**: Access tokens are automatically refreshed when expired

### 🛡️ Security Features

- **State Parameter**: CSRF protection using OAuth state parameter
- **Secure Storage**: Tokens stored securely using StorageManager
- **Automatic Refresh**: Seamless token refresh without user intervention
- **Token Validation**: Automatic expiry checking and renewal
- **Error Handling**: Comprehensive error handling for auth failures

### 🔧 API Integration

The OAuth service integrates seamlessly with existing HubSpot functionality:

- **Automatic Headers**: Authorization headers added automatically to all API requests
- **Fallback Support**: Graceful fallback to API keys during transition
- **Connection Testing**: OAuth tokens used for connection validation
- **Caching**: Maintains existing caching behavior with OAuth authentication

### 📱 User Experience

- **One-Click Setup**: Simple authentication flow from Settings page
- **Status Indicators**: Real-time authentication and connection status
- **Error Messages**: Clear error messages for troubleshooting
- **Persistent Sessions**: Authentication state persists across browser sessions

### 🧪 Testing

OAuth functionality includes comprehensive test coverage:

```bash
# Run OAuth service tests
npm run test src/services/hubspot-auth.test.ts

# Run all tests including OAuth
npm run test
```

### 📚 API Reference

#### HubSpotAuthService

```typescript
import HubSpotAuthService from './services/hubspot-auth';

const authService = HubSpotAuthService.getInstance();

// Generate OAuth URL
const authUrl = authService.generateAuthUrl();

// Check authentication status
const isAuthenticated = authService.isAuthenticated();

// Get access token
const token = await authService.getAccessToken();

// Logout
await authService.logout();
```

#### HubSpotContext

```typescript
import { useHubSpot } from './contexts/HubSpotContext';

const { isAuthenticated, login, logout, getAuthUrl } = useHubSpot();
```

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/d02bfcda-b2b7-4df1-a75e-a5363285a3ca) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
