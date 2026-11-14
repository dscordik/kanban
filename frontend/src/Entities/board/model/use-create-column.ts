import {useMutation, useQueryClient} from "@tanstack/react-query";
import {createColumn} from "../api/board-content";
import {boardContentKey} from "./query-keys";

export function useCreateColumn(boardId:number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn:(title:string) => createColumn(boardId, title),
        onSuccess:() => queryClient.invalidateQueries({queryKey:boardContentKey(boardId)})
    })
}