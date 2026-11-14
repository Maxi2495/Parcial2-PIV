from sqlmodel import SQLModel, Session, create_engine

DATABASE_URL = "postgresql+psycopg2://postgres:admin@localhost:5432/foodstore_db"

engine = create_engine(DATABASE_URL, echo=True)


def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session