import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">ShoopHouse</h3>
            <p className="text-muted-foreground text-sm">
              Premium digital files marketplace
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t('nav.store')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/store" className="text-muted-foreground hover:text-foreground">Browse Products</Link></li>
              <li><Link to="/categories" className="text-muted-foreground hover:text-foreground">Categories</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/support" className="text-muted-foreground hover:text-foreground">{t('nav.support')}</Link></li>
              <li><Link to="/faq" className="text-muted-foreground hover:text-foreground">{t('nav.faq')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="text-muted-foreground hover:text-foreground">Terms</Link></li>
              <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground">Privacy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} ShoopHouse. All rights reserved.
        </div>
      </div>
    </footer>
  );
}


