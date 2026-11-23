def test_move_column_between(client, test_board, db_session, test_member):
    from app.models import Column

    cols = {}
    for title, pos in [("A", 1000), ("B", 2000), ("C", 3000)]:
        col = Column(board_id=test_board.id, title=title, position=pos)
        db_session.add(col)
        cols[title] = col
    db_session.commit()

    response = client.post(
        f"/api/columns/{cols['C'].id}/move",
        json={"after_id": cols["A"].id, "before_id": cols["B"].id},
    )

    assert response.status_code == 200
    assert response.json()["position"] == 1500


def test_move_column_to_end(client, test_board, db_session, test_member):
    """A после B → позиция 2000 + 1000 = 3000."""
    from app.models import Column

    A = Column(board_id=test_board.id, title="A", position=1000)
    B = Column(board_id=test_board.id, title="B", position=2000)
    db_session.add_all([A, B])
    db_session.commit()

    response = client.post(
        f"/api/columns/{A.id}/move",
        json={"after_id": B.id},
    )

    assert response.status_code == 200
    assert response.json()["position"] == 3000.0 


def test_move_column_self_as_neighbor_400(client, test_column, test_member):
    response = client.post(
        f"/api/columns/{test_column.id}/move",
        json={"after_id": test_column.id},
    )

    assert response.status_code == 400


def test_move_column_same_neighbors_422(client, test_column, test_member):
    response = client.post(
        f"/api/columns/{test_column.id}/move",
        json={"after_id": test_column.id, "before_id": test_column.id},
    )

    assert response.status_code == 422