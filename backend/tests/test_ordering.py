import types
from app.ordering import calculate_position, rebalance_positions

def test_between():
    assert calculate_position(1000, 2000) == 1500
def test_to_start():
    assert calculate_position(None, 1000) == 0
def test_to_end():
    assert calculate_position(3000, None) == 4000
def test_empty():
    assert calculate_position(None, None) == 1000
def test_gap_exhausted():
    assert calculate_position(1000, 1000.0005) is None
def test_rebalance():
    items = [types.SimpleNamespace(position=0) for _ in range(3)]
    rebalance_positions(items)
    assert [o.position for o in items]== [1000, 2000, 3000]