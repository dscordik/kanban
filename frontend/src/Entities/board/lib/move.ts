import type {BoardContent} from "../model/types.ts";

interface NeighborIds<T> {
    afterId: T | null
    beforeId: T | null
}

export const getNeighbors = <T>(ids: T[], index: number): NeighborIds<T> => ({
    afterId: index > 0 ? ids[index - 1] : null,
    beforeId: index < ids.length - 1 ? ids[index + 1] : null,
})

export const moveCardInContent = (content:BoardContent, cardId:number, toColumnId:number, toIndex:number):BoardContent => {
    const card = content.columns.flatMap((v) => v.cards).find((i) => i.id === cardId)
    if (!card) {
        return content
    }
    const newColumns = content.columns.map((item) => {
        if (item.id === toColumnId) {
            const W =  item.cards.filter((v) => v.id !== cardId)
            const L = [...W]
            L.splice(toIndex, 0, card)
            return {...item, cards:L}
        }
        else {
            const W = item.cards.filter((v) => v.id !== cardId)
            return {...item, cards: W}
        }
    })
    return {...content, columns:newColumns}
}
export const moveColumnInContent = (content:BoardContent, columnId:number, toIndex:number):BoardContent => {
    const column = content.columns.find((item) => item.id === columnId)
    if (!column) {
        return content
    }
    const newColumn = content.columns.filter((item) => item !== column)
    const newMass = [...newColumn]
    newMass.splice(toIndex, 0, column)
    return {...content, columns:newMass}
}