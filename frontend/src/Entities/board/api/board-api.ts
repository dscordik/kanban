import { api } from "../../../Shared/api/base"
import type {Board, BoardCreate, BoardListItem, BoardUpdate} from "../model/types";

export const getBoards = async():Promise<BoardListItem[]> => {
    const res = await api.get<BoardListItem[]>('/boards')
    return res.data
}

export const getBoard = async(id:number):Promise<Board> => {
    const res = await api.get<Board>(`/boards/${id}`)
    return res.data
}

export const createBoard = async(data:BoardCreate):Promise<Board> => {
    const res = await api.post<Board>('/boards', data)
    return res.data
}

export const updateBoard = async(id:number,data:BoardUpdate):Promise<Board> => {
    const res = await api.patch<Board>(`/boards/${id}`, data)
    return res.data
}

export const deleteBoard = async(id:number):Promise<void> => {
    await api.delete<void>(`/boards/${id}`)
}