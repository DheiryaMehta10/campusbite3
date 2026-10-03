export default function Home() {
  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ color: '#ea580c', fontSize: '32px', marginBottom: '8px' }}>🍔 CampusBite</h1>
      <p style={{ color: '#4b5563', fontSize: '16px', marginBottom: '32px' }}>Order Smart. Delivered by Slot.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', textAlign: 'left' }}>
        <a href="https://student-app-xi-bice.vercel.app" style={{ border: '1px solid #fed7aa', borderRadius: '12px', padding: '24px', textDecoration: 'none', color: '#111827', background: '#fff' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>🎓 Student App</h2>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Browse menus, select delivery slots, and place orders.</p>
        </a>

        <a href="https://restaurant-app-xi-five.vercel.app" style={{ border: '1px solid #fed7aa', borderRadius: '12px', padding: '24px', textDecoration: 'none', color: '#111827', background: '#fff' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>🍽️ Restaurant Portal</h2>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Live orders feed, menu status, and store controls.</p>
        </a>

        <a href="https://admin-app-sigma-rust.vercel.app" style={{ border: '1px solid #fed7aa', borderRadius: '12px', padding: '24px', textDecoration: 'none', color: '#111827', background: '#fff' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>🛡️ Admin Console</h2>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Platform stats, uncollected orders, fee management.</p>
        </a>
      </div>
    </div>
  );
}
