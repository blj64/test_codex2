import { useState } from 'react';
import ProductsPage from './pages/ProductsPage';
import SalesPage from './pages/SalesPage';
import DashboardPage from './pages/DashboardPage';

type Page = 'dashboard' | 'products' | 'sales';

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');
  return (
    <div>
      <nav>
        <button onClick={() => setPage('dashboard')}>Dashboard</button>
        <button onClick={() => setPage('products')}>Produits</button>
        <button onClick={() => setPage('sales')}>Ventes</button>
      </nav>
      {page === 'dashboard' && <DashboardPage />}
      {page === 'products' && <ProductsPage />}
      {page === 'sales' && <SalesPage />}
    </div>
  );
}
