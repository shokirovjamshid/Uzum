import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, Grid3X3, LayoutList, SlidersHorizontal } from 'lucide-react';
import { useProducts, useCategories } from '@/hooks';
import { useFavoritesStore } from '@/stores';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/helpers';

export const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { fetchFavorites } = useFavoritesStore();
  
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const ordering = searchParams.get('ordering') || '-created_at';
  
  const { data: products, isLoading } = useProducts({ 
    category, 
    search,
    ordering 
  });
  const { data: categories } = useCategories();

  // Fetch favorites when page mounts
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchFavorites();
    }
  }, [fetchFavorites]);

  const sortOptions = [
    { value: '-created_at', label: 'Yangi kelganlar' },
    { value: 'price', label: 'Narxi: arzondan qimmatga' },
    { value: '-price', label: 'Narxi: qimmatdan arzonga' },
    { value: '-rating', label: 'Eng mashhurlar' },
  ];

  const handleSortChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('ordering', value);
    setSearchParams(newParams);
  };

  const handleCategoryChange = (slug: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (slug) {
      newParams.set('category', slug);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb and title */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
          {search ? `"${search}" bo'yicha qidiruv natijalari` : 
           category ? categories?.find(c => c.slug === category)?.name || 'Katalog' : 
           'Barcha mahsulotlar'}
        </h1>
        <p className="text-text-secondary mt-2">
          {products?.length || 0} ta mahsulot topildi
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className={cn(
          "lg:w-64 shrink-0",
          isFilterOpen ? "block" : "hidden lg:block"
        )}>
          <div className="bg-white rounded-xl p-4 space-y-6">
            {/* Categories */}
            <div>
              <h3 className="font-semibold text-text-primary mb-3">Kategoriyalar</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleCategoryChange('')}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                    !category ? "bg-primary/10 text-primary font-medium" : "hover:bg-surface"
                  )}
                >
                  Barcha kategoriyalar
                </button>
                {categories?.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.slug)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                      category === cat.slug ? "bg-primary/10 text-primary font-medium" : "hover:bg-surface"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price range - simplified */}
            <div>
              <h3 className="font-semibold text-text-primary mb-3">Narx</h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="dan"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                />
                <span className="text-text-muted">-</span>
                <input
                  type="number"
                  placeholder="gacha"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Rating filter */}
            <div>
              <h3 className="font-semibold text-text-primary mb-3">Reyting</h3>
              <div className="space-y-2">
                {[4, 3, 2, 1].map((rating) => (
                  <label key={rating} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-primary focus:ring-primary" />
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className={cn(
                            "w-4 h-4",
                            i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                          )}
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                      <span className="text-sm text-text-secondary ml-1">va yuqori</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="bg-white rounded-xl p-4 mb-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="lg:hidden"
                leftIcon={<SlidersHorizontal className="w-4 h-4" />}
              >
                Filtrlar
              </Button>
              
              {/* Sort dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 bg-surface rounded-lg text-sm font-medium hover:bg-surface-dark transition-colors">
                  {sortOptions.find(o => o.value === ordering)?.label || 'Saralash'}
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 hidden group-hover:block z-10">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={cn(
                        "w-full text-left px-4 py-2 text-sm transition-colors",
                        ordering === option.value ? "bg-primary/10 text-primary" : "hover:bg-surface"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  viewMode === 'grid' ? "bg-primary text-white" : "bg-surface hover:bg-surface-dark"
                )}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  viewMode === 'list' ? "bg-primary text-white" : "bg-surface hover:bg-surface-dark"
                )}
              >
                <LayoutList className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Products */}
          <ProductGrid 
            products={products || []}
            isLoading={isLoading}
            columns={viewMode === 'grid' ? 4 : 2}
          />
        </div>
      </div>
    </div>
  );
};
