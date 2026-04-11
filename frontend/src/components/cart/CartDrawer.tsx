import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '@/stores';
import { cn, formatPrice, getImageUrl } from '@/utils/helpers';

export const CartDrawer = () => {
  const { 
    items, 
    isOpen, 
    closeCart, 
    updateQuantity, 
    removeItem, 
    getTotalPrice 
  } = useCartStore();

  return (
    <>
      {/* Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 z-50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={closeCart}
      />
      
      {/* Drawer */}
      <div className={cn(
        "fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 transform transition-transform duration-300 shadow-2xl",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-text-primary">Savat</h2>
            <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              {items.length} ta
            </span>
          </div>
          <button 
            onClick={closeCart}
            className="w-10 h-10 rounded-full hover:bg-surface flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex flex-col h-[calc(100%-180px)]">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-12 h-12 text-text-muted" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Savatingiz bo\'sh
              </h3>
              <p className="text-text-secondary text-center mb-6">
                Mahsulotlarni qo\'shish uchun katalogga o\'ting
              </p>
              <Link 
                to="/products"
                onClick={closeCart}
                className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
              >
                Katalogga o\'tish
              </Link>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.map((item) => (
                <div 
                  key={item.id}
                  className="flex gap-4 bg-surface rounded-xl p-3"
                >
                  {/* Image */}
                  <div className="w-20 h-20 bg-white rounded-lg overflow-hidden shrink-0">
                    <img
                      src={getImageUrl(item.product.image || item.product.images?.[0]?.image)}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={item.product.slug ? `/products/${item.product.slug}` : '#'}
                      onClick={closeCart}
                      className="font-medium text-text-primary hover:text-primary line-clamp-2 text-sm"
                    >
                      {item.product.name}
                    </Link>

                    {/* Variant Attributes */}
                    {item.selectedVariant && (
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs">
                        {item.selectedVariant.feature && Object.entries(item.selectedVariant.feature).slice(0, 2).map(([key, value]) => (
                          <span key={key} className="text-text-muted">
                            {key}: <span className="text-text-secondary">{value}</span>
                          </span>
                        ))}
                        {item.selectedVariant.attribute && Object.entries(item.selectedVariant.attribute).slice(0, 2).map(([key, value]) => (
                          <span key={key} className="text-text-muted">
                            {key}: <span className="text-text-secondary">{value}</span>
                          </span>
                        ))}
                        {item.selectedVariant.color && (
                          <span className="text-text-muted">
                            Rang: <span className="text-text-secondary">{item.selectedVariant.color.name}</span>
                          </span>
                        )}
                      </div>
                    )}

                    <p className="text-lg font-bold text-primary mt-1">
                      {formatPrice(item.selectedVariant?.price || item.product.price || item.product.variants?.[0]?.price || 0)}
                    </p>
                    
                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 bg-white rounded-lg">
                        <button
                          onClick={() => item.product.id && updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-surface rounded-l-lg transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => item.product.id && updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-surface rounded-r-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => item.product.id && removeItem(item.product.id)}
                        className="text-text-muted hover:text-secondary transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        {items.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-text-secondary">Jami:</span>
              <span className="text-2xl font-bold text-primary">
                {formatPrice(getTotalPrice())}
              </span>
            </div>
            
            <Link 
              to="/cart"
              onClick={closeCart}
              className="flex items-center justify-center gap-2 w-full bg-primary text-white py-3.5 rounded-xl font-medium hover:bg-primary-dark transition-colors"
            >
              <span>Buyurtma berish</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </>
  );
};
