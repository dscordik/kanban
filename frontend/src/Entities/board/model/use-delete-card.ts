import {useMutation, useQueryClient} from "@tanstack/react-query";
import {deleteCard} from "../api/board-content";
import {boardContentKey} from "./query-keys";

export function useDeleteCard(boardId:number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn:(cardId:number) => deleteCard(cardId),
        onSuccess:() => queryClient.invalidateQueries({queryKey:boardContentKey(boardId)})
    })
}