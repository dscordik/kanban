import type {BoardRole} from "../../board";

export interface Member{
    user_id:number,
    email:string,
    first_name:string | null,
    role:BoardRole
}

export interface MemberAdd{
    email:string,
    role?:BoardRole
}

export interface MemberRoleUpdate{
    role:BoardRole
}