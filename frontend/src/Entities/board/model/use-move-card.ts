import {useMutation, useQueryClient} from "@tanstack/react-query";
import {boardContentKey} from "./query-keys.ts";
import {moveCardInContent} from "../lib/move.ts";
import {moveCard} from "../api/board-content.ts";
import type {BoardContent} from "./types.ts";

interface MoveCardVariables {
    cardId: number
    toIndex: number
    payload: { column_id: number; after_id: number | null; before_id: number | null }
}

export function useMoveCard(boardId: number, onMoveError?: (error: unknown) => void) {
    const queryClient = useQueryClient()
    const queryKey = boardContentKey(boardId)
    const mutationKey = ['move', boardId]

    return useMutation({
        mutationKey,
        scope: {id: `move-${boardId}`},
        mutationFn: ({cardId, payload}: MoveCardVariables) => moveCard(cardId, payload),
        onMutate: async ({cardId, payload, toIndex}) => {
            await queryClient.cancelQueries({queryKey})
            const previousContent = queryClient.getQueryData<BoardContent>(queryKey)
            queryClient.setQueryData<BoardContent>(queryKey, (old) =>
                old ? moveCardInContent(old, cardId, payload.column_id, toIndex) : old
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