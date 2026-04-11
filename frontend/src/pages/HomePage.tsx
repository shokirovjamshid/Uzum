import {Link} from 'react-router-dom';
import {ChevronRight, Clock, Flame, Shield, Sparkles, Timer, Truck} from 'lucide-react';
import {useCategories, useProducts} from '@/hooks';
import {ProductGrid} from '@/components/product/ProductGrid';
import {Skeleton} from '@/components/ui/LoadingSpinner';
import {getImageUrl} from '@/utils/helpers';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Autoplay, Navigation, Pagination} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Hero banners - uzum.uz ga o'xshash
const heroBanners = [
    {
        id: 1,
        title: "Yozgi chegirmalar",
        subtitle: "50% gacha chegirma",
        bg: "from-violet-600 to-purple-700",
        image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800",
        link: "/products?discount=true"
    },
    {
        id: 2,
        title: "Elektronika",
        subtitle: "Yangi kelganlar",
        bg: "from-blue-600 to-cyan-600",
        image: "https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?w=800",
        link: "/products?category=elektronika"
    },
    {
        id: 3,
        title: "Uy-ro'zg'or buyumlari",
        subtitle: "Hammasi -30% gacha",
        bg: "from-orange-500 to-red-500",
        image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800",
        link: "/products?category=uy-rozg-or"
    }
];

export const HomePage = () => {
    const {data: categories, isLoading: categoriesLoading} = useCategories();
    const {data: products, isLoading: productsLoading} = useProducts({ordering: '-created_at'});

    // Flash sale products (chegirmali)
    const flashSaleProducts = products?.filter(p => p.discount_price && p.discount_price < (p.price || 0)).slice(0, 6) || [];

    return (
        <div className="min-h-screen bg-[#f2f4f7]">
            {/* Hero Banner Carousel - uzum.uz style */}
            <section className="bg-white">
                <div className="container mx-auto px-4 py-4">
                    <Swiper
                        modules={[Navigation, Pagination, Autoplay]}
                        spaceBetween={16}
                        slidesPerView={1}
                        navigation
                        pagination={{clickable: true}}
                        autoplay={{delay: 5000, disableOnInteraction: false}}
                        loop
                        className="rounded-2xl overflow-hidden"
                    >
                        {heroBanners.map((banner) => (
                            <SwiperSlide key={banner.id}>
                                <Link to={banner.link} className="block">
                                    <div className={`relative bg-gradient-to-r ${banner.bg} h-[280px] md:h-[360px] flex items-center`}>
                                        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
                                            <div className="text-white max-w-md">
                                                <h2 className="text-3xl md:text-5xl font-bold mb-3">
                                                    {banner.title}
                                                </h2>
                                                <p className="text-lg md:text-xl text-white/90 mb-6">
                                                    {banner.subtitle}
                                                </p>
                                                <span className="inline-flex items-center bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                                                    Xarid qilish
                                                    <ChevronRight className="w-5 h-5 ml-1"/>
                                                </span>
                                            </div>
                                            <div className="hidden md:block">
                                                <img
                                                    src={banner.image}
                                                    alt={banner.title}
                                                    className="h-[200px] w-[200px] object-cover rounded-2xl shadow-2xl"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </section>

            {/* Features bar */}
            <section className="bg-white border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                        <div className="flex items-center gap-2 text-text-secondary">
                            <Truck className="w-5 h-5 text-primary"/>
                            <span>Tez yetkazib berish</span>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary">
                            <Shield className="w-5 h-5 text-primary"/>
                            <span>Sifat kafolati</span>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary">
                            <Clock className="w-5 h-5 text-primary"/>
                            <span>14 kun ichida qaytarish</span>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary">
                            <Sparkles className="w-5 h-5 text-primary"/>
                            <span>1 000 000+ mahsulot</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories - uzum style */}
            <section className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-text-primary mb-6">Kategoriyalar</h2>

                    {categoriesLoading ? (
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                            {Array.from({length: 10}).map((_, i) => (
                                <Skeleton key={i} className="aspect-square rounded-xl"/>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                            {categories?.slice(0, 10).map((category) => (
                                <Link
                                    key={category.id}
                                    to={`/products?category=${category.slug}`}
                                    className="group text-center"
                                >
                                    <div className="aspect-square bg-surface rounded-xl overflow-hidden mb-2 group-hover:shadow-md transition-shadow">
                                        <img
                                            src={getImageUrl(category.image)}
                                            alt={category.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        />
                                    </div>
                                    <p className="text-xs text-text-primary group-hover:text-primary transition-colors line-clamp-2">
                                        {category.name}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Flash Sale - uzum style */}
            {flashSaleProducts.length > 0 && (
                <section className="container mx-auto px-4 py-4">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Flame className="w-8 h-8"/>
                                <h2 className="text-2xl font-bold">Flash Sale</h2>
                                <div className="hidden sm:flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg">
                                    <Timer className="w-4 h-4"/>
                                    <span className="text-sm">Chegirma 24 soat davom etadi</span>
                                </div>
                            </div>
                            <Link
                                to="/products?discount=true"
                                className="text-sm font-medium hover:underline"
                            >
                                Barchasini ko'rish →
                            </Link>
                        </div>
                        <ProductGrid
                            products={flashSaleProducts}
                            isLoading={false}
                            columns={6}
                        />
                    </div>
                </section>
            )}

            {/* Popular Products */}
            <section className="container mx-auto px-4 py-6">
                <div className="bg-white rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-text-primary">Mashhur mahsulotlar</h2>
                        <Link
                            to="/products"
                            className="text-primary font-medium hover:underline text-sm"
                        >
                            Barchasi →
                        </Link>
                    </div>
                    <ProductGrid
                        products={products?.slice(0, 10) || []}
                        isLoading={productsLoading}
                        columns={5}
                    />
                </div>
            </section>

            {/* New Arrivals */}
            <section className="container mx-auto px-4 py-6 pb-12">
                <div className="bg-white rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-text-primary">Yangi kelganlar</h2>
                        <Link
                            to="/products?ordering=-created_at"
                            className="text-primary font-medium hover:underline text-sm"
                        >
                            Barchasi →
                        </Link>
                    </div>
                    <ProductGrid
                        products={products?.slice(0, 10) || []}
                        isLoading={productsLoading}
                        columns={5}
                    />
                </div>
            </section>
        </div>
    );
};
