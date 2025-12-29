import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

export default function AdminLayout() {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { path: '/admin', label: t('admin.dashboard') },
    { path: '/admin/users', label: t('admin.users') },
    { path: '/admin/sellers', label: t('admin.sellers') },
    { path: '/admin/products', label: t('admin.products') },
    { path: '/admin/orders', label: t('admin.orders') },
    { path: '/admin/tickets', label: t('admin.tickets') },
    { path: '/admin/settings', label: t('admin.settings') },
    { path: '/admin/audit', label: t('admin.audit') },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="flex gap-8">
          <aside className="w-64">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-4 py-2 rounded-md ${
                    location.pathname === item.path
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
          <main className="flex-1">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}


