import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Modal } from "../../../../Shared/ui/Modal/Modal.tsx";
import { Spinner } from "../../../../Shared/ui/Spinner/Spinner.tsx";
import { getErrorMessage } from "../../../../Shared/lib/get-error-message.ts";
import { getMembers, boardMembersKeys } from "../../../../Entities/board-member";
import { MemberRow } from "../MemberRow/MemberRow.tsx";
import { useMembersActions } from "../../model/use-members-actions.ts";
import type { BoardRole } from "../../../../Entities/board";
import {AddMemberForm} from "../AddMemberFrom/AddMemberFrom.tsx";

interface MembersDialogProps {
    boardId: number;
    boardTitle: string;
    isOpen: boolean;
    onClose: () => void;
    myRole: BoardRole;
    myUserId: number | undefined;
    onLeave: () => void;
}

export const MembersDialog: React.FC<MembersDialogProps> = ({boardId, boardTitle, isOpen, onClose, myRole, myUserId, onLeave,}) => {
    const { data: members, isLoading, isError, error } = useQuery({
        queryKey: boardMembersKeys.list(boardId),
        queryFn: () => getMembers(boardId),
        enabled: isOpen,
    });

    const actions = useMembersActions(boardId, myUserId);
    const isOwner = myRole === "owner";

    return (
        <Modal isOpen={isOpen} title={`Участники — ${boardTitle}`} onClose={onClose}>
            <div className="members-dialog">
                {isLoading && <Spinner text="Загрузка участников..." />}
                {isError && (
                    <div className="members-dialog__error">
                        {getErrorMessage(error)}
                    </div>
                )}
                {members && (
                    <div className="members-dialog__list">
                        {members.map((member) => (
                            <MemberRow key={member.user_id} member={member} isOwner={isOwner} isMe={member.user_id === myUserId} boardTitle={boardTitle} actions={actions} onLeave={onLeave}/>
                        ))}
                    </div>
                )}
                {isOwner && (
                    <div className="members-dialog__add">
                        <h3 className="members-dialog__add-title">Добавить участника</h3>
                        <AddMemberForm actions={actions} />
                    </div>
                )}
            </div>
        </Modal>
    );
};