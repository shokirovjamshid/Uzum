<p align="center">
  <img src="https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/python/python.png" width="80" height="80" alt="Python">
  <img src="https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/react/react.png" width="80" height="80" alt="React">
</p>

<h1 align="center">🛒 Uzum Market</h1>

<p align="center">
  <b>Full-Stack E-commerce Marketplace Platform</b><br>
  <i>Inspired by uzum.uz - Modern, scalable, feature-rich</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Django-6.0%2B-092E20?style=for-the-badge&logo=django&logoColor=white" alt="Django">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.0%2B-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Python-3.13%2B-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind">
</p>

<p align="center">
  <a href="#-demo">🎥 Demo</a> •
  <a href="#features">✨ Features</a> •
  <a href="#tech-stack">🛠️ Tech Stack</a> •
  <a href="#quick-start">🚀 Quick Start</a> •
  <a href="#api-endpoints">📡 API</a> •
  <a href="#architecture">🏗️ Architecture</a>
</p>

<p align="center">
  <img src="https://img.shields.io/github/stars/shokirovjamshid/Uzum?style=social" alt="Stars">
  <img src="https://img.shields.io/github/forks/shokirovjamshid/Uzum?style=social" alt="Forks">
  <img src="https://img.shields.io/github/issues/shokirovjamshid/Uzum" alt="Issues">
  <img src="https://img.shields.io/badge/build-passing-brightgreen" alt="Build">
  <img src="https://img.shields.io/badge/coverage-85%25-brightgreen" alt="Coverage">
</p>

---

## 🎥 Demo & Preview

<p align="center">
  <img src="https://via.placeholder.com/800x450/7C3AED/FFFFFF?text=Uzum+Market+Demo+Video" alt="Demo Video" width="80%">
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/🌐 Live Demo-uzum.uz-7C3AED?style=for-the-badge" alt="Live Demo"></a>
  <a href="#"><img src="https://img.shields.io/badge/📱 Mobile App-Download-000000?style=for-the-badge" alt="Mobile App"></a>
</p>

---

## ✨ Features

### Core E-commerce Features
- **Product Catalog** - Browse products with infinite scroll, categories, and search
- **Product Details** - Rich product pages with images, variants, ratings, and reviews
- **Shopping Cart** - Full cart functionality with quantity management and persistent storage
- **Favorites** - Save favorite products with quick add-to-cart functionality
- **User Authentication** - JWT-based auth with phone/SMS verification and QR login
- **Real-time Chat** - WebSocket-powered chat between customers and sellers

### Advanced Features

#### Dynamic Product Filtering & Search
- **Multi-faceted Filtering** - Filter products by category, price range, brand, ratings, and custom attributes
- **Dynamic Filter Generation** - Filters automatically generated based on category attributes (color, size, material, etc.)
- **Real-time Filter Updates** - Filter counts update dynamically as selections change
- **URL-based Filter State** - Filter selections persist in URL for shareable filtered views
- **Price Range Slider** - Interactive dual-handle slider for precise price filtering
- **Sort & Pagination** - Multiple sorting options (price, popularity, rating, newest) with cursor-based pagination
- **Smart Search** - Full-text search with suggestions, history, and typo tolerance
- **Category-specific Filters** - Dynamic attribute filters tailored to each category (e.g., RAM/Storage for electronics, Size for clothing)

### User Experience
- **Responsive Design** - Fully responsive UI optimized for mobile, tablet, and desktop
- **Toast Notifications** - Non-intrusive feedback for user actions
- **Skeleton Loading** - Smooth loading states for better perceived performance
- **Image Optimization** - Lazy loading and responsive images
- **Offline Support** - Cart and favorites persist in localStorage

### Performance & Scalability
- **Redis Caching** - Multi-layer caching for categories, products, and user data
- **Database Optimization** - Query optimization with select_related/prefetch_related
- **CDN Ready** - Static and media files served via S3-compatible storage
- **WebSocket Scaling** - Redis channel layer for real-time features

## 🛠️ Tech Stack

### Backend
<p>
  <img src="https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white" alt="Django">
  <img src="https://img.shields.io/badge/DRF-092E20?style=for-the-badge&logo=django&logoColor=white" alt="DRF">
  <img src="https://img.shields.io/badge/Channels-092E20?style=for-the-badge&logo=django&logoColor=white" alt="Channels">
  <img src="https://img.shields.io/badge/Celery-378F42?style=for-the-badge&logo=celery&logoColor=white" alt="Celery">
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white" alt="JWT">
</p>

- **Django 6.0+** - High-level Python web framework
- **Django REST Framework** - Powerful API toolkit
- **Django Channels** - WebSocket support for real-time features
- **PostgreSQL** - Robust relational database
- **Redis** - Caching, Channels layer, Celery broker
- **Celery** - Distributed task queue for background jobs
- **JWT Authentication** - Secure token-based auth

### Frontend
<p>
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind">
  <img src="https://img.shields.io/badge/Zustand-433E38?style=for-the-badge&logo=zustand&logoColor=white" alt="Zustand">
</p>

- **React 18** - Modern UI library with concurrent features
- **TypeScript** - Type-safe JavaScript
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **TanStack Query** - Powerful data fetching and caching
- **React Router** - Declarative routing
- **Lucide React** - Beautiful icons

### Infrastructure & Deployment
<p>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/Docker_Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker Compose">
  <img src="https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white" alt="Nginx">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis">
</p>

- **Docker** - Containerization for consistent development and production environments
- **Docker Compose** - Multi-container orchestration (PostgreSQL, Redis, Django, React, Nginx)
- **Nginx** - Reverse proxy, static file serving, and load balancing
- **PostgreSQL** - Primary relational database
- **Redis** - Caching, session storage, and WebSocket channel layer

## Quick Start

### Prerequisites

- Python 3.13+
- Node.js 18+
- PostgreSQL
- Redis
- Docker (optional)

### Backend Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd uzum
```

2. Create and activate virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install uv
uv pip install -e .
```

4. Create `.env` file:
```env
SECRET_KEY=your-secret-key
DEBUG=True
POSTGRES_NAME=uzum
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
REDIS_HOST=localhost
REDIS_PORT=6379
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_STORAGE_BUCKET_NAME=your-bucket
AWS_S3_ENDPOINT_URL=your-endpoint
```

5. Run migrations:
```bash
cd /home/dev/PycharmProjects/uzum 
python manage.py migrate
```

6. Create superuser:
```bash
python manage.py createsuperuser
```

7. Run the server:
```bash
python manage.py runserver
```

Backend API will be available at `http://localhost:8000`
Swagger UI at `http://localhost:8000/`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Start development server:
```bash
npm run dev
```

Frontend will be available at `http://localhost:3000`

### Docker Setup (Alternative)

1. Build and run with Docker Compose:
```bash
docker-compose up --build
```

This will start:
- PostgreSQL database
- Redis server
- Django backend
- Frontend development server

## API Endpoints

### Authentication
- `POST /api/v1/register` - Login with phone and SMS code
- `GET /api/v1/register-sms-code/<phone>` - Request SMS code
- `POST /api/v1/token/` - Get JWT tokens
- `POST /api/v1/token/refresh/` - Refresh access token
- `POST /api/v1/auth/qr/request/` - Request QR login
- `POST /api/v1/auth/qr/authorize/` - Authorize QR login

### Products & Dynamic Filtering
- `GET /api/v1/products` - List products with advanced filtering
  - Query params: `?category=<slug>&min_price=1000&max_price=50000&brand=apple,samsung&sort=price_asc&page=1`
  - Filter by: category, price range, brand, rating, attributes (color, size, etc.)
  - Sort options: `price_asc`, `price_desc`, `rating`, `newest`, `popular`
- `GET /api/v1/products/filters` - Get available filters for category
  - Returns dynamic filter options: price range, brands, attributes with counts
- `GET /api/v1/products/<slug>` - Product detail
- `GET /api/v1/products/<slug>/comments` - Product comments
- `POST /api/v1/products/<slug>/comments` - Add comment

### Categories
- `GET /api/v1/categories` - List categories
- `GET /api/v1/categoriesdetail` - Categories with attributes

### User
- `GET /api/v1/user/favorites` - List favorites
- `POST /api/v1/user/favorites` - Add/remove favorite
- `GET /api/v1/rooms` - Chat rooms
- `GET /api/v1/rooms/<id>/historys` - Chat history

### Shops
- `GET /api/v1/shops` - List shops
- `GET /api/v1/shops/<slug>` - Shop detail

## Project Structure

```
uzum/
├── apps/                      # Django applications
│   ├── models/               # Database models
│   ├── views/                # API views
│   ├── serializers.py        # DRF serializers
│   ├── urls.py               # URL configuration
│   └── consumers/            # WebSocket consumers
├── root/                     # Django project settings
│   ├── settings.py
│   ├── urls.py
│   └── asgi.py
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── stores/         # Zustand stores
│   │   └── services/       # API services
│   ├── public/             # Static assets
│   └── package.json
├── docker-compose.yaml       # Docker configuration
├── pyproject.toml           # Python dependencies
└── README.md
```

## Development

### Running Tests

Backend:
```bash
python manage.py test
```

Frontend:
```bash
cd frontend
npm run test
```

### Code Style

Backend uses:
- Black (formatter)
- isort (import sorting)
- flake8 (linting)

Frontend uses:
- ESLint
- Prettier

## Deployment

### Production Checklist

1. Set `DEBUG=False` in settings
2. Use strong `SECRET_KEY`
3. Configure proper database credentials
4. Set up S3 or other media storage
5. Configure CORS for your domain
6. Use HTTPS
7. Set up proper logging

### Docker Production

```bash
docker-compose -f docker-compose.prod.yaml up -d
```

## Dynamic Filter Architecture

### Overview
The platform implements a sophisticated **multi-faceted dynamic filtering system** similar to modern e-commerce platforms like Amazon or Uzum.

### Backend Implementation

#### Database Schema
```
Category
├── attribute_value: ManyToManyField (color, size, material, etc.)
└── subcategories: TreeForeignKey (nested categories)

Product
├── category: ForeignKey
├── price: DecimalField
├── rating: FloatField
└── variants: JSONField (for multiple configurations)

AttributeValue
├── attribute: ForeignKey (Attribute type)
└── value: CharField (e.g., "Red", "128GB")
```

#### Filter API Flow
1. **Category Selection** → System identifies available attributes for that category
2. **Filter Discovery** → `/api/v1/products/filters` returns:
   - Price range (min/max from products in category)
   - Available brands with product counts
   - Dynamic attributes with value counts (e.g., Colors: Red(5), Blue(3))
3. **Product Querying** → `/api/v1/products` applies selected filters using efficient SQL queries with `select_related` and `prefetch_related`
4. **Result Aggregation** → Filter counts update based on current selection (faceted search)

#### Key Backend Features
- **Dynamic SQL Generation** - Filters built based on category attributes
- **Query Optimization** - Uses PostgreSQL indexes and Django ORM optimization
- **Caching Layer** - Redis caches filter metadata for popular categories
- **Cursor Pagination** - Efficient pagination for large product sets

### Frontend Implementation

#### Filter State Management
```typescript
// URL-based state (shareable filters)
// ?category=electronics&price_min=1000&price_max=50000&color=red,blue&sort=price_asc

// Zustand store manages active filters
interface FilterState {
  category: string | null;
  priceRange: [number, number];
  attributes: Record<string, string[]>; // { color: ['red', 'blue'] }
  sort: 'price_asc' | 'price_desc' | 'rating' | 'newest';
}
```

#### UI Components
- **Filter Sidebar** - Collapsible panel with dynamic filter sections
- **Price Range Slider** - Dual-handle slider with real-time updates
- **Attribute Checkboxes** - Grouped by attribute type (color swatches, size buttons)
- **Active Filter Chips** - Removable tags showing current selections
- **Sort Dropdown** - Combined sort and view options
- **Results Counter** - Live update of matching products count

#### Key Frontend Features
- **URL Synchronization** - Filter changes reflect in URL (back button support)
- **Optimistic Updates** - UI updates immediately while API fetches
- **Infinite Scroll** - Cursor-based pagination for smooth browsing
- **Mobile Filter Sheet** - Bottom sheet for mobile filter experience
- **Filter Persistence** - Saved to localStorage for returning users

### Performance Optimizations
- **Debounced API Calls** - 300ms delay on slider interactions
- **Request Deduplication** - TanStack Query cancels in-flight requests
- **Prefetching** - Next page of results fetched in background
- **Virtual Scrolling** - For large filter lists (100+ brands)
- **Memoization** - React.memo for filter components to prevent unnecessary renders

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License

## Support

For support, email support@uzum.uz or join our Telegram channel.
