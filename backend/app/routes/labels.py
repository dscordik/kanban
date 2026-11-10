from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from starlette import status
from app.deps import get_db
from app.models import BoardMember, Label
from app.permissions import require_board_role, require_label_role
from app.schemas import LabelOut, LabelCreate, LabelUpdate

router = APIRouter()

@router.post('/boards/{board_id}/labels', response_model=LabelOut, status_code=status.HTTP_201_CREATED)
def create_label(board_id:int, data:LabelCreate, member:BoardMember = Depends(require_board_role('editor')), db:Session = Depends(get_db)):
    label = Label(
        board_id=board_id,
        name=data.name,
        color=data.color
    )
    db.add(label)
    db.commit()
    db.refresh(label)
    return label

@router.patch('/labels/{label_id}', response_model=LabelOut)
def update_label(label_id:int, data:LabelUpdate, member_and_label:tuple[BoardMember, Label] = Depends(require_label_role('editor')), db:Session = Depends(get_db)):
    _, label = member_and_label
    if 'name' in data.model_fields_set:
        label.name = data.name
    if 'color' in data.model_fields_set:
        label.color = data.color
    db.commit()
    db.refresh(label)
    return label

@router.delete('/labels/{label_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_label(label_id:int, member_and_label:tuple[BoardMember, Label] = Depends(require_label_role('editor')), db:Session = Depends(get_db)):
    _,label = member_and_label
    db.delete(label)
    db.commit()