import * as React from "react";
import { RoleBadge } from "../../../Shared/ui/RoleBadge/RoleBadge.tsx";
import { Button } from "../../../Shared/ui/Button/Button.tsx";
import type { Member } from "../../../Entities/board-member";
import type { useMembersActions } from "../model/use-members-actions";
import { Select } from "../../../Shared/ui/Select/Select.tsx";

interface MemberRowProps {
    member: Member;
    isOwner: boolean;
    isMe: boolean;
    boardTitle: string;
    actions: ReturnType<typeof useMembersActions>;
    onLeave: () => void;
}

const roleOptions = [
    { value: "viewer", label: "Наблюдатель" },
    { value: "editor", label: "Редактор" },
    { value: "owner", label: "Владелец" },
];

export const MemberRow: React.FC<MemberRowProps> = ({member, isOwner, isMe, boardTitle, actions, onLeave,}) => {
    const { changeRole, removeMember, leaveBoard } = actions;
    const handleRoleChange = (newRole: string) => {
        changeRole.mutate({
            userId: member.user_id,
            role: { role: newRole as any },
        });
    };
    const handleRemove = () => {
        if (window.confirm(`Убрать ${member.first_name || member.email} с доски?`)) {
            removeMember.mutate(member.user_id);
        }
    };
    const handleLeave = () => {
        if (window.confirm(`Выйти с доски «${boardTitle}»?`)) {
            leaveBoard.mutate(undefined, {
                onSuccess: () => onLeave(),
            });
        }
    };

    return (
        <div className="member-row">
            <div className="member-row__info">
                <div className="member-row__name">
                    {member.first_name || member.email}
                    {isMe && <span className="member-row__me">(вы)</span>}
                </div>
                <div className="member-row__email">{member.email}</div>
            </div>
            <div className="member-row__controls">
                {isOwner ? (
                    <>
                        <Select className="member-row__role-select" value={member.role} onChange={(e) => handleRoleChange(e.target.value)} disabled={changeRole.isPending}>
                            {roleOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </Select>
                        {!isMe && (
                            <Button variant="danger" onClick={handleRemove} disabled={removeMember.isPending}>Убрать</Button>
                        )}
                    </>
                ) : (
                    <RoleBadge role={member.role} />
                )}
                {isMe && !isOwner && (
                    <Button variant="secondary" onClick={handleLeave} disabled={leaveBoard.isPending}>Выйти с доски</Button>
                )}
            </div>
        </div>
    );
};