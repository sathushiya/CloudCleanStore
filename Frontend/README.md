# Cloud Clean Store

A modern e-commerce platform for cleaning products, built with React, TypeScript, and Tailwind CSS.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- npm, pnpm, or yarn

### Installation

```bash
# Install dependencies
npm install
# or
pnpm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

## 🔐 Demo Credentials

| Role       | Email                          | Password               |
|------------|-------------------------------|------------------------|
| Admin      | admin@cloudclean.store        | Admin@2026!Secure      |
| Supervisor | supervisor@cloudclean.store   | Supervisor@2026!Lead   |
| Staff      | staff@cloudclean.store        | Staff@2026!Strong      |
| Delivery   | delivery@cloudclean.store     | Delivery@2026!Fast     |
| Customer   | customer@cloudclean.store     | Customer@2026!Pass     |

## 📁 Project Structure

```
src/
├── App.tsx                    # Root app component with page routing
├── main.tsx                   # Entry point
├── assets/
│   └── imports/               # Project images and screenshots
├── components/
│   ├── common/                # Reusable UI primitives
│   │   ├── BackButton.tsx
│   │   ├── ImageWithFallback.tsx
│   │   ├── Logo.tsx
│   │   ├── SearchBar.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── index.ts
│   ├── layout/                # Page layout components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── index.ts
│   ├── ui/                    # shadcn/ui primitives
│   ├── admin/                 # Admin-specific components
│   │   ├── InventoryView.tsx
│   │   ├── NotificationsCenter.tsx
│   │   ├── OrdersDelivery.tsx
│   │   ├── PerformanceAnalytics.tsx
│   │   ├── PermissionsManagement.tsx
│   │   ├── ProductsManagement.tsx
│   │   ├── StaffManagement.tsx
│   │   └── index.ts
│   ├── Hero.tsx               # Home page hero section
│   ├── Categories.tsx         # Product categories
│   ├── Products.tsx           # Featured products grid
│   ├── Brands.tsx             # Brand logos strip
│   ├── Features.tsx           # USP features section
│   ├── CartModal.tsx          # Slide-over cart
│   ├── ProductModal.tsx       # Product detail modal
│   ├── DashboardSearchModal.tsx
│   └── OrderNotificationPopup.tsx
├── pages/
│   ├── Login.tsx
│   ├── Signup.tsx
│   ├── ForgotPassword.tsx
│   ├── Shop.tsx
│   ├── Checkout.tsx
│   ├── BankTransfer.tsx
│   ├── Dashboard.tsx
│   ├── AdminDashboard.tsx
│   ├── StaffDashboard.tsx
│   ├── SupervisorDashboard.tsx
│   ├── CustomerAddresses.tsx
│   ├── CustomerSettings.tsx
│   ├── CustomerWishlist.tsx
│   └── CustomerActivity.tsx
├── context/
│   ├── AuthContext.tsx         # Authentication state
│   └── CartContext.tsx         # Shopping cart state
├── hooks/
│   ├── useNavigation.ts        # Page navigation with history
│   ├── useLocalStorage.ts      # Persistent local storage hook
│   └── index.ts
├── data/
│   ├── products.ts             # Product catalogue
│   ├── admin.ts                # Admin mock data
│   └── orderHistory.ts         # Order history mock data
├── utils/
│   └── auth.ts                 # Auth helpers & dummy users
├── types/
│   └── index.ts                # Shared TypeScript types
└── styles/
    ├── index.css               # Main CSS entry
    ├── theme.css               # CSS custom properties / design tokens
    ├── globals.css
    ├── fonts.css
    └── tailwind.css
```

## 🛠 Tech Stack

- **React 18** with TypeScript
- **Vite** — fast development server & build tool
- **Tailwind CSS v4** — utility-first styling
- **shadcn/ui** — accessible component primitives (Radix UI)
- **Lucide React** — icon set
- **Recharts** — data visualisation for dashboards
- **React Hook Form** — form management
- **Sonner** — toast notifications
- **Motion** — animations
