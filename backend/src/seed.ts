import 'reflect-metadata';
import * as mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tablenest';

// Minimal schemas for seeding
const UserSchema = new mongoose.Schema({ fullName: String, email: String, password: String, role: String, isActive: { type: Boolean, default: true }, restaurantId: mongoose.Types.ObjectId, activePlan: String, notificationPrefs: Object }, { timestamps: true });
const RestaurantSchema = new mongoose.Schema({ name: String, ownerId: mongoose.Types.ObjectId, cuisineType: String, description: String, address: String, city: String, country: String, phone: String, status: { type: String, default: 'active' }, rating: Number, totalReviews: Number, seatingCapacity: Number, priceRange: String, dineIn: Boolean, delivery: Boolean, images: [String] }, { timestamps: true });
const MenuCategorySchema = new mongoose.Schema({ restaurantId: mongoose.Types.ObjectId, name: String, sortOrder: Number }, { timestamps: true });
const MenuItemSchema = new mongoose.Schema({ restaurantId: mongoose.Types.ObjectId, categoryId: mongoose.Types.ObjectId, name: String, description: String, price: Number, image: String, isAvailable: { type: Boolean, default: true } }, { timestamps: true });
const TableSchema = new mongoose.Schema({ restaurantId: mongoose.Types.ObjectId, tableNumber: String, capacity: Number, status: { type: String, default: 'available' } }, { timestamps: true });
const OrderSchema = new mongoose.Schema({ customerId: mongoose.Types.ObjectId, restaurantId: mongoose.Types.ObjectId, restaurantName: String, items: Array, total: Number, status: { type: String, default: 'delivered' }, createdAt: Date }, { timestamps: true });
const ReservationSchema = new mongoose.Schema({ customerId: mongoose.Types.ObjectId, restaurantId: mongoose.Types.ObjectId, restaurantName: String, tableId: mongoose.Types.ObjectId, date: Date, time: String, guests: Number, status: { type: String, default: 'confirmed' }, bookingRef: String }, { timestamps: true });
const NotificationSchema = new mongoose.Schema({ userId: mongoose.Types.ObjectId, title: String, message: String, type: String, isRead: { type: Boolean, default: false } }, { timestamps: true });
const LoyaltySchema = new mongoose.Schema({ userId: mongoose.Types.ObjectId, points: Number, transactions: Array }, { timestamps: true });
const ReferralSchema = new mongoose.Schema({ userId: mongoose.Types.ObjectId, code: String, referrals: Array, totalEarned: Number }, { timestamps: true });
const ReviewSchema = new mongoose.Schema({ customerId: mongoose.Types.ObjectId, restaurantId: mongoose.Types.ObjectId, rating: Number, comment: String, customerName: String }, { timestamps: true });
const SupportSchema = new mongoose.Schema({ userId: mongoose.Types.ObjectId, subject: String, description: String, type: String, status: { type: String, default: 'open' }, priority: String, userName: String, ticketId: String }, { timestamps: true });

async function seed() {
    console.log('Seeding TableNest database...');
    await mongoose.connect(MONGODB_URI);

    const User = mongoose.model('User', UserSchema);
    const Restaurant = mongoose.model('Restaurant', RestaurantSchema);
    const MenuCategory = mongoose.model('MenuCategory', MenuCategorySchema);
    const MenuItem = mongoose.model('MenuItem', MenuItemSchema);
    const Table = mongoose.model('Table', TableSchema);
    const Order = mongoose.model('Order', OrderSchema);
    const Reservation = mongoose.model('Reservation', ReservationSchema);
    const Notification = mongoose.model('Notification', NotificationSchema);
    const Loyalty = mongoose.model('Loyalty', LoyaltySchema);
    const Referral = mongoose.model('Referral', ReferralSchema);
    const Review = mongoose.model('Review', ReviewSchema);
    const Support = mongoose.model('SupportTicket', SupportSchema);

    // Clear existing data
    await Promise.all([
        User.deleteMany({}), Restaurant.deleteMany({}), MenuCategory.deleteMany({}),
        MenuItem.deleteMany({}), Table.deleteMany({}), Order.deleteMany({}),
        Reservation.deleteMany({}), Notification.deleteMany({}), Loyalty.deleteMany({}),
        Referral.deleteMany({}), Review.deleteMany({}), Support.deleteMany({}),
    ]);
    console.log('✓ Cleared existing data');

    const ownerPw = await bcrypt.hash('owner123', 12);
    const custPw = await bcrypt.hash('customer123', 12);

    // Create users;
    const owner = await User.create({ fullName: 'Alex Rivera', email: 'owner@tablenest.com', password: ownerPw, role: 'owner', activePlan: 'Business' });
    const customer = await User.create({ fullName: 'Alex Thompson', email: 'customer@tablenest.com', password: custPw, role: 'customer', activePlan: 'Gourmet Pro' });
    console.log('✓ Users created');

    // Create restaurant
    const restaurant = await Restaurant.create({
        name: "L'Artiste de la Cuisine", ownerId: owner._id, cuisineType: 'Modern French',
        description: 'Fine French cuisine with a modern twist. Award-winning chef and sommelier.',
        address: '23 Culinary Way, Arts District', city: 'New York', country: 'US',
        phone: '+1 (555) 000-1234', status: 'active', rating: 4.8, totalReviews: 1284,
        seatingCapacity: 80, priceRange: '$$$$', dineIn: true, delivery: false,
        images: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80'],
    });
    await User.findByIdAndUpdate(owner._id, { restaurantId: restaurant._id });
    console.log('✓ Restaurant created');

    // Menu categories
    const cats = await MenuCategory.insertMany([
        { restaurantId: restaurant._id, name: 'Appetizers', sortOrder: 1 },
        { restaurantId: restaurant._id, name: 'Main Courses', sortOrder: 2 },
        { restaurantId: restaurant._id, name: 'Desserts', sortOrder: 3 },
        { restaurantId: restaurant._id, name: 'Drinks', sortOrder: 4 },
    ]);

    // Menu items
    await MenuItem.insertMany([
        { restaurantId: restaurant._id, categoryId: cats[0]._id, name: 'Truffle Escargot', price: 32, description: 'Burgundy snails with black truffle garlic butter, herb breadcrumbs', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80', isAvailable: true },
        { restaurantId: restaurant._id, categoryId: cats[0]._id, name: 'Seared Scallops', price: 38, description: 'Pan-seared scallops, cauliflower purée, crispy pancetta, micro herbs', image: 'https://images.unsplash.com/photo-1560717845-968823efbee1?w=400&q=80', isAvailable: true },
        { restaurantId: restaurant._id, categoryId: cats[1]._id, name: 'Duck Confit', price: 52, description: 'Slow-cooked duck leg, cherry reduction, pomme dauphinoise', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80', isAvailable: true },
        { restaurantId: restaurant._id, categoryId: cats[1]._id, name: 'Wagyu Beef Burger', price: 64, description: 'A5 Wagyu patty, truffle mayo, aged gruyère, brioche bun', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80', isAvailable: true },
        { restaurantId: restaurant._id, categoryId: cats[1]._id, name: 'Truffle Linguine', price: 44, description: 'Hand-crafted pasta with shaved black truffle, parmesan cream', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80', isAvailable: true },
        { restaurantId: restaurant._id, categoryId: cats[2]._id, name: 'Crème Brûlée', price: 18, description: 'Classic vanilla bean custard with caramelized sugar crust', image: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400&q=80', isAvailable: true },
        { restaurantId: restaurant._id, categoryId: cats[3]._id, name: 'Bordeaux Reserve', price: 42, description: 'Selected 2018 Château Margaux, 750ml', image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80', isAvailable: true },
    ]);
    console.log('✓ Menu created');

    // Tables
    const tables: any[] = [];
    for (let i = 1; i <= 12; i++) {
        const t = await Table.create({
            restaurantId: restaurant._id, tableNumber: String(i).padStart(2, '0'),
            capacity: i % 3 === 0 ? 6 : i % 2 === 0 ? 2 : 4,
            status: i === 6 ? 'occupied' : i === 2 || i === 9 ? 'reserved' : i === 5 ? 'blocked' : 'available',
        });
        tables.push(t);
    }
    console.log('✓ Tables created');

    // Orders
    const now = new Date();
    await Order.insertMany([
        { customerId: customer._id, restaurantId: restaurant._id, restaurantName: "L'Osteria di Roma", items: [{ name: 'Truffle Fettuccine', price: 28, quantity: 2 }, { name: 'Tiramisu', price: 12, quantity: 1 }], total: 124.50, status: 'delivered', createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) },
        { customerId: customer._id, restaurantId: restaurant._id, restaurantName: 'Sakura Sushi & Grill', items: [{ name: "Chef's Selection Platter", price: 65, quantity: 1 }, { name: 'Miso Soup', price: 8, quantity: 2 }], total: 88.20, status: 'placed', createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) },
        { customerId: customer._id, restaurantId: restaurant._id, restaurantName: 'The Burger Collective', items: [{ name: 'Signature BBQ Burger', price: 18, quantity: 3 }, { name: 'Truffle Fries', price: 5, quantity: 2 }], total: 64.00, status: 'cancelled', createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000) },
    ]);
    console.log('✓ Orders created');

    // Reservations
    await Reservation.insertMany([
        { customerId: customer._id, restaurantId: restaurant._id, restaurantName: "L'Art Culinaire", tableId: tables[0]._id, date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), time: '19:30', guests: 4, status: 'confirmed', bookingRef: 'TN-7729-1X' },
        { customerId: customer._id, restaurantId: restaurant._id, restaurantName: "Lumière Brasserie", tableId: tables[1]._id, date: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000), time: '20:00', guests: 2, status: 'pending', bookingRef: 'TN-7730-2X' },
        { customerId: customer._id, restaurantId: restaurant._id, restaurantName: 'Bistro No. 9', tableId: tables[2]._id, date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), time: '19:00', guests: 3, status: 'completed', bookingRef: 'TN-7728-3X' },
    ]);
    console.log('✓ Reservations created');

    // Notifications
    await Notification.insertMany([
        { userId: customer._id, title: 'Order Out for Delivery', message: "Your order #TN-8829 from 'The Golden Fork' is on its way. Estimated arrival in 15 minutes.", type: 'order', isRead: false },
        { userId: customer._id, title: 'Booking Confirmed', message: "Your reservation for 4 at 'Lumière Brasserie' tonight at 8:30 PM is locked in.", type: 'booking', isRead: false },
        { userId: customer._id, title: 'Weekend Brunch Special', message: 'Get 20% off your next brunch booking. Valid this Saturday and Sunday only!', type: 'promotion', isRead: true },
    ]);
    console.log('✓ Notifications created');

    // Loyalty & Referral
    await Loyalty.create({ userId: customer._id, points: 9000, transactions: [{ type: 'earn', points: 500, description: 'Referral Reward', date: new Date() }, { type: 'earn', points: 200, description: 'Dining reward', date: new Date() }] });
    await Referral.create({
        userId: customer._id, code: 'NEST-GOLD-2024', totalEarned: 1500, referrals: [
            { name: 'Alex Sterling', email: 'alex.s@email.com', status: 'successful', reward: 500, invitedAt: new Date('2023-10-24') },
            { name: 'Maria Lopez', email: 'm.lopez@email.com', status: 'pending', reward: 0, invitedAt: new Date('2023-11-02') },
            { name: 'James Hunter', email: 'j.hunter@email.com', status: 'successful', reward: 500, invitedAt: new Date('2023-11-15') },
        ]
    });
    console.log('✓ Loyalty & Referrals created');

    // Reviews
    await Review.insertMany([
        { customerId: customer._id, restaurantId: restaurant._id, rating: 5, comment: 'The seasonal tasting menu was absolutely phenomenal. Exceptional service from Maria!', customerName: 'Emily Lawson' },
        { customerId: customer._id, restaurantId: restaurant._id, rating: 4, comment: 'Great atmosphere and wine selection. Duck confit was a bit salty, but overall a lovely night.', customerName: 'Marcus Brown' },
    ]);
    console.log('✓ Reviews created');

    // Support tickets
    await Support.insertMany([
        { userId: customer._id, userName: 'Julian Schmidt', subject: 'Payment gateway timeout', description: 'Integration error during checkout process when using Visa card', type: 'technical', status: 'open', priority: 'high', ticketId: '#TK-89421' },
        { userId: customer._id, userName: 'Elena Watson', subject: 'Missing item in Order #8821', description: 'Truffle pasta was not delivered with my order', type: 'order', status: 'in_progress', priority: 'medium', ticketId: '#TK-89418' },
        { userId: customer._id, userName: 'Marco Lucca', subject: 'Reservation rescheduling', description: 'Need to move from 7pm to 8:30pm same day', type: 'booking', status: 'resolved', priority: 'low', ticketId: '#TK-89399' },
    ]);
    console.log('✓ Support tickets created');

    console.log('\nDatabase seeded successfully!\n');
    console.log('Demo Accounts:');
    console.log('  Super Admin:  admin@tablenest.com     / admin123');
    console.log('  Owner:        owner@tablenest.com     / owner123');
    console.log('  Customer:     customer@tablenest.com  / customer123');

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });