from app.models import Board, Card, Column

def move(client, card_id, column_id, **neighbors):
    return client.post(f'/api/cards/{card_id}/move', json={'column_id': column_id, **neighbors})

def make_foreign_card(db_session, user):
    board = Board(title='Other')
    db_session.add(board)
    db_session.flush()
    column = Column(board_id=board.id, title='Y1', position=1000)
    db_session.add(column)
    db_session.flush()
    card = Card(column_id=column.id, board_id=board.id, title='y1', position=1000, created_by=user.id)
    db_session.add(card)
    db_session.commit()
    return column, card

def test_viewer_gets_403(client, db_session, test_member, test_column, test_cards):
    test_member.role = 'viewer'
    db_session.commit()
    assert move(client, test_cards['a'].id, test_column.id).status_code == 403

def test_stranger_gets_404(client, db_session, test_member, test_column, test_cards):
    db_session.delete(test_member)
    db_session.commit()
    assert move(client, test_cards['a'].id, test_column.id).status_code == 404

def test_neighbor_from_other_board_404(client, db_session, test_user, test_member, test_column, test_cards):
    _, foreign = make_foreign_card(db_session, test_user)
    response = move(client, test_cards['a'].id, test_column.id, after_id=foreign.id)
    assert response.status_code == 404
    assert response.json()['detail'] == 'Карточка не найдена'

def test_target_column_from_other_board_404(client, db_session, test_user, test_member, test_cards):
    column, _ = make_foreign_card(db_session, test_user)
    response = move(client, test_cards['a'].id, column.id)
    assert response.status_code == 404
    assert response.json()['detail'] == 'Колонка не найдена'

def test_rebalance_through_api(client, db_session, test_member, test_column, test_cards):
    a, b, c = test_cards['a'], test_cards['b'], test_cards['c']
    a.position = 1000
    b.position = 1000.0005
    db_session.commit()
    response = move(client, c.id, test_column.id, after_id=a.id, before_id=b.id)
    assert response.status_code == 200
    db_session.expire_all()
    cards = db_session.query(Card).filter(Card.column_id == test_column.id).order_by(Card.position).all()
    assert [x.title for x in cards] == ['a', 'c', 'b']
    assert [x.position for x in cards] == [1000, 1500, 2000]

def test_move_response_contains_labels(client, db_session, test_member, test_column, test_cards):
    response = move(client, test_cards['a'].id, test_column.id)
    assert response.status_code == 200
    assert response.json()['labels'] == []

def test_column_move_viewer_403_and_foreign_neighbor_404(client, db_session, test_user, test_member, test_column, test_column2):
    foreign_column, _ = make_foreign_card(db_session, test_user)
    response = client.post(f'/api/columns/{test_column2.id}/move', json={'after_id': foreign_column.id})
    assert response.status_code == 404
    assert response.json()['detail'] == 'Колонка не найдена'

    test_member.role = 'viewer'
    db_session.commit()
    assert client.post(f'/api/columns/{test_column2.id}/move', json={}).status_code == 403