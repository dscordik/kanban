import * as React from "react";
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {useBoardRole, updateBoard, deleteBoard, boardKeys, type BoardUpdate,} from "../../../Entities/board";
import { BOARDS_PATH } from "../../../Shared/config/routes";
import { Spinner } from "../../../Shared/ui/Spinner/Spinner.tsx";
import { getErrorMessage } from "../../../Shared/lib/get-error-message.ts";
import { RoleBadge } from "../../../Shared/ui/RoleBadge/RoleBadge.tsx";
import { Button } from "../../../Shared/ui/Button/Button.tsx";
import { Modal } from "../../../Shared/ui/Modal/Modal.tsx";
import { Input } from "../../../Shared/ui/Input/Input.tsx";
import { MembersDialog } from "../../../Features/manage-members/ui/MembersDialog.tsx";
import { useAuth } from "../../../Entities/session";


interface RenameBoardModalProps {
    isOpen: boolean;
    onClose: () => void;
    boardId: number;
    initialTitle: string;
    initialDescription: string | null;
}

const RenameBoardModal: React.FC<RenameBoardModalProps> = ({isOpen, onClose, boardId, initialTitle, initialDescription,}) => {
    const [title, setTitle] = useState(initialTitle);
    const [description, setDescription] = useState(initialDescription || "");
    const queryClient = useQueryClient();

    useEffect(() => {
        if (isOpen) {
            setTitle(initialTitle);
            setDescription(initialDescription || "");
        }
    }, [isOpen, initialTitle, initialDescription]);

    const mutation = useMutation({
        mutationFn: (data: BoardUpdate) => updateBoard(boardId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
            queryClient.invalidateQueries({ queryKey: boardKeys.list });
            onClose();
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        mutation.mutate({
            title: title.trim(),
            description: description.trim() || undefined,
        });
    };

    return (
        <Modal isOpen={isOpen} title="Переименовать доску" onClose={onClose}>
            <form onSubmit={handleSubmit} className="rename-board-form">
                <div className="rename-board-form__field">
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} required/>
                </div>
                <div className="rename-board-form__field">
                    <Input value={description} onChange={(e) => setDescription(e.target.value)}/>
                </div>
                {mutation.isError && (
                    <div className="rename-board-form__error">
                        {getErrorMessage(mutation.error)}
                    </div>
                )}
                <div className="rename-board-form__actions">
                    <Button type="submit" disabled={mutation.isPending || !title.trim()}>{mutation.isPending ? "Сохранение..." : "Сохранить"}</Button>
                </div>
            </form>
        </Modal>
    );
};

interface DeleteBoardModalProps {
    isOpen: boolean;
    onClose: () => void;
    boardId: number;
    boardTitle: string;
    onSuccess: () => void;
}

const DeleteBoardModal: React.FC<DeleteBoardModalProps> = ({isOpen, onClose, boardId, boardTitle, onSuccess,}) => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: () => deleteBoard(boardId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: boardKeys.list });
            onSuccess();
        },
    })
    return (
        <Modal isOpen={isOpen} title="Удаление доски" onClose={onClose}>
            <p className="delete-board-modal__text">
                Удалить доску «{boardTitle}»? Это действие нельзя отменить
            </p>
            {mutation.isError && (
                <div className="delete-board-modal__error">
                    {getErrorMessage(mutation.error)}
                </div>
            )}
            <div className="delete-board-modal__actions">
                <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>Отмена</Button>
                <Button variant="danger" onClick={() => mutation.mutate()} disabled={mutation.isPending}>{mutation.isPending ? "Удаление..." : "Удалить"}</Button>
            </div>
        </Modal>
    );
};

export const BoardPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const boardId = parseInt(id || "", 10);
    const isValid = !isNaN(boardId);
    const { board, isOwner, isLoading, isNotFound, error } = useBoardRole(
        isValid ? boardId : undefined
    );
    const [isRenameOpen, setIsRenameOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isMembersOpen, setIsMembersOpen] = useState(false);
    if (isLoading) {
        return <Spinner text="Загрузка доски..." />;
    }
    if (isNotFound) {
        return (
            <div className="board-page__not-found">
                <h2>Доска не найдена или у вас нет доступа</h2>
                <Link to={BOARDS_PATH} className="board-page__link">
                    К моим доскам
                </Link>
            </div>
        );
    }
    if (error) {
        return <div className="board-page__error">{getErrorMessage(error)}</div>;
    }
    if (!board) return null;
    const handleLeaveBoard = () => {
        setIsMembersOpen(false);
        navigate(BOARDS_PATH);
    };

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
                        <Button variant="secondary" onClick={() => setIsRenameOpen(true)}>Переименовать</Button>
                    )}
                    {isOwner && (
                        <Button variant="danger" onClick={() => setIsDeleteOpen(true)}>Удалить доску</Button>
                    )}
                </div>
            </div>
            {board.description && (<p className="board-page__description">{board.description}</p>)}
            <div className="board-page__content-placeholder">Здесь появятся колонки и карточки</div>
            {isOwner && (
                <>
                    <RenameBoardModal isOpen={isRenameOpen} onClose={() => setIsRenameOpen(false)} boardId={boardId} initialTitle={board.title} initialDescription={board.description}/>
                    <DeleteBoardModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} boardId={boardId} boardTitle={board.title} onSuccess={() => navigate(BOARDS_PATH)}/>
                </>
            )}
            <MembersDialog boardId={boardId} boardTitle={board.title} isOpen={isMembersOpen} onClose={() => setIsMembersOpen(false)} myRole={board.my_role} myUserId={user?.id} onLeave={handleLeaveBoard}/>
        </div>
    );
};