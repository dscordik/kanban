import * as React from "react";
import {useEffect, useRef, useState} from "react";
import "./BoardColumn.css";
import {useCreateCard, useDeleteColumn, useRenameColumn, type ColumnWithCards } from "../../../../Entities/board";
import type { Member } from "../../../../Entities/board-member";
import {Input} from "../../../../Shared/ui/Input/Input.tsx";
import {Button} from "../../../../Shared/ui/Button/Button.tsx";
import {getErrorMessage} from "../../../../Shared/lib/get-error-message.ts";
import { CardItem } from "../CardItem/CardItem.tsx";
import {Modal} from "../../../../Shared/ui/Modal/Modal.tsx";

interface BoardColumnProps {
    column: ColumnWithCards
    boardId: number
    canEdit: boolean
    members: Member[]
    onOpenCard: (cardId: number) => void
}

export const BoardColumn: React.FC<BoardColumnProps> = ({column, boardId, canEdit, members, onOpenCard}) => {
    const renameColumn = useRenameColumn(boardId)
    const createCard = useCreateCard(boardId)
    const deleteColumn = useDeleteColumn(boardId)

    const menuRef = useRef<HTMLDivElement>(null)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isRenaming, setIsRenaming] = useState(false)
    const [renameTitle, setRenameTitle] = useState(column.title)
    const [isAddingCard, setIsAddingCard] = useState(false)
    const [newCardTitle, setNewCardTitle] = useState('')
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    useEffect(() => {
        if (!isMenuOpen) return
        const handleMouseDown = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleMouseDown)
        return () => document.removeEventListener('mousedown', handleMouseDown)
    }, [isMenuOpen])

    const startRename = () => {
        setRenameTitle(column.title)
        renameColumn.reset()
        setIsMenuOpen(false)
        setIsRenaming(true)
    }

    const cancelRename = () => {
        setIsRenaming(false)
        renameColumn.reset()
    }

    const submitRename = () => {
        const title = renameTitle.trim()
        if (!title) return
        if (title === column.title) {
            cancelRename()
            return
        }
        renameColumn.mutate({columnId: column.id, title}, {onSuccess: () => setIsRenaming(false)})
    }

    const submitCard = () => {
        const title = newCardTitle.trim()
        if (!title) return
        createCard.mutate({columnId: column.id, title}, {onSuccess: () => setNewCardTitle('')})
    }

    const cancelCard = () => {
        setNewCardTitle('')
        setIsAddingCard(false)
        createCard.reset()
    }

    const openDelete = () => {
        setIsMenuOpen(false)
        setIsDeleteOpen(true)
    }

    const closeDelete = () => {
        setIsDeleteOpen(false)
        deleteColumn.reset()
    }

    return (
        <section className="board-column">
            <div className="board-column__header">
                {isRenaming ? (
                    <div className="board-column__rename">
                        <Input
                            compact
                            autoFocus
                            maxLength={100}
                            value={renameTitle}
                            onChange={(e) => setRenameTitle(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') submitRename()
                                if (e.key === 'Escape') cancelRename()
                            }}
                        />
                        <Button size="sm" disabled={renameColumn.isPending || !renameTitle.trim()} onClick={submitRename}>
                            ОК
                        </Button>
                    </div>
                ) : (
                    <>
                        <h3 className="board-column__title">{column.title}</h3>
                        <span className="board-column__count">{column.cards.length}</span>
                        {canEdit && (
                            <div className="board-column__menu" ref={menuRef}>
                                <button type="button" className="board-column__menu-btn" aria-label="Меню колонки" aria-expanded={isMenuOpen} onClick={() => setIsMenuOpen((open) => !open)}>⋯</button>
                                {isMenuOpen && (
                                    <div className="board-column__dropdown" role="menu">
                                        <button type="button" role="menuitem" className="board-column__dropdown-item" onClick={startRename}>Переименовать</button>
                                        <button type="button" role="menuitem" className="board-column__dropdown-item board-column__dropdown-item--danger" onClick={openDelete}>
                                            Удалить колонку
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {renameColumn.isError && (
                <div className="board-column__error">{getErrorMessage(renameColumn.error)}</div>
            )}

            <div className="board-column__cards">
                {column.cards.length === 0 && <p className="board-column__empty">Нет карточек</p>}
                {column.cards.map((card) => (
                    <CardItem key={card.id} card={card} members={members} onClick={() => onOpenCard(card.id)}/>
                ))}
            </div>

            {canEdit && (
                <div className="board-column__footer">
                    {isAddingCard ? (
                        <div className="board-column__add-form">
                            <Input autoFocus placeholder="Название карточки" maxLength={200} value={newCardTitle} onChange={(e) => setNewCardTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') submitCard()
                                    if (e.key === 'Escape') cancelCard()
                                }}
                            />
                            {createCard.isError && (<div className="board-column__error">{getErrorMessage(createCard.error)}</div>)}
                            <div className="board-column__add-actions">
                                <Button size="sm" disabled={createCard.isPending || !newCardTitle.trim()} onClick={submitCard}>Добавить</Button>
                                <Button size="sm" variant="secondary" onClick={cancelCard}>Закрыть</Button>
                            </div>
                        </div>
                    ) : (
                        <button type="button" className="board-column__add-trigger" onClick={() => setIsAddingCard(true)}>+ Добавить карточку</button>
                    )}
                </div>
            )}

            {canEdit && (
                <Modal isOpen={isDeleteOpen} title="Удаление колонки" onClose={closeDelete}>
                    <p className="board-column__confirm-text">Удалить колонку {column.title}? Это действие нельзя отменить</p>
                    {deleteColumn.isError && (<div className="board-column__error">{getErrorMessage(deleteColumn.error)}</div>)}
                    <div className="board-column__confirm-actions">
                        <Button variant="secondary" onClick={closeDelete} disabled={deleteColumn.isPending}>Отмена</Button>
                        <Button variant="danger" disabled={deleteColumn.isPending} onClick={() => deleteColumn.mutate(column.id, {onSuccess: closeDelete})}>
                            {deleteColumn.isPending ? 'Удаление...' : 'Удалить'}
                        </Button>
                    </div>
                </Modal>
            )}
        </section>
    )
}