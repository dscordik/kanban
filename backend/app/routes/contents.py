from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session, selectinload
from app.deps import get_db
from app.models import BoardMember, Column, Card, Label
from app.permissions import require_board_role
from app.schemas import BoardContent, ColumnWithCards

router = APIRouter()

@router.get('/boards/{board_id}/content', response_model=BoardContent)
def get_board_content(board_id:int, member:BoardMember = Depends(require_board_role('viewer')), db:Session = Depends(get_db)):
    columns = db.query(Column).filter(Column.board_id == board_id).order_by(Column.position).all()
    cards = db.query(Card).options(selectinload(Card.labels)).filter(Card.board_id == board_id).order_by(Card.position).all()
    labels = db.query(Label).filter(Label.board_id == board_id).all()
    cards_by_column = {}
    for card in cards:
        if card.column_id not in cards_by_column:
            cards_by_column[card.column_id] = []
        cards_by_column[card.column_id].append(card)
    columns_with_cards = []
    for column in columns:
        columns_with_cards.append(
            ColumnWithCards(
                id=column.id,
                board_id=column.board_id,
                title=column.title,
                position=column.position,
                cards=cards_by_column.get(column.id, [])
            )
        )
    return BoardContent(columns=columns_with_cards, labels=labels)