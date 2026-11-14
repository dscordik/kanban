import {useMutation,useQueryClient} from "@tanstack/react-query";
import {createColumn} from "../api/board-content";
import {boardContentKey} from "./query-keys.ts";

export function useCreateColumn(boardId:number) {
    const queryClient = useQueryClient()
    const {mutate, isPending, isSuccess, isError} = useMutation({
        mutationFn:(title:string) => createColumn(boardId, title),
        onSuccess:() => queryClient.invalidateQueries({queryKey:boardContentKey(boardId)})
    })

    return {mutate, isPending, isSuccess, isError,}
}