export function getCardDndId(id: number): string {
    return `card-${id}`
}

export function getColumnDndId(id: number): string {
    return `column-${id}`
}

export function getDropzoneDndId(id: number): string {
    return `dropzone-${id}`
}

export type DndKind = 'card' | 'column' | 'dropzone'

export function parseDndId(dndId: string): { type: DndKind; id: number } {
    if (dndId.startsWith('card-')) {
        return {type: 'card', id: Number(dndId.replace('card-', ''))}
    }
    if (dndId.startsWith('column-')) {
        return {type: 'column', id: Number(dndId.replace('column-', ''))}
    }
    if (dndId.startsWith('dropzone-')) {
        return {type: 'dropzone', id: Number(dndId.replace('dropzone-', ''))}
    }

    throw new Error(`неизвестный формат dnd-kit id ${dndId}`)
}