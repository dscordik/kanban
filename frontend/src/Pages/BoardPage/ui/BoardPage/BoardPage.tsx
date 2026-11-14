import * as React from "react";
import {useState} from "react";
import "./BoardPage.css";
import {Link, useNavigate, useParams} from "react-router-dom";
import {useAuth} from "../../../../Entities/session";
import {useBoardRole} from "../../../../Entities/board";
import {Spinner} from "../../../../Shared/ui/Spinner/Spinner.tsx";
import { BOARDS_PATH } from "../../../../Shared/config/routes.ts";
import {getErrorMessage} from "../../../../Shared/lib/get-error-message.ts";
import {RoleBadge} from "../../../../Shared/ui/RoleBadge/RoleBadge.tsx";
import {Button} from "../../../../Shared/ui/Button/Button.tsx";
import {Board} from "../Board/Board.tsx";
import {RenameBoardModal} from "../../../../Features/rename-board";
import {DeleteBoardModal} from "../../../../Features/delete-board";
import {MembersDialog} from "../../../../Features/manage-members";

export const BoardPage: React.FC = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const {user} = useAuth();
    const {board, isOwner, canEdit, isLoading, isNotFound, error} = useBoardRole(id);

    const [isRenameOpen, setIsRenameOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isMembersOpen, setIsMembersOpen] = useState(false);

    if (isLoading) {
        return <Spinner text="Загрузка доски..."/>;
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
    if (!board) return null;

    const goToBoards = () => navigate(BOARDS_PATH);

    return (
        <div className="board-page">
            <div className="board-page__header">
                <div className="board-page__title-wrapper">
                    <h1 className="board-page__title">{board.title}</h1>
                    <RoleBadge role={board.my_role}/>
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

            <Board boardId={board.id} canEdit={canEdit}/>

            {isOwner && (
                <>
                    <RenameBoardModal isOpen={isRenameOpen} onClose={() => setIsRenameOpen(false)} board={board}/>
                    <DeleteBoardModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} board={board} onDeleted={goToBoards}/>
                </>
            )}

            <MembersDialog boardId={board.id} boardTitle={board.title} isOpen={isMembersOpen} onClose={() => setIsMembersOpen(false)} myRole={board.my_role} myUserId={user?.id} onLeave={goToBoards}/>
        </div>
    );
};