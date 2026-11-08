export type BoardRole = 'owner' | 'editor' | 'viewer'

export interface BoardListItem{
    id:number,
    title:string,
    description:string | null,
    my_role:BoardRole,
    members_count:number,
    created_at:string
}

export interface Board{
    id:number,
    title:string,
    description:string | null,
    my_role:BoardRole,
    created_at:string
}

export interface BoardCreate{
    title:string,
    description?:string
}

export interface BoardUpdate{
    title?:string,
    description?:string
}