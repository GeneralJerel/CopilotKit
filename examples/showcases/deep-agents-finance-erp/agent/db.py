"""Database connection and models for the Finance ERP.

Uses SQLAlchemy with Postgres. Falls back to in-memory SQLite for local dev.
"""

from __future__ import annotations

import os

from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Date,
    Enum,
    create_engine,
)
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://erp_user:erp_password@localhost:5432/finance_erp",
)

engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------


class InvoiceModel(Base):
    __tablename__ = "invoices"
    id = Column(String, primary_key=True)
    number = Column(String, unique=True, nullable=False)
    client = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    status = Column(Enum("paid", "pending", "overdue", "draft", name="invoice_status"), default="draft")
    issued_date = Column(Date)
    due_date = Column(Date)


class AccountModel(Base):
    __tablename__ = "accounts"
    id = Column(String, primary_key=True)
    code = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    type = Column(Enum("asset", "liability", "equity", "revenue", "expense", name="account_type"))
    balance = Column(Float, default=0)
    currency = Column(String, default="USD")


class TransactionModel(Base):
    __tablename__ = "transactions"
    id = Column(String, primary_key=True)
    date = Column(Date)
    description = Column(String)
    amount = Column(Float)
    type = Column(Enum("credit", "debit", name="txn_type"))
    category = Column(String)
    account_code = Column(String)
    status = Column(Enum("completed", "pending", "failed", name="txn_status"), default="pending")


class InventoryModel(Base):
    __tablename__ = "inventory"
    id = Column(String, primary_key=True)
    sku = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    category = Column(String)
    quantity = Column(Integer, default=0)
    reorder_level = Column(Integer, default=0)
    unit_cost = Column(Float, default=0)
    location = Column(String)


class EmployeeModel(Base):
    __tablename__ = "employees"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True)
    role = Column(String)
    department = Column(String)
    start_date = Column(Date)
    status = Column(Enum("active", "on-leave", "terminated", name="emp_status"), default="active")
    salary = Column(Float, default=0)


def init_db():
    """Create all tables."""
    Base.metadata.create_all(engine)


if __name__ == "__main__":
    init_db()
    print("Database tables created.")
