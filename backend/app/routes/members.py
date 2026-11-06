from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from starlette import status

from app.deps import get_db
from app.models import BoardMember, User
from app.permissions import require_board_role, count_owners
from app.schemas import MemberOut, BoardOut, MemberAdd, MemberRoleUpdate

router = APIRouter()

@router.get('/boards/{board_id}/members', response_model=list[MemberOut])
def get_board_members(board_id:int, member:BoardMember = Depends(require_board_role('viewer')), db:Session = Depends(get_db)):
    board = db.query(BoardMember).options(joinedload(BoardMember.user)).filter(BoardMember.board_id == board_id).order_by(BoardMember.created_at.asc()).all()
    members = []
    for mem in board:
        members.append(
            MemberOut(
                user_id=mem.user_id,
                email=mem.user.email,
                first_name=mem.user.first_name,
                role=mem.role
            )
        )
    return members

@router.post('/boards/{board_id}/members', response_model=MemberOut)
def add_member(board_id:int, member_data:MemberAdd , member:BoardMember = Depends(require_board_role('editor')), db:Session = Depends(get_db)):
    find_member = db.query(User).filter(User.email == member_data.email).first()
    if find_member is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Пользователь не найден')
    find_member_id = db.query(BoardMember).filter(BoardMember.board_id == board_id, BoardMember.user_id == find_member.id).first()
    if find_member_id:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='пользователь уже участник')
    new_member = BoardMember(
        board_id=board_id,
        user_id=find_member.id,
        role=member_data.role
    )
    db.add(new_member)
    db.commit()
    return MemberOut(
        user_id=find_member.id,
        email=find_member.email,
        first_name=find_member.first_name,
        role=member_data.role
    )

@router.patch('/boards/{board_id}/members/{user_id}', response_model=MemberOut)
def update_member_role(board_id:int, user_id:int, role_data:MemberRoleUpdate, member:BoardMember = Depends(require_board_role('owner')), db:Session = Depends(get_db)):
    find_member = db.query(BoardMember).options(joinedload(BoardMember.user)).filter(BoardMember.board_id == board_id, BoardMember.user_id == user_id).first()
    if find_member is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Участник не найден')
    if find_member.role == 'owner' and role_data.role != 'owner':
        if count_owners(db, board_id) <= 1:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='нельзя изменить роль последнего владельца')
    find_member.role = role_data.role
    db.commit()
    return MemberOut(
        user_id=find_member.user_id,
        email=find_member.user.email,
        first_name=find_member.user.first_name,
        role=find_member.role
    )

@router.delete('/boards/{board_id}/members/{user_id}')
def delete_member(board_id:int, user_id:int, member:BoardMember = Depends(require_board_role('editor')), db:Session = Depends(get_db)):
    find_member = db.query(BoardMember).filter(BoardMember.board_id == board_id, BoardMember.user_id == user_id).first()
    if find_member is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Участник не найден')
    if find_member.role == 'owner':
        if count_owners(db, board_id) <= 1:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail='нельзя изменить роль последнего владельца')
    db.delete(find_member)
    db.commit()
    return None