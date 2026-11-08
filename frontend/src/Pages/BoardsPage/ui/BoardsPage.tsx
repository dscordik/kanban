import * as React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { boardKeys, getBoards } from "../../../Entities/board";
import { getBoardPath } from "../../../Shared/config/routes";
import { getErrorMessage } from "../../../Shared/lib/get-error-message";
import { pluralize } from "../../../Shared/lib/pluralize";
import { Spinner } from "../../../Shared/ui/Spinner/Spinner";
import { Button } from "../../../Shared/ui/Button/Button";
import { RoleBadge } from "../../../Shared/ui/RoleBadge/RoleBadge";
import "./BoardsPage.css";
import {CreateBoardModal} from "../../../Features/create-board/ui/CreateBoardModal/CreateBoardModal.tsx";

export const BoardsPage: React.FC = () => {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: boardKeys.list,
        queryFn: getBoards,
    });
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    if (isLoading) {
        return <Spinner text="Загрузка..." />;
    }
    if (isError) {
        return <div className="boards-page__error">{getErrorMessage(error)}</div>;
    }
    const openCreate = () => setIsCreateOpen(true);

    return (
        <div className="boards-page">
            <div className="boards-page__header">
                <h1>Мои доски</h1>
                <Button onClick={openCreate}>Создать доску</Button>
            </div>
            {data && data.length === 0 ? (
                <div className="boards-page__empty">
                    <p>У вас пока нет досок. Создайте первую</p>
                    <Button onClick={openCreate}>Создать доску</Button>
                </div>
            ) : (
                <div className="boards-page__grid">
                    {data?.map((board) => (
                        <Link key={board.id} to={getBoardPath(board.id)} className="board-card">
                            <h2 className="board-card__title">{board.title}</h2>
                            {board.description && <p className="board-card__description">{board.description}</p>}
                            <div className="board-card__footer">
                                <RoleBadge role={board.my_role} />
                                <span className="board-card__members">{pluralize(board.members_count)}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
            <CreateBoardModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)}/>
        </div>
    );
};