# AI Study Buddy - Frontend

**Author:** Alexandros Karales | **Website:** [karales.com](https://karales.com) | **Email:** karales@gmail.com

Modern React 19 frontend with TypeScript, Vite, TailwindCSS, and comprehensive UI components.

## ✨ Features

### User Interface
- 🎨 **Modern Design** - Clean, responsive UI with TailwindCSS v4
- 🌓 **Dark Mode** - Light/dark theme switching
- 🎭 **5 Color Themes** - Caffeine, Bubblegum, Candyland, Catppuccin, Claude
- 📱 **Fully Responsive** - Mobile-first design approach
- 🧩 **54 UI Components** - Complete shadcn/ui component library

### AI & Chat
- 💬 **Real-time Chat** - Instant AI responses with streaming support
- 🤖 **7+ AI Models** - Model selection dropdown (Qwen, Llama, Gemma, Mistral, Phi)
- ⚡ **GPU Toggle** - Enable/disable GPU acceleration per request
- 📊 **Markdown Support** - Rich text rendering with code highlighting
- 🔄 **Conversation History** - Persistent chat tracking with sorting

### Document Management
- 📄 **Document Upload** - Drag-and-drop file upload
- 🔍 **Document Search** - Search through uploaded documents
- 📑 **Document Viewer** - In-app document preview
- 📚 **RAG Context** - Document-aware AI responses

### User Experience
- 👤 **User Profiles** - Complete profile management
- ⚙️ **Settings Panel** - GPU settings, preferences, theme customization
- 🎤 **Voice Input** - Speech-to-text support (planned)
- 📥 **Export** - Download conversations in multiple formats
- 📈 **Statistics** - Usage analytics and insights

## 🛠️ Tech Stack

### Core
- **React 19.2** - Latest React with improved performance
- **TypeScript 5.9** - Type safety and IntelliSense
- **Vite 7.2** - Lightning-fast build tool with HMR
- **React Router v7** - Client-side routing

### Styling
- **TailwindCSS v4** - Utility-first CSS framework
- **@tailwindcss/vite** - Native Vite integration
- **shadcn/ui** - 54 pre-built accessible components
- **Lucide React** - Beautiful icon library
- **next-themes** - Theme management (dark mode + custom themes)

### State & Data
- **TanStack Query v5** - Server state management & caching
- **Axios** - HTTP client for API calls
- **React Hook Form** - Performant form handling
- **Zod v4** - Schema validation

### UI Components (shadcn/ui)
All 54 components installed:
- Layout: Sidebar, Resizable Panels, Scroll Area, Separator
- Forms: Input, Textarea, Select, Checkbox, Radio, Switch, Slider
- Feedback: Toast (Sonner), Dialog, Alert Dialog, Drawer (Vaul)
- Data: Table, Card, Badge, Avatar, Progress
- Navigation: Tabs, Accordion, Dropdown Menu, Context Menu
- Overlays: Popover, Tooltip, Hover Card, Sheet
- And many more...

### Developer Tools
- **ESLint 9** - Code linting
- **TypeScript ESLint** - Type-aware linting
- **Vite Plugin React** - Fast refresh

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or 20+
- npm, yarn, or pnpm

### Installation

```bash
# Clone repository
git clone https://github.com/akarales/study_buddy_frontend.git
cd study_buddy_frontend

# Install dependencies
npm install
# or
yarn install
# or
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your backend URL

# Start development server
npm run dev
```

### Environment Variables

Create `.env` file:

```bash
# Backend API
VITE_API_BASE_URL=http://localhost:8001/api/v1

# Optional: Enable debug mode
VITE_DEBUG=true
```

### Development

```bash
# Start dev server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── main.tsx              # Application entry point
│   ├── App.tsx               # Root component with routing
│   ├── pages/                # Route pages
│   │   ├── auth/             # Authentication pages
│   │   │   ├── LoginPage.tsx
│   │   │   └── SignupPage.tsx
│   │   ├── chat/             # Chat interface
│   │   │   └── ChatPage.tsx
│   │   ├── projects/         # Project management
│   │   │   └── ProjectsPage.tsx
│   │   ├── documents/        # Document pages
│   │   │   └── DocumentsPage.tsx
│   │   ├── profile/          # User profile
│   │   │   └── ProfilePage.tsx
│   │   ├── settings/         # Settings pages
│   │   │   ├── SettingsPage.tsx
│   │   │   └── GPUSettings.tsx
│   │   └── stats/            # Statistics
│   │       └── StatsPage.tsx
│   ├── components/           # Reusable components
│   │   ├── ui/               # shadcn/ui components (54 total)
│   │   ├── layout/           # Layout components
│   │   │   ├── TopNav.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── chat/             # Chat-specific components
│   │   │   ├── ConversationSidebar.tsx
│   │   │   ├── DocumentPanel.tsx
│   │   │   ├── DocumentViewer.tsx
│   │   │   └── ChatStats.tsx
│   │   ├── theme/            # Theme components
│   │   │   └── ThemeSelector.tsx
│   │   └── error/            # Error handling
│   │       └── ErrorBoundary.tsx
│   ├── services/             # API services
│   │   ├── api.ts            # Base API client
│   │   ├── auth.ts           # Authentication
│   │   ├── projects.ts       # Projects
│   │   ├── documents.ts      # Documents
│   │   ├── chat.ts           # Chat
│   │   ├── user.ts           # User management
│   │   └── system.ts         # System info
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.ts        # Authentication hook
│   │   ├── useColorTheme.ts  # Theme management
│   │   └── ...
│   ├── contexts/             # React contexts
│   │   └── ChatContext.tsx   # Chat state management
│   ├── types/                # TypeScript types
│   │   └── api.ts            # API type definitions
│   ├── lib/                  # Utilities
│   │   ├── api.ts            # Axios instance
│   │   ├── config.ts         # App configuration
│   │   └── utils.ts          # Helper functions
│   └── styles/               # Global styles
│       └── index.css         # TailwindCSS imports
├── public/                   # Static assets
├── index.html                # HTML template
├── package.json              # Dependencies & scripts
├── tsconfig.json             # TypeScript config
├── vite.config.ts            # Vite configuration
├── tailwind.config.js        # TailwindCSS config
└── postcss.config.js         # PostCSS config
```

## 🎨 Theme System

### Color Themes
5 built-in themes with light/dark mode support:

1. **Caffeine** (Default) - Professional brown tones
2. **Bubblegum** - Pink/magenta vibrant
3. **Candyland** - Warm orange/peach
4. **Catppuccin** - Purple modern aesthetic
5. **Claude** - Calm neutral tones

Theme selection in Settings or via `ThemeSelector` component.

### Dark Mode
- System preference detection
- Manual toggle in TopNav
- Persisted in localStorage

## 🔌 API Integration

### Services
All API calls organized by domain:

```typescript
// Authentication
import { authService } from '@/services/auth'
authService.login(email, password)
authService.signup(data)

// Projects
import { projectsService } from '@/services/projects'
projectsService.getProjects()
projectsService.createProject(data)

// Chat
import { chatService } from '@/services/chat'
chatService.sendMessage(request)
chatService.getConversations(projectId)

// Documents
import { documentsService } from '@/services/documents'
documentsService.upload(file, projectId)

// User
import { userService } from '@/services/user'
userService.updateProfile(data)

// System
import { systemService } from '@/services/system'
systemService.getGPUInfo()
```

### React Query Integration

```typescript
// Fetch with caching
const { data, isLoading } = useQuery({
  queryKey: ['projects'],
  queryFn: () => projectsService.getProjects()
})

// Mutations
const mutation = useMutation({
  mutationFn: (data) => projectsService.createProject(data),
  onSuccess: () => queryClient.invalidateQueries(['projects'])
})
```

## 🧪 Development

### Code Quality

```bash
# Type checking
npm run build  # TypeScript checks during build

# Linting
npm run lint

# Format code (if Prettier is added)
npm run format
```

### Performance Optimization

- ✅ Code splitting with React.lazy()
- ✅ Route-based lazy loading
- ✅ React Query caching
- ✅ Memoization with useMemo/useCallback
- ✅ Optimized re-renders

### Browser Support

- Chrome/Edge (Chromium) - Full support
- Firefox - Full support
- Safari 16.4+ - Full support
- Mobile browsers - Responsive design

## 📦 Build & Deployment

### Production Build

```bash
# Build for production
npm run build

# Output: dist/ folder
# - Minified JS/CSS
# - Asset optimization
# - Source maps (optional)
```

### Docker Deployment

```bash
# Build Docker image
docker build -t study-buddy-frontend .

# Run container
docker run -p 3000:80 study-buddy-frontend
```

### Environment-Specific Builds

```bash
# Development
VITE_API_BASE_URL=http://localhost:8001 npm run build

# Production
VITE_API_BASE_URL=https://api.example.com npm run build
```

## 🔧 Configuration

### Vite Config (`vite.config.ts`)

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8001'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

### TailwindCSS Config

Custom theme with CSS variables for dynamic theming:

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'oklch(var(--primary))',
        // ... more custom colors
      }
    }
  }
}
```

## 📖 Related Documentation

- [Component Library](./src/components/ui/README.md)
- [API Integration Guide](../docs/API_INTEGRATION.md)
- [PWA Implementation Guide](../docs/PWA_IMPLEMENTATION_GUIDE.md)

## 🔗 Related Repositories

- **Backend**: https://github.com/akarales/study_buddy_backend
- **Infrastructure**: https://github.com/akarales/study_buddy_Infra

## 📝 License

MIT License - Copyright © 2025 Alexandros Karales

## 👨‍💻 Author

**Alexandros Karales**
- Website: [karales.com](https://karales.com)
- Email: karales@gmail.com
- GitHub: [@akarales](https://github.com/akarales)

---

## 🚀 Quick Links

- **Live App**: http://localhost:3000 (local development)
- **Backend API**: http://localhost:8001
- **API Docs**: http://localhost:8001/docs
- **Swagger UI**: http://localhost:8001/redoc
