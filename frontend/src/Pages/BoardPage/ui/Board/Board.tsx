import * as React from "react";
import {useRef, useState} from "react";
import "./Board.css";
import {useBoardMembers} from "../../../../Entities/board-member";
import {Spinner} from "../../../../Shared/ui/Spinner/Spinner.tsx";
import {getErrorMessage} from "../../../../Shared/lib/get-error-message.ts";
import {BoardColumn} from "../BoardColumn/BoardColumn.tsx";
import {Input} from "../../../../Shared/ui/Input/Input.tsx";
import {Button} from "../../../../Shared/ui/Button/Button.tsx";
import {EditCardModal} from "../../../../Features/edit-card";
import {
    getNeighbors,
    useBoardContent,
    useCreateColumn,
    useDeleteCard,
    useUpdateCard,
    type ColumnWithCards
} from "../../../../Entities/board";
import {
    closestCorners,
    DndContext,
    DragOverlay,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type CollisionDetection,
    type DragEndEvent,
    type DragOverEvent,
    type DragStartEvent
} from "@dnd-kit/core";
import {arrayMove, horizontalListSortingStrategy, SortableContext} from "@dnd-kit/sortable";
import {getColumnDndId, parseDndId} from "../../../../Entities/board/lib/dnd-utils.ts";
import {useMoveCard} from "../../../../Entities/board/model/use-move-card.ts";
import {useMoveColumn} from "../../../../Entities/board/model/use-move-column.ts";
import {CardContent} from "../CardItem/CardItem.tsx";

interface BoardProps {
    boardId: number
    canEdit: boolean
}

const findColumnByCard = (columns: ColumnWithCards[], cardId: number) =>
    columns.find((column) => column.cards.some((card) => card.id === cardId))

const findTargetColumn = (columns: ColumnWithCards[], overId: string) => {
    const over = parseDndId(overId)
    return over.type === 'card'
        ? findColumnByCard(columns, over.id)
        : columns.find((column) => column.id === over.id)
}

const collisionDetection: CollisionDetection = (args) => {
    const isColumn = args.active.data.current?.type === 'column'
    return closestCorners({
        ...args,
        droppableContainers: args.droppableContainers.filter(
            (container) => (container.data.current?.type === 'column') === isColumn
        )
    })
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

    const [activeId, setActiveId] = useState<string | null>(null)
    const [overColumnId, setOverColumnId] = useState<number | null>(null)
    const [localColumns, setLocalColumns] = useState<ColumnWithCards[]>([])
    const [moveError, setMoveError] = useState<string | null>(null)
    const justDraggedRef = useRef(false)

    const handleMoveError = (err: unknown) => setMoveError(getErrorMessage(err))
    const moveCard = useMoveCard(boardId, handleMoveError)
    const moveColumn = useMoveColumn(boardId, handleMoveError)

    const pointerSensor = useSensor(PointerSensor, {activationConstraint: {distance: 6}})
    const touchSensor = useSensor(TouchSensor, {activationConstraint: {delay: 200, tolerance: 5}})
    // у наблюдателя датчиков нет вообще
    const sensors = useSensors(...(canEdit ? [pointerSensor, touchSensor] : []))

    if (isLoading) {
        return <Spinner text="Загрузка содержимого..."/>
    }
    if (isError) {
        return <div className="board__error">{getErrorMessage(error)}</div>
    }
    if (!content) {
        return null
    }

    const columns = activeId !== null ? localColumns : content.columns
    const editingCard = content.columns.flatMap((column) => column.cards).find((card) => card.id === editingCardId) ?? null

    const active = activeId ? parseDndId(activeId) : null
    const activeCard = active?.type === 'card'
        ? columns.flatMap((column) => column.cards).find((card) => card.id === active.id)
        : undefined
    const activeColumn = active?.type === 'column'
        ? columns.find((column) => column.id === active.id)
        : undefined

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

    const finishDrag = () => {
        setActiveId(null)
        setOverColumnId(null)
        justDraggedRef.current = true
        setTimeout(() => {
            justDraggedRef.current = false
        }, 0)
    }

    const handleDragStart = (event: DragStartEvent) => {
        setMoveError(null)
        setLocalColumns(content.columns)
        setActiveId(String(event.active.id))
    }

    const handleDragOver = ({active: dragActive, over}: DragOverEvent) => {
        if (!over) {
            setOverColumnId(null)
            return
        }
        const dragged = parseDndId(String(dragActive.id))
        if (dragged.type !== 'card') return
        const overParsed = parseDndId(String(over.id))

        setOverColumnId(findTargetColumn(localColumns, String(over.id))?.id ?? null)

        setLocalColumns((prev) => {
            const toColumn = findTargetColumn(prev, String(over.id))
            const fromColumn = findColumnByCard(prev, dragged.id)
            if (!toColumn || !fromColumn || toColumn.id === fromColumn.id) return prev

            const card = fromColumn.cards.find((item) => item.id === dragged.id)
            if (!card) return prev

            let insertIndex = toColumn.cards.length
            if (overParsed.type === 'card') {
                const overIndex = toColumn.cards.findIndex((item) => item.id === overParsed.id)
                if (overIndex >= 0) insertIndex = overIndex
            }

            return prev.map((column) => {
                if (column.id === fromColumn.id) {
                    return {...column, cards: column.cards.filter((item) => item.id !== dragged.id)}
                }
                if (column.id === toColumn.id) {
                    const cards = [...column.cards]
                    cards.splice(insertIndex, 0, card)
                    return {...column, cards}
                }
                return column
            })
        })
    }

    const handleDragEnd = ({active: dragActive, over}: DragEndEvent) => {
        finishDrag()
        if (!over) return

        const dragged = parseDndId(String(dragActive.id))
        const overParsed = parseDndId(String(over.id))

        if (dragged.type === 'card') {
            const toColumn = findTargetColumn(localColumns, String(over.id))
            if (!toColumn) return
            let ids = toColumn.cards.map((card) => card.id)
            const fromIndex = ids.indexOf(dragged.id)
            if (fromIndex === -1) return
            if (overParsed.type === 'card' && overParsed.id !== dragged.id) {
                const overIndex = ids.indexOf(overParsed.id)
                if (overIndex >= 0) ids = arrayMove(ids, fromIndex, overIndex)
            }
            const toIndex = ids.indexOf(dragged.id)
            const origin = findColumnByCard(content.columns, dragged.id)
            const originIndex = origin ? origin.cards.findIndex((card) => card.id === dragged.id) : -1
            if (origin?.id === toColumn.id && originIndex === toIndex) return

            const {afterId, beforeId} = getNeighbors(ids, toIndex)
            moveCard.mutate({
                cardId: dragged.id,
                toIndex,
                payload: {column_id: toColumn.id, after_id: afterId, before_id: beforeId}
            })
            return
        }

        if (dragged.type === 'column' && overParsed.type === 'column') {
            let ids = localColumns.map((column) => column.id)
            const fromIndex = ids.indexOf(dragged.id)
            const overIndex = ids.indexOf(overParsed.id)
            if (fromIndex === -1 || overIndex === -1 || fromIndex === overIndex) return

            ids = arrayMove(ids, fromIndex, overIndex)
            const {afterId, beforeId} = getNeighbors(ids, overIndex)
            moveColumn.mutate({
                columnId: dragged.id,
                toIndex: overIndex,
                payload: {after_id: afterId, before_id: beforeId}
            })
        }
    }

    const handleDragCancel = () => finishDrag()

    return (
        <div className="board">
            {moveError && (
                <div className="board__notice" role="alert">
                    <span className="board__notice-text">{moveError}</span>
                    <button type="button" className="board__notice-close" aria-label="Закрыть" onClick={() => setMoveError(null)}>&times;</button>
                </div>
            )}

            <DndContext
                sensors={sensors}
                collisionDetection={collisionDetection}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                {columns.length === 0 && (
                    <div className="board__empty">
                        {canEdit ? 'Добавьте первую колонку' : 'На доске пока пусто'}
                    </div>
                )}

                {(columns.length > 0 || canEdit) && (
                    <div className="board__columns">
                        <SortableContext strategy={horizontalListSortingStrategy} items={columns.map((item) => getColumnDndId(item.id))}>
                            {columns.map((column) => (
                                <BoardColumn
                                    key={column.id}
                                    column={column}
                                    boardId={boardId}
                                    canEdit={canEdit}
                                    members={members}
                                    isDropTarget={overColumnId === column.id}
                                    wasJustDragged={() => justDraggedRef.current}
                                    onOpenCard={setEditingCardId}
                                />
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
                    {activeCard && (
                        <div className="card-item card-item--overlay">
                            <CardContent card={activeCard} members={members}/>
                        </div>
                    )}
                    {activeColumn && (
                        <div className="board-column board-column--overlay">
                            <div className="board-column__header">
                                <h3 className="board-column__title">{activeColumn.title}</h3>
                                <span className="board-column__count">{activeColumn.cards.length}</span>
                            </div>
                        </div>
                    )}
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