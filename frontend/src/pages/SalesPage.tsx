import { useState } from 'react';

export default function SalesPage() {
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);

  async function createSale() {
    await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: new Date().toISOString(), items: [{ productId, quantity }] }),
    });
  }

  return (
    <div>
      <h2>Ventes</h2>
      <input placeholder="Product ID" value={productId} onChange={(e) => setProductId(e.target.value)} />
      <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
      <button onClick={createSale}>Créer</button>
    </div>
  );
}
