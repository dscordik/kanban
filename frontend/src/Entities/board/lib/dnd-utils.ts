export function getCardDndId(id:number):string {
    return `card-${id}`
}

export function getColumnDndId(id:number):string {
    return `column-${id}`
}

export function parseDndId(dndId:string):{type:'card' | 'column'; id:number} {
    if (dndId.startsWith('card-')) {
        return {type:'card', id:Number(dndId.replace('card-', ''))}
    }
    if (dndId.startsWith('column-')) {
        return {type:'column', id:Number(dndId.replace('column-', ''))}
    }

    throw new Error(`неизвестный формат dnd-kit id ${dndId}`)
}