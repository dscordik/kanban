import * as React from "react";
import {useEffect, useState} from "react";
import "./Board.css";
import {useBoardMembers} from "../../../../Entities/board-member";
import {Spinner} from "../../../../Shared/ui/Spinner/Spinner.tsx";
import {getErrorMessage} from "../../../../Shared/lib/get-error-message.ts";
import {BoardColumn} from "../BoardColumn/BoardColumn.tsx";
import {Input} from "../../../../Shared/ui/Input/Input.tsx";
import {Button} from "../../../../Shared/ui/Button/Button.tsx";
import {EditCardModal} from "../../../../Features/edit-card";
import {getNeighbors, useBoardContent, useCreateColumn, useDeleteCard, useUpdateCard} from "../../../../Entities/board";
import {
    DndContext,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    closestCorners,
    type DragStartEvent, type DragOverEvent, type DragEndEvent, DragOverlay
} from "@dnd-kit/core";
import {getCardDndId, getColumnDndId, parseDndId} from "../../../../Entities/board/lib/dnd-utils.ts";
import {useMoveCard} from "../../../../Entities/board/model/use-move-card.ts";
import {horizontalListSortingStrategy, SortableContext} from "@dnd-kit/sortable";
import {useMoveColumn} from "../../../../Entities/board/model/use-move-column.ts";

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

    const sensor = useSensors(useSensor(PointerSensor, {activationConstraint: {distance:6}}), useSensor(TouchSensor, {activationConstraint:{delay:200, tolerance:5}}))
    const [activeId, setActiveId] = useState<string | null>(null)
    const [_overId, setOverId] = useState<string | null>(null)
    const [localColumns, setLocalColumns] = useState(content?.columns ?? [])
    const [didDrag, setDidDrag] = useState(false)
    const moveCard = useMoveCard(boardId)
    const moveColumn = useMoveColumn(boardId)

    useEffect(() => {
        if (content?.columns !== localColumns && activeId === null) {
            setLocalColumns(content!.columns)
        }
    }, [content?.columns, activeId]);

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

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(String(event.active.id))
        setLocalColumns(content.columns)
    }

    const handleDragOver = (event: DragOverEvent) => {
        if (!event.over) {
            return
        }
        setOverId(String(event.over.id) ?? null)
        if (event.over.id === activeId) {
            return
        }
        const parsedId = parseDndId(activeId!)
        const overParsed = parseDndId(String(event.over.id))
        if (parsedId.type === 'card') {
            const fromColumn = localColumns.find((item) => item.cards.some((item) => item.id === parsedId.id))
            if (!fromColumn) {
                return
            }
            let toColumn = null
            if (overParsed.type === 'column') {
                toColumn = localColumns.find((item) => item.id === overParsed.id)
            } else if (overParsed.type === 'card') {
                toColumn = localColumns.find((item) => item.cards.some((item) => item.id === overParsed.id))
            }
            if (!toColumn) {
                return
            }
            if (fromColumn.id !== toColumn.id) {
                const card = fromColumn.cards.find((item) => item.id === parsedId.id)
                if (!card) return
                const newFromCards = fromColumn.cards.filter((item) => item.id !== parsedId.id)
                let insertIndex = 0
                if (overParsed.type === 'column') {
                    insertIndex = toColumn.cards.length
                } else if (overParsed.type === 'card') {
                    const overIndex = toColumn.cards.findIndex((item) => item.id === overParsed.id)
                    insertIndex = overIndex >= 0 ? overIndex : toColumn.cards.length
                }
                const newToCards = [...toColumn.cards]
                newToCards.splice(insertIndex, 0, card)
                const newFromColumn = { ...fromColumn, cards: newFromCards }
                const newToColumn = { ...toColumn, cards: newToCards }
                const newColumns = localColumns.map((item) => {
                    if (item.id === fromColumn.id) return newFromColumn
                    if (item.id === toColumn.id) return newToColumn
                    return item
                })
                setLocalColumns(newColumns)
            }
        }
    }

    const handleDragEnd = (event: DragEndEvent) => {
        if (!event.over) {
            setActiveId(null)
            setOverId(null)
            return
        }
        if (event.over.id === activeId) {
            setActiveId(null)
            setOverId(null)
            return
        }
        const activeParsed = parseDndId(activeId!)
        const overParsed = parseDndId(String(event.over.id))
        if (activeParsed.type === 'card') {
            let toColumn = null
            if (overParsed.type === 'column') {
                toColumn = localColumns.find((item) => item.id === overParsed.id)
            } else if (overParsed.type === 'card') {
                toColumn = localColumns.find((item) => item.cards.some((item) => item.id === overParsed.id))
            }
            if (!toColumn) {
                setActiveId(null)
                setOverId(null)
                return
            }
            let toIndex = 0
            if (overParsed.type === 'column') {
                toIndex = toColumn.cards.length
            } else if (overParsed.type === 'card') {
                const overIndex = toColumn.cards.findIndex((item) => item.id === overParsed.id)
                toIndex = overIndex >= 0 ? overIndex : toColumn.cards.length
            }
            const cardIds = toColumn.cards.map((item) => getCardDndId(item.id))
            const { afterId, beforeId } = getNeighbors(cardIds, toIndex)
            const afterIdNumber = afterId ? parseDndId(afterId).id : null
            const beforeIdNumber = beforeId ? parseDndId(beforeId).id : null
            moveCard.mutate({
                cardId: activeParsed.id,
                payload: {
                    column_id: toColumn.id,
                    after_id: afterIdNumber,
                    before_id: beforeIdNumber
                },
                toIndex
            })
        } else if (activeParsed.type === 'column') {
            const indexC = localColumns.findIndex((item) => getColumnDndId(item.id) === String(event.over?.id))
            let toIndex = 0
            if (indexC >= 0) {
                toIndex = indexC
            } else if (indexC === -1) {
                toIndex = localColumns.length
                setActiveId(null)
                setOverId(null)
                return
            }
            const columnIds = localColumns.map((item) => getColumnDndId(item.id))
            const {afterId, beforeId} = getNeighbors(columnIds, toIndex)
            const afterIdNumber = afterId ? parseDndId(afterId).id : null
            const beforeIdNumber = beforeId ? parseDndId(beforeId).id : null
            moveColumn.mutate({
                columnId:activeParsed.id,
                payload: {
                    after_id:afterIdNumber,
                    before_id:beforeIdNumber
                },
                toIndex
            })
        }
        setActiveId(null)
        setOverId(null)
        setDidDrag(true)
        setTimeout(() => setDidDrag(false), 0)
    }

    const handleDragCancel = () => {
        setActiveId(null)
        setOverId(null)
    }

    return (
        <div className="board">
            <DndContext collisionDetection={closestCorners} sensors={sensor} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
                {localColumns.length === 0 && (
                    <div className="board__empty">
                        {canEdit ? 'Добавьте первую колонку' : 'На доске пока пусто'}
                    </div>
                )}

                {(localColumns.length > 0 || canEdit) && (
                    <div className="board__columns">
                        <SortableContext strategy={horizontalListSortingStrategy} items={localColumns.map((item) => getColumnDndId(item.id))}>
                            {localColumns.map((column) => (
                                <BoardColumn didDrag={didDrag} key={column.id} column={column} boardId={boardId} canEdit={canEdit} members={members} onOpenCard={setEditingCardId}/>
                            ))}
                        </SortableContext>


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
                <DragOverlay>
                    {activeId !== null && parseDndId(activeId).type === 'card' && (() => {
                        const cardId = parseDndId(activeId).id
                        const card = localColumns.flatMap((item) => item.cards).find((item) => item.id === cardId)
                        if (!card) {
                            return null
                        }
                        return (
                            <div className="card-item card-item--overlay">
                                <span className="card-item__title">{card.title}</span>
                            </div>
                        )
                    })()}
                    {activeId !== null && parseDndId(activeId).type === 'column' && (() => {
                        const columnId = parseDndId(activeId).id
                        const column = localColumns.find((item) => item.id === columnId)
                        if (!column) {
                            return null
                        }
                        return (
                            <div className="board-column column-item--overlay">
                                <span className="board-column__title">{column.title}</span>
                            </div>
                        )
                    })()}
                </DragOverlay>
            </DndContext>

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