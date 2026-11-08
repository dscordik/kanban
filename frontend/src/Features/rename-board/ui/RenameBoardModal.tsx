import * as React from "react";
import { useState } from "react";
import "./RenameBoardModal.css";
import type {Board} from "../../../Entities/board";
import {useRenameBoard} from "../model/use-rename-board.ts";
import {Input} from "../../../Shared/ui/Input/Input.tsx";
import {Button} from "../../../Shared/ui/Button/Button.tsx";
import {getErrorMessage} from "../../../Shared/lib/get-error-message.ts";
import {Modal} from "../../../Shared/ui/Modal/Modal.tsx";

interface RenameBoardFormProps {
    board: Board;
    onSuccess: () => void;
}
const RenameBoardForm: React.FC<RenameBoardFormProps> = ({ board, onSuccess }) => {
    const [title, setTitle] = useState(board.title);
    const [description, setDescription] = useState(board.description ?? "");
    const { mutate, isPending, isError, error } = useRenameBoard(board.id, onSuccess);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        mutate({ title: title.trim(), description: description.trim() });
    };

    return (
        <form onSubmit={handleSubmit} className="rename-board-form">
            <div className="rename-board-form__field">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Название" maxLength={100} required/>
            </div>
            <div className="rename-board-form__field">
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Описание (необязательно)" maxLength={500}/>
            </div>
            {isError && (
                <div className="rename-board-form__error">{getErrorMessage(error)}</div>
            )}
            <div className="rename-board-form__actions">
                <Button type="submit" disabled={isPending || !title.trim()}>
                    {isPending ? "Сохранение..." : "Сохранить"}
                </Button>
            </div>
        </form>
    );
};

interface RenameBoardModalProps {
    isOpen: boolean;
    onClose: () => void;
    board: Board;
}

export const RenameBoardModal: React.FC<RenameBoardModalProps> = ({ isOpen, onClose, board }) => {
    return (
        <Modal isOpen={isOpen} title="Переименовать доску" onClose={onClose}>
            <RenameBoardForm board={board} onSuccess={onClose}/>
        </Modal>
    );
};