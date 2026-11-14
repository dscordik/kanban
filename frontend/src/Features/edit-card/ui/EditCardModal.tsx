import * as React from "react";
import type {Card} from "../../../Entities/board";
import type { Member } from "../../../Entities/board-member";
import {useEffect, useState} from "react";
import {Modal} from "../../../Shared/ui/Modal/Modal.tsx";
import {Input} from "../../../Shared/ui/Input/Input.tsx";
import {Select} from "../../../Shared/ui/Select/Select.tsx";
import {Button} from "../../../Shared/ui/Button/Button.tsx";
import './EditCardModal.css'

interface EditCardModalProps{
    isOpen:boolean,
    onClose:() => void,
    card:Card,
    members:Member[],
    onUpdate:(data:Partial<Card>) => void,
    isPending:boolean
}

export const EditCardModal:React.FC<EditCardModalProps> = ({card, onClose, isOpen, members, onUpdate, isPending}) => {
    const [title,setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [assigneeId, setAssigneeId] = useState<number | null>(null)
    const [dueDate, setDueDate] = useState<string>('')

    useEffect(() => {
        if (card && isOpen) {
            setTitle(card.title)
            setDescription(card.description || '')
            setAssigneeId(card.assignee_id)
            setDueDate((card.due_date?.slice(0,10) || ''))
        }
    }, [card, isOpen]);

    return(
        <div>
            <Modal isOpen={isOpen} title='Редактировать карточку' onClose={onClose}>
                <Input placeholder='Название' value={title} onChange={(e) => setTitle(e.target.value)}/>
                <label>Описание</label>
                <textarea aria-label='Описание' value={description} onChange={(e) => setDescription(e.target.value)} rows={4}></textarea>
                <label>Исполнитель</label>
                <Select value={assigneeId ? String(assigneeId) : ''} onChange={(e) => setAssigneeId(e.target.value ? Number(e.target.value) : null)}>
                    <option value=''>Без исполнителя</option>
                    {members.map((member) => (
                        <option key={member.user_id} value={String(member.user_id)}>{member.first_name || member.email}</option>
                    ))}
                </Select>
                <label>Срок</label>
                <Input type='date' value={dueDate} onChange={(e) => setDueDate(e.target.value)}/>
                <Button disabled={isPending} onClick={() => onUpdate({title, description, assignee_id:assigneeId, due_date:dueDate || null})}>Сохранить</Button>
                <Button onClick={() => onClose()}>Отмена</Button>
            </Modal>
        </div>
    )
}