import {api} from "../../../Shared/api/base.ts";
import type {Card, CardUpdate} from "./types.ts";
import {useQuery} from "@tanstack/react-query";
import {boardContentKey} from "./query-keys.ts";
import {getBoardContent} from "../api/board-content.ts";

export function useBoardContent(boardId:number) {
    const {data, isLoading, isError, error} = useQuery({
        queryKey:boardContentKey(boardId),
        queryFn:() => getBoardContent(boardId)
    })

    return {data, isLoading, isError, error}
}

export const updateCard = async(cardId:number, data:CardUpdate):Promise<Card> => {
    const res = await api.patch<Card>(`/cards/${cardId}`, data)
    return res.data
}