import os
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, Text
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./rail_eta.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class DBTrain(Base):
    __tablename__ = "trains"

    id = Column(String, primary_key=True, index=True)
    train_number = Column(String, unique=True, index=True)
    name = Column(String)
    origin = Column(String)
    destination = Column(String)
    current_lat = Column(Float)
    current_lon = Column(Float)
    speed = Column(Float, default=0.0)
    current_delay = Column(Float, default=0.0)
    status = Column(String, default="SCHEDULED")

class DBStation(Base):
    __tablename__ = "stations"

    id = Column(String, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)
    name = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    scheduled_arrival = Column(String)
    scheduled_departure = Column(String)
    platform = Column(Integer, default=1)
    zone = Column(String, default="IR")

class DBSection(Base):
    __tablename__ = "sections"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    from_station = Column(String, index=True)
    to_station = Column(String, index=True)
    distance_km = Column(Float)
    historical_avg_time_min = Column(Float)
    historical_std_time_min = Column(Float)
    max_speed_kmh = Column(Float)

class DBOperationalEvent(Base):
    __tablename__ = "operational_events"

    id = Column(String, primary_key=True, index=True)
    event_type = Column(String, index=True)
    section_id = Column(String, index=True)
    title = Column(String)
    severity = Column(String)
    impact_minutes = Column(Float)
    weather_factor = Column(Float, default=1.0)
    description = Column(Text)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

def init_db():
    Base.metadata.create_all(bind=engine)

    # Seed initial corridor metadata if empty
    from app.data.corridor_data import STATIONS, SECTIONS
    db = SessionLocal()
    try:
        if db.query(DBStation).count() == 0:
            for s in STATIONS:
                db.add(DBStation(
                    id=s["id"],
                    code=s["code"],
                    name=s["name"],
                    latitude=s["lat"],
                    longitude=s["lon"],
                    scheduled_arrival=s["scheduled_arrival"],
                    scheduled_departure=s["scheduled_departure"],
                    platform=s.get("platform", 1),
                    zone=s.get("zone", "IR")
                ))
            db.commit()

        if db.query(DBSection).count() == 0:
            for sec in SECTIONS:
                db.add(DBSection(
                    id=sec["id"],
                    name=sec["name"],
                    from_station=sec["from_station"],
                    to_station=sec["to_station"],
                    distance_km=sec["distance_km"],
                    historical_avg_time_min=sec["historical_avg_time_min"],
                    historical_std_time_min=sec["historical_std_time_min"],
                    max_speed_kmh=sec["max_permissible_speed_kmh"]
                ))
            db.commit()

        if db.query(DBTrain).count() == 0:
            db.add(DBTrain(
                id="12951",
                train_number="12951",
                name="Rajdhani Express",
                origin="Delhi",
                destination="Agra Cantt",
                current_lat=25.2138,
                current_lon=75.8648,
                speed=72.0,
                current_delay=15.0,
                status="RUNNING"
            ))
            db.commit()
    finally:
        db.close()
