/**
 * TailwindSQL Database Seeder
 * 
 * Creates and populates the SQLite database with 1000 records per table.
 * Run with: npm run seed
 */

import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'tailwindsql.db');
const db = new Database(dbPath);

console.log('🎨 TailwindSQL Database Seeder');
console.log('================================\n');

// Enable WAL mode
db.pragma('journal_mode = WAL');

// Drop existing tables
console.log('🗑️  Dropping existing tables...');
db.exec(`
  DROP TABLE IF EXISTS posts;
  DROP TABLE IF EXISTS products;
  DROP TABLE IF EXISTS users;
`);

// Create tables
console.log('📦 Creating tables...');

db.exec(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    avatar TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    stock INTEGER DEFAULT 0,
    rating REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    author_id INTEGER,
    likes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    published INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
  );
`);

// Data generators
const firstNames = [
  'Ada', 'Alan', 'Grace', 'Linus', 'Margaret', 'Dennis', 'Bjarne', 'Guido', 
  'Brendan', 'Ryan', 'James', 'Ken', 'Brian', 'Tim', 'Vint', 'Donald',
  'Barbara', 'Frances', 'Jean', 'Radia', 'Sophie', 'Shafi', 'Fei-Fei',
  'John', 'Steve', 'Bill', 'Elon', 'Jeff', 'Mark', 'Larry', 'Sergey',
  'Satya', 'Sundar', 'Jensen', 'Lisa', 'Susan', 'Marissa', 'Sheryl', 'Ginni'
];

const lastNames = [
  'Lovelace', 'Turing', 'Hopper', 'Torvalds', 'Hamilton', 'Ritchie', 'Stroustrup',
  'van Rossum', 'Eich', 'Dahl', 'Gosling', 'Thompson', 'Kernighan', 'Berners-Lee',
  'Cerf', 'Knuth', 'Liskov', 'Allen', 'Bartik', 'Perlman', 'Wilson', 'Goldwasser',
  'Li', 'McCarthy', 'Wozniak', 'Gates', 'Musk', 'Bezos', 'Zuckerberg', 'Page',
  'Brin', 'Nadella', 'Pichai', 'Huang', 'Su', 'Wojcicki', 'Mayer', 'Sandberg', 'Rometty'
];

const roles = ['admin', 'developer', 'designer', 'manager', 'analyst', 'engineer', 'lead', 'intern'];
const statuses = ['active', 'inactive', 'pending', 'verified'];
const avatars = ['👨‍💻', '👩‍💻', '🧑‍💻', '👨‍🔬', '👩‍🔬', '🧑‍🔬', '👨‍🚀', '👩‍🚀', '🐧', '🐍', '☕', '💎', '🦀', '🔷', '💚'];

const productAdjectives = ['Premium', 'Ultra', 'Pro', 'Elite', 'Essential', 'Classic', 'Modern', 'Smart', 'Wireless', 'Ergonomic'];
const productNouns = ['Keyboard', 'Monitor', 'Mouse', 'Headphones', 'Webcam', 'Microphone', 'Desk', 'Chair', 'Lamp', 'Hub', 'Cable', 'Stand', 'Dock', 'Speaker', 'Tablet'];
const productDescriptions = [
  'High-quality build with premium materials',
  'Perfect for professionals and enthusiasts',
  'Award-winning design and performance',
  'Industry-leading technology',
  'Sleek and modern aesthetic',
  'Built for comfort and productivity',
  'Next-generation features',
  'Eco-friendly and sustainable'
];
const categories = ['electronics', 'furniture', 'accessories', 'audio', 'lighting', 'peripherals', 'storage', 'networking'];

const postTitles = [
  'Why {} is the Future of {}',
  'Getting Started with {}',
  '10 Tips for Better {}',
  'The Complete Guide to {}',
  'How I Built {} with {}',
  'Understanding {} in {}',
  '{} vs {}: Which is Better?',
  'Mastering {} for Beginners',
  'Advanced {} Techniques',
  'The State of {} in 2024'
];

const techTerms = [
  'React', 'TypeScript', 'Rust', 'Go', 'Python', 'JavaScript', 'SQL', 'GraphQL',
  'Docker', 'Kubernetes', 'AWS', 'Machine Learning', 'AI', 'Web Development',
  'Cloud Computing', 'DevOps', 'Microservices', 'REST APIs', 'WebAssembly', 'Edge Computing'
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

// Seed users (1000 records)
console.log('👥 Seeding 1000 users...');
const insertUser = db.prepare(`
  INSERT INTO users (name, email, role, avatar, status) VALUES (?, ?, ?, ?, ?)
`);

const usedEmails = new Set<string>();
const insertUsers = db.transaction(() => {
  for (let i = 0; i < 1000; i++) {
    const firstName = randomFrom(firstNames);
    const lastName = randomFrom(lastNames);
    const name = `${firstName} ${lastName}`;
    
    // Generate unique email
    let email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
    while (usedEmails.has(email)) {
      email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}${randomInt(1, 999)}@example.com`;
    }
    usedEmails.add(email);
    
    const role = randomFrom(roles);
    const avatar = randomFrom(avatars);
    const status = randomFrom(statuses);
    
    insertUser.run(name, email, role, avatar, status);
  }
});
insertUsers();

// Seed products (1000 records)
console.log('🛍️  Seeding 1000 products...');
const insertProduct = db.prepare(`
  INSERT INTO products (title, description, price, category, stock, rating) VALUES (?, ?, ?, ?, ?, ?)
`);

const insertProducts = db.transaction(() => {
  for (let i = 0; i < 1000; i++) {
    const adj = randomFrom(productAdjectives);
    const noun = randomFrom(productNouns);
    const title = `${adj} ${noun} ${i + 1}`;
    const description = randomFrom(productDescriptions);
    const price = randomFloat(9.99, 999.99);
    const category = randomFrom(categories);
    const stock = randomInt(0, 500);
    const rating = randomFloat(1, 5, 1);
    
    insertProduct.run(title, description, price, category, stock, rating);
  }
});
insertProducts();

// Seed posts (1000 records)
console.log('📝 Seeding 1000 posts...');
const insertPost = db.prepare(`
  INSERT INTO posts (title, content, author_id, likes, views, published) VALUES (?, ?, ?, ?, ?, ?)
`);

const insertPosts = db.transaction(() => {
  for (let i = 0; i < 1000; i++) {
    const titleTemplate = randomFrom(postTitles);
    const term1 = randomFrom(techTerms);
    const term2 = randomFrom(techTerms);
    const title = titleTemplate.replace('{}', term1).replace('{}', term2);
    
    const content = `This is an in-depth article about ${term1} and its applications in modern software development. We'll explore best practices, common pitfalls, and advanced techniques.`;
    const authorId = randomInt(1, 1000);
    const likes = randomInt(0, 10000);
    const views = likes + randomInt(100, 50000);
    const published = Math.random() > 0.2 ? 1 : 0; // 80% published
    
    insertPost.run(title, content, authorId, likes, views, published);
  }
});
insertPosts();

// Print summary
console.log('\n✅ Database seeded successfully!\n');

const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
const postCount = db.prepare('SELECT COUNT(*) as count FROM posts').get() as { count: number };

console.log(`📊 Summary:`);
console.log(`   - Users: ${userCount.count}`);
console.log(`   - Products: ${productCount.count}`);
console.log(`   - Posts: ${postCount.count}`);
console.log(`\n🚀 Ready to query with TailwindSQL!\n`);

db.close();
