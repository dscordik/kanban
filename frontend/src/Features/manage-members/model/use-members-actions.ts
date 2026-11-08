import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    addMember,
    boardMembersKeys,
    changeMemberRole,
    type MemberAdd,
    type MemberRoleUpdate, removeMember
} from "../../../Entities/board-member";
import { boardKeys } from "../../../Entities/board";

export function useMembersActions(boardId: number, myUserId: number | undefined) {
    const queryClient = useQueryClient();

    const addMemberMutation = useMutation({
        mutationFn: (data: MemberAdd) => addMember(boardId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: boardMembersKeys.list(boardId) });
            queryClient.invalidateQueries({ queryKey: boardKeys.list });
        },
    });

    const changeRoleMutation = useMutation({
        mutationFn: ({ userId, role }: { userId: number; role: MemberRoleUpdate }) =>
            changeMemberRole(boardId, userId, role),
        onSuccess: (_, { userId }) => {
            queryClient.invalidateQueries({ queryKey: boardMembersKeys.list(boardId) });
            // Если меняем роль себе — обновляем и данные доски (наша роль изменилась)
            if (userId === myUserId) {
                queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
            }
        },
    });

    const removeMemberMutation = useMutation({
        mutationFn: (userId: number) => removeMember(boardId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: boardMembersKeys.list(boardId) });
            queryClient.invalidateQueries({ queryKey: boardKeys.list });
        },
    });

    const leaveBoardMutation = useMutation({
        mutationFn: () => removeMember(boardId, myUserId!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: boardKeys.list });
        },
    });

    return {
        addMember: addMemberMutation,
        changeRole: changeRoleMutation,
        removeMember: removeMemberMutation,
        leaveBoard: leaveBoardMutation,
    };
}