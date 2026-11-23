# test_cascade.py
from app.database import SessionLocal
from app.models import Board, Column, Card, Label, CardLabel, User
from sqlalchemy import text

db = SessionLocal()

user = db.query(User).first()
if not user:
    user = User(email="test@test.com", hashed_password="hash", first_name="Test")
    db.add(user)
    db.flush()

board = Board(title="Test Board", description="Test")
db.add(board)
db.flush()

column = Column(board_id=board.id, title="Test Column", position=1000)
db.add(column)
db.flush()

card = Card(column_id=column.id, board_id=board.id, title="Test Card", position=1000, created_by=user.id)
db.add(card)
db.flush()

label = Label(board_id=board.id, name="Test Label", color="#FF0000")
db.add(label)
db.flush()

card_label = CardLabel(card_id=card.id, label_id=label.id)
db.add(card_label)
db.commit()

print(f"Создано: board={board.id}, column={column.id}, card={card.id}, label={label.id}")

db.delete(board)
db.commit()

tables_to_check = ['columns', 'cards', 'labels', 'card_labels']
all_empty = True
for table in tables_to_check:
    count = db.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar()
    print(f"   {table}: {count} записей")
    if count > 0:
        all_empty = False

if all_empty:
    print("Каскадное удаление работает идеально!")
else:
    print("Ошибка: остались сироты в базе!")

db.close()