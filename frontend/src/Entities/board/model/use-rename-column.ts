import {useMutation, useQueryClient} from "@tanstack/react-query";
import {renameColumn} from "../api/board-content";
import {boardContentKey} from "./query-keys";

export function useRenameColumn(boardId:number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn:({columnId, title}:{columnId:number, title:string}) => renameColumn(columnId, title),
        onSuccess:() => queryClient.invalidateQueries({queryKey:boardContentKey(boardId)})
    })
}