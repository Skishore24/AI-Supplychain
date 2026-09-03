from sqlalchemy import Column, Integer, String, Float

from database import Base


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    product_name = Column(
        String,
        nullable=False
    )

    price = Column(
        Float,
        nullable=False
    )

    quality_score = Column(
        Float,
        nullable=False
    )

    delivery_days = Column(
        Integer,
        nullable=False
    )