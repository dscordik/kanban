export type BoardRole = 'owner' | 'editor' | 'viewer'

export interface BoardListItem{
    id:number
    title:string
    description:string | null
    my_role:BoardRole
    members_count:number
    created_at:string
}

export interface Board{
    id:number
    title:string
    description:string | null
    my_role:BoardRole
    created_at:string
}

export interface BoardCreate{
    title:string
    description?:string
}

export interface BoardUpdate{
    title?:string
    description?:string
}

export interface Label{
    id:number
    board_id:number
    name:string
    color:string
}

export interface Column{
    id:number
    board_id:number
    title:string
    position:number
}

export interface Card{
    id:number
    column_id:number
    title:string
    description:string | null
    position:number
    assignee_id:number | null
    due_date:string | null
    labels:Label[]
    created_by:number
    created_at:string
    updated_at:string
}

export interface ColumnWithCards extends Column{
    cards:Card[]
}

export interface BoardContent{
    columns:ColumnWithCards[]
    labels:Label[]
}