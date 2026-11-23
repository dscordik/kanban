import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool  # <-- ДОБАВИТЬ ЭТО

from app.main import app
from app.database import Base
from app.deps import get_current_user, get_db
from app.models import User, Board, BoardMember, Column, Card

test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=test_engine)
    session = TestSessionLocal()
    try:
        yield session
    finally:
        session.close()
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def test_user(db_session: Session) -> User:
    user = User(email="test@example.com", hashed_password="fake_hash")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_board(db_session: Session, test_user: User) -> Board:
    board = Board(title="Test Board")
    db_session.add(board)
    db_session.commit()
    db_session.refresh(board)
    return board


@pytest.fixture
def test_member(db_session: Session, test_user: User, test_board: Board) -> BoardMember:
    member = BoardMember(board_id=test_board.id, user_id=test_user.id, role="editor")
    db_session.add(member)
    db_session.commit()
    db_session.refresh(member)
    return member


@pytest.fixture
def test_column(db_session: Session, test_board: Board) -> Column:
    column = Column(board_id=test_board.id, title="К1", position=1000)
    db_session.add(column)
    db_session.commit()
    db_session.refresh(column)
    return column


@pytest.fixture
def test_column2(db_session: Session, test_board: Board) -> Column:
    column = Column(board_id=test_board.id, title="К2", position=2000)
    db_session.add(column)
    db_session.commit()
    db_session.refresh(column)
    return column


@pytest.fixture
def test_cards(db_session: Session, test_column: Column, test_user: User):
    cards = []
    for title, pos in [("a", 1000), ("b", 2000), ("c", 3000)]:
        card = Card(
            column_id=test_column.id,
            board_id=test_column.board_id,
            title=title,
            position=pos,
            created_by=test_user.id,
        )
        db_session.add(card)
        cards.append(card)
    db_session.commit()
    for card in cards:
        db_session.refresh(card)
    return {c.title: c for c in cards}


@pytest.fixture
def client(db_session: Session, test_user: User):
    def override_get_db():
        yield db_session

    def override_get_current_user():
        return test_user

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()