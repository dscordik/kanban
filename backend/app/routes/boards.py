from fastapi import APIRouter, Depends, Response, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session, aliased
from starlette import status
from app.deps import get_db, get_current_user
from app.models import Board, BoardMember, User
from app.permissions import require_board_role
from app.schemas import BoardListItem, BoardOut, BoardCreate, BoardUpdate

router = APIRouter()

def board_out(board:Board, my_role:str)->BoardOut:
    return BoardOut(
        id=board.id,
        title=board.title,
        description=board.description,
        my_role=my_role,
        created_at=board.created_at
    )

@router.get("/boards", response_model=list[BoardListItem])
def get_my_boards(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    other = aliased(BoardMember)
    members_count = db.query(func.count(other.id)).filter(other.board_id == Board.id).correlate(Board).scalar_subquery()
    rows = db.query(Board, BoardMember.role, members_count.label('members_count')).join(BoardMember, BoardMember.board_id == Board.id).filter(BoardMember.user_id == user.id).order_by(Board.created_at.desc(), Board.id.desc()).all()
    return [
        BoardListItem(
            id=board.id,
            title=board.title,
            description=board.description,
            my_role=role,
            members_count=count,
            created_at=board.created_at,
        )
        for board, role, count in rows
    ]

@router.post('/boards', response_model=BoardOut, status_code=status.HTTP_201_CREATED)
def create_boards(data:BoardCreate, user:User = Depends(get_current_user), db:Session = Depends(get_db)):
    board = Board(title=data.title, description=data.description)
    db.add(board)
    db.flush()
    member = BoardMember(board_id=board.id, user_id=user.id, role='owner')
    db.add(member)
    db.commit()
    db.refresh(board)
    return board_out(board, 'owner')

@router.get('/boards/{board_id}', response_model=BoardOut)
def get_board(board_id:int, member:BoardMember = Depends(require_board_role('viewer')), db:Session = Depends(get_db)):
    board = db.query(Board).filter(Board.id == board_id).first()
    if board is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Доска не найдена')
    return board_out(board, member.role)

@router.patch('/boards/{board_id}', response_model=BoardOut)
def update_board(board_id:int, board_data: BoardUpdate, member:BoardMember = Depends(require_board_role('owner')), db:Session = Depends(get_db)):
    board = db.query(Board).filter(Board.id == board_id).first()
    if board is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Доска не найдена')
    if board_data.title is not None:
        board.title = board_data.title
    if board_data.description is not None:
        board.description = board_data.description
    db.commit()
    db.refresh(board)
    return board_out(board, member.role)

@router.delete('/boards/{board_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_board(board_id:int, member:BoardMember = Depends(require_board_role('owner')), db:Session = Depends(get_db)):
    board = db.query(Board).filter(Board.id == board_id).first()
    if board is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Доска не найдена')
    db.delete(board)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)