import {useMutation, useQueryClient} from "@tanstack/react-query";
import {boardContentKey} from "./query-keys.ts";
import {moveColumn} from "../api/board-content.ts";
import {moveColumnInContent} from "../lib/move.ts";
import type {BoardContent} from "./types.ts";

interface MoveColumnVariables {
    columnId: number
    toIndex: number
    payload: { after_id: number | null; before_id: number | null }
}

export function useMoveColumn(boardId: number, onMoveError?: (error: unknown) => void) {
    const queryClient = useQueryClient()
    const queryKey = boardContentKey(boardId)
    const mutationKey = ['move', boardId]

    return useMutation({
        mutationKey,
        scope: {id: `move-${boardId}`},
        mutationFn: ({columnId, payload}: MoveColumnVariables) => moveColumn(columnId, payload),
        onMutate: async ({columnId, toIndex}) => {
            await queryClient.cancelQueries({queryKey})
            const previousContent = queryClient.getQueryData<BoardContent>(queryKey)
            queryClient.setQueryData<BoardContent>(queryKey, (old) =>
                old ? moveColumnInContent(old, columnId, toIndex) : old
            )
            return {previousContent}
        },
        onError: (error, _variables, context) => {
            if (context?.previousContent) {
                queryClient.setQueryData(queryKey, context.previousContent)
            }
            onMoveError?.(error)
        },
        onSettled: () => {
            if (queryClient.isMutating({mutationKey}) === 1) {
                return queryClient.invalidateQueries({queryKey})
            }
        },
    })
}