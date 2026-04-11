import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight,
  Truck,
  MapPin,
  CreditCard,
  Info,
  X
} from 'lucide-react';
import { useCartStore } from '@/stores';
import { Button } from '@/components/ui/Button';
import { cn, formatPrice, getImageUrl } from '@/utils/helpers';

export const CartPage = () => {
  const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore();
  const [selectedDelivery, setSelectedDelivery] = useState<'delivery' | 'pickup'>('delivery');
  const [showDeliveryInfo, setShowDeliveryInfo] = useState(false);

  const totalPrice = getTotalPrice();
  const deliveryCost = selectedDelivery === 'delivery' && totalPrice < 150000 ? 25000 : 0;
  const finalTotal = totalPrice + deliveryCost;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-32 h-32 bg-surface rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-16 h-16 text-text-muted" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            Savatingiz bo'sh
          </h1>
          <p className="text-text-secondary mb-8">
            Mahsulotlarni qo'shish uchun katalogga o'ting
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
      <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-8">
        Savat ({items.length} ta mahsulot)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div 
              key={item.id}
              className="bg-white rounded-xl p-4 flex gap-4"
            >
              {/* Image */}
              <Link to={item.product.slug ? `/products/${item.product.slug}` : '#'} className="shrink-0">
                <div className="w-24 h-24 bg-surface rounded-lg overflow-hidden">
                  <img
                    src={getImageUrl(item.product.image || item.product.images?.[0]?.image)}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link
                  to={item.product.slug ? `/products/${item.product.slug}` : '#'}
                  className="font-medium text-text-primary hover:text-primary line-clamp-2"
                >
                  {item.product.name}
                </Link>

                {/* Variant Attributes */}
                {item.selectedVariant && (
                  <div className="flex flex-wrap gap-2 mt-1 text-sm">
                    {item.selectedVariant.feature && Object.entries(item.selectedVariant.feature).map(([key, value]) => (
                      <span key={key} className="text-text-secondary">
                        {key}: <span className="text-text-primary">{value}</span>
                      </span>
                    ))}
                    {item.selectedVariant.attribute && Object.entries(item.selectedVariant.attribute).map(([key, value]) => (
                      <span key={key} className="text-text-secondary">
                        {key}: <span className="text-text-primary">{value}</span>
                      </span>
                    ))}
                    {item.selectedVariant.color && (
                      <span className="text-text-secondary">
                        Rang: <span className="text-text-primary">{item.selectedVariant.color.name}</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Shop name */}
                <p className="text-sm text-text-muted mt-1">
                  Sotuvchi: {item.product.shop?.name || 'Noma\'lum'}
                </p>

                <p className="text-lg font-bold text-primary mt-1">
                  {formatPrice((item.selectedVariant?.price || item.product.price || item.product.variants?.[0]?.price || 0) * item.quantity)}
                </p>
                <p className="text-sm text-text-muted">
                  {formatPrice(item.selectedVariant?.price || item.product.price || item.product.variants?.[0]?.price || 0)} / dona
                </p>

                {/* Quantity controls */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2 bg-surface rounded-lg">
                    <button
                      onClick={() => item.product.id && updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-l-lg transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => item.product.id && updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-r-lg transition-colors"
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

        {/* Order summary */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="bg-white rounded-xl p-6 space-y-6">
            {/* Delivery Method */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-medium text-text-primary">Yetkazib berish usuli</p>
                <button
                  onClick={() => setShowDeliveryInfo(true)}
                  className="text-primary hover:text-primary/80 transition-colors"
                  title="Yetkazib berish narxlari"
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>
              
              <button
                onClick={() => setSelectedDelivery('delivery')}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-colors text-left",
                  selectedDelivery === 'delivery' 
                    ? "border-primary bg-primary/5" 
                    : "border-gray-100 hover:border-gray-200"
                )}
              >
                <Truck className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <p className="font-medium text-text-primary">Kuryer orqali</p>
                  <p className="text-sm text-text-muted">
                    {deliveryCost === 0 ? 'Bepul' : formatPrice(25000)}
                  </p>
                </div>
              </button>

              <button
                onClick={() => setSelectedDelivery('pickup')}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-colors text-left",
                  selectedDelivery === 'pickup' 
                    ? "border-primary bg-primary/5" 
                    : "border-gray-100 hover:border-gray-200"
                )}
              >
                <MapPin className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <p className="font-medium text-text-primary">Topshirish punktiga</p>
                  <p className="text-sm text-text-muted">Bepul</p>
                </div>
              </button>
            </div>

            {/* Order Summary - Uzum Style */}
            <div className="space-y-4 pt-2">
              <h3 className="text-lg font-semibold text-text-primary">Buyurtmangiz</h3>
              
              {/* Products count */}
              <div className="flex justify-between items-baseline">
                <span className="text-text-secondary">{items.length} mahsulotlar</span>
                <span className="text-lg font-semibold text-text-primary">{formatPrice(finalTotal)}</span>
              </div>

              {/* Uzum Card Payment */}
              <div className="bg-purple-50 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-text-primary">Uzum kartasi bilan toʻlov amalga oshirilganda:</p>
                    <p className="text-xl font-bold text-primary mt-1">
                      {formatPrice(Math.round(finalTotal * 0.95))}
                    </p>
                  </div>
                </div>
                
                {/* Savings */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-text-secondary">Tejovingiz:</span>
                  <span className="font-semibold text-green-600">
                    {formatPrice(Math.round(finalTotal * 0.05))}
                  </span>
                </div>
              </div>

              {/* Other payment methods */}
              <div className="flex justify-between items-center py-2 border-t border-dashed border-gray-200">
                <span className="text-text-secondary">Boshqa yo'l bilan to'lash</span>
                <span className="font-semibold text-text-primary">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            {/* Checkout button */}
            <Button size="lg" fullWidth rightIcon={<ArrowRight className="w-5 h-5" />}>
              Rasmiylashtirishga oʻtish
            </Button>
          </div>
        </div>
      </div>

      {/* Delivery Info Popup */}
      {showDeliveryInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-text-primary">
                Yetkazib berish narxlari
              </h3>
              <button
                onClick={() => setShowDeliveryInfo(false)}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-text-secondary mb-4">
              Yetkazib berishning narxi buyurtmaning summasiga bog'liq
            </p>

            {/* Pickup Point Prices */}
            <div className="mb-4">
              <h4 className="font-semibold text-text-primary mb-2">Topshirish punktiga</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-text-secondary">20 000 so'mgacha</span>
                  <span className="font-medium text-text-primary">7 000 so'm</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-text-secondary">20 000 – 70 000 so'm</span>
                  <span className="font-medium text-text-primary">5 000 so'm</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-text-secondary">70 000 – 90 000 so'm</span>
                  <span className="font-medium text-text-primary">3 000 so'm</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-text-secondary">90 000 so'mdan boshlab</span>
                  <span className="font-medium text-primary">Bepul</span>
                </div>
              </div>
            </div>

            {/* Courier Prices */}
            <div>
              <h4 className="font-semibold text-text-primary mb-2">Kuryer orqali</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-text-secondary">1 000 000 so'mgacha</span>
                  <span className="font-medium text-text-primary">30 000 so'm</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-text-secondary">1 000 000 so'mdan boshlab</span>
                  <span className="font-medium text-primary">Bepul</span>
                </div>
              </div>
            </div>

            <Button
              fullWidth
              onClick={() => setShowDeliveryInfo(false)}
              className="mt-6"
            >
              Tushundim
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
