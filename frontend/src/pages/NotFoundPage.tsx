import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="max-w-md w-full text-center">
        {/* 404 illustration */}
        <div className="mb-8">
          <div className="relative">
            <div className="text-8xl md:text-9xl font-bold text-primary/10 select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
                <Search className="w-16 h-16 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Text content */}
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
          Sahifa topilmadi
        </h1>
        <p className="text-text-secondary mb-8">
          Kechirasiz, siz qidirayotgan sahifa o'chirilgan, 
          nomi o'zgartirilgan yoki vaqtinchalik mavjud emas.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" leftIcon={<Home className="w-5 h-5" />}>
            <Link to="/">Bosh sahifa</Link>
          </Button>
          <Button 
            asChild 
            variant="outline" 
            size="lg" 
            leftIcon={<ArrowLeft className="w-5 h-5" />}
          >
            <Link to="/products">Katalogga o'tish</Link>
          </Button>
        </div>

        {/* Help links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-text-muted mb-4">Yordam kerakmi?</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/help" className="text-primary hover:underline">
              Qo'llab-quvvatlash
            </Link>
            <Link to="/contacts" className="text-primary hover:underline">
              Biz bilan bog'lanish
            </Link>
            <a 
              href="mailto:support@uzum.uz" 
              className="text-primary hover:underline"
            >
              support@uzum.uz
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
