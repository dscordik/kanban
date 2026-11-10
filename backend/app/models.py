from sqlalchemy import DateTime, Integer, String, func, ForeignKey, UniqueConstraint, Text, text, Float, Date, Index
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
    columns:Mapped[list['Column']] = relationship('Column', cascade='all, delete-orphan', back_populates='board', order_by='Column.position')
    labels:Mapped[list['Label']] = relationship('Label', cascade='all, delete-orphan')

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

class Column(Base):
    __tablename__ = 'columns'

    id:Mapped[int] = mapped_column(Integer, primary_key=True)
    board_id: Mapped[int] = mapped_column(Integer, ForeignKey('boards.id'), nullable=False, index=True)
    title:Mapped[str] = mapped_column(String(100), nullable=False)
    position:Mapped[Float] = mapped_column(Float, nullable=False)
    created_at:Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())

    board:Mapped['Board'] = relationship('Board', back_populates='columns')
    cards:Mapped[list['Card']] = relationship('Card', cascade='all, delete-orphan', order_by='Card.position')


class Card(Base):
    __tablename__ = 'cards'

    id:Mapped[int] = mapped_column(Integer, primary_key=True)
    column_id:Mapped[int] = mapped_column(Integer, ForeignKey('columns.id'), nullable=False)
    board_id:Mapped[int] = mapped_column(Integer, ForeignKey('boards.id'), nullable=False, index=True)
    title:Mapped[str] = mapped_column(String(200), nullable=False)
    description:Mapped[str | None] = mapped_column(Text, nullable=True)
    position:Mapped[Float] = mapped_column(Float, nullable=False)
    assignee_id:Mapped[int] = mapped_column(Integer, ForeignKey('users.id'), nullable=True)
    due_date:Mapped[Date] = mapped_column(Date, nullable=True)
    created_by:Mapped[int] = mapped_column(Integer, ForeignKey('users.id'),nullable=False)
    created_at:Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    column:Mapped['Column'] = relationship('Column', back_populates='cards')
    labels: Mapped[list['Label']] = relationship('Label', secondary='card_labels', back_populates='cards')

    __table_args__ = (Index('ix_cards_column_position', 'column_id', 'position'),)

class Label(Base):
    __tablename__ = 'labels'

    id:Mapped[int] = mapped_column(Integer, primary_key=True)
    board_id:Mapped[int] = mapped_column(Integer, ForeignKey('boards.id'), nullable=False, index=True)
    name:Mapped[str] = mapped_column(String(50), nullable=False)
    color:Mapped[str] = mapped_column(String(7), nullable=False)

    cards: Mapped[list['Card']] = relationship('Card', secondary='card_labels', back_populates='labels')

class CardLabel(Base):
    __tablename__ = 'card_labels'

    card_id:Mapped[int] = mapped_column(Integer, ForeignKey('cards.id'), primary_key=True)
    label_id:Mapped[int] = mapped_column(Integer, ForeignKey('labels.id'), primary_key=True)