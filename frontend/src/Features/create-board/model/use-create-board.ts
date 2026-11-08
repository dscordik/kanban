import { useMutation, useQueryClient } from "@tanstack/react-query";
import { boardKeys, createBoard, type BoardCreate } from "../../../Entities/board";

export const useCreateBoard = (onSuccess: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (newBoard: BoardCreate) => createBoard(newBoard),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: boardKeys.list });
            onSuccess();
        },
    });
};