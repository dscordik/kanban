from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from starlette import status
from app.deps import get_db, get_current_user
from app.models import BoardMember, User

role_ranks = {'viewer':1, 'editor':2, 'owner':3}

def count_owners(db:Session, board_id:int):
    member = db.query(BoardMember).filter(BoardMember.board_id == board_id).filter(BoardMember.role == 'owner').count()
    return member

def require_board_role(min_role: str):
    def dependency(board_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> BoardMember:
        member = db.query(BoardMember).filter(BoardMember.board_id == board_id, BoardMember.user_id == user.id).first()
        if member is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Доска не найдена')
        if role_ranks[member.role]< role_ranks[min_role]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Недостаточно прав')
        return member
    return dependency