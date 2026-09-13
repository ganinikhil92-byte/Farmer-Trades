import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getCart, clearCart } from './cartStore';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { Trash2, CreditCard, ShoppingCart, ClipboardList } from 'lucide-react';

export default function Cart() {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState(getCart());
  const [checkoutDone, setCheckoutDone] = useState(false);

  function removeItem(listingId: number) {
    const idx = cartItems.findIndex((c) => c.listing.id === listingId);
    if (idx !== -1) cartItems.splice(idx, 1);
    setCartItems([...cartItems]);
  }

  const total = cartItems.reduce((sum, c) => sum + c.qty * c.listing.price_per_kg, 0);

  async function handleCheckout() {
    if (cartItems.length === 0) return;
    try {
      for (const item of cartItems) {
        await api.post('/orders', {
          listing_id: item.listing.id,
          buyer_id: user?.email || 'unknown',
          crop_name: item.listing.crop_name,
          quantity: item.qty,
          total_price: item.qty * item.listing.price_per_kg,
        });
      }
      clearCart();
      setCartItems([]);
      setCheckoutDone(true);
    } catch {
      alert('Checkout failed. Insufficient stock?');
    }
  }

  if (checkoutDone) {
    return (
      <div>
        <div className="page-header"><h1>My Cart</h1></div>
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ color: 'var(--color-primary-700)', marginBottom: '0.5rem' }}>Order Placed Successfully!</h2>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: 500, margin: '0 auto' }}>
            Your order has been recorded. You can view your purchased items, quantity, and total price in the <strong>My Orders</strong> section.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.75rem', flexWrap: 'wrap' }}>
            <Link to="/buyer/orders" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <ClipboardList size={16} /> View My Orders
            </Link>
            <Link to="/buyer/buy" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingCart size={16} /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>My Cart</h1>
        <p>{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
          <ShoppingCart size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
          <p>Your cart is empty.</p>
          <Link to="/buyer/buy" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>Browse Crops</Link>
        </div>
      ) : (
        <>
          <div className="table-container" style={{ marginBottom: '1.5rem' }}>
            <table>
              <thead>
                <tr>
                  <th>Crop</th>
                  <th>Qty (kg)</th>
                  <th>Price/kg</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((c) => (
                  <tr key={c.listing.id}>
                    <td style={{ fontWeight: 600 }}>{c.listing.crop_name}</td>
                    <td>{c.qty}</td>
                    <td>₹{c.listing.price_per_kg}</td>
                    <td style={{ fontWeight: 600 }}>₹{(c.qty * c.listing.price_per_kg).toLocaleString()}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => removeItem(c.listing.id)}><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Total</p>
              <h2 style={{ color: 'var(--color-primary-700)' }}>₹{total.toLocaleString()}</h2>
            </div>
            <button className="btn btn-primary btn-lg" onClick={handleCheckout}>
              <CreditCard size={18} /> Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
