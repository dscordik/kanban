from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session, selectinload
from starlette import status
from starlette.exceptions import HTTPException

from app.deps import get_db
from app.models import BoardMember, Column, Card, Label
from app.permissions import require_column_role, require_card_role
from app.schemas import CardOut, CardCreate, CardUpdate

router = APIRouter()

@router.post('/columns/{column_id}/cards', response_model=CardOut, status_code=status.HTTP_201_CREATED)
def create_card(column_id:int, data:CardCreate, member_and_column:tuple[BoardMember, Column] = Depends(require_column_role('editor')), db:Session = Depends(get_db)):
    member,column = member_and_column
    position = db.query(func.max(Card.position)).filter(Card.column_id == column_id).scalar()
    if position is None:
        new_position = 1000
    else:
        new_position = position + 1000
    card = Card(
        column_id=column.id,
        board_id=column.board_id,
        title=data.title,
        description=data.description,
        position=new_position,
        created_by = member.user_id
    )
    db.add(card)
    db.commit()
    db.refresh(card)
    return card

@router.patch('/cards/{card_id}', response_model=CardOut)
def update_card(card_id:int, data:CardUpdate, member_and_card:tuple[BoardMember, Card] = Depends(require_card_role('editor')), db:Session = Depends(get_db)):
    if not data.model_fields_set:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail='Пустое тело запроса')
    member,card = member_and_card
    if 'title' in data.model_fields_set:
        card.title = data.title
    if 'description' in data.model_fields_set:
        card.description = data.description
    if 'due_date' in data.model_fields_set:
        card.due_date = data.due_date
    if 'assignee_id' in data.model_fields_set:
        if data.assignee_id is None:
            card.assignee_id = None
        else:
            assignee_member = db.query(BoardMember).filter(BoardMember.board_id == card.board_id, BoardMember.user_id == data.assignee_id).first()
            if assignee_member is None:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Исполнитель не участвует в доске')
            card.assignee_id = data.assignee_id
    if 'label_ids' in data.model_fields_set:
        ids = list(set(data.label_ids or []))
        labels = db.query(Label).filter(Label.id.in_(ids), Label.board_id == card.board_id).all() if ids else []
        if len(labels) != len(ids):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Метка не найдена на этой доске')
        card.labels = labels
    db.commit()
    card = db.query(Card).options(selectinload(Card.labels)).filter(Card.id == card.id).first()
    return card

@router.delete('/cards/{card_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_card(card_id:int, member_and_card:tuple[BoardMember, Card] = Depends(require_card_role('editor')), db:Session = Depends(get_db)):
    _, card = member_and_card
    db.delete(card)
    db.commit()