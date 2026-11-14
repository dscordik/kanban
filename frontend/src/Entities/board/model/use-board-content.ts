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