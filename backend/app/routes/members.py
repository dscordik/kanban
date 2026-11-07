from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload
from starlette import status
from app.deps import get_db
from app.models import BoardMember, User
from app.permissions import require_board_role, count_owners
from app.schemas import MemberOut, MemberAdd, MemberRoleUpdate

router = APIRouter()

def member_out(member:BoardMember, user:User)-> MemberOut:
    return MemberOut(
        user_id=user.id,
        email=user.email,
        first_name=user.first_name,
        role=member.role
    )

@router.get('/boards/{board_id}/members', response_model=list[MemberOut])
def get_board_members(board_id:int, member:BoardMember = Depends(require_board_role('viewer')), db:Session = Depends(get_db)):
    rows = db.query(BoardMember).options(joinedload(BoardMember.user)).filter(BoardMember.board_id == board_id).order_by(BoardMember.created_at.asc(), BoardMember.id.asc()).all()
    return [member_out(row, row.user) for row in rows]

@router.post('/boards/{board_id}/members', response_model=MemberOut, status_code=status.HTTP_201_CREATED)
def add_member(board_id:int, member_data:MemberAdd , member:BoardMember = Depends(require_board_role('owner')), db:Session = Depends(get_db)):
    user = db.query(User).filter(User.email == member_data.email).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Пользователь с таким email не найден')
    find_user_by_id = db.query(BoardMember).filter(BoardMember.board_id == board_id, BoardMember.user_id == user.id).first()
    if find_user_by_id:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='пользователь уже участвует в доске')
    new_member = BoardMember(
        board_id=board_id,
        user_id=user.id,
        role=member_data.role
    )
    db.add(new_member)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='Пользователь уже участвует в доске')
    return member_out(new_member, user)

@router.patch('/boards/{board_id}/members/{user_id}', response_model=MemberOut)
def update_member_role(board_id:int, user_id:int, role_data:MemberRoleUpdate, member:BoardMember = Depends(require_board_role('owner')), db:Session = Depends(get_db)):
    find_member = db.query(BoardMember).options(joinedload(BoardMember.user)).filter(BoardMember.board_id == board_id, BoardMember.user_id == user_id).first()
    if find_member is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Участник не найден')
    if find_member.role == 'owner' and role_data.role != 'owner' and count_owners(db, board_id) <= 1:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='Нельзя оставить доску без владельца. Сначала назначьте другого владельца')
    if find_member.role != role_data.role:
        find_member.role = role_data.role
        db.commit()
        db.refresh(find_member)
    return member_out(find_member, find_member.user)

@router.delete('/boards/{board_id}/members/{user_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_member(board_id:int, user_id:int, member:BoardMember = Depends(require_board_role('viewer')), db:Session = Depends(get_db)):
    find_member = db.query(BoardMember).filter(BoardMember.board_id == board_id, BoardMember.user_id == user_id).first()
    if find_member is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Участник не найден')
    if find_member.user_id != member.user_id and member.role != 'owner':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Недостаточно прав')
    if find_member.role == 'owner' and count_owners(db, board_id) <= 1:
        if count_owners(db, board_id) <= 1:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='Нельзя оставить доску без владельца. Сначала назначьте другого владельца')
    db.delete(find_member)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)