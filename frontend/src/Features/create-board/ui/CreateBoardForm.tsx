import * as React from "react";
import { useState } from "react";
import { useCreateBoard } from "../model/use-create-board";
import { Input } from "../../../Shared/ui/Input/Input.tsx";
import { Button } from "../../../Shared/ui/Button/Button.tsx";
import { getErrorMessage } from "../../../Shared/lib/get-error-message.ts";
import './CreateBoardForm.css'

interface CreateBoardFormProps {
    onSuccess: () => void; // Коллбек для закрытия модалки
}

export const CreateBoardForm: React.FC<CreateBoardFormProps> = ({ onSuccess }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const { mutate, isPending, isError, error } = useCreateBoard(onSuccess);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        mutate({
            title: title.trim(),
            description: description.trim() || undefined
        });
    };
    return (
        <form onSubmit={handleSubmit} className="create-board-form">
            <div className="create-board-form__field">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Например, Работа" required/>
            </div>

            <div className="create-board-form__field">
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Необязательно"/>
            </div>
            {isError && (
                <div className="create-board-form__error">
                    {getErrorMessage(error)}
                </div>
            )}
            <div className="create-board-form__actions">
                <Button type="submit" disabled={isPending || !title.trim()}>
                    {isPending ? "Создание..." : "Создать"}
                </Button>
            </div>
        </form>
    );
};