import { useMutation, useQueryClient } from "@tanstack/react-query";
import { boardKeys, deleteBoard } from "../../../Entities/board";

export function useDeleteBoard(boardId: number, onSuccess: () => void) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => deleteBoard(boardId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: boardKeys.list });
            onSuccess();
        },
    });
}