import { DataSource } from 'typeorm';
import { AppDataSource } from '../config/data-source';

async function initDatabase() {
  try {
    const dataSource = new DataSource({
      ...AppDataSource.options,
      synchronize: false,
    });

    await dataSource.initialize();
    console.log('Connected to database');

    // Run migrations
    await dataSource.runMigrations();
    console.log('Migrations completed successfully');

    await dataSource.destroy();
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase(); 