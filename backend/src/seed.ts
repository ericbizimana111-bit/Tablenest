import 'reflect-metadata';
import * as mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tablenest';
const OID = mongoose.Types.ObjectId;
const loose = () => new mongoose.Schema({}, { strict: false, timestamps: true });
const img = (id: string, w = 900) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

type Dish = [name: string, price: number, description: string, photo: string, tags?: string[]];
interface Spec {
  name: string;
  cuisine: string;
  desc: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  price: string;
  seats: number;
  rating: number;
  reviews: number;
  delivery: boolean;
  pickup: boolean;
  fee: number;
  min: number;
  photos: string[];
  menu: Record<string, Dish[]>;
  promo: { code: string; name: string; type: 'percentage' | 'flat'; value: number; min: number };
  owner: { name: string; email: string };
}

const SPECS: Spec[] = [
  {
    name: "L'Artiste de la Cuisine",
    cuisine: 'French',
    desc: 'Modern French cuisine with a seasonal tasting menu, an award-winning sommelier and a candle-lit dining room in the heart of the Arts District.',
    address: '23 Culinary Way, Arts District',
    city: 'New York',
    country: 'USA',
    phone: '+1 212 555 0134',
    price: '$$$$',
    seats: 60,
    rating: 4.8,
    reviews: 0,
    delivery: false,
    pickup: true,
    fee: 0,
    min: 0,
    photos: ['1414235077428-338989a2e8c0', '1550966871-3ed3cdb5ed0c', '1559339352-11d035aa65de'],
    menu: {
      Starters: [
        ['Truffle Escargot', 24, 'Burgundy snails, black truffle garlic butter, herb crumb', '1565299624946-b28f40a0ae38', ['signature']],
        ['Seared Scallops', 28, 'Cauliflower purée, crispy pancetta, micro herbs', '1476224203421-9ac39bcb3327'],
        ['French Onion Soup', 16, 'Caramelised onions, beef broth, gruyère crouton', '1547592166-23ac45744acd', ['vegetarian']],
      ],
      Mains: [
        ['Duck Confit', 38, 'Slow-cooked duck leg, cherry reduction, pomme dauphinoise', '1504674900247-0877df9cc836', ['signature']],
        ['Filet Mignon', 46, 'Grass-fed beef, bordelaise, truffle mash', '1600891964092-4316c288032e'],
        ['Coq au Vin', 32, 'Braised chicken, red wine, lardons, pearl onions', '1555939594-58d7cb561ad1'],
      ],
      Desserts: [
        ['Crème Brûlée', 14, 'Madagascan vanilla custard, caramelised sugar crust', '1488477181946-6428a0291777', ['vegetarian']],
        ['Chocolate Fondant', 15, 'Warm dark chocolate, salted caramel, vanilla ice cream', '1606313564200-e75d5e30476c', ['vegetarian']],
      ],
    },
    promo: { code: 'BIENVENUE15', name: 'Welcome offer', type: 'percentage', value: 15, min: 40 },
    owner: { name: 'Alex Rivera', email: 'owner@tablenest.com' },
  },
  {
    name: 'Sakura Omakase',
    cuisine: 'Japanese',
    desc: 'Hand-pressed nigiri, delicate sashimi and warming ramen prepared by a Tokyo-trained team. Counter seating and private tatami rooms.',
    address: '410 Market Street',
    city: 'San Francisco',
    country: 'USA',
    phone: '+1 415 555 0177',
    price: '$$$',
    seats: 40,
    rating: 4.7,
    reviews: 0,
    delivery: true,
    pickup: true,
    fee: 3.5,
    min: 20,
    photos: ['1579871494447-9811cf80d66c', '1553621042-f6e147245754', '1517248135467-4c7edcad34c4'],
    menu: {
      Sushi: [
        ['Chef’s Nigiri Set (8pc)', 32, 'Seasonal fish over hand-pressed rice', '1579871494447-9811cf80d66c', ['signature']],
        ['Dragon Roll', 18, 'Eel, avocado, cucumber, unagi glaze', '1553621042-f6e147245754'],
        ['Salmon Sashimi', 21, 'Ten slices of Atlantic salmon, wasabi, pickled ginger', '1617093727343-374698b1b08d'],
      ],
      Ramen: [
        ['Tonkotsu Ramen', 17, 'Twelve-hour pork broth, chashu, ajitama egg, nori', '1569718212165-3a8278d5f624', ['signature']],
        ['Spicy Miso Ramen', 16, 'Miso broth, chilli oil, corn, bean sprouts', '1557872943-16a5ac26437e', ['spicy']],
      ],
      Sides: [
        ['Edamame', 6, 'Sea salt or spicy garlic', '1564834744159-ff0ea49dbb00', ['vegan']],
        ['Gyoza (6pc)', 9, 'Pan-fried pork dumplings, ponzu', '1496116218417-1a781b1c416c'],
      ],
    },
    promo: { code: 'SAKURA10', name: 'Sakura spring', type: 'percentage', value: 10, min: 25 },
    owner: { name: 'Hiro Tanaka', email: 'owner.sakura@tablenest.com' },
  },
  {
    name: 'Bella Trattoria',
    cuisine: 'Italian',
    desc: 'Family-run trattoria serving hand-rolled pasta and wood-fired pizza from recipes passed down three generations.',
    address: '88 Wabash Avenue',
    city: 'Chicago',
    country: 'USA',
    phone: '+1 312 555 0119',
    price: '$$',
    seats: 70,
    rating: 4.6,
    reviews: 0,
    delivery: true,
    pickup: true,
    fee: 2.99,
    min: 15,
    photos: ['1555396273-367ea4eb4db5', '1574071318508-1cdbab80d002', '1473093295043-cdd812d0e601'],
    menu: {
      Pizza: [
        ['Margherita', 14, 'San Marzano tomato, fior di latte, basil', '1574071318508-1cdbab80d002', ['vegetarian']],
        ['Diavola', 17, 'Spicy salami, chilli honey, mozzarella', '1565299624946-b28f40a0ae38', ['spicy']],
      ],
      Pasta: [
        ['Tagliatelle al Ragù', 19, 'Slow-cooked beef & pork ragù, parmesan', '1473093295043-cdd812d0e601', ['signature']],
        ['Spaghetti Carbonara', 18, 'Guanciale, pecorino, egg yolk, black pepper', '1563379926898-05f4575a45d8'],
        ['Pesto Gnocchi', 17, 'Potato gnocchi, basil pesto, pine nuts', '1621996346565-e3dbc646d9a9', ['vegetarian']],
      ],
      Dolci: [
        ['Tiramisu', 9, 'Espresso-soaked savoiardi, mascarpone, cocoa', '1571877227200-a0d98ea607e9', ['vegetarian']],
        ['Panna Cotta', 8, 'Vanilla cream, wild berry compote', '1488477181946-6428a0291777', ['vegetarian']],
      ],
    },
    promo: { code: 'PASTA5', name: '$5 off pasta night', type: 'flat', value: 5, min: 25 },
    owner: { name: 'Marco Bellini', email: 'owner.bella@tablenest.com' },
  },
  {
    name: 'Spice Route',
    cuisine: 'Indian',
    desc: 'Regional Indian cooking with clay-oven breads, slow curries and house-ground spices. Vegetarian and vegan friendly.',
    address: '17 Brick Lane',
    city: 'London',
    country: 'UK',
    phone: '+44 20 7946 0210',
    price: '$$',
    seats: 55,
    rating: 4.5,
    reviews: 0,
    delivery: true,
    pickup: true,
    fee: 2.5,
    min: 18,
    photos: ['1585937421612-70a008356fbe', '1565557623262-b51c2513a641', '1552566626-52f8b828add9'],
    menu: {
      Curries: [
        ['Butter Chicken', 16, 'Tandoori chicken, creamy tomato-fenugreek sauce', '1565557623262-b51c2513a641', ['signature']],
        ['Lamb Rogan Josh', 18, 'Kashmiri chilli, slow-braised lamb shoulder', '1585937421612-70a008356fbe', ['spicy']],
        ['Chana Masala', 13, 'Chickpeas, tomato, ginger, pomegranate', '1626804475297-41608ea09aeb', ['vegan']],
      ],
      Breads: [
        ['Garlic Naan', 4, 'Clay-oven bread, garlic butter, coriander', '1600628421055-4d30de868b8f', ['vegetarian']],
        ['Paneer Kulcha', 6, 'Stuffed leavened bread with spiced paneer', '1601050690597-df0568f70950', ['vegetarian']],
      ],
      Rice: [['Chicken Biryani', 15, 'Fragrant basmati layered with saffron and spice', '1563379091339-03b21ab4a4f8', ['signature']]],
    },
    promo: { code: 'SPICE10', name: 'Curry club', type: 'percentage', value: 10, min: 20 },
    owner: { name: 'Priya Nair', email: 'owner.spice@tablenest.com' },
  },
  {
    name: 'Ember & Oak Grill',
    cuisine: 'Steakhouse',
    desc: 'Open-fire steakhouse dry-ageing beef in-house for 35 days. Craft cocktails and a deep bourbon list.',
    address: '502 Congress Avenue',
    city: 'Austin',
    country: 'USA',
    phone: '+1 512 555 0166',
    price: '$$$',
    seats: 90,
    rating: 4.7,
    reviews: 0,
    delivery: false,
    pickup: true,
    fee: 0,
    min: 0,
    photos: ['1544025162-d76694265947', '1600891964092-4316c288032e', '1424847651672-bf20a4b0982b'],
    menu: {
      Steaks: [
        ['Ribeye 14oz', 44, '35-day dry-aged, bone marrow butter', '1600891964092-4316c288032e', ['signature']],
        ['NY Strip 12oz', 39, 'Grass-fed, peppercorn crust', '1544025162-d76694265947'],
        ['Smoked Short Rib', 34, 'Twelve-hour oak smoke, bourbon glaze', '1555939594-58d7cb561ad1'],
      ],
      Burgers: [['Ember Burger', 19, 'Double smash, aged cheddar, bacon jam, brioche', '1568901346375-23c9450c58cd']],
      Sides: [
        ['Truffle Fries', 9, 'Parmesan, parsley, truffle oil', '1573080496219-bb080dd4f877', ['vegetarian']],
        ['Charred Broccolini', 8, 'Chilli, lemon, garlic crumb', '1459411552884-841db9b3cc2a', ['vegan']],
      ],
    },
    promo: { code: 'GRILL20', name: '$20 off dinner for two', type: 'flat', value: 20, min: 80 },
    owner: { name: 'Jack Holloway', email: 'owner.ember@tablenest.com' },
  },
  {
    name: 'Green Bowl Kitchen',
    cuisine: 'Healthy',
    desc: 'Fresh, plant-forward bowls, cold-pressed juices and protein plates made from locally grown produce.',
    address: '1200 Abbot Kinney Blvd',
    city: 'Los Angeles',
    country: 'USA',
    phone: '+1 310 555 0142',
    price: '$$',
    seats: 45,
    rating: 4.4,
    reviews: 0,
    delivery: true,
    pickup: true,
    fee: 1.99,
    min: 12,
    photos: ['1512621776951-a57141f2eefd', '1540189549336-e6e99c3679fe', '1466978913421-dad2ebd01d17'],
    menu: {
      Bowls: [
        ['Harvest Bowl', 14, 'Quinoa, roasted squash, kale, tahini dressing', '1512621776951-a57141f2eefd', ['vegan', 'signature']],
        ['Salmon Poke Bowl', 17, 'Sushi rice, avocado, edamame, sesame', '1546069901-ba9599a7e63c'],
        ['Falafel Bowl', 13, 'Herbed falafel, hummus, pickled slaw', '1512058564366-18510be2db19', ['vegan']],
      ],
      Drinks: [
        ['Green Detox Juice', 7, 'Cucumber, celery, apple, ginger, lemon', '1610970881699-44a5587cabec', ['vegan']],
        ['Iced Matcha Latte', 6, 'Ceremonial matcha, oat milk', '1515823064-d6e0c04616a7', ['vegan']],
      ],
    },
    promo: { code: 'FRESH10', name: 'Fresh start', type: 'percentage', value: 10, min: 15 },
    owner: { name: 'Sofia Reyes', email: 'owner.green@tablenest.com' },
  },
  {
    name: 'Taco Sol',
    cuisine: 'Mexican',
    desc: 'Street-style tacos on fresh-pressed tortillas, smoky salsas and frozen margaritas in a colourful patio setting.',
    address: '75 Ocean Drive',
    city: 'Miami',
    country: 'USA',
    phone: '+1 305 555 0188',
    price: '$',
    seats: 50,
    rating: 4.3,
    reviews: 0,
    delivery: true,
    pickup: true,
    fee: 1.99,
    min: 10,
    photos: ['1565299585323-38d6b0865b47', '1551504734-5ee1c4a1479b', '1414235077428-338989a2e8c0'],
    menu: {
      Tacos: [
        ['Al Pastor Taco', 4.5, 'Marinated pork, pineapple, coriander, onion', '1565299585323-38d6b0865b47', ['signature']],
        ['Baja Fish Taco', 5, 'Beer-battered cod, chipotle slaw, lime', '1551504734-5ee1c4a1479b'],
        ['Roasted Cauliflower Taco', 4, 'Chilli-lime cauliflower, avocado crema', '1599974579688-8dbdd335c77f', ['vegetarian']],
      ],
      Plates: [
        ['Loaded Nachos', 12, 'Black beans, queso, pico, jalapeño, sour cream', '1513456852971-30c0b8199d4d', ['vegetarian']],
        ['Chicken Burrito', 11, 'Grilled chicken, rice, beans, cheese', '1626700051175-6818013e1d4f'],
      ],
      Drinks: [['Classic Margarita', 9, 'Tequila, lime, agave, salted rim', '1544145945-f90425340c7e']],
    },
    promo: { code: 'TACO5', name: 'Taco Tuesday', type: 'flat', value: 5, min: 20 },
    owner: { name: 'Diego Morales', email: 'owner.taco@tablenest.com' },
  },
  {
    name: 'Kigali Bites',
    cuisine: 'African',
    desc: 'Warm Rwandan hospitality: grilled brochettes, isombe, plantain and freshly brewed highland coffee.',
    address: 'KG 7 Ave, Kacyiru',
    city: 'Kigali',
    country: 'Rwanda',
    phone: '+250 788 000 123',
    price: '$$',
    seats: 65,
    rating: 4.6,
    reviews: 0,
    delivery: true,
    pickup: true,
    fee: 1.5,
    min: 8,
    photos: ['1555939594-58d7cb561ad1', '1504674900247-0877df9cc836', '1466978913421-dad2ebd01d17'],
    menu: {
      Grill: [
        ['Goat Brochettes', 12, 'Charcoal-grilled goat skewers, roasted banana', '1555939594-58d7cb561ad1', ['signature']],
        ['Tilapia Grill', 15, 'Whole lake tilapia, ginger-garlic, kachumbari', '1519708227418-c8fd9a32b7a2'],
      ],
      'Local Plates': [
        ['Isombe with Rice', 9, 'Cassava leaves in peanut sauce, steamed rice', '1512058564366-18510be2db19', ['vegan']],
        ['Fried Plantain', 5, 'Sweet plantain, chilli salt', '1604909052743-94e838986d24', ['vegan']],
        ['Rwandan Beef Stew', 11, 'Slow-simmered beef, tomatoes, potatoes', '1547592166-23ac45744acd'],
      ],
      Drinks: [['Highland Coffee', 3.5, 'Single-origin Rwandan pour-over', '1541167760496-1628856ab772', ['vegan']]],
    },
    promo: { code: 'MURAHO10', name: 'Welcome to Kigali', type: 'percentage', value: 10, min: 15 },
    owner: { name: 'Eric Uwimana', email: 'owner.kigali@tablenest.com' },
  },
];

const REVIEW_TEXT = [
  [5, 'Absolutely wonderful — the food arrived hot and the flavours were spot on. Will order again.'],
  [5, 'Great atmosphere and attentive staff. Booking was effortless and our table was ready on time.'],
  [4, 'Really good food, generous portions. Delivery took a touch longer than expected.'],
  [5, 'Best meal we have had this year. The signature dish is a must.'],
  [4, 'Lovely evening. Service was friendly and the desserts were superb.'],
  [3, 'Tasty but a little pricey for the portion size. Still worth a visit.'],
];
const GUESTS = ['Amina K.', 'Jordan P.', 'Sam Lee', 'Maria G.', 'Chris B.', 'Nadia R.'];

function hours() {
  return Object.fromEntries(
    ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map((d) => [
      d,
      { open: '10:00', close: d === 'friday' || d === 'saturday' ? '23:30' : '22:30', closed: false },
    ]),
  );
}

/**
 * DEVELOPMENT ONLY. Wipes the target database and loads demo data. Refuses to run in production
 * and requires an explicit `--wipe` flag so it can never be triggered by accident.
 */
async function seed() {
  if (process.env.NODE_ENV === 'production') throw new Error('Refusing to seed: NODE_ENV=production');
  if (!process.argv.includes('--wipe')) {
    throw new Error(`Seeding DELETES every document in ${MONGODB_URI.replace(/\/\/[^@]*@/, '//***@')}.\nRe-run with: npm run seed -- --wipe`);
  }
  console.log('Seeding TableNest database…');
  const conn = await mongoose.connect(MONGODB_URI);
  const m = (name: string): any => mongoose.model<any>(name, loose());
  const User = m('User'), Restaurant = m('Restaurant'), MenuCategory = m('MenuCategory'), MenuItem = m('MenuItem');
  const Table = m('Table'), Order = m('Order'), Reservation = m('Reservation'), Notification = m('Notification');
  const Loyalty = m('Loyalty'), Referral = m('Referral'), Review = m('Review'), Promotion = m('Promotion');
  const Staff = m('Staff'), Inventory = m('InventoryItem'), Payment = m('Payment');

  await conn.connection.dropDatabase();
  console.log('✓ Database cleared');

  const ownerPw = await bcrypt.hash('owner123', 10);
  const custPw = await bcrypt.hash('customer123', 10);
  const customer: any = await User.create({
    fullName: 'Alex Thompson', email: 'customer@tablenest.com', password: custPw, role: 'customer', isActive: true,
    phone: '+1 555 010 2030', 
    notificationPrefs: { bookingConfirmation: true, marketing: false, orderTracking: true },
    addresses: [{ label: 'Home', street: '14 Maple Street', city: 'New York', state: 'NY', zip: '10001', isDefault: true }],
    paymentMethods: [{ brand: 'Visa', last4: '4242', expiryMonth: '12', expiryYear: '2030', isDefault: true }],
    favoriteRestaurantIds: [],
  });
  await Loyalty.create({ userId: customer._id, points: 850, lifetimePoints: 850, transactions: [{ kind: 'earn', points: 850, description: 'Welcome & past orders', date: new Date() }], vouchers: [] });
  await Referral.create({ userId: customer._id, code: 'NEST-ALEX-DEMO', referrals: [], totalEarned: 0 });

  const restaurants: any[] = [];
  const dishIndex: Record<string, any[]> = {};

  for (const spec of SPECS) {
    const owner: any = await User.create({
      fullName: spec.owner.name, email: spec.owner.email, password: ownerPw, role: 'owner', isActive: true,
      notificationPrefs: { bookingConfirmation: true, marketing: false, orderTracking: true },
    });
    const restaurant: any = await Restaurant.create({
      name: spec.name, ownerId: owner._id, cuisineType: spec.cuisine, description: spec.desc, address: spec.address,
      city: spec.city, country: spec.country, phone: spec.phone, email: spec.owner.email, status: 'active',
      rating: 0, totalReviews: 0, seatingCapacity: spec.seats, priceRange: spec.price, dineIn: true,
      delivery: spec.delivery, pickup: spec.pickup, acceptingOrders: true, deliveryFee: spec.fee, minOrder: spec.min,
      taxRate: 0.08, prepTime: 25, openingHours: hours(), images: spec.photos.map((p) => img(p, 1200)), approvedAt: new Date(),
    });
    await User.updateOne({ _id: owner._id }, { restaurantId: restaurant._id });
    restaurants.push(restaurant);

    let sort = 1;
    dishIndex[restaurant._id.toString()] = [];
    for (const [catName, dishes] of Object.entries(spec.menu)) {
      const cat: any = await MenuCategory.create({ restaurantId: restaurant._id, name: catName, sortOrder: sort++ });
      for (const [name, price, description, photo, tags] of dishes) {
        const item = await MenuItem.create({
          restaurantId: restaurant._id, categoryId: cat._id, name, price, description, image: img(photo, 700),
          isAvailable: true, isSoldOut: false, tags: tags || [], preparationTime: 15,
        });
        dishIndex[restaurant._id.toString()].push(item);
      }
    }

    const layout = [2, 2, 4, 4, 4, 6, 6, 8];
    await Table.insertMany(layout.map((cap, i) => ({ restaurantId: restaurant._id, tableNumber: String(i + 1), capacity: cap, status: 'available' })));

    await Promotion.create({
      restaurantId: restaurant._id, name: spec.promo.name, code: spec.promo.code, discountType: spec.promo.type,
      discountValue: spec.promo.value, minOrder: spec.promo.min, usageLimit: 0, usedCount: 0, isActive: true,
      startDate: new Date(Date.now() - 7 * 86400000), endDate: new Date(Date.now() + 120 * 86400000),
      description: spec.promo.type === 'percentage' ? `${spec.promo.value}% off orders over $${spec.promo.min}` : `$${spec.promo.value} off orders over $${spec.promo.min}`,
    });
    await Staff.insertMany([
      { restaurantId: restaurant._id, name: spec.owner.name, email: spec.owner.email, role: 'Manager', isActive: true },
      { restaurantId: restaurant._id, name: 'Lena Ortiz', email: `lena@${spec.name.toLowerCase().replace(/[^a-z]/g, '')}.com`, role: 'Chef', isActive: true },
      { restaurantId: restaurant._id, name: 'Omar Haddad', email: `omar@${spec.name.toLowerCase().replace(/[^a-z]/g, '')}.com`, role: 'Host', isActive: true },
    ]);
    await Inventory.insertMany([
      { restaurantId: restaurant._id, name: 'Olive oil', unit: 'L', quantity: 12, minQuantity: 5, supplier: 'Fresh Farms', cost: 9.5, lastRestocked: new Date() },
      { restaurantId: restaurant._id, name: 'Fresh herbs', unit: 'kg', quantity: 2, minQuantity: 3, supplier: 'Green Grocers', cost: 14, lastRestocked: new Date() },
      { restaurantId: restaurant._id, name: 'Flour', unit: 'kg', quantity: 40, minQuantity: 15, supplier: 'Mill & Co', cost: 1.2, lastRestocked: new Date() },
    ]);

    const owner_id = owner._id;
    // Reviews → rating derived from real rows
    const count = 3 + Math.floor(spec.rating * 1.3);
    const reviewDocs = Array.from({ length: count }, (_, i) => {
      const [rating, comment] = REVIEW_TEXT[(i + spec.name.length) % REVIEW_TEXT.length] as [number, string];
      return {
        customerId: new OID(), customerName: GUESTS[i % GUESTS.length], restaurantId: restaurant._id, rating, comment,
        createdAt: new Date(Date.now() - (i + 1) * 3 * 86400000),
        ownerReply: i === 0 ? 'Thank you so much for the kind words — we hope to see you again soon!' : null,
        ownerRepliedAt: i === 0 ? new Date() : null,
      };
    });
    await Review.insertMany(reviewDocs);
    const avg = reviewDocs.reduce((s, r) => s + r.rating, 0) / reviewDocs.length;
    await Restaurant.updateOne({ _id: restaurant._id }, { rating: Math.round(avg * 10) / 10, totalReviews: reviewDocs.length });
    void owner_id;
  }

  // Order history so dashboards and "popular dishes" have real data
  const first = restaurants[0];
  const orderRows: any[] = [];
  for (let d = 0; d < 21; d++) {
    for (const r of restaurants) {
      const per = 1 + ((d + r.name.length) % 3);
      for (let k = 0; k < per; k++) {
        const pool = dishIndex[r._id.toString()];
        const picks = [pool[(d + k) % pool.length], pool[(d * 2 + k + 1) % pool.length]];
        const items = picks.map((p) => ({ menuItemId: p._id, name: p.name, price: p.price, quantity: 1 + ((d + k) % 2), image: p.image, notes: null }));
        const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
        const tax = Math.round(subtotal * 0.08 * 100) / 100;
        const total = Math.round((subtotal + tax) * 100) / 100;
        const at = new Date(Date.now() - d * 86400000 - k * 3600000 * 2);
        orderRows.push({
          orderNumber: 'ORD-' + crypto.randomBytes(3).toString('hex').toUpperCase(),
          customerId: r._id.equals(first._id) && k === 0 ? customer._id : new OID(), customerName: k === 0 && r._id.equals(first._id) ? 'Alex Thompson' : GUESTS[(d + k) % GUESTS.length],
          restaurantId: r._id, restaurantName: r.name, restaurantImage: r.images[0], items, subtotal, discount: 0, deliveryFee: 0, tax, tip: 0, total,
          orderType: 'pickup', paymentMethod: 'card', paymentStatus: 'paid', cardLast4: '4242', status: 'delivered', reviewed: false,
          statusHistory: [{ status: 'placed', time: at, note: 'Order placed' }, { status: 'delivered', time: new Date(at.getTime() + 2400000), note: '' }],
          createdAt: at, updatedAt: at,
        });
      }
    }
  }
  await Order.collection.insertMany(orderRows);

  // Upcoming reservation for the demo customer
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const t1: any = await Table.findOne({ restaurantId: first._id, capacity: 4 });
  await Reservation.create({
    customerId: customer._id, customerName: 'Alex Thompson', restaurantId: first._id, restaurantName: first.name, restaurantImage: first.images[0],
    tableId: t1?._id, tableNumber: t1?.tableNumber, date: new Date(`${tomorrow}T00:00:00.000Z`), time: '19:30', guests: 4, status: 'confirmed',
    bookingRef: 'TN-DEMO01', specialRequests: 'Anniversary dinner — window seat if possible.',
  });
  await Notification.create({ userId: customer._id, title: 'Welcome to TableNest', message: 'Explore restaurants near you and book your first table.', type: 'system', link: '/restaurants' });
  void Payment;

  console.log(`✓ ${SPECS.length} restaurants, ${orderRows.length} orders`);
  console.log('\nDemo accounts:');
  console.log('  Customer  customer@tablenest.com / customer123');
  console.log('  Owner     owner@tablenest.com / owner123   (L\'Artiste de la Cuisine)');
  console.log('  Other owners: owner.sakura@… owner.bella@… owner.spice@… owner.ember@… owner.green@… owner.taco@… owner.kigali@tablenest.com / owner123');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
