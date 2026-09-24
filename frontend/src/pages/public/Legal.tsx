const TERMS = [
  ['Using TableNest', 'TableNest connects diners with independent restaurants. Restaurants are responsible for their food, prices, opening hours and service; we provide the platform that lets you find them, book and order.'],
  ['Bookings', 'A booking is a request until the restaurant confirms it. Please arrive on time and cancel in the app if your plans change. Restaurants may cancel bookings they cannot honour, and we will notify you.'],
  ['Orders and payment', 'Prices are set by each restaurant and calculated at checkout, including any delivery fee, service fee and tax shown before you order. Payment is currently made in person on delivery or at the restaurant. You may cancel an order until the kitchen starts preparing it.'],
  ['Rewards', 'Reward points have no cash value and cannot be transferred. Vouchers are single-use and valid until the date shown.'],
  ['Your account', 'Keep your password private. You are responsible for activity on your account. We may suspend accounts used for fraud or abuse.'],
  ['Reviews', 'Reviews must reflect your real experience of a completed order or visit. We may remove reviews that are abusive or unrelated.'],
];
const PRIVACY = [
  ['What we collect', 'Your name, email, phone (optional), delivery addresses you save, and your bookings, orders, reviews and favourites. For saved cards we keep only the brand, last four digits and expiry — never the full number or security code.'],
  ['Why', 'To make and manage your bookings and orders, keep you updated, prevent fraud, and improve the service. Restaurants receive the details they need to serve you: your name, phone, party size or order, and delivery address.'],
  ['The concierge', 'Questions you send to the concierge are processed by our AI provider to generate an answer. Do not share passwords or payment details in the chat.'],
  ['Security', 'Passwords are stored as one-way hashes. Sessions are revoked when you change or reset your password.'],
  ['Your choices', 'You can edit your profile, delete saved addresses and cards, change notification preferences, or deactivate your account from Settings.'],
];

export default function Legal({ kind }: { kind: 'terms' | 'privacy' }) {
  const rows = kind === 'terms' ? TERMS : PRIVACY;
  return (
    <div className="container-page max-w-3xl pt-8">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-4 text-[44px] leading-tight text-ink">{kind === 'terms' ? 'Terms of use' : 'Privacy notice'}</h1>
      <p className="mt-3 text-ink-3">The plain-language version. Questions? Contact us from the Help centre.</p>
      <div className="mt-10 space-y-8">
        {rows.map(([h, b], i) => (
          <section key={h} className="grid gap-2 sm:grid-cols-[48px_1fr]">
            <span className="font-display text-2xl text-saffron-500 italic">{i + 1}.</span>
            <div>
              <h2 className="text-[22px] text-ink">{h}</h2>
              <p className="mt-2 text-[15.5px] leading-relaxed text-ink-2">{b}</p>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
