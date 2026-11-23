def test_move_card_between(client, test_column, test_cards, test_member):
    a, b, c = test_cards["a"], test_cards["b"], test_cards["c"]

    response = client.post(
        f"/api/cards/{c.id}/move",
        json={"column_id": test_column.id, "after_id": a.id, "before_id": b.id},
    )

    assert response.status_code == 200
    assert response.json()["position"] == 1500


def test_move_card_to_end(client, test_column, test_cards, test_member):
    """a после c → позиция 3000 + 1000 = 4000."""
    a, c = test_cards["a"], test_cards["c"]

    response = client.post(
        f"/api/cards/{a.id}/move",
        json={"column_id": test_column.id, "after_id": c.id},
    )

    assert response.status_code == 200
    assert response.json()["position"] == 4000.0 


def test_move_card_to_start(client, test_column, test_cards, test_member):
    """c перед a → позиция 1000 - 1000 = 0."""
    a, c = test_cards["a"], test_cards["c"]

    response = client.post(
        f"/api/cards/{c.id}/move",
        json={"column_id": test_column.id, "before_id": a.id},
    )

    assert response.status_code == 200
    assert response.json()["position"] == 0.0


def test_move_card_no_neighbors(client, test_column, test_cards, test_member):
    """a без соседей → в конец, позиция последней (3000) + 1000 = 4000."""
    a = test_cards["a"]

    response = client.post(
        f"/api/cards/{a.id}/move",
        json={"column_id": test_column.id},
    )

    assert response.status_code == 200
    assert response.json()["position"] == 4000.0


def test_move_card_same_neighbors_422(client, test_column, test_cards, test_member):
    a, c = test_cards["a"], test_cards["c"]

    response = client.post(
        f"/api/cards/{c.id}/move",
        json={"column_id": test_column.id, "after_id": a.id, "before_id": a.id},
    )

    assert response.status_code == 422


def test_move_card_self_as_neighbor_400(client, test_column, test_cards, test_member):
    c = test_cards["c"]

    response = client.post(
        f"/api/cards/{c.id}/move",
        json={"column_id": test_column.id, "after_id": c.id},
    )

    assert response.status_code == 400


def test_move_card_neighbor_other_column_409(client, test_column, test_column2, test_cards, test_member):
    a, c = test_cards["a"], test_cards["c"]

    response = client.post(
        f"/api/cards/{c.id}/move",
        json={"column_id": test_column2.id, "after_id": a.id},
    )

    assert response.status_code == 409


def test_move_card_reversed_order_409(client, test_column, test_cards, test_member):
    a, b, c = test_cards["a"], test_cards["b"], test_cards["c"]

    response = client.post(
        f"/api/cards/{c.id}/move",
        json={"column_id": test_column.id, "after_id": b.id, "before_id": a.id},
    )

    assert response.status_code == 409


def test_move_card_to_other_column(client, test_column, test_column2, test_cards, test_member):
    c = test_cards["c"]

    response = client.post(
        f"/api/cards/{c.id}/move",
        json={"column_id": test_column2.id},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["column_id"] == test_column2.id
    assert body["position"] == 1000


def test_move_card_target_column_other_board_404(client, test_cards, test_member):
    c = test_cards["c"]

    response = client.post(
        f"/api/cards/{c.id}/move",
        json={"column_id": 99999},
    )

    assert response.status_code == 404