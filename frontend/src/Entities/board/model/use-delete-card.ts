import {useMutation, useQueryClient} from "@tanstack/react-query";
import {deleteCard} from "../api/board-content.ts";
import {boardContentKey} from "./query-keys.ts";


export function useDeleteCard(boardId:number) {
    const queryClient = useQueryClient()

    const {mutate, isError, isPending, isSuccess} = useMutation({
        mutationFn: (cardId:number) => deleteCard(cardId),
        onSuccess: () => queryClient.invalidateQueries({queryKey:boardContentKey(boardId)})
    })

    return {mutate, isError, isPending, isSuccess}
}