from fastapi import HTTPException
from sqlalchemy.orm import Session
from starlette import status
from app.ordering import calculate_position, rebalance_positions

def calculate_new_position(db:Session, items:list, after, before)-> float:
    prev = None
    next = None
    if after is not None and before is not None:
        prev = after.position
        next = before.position
    elif after is not None:
        prev = after.position
        for item in items:
            if item.position > after.position:
                next = item.position
                break
    elif before is not None:
        next = before.position
        for c in reversed(items):
            if c.position < before.position:
                prev = c.position
                break
    else:
        if items:
            prev = items[-1].position
    position = calculate_position(prev, next)
    if position is None:
        rebalance_positions(items)
        db.flush()
        prev = None
        next = None
        if after is not None and before is not None:
            prev = after.position
            next = before.position
        elif after is not None:
            prev = after.position
            for item in items:
                if item.position > after.position:
                    next = item.position
                    break
        elif before is not None:
            next = before.position
            for c in reversed(items):
                if c.position < before.position:
                    prev = c.position
                    break
        else:
            if items:
                prev = items[-1].position
        position = calculate_position(prev, next)
        if position is None:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail="Баг после перебалансировки расчёт вернул None")
    return position