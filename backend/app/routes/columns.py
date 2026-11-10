from fastapi import APIRouter,Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from starlette import status
from starlette.exceptions import HTTPException
from app.deps import get_db
from app.models import BoardMember, Column, Card
from app.permissions import require_board_role, require_column_role
from app.schemas import ColumnCreate, ColumnOut, ColumnUpdate

router = APIRouter()

@router.post('/boards/{board_id}/columns', response_model=ColumnOut, status_code=status.HTTP_201_CREATED)
def create_column(board_id:int,data:ColumnCreate, member:BoardMember = Depends(require_board_role('editor')), db:Session = Depends(get_db)):
    max_position = db.query(func.max(Column.position)).filter(Column.board_id == board_id).scalar()
    if max_position is None:
        new_position = 1000
    else:
        new_position = max_position + 1000
    column = Column(
        board_id=board_id,
        title=data.title,
        position=new_position
    )
    db.add(column)
    db.commit()
    db.refresh(column)
    return column

@router.patch('/columns/{column_id}', response_model=ColumnOut)
def rename_column(column_id:int,data:ColumnUpdate, member_and_column:tuple[BoardMember, Column] = Depends(require_column_role('editor')), db:Session = Depends(get_db)):
    _ ,column = member_and_column
    if 'title' in data.model_fields_set:
        column.title = data.title
    db.commit()
    db.refresh(column)
    return column

@router.delete('/columns/{column_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_column(column_id:int, member_and_column:tuple[BoardMember, Column] = Depends(require_column_role('editor')), db:Session = Depends(get_db)):
    _,column = member_and_column
    card = db.query(Card).filter(Card.column_id == column_id).first()
    if card is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='Колонка не пуста. Сначала перенесите или удалите карточки')
    else:
        db.delete(column)
        db.commit()