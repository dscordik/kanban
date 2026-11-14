import * as React from "react";
import {useState} from "react";
import {useParams, Link, useNavigate} from "react-router-dom";
import {type Card, useBoardContent, useBoardRole, useCreateCard, useCreateColumn, useDeleteCard, useDeleteColumn, useRenameColumn, useUpdateCard} from "../../../Entities/board";
import {useAuth} from "../../../Entities/session";
import {BOARDS_PATH} from "../../../Shared/config/routes";
import {getErrorMessage} from "../../../Shared/lib/get-error-message";
import {Spinner} from "../../../Shared/ui/Spinner/Spinner";
import {RoleBadge} from "../../../Shared/ui/RoleBadge/RoleBadge";
import {Button} from "../../../Shared/ui/Button/Button";
import {RenameBoardModal} from "../../../Features/rename-board";
import {DeleteBoardModal} from "../../../Features/delete-board";
import {MembersDialog} from "../../../Features/manage-members";
import "./BoardPage.css";
import {Input} from "../../../Shared/ui/Input/Input.tsx";
import {EditCardModal} from "../../../Features/edit-card";
import {useBoardMembers} from "../../../Entities/board-member";

export const BoardPage: React.FC = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const {user} = useAuth();
    const {board, isOwner,canEdit, isLoading, isNotFound, error} = useBoardRole(id);

    if (!board) {
        return null
    }

    const {mutate:createColumnMutate, isPending: isCreatingColumn} = useCreateColumn(board.id)
    const {mutate:deleteColumnMutate, isPending: isDeletingColumn} = useDeleteColumn(board.id)

    const {mutate:createCardMutate, isPending:isCreatingCard} = useCreateCard(board.id)
    const {mutate:deleteCardMutate, isPending:isDeletingCard} = useDeleteCard(board.id)

    const {mutate:renameColumnMutate, isPending:isRenamingColumn} = useRenameColumn(board.id)

    const {mutate:updateCardMutate, isPending:isUpdatingCard} = useUpdateCard(board.id)

    const {data:members} = useBoardMembers(board.id)

    const [editingCard, setEditingCard] = useState<Card | null>(null)
    const [renamingColumnId, setRenamingColumnId] = useState<number | null>(null)
    const [renamingColumnTitle, setRenamingColumnTitle] = useState('')
    const [addingCardColumnId, setAddingCardColumnId] = useState<number | null>(null)
    const [newCardTitle, setNewCardTitle] = useState('')
    const [isAddingColumn, setIsAddingColumn] = useState(false)
    const [newColumnTitle, setNewColumnTitle] = useState('')
    const [isRenameOpen, setIsRenameOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isMembersOpen, setIsMembersOpen] = useState(false);
    const {
        data:content,
        isLoading:isContentLoading,
        isError:isContentError,
        error:contentError
    } = useBoardContent(board.id)

    if (isLoading) {
        return <Spinner text="Загрузка доски..." />;
    }
    if (isNotFound) {
        return (
            <div className="board-page__not-found">
                <h2>Доска не найдена или у вас нет доступа</h2>
                <Link to={BOARDS_PATH} className="board-page__link">К моим доскам</Link>
            </div>
        );
    }
    if (error) {
        return <div className="board-page__error">{getErrorMessage(error)}</div>;
    }
    if (isContentLoading) {
        return <Spinner text='Загрузка содержимого'/>
    }
    if (isContentError) {
        return <div>Ошибка {getErrorMessage(contentError)}</div>
    }
    if (!content) {
        return null
    }

    const goToBoards = () => navigate(BOARDS_PATH);

    return (
        <div className="board-page">
            <div className="board-page__header">
                <div className="board-page__title-wrapper">
                    <h1 className="board-page__title">{board.title}</h1>
                    <RoleBadge role={board.my_role} />
                </div>
                <div className="board-page__actions">
                    <Button onClick={() => setIsMembersOpen(true)}>Участники</Button>
                    {isOwner && (
                        <>
                            <Button variant="secondary" onClick={() => setIsRenameOpen(true)}>Переименовать</Button>
                            <Button variant="danger" onClick={() => setIsDeleteOpen(true)}>Удалить доску</Button>
                        </>
                    )}
                </div>
            </div>
            {board.description && <p className="board-page__description">{board.description}</p>}
            {content.columns.map((column) => (
                <div key={column.id}>
                    {canEdit && (
                        renamingColumnId === column.id ? (
                            <div>
                                <Input value={renamingColumnTitle} onChange={(e) => setRenamingColumnTitle(e.target.value)} onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        renameColumnMutate({columnId:column.id, title:renamingColumnTitle.trim()}, {onSuccess:() => {setRenamingColumnId(null)}})
                                    }
                                    if (e.key === 'Escape') {
                                        setRenamingColumnId(null)
                                    }
                                }}/>
                                <Button disabled={isRenamingColumn || !renamingColumnTitle.trim()} onClick={() => renameColumnMutate({columnId:column.id, title:renamingColumnTitle.trim()}, {onSuccess:()=> setRenamingColumnId(null)})}>Сохранить</Button>
                            </div>
                        ):(
                            <div>
                                <h3 onClick={() => { setRenamingColumnId(column.id); setRenamingColumnTitle(column.title)}}>{column.title}</h3>
                            </div>
                        )
                    )}
                    {canEdit && (
                        <Button disabled={isDeletingColumn} onClick={() => {
                            if (window.confirm('Удалить колонку?')) {
                                deleteColumnMutate(column.id, {
                                    onError:(error:any) => alert(error.response?.data?.detail || 'Ошибка удаления')
                                })
                            }}}>
                            Удалить
                        </Button>
                    )}
                    {column.cards.map((card) => (
                        <div key={card.id} onClick={() => canEdit && setEditingCard(card)} style={{ cursor: canEdit ? 'pointer' : 'default' }}>
                            <p>{card.title}</p>
                            {card.labels && card.labels.length > 0 && (
                                <div>
                                    {card.labels.map((label) => (
                                        <div key={label.id}>
                                            <span style={{ backgroundColor: label.color, color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>
                                                {label.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {canEdit && (
                                <Button
                                    disabled={isDeletingCard}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm('Удалить карточку?')) {
                                            deleteCardMutate(card.id, {
                                                onError: (error: any) => alert(error.response?.data?.detail || 'Ошибка удаления')
                                            })
                                        }
                                    }}
                                >
                                    x
                                </Button>
                            )}
                        </div>
                    ))}
                    {canEdit && (
                        addingCardColumnId === column.id ? (
                            <div>
                                <Input value={newCardTitle} onChange={(e) => setNewCardTitle(e.target.value)}/>
                                <Button disabled={isCreatingCard || !newCardTitle.trim()} onClick={() => createCardMutate({columnId:column.id, title:newCardTitle.trim()}, {
                                    onSuccess:() => {setNewCardTitle(''); setAddingCardColumnId(null)}
                                })}>
                                    Создать
                                </Button>
                                <Button onClick={() => {setNewCardTitle('');setAddingCardColumnId(null)}}>
                                    Отмена
                                </Button>
                            </div>
                        ): (
                            <div>
                                <Button onClick={() => setAddingCardColumnId(column.id)}>
                                    Добавить карточку
                                </Button>
                            </div>
                        )
                    )}
                </div>
            ))}
            {canEdit && (
                !isAddingColumn ? (
                <div><Button onClick={() => setIsAddingColumn(true)}>Добавить колонку</Button></div>
                ) : (
                <div>
                    <Input value={newColumnTitle} onChange={(e) => setNewColumnTitle(e.target.value)}/>
                    <Button disabled={isCreatingColumn || !newColumnTitle.trim()} onClick={() => createColumnMutate(newColumnTitle.trim(), {onSuccess: () => {setNewColumnTitle(''); setIsAddingColumn(false);}})}>
                        Создать
                    </Button>
                    <Button onClick={() => {setNewColumnTitle('');setIsAddingColumn(false)}}>
                        Отмена
                    </Button>
                </div>
                ))}
            {isOwner && (
                <>
                    <RenameBoardModal isOpen={isRenameOpen} onClose={() => setIsRenameOpen(false)} board={board}/>
                    <DeleteBoardModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} board={board} onDeleted={goToBoards}/>
                </>
            )}

            <MembersDialog boardId={board.id} boardTitle={board.title} isOpen={isMembersOpen} onClose={() => setIsMembersOpen(false)} myRole={board.my_role} myUserId={user?.id} onLeave={goToBoards}/>
            {editingCard && (
                <EditCardModal
                    isOpen={true}
                    card={editingCard}
                    members={members || []}
                    onClose={() => setEditingCard(null)}
                    onUpdate={(data) => {
                        updateCardMutate(
                            {cardId: editingCard.id, data},
                            {onSuccess: () => setEditingCard(null)}
                        );
                    }}
                    isPending={isUpdatingCard}
                />
            )}
        </div>
    );
};