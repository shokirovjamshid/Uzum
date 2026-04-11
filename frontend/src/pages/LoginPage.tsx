import {useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {ArrowLeft, QrCode, Shield, Smartphone} from 'lucide-react';
import {QRCodeSVG} from 'qrcode.react';
import {Button} from '@/components/ui/Button';
import {Input} from '@/components/ui/Input';
import {useAuth} from '@/hooks';
import {formatPhone} from '@/utils/helpers';

export const LoginPage = () => {
    const navigate = useNavigate();
    const {login, requestCode, countdown, isLoading, isAuthenticated} = useAuth();

    const [step, setStep] = useState<'phone' | 'code' | 'qr'>('phone');
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [qrToken] = useState('');

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    // Handle phone submission
    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const userDigits = phone.replace(/\D/g, '');
        if (userDigits.length !== 9) {
            return;
        }

        // Backend expects 9 digits without 998 prefix (e.g., 931607666)
        const cleanPhone = userDigits;

        try {
            await requestCode(cleanPhone);
            setStep('code');
        } catch (error: any) {
            // If 429 (Too Many Requests), code was already sent - proceed to code step
            if (error?.response?.status === 429) {
                setStep('code');
            }
            // Other errors handled in hook
        }
    };

    // Handle code submission
    const handleCodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const userDigits = phone.replace(/\D/g, '');
        // Backend expects 9 digits without 998 prefix
        const cleanPhone = userDigits;

        try {
            await login(cleanPhone, code);
            navigate('/');
        } catch (error) {
            // Error handled in hook
        }
    };

    // Format phone input - user types after +998 prefix
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');

        // Remove the 998 prefix if user somehow included it
        if (value.startsWith('998')) {
            value = value.slice(3);
        }

        // Limit to 9 digits
        if (value.length > 9) {
            value = value.slice(0, 9);
        }

        // Format with spaces: XX XXX XX XX
        let formatted = '';
        if (value.length > 0) formatted = value.slice(0, 2);
        if (value.length > 2) formatted += ' ' + value.slice(2, 5);
        if (value.length > 5) formatted += ' ' + value.slice(5, 7);
        if (value.length > 7) formatted += ' ' + value.slice(7, 9);

        setPhone(formatted);
    };

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-primary/5 to-purple-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Back to home */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-text-secondary hover:text-primary mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4"/>
                    <span>Bosh sahifaga</span>
                </Link>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-white font-bold text-2xl">U</span>
                        </div>
                        <h1 className="text-2xl font-bold text-text-primary">
                            {step === 'qr' ? 'QR orqali kirish' : 'Tizimga kirish'}
                        </h1>
                        <p className="text-text-secondary mt-2">
                            {step === 'phone' && 'Telefon raqamingizni kiriting'}
                            {step === 'code' && 'SMS kodni kiriting'}
                            {step === 'qr' && 'Mobil ilova orqali skan qiling'}
                        </p>
                    </div>

                    {/* Phone step */}
                    {step === 'phone' && (
                        <form onSubmit={handlePhoneSubmit} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-text-primary">
                                    Telefon raqam
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted z-10">
                                        <Smartphone className="w-5 h-5"/>
                                    </div>
                                    <div className="absolute left-10 top-1/2 -translate-y-1/2 text-text-primary font-medium z-10 pointer-events-none">
                                        +998
                                    </div>
                                    <input
                                        type="text"
                                        value={phone}
                                        onChange={handlePhoneChange}
                                        placeholder="90 123 45 67"
                                        autoFocus
                                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-text-primary
                                            placeholder:text-text-muted pl-[5.5rem]
                                            focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
                                            transition-all duration-200"
                                    />
                                </div>
                                <p className="text-sm text-text-muted">Raqamga SMS kod yuboriladi</p>
                            </div>

                            <Button
                                type="submit"
                                size="lg"
                                fullWidth
                                isLoading={isLoading}
                                disabled={phone.replace(/\D/g, '').length !== 9}
                            >
                                Davom etish
                            </Button>

                            {/* QR option */}
                            <button
                                type="button"
                                onClick={() => setStep('qr')}
                                className="w-full flex items-center justify-center gap-2 py-3 text-text-secondary hover:text-primary transition-colors"
                            >
                                <QrCode className="w-5 h-5"/>
                                <span>QR kod orqali kirish</span>
                            </button>
                        </form>
                    )}

                    {/* Code step */}
                    {step === 'code' && (
                        <form onSubmit={handleCodeSubmit} className="space-y-6">
                            <div className="text-center mb-4">
                                <p className="text-lg font-medium text-text-primary">
                                    {formatPhone('998' + phone.replace(/\D/g, ''))}
                                </p>
                                <p className="text-sm text-text-secondary mt-1">
                                    Bu raqamga kod yuborildi
                                </p>
                            </div>

                            <Input
                                label="Tasdiqlash kodi"
                                placeholder="123456"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                maxLength={6}
                                autoFocus
                            />

                            <Button
                                type="submit"
                                size="lg"
                                fullWidth
                                isLoading={isLoading}
                                disabled={code.length !== 6}
                            >
                                Tasdiqlash
                            </Button>

                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => setStep('phone')}
                                    className="text-text-secondary hover:text-primary transition-colors"
                                >
                                    Raqamni o'zgartirish
                                </button>

                                {countdown > 0 ? (
                                    <span className="text-text-muted">
                    {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                  </span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => requestCode(phone.replace(/\D/g, ''))}
                                        className="text-primary hover:underline"
                                        disabled={isLoading}
                                    >
                                        Kodni qayta yuborish
                                    </button>
                                )}
                            </div>
                        </form>
                    )}

                    {/* QR step */}
                    {step === 'qr' && (
                        <div className="space-y-6">
                            <div className="bg-surface rounded-xl p-6 flex justify-center">
                                <div className="bg-white p-4 rounded-xl">
                                    <QRCodeSVG
                                        value={qrToken || 'https://uzum.uz'}
                                        size={200}
                                        level="H"
                                        includeMargin={false}
                                    />
                                </div>
                            </div>

                            <p className="text-center text-text-secondary">
                                Uzum ilovasini oching va QR kodni skan qiling
                            </p>

                            <Button
                                variant="outline"
                                fullWidth
                                onClick={() => setStep('phone')}
                            >
                                Telefon raqam orqali kirish
                            </Button>
                        </div>
                    )}

                    {/* Trust badges */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <div className="flex items-center justify-center gap-6 text-sm text-text-muted">
                            <div className="flex items-center gap-1">
                                <Shield className="w-4 h-4"/>
                                <span>Xavfsiz</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Smartphone className="w-4 h-4"/>
                                <span>Tezkor</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Terms */}
                <p className="text-center text-sm text-text-muted mt-6">
                    Tizimga kirish orqali siz{' '}
                    <Link to="/terms" className="text-primary hover:underline">
                        foydalanish shartlari
                    </Link>{' '}
                    bilan tanishgan bo'lasiz
                </p>
            </div>
        </div>
    );
};
