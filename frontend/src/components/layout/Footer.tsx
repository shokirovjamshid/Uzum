import { Link } from 'react-router-dom';
import {
  Smartphone,
  CreditCard,
  Truck,
  ShieldCheck,
  MessageCircle,
  Instagram,
  Facebook,
  Youtube,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const features = [
    {
      icon: Smartphone,
      title: "Qo'lidan kelgancha qulay",
      description: "Ilovamizni yuklab oling va chegirmalardan xabardor bo'ling",
    },
    {
      icon: CreditCard,
      title: "Tez va oson to'lov",
      description: "Karta orqali xavfsiz to'lov",
    },
    {
      icon: Truck,
      title: 'Tez yetkazib berish',
      description: "Butun O'zbekiston bo'ylab yetkazib berish",
    },
    {
      icon: ShieldCheck,
      title: 'Xavfsiz xarid',
      description: '14 kun ichida tovarni qaytarish imkoniyati',
    },
  ];

  const footerLinks = {
    about: [
      { label: 'Biz haqimizda', href: '/about' },
      { label: 'Kontaktlar', href: '/contacts' },
      { label: 'Vakansiyalar', href: '/careers' },
      { label: "Qo'llab-quvvatlash", href: '/help' },
    ],
    forBuyers: [
      { label: 'Yetkazib berish', href: '/delivery' },
      { label: "To'lov usullari", href: '/payment' },
      { label: 'Qaytarish siyosati', href: '/returns' },
      { label: "Ko'p so'raladigan savollar", href: '/faq' },
    ],
  };

    return (
        <footer className="bg-white border-t border-gray-100">
            {/* Features section */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature) => (
                        <div key={feature.title} className="flex items-start gap-4">
                            <div
                                className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                <feature.icon className="text-primary" size={24}/>
                            </div>
                            <div>
                                <h3 className="font-semibold text-text-primary mb-1">{feature.title}</h3>
                                <p className="text-sm text-text-secondary">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main footer content */}
            <div className="border-t border-gray-100">
                <div className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                        {/* Brand column */}
                        <div className="col-span-2 md:col-span-4 lg:col-span-1">
                            <Link to="/" className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">U</span>
                                </div>
                                <span className="text-2xl font-bold text-primary">uzum</span>
                            </Link>
                            <p className="text-sm text-text-secondary mb-4">
                                O'zbekistonning eng yirik marketplace platformasi.
                                Millionlab mahsulotlar, arzon narxlar, tez yetkazib berish.
                            </p>

                            {/* Social links */}
                            <div className="flex items-center gap-3">
                                <a
                                    href="https://instagram.com/uzum.market"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 bg-surface rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                                >
                                    <Instagram size={20}/>
                                </a>
                                <a
                                    href="https://facebook.com/uzum.market"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 bg-surface rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                                >
                                    <Facebook size={20}/>
                                </a>
                                <a
                                    href="https://youtube.com/uzum.market"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 bg-surface rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                                >
                                    <Youtube size={20}/>
                                </a>
                            </div>
                        </div>

                        {/* About links */}
                        <div>
                            <h4 className="font-semibold text-text-primary mb-4">Kompaniya</h4>
                            <ul className="space-y-2">
                                {footerLinks.about.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            to={link.href}
                                            className="text-sm text-text-secondary hover:text-primary transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* For buyers */}
                        <div>
                            <h4 className="font-semibold text-text-primary mb-4">Xaridorga</h4>
                            <ul className="space-y-2">
                                {footerLinks.forBuyers.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            to={link.href}
                                            className="text-sm text-text-secondary hover:text-primary transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h4 className="font-semibold text-text-primary mb-4">Aloqa</h4>
                            <ul className="space-y-3">
                                <li>
                                    <a
                                        href="tel:+998712000101"
                                        className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors"
                                    >
                                        <Phone size={16}/>
                                        <span>+998 71 200 01 01</span>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="mailto:support@uzum.uz"
                                        className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors"
                                    >
                                        <Mail size={16}/>
                                        <span>support@uzum.uz</span>
                                    </a>
                                </li>
                                <li>
                                    <span className="flex items-start gap-2 text-sm text-text-secondary">
                                        <MapPin size={16} className="shrink-0 mt-0.5"/>
                                        <span>Toshkent shahar, Chilonzor tumani</span>
                                    </span>
                                </li>
                            </ul>

                            <a
                                href="https://t.me/uzum_support"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 mt-4 text-primary hover:text-primary-dark transition-colors"
                            >
                                <MessageCircle size={18}/>
                                <span className="text-sm font-medium">Telegram orqali yozish</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-gray-100">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-text-muted">
                            {currentYear} Uzum Market. Barcha huquqlar himoyalangan.
                        </p>
                        <div className="flex items-center gap-4">
                            <Link to="/privacy" className="text-sm text-text-muted hover:text-primary">
                                Maxfiylik siyosati
                            </Link>
                            <Link to="/terms" className="text-sm text-text-muted hover:text-primary">
                                Foydalanish shartlari
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
