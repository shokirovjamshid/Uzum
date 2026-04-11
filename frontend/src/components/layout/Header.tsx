import {useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {
    ChevronDown,
    Clock,
    Heart,
    LogOut,
    MapPin,
    Menu,
    MessageCircle,
    Navigation,
    Package,
    Search,
    ShoppingCart,
    Store,
    Truck,
    User,
    X
} from 'lucide-react';
import {useAuthStore, useCartStore, useFavoritesStore} from '@/stores';
import {useAuth, useCities, useCategories} from '@/hooks';
import {cn, formatPhone} from '@/utils/helpers';
import {CategoryMenu} from '@/components/category/CategoryMenu';
import {useMemo} from 'react';

export const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [selectedCity, setSelectedCity] = useState<any>(null);
    const [showCityDropdown, setShowCityDropdown] = useState(false);

    const navigate = useNavigate();
    const {user, isAuthenticated} = useAuthStore();
    const {logout} = useAuth();
    const {data: categories, isLoading: categoriesLoading} = useCategories();
    const {items: cartItems} = useCartStore();
    const {items: favoriteItems} = useFavoritesStore();
    const {data: cities, isLoading: citiesLoading} = useCities();

    const cartItemsCount = cartItems.length;  // Unique products count, not total quantity
    const favoritesCount = favoriteItems.length;

    // Set default city when cities load
    useEffect(() => {
        if (cities && cities.length > 0 && !selectedCity) {
            const defaultCity = cities.find((c: any) => c.is_default) || cities[0];
            setSelectedCity(defaultCity);
        }
    }, [cities, selectedCity]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
            setIsSearchFocused(false);
        }
    };

    const handleLogout = () => {
        logout();
        setIsProfileOpen(false);
        navigate('/');
    };

    // Promo categories with images (like uzum.uz)
    const promoCategories = [
        { name: 'Hafta tovarlari', slug: 'promo-hafta', image: 'https://static.uzum.uz/baner/tovarnednew1612.png' },
        { name: 'Yozgi kolleksiya', slug: 'promo-yoz', image: 'https://static.uzum.uz/banners/feshn202.png' },
        { name: "Sizning go'zalligingiz", slug: 'promo-gozallik', image: 'https://static.uzum.uz/baner/krasotanew1812.png' },
        { name: 'Xobbi va ijod', slug: 'promo-xobbi', image: 'https://static.uzum.uz/baner/hobbi2110.png' },
        { name: 'Smartfonlari', slug: 'promo-smartfon', image: 'https://static.uzum.uz/baner/smart2010.png' },
        { name: 'Bahor yarmarkasi', slug: 'promo-bahor', image: 'https://static.uzum.uz/baner/bahor.png' },
    ];

    // Build tree structure from flat categories (like CategoryMenu)
    const buildTree = (cats: any[]): any[] => {
        const categoryMap = new Map<number, any>();
        const roots: any[] = [];

        cats.forEach(cat => {
            categoryMap.set(cat.id, { ...cat, children: [] });
        });

        cats.forEach(cat => {
            if (cat.children && cat.children.length > 0) {
                const parent = categoryMap.get(cat.id);
                if (parent) {
                    parent.children = cat.children.map((child: any) => categoryMap.get(child.id) || child).filter(Boolean);
                }
            }
        });

        cats.forEach(cat => {
            const hasParent = cats.some(c => c.children?.some((ch: any) => ch.id === cat.id));
            if (!hasParent) {
                roots.push(categoryMap.get(cat.id)!);
            }
        });

        return roots.length > 0 ? roots : cats;
    };

    // Get all subcategories from all roots (2nd level as 1st level)
    const subCategories = useMemo(() => {
        console.log('Categories from backend:', categories);
        if (!categories) return [];
        const tree = buildTree(categories);
        console.log('Tree after build:', tree);
        const allSubCategories: any[] = [];
        tree.forEach((root: any) => {
            if (root.children && root.children.length > 0) {
                allSubCategories.push(...root.children);
            }
        });
        console.log('Sub categories:', allSubCategories);
        return allSubCategories;
    }, [categories]);


    return (
        <header className="sticky top-0 z-50 bg-white shadow-sm">
            {/* Top bar - uzum.uz style */}
            <div className="bg-primary text-white py-2.5">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    {/* Left - Delivery Point Selector */}
                    <div className="flex items-center gap-4 relative">
                        <button
                            onClick={() => setShowCityDropdown(!showCityDropdown)}
                            className="flex items-center gap-2 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors group"
                        >
                            <MapPin size={16} className="shrink-0"/>
                            <span className="text-sm font-medium">
                {citiesLoading ? 'Yuklanmoqda...' : (selectedCity?.name || 'Toshkent')}
              </span>
                            <ChevronDown size={14}
                                         className={`text-white/70 group-hover:text-white transition-transform ${showCityDropdown ? 'rotate-180' : ''}`}/>
                        </button>

                        {/* City Dropdown */}
                        {showCityDropdown && cities && cities.length > 0 && (
                            <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl z-50 py-2">
                                {cities.map((city: any) => (
                                    <button
                                        key={city.id}
                                        onClick={() => {
                                            setSelectedCity(city);
                                            setShowCityDropdown(false);
                                        }}
                                        className={cn(
                                            "w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors",
                                            selectedCity?.id === city.id ? "text-primary font-medium" : "text-text-primary"
                                        )}
                                    >
                                        {city.name}
                                        {city.is_default &&
                                            <span className="text-xs text-text-muted ml-2">(Asosiy)</span>}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div
                            className="hidden md:flex items-center gap-1 text-xs text-white/90 bg-white/10 px-3 py-1.5 rounded-lg">
                            <Truck size={12}/>
                            <span>Tez yetkazib berish</span>
                        </div>
                    </div>

                    {/* Right - Contact & Help */}
                    <div className="flex items-center gap-1">
                        <a
                            href="tel:+998712000101"
                            className="flex items-center gap-1.5 text-sm hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            <Store size={14}/>
                            <span>Do'konlar</span>
                        </a>
                        <span className="hidden sm:block text-white/30 mx-1">|</span>
                        <Link
                            to="/help"
                            className="hidden sm:flex items-center gap-1.5 text-sm hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            <Clock size={14}/>
                            <span>24/7 Yordam</span>
                        </Link>
                        <span className="hidden sm:block text-white/30 mx-1">|</span>
                        <a
                            href="tel:+998712000101"
                            className="flex items-center gap-1.5 text-sm font-medium hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            <Navigation size={14}/>
                            <span>+998 71 200 01 01</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* Main header */}
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center gap-4">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 shrink-0">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">U</span>
                        </div>
                        <span className="text-2xl font-bold text-primary hidden sm:block">
              uzum
            </span>
                    </Link>

                    {/* Catalog button */}
                    <button
                        onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                        className="hidden lg:flex items-center gap-2 bg-primary text-white px-4 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
                    >
                        <Menu size={20}/>
                        <span>Katalog</span>
                    </button>

                    {/* Category Menu Dropdown */}
                    <CategoryMenu
                        isOpen={isCategoryMenuOpen}
                        onClose={() => setIsCategoryMenuOpen(false)}
                    />

                    {/* Search - uzum style */}
                    <form onSubmit={handleSearch} className="flex-1 relative max-w-2xl">
                        <div className={cn(
                            "relative flex items-center bg-[#f2f4f7] rounded-xl transition-all duration-200",
                            isSearchFocused && "bg-white ring-2 ring-primary"
                        )}>
                            <Search className="absolute left-4 text-text-muted" size={20}/>
                            <input
                                type="text"
                                placeholder="Mahsulotlar qidirish..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                                className="w-full bg-transparent py-3.5 pl-12 pr-4 text-text-primary placeholder:text-text-muted focus:outline-none text-sm"
                            />
                        </div>
                    </form>

                    {/* Actions */}
                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                        {/* Cart */}
                        <Link
                            to="/cart"
                            className="relative flex flex-col items-center gap-1 p-2 hover:bg-surface rounded-lg transition-colors"
                        >
                            <div className="relative">
                                <ShoppingCart size={24} className="text-text-primary"/>
                                {cartItemsCount > 0 && (
                                    <span
                                        className="absolute -top-2 -right-2 bg-secondary text-white text-xs font-medium w-5 h-5 rounded-full flex items-center justify-center">
                    {cartItemsCount > 99 ? '99+' : cartItemsCount}
                  </span>
                                )}
                            </div>
                            <span className="text-xs text-text-secondary hidden sm:block">Savat</span>
                        </Link>

                        {/* Favorites */}
                        <Link
                            to="/favorites"
                            className="flex flex-col items-center gap-1 p-2 hover:bg-surface rounded-lg transition-colors relative"
                        >
                            <div className="relative">
                                <Heart size={24} className="text-text-primary"/>
                                {favoritesCount > 0 && (
                                    <span
                                        className="absolute -top-2 -right-2 bg-secondary text-white text-xs font-medium w-5 h-5 rounded-full flex items-center justify-center">
                    {favoritesCount > 99 ? '99+' : favoritesCount}
                  </span>
                                )}
                            </div>
                            <span className="text-xs text-text-secondary hidden sm:block">Sevimlilar</span>
                        </Link>

                        {/* Auth / Profile */}
                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 p-2 hover:bg-surface rounded-lg transition-colors"
                                >
                                    <div
                                        className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                        <User size={18} className="text-primary"/>
                                    </div>
                                    <span className="hidden md:block text-sm font-medium text-text-primary">
                    {user?.first_name || 'Foydalanuvchi'}
                  </span>
                                    <ChevronDown size={16} className="text-text-muted"/>
                                </button>

                                {/* Profile dropdown */}
                                {isProfileOpen && (
                                    <div
                                        className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-fade-in">
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="font-medium text-text-primary">{user?.first_name || 'Foydalanuvchi'}</p>
                                            <p className="text-sm text-text-muted">{formatPhone(user?.phone || '')}</p>
                                        </div>

                                        <Link
                                            to="/profile"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface transition-colors"
                                        >
                                            <User size={18} className="text-text-secondary"/>
                                            <span className="text-sm">Profil</span>
                                        </Link>

                                        <Link
                                            to="/orders"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface transition-colors"
                                        >
                                            <Package size={18} className="text-text-secondary"/>
                                            <span className="text-sm">Buyurtmalarim</span>
                                        </Link>

                                        <Link
                                            to="/chats"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface transition-colors"
                                        >
                                            <MessageCircle size={18} className="text-text-secondary"/>
                                            <span className="text-sm">Xabarlar</span>
                                        </Link>

                                        <div className="border-t border-gray-100 mt-2 pt-2">
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-3 px-4 py-2.5 w-full text-left hover:bg-surface transition-colors text-secondary"
                                            >
                                                <LogOut size={18}/>
                                                <span className="text-sm">Chiqish</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors"
                            >
                                <User size={20}/>
                                <span className="hidden sm:block">Kirish</span>
                            </Link>
                        )}

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden p-2 hover:bg-surface rounded-lg transition-colors"
                        >
                            {isMenuOpen ? <X size={24}/> : <Menu size={24}/>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation bar - uzum.uz style */}
            <nav className="hidden lg:block border-t border-gray-100">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-4 py-3 overflow-x-auto">
                        {/* Promo categories with images */}
                        {promoCategories.map((cat) => (
                            <Link
                                key={cat.slug}
                                to={`/products?category=${cat.slug}`}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface transition-colors shrink-0"
                            >
                                <img src={cat.image} alt={cat.name} className="w-8 h-8 rounded object-cover"/>
                                <span className="text-sm font-medium text-text-primary whitespace-nowrap">{cat.name}</span>
                            </Link>
                        ))}

                        {/* Divider */}
                        <div className="w-px h-8 bg-gray-200 mx-2"></div>

                        {/* Sub categories from backend (2nd level like CategoryMenu) */}
                        {!categoriesLoading && subCategories?.slice(0, showAllCategories ? undefined : 8).map((category: any) => (
                            <Link
                                key={category.id}
                                to={`/products?category=${category.slug}`}
                                className="text-sm font-medium text-text-primary hover:text-primary whitespace-nowrap transition-colors shrink-0"
                            >
                                {category.name}
                            </Link>
                        ))}

                        {/* Yana button - show if there are more categories */}
                        {!categoriesLoading && subCategories && subCategories.length > 8 && (
                            <button 
                                onClick={() => setShowAllCategories(!showAllCategories)}
                                className="flex items-center gap-1 text-sm font-medium text-text-primary hover:text-primary whitespace-nowrap shrink-0"
                            >
                                {showAllCategories ? 'Kamroq' : 'Yana'}
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={`transition-transform ${showAllCategories ? 'rotate-180' : ''}`}>
                                    <path d="M12 16C12.3107 15.9911 12.5948 15.8748 12.8257 15.6243L18.4481 9.8071C18.6435 9.61029 18.75 9.3598 18.75 9.06458C18.75 8.47414 18.2883 8 17.7024 8C17.4183 8 17.143 8.1163 16.9388 8.32206L12.0089 13.4504L7.06116 8.32206C6.85696 8.12524 6.59061 8 6.29763 8C5.71167 8 5.25 8.47414 5.25 9.06458C5.25 9.3598 5.35654 9.61029 5.55186 9.8071L11.1832 15.6243C11.4229 15.8748 11.6893 16 12 16Z"/>
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Mobile menu overlay */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            {/* Mobile menu sidebar */}
            <div className={cn(
                "fixed top-0 left-0 h-full w-80 bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden",
                isMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">U</span>
                        </div>
                        <span className="text-xl font-bold text-primary">uzum</span>
                    </Link>
                    <button onClick={() => setIsMenuOpen(false)}>
                        <X size={24}/>
                    </button>
                </div>

                <nav className="p-4">
                    <div className="space-y-1">
                        {/* Mobile nav links - Favorites and Orders */}
                        <Link
                            to="/favorites"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-surface transition-colors"
                        >
                            <span className="font-medium">Sevimlilar</span>
                        </Link>
                        <Link
                            to="/orders"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-surface transition-colors"
                        >
                            <span className="font-medium">Buyurtmalar</span>
                        </Link>
                    </div>

                    {!isAuthenticated && (
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <Link
                                to="/login"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center justify-center gap-2 bg-primary text-white px-4 py-3 rounded-lg font-medium"
                            >
                                <User size={20}/>
                                <span>Kirish</span>
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
};
