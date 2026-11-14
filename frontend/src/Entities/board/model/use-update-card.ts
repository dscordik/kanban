import {useMutation, useQueryClient} from "@tanstack/react-query";
import type { Card } from "./types";
import {boardContentKey} from "./query-keys";
import {updateCard} from "../api/board-content";

export function useUpdateCard(boardId:number) {
    const queryClient = useQueryClient()

    const {mutate, isPending} = useMutation({
        mutationFn:(cards:{cardId:number, data:Partial<Card>})=> updateCard(cards.cardId, cards.data),
        onSuccess:() => queryClient.invalidateQueries({queryKey:boardContentKey(boardId)})
    })

    return {mutate, isPending}
}