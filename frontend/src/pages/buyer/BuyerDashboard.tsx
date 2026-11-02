import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ShoppingCart,
  ShoppingBag,
  Package,
  TrendingUp,
  MapPin,
  ShieldCheck,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { getAllProduceListings } from '../../utils/farmerTradesStore';
import { getCart } from './cartStore';

export default function BuyerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const listings = getAllProduceListings();
  const cartItems = getCart();

  const featuredProduce = listings.slice(0, 4);

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* ── 1. Greeting Bar ── */}
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome, {user?.name || 'Buyer'} 🛒
          </h1>
          <p className="text-gray-300 text-sm mt-1">
            Browse farm-fresh lots directly from verified Karnataka producers with 0% brokerage.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-lg backdrop-blur-md">
          <span className="pulse-beacon" />
          <ShieldCheck size={16} className="text-emerald-400" />
          <span>Verified Wholesale Buyer • Karnataka Hub</span>
        </div>
      </section>

      {/* ── 2. Metric Cards ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Link to="/buyer/buy" className="card flex items-center gap-4 hover:-translate-y-1 transition-transform">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Package size={22} />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{listings.length}</div>
            <div className="text-xs text-gray-400 mt-0.5">Active Crop Lots</div>
          </div>
        </Link>

        <Link to="/buyer/cart" className="card flex items-center gap-4 hover:-translate-y-1 transition-transform">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <ShoppingCart size={22} />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{cartItems.length}</div>
            <div className="text-xs text-gray-400 mt-0.5">Items in Cart</div>
          </div>
        </Link>

        <Link to="/buyer/orders" className="card flex items-center gap-4 hover:-translate-y-1 transition-transform">
          <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
            <ShoppingBag size={22} />
          </div>
          <div>
            <div className="text-2xl font-black text-white">Direct</div>
            <div className="text-xs text-gray-400 mt-0.5">Escrow Orders</div>
          </div>
        </Link>

        <Link to="/market-prices" className="card flex items-center gap-4 hover:-translate-y-1 transition-transform">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="text-2xl font-black text-white">30+</div>
            <div className="text-xs text-gray-400 mt-0.5">APMC Mandi Rates</div>
          </div>
        </Link>
      </section>

      {/* ── 3. Quick Action Pills Row ── */}
      <section className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/buyer/buy')}
          className="ft-hero-pill ft-hero-pill-white text-sm"
        >
          <span>🛒</span>
          <span>Browse All Produce</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/buyer/cart')}
          className="ft-hero-pill ft-hero-pill-emerald text-sm"
        >
          <span>🛍️</span>
          <span>Open Cart ({cartItems.length})</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/buyer/orders')}
          className="ft-hero-pill ft-hero-pill-amber text-sm"
        >
          <span>📦</span>
          <span>Track Orders</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/market-prices')}
          className="ft-hero-pill ft-hero-pill-outline text-sm"
        >
          <span>📈</span>
          <span>Live APMC Mandi Rates</span>
        </button>
      </section>

      {/* ── 4. Featured Farm Produce Lots ── */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles size={18} className="text-emerald-400" />
            Fresh Farm Lots Available Today
          </h2>
          <Link to="/buyer/buy" className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
            View All Marketplace Lots &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredProduce.map((item) => (
            <div
              key={item.id}
              className="card flex flex-col overflow-hidden group hover:border-emerald-500/40"
              style={{ padding: 0 }}
            >
              <div className="relative h-44 w-full bg-emerald-950 overflow-hidden">
                <img
                  src={item.imageUrl || '/farmer_hero_bg.jpg'}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 right-2.5 badge badge-green text-xs shadow-md">
                  {item.category}
                </div>
                {item.organic && (
                  <div className="absolute top-2.5 left-2.5 badge badge-amber text-xs shadow-md">
                    🌱 Organic
                  </div>
                )}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-6 flex items-center justify-between text-xs text-white">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className="text-emerald-400" />
                    {item.district}
                  </span>
                  <span>Grade: {item.grade}</span>
                </div>
              </div>

              <div className="p-4 flex flex-col flex-1 gap-2">
                <h3 className="text-base font-bold text-white line-clamp-1">{item.title}</h3>
                <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">{item.description}</p>

                <div className="mt-auto pt-3 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-black text-emerald-400">₹{item.pricePerKg}</span>
                    <span className="text-xs text-gray-400"> / kg</span>
                    <div className="text-[11px] text-gray-400">Lot: {item.quantityQuintals} Qtl</div>
                  </div>

                  <Link
                    to={`/buyer/buy?search=${encodeURIComponent(item.title)}`}
                    className="btn btn-sm btn-primary text-xs"
                  >
                    View Lot
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Wholesale Direct Guarantee ── */}
      <section className="card p-6 bg-gradient-to-r from-emerald-950/60 to-emerald-900/40 border border-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-2 max-w-xl">
          <div className="badge badge-green w-fit text-xs">Direct Trade Transparency</div>
          <h3 className="text-xl font-bold text-white">Direct Farm-to-Business Sourcing</h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            Eliminate commission agents, middleman markups, and delayed dispatches.
            Farmer Trades connects retail chains, food processors, and bulk buyers directly with verified Karnataka farmer clusters.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <Link to="/buyer/buy" className="btn btn-primary">
            Explore All Produce Lots
          </Link>
          <Link to="/contact" className="btn btn-secondary">
            Bulk Contract Inquiries
          </Link>
        </div>
      </section>
    </div>
  );
}
