from sqlalchemy import Column, Integer, String, Float

from database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    category = Column(
        String,
        nullable=False
    )

    sku = Column(
        String,
        unique=True,
        nullable=False,
        index=True
    )

    price = Column(
        Float,
        nullable=False,
        default=0.0
    )

    description = Column(
        String,
        nullable=True,
        default=""
    )