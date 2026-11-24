from sqlalchemy import func, select
from app.models import Card, CardLabel, Column, Label

def count(db, model):
    return db.scalar(select(func.count()).select_from(model))


def test_delete_board_removes_everything(client, db_session, test_user, test_board, test_member, test_column):
    test_member.role = 'owner'
    card = Card(column_id=test_column.id, board_id=test_board.id, title='c', position=1000, created_by=test_user.id)
    label = Label(board_id=test_board.id, name='bug', color='#FF0000')
    db_session.add_all([card, label])
    db_session.flush()
    card.labels = [label]
    db_session.commit()

    assert count(db_session, Card) == 1
    assert count(db_session, CardLabel) == 1

    response = client.delete(f'/api/boards/{test_board.id}')
    assert response.status_code == 204

    db_session.expire_all()
    assert count(db_session, Column) == 0
    assert count(db_session, Card) == 0
    assert count(db_session, Label) == 0
    assert count(db_session, CardLabel) == 0