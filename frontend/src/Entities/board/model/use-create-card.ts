import {useMutation, useQueryClient} from "@tanstack/react-query";
import {createCard} from "../api/board-content";
import {boardContentKey} from "./query-keys";

export function useCreateCard(boardId:number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn:({columnId, title}:{columnId:number, title:string}) => createCard(columnId, title),
        onSuccess:() => queryClient.invalidateQueries({queryKey:boardContentKey(boardId)})
    })
}