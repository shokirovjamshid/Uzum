import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight, Loader2, X } from 'lucide-react';
import { useEffect } from 'react';
import { useFavoritesStore, useCartStore } from '@/stores';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export const FavoritesPage = () => {
  const { items, isLoading, fetchFavorites, toggleFavorite } = useFavoritesStore();
  const { addItem, items: cartItems } = useCartStore();

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleAddAllToCart = () => {
    // Get existing product IDs in cart
    const cartProductIds = new Set(cartItems.map(item => item.product.id));

    // Filter only products not already in cart
    const newProducts = items.filter(product => !cartProductIds.has(product.id));

    if (newProducts.length === 0) {
      toast('Barcha mahsulotlar allaqachon savatda', { icon: 'ℹ️' });
      return;
    }

    // Add only new products with first variant if available
    newProducts.forEach((product) => {
      const firstVariant = product.variants?.[0];
      addItem(product, 1, firstVariant);
    });

    toast.success(`${newProducts.length} ta mahsulot savatga qo'shildi`);
  };

  const handleRemove = async (productId: number) => {
    console.log('handleRemove called with productId:', productId);
    if (!productId) {
      console.error('No productId provided');
      return;
    }
    // Find the product in items
    const product = items.find((item) => item.id === productId);
    if (!product) {
      console.error('Product not found in items');
      return;
    }
    try {
      // Use toggleFavorite which properly handles removal via slug endpoint
      await toggleFavorite(product);
      console.log('toggleFavorite (remove) completed');
    } catch (error) {
      console.error('Error in handleRemove:', error);
      toast.error("O'chirishda xatolik");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-32 h-32 bg-surface rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-16 h-16 text-text-muted" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            Sevimlilar ro'yxati bo'sh
          </h1>
          <p className="text-text-secondary mb-8">
            Mahsulotlarni saqlash uchun ♥ belgisini bosing
          </p>
          <Button asChild size="lg">
            <Link to="/products">Katalogga o'tish</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
            Sevimlilar
          </h1>
          <p className="text-text-secondary mt-1">
            {items.length} ta mahsulot
          </p>
        </div>

        <Button
          variant="outline"
          leftIcon={<ShoppingBag className="w-5 h-5" />}
          onClick={handleAddAllToCart}
        >
          Hammasini savatga qo'shish
        </Button>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((product, index) => (
          <div key={product.id || index} className="relative group">
            <ProductCard
              product={product}
              variant="compact"
            />
            {/* Remove button */}
            <button
              onClick={() => product.id && handleRemove(product.id)}
              className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              title="O'chirish"
            >
              <X className="w-4 h-4 text-red-500" />
            </button>
          </div>
        ))}
      </div>

      {/* Continue shopping */}
      <div className="mt-12 text-center">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
        >
          Xaridni davom ettirish
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
