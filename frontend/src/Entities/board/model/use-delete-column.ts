import {useMutation, useQueryClient} from "@tanstack/react-query";
import {deleteColumn} from "../api/board-content";
import {boardContentKey} from "./query-keys";

export function useDeleteColumn(boardId:number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn:(columnId:number) => deleteColumn(columnId),
        onSuccess:() => queryClient.invalidateQueries({queryKey:boardContentKey(boardId)})
    })
}