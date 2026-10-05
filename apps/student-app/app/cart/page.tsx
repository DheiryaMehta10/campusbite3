'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
  isVeg?: boolean;
}

interface DeliverySlot {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  cutoff_time: string;
  is_active: boolean;
  status: 'active' | 'cutoff_passed' | 'disabled';
}

const DEFAULT_SLOTS: DeliverySlot[] = [
  {
    id: '4a511603-db68-4dee-b602-0478566adedd',
    name: 'Evening Slot 1 (6:00 PM – 7:00 PM)',
    start_time: '18:00',
    end_time: '19:00',
    cutoff_time: '17:45',
    is_active: true,
    status: 'active',
  },
  {
    id: 'e5df2f44-35eb-4f99-838e-98570c6536c8',
    name: 'Evening Slot 2 (7:00 PM – 8:00 PM)',
    start_time: '19:00',
    end_time: '20:00',
    cutoff_time: '18:45',
    is_active: true,
    status: 'active',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440103',
    name: 'Night Canteen Slot (9:30 PM – 10:30 PM)',
    start_time: '21:30',
    end_time: '22:30',
    cutoff_time: '21:15',
    is_active: true,
    status: 'active',
  },
];

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [slots, setSlots] = useState<DeliverySlot[]>(DEFAULT_SLOTS);
  const [selectedSlotId, setSelectedSlotId] = useState<string>(DEFAULT_SLOTS[0].id);
  const [loading, setLoading] = useState(false);

  // Delivery details (loaded dynamically from logged in student session)
  const [hostelName, setHostelName] = useState('Tagore Hostel Block A');
  const [roomNumber, setRoomNumber] = useState('304');
  const [phone, setPhone] = useState('9876543210');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'manual_qr'>('cod');
  const [cookingInstructions, setCookingInstructions] = useState('');
  const [optOutCutlery, setOptOutCutlery] = useState(true);

  // Promo Code
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  const api = axios.create({ baseURL: '' });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('cb_cart');
        if (saved) setCart(JSON.parse(saved));
        const savedHostel = localStorage.getItem('userHostel');
        if (savedHostel) setHostelName(savedHostel);
        const savedRoom = localStorage.getItem('userRoom');
        if (savedRoom) setRoomNumber(savedRoom);
        const savedPhone = localStorage.getItem('userPhone');
        if (savedPhone) setPhone(savedPhone);
      } catch (e) {}
    }
  }, []);

  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cb_cart', JSON.stringify(newCart));
    }
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    const updated = cart.map((i) => {
      if (i.id === id) {
        return { ...i, quantity: Math.max(0, i.quantity + delta) };
      }
      return i;
    }).filter((i) => i.quantity > 0);
    updateCart(updated);
  };

  const itemTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = 0; // Free campus slot delivery
  const platformFee = totalItemCount >= 4 ? 4.0 : 2.0;

  let discount = appliedPromo ? appliedPromo.discount : 0;
  const toPay = Math.max(0, itemTotal + deliveryFee + platformFee - discount);

  const applyPromoCode = (codeToApply?: string) => {
    setPromoError('');
    setPromoSuccess('');
    const code = (codeToApply || promoInput).trim().toUpperCase();
    if (!code) {
      setPromoError('Please enter a valid coupon code');
      return;
    }

    if (code === 'FIRSTBITE') {
      const calcDiscount = Math.min(50, Math.round(itemTotal * 0.2));
      setAppliedPromo({ code: 'FIRSTBITE', discount: calcDiscount });
      setPromoSuccess(`🎉 'FIRSTBITE' applied! Saved ₹${calcDiscount}`);
      setPromoInput('');
    } else if (code === 'CAMPUS50') {
      if (itemTotal >= 150) {
        setAppliedPromo({ code: 'CAMPUS50', discount: 50 });
        setPromoSuccess(`🎉 'CAMPUS50' applied! Saved ₹50`);
        setPromoInput('');
      } else {
        setPromoError("Cart total must be at least ₹150 for 'CAMPUS50'");
      }
    } else {
      setPromoError('Invalid coupon code. Try FIRSTBITE or CAMPUS50');
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoSuccess('');
    setPromoError('');
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty! Add dishes to place an order.');
      return;
    }
    if (!hostelName.trim()) {
      alert('Please enter your Hostel Name / Block for delivery');
      return;
    }
    if (!roomNumber.trim()) {
      alert('Please enter your Room Number');
      return;
    }

    setLoading(true);

    const orderNum = `CB-${Math.floor(1000 + Math.random() * 9000)}`;
    const slotObj = slots.find((s) => s.id === selectedSlotId);
    const slotLabel = slotObj ? slotObj.name : 'Evening Slot 1 (6:00 PM – 7:00 PM)';

    const newLocalOrder: any = {
      id: 'ord-' + Date.now(),
      orderNumber: orderNum,
      order_number: orderNum,
      items: cart.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
      order_items: cart.map((i) => ({ item_name: i.name, quantity: i.quantity, unit_price: i.price })),
      totalAmount: toPay,
      total_amount: toPay,
      placedAt: new Date().toISOString(),
      placed_at: new Date().toISOString(),
      orderStatus: 'ORDER_PLACED',
      order_status: 'ORDER_PLACED',
      deliverySlot: slotLabel,
      delivery_slot: { name: slotLabel },
      hostelName: hostelName.trim(),
      hostel_name: hostelName.trim(),
      roomNumber: roomNumber.trim(),
      room_number: roomNumber.trim(),
      restaurantName: cart[0]?.restaurantName || 'North Campus Central Canteen',
      restaurantId: cart[0]?.restaurantId || '550e8400-e29b-41d4-a716-446655440001',
    };

    try {
      const orderPayload = {
        studentId: localStorage.getItem('userId') || 'student-' + (phone || 'guest'),
        studentName: localStorage.getItem('userName') || 'Student',
        studentPhone: phone || localStorage.getItem('userPhone') || '9876543210',
        hostelName: hostelName.trim(),
        roomNumber: roomNumber.trim(),
        restaurantId: cart[0]?.restaurantId || '550e8400-e29b-41d4-a716-446655440001',
        restaurantName: cart[0]?.restaurantName || 'North Campus Central Canteen',
        deliverySlotId: selectedSlotId || '4a511603-db68-4dee-b602-0478566adedd',
        items: cart.map((i) => ({ itemId: i.id, name: i.name, price: i.price, quantity: i.quantity })),
        itemTotal,
        deliveryFee,
        platformFee,
        discount,
        totalAmount: toPay,
        paymentMethod,
      };

      let res;
      try {
        res = await api.post('/api/orders', orderPayload);
      } catch (postErr) {
        res = await axios.post('https://student-app-xi-bice.vercel.app/api/orders', orderPayload);
      }
      if (res.data?.order?.id) {
        newLocalOrder.id = res.data.order.id;
        newLocalOrder.orderNumber = res.data.order.orderNumber || orderNum;
      }
    } catch (error: any) {
      console.warn('Order API sync notice:', error);
    }

    try {
      const pastOrders = JSON.parse(localStorage.getItem('cb_orders') || '[]');
      pastOrders.unshift(newLocalOrder);
      localStorage.setItem('cb_orders', JSON.stringify(pastOrders));
    } catch {}

    updateCart([]);
    router.push('/orders');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-36 font-sans selection:bg-orange-500 selection:text-white">
      {/* 1. TOP CHECKOUT HEADER */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-bold hover:bg-gray-200 transition-all active:scale-95"
        >
          ←
        </button>
        <div className="text-center">
          <h1 className="text-sm font-black text-gray-900 tracking-tight">Checkout</h1>
          <p className="text-[10px] text-gray-500 font-medium">Campus Delivery Guarantee</p>
        </div>
        <div className="text-xs text-green-700 font-bold bg-green-50 px-2 py-1 rounded-md border border-green-200">
          🔒 100% Safe
        </div>
      </header>

      <main className="max-w-md md:max-w-2xl mx-auto p-4 space-y-4">
        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm mt-8 space-y-3">
            <div className="h-16 w-16 mx-auto bg-orange-50 text-orange-600 rounded-3xl flex items-center justify-center text-3xl shadow-inner">
              🛒
            </div>
            <h2 className="text-base font-black text-gray-900">Your cart is empty</h2>
            <p className="text-gray-500 text-xs leading-relaxed max-w-xs mx-auto">
              Hungry? Explore delicious canteen thalis, biryanis, burgers & snacks!
            </p>
            <div className="pt-2">
              <Link
                href="/home"
                className="bg-orange-600 hover:bg-orange-700 text-white font-black text-xs px-6 py-3 rounded-2xl shadow-lg shadow-orange-600/20 inline-block uppercase tracking-wider transition-all active:scale-95"
              >
                Browse Campus Menu
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* 2. ORDER ITEMS CARD (SWIGGY STYLE) */}
            <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <div>
                  <h3 className="text-xs font-black text-gray-900 tracking-wide">
                    {cart[0]?.restaurantName || 'Campus Central Canteen'}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-semibold">Campus Kitchen Partner</p>
                </div>
                <Link href="/home" className="text-xs font-bold text-orange-600 hover:underline">
                  + Add more
                </Link>
              </div>

              {/* Items List */}
              <div className="divide-y divide-gray-100">
                {cart.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="flex-1 pr-2">
                      <p className="text-xs font-bold text-gray-900">{item.name}</p>
                      <p className="text-xs font-black text-gray-700 mt-0.5">₹{item.price * item.quantity}</p>
                    </div>

                    {/* Stepper Button */}
                    <div className="flex items-center bg-green-50 text-green-800 rounded-xl font-black text-xs px-1.5 py-1 border border-green-200">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, -1)}
                        className="px-2 py-0.5 hover:bg-green-200 rounded text-xs transition-colors"
                      >
                        −
                      </button>
                      <span className="px-2 font-bold">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                        className="px-2 py-0.5 hover:bg-green-200 rounded text-xs transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cooking Instructions Input */}
              <div className="pt-1">
                <input
                  type="text"
                  placeholder="✍️ Cooking requests (e.g. less spicy, extra tissue...)"
                  value={cookingInstructions}
                  onChange={(e) => setCookingInstructions(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 focus:bg-white focus:border-orange-500 outline-none transition-all"
                />
              </div>

              {/* Opt-out Cutlery */}
              <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={optOutCutlery}
                  onChange={(e) => setOptOutCutlery(e.target.checked)}
                  className="h-4 w-4 rounded accent-green-600 cursor-pointer"
                />
                <span className="text-[11px] font-semibold text-gray-600">
                  Opt-out of disposable cutlery (Save trees 🌱)
                </span>
              </label>
            </div>

            {/* 3. SCHEDULED DELIVERY SLOT SELECTOR */}
            <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-500">
                  🕒 Choose Delivery Slot
                </h3>
                <span className="text-[10px] font-black bg-orange-100 text-orange-800 px-2 py-0.5 rounded-md">
                  FREE HOSTEL DISPATCH
                </span>
              </div>

              <div className="space-y-2">
                {slots.map((slot) => {
                  const isSelected = selectedSlotId === slot.id;
                  return (
                    <div
                      key={slot.id}
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50/50 shadow-sm'
                          : 'border-gray-100 hover:border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-orange-600 bg-orange-600' : 'border-gray-300'
                          }`}
                        >
                          {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white"></div>}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">{slot.name}</p>
                          <p className="text-[10px] text-gray-400 font-medium">
                            Orders cutoff at {slot.cutoff_time}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-green-700">FREE</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. DELIVERY HOSTEL & ROOM ADDRESS */}
            <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <span>📍</span>
                <span>Hostel Delivery Address</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                    Hostel & Block
                  </label>
                  <input
                    type="text"
                    value={hostelName}
                    onChange={(e) => setHostelName(e.target.value)}
                    placeholder="e.g. Tagore Hostel Block A"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:border-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                    Room Number
                  </label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="e.g. 304"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:border-orange-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 5. COUPONS & OFFERS */}
            <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm space-y-2.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <span>🏷️</span>
                <span>Coupons & Offers</span>
              </h3>

              {appliedPromo ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-2xl">
                  <div>
                    <p className="text-xs font-black text-green-900">
                      '{appliedPromo.code}' Applied!
                    </p>
                    <p className="text-[11px] text-green-700 font-semibold">
                      You saved ₹{appliedPromo.discount} on this order
                    </p>
                  </div>
                  <button
                    onClick={removePromoCode}
                    className="text-xs font-bold text-red-600 hover:text-red-700 uppercase"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter Promo Code"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold uppercase text-gray-900 placeholder-gray-400 focus:bg-white focus:border-orange-500 outline-none"
                    />
                    <button
                      onClick={() => applyPromoCode()}
                      className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                    >
                      Apply
                    </button>
                  </div>

                  {promoError && (
                    <p className="text-xs text-red-600 font-semibold">{promoError}</p>
                  )}
                  {promoSuccess && (
                    <p className="text-xs text-green-600 font-semibold">{promoSuccess}</p>
                  )}

                  {/* Quick Promo Pills */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => applyPromoCode('FIRSTBITE')}
                      className="text-[11px] font-bold px-3 py-1 rounded-xl bg-orange-50 text-orange-800 border border-orange-200 hover:bg-orange-100 transition-all"
                    >
                      FIRSTBITE (20% OFF)
                    </button>
                    <button
                      onClick={() => applyPromoCode('CAMPUS50')}
                      className="text-[11px] font-bold px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-all"
                    >
                      CAMPUS50 (Flat ₹50 OFF)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 6. DETAILED BILL DETAILS (TRANSPARENT SWIGGY / ZOMATO BREAKDOWN) */}
            <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                Bill Summary
              </h3>

              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Item Total</span>
                  <span className="font-bold text-gray-900">₹{itemTotal}</span>
                </div>

                <div className="flex justify-between">
                  <span>Slot Delivery Partner Fee</span>
                  <span className="font-bold text-green-700">FREE</span>
                </div>

                <div className="flex justify-between">
                  <span>Platform & Tech Fee</span>
                  <span className="font-bold text-gray-900">₹{platformFee.toFixed(2)}</span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between text-green-700 font-bold">
                    <span>Coupon Savings ({appliedPromo.code})</span>
                    <span>− ₹{appliedPromo.discount}</span>
                  </div>
                )}

                <div className="border-t border-dashed border-gray-200 pt-2 flex justify-between text-sm font-black text-gray-900">
                  <span>To Pay</span>
                  <span className="text-base text-orange-600">₹{toPay}</span>
                </div>
              </div>
            </div>

            {/* 7. PAYMENT METHOD */}
            <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-1">
                Payment Option
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-2xl border-2 font-black text-xs transition-all flex items-center justify-center gap-2 ${
                    paymentMethod === 'cod'
                      ? 'border-orange-500 bg-orange-50 text-orange-900 shadow-sm'
                      : 'border-gray-100 text-gray-600'
                  }`}
                >
                  <span>💵</span> Cash on Delivery
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('manual_qr')}
                  className={`p-3 rounded-2xl border-2 font-black text-xs transition-all flex items-center justify-center gap-2 ${
                    paymentMethod === 'manual_qr'
                      ? 'border-orange-500 bg-orange-50 text-orange-900 shadow-sm'
                      : 'border-gray-100 text-gray-600'
                  }`}
                >
                  <span>📱</span> UPI QR on Delivery
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      {/* 8. FIXED STICKY PLACE ORDER BUTTON */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 p-4 shadow-2xl">
          <div className="max-w-md md:max-w-2xl mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Total Amount</p>
              <p className="text-lg font-black text-gray-900">₹{toPay}</p>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-xs uppercase tracking-wider py-3.5 px-6 rounded-2xl shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span>Placing Order...</span>
              ) : (
                <>
                  <span>Place Order</span>
                  <span>➔</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}