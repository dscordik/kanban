import { useMutation, useQueryClient } from "@tanstack/react-query";
import { boardKeys, updateBoard, type BoardUpdate } from "../../../Entities/board";

export function useRenameBoard(boardId: number, onSuccess: () => void) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: BoardUpdate) => updateBoard(boardId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
            queryClient.invalidateQueries({ queryKey: boardKeys.list });
            onSuccess();
        },
    });
}