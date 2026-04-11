import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Package,
  Heart,
  MessageCircle,
  ChevronRight,
  Camera
} from 'lucide-react';
import { useAuthStore } from '@/stores';
import { useAuth } from '@/hooks';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn, formatPhone } from '@/utils/helpers';

export const ProfilePage = () => {
  const { user } = useAuthStore();
  const { updateProfile, isUpdatingProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const menuItems = [
    { icon: Package, label: 'Buyurtmalarim', to: '/orders', count: 0 },
    { icon: Heart, label: 'Sevimlilar', to: '/favorites', count: 0 },
    { icon: MessageCircle, label: 'Xabarlar', to: '/chats', count: 0 },
  ];

  const handleSave = async () => {
    if (!user) return;

    // Only send non-empty fields
    const updateData: { userId: number; first_name?: string; last_name?: string; email?: string } = {
      userId: user.id,
    };

    if (formData.first_name.trim()) {
      updateData.first_name = formData.first_name.trim();
    }
    if (formData.last_name.trim()) {
      updateData.last_name = formData.last_name.trim();
    }
    if (formData.email.trim()) {
      updateData.email = formData.email.trim();
    }

    await updateProfile(updateData);

    setIsEditing(false);
  };

  if (!user) {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile header */}
        <div className="bg-white rounded-2xl p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.first_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 md:w-16 md:h-16 text-primary" />
                )}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-dark transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-text-primary mb-1">
                {user.first_name || 'Foydalanuvchi'} {user.last_name}
              </h1>
              <p className="text-text-secondary mb-4">
                {formatPhone(user.phone)}
              </p>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium",
                  user.type === 'seller' ? "bg-green-100 text-green-700" : "bg-primary/10 text-primary"
                )}>
                  {user.type === 'seller' ? 'Sotuvchi' : user.type === 'admin' ? 'Admin' : 'Foydalanuvchi'}
                </span>
              </div>
            </div>

            {/* Edit button */}
            <Button
              variant="outline"
              leftIcon={<Edit2 className="w-4 h-4" />}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Bekor qilish' : 'Tahrirlash'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick menu */}
          <div className="md:col-span-1 space-y-3">
            {menuItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center justify-between bg-white rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium text-text-primary">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.count > 0 && (
                    <span className="w-6 h-6 bg-secondary text-white rounded-full text-xs flex items-center justify-center">
                      {item.count}
                    </span>
                  )}
                  <ChevronRight className="w-5 h-5 text-text-muted" />
                </div>
              </Link>
            ))}
          </div>

          {/* Profile details */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl p-6">
              <h2 className="text-xl font-bold text-text-primary mb-6">
                Shaxsiy ma'lumotlar
              </h2>

              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Ism"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    />
                    <Input
                      label="Familiya"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    />
                  </div>
                  <Input
                    label="Email"
                    type="email"
                    leftIcon={<Mail className="w-5 h-5" />}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  <Input
                    label="Telefon"
                    leftIcon={<Phone className="w-5 h-5" />}
                    value={formData.phone}
                    disabled
                    helperText="Telefon raqamni o'zgartirib bo'lmaydi"
                  />

                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleSave} isLoading={isUpdatingProfile}>Saqlash</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Bekor qilish
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 py-3 border-b border-gray-100">
                    <User className="w-5 h-5 text-text-muted" />
                    <div>
                      <p className="text-sm text-text-muted">Ism Familiya</p>
                      <p className="font-medium text-text-primary">
                        {user.first_name || '-'} {user.last_name || ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 py-3 border-b border-gray-100">
                    <Phone className="w-5 h-5 text-text-muted" />
                    <div>
                      <p className="text-sm text-text-muted">Telefon</p>
                      <p className="font-medium text-text-primary">
                        {formatPhone(user.phone)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 py-3 border-b border-gray-100">
                    <Mail className="w-5 h-5 text-text-muted" />
                    <div>
                      <p className="text-sm text-text-muted">Email</p>
                      <p className="font-medium text-text-primary">
                        {user.email || '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 py-3">
                    <MapPin className="w-5 h-5 text-text-muted" />
                    <div>
                      <p className="text-sm text-text-muted">Manzil</p>
                      <p className="font-medium text-text-primary">
                        Toshkent, O'zbekiston
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
