import {api} from "../../../Shared/api/base.ts";
import type {Member, MemberAdd, MemberRoleUpdate} from "../model/types.ts";

export const getMembers = async(boardId:number):Promise<Member[]> => {
    const res = await api.get<Member[]>(`/boards/${boardId}/members`)
    return res.data
}

export const addMember = async(boardId:number, data:MemberAdd):Promise<Member> => {
    const res = await api.post<Member>(`/boards/${boardId}/members`, data)
    return res.data
}

export const changeMemberRole = async(boardId:number, userId:number, data:MemberRoleUpdate):Promise<Member> => {
    const res = await api.patch<Member>(`/boards/${boardId}/members/${userId}`, data)
    return res.data
}

export const removeMember = async(boardId:number, userId:number):Promise<void> => {
    await api.delete(`/boards/${boardId}/members/${userId}`)
}