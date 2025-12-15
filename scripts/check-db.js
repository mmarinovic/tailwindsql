const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dbPath = path.join(process.cwd(), 'tailwindsql.db');

if (!fs.existsSync(dbPath)) {
  console.log('📦 Database not found, creating and seeding...');
  try {
    execSync('npm run seed', { stdio: 'inherit' });
    console.log('✅ Database created successfully!');
  } catch (error) {
    console.error('❌ Failed to create database:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ Database exists, skipping seed.');
}
