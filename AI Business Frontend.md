# AI Business OS — Frontend Architecture Documentation

> **Version:** 1.0.0 | **Stack:** Next.js 15 + TypeScript + Tailwind CSS v4 + Shadcn UI  
> **Author:** AI Business OS Team | **Last Updated:** 2025

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Folder Structure](#3-folder-structure)
4. [App Router Architecture](#4-app-router-architecture)
5. [UI Guidelines & Theme System](#5-ui-guidelines--theme-system)
6. [Authentication Flow](#6-authentication-flow)
7. [RBAC — Role-Based Access Control](#7-rbac--role-based-access-control)
8. [Layout System](#8-layout-system)
9. [Component Library](#9-component-library)
10. [API Layer — TanStack Query](#10-api-layer--tanstack-query)
11. [State Management — Zustand](#11-state-management--zustand)
12. [Forms & Validation](#12-forms--validation)
13. [Error Handling & Loading States](#13-error-handling--loading-states)
14. [Tables, Pagination, Search & Filters](#14-tables-pagination-search--filters)
15. [Charts & Analytics](#15-charts--analytics)
16. [Notifications System](#16-notifications-system)
17. [AI Components](#17-ai-components)
18. [Module Documentation](#18-module-documentation)
    - [18.1 HRMS Module](#181-hrms-module)
    - [18.2 CRM Module](#182-crm-module)
    - [18.3 Inventory Module](#183-inventory-module)
    - [18.4 Procurement Module](#184-procurement-module)
    - [18.5 Finance Module](#185-finance-module)
    - [18.6 Project Management Module](#186-project-management-module)
    - [18.7 Support Tickets Module](#187-support-tickets-module)
    - [18.8 Documents Module](#188-documents-module)
    - [18.9 Analytics Module](#189-analytics-module)
    - [18.10 Settings Module](#1810-settings-module)
19. [Performance Optimization](#19-performance-optimization)
20. [Testing Strategy](#20-testing-strategy)
21. [Deployment](#21-deployment)

---

## 1. Project Overview

**AI Business OS** is a full-stack enterprise SaaS platform combining HRMS, CRM, Inventory, Procurement, Finance, Project Management, Support, Documents, and AI capabilities into a single unified product.

### Vision

- Single platform for all business operations
- AI-first approach — every module has AI assistance
- Enterprise-grade security, RBAC, and audit trails
- Multi-tenant, multi-branch, multi-language support
- Real-time notifications via WebSocket

### Key Metrics

| Metric | Target |
|---|---|
| Lighthouse Performance | > 90 |
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Bundle Size (initial) | < 200KB |
| Core Web Vitals | Pass |

---

## 2. Tech Stack

### Frontend Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Framework | Next.js | 15.x | App Router, SSR, RSC |
| Language | TypeScript | 5.x | Type safety |
| Styling | Tailwind CSS | v4.x | Utility-first CSS |
| UI Components | Shadcn UI | Latest | Accessible components |
| State | Zustand | 5.x | Global state |
| Server State | TanStack Query | 5.x | Data fetching, caching |
| Forms | React Hook Form | 7.x | Form management |
| Validation | Zod | 3.x | Schema validation |
| Animations | Framer Motion | 11.x | Transitions, animations |
| Charts | Recharts | 2.x | Data visualization |
| Icons | Lucide React | Latest | Icon library |
| Date | date-fns | 3.x | Date utilities |
| Tables | TanStack Table | 8.x | Advanced data tables |
| Drag & Drop | dnd-kit | Latest | Kanban, sortable lists |
| Rich Text | Tiptap | 2.x | Document editor |
| PDF | React PDF | Latest | PDF preview |
| i18n | next-intl | Latest | Internationalization |

### Dev Tools

| Tool | Purpose |
|---|---|
| ESLint | Linting |
| Prettier | Code formatting |
| Husky | Git hooks |
| lint-staged | Pre-commit checks |
| Vitest | Unit testing |
| Playwright | E2E testing |
| Storybook | Component docs |
| Bundle Analyzer | Bundle analysis |

---

## 3. Folder Structure

```
apps/frontend/
│
├── public/
│   ├── fonts/
│   ├── icons/
│   ├── images/
│   └── locales/
│
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx
│   │   │   ├── reset-password/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx            # Main dashboard layout
│   │   │   ├── page.tsx              # Dashboard home
│   │   │   │
│   │   │   ├── hrms/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── employees/
│   │   │   │   ├── departments/
│   │   │   │   ├── attendance/
│   │   │   │   ├── leave/
│   │   │   │   ├── payroll/
│   │   │   │   ├── holidays/
│   │   │   │   ├── assets/
│   │   │   │   └── reports/
│   │   │   │
│   │   │   ├── crm/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── leads/
│   │   │   │   ├── contacts/
│   │   │   │   ├── accounts/
│   │   │   │   ├── deals/
│   │   │   │   ├── pipeline/
│   │   │   │   ├── activities/
│   │   │   │   └── reports/
│   │   │   │
│   │   │   ├── inventory/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── products/
│   │   │   │   ├── categories/
│   │   │   │   ├── warehouses/
│   │   │   │   ├── stock/
│   │   │   │   ├── transfers/
│   │   │   │   └── reports/
│   │   │   │
│   │   │   ├── procurement/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── vendors/
│   │   │   │   ├── rfq/
│   │   │   │   ├── purchase-orders/
│   │   │   │   ├── receipts/
│   │   │   │   └── reports/
│   │   │   │
│   │   │   ├── finance/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── invoices/
│   │   │   │   ├── expenses/
│   │   │   │   ├── payments/
│   │   │   │   ├── accounts/
│   │   │   │   ├── reports/
│   │   │   │   └── budgets/
│   │   │   │
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [projectId]/
│   │   │   │   ├── tasks/
│   │   │   │   ├── milestones/
│   │   │   │   ├── timesheets/
│   │   │   │   └── reports/
│   │   │   │
│   │   │   ├── support/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── tickets/
│   │   │   │   ├── [ticketId]/
│   │   │   │   ├── categories/
│   │   │   │   └── reports/
│   │   │   │
│   │   │   ├── documents/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [folderId]/
│   │   │   │   └── shared/
│   │   │   │
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── ai-chat/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── notifications/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   └── settings/
│   │   │       ├── page.tsx
│   │   │       ├── profile/
│   │   │       ├── company/
│   │   │       ├── users/
│   │   │       ├── roles/
│   │   │       ├── billing/
│   │   │       └── integrations/
│   │   │
│   │   ├── api/                      # API Routes (Next.js)
│   │   │   └── [...]/
│   │   │
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── not-found.tsx
│   │
│   ├── components/
│   │   ├── ui/                       # Shadcn base components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── select.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── form.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── command.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── separator.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Breadcrumb.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   └── MobileNav.tsx
│   │   │
│   │   ├── common/
│   │   │   ├── DataTable/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── columns.tsx
│   │   │   │   ├── toolbar.tsx
│   │   │   │   └── pagination.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── FilterPanel.tsx
│   │   │   ├── ExportButton.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── PageLoader.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   ├── DateRangePicker.tsx
│   │   │   ├── RichTextEditor.tsx
│   │   │   ├── AuditTimeline.tsx
│   │   │   ├── CommentSection.tsx
│   │   │   ├── KanbanBoard.tsx
│   │   │   └── ActivityFeed.tsx
│   │   │
│   │   ├── charts/
│   │   │   ├── AreaChart.tsx
│   │   │   ├── BarChart.tsx
│   │   │   ├── LineChart.tsx
│   │   │   ├── PieChart.tsx
│   │   │   ├── DonutChart.tsx
│   │   │   ├── FunnelChart.tsx
│   │   │   └── StatsCard.tsx
│   │   │
│   │   ├── ai/
│   │   │   ├── AIChatBot.tsx
│   │   │   ├── AIInsights.tsx
│   │   │   ├── AISummary.tsx
│   │   │   ├── AIEmailCompose.tsx
│   │   │   └── AICommandBar.tsx
│   │   │
│   │   └── modules/
│   │       ├── hrms/
│   │       ├── crm/
│   │       ├── inventory/
│   │       ├── procurement/
│   │       ├── finance/
│   │       ├── projects/
│   │       ├── support/
│   │       └── documents/
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── usePermission.ts
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   ├── usePagination.ts
│   │   ├── useFilters.ts
│   │   ├── useSearch.ts
│   │   ├── useExport.ts
│   │   ├── useWebSocket.ts
│   │   ├── useNotifications.ts
│   │   ├── useTheme.ts
│   │   └── useInfiniteScroll.ts
│   │
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── uiStore.ts
│   │   ├── notificationStore.ts
│   │   ├── settingsStore.ts
│   │   └── chatStore.ts
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts             # Axios instance
│   │   │   ├── endpoints.ts
│   │   │   └── queryKeys.ts
│   │   ├── auth.ts
│   │   ├── utils.ts
│   │   ├── validators.ts
│   │   ├── formatters.ts
│   │   ├── constants.ts
│   │   └── permissions.ts
│   │
│   ├── types/
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   ├── hrms.ts
│   │   ├── crm.ts
│   │   ├── inventory.ts
│   │   ├── finance.ts
│   │   ├── project.ts
│   │   ├── support.ts
│   │   ├── api.ts
│   │   └── common.ts
│   │
│   ├── config/
│   │   ├── navigation.ts
│   │   ├── theme.ts
│   │   └── permissions.ts
│   │
│   └── middleware.ts                 # Next.js middleware for auth
│
├── .env.local
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── vitest.config.ts
```

---

## 4. App Router Architecture

### Route Groups

```
(auth)         → No sidebar, centered layout, public routes
(dashboard)    → Full dashboard layout, requires authentication
```

### Layouts

#### Root Layout (`app/layout.tsx`)
```tsx
// Providers: ThemeProvider, QueryClientProvider, ToastProvider
// Fonts: Inter (sans), JetBrains Mono (mono)
// Metadata: SEO defaults
```

#### Auth Layout (`app/(auth)/layout.tsx`)
```tsx
// Centered card layout
// Background: gradient or image
// Logo top-center
// No navigation
```

#### Dashboard Layout (`app/(dashboard)/layout.tsx`)
```tsx
// Sidebar (collapsible, 240px → 64px)
// Header (fixed top, 60px height)
// Main content area (scrollable)
// Notification panel (slide-over)
// AI Chat (floating or sidebar panel)
```

### Route Protection — Middleware

```ts
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password']

export function middleware(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value
  const { pathname } = req.nextUrl

  if (PUBLIC_ROUTES.some(r => pathname.startsWith(r))) {
    if (token) return NextResponse.redirect(new URL('/dashboard', req.url))
    return NextResponse.next()
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|api|favicon|public).*)'],
}
```

### Page Conventions

Every page file follows this pattern:

```tsx
// app/(dashboard)/hrms/employees/page.tsx

import { Metadata } from 'next'
import { EmployeeListView } from '@/components/modules/hrms/EmployeeListView'

export const metadata: Metadata = {
  title: 'Employees | AI Business OS',
}

export default function EmployeesPage() {
  return <EmployeeListView />
}
```

---

## 5. UI Guidelines & Theme System

### Color System

```css
/* globals.css — CSS Variables */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.5rem;
  
  /* Custom brand colors */
  --brand-50: 239 246 255;
  --brand-500: 59 130 246;
  --brand-900: 30 58 138;
  
  /* Status colors */
  --success: 142 71% 45%;
  --warning: 38 92% 50%;
  --info: 199 89% 48%;
  --error: 0 84% 60%;
  
  /* Sidebar */
  --sidebar-bg: 222.2 84% 4.9%;
  --sidebar-text: 210 40% 98%;
  --sidebar-muted: 215 20% 65%;
  --sidebar-active: 221.2 83.2% 53.3%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark mode overrides */
}
```

### Typography Scale

| Token | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `text-xs` | 12px | 400 | 16px | Captions, badges |
| `text-sm` | 14px | 400 | 20px | Body small, table cells |
| `text-base` | 16px | 400 | 24px | Body text |
| `text-lg` | 18px | 500 | 28px | Subheadings |
| `text-xl` | 20px | 600 | 28px | Card titles |
| `text-2xl` | 24px | 700 | 32px | Page titles |
| `text-3xl` | 30px | 700 | 36px | Section headers |
| `text-4xl` | 36px | 800 | 40px | Hero headings |

### Spacing System

Uses Tailwind's default 4px base unit. Key values:
- `p-4` (16px) — Card padding
- `p-6` (24px) — Section padding
- `gap-4` (16px) — Component gaps
- `gap-6` (24px) — Section gaps
- `mb-8` (32px) — Section spacing

### Breakpoints

| Name | Width | Layout |
|---|---|---|
| `sm` | 640px | Stack layout |
| `md` | 768px | Two-column |
| `lg` | 1024px | Sidebar visible |
| `xl` | 1280px | Full sidebar |
| `2xl` | 1536px | Wide content |

### Component Variants

```tsx
// Example: Button variants
type ButtonVariant = 
  | 'default'       // Primary blue
  | 'destructive'   // Red
  | 'outline'       // Bordered
  | 'secondary'     // Gray
  | 'ghost'         // No border
  | 'link'          // Text link

type ButtonSize = 'sm' | 'default' | 'lg' | 'icon'
```

### Dark Mode

```tsx
// ThemeProvider wraps the app
// Theme stored in localStorage + cookie (for SSR)
// Toggle in header

'use client'
import { ThemeProvider } from 'next-themes'

export function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  )
}
```

---

## 6. Authentication Flow

### Pages

#### Login Page (`/login`)
```
Components:
- LoginForm
  - Email input
  - Password input (show/hide toggle)
  - Remember me checkbox
  - Forgot password link
  - Submit button
  - Google SSO button (optional)
  
Validation:
  - Email: required, valid format
  - Password: required, min 8 chars

API: POST /auth/login
Response: { accessToken, refreshToken, user }

On Success:
  - Store tokens (httpOnly cookie preferred)
  - Redirect to /dashboard or returnUrl

On Error:
  - Show inline error message
  - After 5 fails → lock 15 min
```

#### Register Page (`/register`)
```
Components:
- RegisterForm
  - First Name, Last Name
  - Company Name
  - Email
  - Password + Confirm Password
  - Terms acceptance checkbox

API: POST /auth/register
On Success: → /login with success toast
```

#### Forgot Password (`/forgot-password`)
```
Step 1: Email input → POST /auth/forgot-password
Step 2: OTP input (6 digits)
Step 3: New password + confirm → POST /auth/reset-password

UX: Progress indicator shows step 1/2/3
```

### Token Management

```ts
// lib/auth.ts
const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

export const auth = {
  getAccessToken: () => getCookie(ACCESS_TOKEN_KEY),
  getRefreshToken: () => getCookie(REFRESH_TOKEN_KEY),
  
  setTokens: (access: string, refresh: string) => {
    setCookie(ACCESS_TOKEN_KEY, access, { maxAge: 15 * 60 })         // 15 min
    setCookie(REFRESH_TOKEN_KEY, refresh, { maxAge: 7 * 24 * 60 * 60 }) // 7 days
  },
  
  clearTokens: () => {
    deleteCookie(ACCESS_TOKEN_KEY)
    deleteCookie(REFRESH_TOKEN_KEY)
  }
}
```

### Axios Interceptors

```ts
// lib/api/client.ts
import axios from 'axios'
import { auth } from '@/lib/auth'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
})

// Request interceptor — attach token
api.interceptors.request.use((config) => {
  const token = auth.getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor — handle 401, refresh token
let isRefreshing = false
let failedQueue: Array<{ resolve: Function; reject: Function }> = []

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        const refreshToken = auth.getRefreshToken()
        const { data } = await axios.post('/auth/refresh', { refreshToken })
        auth.setTokens(data.accessToken, data.refreshToken)
        
        failedQueue.forEach(({ resolve }) => resolve(data.accessToken))
        failedQueue = []
        
        return api(original)
      } catch {
        auth.clearTokens()
        window.location.href = '/login'
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
```

---

## 7. RBAC — Role-Based Access Control

### Role Hierarchy

```
SUPER_ADMIN
  └── ADMIN
        ├── MANAGER
        │     ├── EMPLOYEE
        │     └── VIEWER
        └── CUSTOM_ROLE (configurable)
```

### Permission Structure

```ts
// types/auth.ts
type Permission = {
  module: string         // 'hrms', 'crm', 'finance', etc.
  action: 'create' | 'read' | 'update' | 'delete' | 'export' | 'approve'
  scope: 'own' | 'department' | 'company'
}

type Role = {
  id: string
  name: string
  permissions: Permission[]
  isSystem: boolean
}
```

### usePermission Hook

```ts
// hooks/usePermission.ts
export function usePermission() {
  const { user } = useAuthStore()

  const can = (module: string, action: string, scope?: string): boolean => {
    if (user?.role === 'SUPER_ADMIN') return true
    
    return user?.permissions?.some(
      p => p.module === module && 
           p.action === action && 
           (!scope || p.scope === scope || p.scope === 'company')
    ) ?? false
  }

  const canAny = (module: string, actions: string[]): boolean => {
    return actions.some(action => can(module, action))
  }

  return { can, canAny }
}
```

### PermissionGuard Component

```tsx
// components/common/PermissionGuard.tsx
interface PermissionGuardProps {
  module: string
  action: string
  fallback?: ReactNode
  children: ReactNode
}

export function PermissionGuard({ module, action, fallback = null, children }: PermissionGuardProps) {
  const { can } = usePermission()
  
  if (!can(module, action)) return <>{fallback}</>
  return <>{children}</>
}

// Usage:
<PermissionGuard module="hrms" action="create">
  <Button>Add Employee</Button>
</PermissionGuard>
```

---

## 8. Layout System

### Sidebar

```tsx
// components/layout/Sidebar.tsx

Features:
- Collapsible (icon-only mode at 64px)
- Active state per route
- Sub-menu expand/collapse
- Module icons
- Keyboard navigation
- User avatar + role badge at bottom
- Collapse toggle button

Navigation Items:
{
  label: 'Dashboard',
  icon: LayoutDashboard,
  href: '/dashboard',
},
{
  label: 'HRMS',
  icon: Users,
  children: [
    { label: 'Employees', href: '/hrms/employees' },
    { label: 'Departments', href: '/hrms/departments' },
    { label: 'Attendance', href: '/hrms/attendance' },
    { label: 'Leave', href: '/hrms/leave' },
    { label: 'Payroll', href: '/hrms/payroll' },
  ]
},
// ... other modules
```

### Header

```tsx
// components/layout/Header.tsx

Contents (left to right):
- Hamburger (mobile) / Breadcrumb (desktop)
- Global Search (Cmd+K)
- AI Chat button
- Notification bell (with unread count badge)
- Theme toggle (Light/Dark/System)
- Language selector
- User avatar dropdown
  - Profile
  - Settings
  - Logout

Height: 60px, fixed top, z-50
Background: glass-morphism (backdrop-blur)
Border: bottom border in light, darker in dark
```

### PageHeader Component

```tsx
// components/layout/PageHeader.tsx
interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  breadcrumbs?: { label: string; href?: string }[]
}

// Usage:
<PageHeader
  title="Employees"
  description="Manage all employees across departments"
  breadcrumbs={[
    { label: 'HRMS', href: '/hrms' },
    { label: 'Employees' }
  ]}
  actions={
    <PermissionGuard module="hrms" action="create">
      <Button onClick={openCreateDialog}>
        <Plus className="mr-2 h-4 w-4" />
        Add Employee
      </Button>
    </PermissionGuard>
  }
/>
```

---

## 9. Component Library

### DataTable Component

```tsx
// components/common/DataTable/index.tsx

Features:
- TanStack Table v8
- Column sorting (single + multi)
- Column visibility toggle
- Row selection (checkbox)
- Inline row actions (view, edit, delete)
- Bulk actions
- Sticky header
- Responsive (horizontal scroll on mobile)
- Custom cell renderers
- Row click navigation

Props:
interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  isLoading?: boolean
  totalRows?: number
  pagination?: PaginationState
  onPaginationChange?: (p: PaginationState) => void
  searchKey?: string
  searchValue?: string
  onSearchChange?: (v: string) => void
  filters?: FilterConfig[]
  onFiltersChange?: (f: Filter[]) => void
  bulkActions?: BulkAction[]
  onRowClick?: (row: T) => void
  exportConfig?: ExportConfig
}
```

### Column Definitions Pattern

```tsx
// Example: Employee columns
export const employeeColumns: ColumnDef<Employee>[] = [
  {
    id: 'select',
    header: ({ table }) => <Checkbox ... />,
    cell: ({ row }) => <Checkbox ... />,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar src={row.original.avatar} name={row.original.name} />
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-sm text-muted-foreground">{row.original.employeeId}</p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'department',
    header: 'Department',
    cell: ({ row }) => <Badge variant="outline">{row.original.department?.name}</Badge>,
    filterFn: 'equals',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <DataTableRowActions row={row} />
    ),
  },
]
```

### StatusBadge Component

```tsx
// components/common/StatusBadge.tsx
const statusConfig = {
  active: { label: 'Active', variant: 'success' },
  inactive: { label: 'Inactive', variant: 'secondary' },
  pending: { label: 'Pending', variant: 'warning' },
  rejected: { label: 'Rejected', variant: 'destructive' },
  approved: { label: 'Approved', variant: 'success' },
  draft: { label: 'Draft', variant: 'outline' },
  open: { label: 'Open', variant: 'info' },
  closed: { label: 'Closed', variant: 'secondary' },
  in_progress: { label: 'In Progress', variant: 'warning' },
}
```

### FileUpload Component

```tsx
// components/common/FileUpload.tsx

Features:
- Drag & drop zone
- Click to browse
- Multiple file support
- File type filtering (accept prop)
- Size limit enforcement
- Preview (images, PDFs)
- Upload progress bar
- Remove uploaded files
- Error states

Props:
interface FileUploadProps {
  accept?: string
  multiple?: boolean
  maxSize?: number  // bytes
  maxFiles?: number
  onUpload: (files: UploadedFile[]) => void
  onRemove?: (fileId: string) => void
  existing?: UploadedFile[]
}
```

### RichTextEditor Component

```tsx
// components/common/RichTextEditor.tsx
// Built on Tiptap

Features:
- Bold, Italic, Underline, Strike
- Headings (H1–H3)
- Bullet list, Ordered list
- Blockquote
- Code block
- Link insertion
- Image upload
- Table (insert, resize, delete)
- Mention (@user)
- Undo/Redo
- Character count
- Word count

Props:
interface RichTextEditorProps {
  value?: string
  onChange?: (html: string) => void
  placeholder?: string
  editable?: boolean
  showToolbar?: boolean
  maxLength?: number
  onMention?: (query: string) => Promise<User[]>
}
```

### AuditTimeline Component

```tsx
// components/common/AuditTimeline.tsx

Displays: 
- Action type icon
- User avatar + name
- Action description ("Changed status from Pending to Approved")
- Timestamp (relative + absolute on hover)
- Field changes (diff view: old → new)

Props:
interface AuditTimelineProps {
  entityType: string
  entityId: string
  limit?: number
}
```

### EmptyState Component

```tsx
// components/common/EmptyState.tsx
interface EmptyStateProps {
  title: string
  description: string
  icon?: LucideIcon
  action?: {
    label: string
    onClick: () => void
  }
}

// Types of empty states:
// - No data yet (first time)
// - No search results
// - No permission to view
// - Error loading data
```

### KanbanBoard Component

```tsx
// components/common/KanbanBoard.tsx
// Used in: CRM Pipeline, Project Tasks, Support Tickets

Features:
- Drag and drop columns (dnd-kit)
- Drag and drop cards within/across columns
- Add new card button per column
- Card quick-edit on hover
- Column collapse
- Virtualization for large lists
- Optimistic updates

Props:
interface KanbanBoardProps<T> {
  columns: KanbanColumn[]
  items: T[]
  onItemMove: (itemId: string, fromCol: string, toCol: string) => void
  renderCard: (item: T) => ReactNode
  onAddItem?: (columnId: string) => void
}
```

---

## 10. API Layer — TanStack Query

### Query Client Setup

```ts
// lib/api/queryClient.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      gcTime: 10 * 60 * 1000,        // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error) => {
        // Global error toast
        toast.error(getErrorMessage(error))
      },
    },
  },
})
```

### Query Keys Factory

```ts
// lib/api/queryKeys.ts
export const queryKeys = {
  // HRMS
  employees: {
    all: ['employees'] as const,
    list: (params?: EmployeeListParams) => ['employees', 'list', params] as const,
    detail: (id: string) => ['employees', 'detail', id] as const,
    attendance: (id: string) => ['employees', 'attendance', id] as const,
  },
  
  // CRM
  leads: {
    all: ['leads'] as const,
    list: (params?: LeadListParams) => ['leads', 'list', params] as const,
    detail: (id: string) => ['leads', 'detail', id] as const,
  },
  
  // Finance
  invoices: {
    all: ['invoices'] as const,
    list: (params?: InvoiceListParams) => ['invoices', 'list', params] as const,
    detail: (id: string) => ['invoices', 'detail', id] as const,
  },
  
  // ... all other modules
}
```

### API Service Pattern

```ts
// lib/api/services/hrms.service.ts
import { api } from '../client'
import { Employee, EmployeeCreateDTO, EmployeeListParams, PaginatedResponse } from '@/types'

export const hrmsService = {
  // Employees
  getEmployees: async (params: EmployeeListParams): Promise<PaginatedResponse<Employee>> => {
    const { data } = await api.get('/hrms/employees', { params })
    return data
  },
  
  getEmployee: async (id: string): Promise<Employee> => {
    const { data } = await api.get(`/hrms/employees/${id}`)
    return data
  },
  
  createEmployee: async (dto: EmployeeCreateDTO): Promise<Employee> => {
    const { data } = await api.post('/hrms/employees', dto)
    return data
  },
  
  updateEmployee: async (id: string, dto: Partial<EmployeeCreateDTO>): Promise<Employee> => {
    const { data } = await api.patch(`/hrms/employees/${id}`, dto)
    return data
  },
  
  deleteEmployee: async (id: string): Promise<void> => {
    await api.delete(`/hrms/employees/${id}`)
  },
}
```

### Custom Query Hooks

```ts
// hooks/queries/useEmployees.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/api/queryKeys'
import { hrmsService } from '@/lib/api/services/hrms.service'

// List query with pagination, search, filters
export function useEmployees(params: EmployeeListParams) {
  return useQuery({
    queryKey: queryKeys.employees.list(params),
    queryFn: () => hrmsService.getEmployees(params),
    placeholderData: keepPreviousData,
  })
}

// Detail query
export function useEmployee(id: string) {
  return useQuery({
    queryKey: queryKeys.employees.detail(id),
    queryFn: () => hrmsService.getEmployee(id),
    enabled: !!id,
  })
}

// Create mutation
export function useCreateEmployee() {
  const qc = useQueryClient()
  
  return useMutation({
    mutationFn: hrmsService.createEmployee,
    onSuccess: (newEmployee) => {
      qc.invalidateQueries({ queryKey: queryKeys.employees.all })
      toast.success('Employee created successfully')
    },
  })
}

// Update mutation with optimistic update
export function useUpdateEmployee(id: string) {
  const qc = useQueryClient()
  
  return useMutation({
    mutationFn: (dto: Partial<EmployeeCreateDTO>) => hrmsService.updateEmployee(id, dto),
    
    onMutate: async (newData) => {
      await qc.cancelQueries({ queryKey: queryKeys.employees.detail(id) })
      const prev = qc.getQueryData(queryKeys.employees.detail(id))
      qc.setQueryData(queryKeys.employees.detail(id), (old: Employee) => ({ ...old, ...newData }))
      return { prev }
    },
    
    onError: (_, __, ctx) => {
      qc.setQueryData(queryKeys.employees.detail(id), ctx?.prev)
      toast.error('Failed to update employee')
    },
    
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.employees.all })
      toast.success('Employee updated')
    },
  })
}
```

---

## 11. State Management — Zustand

### Auth Store

```ts
// store/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  permissions: Permission[]
  
  setUser: (user: User) => void
  setPermissions: (perms: Permission[]) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      permissions: [],
      
      setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),
      setPermissions: (permissions) => set({ permissions }),
      logout: () => set({ user: null, isAuthenticated: false, permissions: [] }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
)
```

### UI Store

```ts
// store/uiStore.ts
interface UIState {
  sidebarCollapsed: boolean
  activeSidebarItem: string | null
  openModals: string[]
  
  toggleSidebar: () => void
  setSidebarCollapsed: (v: boolean) => void
  openModal: (id: string) => void
  closeModal: (id: string) => void
  isModalOpen: (id: string) => boolean
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarCollapsed: false,
  activeSidebarItem: null,
  openModals: [],
  
  toggleSidebar: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  openModal: (id) => set(s => ({ openModals: [...s.openModals, id] })),
  closeModal: (id) => set(s => ({ openModals: s.openModals.filter(m => m !== id) })),
  isModalOpen: (id) => get().openModals.includes(id),
}))
```

### Notification Store

```ts
// store/notificationStore.ts
interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  
  addNotification: (n: Notification) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  
  addNotification: (n) => set(s => ({
    notifications: [n, ...s.notifications],
    unreadCount: s.unreadCount + 1,
  })),
  
  markAsRead: (id) => set(s => ({
    notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n),
    unreadCount: Math.max(0, s.unreadCount - 1),
  })),
  
  markAllAsRead: () => set(s => ({
    notifications: s.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0,
  })),
  
  removeNotification: (id) => set(s => ({
    notifications: s.notifications.filter(n => n.id !== id),
  })),
}))
```

---

## 12. Forms & Validation

### Zod Schemas

```ts
// lib/validators/hrms.ts
import { z } from 'zod'

export const employeeSchema = z.object({
  firstName: z.string().min(2, 'Min 2 characters').max(50),
  lastName: z.string().min(2, 'Min 2 characters').max(50),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
  departmentId: z.string().uuid('Invalid department'),
  designationId: z.string().uuid('Invalid designation'),
  joiningDate: z.date(),
  employmentType: z.enum(['full_time', 'part_time', 'contract', 'intern']),
  salary: z.number().min(0, 'Salary must be positive').optional(),
  reportingManagerId: z.string().uuid().optional(),
  address: z.object({
    street: z.string().min(1, 'Required'),
    city: z.string().min(1, 'Required'),
    state: z.string().min(1, 'Required'),
    country: z.string().min(1, 'Required'),
    zip: z.string().min(1, 'Required'),
  }).optional(),
  avatar: z.string().url().optional(),
})

export type EmployeeFormValues = z.infer<typeof employeeSchema>
```

### Form Component Pattern

```tsx
// components/modules/hrms/EmployeeForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { employeeSchema, EmployeeFormValues } from '@/lib/validators/hrms'

interface EmployeeFormProps {
  defaultValues?: Partial<EmployeeFormValues>
  onSubmit: (values: EmployeeFormValues) => void
  isLoading?: boolean
}

export function EmployeeForm({ defaultValues, onSubmit, isLoading }: EmployeeFormProps) {
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      employmentType: 'full_time',
      ...defaultValues,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* ... more fields */}
        
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline">Cancel</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Employee
          </Button>
        </div>
      </form>
    </Form>
  )
}
```

---

## 13. Error Handling & Loading States

### Error Boundary

```tsx
// components/common/ErrorBoundary.tsx
'use client'

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }
  
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
    // Send to Sentry or logging service
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-6">An error occurred loading this section.</p>
          <Button onClick={() => this.setState({ hasError: false })}>Try Again</Button>
        </div>
      )
    }
    return this.props.children
  }
}
```

### Loading Skeletons

```tsx
// Each module has its own skeleton
// Example: EmployeeListSkeleton
export function EmployeeListSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="border rounded-lg">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b last:border-0">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Toast System

```ts
// Uses Sonner
import { toast } from 'sonner'

// Utility wrappers
export const notify = {
  success: (message: string) => toast.success(message),
  error: (message: string, description?: string) => toast.error(message, { description }),
  warning: (message: string) => toast.warning(message),
  info: (message: string) => toast.info(message),
  loading: (message: string) => toast.loading(message),
  promise: <T,>(promise: Promise<T>, messages: {
    loading: string
    success: string | ((data: T) => string)
    error: string | ((err: Error) => string)
  }) => toast.promise(promise, messages),
}

// Error message extractor
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? error.message
  }
  if (error instanceof Error) return error.message
  return 'An unexpected error occurred'
}
```

---

## 14. Tables, Pagination, Search & Filters

### Pagination Hook

```ts
// hooks/usePagination.ts
export function usePagination(defaultPage = 1, defaultLimit = 20) {
  const [page, setPage] = useState(defaultPage)
  const [limit, setLimit] = useState(defaultLimit)
  
  const reset = () => setPage(1)
  
  return {
    page,
    limit,
    offset: (page - 1) * limit,
    setPage,
    setLimit: (l: number) => { setLimit(l); setPage(1) },
    reset,
    params: { page, limit },
  }
}
```

### Search Hook

```ts
// hooks/useSearch.ts
export function useSearch(delay = 300) {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, delay)
  
  return {
    query,
    debouncedQuery,
    setQuery,
    clearSearch: () => setQuery(''),
  }
}
```

### Filter Hook

```ts
// hooks/useFilters.ts
export function useFilters<T extends Record<string, unknown>>(defaults: T) {
  const [filters, setFilters] = useState<T>(defaults)
  
  const updateFilter = (key: keyof T, value: T[keyof T]) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }
  
  const resetFilters = () => setFilters(defaults)
  
  const activeFilterCount = Object.entries(filters)
    .filter(([k, v]) => v !== defaults[k as keyof T] && v !== undefined && v !== '')
    .length
  
  return {
    filters,
    updateFilter,
    resetFilters,
    activeFilterCount,
    setFilters,
  }
}
```

### Filter Panel Component

```tsx
// components/common/FilterPanel.tsx
// Slide-over sheet with filter options

Features:
- Dynamic filter types: select, multi-select, date range, number range, boolean
- Active filter count badge on trigger button
- Reset all filters button
- Apply filters button
- Filter chips below table showing active filters
- Click chip to remove filter

// Filter config example:
const employeeFilters: FilterConfig[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'multi-select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ]
  },
  {
    key: 'departmentId',
    label: 'Department',
    type: 'select',
    options: departments.map(d => ({ value: d.id, label: d.name })),
  },
  {
    key: 'joiningDate',
    label: 'Joining Date',
    type: 'date-range',
  },
]
```

### Export Component

```tsx
// components/common/ExportButton.tsx
// Dropdown: Export as Excel | Export as PDF | Export as CSV

interface ExportButtonProps {
  onExport: (format: 'xlsx' | 'pdf' | 'csv') => Promise<void>
  isLoading?: boolean
}

// On click → POST /[module]/export with current filters
// Returns blob → trigger browser download
```

---

## 15. Charts & Analytics

### Chart Components

```tsx
// components/charts/AreaChart.tsx
interface AreaChartProps {
  data: DataPoint[]
  xKey: string
  yKey: string | string[]
  title?: string
  colors?: string[]
  height?: number
  showGrid?: boolean
  showTooltip?: boolean
  showLegend?: boolean
  dateFormat?: string
}

// All charts support:
// - Responsive container
// - Dark mode colors
// - Loading skeleton
// - Empty state
// - Custom tooltip
// - Export as PNG
```

### Stats Card

```tsx
// components/charts/StatsCard.tsx
interface StatsCardProps {
  title: string
  value: string | number
  change?: number           // Percentage change
  changeLabel?: string      // "vs last month"
  icon?: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  isLoading?: boolean
  action?: { label: string; href: string }
}

// Renders:
// - Icon (colored bg)
// - Title
// - Large value (formatted: 1,234 or $1.2K or 98%)
// - Trend badge (green up / red down / gray neutral)
```

### Dashboard Charts Config

```tsx
// Each module dashboard includes:

HRMS Dashboard:
- Employee headcount trend (area)
- Department distribution (donut)
- Attendance rate (bar by week)
- Leave balance summary (horizontal bar)
- New hires this month (stats card)
- Attrition rate (stats card)

CRM Dashboard:
- Revenue pipeline (funnel)
- Lead source breakdown (pie)
- Deals won/lost trend (bar)
- Monthly revenue (area)
- Conversion rate (stats card)
- Total pipeline value (stats card)

Finance Dashboard:
- Revenue vs Expense (grouped bar)
- Cash flow (area)
- Invoice aging (horizontal bar)
- Outstanding AR (stats card)
- Monthly profit (stats card)
```

---

## 16. Notifications System

### WebSocket Connection

```ts
// hooks/useWebSocket.ts
import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function useWebSocket() {
  const { user } = useAuthStore()
  const addNotification = useNotificationStore(s => s.addNotification)
  
  useEffect(() => {
    if (!user) return
    
    socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
      auth: { token: auth.getAccessToken() },
      transports: ['websocket'],
    })
    
    socket.on('notification', (notification: Notification) => {
      addNotification(notification)
      toast(notification.title, { description: notification.message })
    })
    
    socket.on('connect_error', (err) => {
      console.error('WebSocket error:', err)
    })
    
    return () => {
      socket?.disconnect()
      socket = null
    }
  }, [user?.id])
  
  return { socket }
}
```

### Notification Center

```tsx
// Accessible via bell icon in header
// Shows:
// - Unread count badge
// - List of notifications (newest first)
// - Notification type icon (info, success, warning, error)
// - Module-specific icon (HR icon for HRMS notifications)
// - Timestamp (relative)
// - "Mark all as read" button
// - Individual notification dismiss
// - Link to relevant page

// Notification types:
type NotificationType = 
  | 'leave_request_submitted'
  | 'leave_request_approved'
  | 'leave_request_rejected'
  | 'payroll_processed'
  | 'ticket_assigned'
  | 'ticket_resolved'
  | 'invoice_due'
  | 'invoice_paid'
  | 'task_assigned'
  | 'task_due_soon'
  | 'purchase_order_approved'
  | 'system_alert'
```

---

## 17. AI Components

### AI Chat Bot

```tsx
// components/ai/AIChatBot.tsx

Features:
- Floating chat button (bottom right)
- Slide-up panel (full screen on mobile)
- Context-aware: knows current module
- Conversation history (local session)
- Streaming response (word by word)
- Copy response button
- Regenerate button
- Suggested prompts
- File attachment support
- Code syntax highlighting in responses

Capabilities:
- "Show me employees who haven't taken leave in 3 months"
- "Create a leave request for tomorrow"
- "Summarize this ticket"
- "Generate an invoice for [client]"
- "What's our current inventory status?"

System context injected:
- Current user role + permissions
- Current module
- Company context
```

### AI Insights Component

```tsx
// components/ai/AIInsights.tsx
// Shown on dashboard pages

Features:
- Auto-generated insights from data
- "This month's revenue is 12% above target because..."
- "3 employees have pending leave requests older than 7 days"
- "Stock of Product X will run out in 5 days based on current rate"
- Refresh insights button
- Expand insight to full explanation
- Action buttons ("View employees", "Create PO")
```

### AI Email Compose

```tsx
// components/ai/AIEmailCompose.tsx
// Used in: CRM, Support

Features:
- Tone selector (Professional, Friendly, Formal)
- Context input (brief description)
- Full email generation
- Edit generated email
- Insert into email field
- Template save
```

### AI Summary Component

```tsx
// components/ai/AISummary.tsx
// Shown on detail pages (Employee profile, Lead detail, etc.)

Features:
- Auto-summarizes entity data
- Highlights key info
- Identifies risks/opportunities
- Action recommendations
- "Last updated" timestamp
```

### AI Command Bar (Cmd+K)

```tsx
// components/ai/AICommandBar.tsx

Features:
- Global Cmd+K shortcut
- Natural language commands
- Navigation ("Go to employees")
- Quick actions ("Create leave request")
- Search across all modules
- Recent commands history
- Keyboard navigation
```

---

## 18. Module Documentation

---

## 18.1 HRMS Module

### Overview

The HRMS module manages the entire employee lifecycle — from onboarding to offboarding — including departments, attendance, leave, payroll, assets, and reports.

### Pages

#### 18.1.1 HRMS Dashboard (`/hrms`)

**Purpose:** Overview of workforce metrics.

**Components:**
- StatsCard: Total Employees, Present Today, On Leave Today, New Hires This Month
- AreaChart: Employee headcount (last 12 months)
- DonutChart: Department-wise headcount
- BarChart: Weekly attendance rate
- RecentActivity: Latest 10 actions
- AIInsights: AI-generated workforce insights

**APIs:**
- `GET /hrms/dashboard` → dashboard metrics

**Permissions:** `hrms:read`

---

#### 18.1.2 Employees (`/hrms/employees`)

**Purpose:** CRUD for all employees.

**Components:**
- PageHeader + Add Employee button
- SearchBar
- FilterPanel: status, department, employment type, joining date range
- DataTable with columns: Name, Employee ID, Department, Designation, Status, Joining Date, Actions
- Pagination
- EmployeeCreateDialog (modal with EmployeeForm)
- ExportButton

**Employee Detail Page (`/hrms/employees/[id]`)**

Tabs:
1. **Profile** — Personal info, contact, address, documents
2. **Employment** — Department, designation, manager, salary, employment type
3. **Attendance** — Monthly attendance calendar view
4. **Leave** — Leave balance, leave history
5. **Assets** — Assigned company assets
6. **Documents** — Offer letter, ID proof, experience letters
7. **Payroll** — Salary slips (last 12 months)
8. **Activity** — Audit timeline

**States:**
- Loading: skeleton per tab
- Empty: custom empty state per tab
- Error: ErrorBoundary
- Not Found: redirect to /hrms/employees

**APIs:**
```
GET    /hrms/employees               → paginated list
POST   /hrms/employees               → create employee
GET    /hrms/employees/:id           → detail
PATCH  /hrms/employees/:id           → update
DELETE /hrms/employees/:id           → soft delete (deactivate)
POST   /hrms/employees/:id/activate  → reactivate
GET    /hrms/employees/:id/attendance → attendance records
GET    /hrms/employees/:id/leave     → leave records
GET    /hrms/employees/:id/assets    → assigned assets
GET    /hrms/employees/:id/documents → documents
GET    /hrms/employees/:id/payslips  → payslips
```

**Validation:**
- Email: unique per company
- Employee ID: auto-generated or manual (unique)
- Department: must exist in company
- Reporting Manager: must be an active employee

**Permissions:**
- View list: `hrms:read`
- View detail: `hrms:read` (own profile for EMPLOYEE role)
- Create: `hrms:create`
- Update: `hrms:update`
- Delete: `hrms:delete`

---

#### 18.1.3 Departments (`/hrms/departments`)

**Components:**
- Department tree view (nested sub-departments)
- Card grid view
- Department create/edit dialog
- Employee count per department
- Department head assignment
- Department merge tool

**APIs:**
```
GET    /hrms/departments          → list (tree)
POST   /hrms/departments          → create
PATCH  /hrms/departments/:id      → update
DELETE /hrms/departments/:id      → delete (only if empty)
GET    /hrms/departments/:id/employees → employees in dept
```

---

#### 18.1.4 Attendance (`/hrms/attendance`)

**Components:**
- Date range selector (today/week/month)
- Department filter
- Attendance DataTable: Employee, Check-in, Check-out, Hours, Status, Actions
- Bulk mark attendance button
- Calendar heatmap view (individual employee)
- Manual attendance override (with reason)
- Export attendance report

**Attendance Status Types:**
```
present | absent | late | half_day | on_leave | holiday | weekend
```

**APIs:**
```
GET    /hrms/attendance            → list with filters
POST   /hrms/attendance            → mark attendance (admin)
PATCH  /hrms/attendance/:id        → update (correct)
GET    /hrms/attendance/summary    → summary stats
POST   /hrms/attendance/bulk       → bulk mark
GET    /hrms/attendance/export     → export
```

**Edge Cases:**
- If check-out time missing → show "Not checked out" in red
- If working hours < 4 → auto-mark as half day
- Weekend/Holiday → gray out row

---

#### 18.1.5 Leave Management (`/hrms/leave`)

**Views:**
1. **Leave Requests** — All pending/approved/rejected requests (admin)
2. **My Leave** — Current user's leave balance + requests
3. **Leave Calendar** — Team calendar showing who's on leave
4. **Leave Policies** — Configure leave types and entitlements

**Leave Request Flow:**
```
Employee creates request
  → Manager notified (email + in-app)
  → Manager approves/rejects
  → Employee notified
  → Attendance auto-updated
```

**Components:**
- LeaveBalanceCard (per leave type: earned, sick, casual, etc.)
- LeaveRequestForm (type, from date, to date, reason, attachments)
- LeaveApprovalDialog
- LeaveCalendar (team view)
- LeaveHistory table

**APIs:**
```
GET    /hrms/leave-requests              → list
POST   /hrms/leave-requests              → apply
GET    /hrms/leave-requests/:id          → detail
PATCH  /hrms/leave-requests/:id/approve  → approve
PATCH  /hrms/leave-requests/:id/reject   → reject
DELETE /hrms/leave-requests/:id          → cancel (only pending)
GET    /hrms/leave-balance               → my balance
GET    /hrms/leave-calendar              → team calendar
```

---

#### 18.1.6 Payroll (`/hrms/payroll`)

**Components:**
- Payroll run button (month selector + run)
- Employee payslip list
- Payslip detail dialog (printable PDF)
- Salary structure config
- Bulk payslip download

**Payroll States:**
```
draft → processing → processed → paid
```

**APIs:**
```
GET    /hrms/payroll                 → payroll runs list
POST   /hrms/payroll/run             → trigger payroll run
GET    /hrms/payroll/:runId          → run detail + employee list
GET    /hrms/payroll/payslips/:id    → individual payslip
POST   /hrms/payroll/payslips/export → bulk export
```

---

## 18.2 CRM Module

### Overview

CRM manages the sales pipeline from lead capture to deal closure, including contacts, accounts, activities, and pipeline management.

### Pages

#### 18.2.1 CRM Dashboard (`/crm`)

**Components:**
- StatsCards: Total Leads, Deals in Pipeline, Revenue This Month, Win Rate
- FunnelChart: Lead → Qualified → Demo → Proposal → Negotiation → Won
- AreaChart: Monthly revenue trend
- DataTable: Recent activities
- AIInsights: Pipeline analysis

---

#### 18.2.2 Leads (`/crm/leads`)

**Lead Stages:**
```
new → contacted → qualified → unqualified | converted_to_deal
```

**Views:**
- List view (DataTable)
- Kanban view (by stage)

**Components:**
- LeadCreateDialog
- LeadDetailSheet (side panel)
- LeadConvertDialog (convert to deal)
- ActivityLog (calls, emails, notes)
- AILeadScore badge

**APIs:**
```
GET    /crm/leads               → list
POST   /crm/leads               → create
GET    /crm/leads/:id           → detail
PATCH  /crm/leads/:id           → update
DELETE /crm/leads/:id           → delete
PATCH  /crm/leads/:id/stage     → update stage
POST   /crm/leads/:id/convert   → convert to deal
POST   /crm/leads/:id/activity  → log activity
```

---

#### 18.2.3 Pipeline (`/crm/pipeline`)

**Purpose:** Visual kanban of all deals by stage.

**Deal Stages:**
```
qualification → demo → proposal → negotiation → won | lost
```

**Components:**
- KanbanBoard (dnd-kit)
- DealCard: title, account, value, expected close, probability badge
- Deal stage move (drag + dropdown)
- Pipeline value summary per column
- Win probability color coding

---

#### 18.2.4 Contacts & Accounts

**Contacts:** Individual people at a company.
**Accounts:** Companies / organizations.
**Relationship:** Account → has many Contacts.

**Contact Components:**
- Contact list with company, role, email, phone, last activity
- Contact detail: timeline, linked deals, linked account
- Merge duplicates tool

---

## 18.3 Inventory Module

### Pages

#### 18.3.1 Products (`/inventory/products`)

**Components:**
- Product card grid + list view toggle
- Product create/edit dialog
- Product detail: description, images, pricing, stock levels, category, SKU
- ProductVariants table (size, color, etc.)
- Stock history timeline
- Low stock alert badge

**APIs:**
```
GET    /inventory/products        → list
POST   /inventory/products        → create
GET    /inventory/products/:id    → detail
PATCH  /inventory/products/:id    → update
DELETE /inventory/products/:id    → delete
GET    /inventory/products/:id/stock-history → movements
```

---

#### 18.3.2 Stock Management (`/inventory/stock`)

**Components:**
- Warehouse selector
- Stock by warehouse table
- Stock adjustment dialog (reason: damage, return, correction)
- Stock transfer form (warehouse A → warehouse B)
- Low stock alerts list
- ReorderPoint config per product

---

## 18.4 Procurement Module

### Pages

#### 18.4.1 Vendors (`/procurement/vendors`)

**Components:**
- Vendor list with rating, categories, contact
- Vendor create/edit form
- Vendor performance scorecard
- Vendor documents (GST, contracts)
- Purchase history per vendor

---

#### 18.4.2 RFQ — Request for Quotation (`/procurement/rfq`)

**RFQ Flow:**
```
Draft → Sent to Vendors → Quotes Received → Compare → PO Created
```

**Components:**
- RFQ create wizard (items → vendors → send)
- Quote comparison table (side by side vendor quotes)
- Select winning quote → Create PO button

---

#### 18.4.3 Purchase Orders (`/procurement/purchase-orders`)

**PO States:**
```
draft → approved → sent → partially_received → received | cancelled
```

**Components:**
- PO list with vendor, amount, status, expected date
- PO detail: line items, taxes, totals, approval history
- Goods Receipt form (mark received quantities)
- PO-to-invoice matching

---

## 18.5 Finance Module

### Pages

#### 18.5.1 Invoices (`/finance/invoices`)

**Invoice Types:** Sales Invoice, Purchase Invoice, Credit Note

**Invoice States:**
```
draft → sent → partially_paid → paid | overdue | cancelled
```

**Components:**
- Invoice list with client, amount, due date, status
- Invoice builder (line items, tax, discount, notes)
- Invoice preview (PDF template)
- Email invoice button
- Record payment button
- Payment history

**APIs:**
```
GET    /finance/invoices            → list
POST   /finance/invoices            → create
GET    /finance/invoices/:id        → detail
PATCH  /finance/invoices/:id        → update
DELETE /finance/invoices/:id        → void
POST   /finance/invoices/:id/send   → email to client
POST   /finance/invoices/:id/payment → record payment
GET    /finance/invoices/:id/pdf    → download PDF
```

---

#### 18.5.2 Expenses (`/finance/expenses`)

**Components:**
- Expense claim form (category, amount, date, receipt upload)
- Approval workflow
- Expense report (period summary)
- Receipt OCR (AI scans receipt → fills form)

---

#### 18.5.3 Reports (`/finance/reports`)

**Report Types:**
- Profit & Loss Statement
- Balance Sheet
- Cash Flow Statement
- Tax Report (GST/VAT)
- Accounts Receivable Aging
- Accounts Payable Aging

**Features:**
- Date range picker
- Export to Excel/PDF
- AI-generated summary ("This month you spent 30% more on..."

---

## 18.6 Project Management Module

### Pages

#### 18.6.1 Projects (`/projects`)

**Project Views:**
- Card grid (all projects)
- Table view

**Project Status:**
```
planning → active → on_hold → completed | cancelled
```

---

#### 18.6.2 Project Detail (`/projects/[id]`)

**Tabs:**
1. **Overview** — Description, milestones, team, budget
2. **Tasks** — Kanban or list view
3. **Milestones** — Timeline/Gantt view
4. **Timesheets** — Logged hours by member
5. **Files** — Project documents
6. **Activity** — Comments, changes

**Task States:**
```
todo → in_progress → review → done | cancelled
```

**Task Components:**
- TaskCard (kanban)
- TaskCreateDialog
- TaskDetailSheet: description, assignee, due date, priority, subtasks, comments, attachments, time tracking
- Task dependencies

---

#### 18.6.3 Gantt / Timeline (`/projects/[id]/milestones`)

**Component:**
- Gantt chart (custom or react-gantt)
- Milestone markers
- Dependency lines
- Drag milestone to update dates
- Critical path highlight

---

## 18.7 Support Tickets Module

### Pages

#### 18.7.1 Tickets (`/support/tickets`)

**Ticket States:**
```
open → assigned → in_progress → pending → resolved | closed
```

**Priority:** critical | high | medium | low

**Components:**
- Ticket list (DataTable or Kanban)
- Ticket create form
- Ticket detail: description, attachments, SLA timer, conversation thread
- Internal notes (only visible to agents)
- Assign to agent
- Change priority/status
- AI Ticket Summary
- Auto-suggest KB articles

**APIs:**
```
GET    /support/tickets                → list
POST   /support/tickets                → create
GET    /support/tickets/:id            → detail
PATCH  /support/tickets/:id            → update
POST   /support/tickets/:id/reply      → add reply
POST   /support/tickets/:id/assign     → assign agent
PATCH  /support/tickets/:id/status     → change status
POST   /support/tickets/:id/close      → close
GET    /support/tickets/:id/ai-summary → AI summary
```

---

## 18.8 Documents Module

### Pages

#### 18.8.1 Documents (`/documents`)

**Features:**
- Folder tree (left panel)
- File grid / list view
- Drag & drop file upload
- Folder create
- File preview (PDF, images, Office)
- Share file (link or specific users)
- File version history
- File tagging
- Full-text search

**Components:**
- FolderTree
- FileGrid / FileList
- FileUploadZone
- FilePreviewDialog
- ShareDialog
- VersionHistoryPanel

---

## 18.9 Analytics Module

### Page (`/analytics`)

**Sections:**
1. **Business Overview** — Revenue, expenses, profit trend
2. **HRMS Analytics** — Headcount, attrition, attendance
3. **CRM Analytics** — Pipeline, conversion, revenue
4. **Inventory Analytics** — Stock value, turnover, low stock
5. **Support Analytics** — Ticket volume, resolution time, SLA %

**Features:**
- Date range filter (last 7d / 30d / 90d / 12m / custom)
- Department / region filter
- Download report (Excel / PDF)
- AI Summary of each section
- Scheduled report (email weekly/monthly)

---

## 18.10 Settings Module

### Structure

```
Settings
├── Profile           — User profile, password, 2FA
├── Company           — Company name, logo, timezone, currency
├── Users             — Invite users, manage access
├── Roles             — Create/edit roles, assign permissions
├── Billing           — Plan, usage, payment method
├── Email             — Email templates, SMTP config
├── Integrations      — Slack, Google, Zapier, etc.
├── Audit Logs        — All admin actions
└── API Keys          — Developer API keys
```

#### Roles & Permissions UI

```
Matrix view:
Modules as rows → Actions (create/read/update/delete/export/approve) as columns
Toggle cells to enable/disable
Save role button
```

---

## 19. Performance Optimization

### Code Splitting

```ts
// Dynamic imports for heavy modules
const RichTextEditor = dynamic(() => import('@/components/common/RichTextEditor'), {
  loading: () => <Skeleton className="h-48 w-full" />,
  ssr: false,
})

const KanbanBoard = dynamic(() => import('@/components/common/KanbanBoard'), {
  loading: () => <KanbanSkeleton />,
  ssr: false,
})
```

### Image Optimization

```tsx
// Always use next/image
import Image from 'next/image'

<Image
  src={employee.avatar}
  alt={employee.name}
  width={40}
  height={40}
  className="rounded-full"
  placeholder="blur"
  blurDataURL="data:image/..."
/>
```

### Virtual Lists

```tsx
// For large data lists, use virtualization
import { useVirtualizer } from '@tanstack/react-virtual'

// Applied in:
// - Notification center (100+ items)
// - File browser
// - Activity timeline
// - Audit logs
```

### React Server Components

```tsx
// Static/data-heavy sections use RSC
// Example: Settings page loads initial config server-side

// app/(dashboard)/settings/page.tsx
export default async function SettingsPage() {
  const settings = await getSettings() // server-side fetch
  return <SettingsView initialData={settings} />
}
```

### Bundle Optimization

```ts
// next.config.ts
export default {
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', '@radix-ui/react-icons'],
  },
}
```

---

## 20. Testing Strategy

### Unit Testing (Vitest)

```ts
// __tests__/hooks/usePermission.test.ts
import { renderHook } from '@testing-library/react'
import { usePermission } from '@/hooks/usePermission'

describe('usePermission', () => {
  it('should return true for SUPER_ADMIN', () => {
    // mock auth store with SUPER_ADMIN
    const { result } = renderHook(() => usePermission())
    expect(result.current.can('hrms', 'delete')).toBe(true)
  })
  
  it('should return false when no permission', () => {
    // mock auth store with EMPLOYEE role
    const { result } = renderHook(() => usePermission())
    expect(result.current.can('finance', 'delete')).toBe(false)
  })
})
```

### Component Testing

```tsx
// __tests__/components/StatusBadge.test.tsx
import { render, screen } from '@testing-library/react'
import { StatusBadge } from '@/components/common/StatusBadge'

describe('StatusBadge', () => {
  it('renders active badge correctly', () => {
    render(<StatusBadge status="active" />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })
})
```

### E2E Testing (Playwright)

```ts
// e2e/auth/login.spec.ts
test('successful login redirects to dashboard', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name="email"]', 'admin@company.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('[type="submit"]')
  await expect(page).toHaveURL('/dashboard')
})

test('invalid credentials shows error', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name="email"]', 'wrong@email.com')
  await page.fill('[name="password"]', 'wrongpass')
  await page.click('[type="submit"]')
  await expect(page.locator('[data-testid="auth-error"]')).toBeVisible()
})
```

---

## 21. Deployment

### Environment Variables

```env
# .env.local

# API
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com

# Auth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://app.yourdomain.com

# Storage
NEXT_PUBLIC_STORAGE_URL=https://storage.yourdomain.com

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# AI
NEXT_PUBLIC_AI_ENABLED=true
```

### Vercel Deployment

```json
// vercel.json
{
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["sin1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

### Docker

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

### GitHub Actions CI/CD

```yaml
# .github/workflows/frontend.yml
name: Frontend CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm type-check
      - run: pnpm test
      
  deploy:
    needs: lint-and-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

*AI Business OS — Frontend Architecture Documentation v1.0.0*  
*Total Coverage: Authentication, RBAC, Layout, 10+ Modules, Component Library, API Layer, State Management, Testing, Deployment*
