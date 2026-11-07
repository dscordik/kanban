from sqlalchemy import DateTime, Integer, String, func, ForeignKey, UniqueConstraint, Text, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

Roles = ('owner', 'editor', 'viewer')

class User(Base):
    __tablename__ = 'users'

    id:Mapped[int] = mapped_column(Integer, primary_key=True)
    email:Mapped[str] = mapped_column(String, unique=True ,nullable=False, index=True)
    hashed_password:Mapped[str] = mapped_column(String, nullable=False)
    first_name:Mapped[str | None] = mapped_column(String, nullable=True)
    created_at:Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())

class Board(Base):
    __tablename__ = 'boards'

    id:Mapped[int] = mapped_column(Integer, primary_key=True)
    title:Mapped[str] = mapped_column(String(100), nullable=False)
    description:Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    members:Mapped[list['BoardMember']] = relationship('BoardMember', cascade='all, delete-orphan', back_populates='board')

class BoardMember(Base):
    __tablename__ = 'board_members'

    id:Mapped[int] = mapped_column(Integer, primary_key=True)
    board_id:Mapped[int] = mapped_column(Integer, ForeignKey('boards.id'), nullable=False)
    user_id:Mapped[int] = mapped_column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    role:Mapped[str] = mapped_column(String(20), server_default=text("'viewer'"))
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    user:Mapped['User'] = relationship('User')
    board:Mapped['Board'] = relationship('Board', back_populates='members')

    __table_args__ = (UniqueConstraint('board_id', 'user_id', name='uq_board_member'),)