import {useMutation, useQueryClient} from "@tanstack/react-query";
import {boardContentKey} from "./query-keys.ts";
import {moveColumn} from "../api/board-content.ts";
import {moveColumnInContent} from "../lib/move.ts";

export function useMoveColumn(boardId:number) {
    const queryClient = useQueryClient()
    const queryKey = boardContentKey(boardId)

    return useMutation({
        mutationFn:(column:{columnId:number, payload:{after_id:number | null, before_id:number | null}, toIndex: number}) => moveColumn(column.columnId, column.payload),
        onMutate:async ({ columnId,toIndex}) => {
            await queryClient.cancelQueries({queryKey})
            const previousContent = queryClient.getQueryData(queryKey)
            if (previousContent) {
                queryClient.setQueryData(queryKey, (value:any)=> {
                    if (!value) {
                        return value
                    }
                    return moveColumnInContent(value,columnId, toIndex)
                })
            }
            return {previousContent}
        },
        onSettled:() => queryClient.invalidateQueries({queryKey}),
        onError:(_error, _variables, context) => {
            if (context?.previousContent) {
                queryClient.setQueryData(queryKey, context.previousContent)
            }
        }
    })
}