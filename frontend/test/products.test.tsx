import { describe, it, expect } from 'vitest';
import ProductsPage from '../src/pages/ProductsPage';
import { renderToString } from 'react-dom/server';

describe('ProductsPage', () => {
  it('renders header', () => {
    const html = renderToString(<ProductsPage />);
    expect(html).toContain('Produits');
  });
});
