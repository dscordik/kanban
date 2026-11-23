import type {BoardContent} from "../model/types.ts";

interface NeighborIds{
    afterId:string | null,
    beforeId:string | null
}

export const getNeighbors= (ids:string[], index:number):NeighborIds => {
    let afterId = null
    let beforeId = null
    if (index > 0) {
        afterId = ids[index - 1]
    }
    if (index < ids.length - 1) {
        beforeId = ids[index + 1]
    }
    return {afterId,beforeId}
}

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