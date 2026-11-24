from fastapi import APIRouter,Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from starlette import status
from starlette.exceptions import HTTPException
from app.deps import get_db
from app.models import BoardMember, Column, Card, Board
from app.move_service import calculate_new_position
from app.permissions import require_board_role, require_column_role
from app.schemas import ColumnCreate, ColumnOut, ColumnUpdate, MoveColumn

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

def _load_column_neighbor(db: Session, neighbor_id: int | None, column: Column) -> Column | None:
    if neighbor_id is None:
        return None
    if neighbor_id == column.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Нельзя указать перемещаемый элемент соседом')
    neighbor = db.query(Column).filter(Column.id == neighbor_id, Column.board_id == column.board_id).first()
    if neighbor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Колонка не найдена')
    return neighbor


@router.post('/columns/{column_id}/move', response_model=ColumnOut)
def move_column(column_id: int, body: MoveColumn, member_and_column: tuple[BoardMember, Column] = Depends(require_column_role('editor')), db: Session = Depends(get_db)):
    _, column = member_and_column
    db.query(Board).filter(Board.id == column.board_id).with_for_update().first()

    after = _load_column_neighbor(db, body.after_id, column)
    before = _load_column_neighbor(db, body.before_id, column)
    if after is not None and before is not None and after.position >= before.position:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='Порядок изменился. Обновите страницу')

    columns = db.query(Column).filter(Column.board_id == column.board_id, Column.id != column.id).order_by(Column.position, Column.id).all()
    column.position = calculate_new_position(db, columns, after, before)
    db.commit()
    db.refresh(column)
    return column