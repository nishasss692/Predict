from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "postgresql+psycopg2://postgres:nishas123@localhost:5432/bengaluru_civic_brain"

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
if __name__ == "__main__":
    try:
        with engine.connect() as connection:
            print("Database connection successful!")

        from app.models.incident import Incident

        Base.metadata.create_all(bind=engine)

        print("Database tables created successfully!")

    except Exception as e:
        print("Database connection failed:")
        print(e)
from app.models.incident import Incident

Base.metadata.create_all(bind=engine)