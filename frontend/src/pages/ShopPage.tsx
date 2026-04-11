import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, 
  MessageCircle, 
  ShoppingBag, 
  Calendar,
  ChevronLeft
} from 'lucide-react';
import { useShop, useProducts } from '@/hooks';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/LoadingSpinner';
import { cn, getImageUrl, formatDate } from '@/utils/helpers';

export const ShopPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: shop, isLoading: shopLoading } = useShop(slug || '');
  
  // Filter products by shop
  const { data: allProducts } = useProducts();
  const shopProducts = allProducts?.filter(p => p.shop?.slug === slug) || [];

  if (shopLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-64 w-full rounded-2xl mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton className="h-48" />
          <div className="md:col-span-3 space-y-4">
            <Skeleton className="h-8 w-1/2" variant="text" />
            <Skeleton className="h-4 w-1/3" variant="text" />
          </div>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-4">Do'kon topilmadi</h1>
        <Button asChild>
          <Link to="/products">Katalogga qaytish</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Banner */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-primary to-purple-600">
        {shop.banner && (
          <img
            src={getImageUrl(shop.banner)}
            alt={shop.name}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Back button */}
        <div className="absolute top-4 left-4">
          <Link 
            to="/products"
            className="flex items-center gap-1 text-white/90 hover:text-white bg-black/20 hover:bg-black/30 px-3 py-2 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Orqaga</span>
          </Link>
        </div>
      </div>

      {/* Shop info */}
      <div className="container mx-auto px-4">
        <div className="relative -mt-16 md:-mt-20 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Shop image */}
              <div className="w-24 h-24 md:w-32 md:h-32 bg-surface rounded-xl overflow-hidden shrink-0 mx-auto md:mx-0">
                <img
                  src={getImageUrl(shop.image)}
                  alt={shop.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
                  {shop.name}
                </h1>
                
                {shop.description && (
                  <p className="text-text-secondary mb-4 line-clamp-2">
                    {shop.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{shop.rating.toFixed(1)}</span>
                    <span className="text-text-muted">reyting</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-5 h-5 text-text-muted" />
                    <span className="font-semibold">{shop.comment_count}</span>
                    <span className="text-text-muted">izoh</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <ShoppingBag className="w-5 h-5 text-text-muted" />
                    <span className="font-semibold">{shop.order_count}</span>
                    <span className="text-text-muted">buyurtma</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Calendar className="w-5 h-5 text-text-muted" />
                    <span className="text-text-muted">
                      {formatDate(shop.created_at)} dan
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 shrink-0">
                <Button 
                  leftIcon={<MessageCircle className="w-4 h-4" />}
                  onClick={() => navigate(`/chats/${shop?.slug || slug}`)}
                  disabled={!shop && !slug}
                >
                  Xabar yozish
                </Button>
                <div className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm",
                  shop.is_online ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                )}>
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    shop.is_online ? "bg-green-500" : "bg-gray-400"
                  )} />
                  {shop.is_online ? 'Onlayn' : 'Offlayn'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products section */}
        <div className="pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-primary">
              Do'kon mahsulotlari ({shopProducts.length})
            </h2>
          </div>

          {shopProducts.length > 0 ? (
            <ProductGrid products={shopProducts} columns={5} />
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl">
              <ShoppingBag className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Hozircha mahsulot yo'q
              </h3>
              <p className="text-text-secondary">
                Bu do'kon hali mahsulot qo'shmagan
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
