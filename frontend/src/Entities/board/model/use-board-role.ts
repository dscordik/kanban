import axios from "axios";
import {useQuery} from "@tanstack/react-query";
import {boardKeys} from "./query-keys.ts";
import {getBoard} from "../api/board-api.ts";

export function useBoardRole(boardId: number | string | undefined) {
    const id = typeof boardId === 'string' ? parseInt(boardId, 10) : boardId
    const isValid = !isNaN(Number(id))
    const {data, isLoading, error} = useQuery({
        queryKey: boardKeys.detail(id!),
        queryFn: () => getBoard(id!),
        enabled: isValid,
        retry: false
    })
    const isNotFound = !isValid || (axios.isAxiosError(error) && error.response?.status === 404)

    return {
        board: data,
        role: data?.my_role,
        isOwner: data?.my_role === 'owner',
        canEdit: data?.my_role === 'owner' || data?.my_role === 'editor',
        isLoading,
        isNotFound,
        error
    }
}