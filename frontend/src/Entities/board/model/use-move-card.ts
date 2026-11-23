import {useMutation, useQueryClient} from "@tanstack/react-query";
import {boardContentKey} from "./query-keys.ts";
import {moveCardInContent} from "../lib/move.ts";
import {moveCard} from "../api/board-content.ts";

export function useMoveCard(boardId:number) {
    const queryClient = useQueryClient()
    const queryKey = boardContentKey((boardId))

    return useMutation({
        mutationFn: (card:{cardId:number, payload:{column_id:number, after_id:number | null, before_id:number | null}, toIndex: number}) => moveCard(card.cardId, card.payload),
        onMutate: async ({cardId, payload, toIndex}) => {
            await queryClient.cancelQueries({queryKey})
            const previousContent = queryClient.getQueryData(queryKey)
            if (previousContent) {
                queryClient.setQueryData(queryKey, (value:any) => {
                    if (!value) {
                        return value
                    }
                    return moveCardInContent(value, cardId, payload.column_id, toIndex)
                })
            }
            return {previousContent}
        },
        onSettled: () => queryClient.invalidateQueries({queryKey}),
        onError:(_error,_variables ,context) => {
            if (context?.previousContent) {
                queryClient.setQueryData(queryKey, context.previousContent)
            }
        }
    })
}