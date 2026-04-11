import {useState} from 'react';
import {Link} from 'react-router-dom';
import {Heart, Loader2, ShoppingCart, Star, Minus, Plus, Trash2} from 'lucide-react';
import {useCartStore, useFavoritesStore} from '@/stores';
import {cn, formatPrice, getImageUrl, truncateText} from '@/utils/helpers';
import type {Product} from '@/types';

interface ProductCardProps {
    product: Product;
    variant?: 'default' | 'compact' | 'horizontal';
    className?: string;
}

export const ProductCard = ({
                                product,
                                variant = 'default',
                                className
                            }: ProductCardProps) => {
    const {items, toggleFavorite} = useFavoritesStore();
    const {items: cartItems, addItem, updateQuantity, removeItem} = useCartStore();
    const [isToggling, setIsToggling] = useState(false);

    // Check if product is favorite
    const favorite = product.is_favorite || items.some(item => String(item.id) === String(product.id));

    // Check if product is in cart and get quantity
    const cartItem = cartItems.find(item => item.product.id === product.id);
    const cartQuantity = cartItem?.quantity || 0;
    const isInCart = cartQuantity > 0;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (product.id) {
            const firstVariant = product.variants?.[0];
            addItem(product, 1, firstVariant);
        }
    };

    const handleUpdateQuantity = (e: React.MouseEvent, newQty: number) => {
        e.preventDefault();
        e.stopPropagation();
        if (!product.id) return;
        if (newQty <= 0) {
            removeItem(product.id);
        } else {
            updateQuantity(product.id, newQty);
        }
    };

    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (product.id && !isToggling) {
            setIsToggling(true);
            try {
                await toggleFavorite(product);
            } finally {
                setIsToggling(false);
            }
        }
    };

    if (variant === 'horizontal') {
        return (
            <div className={cn(
                "flex gap-4 bg-white rounded-xl p-4 hover:shadow-lg transition-shadow",
                className
            )}>
                <Link to={product.slug ? `/products/${product.slug}` : '#'} className="shrink-0">
                    <div className="w-32 h-32 bg-surface rounded-lg overflow-hidden">
                        <img
                            src={getImageUrl(product.image || product.images?.[0]?.image)}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    </div>
                </Link>

                <div className="flex-1 min-w-0">
                    <Link to={product.slug ? `/products/${product.slug}` : '#'}>
                        <h3 className="font-medium text-text-primary hover:text-primary transition-colors line-clamp-2">
                            {product.name}
                        </h3>
                    </Link>

                    {product.rating > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400"/>
                            <span className="text-sm text-text-secondary">{product.rating.toFixed(1)}</span>
                            <span className="text-sm text-text-muted">({product.comments_count} izoh)</span>
                        </div>
                    )}

                    <div className="flex items-end justify-between mt-3">
                        <div>
                            <p className="text-lg font-bold text-primary">
                                {formatPrice(product.price || product.variants?.[0]?.price || 0)}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleToggleFavorite}
                                disabled={isToggling}
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                                    favorite ? "bg-secondary/10 text-secondary" : "bg-surface text-text-muted hover:text-secondary",
                                    isToggling && "opacity-70 cursor-not-allowed"
                                )}
                                title={favorite ? "Sevimlilardan olib tashlash" : "Sevimlilarga qo'shish"}
                            >
                                {isToggling ? (
                                    <Loader2 className="w-5 h-5 animate-spin"/>
                                ) : (
                                    <Heart className={cn("w-5 h-5", favorite && "fill-current")}/>
                                )}
                            </button>

                            <button
                                onClick={handleAddToCart}
                                className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-colors"
                            >
                                <ShoppingCart className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (variant === 'compact') {
        return (
            <Link
                to={product.slug ? `/products/${product.slug}` : '#'}
                className={cn(
                    "block bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow product-card",
                    className
                )}
            >
                <div className="aspect-square bg-surface relative overflow-hidden">
                    <img
                        src={getImageUrl(product.image || product.images?.[0]?.image)}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                    />

                    <button
                        onClick={handleToggleFavorite}
                        disabled={isToggling}
                        className={cn(
                            "absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm",
                            favorite ? "bg-secondary/90 text-white" : "bg-white/90 text-text-muted hover:text-secondary"
                        )}
                        title={favorite ? "Sevimlilardan olib tashlash" : "Sevimlilarga qo'shish"}
                    >
                        {isToggling ? (
                            <Loader2 className="w-4 h-4 animate-spin"/>
                        ) : (
                            <Heart className={cn("w-4 h-4", favorite && "fill-current")}/>
                        )}
                    </button>

                </div>

                <div className="p-3">
                    <h3 className="font-medium text-text-primary text-sm line-clamp-2 min-h-[2.5rem]">
                        {product.name}
                    </h3>

                    <p className="text-base font-bold text-primary mt-2">
                        {formatPrice(product.price || product.variants?.[0]?.price || 0)}
                    </p>

                    {/* Cart button - full width like product detail page */}
                    {!isInCart ? (
                        <button
                            onClick={handleAddToCart}
                            className="w-full mt-2 py-2 rounded-lg bg-primary text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors"
                        >
                            <ShoppingCart className="w-4 h-4"/>
                            Savatga qo'shish
                        </button>
                    ) : (
                        <div className="mt-2 flex items-center justify-between bg-surface rounded-lg p-1">
                            <button
                                onClick={(e) => handleUpdateQuantity(e, cartQuantity - 1)}
                                className="w-7 h-7 flex items-center justify-center rounded-md bg-white hover:bg-gray-100 transition-colors"
                            >
                                {cartQuantity === 1 ? (
                                    <Trash2 className="w-3 h-3 text-secondary"/>
                                ) : (
                                    <Minus className="w-3 h-3"/>
                                )}
                            </button>
                            <span className="font-medium text-sm">{cartQuantity}</span>
                            <button
                                onClick={(e) => handleUpdateQuantity(e, cartQuantity + 1)}
                                className="w-7 h-7 flex items-center justify-center rounded-md bg-white hover:bg-gray-100 transition-colors"
                            >
                                <Plus className="w-3 h-3"/>
                            </button>
                        </div>
                    )}
                </div>
            </Link>
        );
    }

    // Default variant
    const mainPrice = product.price || product.variants?.[0]?.price || 0;
    const discountPrice = product.discount_price;
    const hasDiscount = discountPrice && discountPrice < mainPrice;
    const discountPercent = hasDiscount ? Math.round((1 - discountPrice / mainPrice) * 100) : 0;

    // Get variant features for display (RAM, Storage, Color, etc.)
    const getVariantFeatures = () => {
        if (!product.variants || product.variants.length === 0) return [];
        const firstVariant = product.variants[0];
        const features: string[] = [];
        if (firstVariant.feature) {
            Object.entries(firstVariant.feature).forEach(([key, value]) => {
                features.push(`${key}: ${value}`);
            });
        }
        if (firstVariant.color) {
            features.push(`Rang: ${firstVariant.color.name}`);
        }
        return features.slice(0, 2); // Show max 2 features
    };

    const variantFeatures = getVariantFeatures();

    return (
        <div className={cn(
            "block bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow product-card group",
            className
        )}>
            {/* Image Link with favorite button */}
            <div className="relative">
                <Link to={product.slug ? `/products/${product.slug}` : '#'} className="block">
                    <div className="aspect-square bg-surface relative overflow-hidden">
                        <img
                            src={getImageUrl(product.image || product.images?.[0]?.image)}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                        />

                        {/* Discount badge */}
                        {hasDiscount && (
                            <div
                                className="absolute top-3 left-3 bg-secondary text-white text-xs font-bold px-2 py-1 rounded-lg">
                                -{discountPercent}%
                            </div>
                        )}
                    </div>
                </Link>

                {/* Favorite button - on image */}
                <button
                    onClick={handleToggleFavorite}
                    disabled={isToggling}
                    className={cn(
                        "absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm z-10",
                        favorite ? "bg-secondary/90 text-white" : "bg-white/90 text-text-muted hover:text-secondary"
                    )}
                    title={favorite ? "Sevimlilardan olib tashlash" : "Sevimlilarga qo'shish"}
                >
                    {isToggling ? (
                        <Loader2 className="w-4 h-4 animate-spin"/>
                    ) : (
                        <Heart className={cn("w-4 h-4", favorite && "fill-current")}/>
                    )}
                </button>
            </div>

            <div className="p-3">

                {/* Shop name */}
                {product.shop && (
                    <p className="text-xs text-text-muted mb-1 truncate">{product.shop.name}</p>
                )}

                {/* Name Link */}
                <Link to={product.slug ? `/products/${product.slug}` : '#'}>
                    <h3 className="text-sm text-text-primary line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors pr-10">
                        {truncateText(product.name, 50)}
                    </h3>
                </Link>

                {/* Variant Features (RAM, Storage, etc.) */}
                {variantFeatures.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                        {variantFeatures.map((feature, idx) => (
                            <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-surface rounded text-text-muted">
                                {feature}
                            </span>
                        ))}
                    </div>
                )}

                {/* Rating */}
                {product.rating > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400"/>
                        <span className="text-xs font-medium text-text-primary">{product.rating.toFixed(1)}</span>
                        <span className="text-xs text-text-muted">({product.comments_count} sharh)</span>
                    </div>
                )}

                {/* Price */}
                <div className="mt-2">
                    {hasDiscount ? (
                        <div className="flex items-center gap-2">
                            <p className="text-base font-bold text-secondary">
                                {formatPrice(discountPrice)}
                            </p>
                            <p className="text-xs text-text-muted line-through">
                                {formatPrice(mainPrice)}
                            </p>
                        </div>
                    ) : (
                        <p className="text-base font-bold text-text-primary">
                            {formatPrice(mainPrice)}
                        </p>
                    )}
                </div>

                {/* Monthly payment */}
                {mainPrice / 12 > 0 && (
                    <p className="text-xs text-text-muted mt-1">
                        dan {formatPrice(Math.round(hasDiscount ? discountPrice / 12 : mainPrice / 12))}/oy
                    </p>
                )}

                {/* Cart controls - quantity or add button */}
                {isInCart ? (
                    <div className="w-full mt-2 flex items-center justify-between bg-surface rounded-lg p-1">
                        <button
                            onClick={(e) => handleUpdateQuantity(e, cartQuantity - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-md bg-white hover:bg-gray-100 transition-colors"
                        >
                            {cartQuantity === 1 ? (
                                <Trash2 className="w-4 h-4 text-secondary"/>
                            ) : (
                                <Minus className="w-4 h-4"/>
                            )}
                        </button>
                        <span className="font-medium text-sm">{cartQuantity}</span>
                        <button
                            onClick={(e) => handleUpdateQuantity(e, cartQuantity + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-md bg-white hover:bg-gray-100 transition-colors"
                        >
                            <Plus className="w-4 h-4"/>
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleAddToCart}
                        className={cn(
                            "w-full mt-2 py-2 rounded-lg bg-primary text-white text-sm font-medium",
                            "flex items-center justify-center gap-2",
                            "hover:bg-primary-dark transition-colors"
                        )}
                    >
                        <ShoppingCart className="w-4 h-4"/>
                        Savatga qo'shish
                    </button>
                )}
            </div>
        </div>
    );
};
