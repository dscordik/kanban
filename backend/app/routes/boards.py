from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload
from starlette import status
from starlette.exceptions import HTTPException

from app.deps import get_db, get_current_user
from app.models import Board, BoardMember, User
from app.permissions import require_board_role
from app.schemas import BoardListItem, BoardOut, BoardCreate, BoardUpdate

router = APIRouter()

@router.get("/boards", response_model=list[BoardListItem])
def get_my_boards( db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    members_count_subquery = db.query(func.count(BoardMember.id)).filter(BoardMember.board_id == Board.id).correlate(Board).scalar_subquery()
    results = db.query(BoardMember, members_count_subquery.label("members_count")).options(joinedload(BoardMember.board)).filter(BoardMember.user_id == user.id).order_by(BoardMember.created_at.desc()).all()
    boards = []
    for member, count in results:
        boards.append(
            BoardListItem(
                id=member.board.id,
                title=member.board.title,
                description=member.board.description,
                my_role=member.role,
                members_count=count,
                created_at=member.board.created_at
            )
        )
    return boards

@router.post('/boards', response_model=BoardOut)
def create_boards(data:BoardCreate, user:User = Depends(get_current_user), db:Session = Depends(get_db)):
    board = Board(title=data.title, description=data.description)
    db.add(board)
    db.flush()
    member = BoardMember(board_id=board.id, user_id=user.id, role='owner')
    db.add(member)
    db.commit()
    return BoardOut(
        id=board.id,
        title=board.title,
        description=board.description,
        my_role='owner',
        created_at=board.created_at
    )

@router.get('/boards/{board_id}', response_model=BoardOut)
def get_board(board_id:int, member:BoardMember = Depends(require_board_role('viewer')), db:Session = Depends(get_db)):
    board = db.query(Board).filter(Board.id == board_id).first()
    if board is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Доска не найдена')
    return BoardOut(
        id=board.id,
        title=board.title,
        description=board.description,
        my_role=member.role,
        created_at=board.created_at
    )

@router.patch('/boards/{board_id}', response_model=BoardOut)
def update_board(board_id:int,board_data: BoardUpdate, member:BoardMember = Depends(require_board_role('owner')), db:Session = Depends(get_db)):
    board = db.query(Board).filter(Board.id == board_id).first()
    if board is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Доска не найдена')
    if board_data.title is not None:
        board.title = board_data.title
    if board_data.description is not None:
        board.description = board_data.description
    db.commit()
    db.refresh(board)
    return BoardOut(
        id=board.id,
        title=board.title,
        description=board.description,
        my_role=member.role,
        created_at=board.created_at
    )

@router.delete('/boards/{board_id}')
def delete_board(board_id:int, member:BoardMember = Depends(require_board_role('owner')), db:Session = Depends(get_db)):
    board = db.query(Board).filter(Board.id == board_id).first()
    if board is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Доска не найдена')
    db.delete(board)
    db.commit()
    return None