import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/auth';
import { Button } from './ui/button';
import { ShoppingCart, User, LogOut, Moon, Sun } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, clearAuth, isAuthenticated } = useAuthStore();
  const { getItemCount } = useCartStore();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    clearAuth();
  };

  return (
    <nav className="border-b bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary">
            ShoopHouse
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/store">{t('nav.store')}</Link>

            {isAuthenticated() ? (
              <>
                <Link to="/cart" className="relative">
                  <ShoppingCart className="w-5 h-5" />
                  {getItemCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {getItemCount()}
                    </span>
                  )}
                </Link>

                {user?.role === 'SELLER' && (
                  <Link to="/seller">{t('nav.seller')}</Link>
                )}
                {user?.role === 'ADMIN' && (
                  <Link to="/admin">{t('nav.admin')}</Link>
                )}

                <Link to="/account">
                  <User className="w-5 h-5" />
                </Link>

                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="w-5 h-5" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth/login">
                  <Button variant="ghost">{t('nav.login')}</Button>
                </Link>
                <Link to="/auth/register">
                  <Button>{t('nav.register')}</Button>
                </Link>
              </>
            )}

            <Button variant="ghost" size="icon" onClick={toggleLanguage}>
              {i18n.language === 'en' ? 'ع' : 'EN'}
            </Button>

            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}


