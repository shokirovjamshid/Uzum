import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { ProductVariant } from '@/types';
import {
  Heart,
  Shield,
  Truck,
  RotateCcw,
  Star,
  ChevronRight,
  ShoppingCart,
  MessageCircle,
  Check,
  Minus,
  Plus,
  Loader2
} from 'lucide-react';
import { useProduct, useProductComments } from '@/hooks';
import { useCartStore, useFavoritesStore } from '@/stores';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/LoadingSpinner';
import { cn, formatPrice, getImageUrl, formatDate } from '@/utils/helpers';

export const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isToggling, setIsToggling] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  const { data: product, isLoading } = useProduct(slug || '');
  const { data: comments } = useProductComments(slug || '');
  const { addItem } = useCartStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();

  // Set default variant when product loads
  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  // Use API is_favorite field if available, otherwise fall back to local store
  const favorite = product?.id ? (product.is_favorite ?? isFavorite(product.id)) : false;

  const handleToggleFavorite = async () => {
    if (product?.id && !isToggling) {
      setIsToggling(true);
      await toggleFavorite(product);
      setIsToggling(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" variant="text" />
            <Skeleton className="h-6 w-1/2" variant="text" />
            <Skeleton className="h-12 w-1/3" variant="text" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-4">
          Mahsulot topilmadi
        </h1>
        <Button onClick={() => navigate('/products')}>
          Katalogga qaytish
        </Button>
      </div>
    );
  }
  
  const images = product.images?.length ? product.images : [{ image: product.image || '' }];
  const currentPrice = selectedVariant?.price || product.price || product.variants?.[0]?.price || 0;

  return (
    <div className="min-h-screen bg-surface">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-text-secondary">
          <Link to="/" className="hover:text-primary">Bosh sahifa</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/products" className="hover:text-primary">Katalog</Link>
          {product.category && (
            <>
              <ChevronRight className="w-4 h-4" />
              <Link to={`/products?category=${product.category.slug}`} className="hover:text-primary">
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-4 h-4" />
          <span className="text-text-primary">{product.name}</span>
        </nav>
      </div>
      
      {/* Main content */}
      <div className="container mx-auto px-4 pb-12">
        <div className="bg-white rounded-2xl p-4 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-surface rounded-xl overflow-hidden relative">
                <img
                  src={getImageUrl(images[selectedImage]?.image)}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={handleToggleFavorite}
                  disabled={isToggling}
                  className={cn(
                    "absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                    favorite ? "bg-secondary/90 text-white" : "bg-white/90 text-text-muted hover:text-secondary",
                    isToggling && "opacity-70 cursor-not-allowed"
                  )}
                >
                  {isToggling ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Heart className={cn("w-6 h-6", favorite && "fill-current")} />
                  )}
                </button>
              </div>
              
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={cn(
                        "w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors shrink-0",
                        selectedImage === index ? "border-primary" : "border-transparent hover:border-gray-300"
                      )}
                    >
                      <img
                        src={getImageUrl(img.image)}
                        alt={`${product.name} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Info */}
            <div className="space-y-6">
              {/* Rating and shop */}
              <div className="flex items-center gap-4 flex-wrap">
                {product.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-text-primary">{product.rating.toFixed(1)}</span>
                    <span className="text-text-muted">({product.comments_count} izoh)</span>
                  </div>
                )}
                <Link 
                  to={`/shops/${product.shop?.slug}`}
                  className="text-primary hover:underline"
                >
                  {product.shop?.name}
                </Link>
              </div>
              
              {/* Name */}
              <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
                {product.name}
              </h1>
              
              {/* Short description */}
              {product.short_description && (
                <p className="text-text-secondary">{product.short_description}</p>
              )}
              
              {/* Price */}
              <div className="bg-surface rounded-xl p-4">
                <p className="text-3xl md:text-4xl font-bold text-primary">
                  {formatPrice(currentPrice)}
                </p>
                <p className="text-sm text-text-muted mt-1">
                  dan {formatPrice(Math.round(currentPrice / 12))}/oyga muddatli to'lov
                </p>
              </div>
              
              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-2">
                  <span className="font-medium text-text-primary">Variant:</span>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={cn(
                          "px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors",
                          selectedVariant?.id === variant.id
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-gray-200 hover:border-gray-300 text-text-secondary"
                        )}
                      >
                        {variant.feature && Object.entries(variant.feature).map(([k, v]) => `${k}: ${v}`).join(', ')}
                        {variant.color && ` - ${variant.color.name}`}
                        <span className="block text-xs font-normal">
                          {formatPrice(variant.price)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-4">
                <span className="font-medium text-text-primary">Miqdor:</span>
                <div className="flex items-center gap-2 bg-surface rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-l-lg transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-r-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  size="lg"
                  fullWidth
                  leftIcon={<ShoppingCart className="w-5 h-5" />}
                  onClick={() => product?.id && addItem(product, quantity, selectedVariant || undefined)}
                >
                  Savatga qo'shish
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate(`/chats/${product.shop?.slug}`)}
                  leftIcon={<MessageCircle className="w-5 h-5" />}
                >
                  Xabar yozish
                </Button>
              </div>
              
              {/* Features */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Shield className="w-5 h-5 text-primary" />
                  <span>Sifat kafolati</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Truck className="w-5 h-5 text-primary" />
                  <span>Tez yetkazib berish</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <RotateCcw className="w-5 h-5 text-primary" />
                  <span>14 kun ichida qaytarish</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Check className="w-5 h-5 text-primary" />
                  <span>{product.guarantee || 6} oy kafolat</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Description and Comments */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Description */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-text-primary mb-4">Tavsif</h2>
              <div 
                className="prose max-w-none text-text-secondary"
                dangerouslySetInnerHTML={{ __html: product.description || 'Tavsif mavjud emas' }}
              />
            </div>
            
            {/* Shop info */}
            <div className="bg-surface rounded-xl p-6">
              <h3 className="font-semibold text-text-primary mb-4">Sotuvchi</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 bg-white rounded-xl overflow-hidden">
                  <img
                    src={getImageUrl(product.shop?.image)}
                    alt={product.shop?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <Link 
                    to={`/shops/${product.shop?.slug}`}
                    className="font-medium text-text-primary hover:text-primary"
                  >
                    {product.shop?.name}
                  </Link>
                  <div className="flex items-center gap-1 text-sm text-text-secondary">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{product.shop?.rating.toFixed(1)}</span>
                    <span>({product.shop?.comment_count} izoh)</span>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                fullWidth
                onClick={() => navigate(`/shops/${product.shop?.slug}`)}
              >
                Do'konni ko'rish
              </Button>
            </div>
          </div>
          
          {/* Comments */}
          {comments && comments.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold text-text-primary mb-4">
                Izohlar ({comments.length})
              </h2>
              <div className="space-y-4">
                {comments.slice(0, 3).map((comment: unknown) => (
                  <div key={(comment as { id: number }).id} className="bg-surface rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="font-medium text-primary">
                          {(comment as { user_name: string }).user_name?.[0] || 'A'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{(comment as { user_name: string }).user_name}</p>
                        <p className="text-sm text-text-muted">{formatDate((comment as { created_at: string }).created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-4 h-4",
                            i < (comment as { quality_assessment: number }).quality_assessment 
                              ? "fill-yellow-400 text-yellow-400" 
                              : "text-gray-300"
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-text-secondary">{(comment as { comment: string }).comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
