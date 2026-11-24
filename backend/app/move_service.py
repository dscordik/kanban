from fastapi import HTTPException
from sqlalchemy.orm import Session
from starlette import status

from app.ordering import calculate_position, rebalance_positions


def _find_neighbor_positions(items: list, after, before) -> tuple[float | None, float | None]:
    if after is not None and before is not None:
        return after.position, before.position
    if after is not None:
        next_pos = next((i.position for i in items if i.position > after.position), None)
        return after.position, next_pos
    if before is not None:
        prev_pos = next((i.position for i in reversed(items) if i.position < before.position), None)
        return prev_pos, before.position
    return (items[-1].position if items else None), None


def calculate_new_position(db: Session, items: list, after, before) -> float:
    position = calculate_position(*_find_neighbor_positions(items, after, before))
    if position is None:
        rebalance_positions(items)
        db.flush()
        position = calculate_position(*_find_neighbor_positions(items, after, before))
        if position is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="После перебалансировки расчёт позиции не удался"
            )
    return position