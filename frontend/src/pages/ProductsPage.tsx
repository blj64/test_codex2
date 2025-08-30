import { useEffect, useState } from 'react';

type Product = {
  id: string;
  name: string;
  sku: string;
  unitPrice: number;
  quantity: number;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');

  useEffect(() => {
    fetch('/api/products').then((r) => r.json()).then(setProducts);
  }, []);

  async function addProduct() {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, sku, unitType: 'unit', unitPrice: 0, quantity: 0 }),
    });
    if (res.ok) {
      const p = await res.json();
      setProducts([...products, p]);
    }
  }

  return (
    <div>
      <h2>Produits</h2>
      <ul>
        {products.map((p) => (
          <li key={p.id}>
            {p.name} ({p.sku}) - {p.quantity}
          </li>
        ))}
      </ul>
      <div>
        <input placeholder="Nom" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="SKU" value={sku} onChange={(e) => setSku(e.target.value)} />
        <button onClick={addProduct}>Ajouter</button>
      </div>
    </div>
  );
}
