from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from starlette import status
from app.deps import get_db, get_current_user
from app.models import BoardMember, User, Column, Card, Label

role_ranks = {'viewer':1, 'editor':2, 'owner':3}

def count_owners(db:Session, board_id:int):
    member = db.query(BoardMember).filter(BoardMember.board_id == board_id).filter(BoardMember.role == 'owner').count()
    return member

def require_board_role(min_role:str):
   def dependency(board_id:int, user: User = Depends(get_current_user), db: Session = Depends(get_db))->BoardMember:
       cl = check_board_role(board_id,min_role, user, db)
       return cl
   return dependency

def check_board_role( board_id:int, min_role:str, user: User, db: Session) -> BoardMember:
    member = db.query(BoardMember).filter(BoardMember.board_id == board_id, BoardMember.user_id == user.id).first()
    if member is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Доска не найдена')
    if role_ranks[member.role] < role_ranks[min_role]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Недостаточно прав')
    return member

def require_column_role(min_role:str):
    def dependency( column_id: int,user: User = Depends(get_current_user),db: Session = Depends(get_db))-> tuple[BoardMember, Column]:
        column = db.query(Column).filter(Column.id == column_id).first()
        if column is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Колонка не найдена')
        member = check_board_role(column.board_id,min_role,user, db)
        return member, column
    return dependency

def require_card_role(min_role:str):
    def dependency(card_id:int, user:User = Depends(get_current_user), db:Session = Depends(get_db))->tuple[BoardMember, Card]:
        card = db.query(Card).filter(Card.id == card_id).first()
        if card is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Карточка не найдена')
        member = check_board_role(card.board_id, min_role, user, db)
        return member, card
    return dependency

def require_label_role(min_role:str):
    def dependency(label_id:int, user:User = Depends(get_current_user), db:Session = Depends(get_db)) -> tuple[BoardMember, Label]:
        label = db.query(Label).filter(Label.id == label_id).first()
        if label is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Метка не найдена')
        member = check_board_role(label.board_id, min_role, user, db)
        return member, label
    return dependency

def check_role_or_404(board_id: int, min_role: str, user: User, db: Session, not_found: str) -> BoardMember:
    try:
        return check_board_role(board_id, min_role, user, db)
    except HTTPException as exc:
        if exc.status_code == status.HTTP_404_NOT_FOUND:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=not_found) from None
        raise