import type {BoardContent, Card, Column} from "../model/types.ts";
import {api} from "../../../Shared/api/base.ts";

export const getBoardContent = async(boardId:number):Promise<BoardContent> => {
    const res = await api.get<BoardContent>(`/boards/${boardId}/content`)
    return res.data
}

export const createColumn = async(boardId:number, title:string):Promise<Column> => {
    const res = await api.post(`/boards/${boardId}/columns`, {title})
    return res.data
}

export const deleteColumn = async(columnId:number):Promise<void> => {
    await api.delete<void>(`columns/${columnId}`)
}

export const createCard = async(columnId:number, title:string):Promise<Card> => {
    const res = await api.post<Card>(`/columns/${columnId}/cards`, {title})
    return res.data
}

export const deleteCard = async(cardId:number):Promise<void> => {
    await api.delete<void>(`/cards/${cardId}`)
}

export const renameColumn = async(columnId:number, title:string):Promise<Column> => {
    const res = await api.patch<Column>(`/columns/${columnId}`, {title})
    return res.data
}

export const updateCard = async(cardId:number, data:Partial<Card>):Promise<Card> => {
    const res = await api.patch<Card>(`/cards/${cardId}`, data)
    return res.data
}