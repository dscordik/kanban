import {useMutation, useQueryClient} from "@tanstack/react-query";
import type {CardUpdate} from "./types";
import {boardContentKey} from "./query-keys";
import {updateCard} from "../api/board-content";

export function useUpdateCard(boardId:number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn:({cardId, data}:{cardId:number, data:CardUpdate}) => updateCard(cardId, data),
        onSuccess:() => queryClient.invalidateQueries({queryKey:boardContentKey(boardId)})
    })
}