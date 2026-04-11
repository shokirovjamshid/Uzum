# Uzum Market Frontend

React + TypeScript frontend for Uzum Market - a full-featured e-commerce marketplace platform.

## Features

- **User Authentication**: Phone-based login with SMS verification and QR code login
- **Product Catalog**: Browse products with filters, search, and sorting
- **Product Details**: View product information, images, variants, reviews
- **Shopping Cart**: Add/remove items, manage quantities
- **Favorites**: Save products for later
- **Shop Pages**: View shop profiles and their products
- **Chat System**: Real-time messaging between buyers and sellers (WebSocket)
- **User Profile**: Manage personal information and view order history
- **Responsive Design**: Mobile-first design that works on all devices

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **QR Codes**: qrcode.react

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running (see main project README)

### Installation

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your backend URL:
```env
VITE_API_URL=http://localhost:8000/api/v1
```

4. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

Output will be in the `dist` directory.

## Project Structure

```
frontend/
├── src/
│   ├── components/       # React components
│   │   ├── layout/      # Layout components (Header, Footer)
│   │   ├── product/     # Product-related components
│   │   ├── cart/        # Cart components
│   │   ├── ui/          # UI components (Button, Input, etc.)
│   │   └── auth/        # Authentication components
│   ├── pages/           # Page components
│   ├── hooks/           # Custom React hooks
│   ├── stores/          # Zustand state stores
│   ├── services/        # API services
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   └── providers/       # React context providers
├── public/              # Static assets
└── index.html           # HTML entry point
```

## API Integration

The frontend connects to the Django REST API. All API calls are centralized in `src/services/api.ts`.

### Key Endpoints

- `POST /register` - User login with phone/code
- `GET /categories` - Get product categories
- `GET /products` - Get products list
- `GET /products/:slug` - Get product details
- `GET /user/favorites` - Get user's favorites
- `POST /user/favorites` - Add/remove favorite
- `GET /shops/:slug` - Get shop details
- `GET /rooms/` - Get chat rooms
- `GET /rooms/:id/historys/` - Get chat messages

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features

1. Create types in `src/types/index.ts`
2. Add API functions in `src/services/api.ts`
3. Create hooks in `src/hooks/`
4. Build components in `src/components/`
5. Create page in `src/pages/`
6. Add route in `src/App.tsx`

## Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
