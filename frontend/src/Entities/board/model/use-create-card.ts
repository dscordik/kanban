import {useMutation, useQueryClient} from "@tanstack/react-query";
import {createCard} from "../api/board-content.ts";
import {boardContentKey} from "./query-keys.ts";


export function useCreateCard(boardId:number) {
    const queryClient = useQueryClient()

    const {mutate, isError, isPending, isSuccess} = useMutation({
        mutationFn:(createValue:{columnId:number, title:string}) => createCard(createValue.columnId, createValue.title),
        onSuccess:() => queryClient.invalidateQueries({queryKey:boardContentKey(boardId)})
    })

    return {mutate, isError, isPending, isSuccess}
}