import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useCategories } from '@/hooks';
import { cn } from '@/utils/helpers';
import type { Category } from '@/types';

interface CategoryMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

// Build tree structure from flat categories
const buildTree = (categories: Category[]): Category[] => {
  const categoryMap = new Map<number, Category>();
  const roots: Category[] = [];

  categories.forEach(cat => {
    categoryMap.set(cat.id, { ...cat, children: [] });
  });

  categories.forEach(cat => {
    if (cat.children && cat.children.length > 0) {
      const parent = categoryMap.get(cat.id);
      if (parent) {
        parent.children = cat.children.map(child => categoryMap.get(child.id) || child).filter(Boolean);
      }
    }
  });

  categories.forEach(cat => {
    const hasParent = categories.some(c => c.children?.some(ch => ch.id === cat.id));
    if (!hasParent) {
      roots.push(categoryMap.get(cat.id)!);
    }
  });

  return roots.length > 0 ? roots : categories;
};

export const CategoryMenu = ({ isOpen, onClose }: CategoryMenuProps) => {
  const { data: categories, isLoading } = useCategories();
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  // Get all subcategories from all roots (2nd level as 1st level)
  const subCategories = useMemo(() => {
    if (!categories) return [];
    const tree = buildTree(categories);
    const allSubCategories: Category[] = [];
    tree.forEach(root => {
      if (root.children && root.children.length > 0) {
        allSubCategories.push(...root.children);
      }
    });
    return allSubCategories;
  }, [categories]);

  useEffect(() => {
    if (subCategories.length > 0 && !activeCategory) {
      setActiveCategory(subCategories[0]);
    }
  }, [subCategories, activeCategory]);

  const handleCategoryClick = (category: Category) => {
    setActiveCategory(category);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />
      
      {/* Menu - 2 column layout */}
      <div className="fixed top-[120px] left-1/2 -translate-x-1/2 w-full max-w-4xl bg-white rounded-xl shadow-2xl z-50 overflow-hidden flex border border-gray-100 min-h-[400px]">
        {isLoading ? (
          <div className="p-8 w-full text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"/>
            <p className="text-text-muted">Kategoriyalar yuklanmoqda...</p>
          </div>
        ) : (
          <>
            {/* Left: All subcategories (2nd level as main) */}
            <div className="w-64 bg-white border-r border-gray-100 py-4 overflow-y-auto max-h-[560px]">
              {subCategories.length > 0 ? (
                <div className="space-y-0.5">
                  {subCategories.map((sub) => (
                    <button
                      key={sub.id}
                      onMouseEnter={() => handleCategoryClick(sub)}
                      onClick={() => handleCategoryClick(sub)}
                      className={cn(
                        "w-full flex items-center gap-2 px-4 py-2.5 text-left transition-all text-sm",
                        activeCategory?.id === sub.id
                          ? "bg-gray-50 text-primary font-medium border-l-2 border-primary"
                          : "text-text-secondary hover:bg-gray-50 hover:text-primary"
                      )}
                    >
                      {sub.name}
                      {sub.children && sub.children.length > 0 && (
                        <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-text-muted">Kategoriyalar yo'q</p>
                </div>
              )}
            </div>
            
            {/* Right: Child categories */}
            <div className="flex-1 p-6 overflow-y-auto max-h-[560px] bg-gray-50">
              {activeCategory ? (
                <div>
                  <Link
                    to={`/products?category=${activeCategory.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-2 text-primary font-medium mb-4 hover:underline"
                  >
                    <span>Barcha {activeCategory.name}</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                  
                  {activeCategory.children && activeCategory.children.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                      {activeCategory.children.map((child) => (
                        <Link
                          key={child.id}
                          to={`/products?category=${child.slug}`}
                          onClick={onClose}
                          className="flex items-center gap-2 py-2 text-sm text-text-secondary hover:text-primary transition-colors group"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-text-muted group-hover:bg-primary transition-colors" />
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-12">
                      <p className="text-text-muted text-sm">
                        Bu kategoriyada qo'shimcha bo'limlar yo'q
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <ChevronRight className="w-8 h-8 text-text-muted" />
                  </div>
                  <p className="text-text-muted text-sm">
                    Kategoriyani tanlang
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};
