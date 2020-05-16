from app import session_scope
import sqlalchemy
from .base import Base
from sqlalchemy import Column, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from graphql import GraphQLError
from flask_babel import _

MAX_FAVORITES = 50


class ModelFavoriteItem(Base):
    __tablename__ = "favorite_item"
    __table_args__ = (UniqueConstraint("user_account_id", "item_id"),)
    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
        nullable=False,
    )
    user_account_id = Column(
        UUID(as_uuid=True),
        ForeignKey("user_account.uuid", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    item_id = Column(
        UUID(as_uuid=True),
        ForeignKey("item.uuid", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    user_account = relationship("ModelUserAccount", back_populates="favorite_items")
    item = relationship("ModelItem")

    @classmethod
    def toggle_favorite(cls, db_session, user_account_id, item_id, is_favorite):
        favorite = (
            db_session.query(cls)
            .filter_by(user_account_id=user_account_id, item_id=item_id)
            .one_or_none()
        )
        if is_favorite:
            if (
                db_session.query(cls.uuid)
                .filter_by(user_account_id=user_account_id)
                .count()
                >= MAX_FAVORITES
            ):
                raise GraphQLError(
                    _(
                        "You may not have more than %(max_favorites)s favorites.",
                        max_favorites=MAX_FAVORITES,
                    )
                )
            if favorite:
                return
            favorite = ModelFavoriteItem(
                item_id=item_id, user_account_id=user_account_id
            )
            db_session.add(favorite)
        elif favorite:
            db_session.delete(favorite)
