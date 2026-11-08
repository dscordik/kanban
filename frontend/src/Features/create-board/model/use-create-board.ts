import { useMutation } from "@tanstack/react-query";
import { boardKeys, createBoard } from "../../../Entities/board";
import { queryClient } from "../../../Shared/lib/query-client.ts";
import type { BoardCreate } from "../../../Entities/board/model/types";

export const useCreateBoard = (onSuccess: () => void) => {
    const mutation = useMutation({
        mutationFn: (newBoard: BoardCreate) => createBoard(newBoard),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: boardKeys.list });
            onSuccess();
        }
    });

    return {
        mutate: mutation.mutate,
        isPending: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error
    };
}