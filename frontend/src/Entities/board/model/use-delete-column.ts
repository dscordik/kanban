import {useMutation, useQueryClient} from "@tanstack/react-query";
import {deleteColumn} from "../api/board-content.ts";
import {boardContentKey} from "./query-keys.ts";


export function useDeleteColumn(boardId:number) {
    const queryClient = useQueryClient()

    const {mutate, isPending, isSuccess, isError} = useMutation({
        mutationFn:(columnId:number) => deleteColumn(columnId),
        onSuccess:() => queryClient.invalidateQueries({queryKey: boardContentKey(boardId)})
    })

    return {mutate, isPending, isSuccess, isError}
}