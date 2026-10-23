import os
import sys
import random
from datetime import datetime, timedelta

# Product categories and brands
CATEGORIES = {
    "Electronics": {
        "brands": ["Sony", "Samsung", "Apple", "Dell", "Logitech", "Bose", "Asus", "Lenovo", "HP", "JBL"],
        "items": [
            ("Wireless Noise-Canceling Headphones", 149.99, 299.99),
            ("Ultra-Wide 4K Gaming Monitor", 299.99, 599.99),
            ("Mechanical Ergonomic Keyboard", 69.99, 149.99),
            ("Precision Wireless Mouse", 39.99, 89.99),
            ("Smartphone Flagship Edition", 499.99, 999.99),
            ("Pro Laptop 15-inch", 799.99, 1499.99),
            ("Bluetooth Portable Speaker", 45.00, 119.99),
            ("Smartwatch with Heart-Rate Sensor", 120.00, 249.99),
            ("External High-Speed SSD 1TB", 75.00, 159.99),
            ("HD Streaming Webcam 1080p", 40.00, 89.99),
            ("USB-C Fast Charging Hub", 25.00, 59.99),
            ("Wireless Charging Pad Trio", 29.99, 69.99)
        ]
    },
    "Home & Kitchen": {
        "brands": ["Philips", "Ninja", "Dyson", "KitchenAid", "Breville", "Instant Pot", "Cuisinart", "DeLonghi"],
        "items": [
            ("Digital Air Fryer XL", 79.99, 169.99),
            ("Espresso Machine with Milk Frother", 199.99, 449.99),
            ("Smart Robot Vacuum Cleaner", 180.00, 399.99),
            ("High-Performance Blender", 60.00, 139.99),
            ("Multi-Cooker Pressure Pot 8-in-1", 69.99, 129.99),
            ("Cordless Stick Vacuum Cleaner", 140.00, 299.99),
            ("Stainless Steel Cookware Set 10-pc", 110.00, 249.99),
            ("Smart Temperature Control Kettle", 39.99, 79.99),
            ("HEPA Air Purifier for Large Rooms", 89.99, 189.99),
            ("Digital Food Dehydrator", 49.99, 99.99)
        ]
    },
    "Sports & Fitness": {
        "brands": ["Nike", "Adidas", "Under Armour", "Puma", "Garmin", "Bowflex", "Reebok"],
        "items": [
            ("Adjustable Quick-Select Dumbbells", 150.00, 329.99),
            ("Non-Slip Pro Yoga Mat 6mm", 20.00, 55.00),
            ("Foldable Cardio Treadmill", 450.00, 899.99),
            ("GPS Running & Training Watch", 130.00, 279.99),
            ("Heavy-Duty Resistance Band Set", 15.00, 39.99),
            ("High-Speed Jump Rope with Ball Bearings", 9.99, 24.99),
            ("Stainless Steel Insulated Water Bottle 32oz", 12.50, 34.99),
            ("Foam Roller for Muscle Recovery", 14.00, 29.99),
            ("Cross-Training Running Shoes", 55.00, 129.99)
        ]
    },
    "Office & Furniture": {
        "brands": ["Herman Miller", "Steelcase", "IKEA", "FlexiSpot", "Autonomous", "Ergotron"],
        "items": [
            ("Ergonomic Mesh Office Chair", 160.00, 349.99),
            ("Dual-Motor Electric Standing Desk", 240.00, 499.99),
            ("Heavy-Duty Dual Monitor Arm", 35.00, 89.99),
            ("Under-Desk Walking Pad", 180.00, 349.99),
            ("Anti-Fatigue Standing Desk Mat", 25.00, 59.99),
            ("LED Desk Lamp with Wireless Charger", 28.00, 65.00),
            ("Leather Executive Desk Pad", 15.00, 38.00)
        ]
    },
    "Fashion & Apparel": {
        "brands": ["Levi's", "Zara", "Tommy Hilfiger", "Calvin Klein", "Patagonia", "Columbia"],
        "items": [
            ("Slim Fit Stretch Denim Jeans", 30.00, 79.99),
            ("Weatherproof Thermal Puffer Jacket", 65.00, 159.99),
            ("Classic Cotton Crewneck T-Shirt 3-Pack", 18.00, 45.00),
            ("Waterproof Hiking Boots", 60.00, 139.99),
            ("Merino Wool Winter Sweater", 40.00, 95.00),
            ("Polarized UV400 Sunglasses", 22.00, 59.99)
        ]
    }
}

REGIONS = ["North America", "Europe", "Asia-Pacific", "Gujarat", "Maharashtra", "Karnataka"]

def generate_records(num_products=500, num_sales=500):
    products = []
    category_names = list(CATEGORIES.keys())
    
    sku_counter = 1000
    for i in range(1, num_products + 1):
        cat_name = category_names[i % len(category_names)]
        cat_data = CATEGORIES[cat_name]
        brand = random.choice(cat_data["brands"])
        item_template = random.choice(cat_data["items"])
        
        base_name, min_price, max_price = item_template
        price = round(random.uniform(min_price, max_price), 2)
        cost_price = round(price * random.uniform(0.45, 0.70), 2)
        stock = random.randint(0, 350)
        rating = round(random.uniform(3.2, 5.0), 1)
        
        sku = f"{cat_name[:4].upper()}-{sku_counter}"
        sku_counter += 1
        
        full_name = f"{brand} {base_name} (Model {random.choice(['X', 'Pro', 'Elite', 'Plus', 'Ultra'])}-{random.randint(100, 999)})"
        status = "In Stock" if stock > 20 else ("Low Stock" if stock > 0 else "Out of Stock")
        
        products.append({
            "id": i,
            "sku": sku,
            "name": full_name,
            "category": cat_name,
            "brand": brand,
            "price": price,
            "cost_price": cost_price,
            "stock_quantity": stock,
            "rating": rating,
            "status": status
        })

    # Generate sales records linked to products
    sales = []
    start_date = datetime(2024, 1, 1)
    
    for s_id in range(1, num_sales + 1):
        prod = random.choice(products)
        qty = random.randint(1, 8)
        sale_amount = round(prod["price"] * qty, 2)
        margin = round(sale_amount - (prod["cost_price"] * qty), 2)
        
        # Random date in 2024
        sale_date = start_date + timedelta(days=random.randint(0, 300))
        region = random.choice(REGIONS)
        channel = random.choice(["Online Store", "Retail Partner", "Enterprise Direct", "Amazon Storefront"])
        
        sales.append({
            "id": s_id,
            "product_id": prod["id"],
            "product_name": prod["name"],
            "category": prod["category"],
            "region": region,
            "sales_channel": channel,
            "quantity": qty,
            "unit_price": prod["price"],
            "total_amount": sale_amount,
            "profit_margin": margin,
            "sale_date": sale_date.strftime("%Y-%m-%d")
        })

    return products, sales

def create_sqlite_database(db_path, products, sales):
    import sqlite3
    if os.path.exists(db_path):
        os.remove(db_path)
        
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    cur.execute("""
    CREATE TABLE products (
        id INTEGER PRIMARY KEY,
        sku VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        brand VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        cost_price DECIMAL(10,2) NOT NULL,
        stock_quantity INTEGER NOT NULL,
        rating DECIMAL(3,1) NOT NULL,
        status VARCHAR(50) NOT NULL
    );
    """)

    cur.execute("""
    CREATE TABLE sales_transactions (
        id INTEGER PRIMARY KEY,
        product_id INTEGER NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        region VARCHAR(100) NOT NULL,
        sales_channel VARCHAR(100) NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        profit_margin DECIMAL(10,2) NOT NULL,
        sale_date DATE NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products(id)
    );
    """)

    cur.executemany("""
    INSERT INTO products (id, sku, name, category, brand, price, cost_price, stock_quantity, rating, status)
    VALUES (:id, :sku, :name, :category, :brand, :price, :cost_price, :stock_quantity, :rating, :status);
    """, products)

    cur.executemany("""
    INSERT INTO sales_transactions (id, product_id, product_name, category, region, sales_channel, quantity, unit_price, total_amount, profit_margin, sale_date)
    VALUES (:id, :product_id, :product_name, :category, :region, :sales_channel, :quantity, :unit_price, :total_amount, :profit_margin, :sale_date);
    """, sales)

    conn.commit()
    conn.close()

def generate_sql_dump(file_path, products, sales):
    with open(file_path, "w", encoding="utf-8") as f:
        f.write("-- ============================================================\n")
        f.write("-- AskDB Product & Sales Analytics Database (500+ Records)\n")
        f.write("-- Works on PostgreSQL and SQLite\n")
        f.write("-- ============================================================\n\n")

        f.write("DROP TABLE IF EXISTS sales_transactions CASCADE;\n")
        f.write("DROP TABLE IF EXISTS products CASCADE;\n\n")

        f.write("""CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER NOT NULL,
    rating DECIMAL(3,1) NOT NULL,
    status VARCHAR(50) NOT NULL
);\n\n""")

        f.write("""CREATE TABLE sales_transactions (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    sales_channel VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    profit_margin DECIMAL(10,2) NOT NULL,
    sale_date DATE NOT NULL
);\n\n""")

        f.write("-- Inserting Products...\n")
        for p in products:
            safe_name = p['name'].replace("'", "''")
            f.write(f"INSERT INTO products (id, sku, name, category, brand, price, cost_price, stock_quantity, rating, status) VALUES ({p['id']}, '{p['sku']}', '{safe_name}', '{p['category']}', '{p['brand']}', {p['price']}, {p['cost_price']}, {p['stock_quantity']}, {p['rating']}, '{p['status']}');\n")

        f.write("\n-- Inserting Sales Transactions...\n")
        for s in sales:
            safe_pname = s['product_name'].replace("'", "''")
            f.write(f"INSERT INTO sales_transactions (id, product_id, product_name, category, region, sales_channel, quantity, unit_price, total_amount, profit_margin, sale_date) VALUES ({s['id']}, {s['product_id']}, '{safe_pname}', '{s['category']}', '{s['region']}', '{s['sales_channel']}', {s['quantity']}, {s['unit_price']}, {s['total_amount']}, {s['profit_margin']}, '{s['sale_date']}');\n")

if __name__ == "__main__":
    if sys.platform == "win32":
        sys.stdout.reconfigure(encoding="utf-8")
        
    base_dir = os.path.dirname(os.path.abspath(__file__))
    sqlite_output = os.path.join(base_dir, "products_500.db")
    sql_output = os.path.join(base_dir, "products_500.sql")
    
    print("Generating 500 product records and 500 sales transaction records...")
    products, sales = generate_records(num_products=500, num_sales=500)
    
    create_sqlite_database(sqlite_output, products, sales)
    print(f"[SUCCESS] Created SQLite database: {sqlite_output} (500 products, 500 sales)")
    
    generate_sql_dump(sql_output, products, sales)
    print(f"[SUCCESS] Created SQL dump file: {sql_output}")

    # Also register this database in AskDB DataSource table so it immediately appears in the UI
    try:
        from app.core.database import SessionLocal
        from app.models.data_source import DataSource
        with SessionLocal() as db:
            existing = db.query(DataSource).filter(DataSource.name == "E-Commerce 500 Products DB").first()
            if not existing:
                new_ds = DataSource(
                    name="E-Commerce 500 Products DB",
                    db_type="SQLite",
                    connection_url=f"sqlite:///./products_500.db",
                    host="localhost",
                    port=0,
                    database_name="products_500.db",
                    username="local",
                    is_active=False
                )
                db.add(new_ds)
                db.commit()
                print("[SUCCESS] Registered 'E-Commerce 500 Products DB' in AskDB Data Sources.")
    except Exception as e:
        print(f"Note: DataSource registration: {e}")
