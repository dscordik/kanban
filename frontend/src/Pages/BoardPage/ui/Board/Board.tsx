import * as React from "react";
import {useState} from "react";
import "./Board.css";
import {useBoardMembers} from "../../../../Entities/board-member";
import {Spinner} from "../../../../Shared/ui/Spinner/Spinner.tsx";
import {getErrorMessage} from "../../../../Shared/lib/get-error-message.ts";
import {BoardColumn} from "../BoardColumn/BoardColumn.tsx";
import {Input} from "../../../../Shared/ui/Input/Input.tsx";
import {Button} from "../../../../Shared/ui/Button/Button.tsx";
import {EditCardModal} from "../../../../Features/edit-card";
import {useBoardContent, useCreateColumn, useDeleteCard, useUpdateCard} from "../../../../Entities/board";

interface BoardProps {
    boardId: number
    canEdit: boolean
}

export const Board: React.FC<BoardProps> = ({boardId, canEdit}) => {
    const {data: content, isLoading, isError, error} = useBoardContent(boardId)
    const {data: members = []} = useBoardMembers(boardId)
    const createColumn = useCreateColumn(boardId)
    const updateCard = useUpdateCard(boardId)
    const deleteCard = useDeleteCard(boardId)

    const [editingCardId, setEditingCardId] = useState<number | null>(null)
    const [isAddingColumn, setIsAddingColumn] = useState(false)
    const [newColumnTitle, setNewColumnTitle] = useState('')

    if (isLoading) {
        return <Spinner text="Загрузка содержимого..."/>
    }
    if (isError) {
        return <div className="board__error">{getErrorMessage(error)}</div>
    }
    if (!content) {
        return null
    }

    const editingCard = content.columns.flatMap((column) => column.cards).find((card) => card.id === editingCardId) ?? null

    const submitColumn = () => {
        const title = newColumnTitle.trim()
        if (!title) return
        createColumn.mutate(title, {
            onSuccess: () => {
                setNewColumnTitle('')
                setIsAddingColumn(false)
            }
        })
    }

    const cancelColumn = () => {
        setNewColumnTitle('')
        setIsAddingColumn(false)
        createColumn.reset()
    }

    const closeCardModal = () => {
        setEditingCardId(null)
        updateCard.reset()
        deleteCard.reset()
    }

    return (
        <div className="board">
            {content.columns.length === 0 && (
                <div className="board__empty">
                    {canEdit ? 'Добавьте первую колонку' : 'На доске пока пусто'}
                </div>
            )}

            {(content.columns.length > 0 || canEdit) && (
                <div className="board__columns">
                    {content.columns.map((column) => (
                        <BoardColumn key={column.id} column={column} boardId={boardId} canEdit={canEdit} members={members} onOpenCard={setEditingCardId}/>
                    ))}

                    {canEdit && (
                        <div className="board__add-column">
                            {isAddingColumn ? (
                                <div className="board__add-form">
                                    <Input autoFocus placeholder="Название колонки" maxLength={100} value={newColumnTitle} onChange={(e) => setNewColumnTitle(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') submitColumn()
                                            if (e.key === 'Escape') cancelColumn()
                                        }}
                                    />
                                    {createColumn.isError && (
                                        <div className="board__add-error">{getErrorMessage(createColumn.error)}</div>
                                    )}
                                    <div className="board__add-actions">
                                        <Button size="sm" disabled={createColumn.isPending || !newColumnTitle.trim()} onClick={submitColumn}>Добавить</Button>
                                        <Button size="sm" variant="secondary" onClick={cancelColumn}>Отмена</Button>
                                    </div>
                                </div>
                            ) : (
                                <button type="button" className="board__add-trigger" onClick={() => setIsAddingColumn(true)}>+ Добавить колонку</button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {editingCard && (
                <EditCardModal
                    key={editingCard.id}
                    isOpen
                    card={editingCard}
                    members={members}
                    labels={content.labels}
                    canEdit={canEdit}
                    isPending={updateCard.isPending}
                    isDeleting={deleteCard.isPending}
                    error={updateCard.error ?? deleteCard.error}
                    onClose={closeCardModal}
                    onSave={(data) => updateCard.mutate({cardId: editingCard.id, data}, {onSuccess: closeCardModal})}
                    onDelete={() => deleteCard.mutate(editingCard.id, {onSuccess: closeCardModal})}
                />
            )}
        </div>
    )
}