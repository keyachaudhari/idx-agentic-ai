# Uses Python + pandas to analyze monthly price trends in california_sold.
# Shows whether prices are going up, down, or flat in a given city.

import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.engine import URL
import os
from dotenv import load_dotenv

load_dotenv("../.env")

# Connect to MySQL using SQLAlchemy
connection_url = URL.create(
    drivername="mysql+mysqlconnector",
    username=os.getenv("MYSQL_USER"),
    password=os.getenv("MYSQL_PASSWORD"),
    host=os.getenv("MYSQL_HOST", "localhost"),
    port=int(os.getenv("MYSQL_PORT", "3306")),
    database=os.getenv("MYSQL_DATABASE", "idx_exchange"),
)

engine = create_engine(connection_url)

def get_price_trend(city: str, months: int = 24):
    """Get monthly average price trend for a city."""
    query = """
        SELECT
            DATE_FORMAT(CloseDate, '%Y-%m') AS month,
            COUNT(*) AS sales,
            ROUND(AVG(ClosePrice), 0) AS avg_price,
            ROUND(AVG(DaysOnMarket), 1) AS avg_dom
        FROM california_sold
        WHERE City = %s
            AND PropertyType = 'Residential'
            AND CloseDate >= DATE_SUB(CURDATE(), INTERVAL %s MONTH)
        GROUP BY DATE_FORMAT(CloseDate, '%Y-%m')
        ORDER BY month
    """
    print(f"Running query for {city}...")
    df = pd.read_sql(query, engine, params=(city, months))
    print(f"Query finished for {city}.")
    df["price_change_pct"] = df["avg_price"].pct_change() * 100
    return df

# Test it
cities = ["Irvine", "Pasadena"]
for city in cities:
    print(f"\n=== Price Trend: {city} ===")
    df = get_price_trend(city, 12)
    print(df.to_string(index=False))