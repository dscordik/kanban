import * as React from "react";
import {useState} from "react";
import type {Card, Label} from "../../../Entities/board";
import type {Member} from "../../../Entities/board-member";
import {getErrorMessage} from "../../../Shared/lib/get-error-message";
import {Button} from "../../../Shared/ui/Button/Button";
import {Input} from "../../../Shared/ui/Input/Input";
import {LabelChip} from "../../../Shared/ui/LabelChip/LabelChip";
import {Modal} from "../../../Shared/ui/Modal/Modal";
import {Select} from "../../../Shared/ui/Select/Select";
import "./EditCardModal.css";
import type {CardUpdate} from "../../../Entities/board/model/types.ts";

interface EditCardModalProps {
    isOpen: boolean
    card: Card
    members: Member[]
    labels: Label[]
    canEdit: boolean
    isPending: boolean
    isDeleting: boolean
    error: Error | null
    onClose: () => void
    onSave: (data: CardUpdate) => void
    onDelete: () => void
}

export const EditCardModal: React.FC<EditCardModalProps> = ({isOpen, card, members, labels, canEdit, isPending, isDeleting, error, onClose, onSave, onDelete}) => {

    const [title, setTitle] = useState(card.title)
    const [description, setDescription] = useState(card.description ?? '')
    const [assigneeId, setAssigneeId] = useState<number | null>(card.assignee_id)
    const [dueDate, setDueDate] = useState(card.due_date ?? '')
    const [labelIds, setLabelIds] = useState<number[]>(card.labels.map((label) => label.id))
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

    const changes: CardUpdate = {}
    if (title.trim() !== card.title) {
        changes.title = title.trim()
    }
    if (description.trim() !== (card.description ?? '').trim()) {
        changes.description = description.trim() || null
    }
    if (assigneeId !== card.assignee_id) {
        changes.assignee_id = assigneeId
    }
    if ((dueDate || null) !== card.due_date) {
        changes.due_date = dueDate || null
    }
    const initialLabelIds = card.labels.map((label) => label.id)
    const sameLabels = initialLabelIds.length === labelIds.length && initialLabelIds.every((id) => labelIds.includes(id))
    if (!sameLabels) {
        changes.label_ids = labelIds
    }
    const hasChanges = Object.keys(changes).length > 0

    const handleClose = () => {
        if (canEdit && hasChanges && !window.confirm('Закрыть без сохранения изменений?')) {
            return
        }
        onClose()
    }

    const toggleLabel = (labelId: number) => {
        setLabelIds((current) =>
            current.includes(labelId) ? current.filter((id) => id !== labelId) : [...current, labelId]
        )
    }

    return (
        <Modal isOpen={isOpen} title={canEdit ? 'Редактировать карточку' : 'Карточка'} onClose={handleClose}>
            <div className="edit-card">
                <div className="edit-card__field">
                    <label className="edit-card__label" htmlFor="edit-card-title">Название</label>
                    <Input
                        id="edit-card-title"
                        value={title}
                        maxLength={200}
                        disabled={!canEdit}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div className="edit-card__field">
                    <label className="edit-card__label" htmlFor="edit-card-description">Описание</label>
                    <textarea
                        id="edit-card-description"
                        className="edit-card__textarea"
                        value={description}
                        maxLength={2000}
                        rows={4}
                        disabled={!canEdit}
                        placeholder={canEdit ? 'Добавьте описание' : 'Описания нет'}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div className="edit-card__row">
                    <div className="edit-card__field">
                        <label className="edit-card__label" htmlFor="edit-card-assignee">Исполнитель</label>
                        <Select
                            id="edit-card-assignee"
                            value={assigneeId ? String(assigneeId) : ''}
                            disabled={!canEdit}
                            onChange={(e) => setAssigneeId(e.target.value ? Number(e.target.value) : null)}
                        >
                            <option value="">Не назначен</option>
                            {members.map((member) => (
                                <option key={member.user_id} value={String(member.user_id)}>
                                    {member.first_name || member.email}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="edit-card__field">
                        <label className="edit-card__label" htmlFor="edit-card-due">Срок</label>
                        <div className="edit-card__date">
                            <Input
                                id="edit-card-due"
                                type="date"
                                value={dueDate}
                                disabled={!canEdit}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                            {canEdit && dueDate && (
                                <Button size="sm" variant="secondary" onClick={() => setDueDate('')}>Убрать</Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="edit-card__field">
                    <span className="edit-card__label">Метки</span>
                    <div className="edit-card__labels">
                        {canEdit ? (
                            labels.length === 0 ? (
                                <p className="edit-card__hint">На доске пока нет меток</p>
                            ) : (
                                labels.map((label) => (
                                    <LabelChip
                                        key={label.id}
                                        name={label.name}
                                        color={label.color}
                                        selected={labelIds.includes(label.id)}
                                        onClick={() => toggleLabel(label.id)}
                                    />
                                ))
                            )
                        ) : card.labels.length === 0 ? (
                            <p className="edit-card__hint">Меток нет</p>
                        ) : (
                            card.labels.map((label) => (
                                <LabelChip key={label.id} name={label.name} color={label.color}/>
                            ))
                        )}
                    </div>
                </div>

                {error && <div className="edit-card__error">{getErrorMessage(error)}</div>}

                <div className="edit-card__actions">
                    {canEdit && (
                        <div className="edit-card__danger-zone">
                            {isConfirmingDelete ? (
                                <>
                                    <span className="edit-card__confirm-text">Удалить карточку? Это нельзя отменить</span>
                                    <Button size="sm" variant="secondary" disabled={isDeleting} onClick={() => setIsConfirmingDelete(false)}>
                                        Нет
                                    </Button>
                                    <Button size="sm" variant="danger" disabled={isDeleting} onClick={onDelete}>
                                        {isDeleting ? 'Удаление...' : 'Да, удалить'}
                                    </Button>
                                </>
                            ) : (
                                <Button size="sm" variant="danger" onClick={() => setIsConfirmingDelete(true)}>
                                    Удалить карточку
                                </Button>
                            )}
                        </div>
                    )}
                    <div className="edit-card__buttons">
                        <Button variant="secondary" onClick={handleClose}>{canEdit ? 'Отмена' : 'Закрыть'}</Button>
                        {canEdit && (
                            <Button disabled={isPending || !hasChanges || !title.trim()} onClick={() => onSave(changes)}>
                                {isPending ? 'Сохранение...' : 'Сохранить'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    )
}