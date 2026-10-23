import logging
from sqlalchemy import text
from app.core.database import engine

logger = logging.getLogger("askdb.sample_data")

def seed_sample_database():
    """
    Creates and seeds realistic business analytics data (regions, customers, products, orders, sales)
    in the database if they do not already exist.
    """
    try:
        with engine.begin() as conn:
            # Check if regions table already exists
            inspector_table_names = conn.execute(
                text("SELECT name FROM sqlite_master WHERE type='table' AND name='regions';")
            ).fetchall()
            
            # For postgres or sqlite
            has_regions = len(inspector_table_names) > 0

            if not has_regions:
                logger.info("Seeding AskDB Enterprise Sample Database tables...")

                # 1. Regions
                conn.execute(text("""
                CREATE TABLE IF NOT EXISTS regions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name VARCHAR(100) NOT NULL,
                    manager VARCHAR(100) NOT NULL
                );
                """))

                # 2. Customers
                conn.execute(text("""
                CREATE TABLE IF NOT EXISTS customers (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name VARCHAR(150) NOT NULL,
                    email VARCHAR(150) NOT NULL,
                    region_id INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (region_id) REFERENCES regions (id)
                );
                """))

                # 3. Products
                conn.execute(text("""
                CREATE TABLE IF NOT EXISTS products (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name VARCHAR(150) NOT NULL,
                    price DECIMAL(10,2) NOT NULL,
                    category VARCHAR(100) NOT NULL
                );
                """))

                # 4. Orders
                conn.execute(text("""
                CREATE TABLE IF NOT EXISTS orders (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    customer_id INTEGER NOT NULL,
                    total_amount DECIMAL(10,2) NOT NULL,
                    order_date DATE NOT NULL,
                    FOREIGN KEY (customer_id) REFERENCES customers (id)
                );
                """))

                # 5. Sales
                conn.execute(text("""
                CREATE TABLE IF NOT EXISTS sales (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    order_id INTEGER NOT NULL,
                    product_id INTEGER NOT NULL,
                    quantity INTEGER NOT NULL,
                    amount DECIMAL(10,2) NOT NULL,
                    FOREIGN KEY (order_id) REFERENCES orders (id),
                    FOREIGN KEY (product_id) REFERENCES products (id)
                );
                """))

                # Insert Regions
                conn.execute(text("""
                INSERT INTO regions (id, name, manager) VALUES
                (1, 'North America', 'Sarah Connor'),
                (2, 'Europe', 'Alexander Wright'),
                (3, 'Asia-Pacific', 'Li Wei'),
                (4, 'Gujarat', 'Rajesh Patel'),
                (5, 'Maharashtra', 'Pooja Sharma'),
                (6, 'Karnataka', 'Amit Shah');
                """))

                # Insert Customers
                conn.execute(text("""
                INSERT INTO customers (id, name, email, region_id, created_at) VALUES
                (1, 'Acme Innovations', 'contact@acme.com', 1, '2024-01-10 10:00:00'),
                (2, 'Global Logistics Corp', 'info@globallogistics.com', 2, '2024-01-12 11:30:00'),
                (3, 'Nexus Enterprise Tech', 'admin@nexus.io', 1, '2024-01-15 09:15:00'),
                (4, 'Gujarat Petrochem Ltd', 'supply@gujchem.in', 4, '2024-01-20 14:00:00'),
                (5, 'Ahmedabad Textile Hub', 'orders@ahmedabadtextiles.com', 4, '2024-01-22 16:45:00'),
                (6, 'Mumbai Financial Services', 'billing@mumbaifinance.in', 5, '2024-02-01 10:20:00'),
                (7, 'Bengaluru Cloud Labs', 'cloud@bengalurulabs.tech', 6, '2024-02-05 13:10:00'),
                (8, 'Zenith Healthcare', 'support@zenithhealth.org', 2, '2024-02-10 15:30:00'),
                (9, 'Apex Retailers', 'procurement@apexretail.com', 3, '2024-02-14 08:45:00'),
                (10, 'Quantum AI Systems', 'hello@quantumai.com', 1, '2024-02-18 17:00:00'),
                (11, 'Surat Diamond Exports', 'trades@suratdiamonds.in', 4, '2024-02-22 11:00:00'),
                (12, 'Pune Auto Components', 'ops@puneauto.co.in', 5, '2024-03-01 12:30:00'),
                (13, 'Tokyo Robotics Ltd', 'sales@tokyorobotics.jp', 3, '2024-03-05 14:20:00'),
                (14, 'Nordic Green Energy', 'contact@nordicgreen.se', 2, '2024-03-10 09:00:00'),
                (15, 'Vadodara Engineering Works', 'info@vadodaraeng.in', 4, '2024-03-15 16:15:00');
                """))

                # Insert Products
                conn.execute(text("""
                INSERT INTO products (id, name, price, category) VALUES
                (1, 'Enterprise Cloud License', 1200.00, 'Software'),
                (2, 'AI Analytics Suite Pro', 2499.00, 'Software'),
                (3, 'Ultra-Performance Server Rack', 5500.00, 'Hardware'),
                (4, 'Smart IoT Gateway', 350.00, 'Electronics'),
                (5, 'Ergonomic Developer Desk', 450.00, 'Office Supplies'),
                (6, '4K Ultra-Wide Monitor', 650.00, 'Electronics'),
                (7, 'Database Security Audit Module', 899.00, 'Software'),
                (8, 'Industrial Sensors Pack', 750.00, 'Electronics'),
                (9, 'Automated Backup Appliance', 1800.00, 'Hardware'),
                (10, 'Annual Technical Support Plan', 1500.00, 'Services');
                """))

                # Insert Orders
                conn.execute(text("""
                INSERT INTO orders (id, customer_id, total_amount, order_date) VALUES
                (1, 1, 4899.00, '2024-01-15'),
                (2, 2, 7300.00, '2024-01-18'),
                (3, 4, 3500.00, '2024-01-25'),
                (4, 5, 2400.00, '2024-02-02'),
                (5, 3, 11000.00, '2024-02-10'),
                (6, 6, 8250.00, '2024-02-14'),
                (7, 7, 6398.00, '2024-02-20'),
                (8, 4, 4500.00, '2024-02-28'),
                (9, 8, 3600.00, '2024-03-05'),
                (10, 10, 12500.00, '2024-03-12'),
                (11, 11, 5800.00, '2024-03-18'),
                (12, 12, 4200.00, '2024-03-22'),
                (13, 1, 3600.00, '2024-04-05'),
                (14, 13, 9800.00, '2024-04-12'),
                (15, 14, 5500.00, '2024-04-18'),
                (16, 5, 3100.00, '2024-04-25'),
                (17, 7, 7200.00, '2024-05-02'),
                (18, 9, 4150.00, '2024-05-10'),
                (19, 15, 6200.00, '2024-05-18'),
                (20, 4, 5100.00, '2024-05-25');
                """))

                # Insert Sales line items
                conn.execute(text("""
                INSERT INTO sales (id, order_id, product_id, quantity, amount) VALUES
                (1, 1, 1, 2, 2400.00),
                (2, 1, 2, 1, 2499.00),
                (3, 2, 3, 1, 5500.00),
                (4, 2, 9, 1, 1800.00),
                (5, 3, 8, 4, 3000.00),
                (6, 3, 4, 1, 350.00),
                (7, 4, 6, 3, 1950.00),
                (8, 4, 5, 1, 450.00),
                (9, 5, 3, 2, 11000.00),
                (10, 6, 2, 3, 7497.00),
                (11, 6, 4, 2, 700.00),
                (12, 7, 1, 4, 4800.00),
                (13, 7, 10, 1, 1500.00),
                (14, 8, 8, 6, 4500.00),
                (15, 9, 1, 3, 3600.00),
                (16, 10, 2, 5, 12495.00),
                (17, 11, 7, 6, 5394.00),
                (18, 12, 6, 6, 3900.00),
                (19, 13, 1, 3, 3600.00),
                (20, 14, 3, 1, 5500.00),
                (21, 14, 8, 5, 3750.00),
                (22, 15, 3, 1, 5500.00),
                (23, 16, 4, 8, 2800.00),
                (24, 17, 2, 2, 4998.00),
                (25, 17, 1, 1, 1200.00),
                (26, 18, 6, 6, 3900.00),
                (27, 19, 3, 1, 5500.00),
                (28, 20, 8, 6, 4500.00);
                """))

                logger.info("Sample business analytics tables successfully created and seeded!")
            else:
                logger.info("Sample database tables already exist.")
        
        # Seed default user accounts for seamless login
        seed_default_users()
    except Exception as e:
        logger.error(f"Error seeding sample database: {e}")

def seed_default_users():
    """Seeds default demo accounts if they don't already exist"""
    try:
        from app.core.database import SessionLocal
        from app.models.user import User
        from app.core.security import get_password_hash

        with SessionLocal() as db:
            default_accounts = [
                ("Admin User", "admin@askdb.ai", "admin123"),
                ("Demo Analyst", "demo@askdb.ai", "password123"),
                ("Test User", "test@gmail.com", "123456"),
            ]
            for name, email, pwd in default_accounts:
                existing = db.query(User).filter(User.email == email).first()
                if not existing:
                    db_user = User(
                        name=name,
                        email=email,
                        hashed_password=get_password_hash(pwd)
                    )
                    db.add(db_user)
                    logger.info(f"Seeded default user account: {email}")
                else:
                    existing.hashed_password = get_password_hash(pwd)
            db.commit()
    except Exception as e:
        logger.error(f"Error seeding default users: {e}")

