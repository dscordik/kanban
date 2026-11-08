import * as React from "react";
import "./DeleteBoardModal.css";
import type {Board} from "../../../Entities/board";
import {useDeleteBoard} from "../model/use-delete-board.ts";
import { getErrorMessage } from "../../../Shared/lib/get-error-message.ts";
import {Button} from "../../../Shared/ui/Button/Button.tsx";
import {Modal} from "../../../Shared/ui/Modal/Modal.tsx";

interface DeleteBoardContentProps {
    board: Board;
    onClose: () => void;
    onDeleted: () => void;
}

const DeleteBoardContent: React.FC<DeleteBoardContentProps> = ({ board, onClose, onDeleted }) => {
    const { mutate, isPending, isError, error } = useDeleteBoard(board.id, onDeleted);

    return (
        <>
            <p className="delete-board-modal__text">
                Удалить доску «{board.title}»? Это действие нельзя отменить
            </p>
            {isError && (
                <div className="delete-board-modal__error">{getErrorMessage(error)}</div>
            )}
            <div className="delete-board-modal__actions">
                <Button variant="secondary" onClick={onClose} disabled={isPending}>Отмена</Button>
                <Button variant="danger" onClick={() => mutate()} disabled={isPending}>
                    {isPending ? "Удаление..." : "Удалить"}
                </Button>
            </div>
        </>
    );
};

interface DeleteBoardModalProps {
    isOpen: boolean;
    onClose: () => void;
    board: Board;
    onDeleted: () => void;
}

export const DeleteBoardModal: React.FC<DeleteBoardModalProps> = ({ isOpen, onClose, board, onDeleted }) => {
    return (
        <Modal isOpen={isOpen} title="Удаление доски" onClose={onClose}>
            <DeleteBoardContent board={board} onClose={onClose} onDeleted={onDeleted}/>
        </Modal>
    );
};