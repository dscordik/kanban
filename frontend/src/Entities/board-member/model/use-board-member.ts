import {useQuery} from "@tanstack/react-query";
import {getMembers} from "../api/member-api.ts";
import {boardMembersKeys} from "./query-keys.ts";

export function useBoardMembers(boardId:number) {
    const {data, isLoading, isError} = useQuery({
        queryKey:boardMembersKeys.list(boardId),
        queryFn:()=> getMembers(boardId)
    })

    return{data, isError, isLoading}
}