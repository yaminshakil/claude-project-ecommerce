import Navbar from '@/components/store/Navbar';
import Link from 'next/link';

const FOOTER_LINKS = [
  {
    heading: 'Shop',
    links: [
      { label: 'All Products', href: '/products' },
      { label: 'Categories', href: '/categories' },
      { label: 'Featured', href: '/products?is_featured=1' },
      { label: 'New Arrivals', href: '/products?sort=latest' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'Login', href: '/login' },
      { label: 'Register', href: '/register' },
      { label: 'My Orders', href: '/orders' },
      { label: 'My Profile', href: '/profile' },
    ],
  },
  {
    heading: 'Help',
    links: [
      { label: 'Contact Us', href: '/contact' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Returns', href: '/returns' },
      { label: 'Shipping Info', href: '/shipping' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Terms & Conditions', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Cookie Policy', href: '/cookies' },
    ],
  },
];

function Footer() {
  return (
    <footer className="mt-auto">
      {/* ── CTA banner with silhouette scene ── */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #00c472 0%, #00a55e 100%)' }}>
        {/* CTA text + buttons */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-12 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Ready to find your<br />perfect product?
            </h2>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <Link
              href="/products?is_featured=1"
              className="inline-flex items-center gap-2 text-white text-sm font-semibold hover:opacity-80 transition-opacity"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>
              View Featured
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-white text-gray-900 text-sm font-bold px-6 py-2.5 rounded-lg hover:bg-gray-100 transition-colors shadow-md"
            >
              Shop Now
            </Link>
          </div>
        </div>

        {/* SVG Silhouette Scene */}
        <div className="relative w-full" style={{ height: '220px' }}>
          <svg
            viewBox="0 0 1440 220"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMax slice"
            className="absolute inset-0 w-full h-full"
          >
            {/* Mountains — far background */}
            <path d="M0,140 L120,70 L240,110 L360,40 L480,90 L580,30 L700,80 L820,20 L940,75 L1060,35 L1180,85 L1300,45 L1440,80 L1440,220 L0,220 Z" fill="#009952" />

            {/* Rolling hills — mid distance */}
            <path d="M0,160 Q180,120 360,155 Q540,190 720,145 Q900,100 1080,150 Q1260,190 1440,155 L1440,220 L0,220 Z" fill="#007a3d" />

            {/* Left cluster of trees */}
            <g fill="#004d26">
              {/* tree 1 */}
              <polygon points="40,175 65,100 90,175" />
              <rect x="60" y="175" width="10" height="18" />
              {/* tree 2 */}
              <polygon points="80,178 110,95 140,178" />
              <rect x="105" y="178" width="10" height="18" />
              {/* tree 3 - round top */}
              <ellipse cx="170" cy="140" rx="30" ry="35" />
              <rect x="163" y="170" width="14" height="25" />
              {/* tree 4 */}
              <polygon points="200,178 225,105 250,178" />
              <rect x="220" y="178" width="10" height="18" />
            </g>

            {/* Right cluster of trees */}
            <g fill="#004d26">
              <polygon points="1200,178 1225,100 1250,178" />
              <rect x="1220" y="178" width="10" height="18" />
              <ellipse cx="1290" cy="138" rx="32" ry="38" />
              <rect x="1282" y="170" width="16" height="26" />
              <polygon points="1330,175 1360,95 1390,175" />
              <rect x="1355" y="175" width="10" height="18" />
              <ellipse cx="1420" cy="145" rx="28" ry="32" />
            </g>

            {/* Mid-distance trees */}
            <g fill="#003d1e">
              <polygon points="380,180 400,130 420,180" />
              <polygon points="440,182 465,120 490,182" />
              <polygon points="960,180 985,122 1010,180" />
              <polygon points="1020,183 1048,115 1076,183" />
            </g>

            {/* Deer silhouette — center stage */}
            <g fill="#002d16" transform="translate(680,148)">
              {/* body */}
              <ellipse cx="0" cy="25" rx="22" ry="13" />
              {/* neck */}
              <path d="M8,15 Q12,2 10,-8 Q8,-14 14,-16 Q18,-14 16,-8 Q18,2 14,14 Z" />
              {/* head */}
              <ellipse cx="13" cy="-18" rx="8" ry="6" />
              {/* antler left */}
              <path d="M10,-23 L6,-38 M6,-38 L2,-46 M6,-38 L10,-44" stroke="#002d16" strokeWidth="2" fill="none" />
              {/* antler right */}
              <path d="M16,-23 L20,-38 M20,-38 L16,-46 M20,-38 L24,-44" stroke="#002d16" strokeWidth="2" fill="none" />
              {/* legs */}
              <rect x="-14" y="36" width="5" height="22" rx="2" />
              <rect x="-4" y="36" width="5" height="22" rx="2" />
              <rect x="8" y="36" width="5" height="22" rx="2" />
              <rect x="18" y="36" width="5" height="22" rx="2" />
              {/* tail */}
              <ellipse cx="-22" cy="20" rx="5" ry="4" />
            </g>

            {/* Foreground ground */}
            <path d="M0,195 Q360,178 720,190 Q1080,202 1440,185 L1440,220 L0,220 Z" fill="#002010" />

            {/* Foreground grass tufts */}
            <g fill="#001a0d">
              <path d="M50,196 Q55,182 60,196" />
              <path d="M300,192 Q308,176 316,192" />
              <path d="M600,194 Q607,179 614,194" />
              <path d="M900,191 Q908,177 916,191" />
              <path d="M1200,193 Q1207,179 1214,193" />
              <path d="M1380,196 Q1386,182 1392,196" />
            </g>
          </svg>
        </div>
      </div>

      {/* ── Links section ── */}
      <div style={{ backgroundColor: '#001a0d' }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-10">
          <div className="flex flex-col md:flex-row gap-10">
            {/* Brand */}
            <div className="md:w-52 flex-shrink-0">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M7 4V2H17V4H20C21.1 4 22 4.9 22 6V20C22 21.1 21.1 22 20 22H4C2.9 22 2 21.1 2 20V6C2 4.9 2.9 4 4 4H7ZM9 4H15V4H9V4ZM4 6V20H20V6H4ZM12 8C14.21 8 16 9.79 16 12S14.21 16 12 16 8 14.21 8 12 9.79 8 12 8Z"/></svg>
                </div>
                <span className="text-white font-bold text-lg tracking-wide">ShopNow</span>
              </Link>
              <p className="text-sm text-green-300/70 leading-relaxed">
                Your one-stop shop for quality products at the best prices.
              </p>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px bg-white/10 self-stretch" />

            {/* Link columns */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-8">
              {FOOTER_LINKS.map((col) => (
                <div key={col.heading}>
                  <h4 className="text-xs font-bold text-green-400 uppercase tracking-widest mb-4">
                    {col.heading}
                  </h4>
                  <ul className="space-y-2.5">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-sm text-green-100/70 hover:text-white transition-colors"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-green-300/50">
            <span>&copy; {new Date().getFullYear()} ShopNow. All rights reserved.</span>
            <div className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
              English
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
