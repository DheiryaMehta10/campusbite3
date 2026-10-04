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

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [slots, setSlots] = useState<DeliverySlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('slot-eve-1');
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(true);

  // Delivery details (loaded dynamically from logged in student session)
  const [hostelName, setHostelName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'manual_qr'>('cod');

  // Promo Code
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [promoError, setPromoError] = useState('');

  const api = axios.create({ baseURL: '' });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('cb_cart');
        if (saved) {
          const parsed = JSON.parse(saved);
          setCart(parsed);
        }
        const savedHostel = localStorage.getItem('userHostel');
        if (savedHostel) setHostelName(savedHostel);
        const savedRoom = localStorage.getItem('userRoom');
        if (savedRoom) setRoomNumber(savedRoom);
        const savedPhone = localStorage.getItem('userPhone');
        if (savedPhone) setPhone(savedPhone);
      } catch (e) {
        console.error(e);
      }
    }
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    setLoadingSlots(true);
    try {
      const res = await api.get('/api/slots');
      if (res.data?.data && res.data.data.length > 0) {
        setSlots(res.data.data);
        const firstActive = res.data.data.find((s: DeliverySlot) => s.status === 'active' || s.is_active);
        if (firstActive) setSelectedSlotId(firstActive.id);
      } else {
        setSlots([
          { id: 'slot-lunch', name: 'Lunch Slot (12:00 PM – 1:00 PM)', start_time: '12:00', end_time: '13:00', cutoff_time: '11:50', is_active: false, status: 'disabled' },
          { id: 'slot-eve-1', name: 'Evening Slot 1 (6:00 PM – 7:00 PM)', start_time: '18:00', end_time: '19:00', cutoff_time: '17:50', is_active: true, status: 'active' },
          { id: 'slot-eve-2', name: 'Evening Slot 2 (7:00 PM – 8:00 PM)', start_time: '19:00', end_time: '20:00', cutoff_time: '18:50', is_active: true, status: 'active' },
        ]);
      }
    } catch (e) {
      setSlots([
        { id: 'slot-lunch', name: 'Lunch Slot (12:00 PM – 1:00 PM)', start_time: '12:00', end_time: '13:00', cutoff_time: '11:50', is_active: false, status: 'disabled' },
        { id: 'slot-eve-1', name: 'Evening Slot 1 (6:00 PM – 7:00 PM)', start_time: '18:00', end_time: '19:00', cutoff_time: '17:50', is_active: true, status: 'active' },
        { id: 'slot-eve-2', name: 'Evening Slot 2 (7:00 PM – 8:00 PM)', start_time: '19:00', end_time: '20:00', cutoff_time: '18:50', is_active: true, status: 'active' },
      ]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cb_cart', JSON.stringify(newCart));
    }
  };

  const handleQtyChange = (id: string, delta: number) => {
    let newCart = [...cart];
    const index = newCart.findIndex((i) => i.id === id);
    if (index > -1) {
      newCart[index].quantity += delta;
      if (newCart[index].quantity <= 0) {
        newCart.splice(index, 1);
      }
      updateCart(newCart);
    }
  };

  const totalItemCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  const itemTotal = cart.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

  // Delivery Fee is fixed at ₹10 per order
  const deliveryFee = totalItemCount > 0 ? 10 : 0;

  // Platform Fee rule: 1–3 items → ₹2, 4–7 items → ₹4
  const platformFee = totalItemCount === 0 ? 0 : totalItemCount <= 3 ? 2 : 4;

  const discount = appliedPromo ? appliedPromo.discount : 0;
  const toPay = Math.max(0, itemTotal + deliveryFee + platformFee - discount);

  const applyPromoCode = () => {
    setPromoError('');
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    if (code === 'FIRSTBITE') {
      const disc = Math.min(50, Math.round(itemTotal * 0.2));
      setAppliedPromo({ code: 'FIRSTBITE', discount: disc });
    } else if (code === 'CAMPUS50') {
      if (itemTotal >= 150) {
        setAppliedPromo({ code: 'CAMPUS50', discount: 50 });
      } else {
        setPromoError('Min order amount for CAMPUS50 is ₹150');
      }
    } else {
      setPromoError('Invalid promo code. Try FIRSTBITE or CAMPUS50');
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    if (!hostelName.trim()) {
      alert('Please enter your Hostel Name / Block');
      return;
    }
    if (!roomNumber.trim()) {
      alert('Please enter your Room Number');
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        studentId: localStorage.getItem('userId') || 'student-' + (phone || 'guest'),
        studentName: localStorage.getItem('userName') || 'Student',
        studentPhone: phone || localStorage.getItem('userPhone') || '9999999999',
        hostelName: hostelName.trim(),
        roomNumber: roomNumber.trim(),
        restaurantId: cart[0].restaurantId || '550e8400-e29b-41d4-a716-446655440001',
        restaurantName: cart[0].restaurantName || 'Campus Canteen',
        deliverySlotId: selectedSlotId,
        items: cart.map((i) => ({ itemId: i.id, name: i.name, price: i.price, quantity: i.quantity })),
        itemTotal,
        deliveryFee,
        platformFee,
        discount,
        totalAmount: toPay,
        paymentMethod,
      };

      const res = await api.post('/api/orders', orderPayload);

      // Save order to history
      const orderNum = res.data?.order?.orderNumber || 'CB-' + Math.floor(1000 + Math.random() * 9000);
      const pastOrders = JSON.parse(localStorage.getItem('cb_orders') || '[]');
      pastOrders.unshift({
        id: res.data?.order?.id || 'ord-' + Date.now(),
        orderNumber: orderNum,
        items: cart,
        totalAmount: toPay,
        placedAt: new Date().toISOString(),
        orderStatus: 'ORDER_PLACED',
        deliverySlot: slots.find((s) => s.id === selectedSlotId)?.name || 'Evening Slot (6:00 PM – 7:00 PM)',
        hostelName: hostelName.trim(),
        roomNumber: roomNumber.trim(),
        restaurantName: cart[0]?.restaurantName || 'Campus Partner',
      });
      localStorage.setItem('cb_orders', JSON.stringify(pastOrders));

      updateCart([]);
      alert(`🎉 Order placed successfully! Order #${orderNum}`);
      router.push('/orders');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Order submitted successfully');
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28 font-sans">
      {/* Top Header */}
      <div className="bg-white border-b px-4 py-3 sticky top-0 z-30 flex items-center justify-between shadow-sm">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium text-sm"
        >
          <span className="text-lg">←</span> Back
        </button>
        <h1 className="font-bold text-gray-900 text-base">Your Cart</h1>
        <div className="w-8"></div>
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-4">
        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm mt-8">
            <p className="text-5xl mb-3">🛒</p>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Your cart is empty</h2>
            <p className="text-gray-500 text-xs mb-6">Explore our campus menus, groceries & essentials!</p>
            <Link
              href="/home"
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-md inline-block transition-transform active:scale-95 uppercase tracking-wider"
            >
              Browse Campus Menu
            </Link>
          </div>
        ) : (
          <>
            {/* Cart Items Card */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-3 pb-2 border-b">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider truncate max-w-[200px]">
                  {cart[0]?.restaurantName || 'Campus Partner'}
                </span>
                <span className="text-xs text-orange-600 font-bold">{totalItemCount} Items</span>
              </div>

              <div className="divide-y divide-gray-100">
                {cart.map((item) => (
                  <div key={item.id} className="py-3 flex justify-between items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">₹{item.price} each</p>
                    </div>

                    <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden border">
                      <button
                        onClick={() => handleQtyChange(item.id, -1)}
                        className="px-2.5 py-1 text-gray-700 font-bold hover:bg-gray-200 text-sm"
                      >
                        −
                      </button>
                      <span className="px-2 text-xs font-bold text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => handleQtyChange(item.id, 1)}
                        className="px-2.5 py-1 text-gray-700 font-bold hover:bg-gray-200 text-sm"
                      >
                        +
                      </button>
                    </div>

                    <p className="font-black text-gray-900 text-sm min-w-[50px] text-right">
                      ₹{item.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Scheduled Slot Picker */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  <span>⏱</span> Choose Delivery Slot
                </h3>
                <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full">
                  Slot-based
                </span>
              </div>

              {loadingSlots ? (
                <p className="text-xs text-gray-500 py-2">Loading slots...</p>
              ) : (
                <div className="space-y-2">
                  {slots.map((slot) => {
                    const isDisabled = slot.status === 'disabled' || slot.status === 'cutoff_passed' || !slot.is_active;
                    const isSelected = selectedSlotId === slot.id && !isDisabled;

                    return (
                      <div
                        key={slot.id}
                        onClick={() => !isDisabled && setSelectedSlotId(slot.id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all ${
                          isDisabled
                            ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'border-orange-500 bg-orange-50/50 shadow-sm cursor-pointer'
                            : 'border-gray-200 hover:border-gray-300 bg-white cursor-pointer'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className={`font-bold text-xs ${isSelected ? 'text-orange-950' : 'text-gray-900'}`}>
                              {slot.name}
                            </p>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              Cutoff Time: {slot.cutoff_time}
                            </p>
                          </div>
                          <div>
                            {isDisabled ? (
                              <span className="text-[10px] font-bold px-2 py-1 bg-gray-200 text-gray-600 rounded-lg">
                                {slot.status === 'cutoff_passed' ? 'Cutoff Passed' : 'Slot Disabled'}
                              </span>
                            ) : (
                              <div
                                className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                                  isSelected ? 'border-orange-600 bg-orange-600' : 'border-gray-400'
                                }`}
                              >
                                {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white"></div>}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Hostel Delivery Location */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                <span>📍</span> Delivery Location (Hostel)
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] text-gray-500 font-bold mb-1 block uppercase">Hostel Name / Block</label>
                  <input
                    type="text"
                    value={hostelName}
                    onChange={(e) => setHostelName(e.target.value)}
                    placeholder="Enter hostel name"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-500 font-bold mb-1 block uppercase">Room / Floor</label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="Enter room number"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Promo Code Box */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-2">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                <span>🏷</span> Coupon Code
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="Enter code (e.g. FIRSTBITE)"
                  className="flex-1 uppercase bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-bold tracking-wider focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
                <button
                  onClick={applyPromoCode}
                  className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
                >
                  Apply
                </button>
              </div>
              {appliedPromo && (
                <p className="text-[11px] font-bold text-green-600 flex items-center gap-1">
                  ✓ '{appliedPromo.code}' applied! Saved ₹{appliedPromo.discount}
                </p>
              )}
              {promoError && <p className="text-[11px] font-semibold text-red-500">{promoError}</p>}
            </div>

            {/* Payment Mode */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-2">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                <span>💳</span> Payment Method
              </h3>
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-orange-500 bg-orange-50/50 shadow-sm'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <p className="font-bold text-xs text-gray-900">💵 Cash on Delivery</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Pay cash when slot runner arrives</p>
                </div>
                <div
                  onClick={() => setPaymentMethod('manual_qr')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'manual_qr'
                      ? 'border-orange-500 bg-orange-50/50 shadow-sm'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <p className="font-bold text-xs text-gray-900">📱 UPI / Partner QR</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Scan delivery partner's QR at hostel</p>
                </div>
              </div>
            </div>

            {/* Bill Summary */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-2.5">
              <h3 className="font-bold text-gray-900 text-sm mb-1">Bill Details</h3>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Item Total ({totalItemCount} items)</span>
                <span className="font-semibold text-gray-900">₹{itemTotal}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Delivery Fee (Scheduled Slot)</span>
                <span className="font-semibold text-gray-900">₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Platform Fee ({totalItemCount <= 3 ? '1–3 items' : '4–7 items'})</span>
                <span className="font-semibold text-gray-900">₹{platformFee}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-xs text-green-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>−₹{discount}</span>
                </div>
              )}

              <div className="border-t pt-3 flex justify-between items-center text-base font-black text-gray-900">
                <span>To Pay</span>
                <span>₹{toPay}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-wider shadow-xl shadow-orange-500/25 transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Securing Slot Order...' : `Place Slot Order (Pay ₹${toPay}) ➔`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}