import {useMutation, useQueryClient} from "@tanstack/react-query";
import {renameColumn} from "../api/board-content.ts";
import {boardContentKey} from "./query-keys.ts";

export function useRenameColumn(boardId:number) {
    const queryClient = useQueryClient()

    const {mutate, isPending, isSuccess, isError} = useMutation({
        mutationFn:(renameValue:{columnId: number, title: string}) => renameColumn(renameValue.columnId, renameValue.title),
        onSuccess:() => queryClient.invalidateQueries({queryKey:boardContentKey(boardId)})
    })

    return {mutate, isPending, isSuccess, isError}
}