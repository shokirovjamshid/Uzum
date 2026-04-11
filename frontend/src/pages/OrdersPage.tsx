import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ChevronRight,
  Truck,
  MapPin
} from 'lucide-react';
import { useAuthStore } from '@/stores';
import { Button } from '@/components/ui/Button';
import { cn, formatDate } from '@/utils/helpers';
import type { Order } from '@/types';

// Mock orders for demonstration
const mockOrders: Order[] = [
  {
    id: 1,
    status: 'paid',
    delivery_type: 'delivery',
    created_at: '2024-01-15T10:30:00Z',
    order_items: [],
  },
  {
    id: 2,
    status: 'pending',
    delivery_type: 'delivery_point',
    created_at: '2024-01-14T15:20:00Z',
    order_items: [],
  },
];

const statusConfig = {
  pending: {
    label: 'Kutilmoqda',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  paid: {
    label: 'To\'langan',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  canceled: {
    label: 'Bekor qilingan',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
};

export const OrdersPage = () => {
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'paid'>('all');

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-4">
          Avval tizimga kiring
        </h1>
        <Button asChild>
          <Link to="/login">Kirish</Link>
        </Button>
      </div>
    );
  }

  const filteredOrders = mockOrders.filter((order) => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-8">
        Mening buyurtmalarim
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'Barchasi' },
          { key: 'pending', label: 'Kutilmoqda' },
          { key: 'paid', label: 'Yetkazilmoqda' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={cn(
              "px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors",
              activeTab === tab.key
                ? "bg-primary text-white"
                : "bg-white text-text-secondary hover:bg-surface"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl">
          <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-12 h-12 text-text-muted" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Hozircha buyurtmalar yo'q
          </h2>
          <p className="text-text-secondary mb-6">
            Mahsulotlar xarid qilishni boshlang
          </p>
          <Button asChild>
            <Link to="/products">Katalogga o'tish</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const status = statusConfig[order.status];
            const StatusIcon = status.icon;

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-text-primary">
                      Buyurtma #{order.id}
                    </span>
                    <span className="text-sm text-text-muted">
                      {formatDate(order.created_at)}
                    </span>
                  </div>
                  <div className={cn(
                    "flex items-center gap-2 px-3 py-1 rounded-full",
                    status.bgColor
                  )}>
                    <StatusIcon className={cn("w-4 h-4", status.color)} />
                    <span className={cn("text-sm font-medium", status.color)}>
                      {status.label}
                    </span>
                  </div>
                </div>

                {/* Delivery info */}
                <div className="flex items-center gap-2 text-text-secondary mb-4">
                  {order.delivery_type === 'delivery' ? (
                    <>
                      <Truck className="w-5 h-5" />
                      <span>Kuryer orqali yetkazib berish</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-5 h-5" />
                      <span>Olib ketish nuqtasi</span>
                    </>
                  )}
                </div>

                {/* Items preview */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-text-secondary">
                      {order.order_items.length} ta mahsulot
                    </span>
                  </div>
                  <Link
                    to={`/orders/${order.id}`}
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <span>Batafsil</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
