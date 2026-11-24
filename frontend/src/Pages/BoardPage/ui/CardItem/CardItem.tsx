import * as React from "react";
import "./CardItem.css";
import {formatDueDate, isOverdue} from "../../../../Shared/lib/due-date.ts";
import {LabelChip} from "../../../../Shared/ui/LabelChip/LabelChip";
import {Avatar} from "../../../../Shared/ui/Avatar/Avatar";
import type {Card} from "../../../../Entities/board";
import type {Member} from "../../../../Entities/board-member";
import {useSortable} from "@dnd-kit/sortable";
import {getCardDndId} from "../../../../Entities/board/lib/dnd-utils.ts";
import {CSS} from '@dnd-kit/utilities'

interface CardContentProps {
    card: Card
    members: Member[]
}

export const CardContent: React.FC<CardContentProps> = ({card, members}) => {
    const assignee = card.assignee_id ? members.find((member) => member.user_id === card.assignee_id) : undefined
    const overdue = card.due_date ? isOverdue(card.due_date) : false

    return (
        <>
            {card.labels.length > 0 && (
                <span className="card-item__labels">
                    {card.labels.map((label) => (
                        <LabelChip key={label.id} name={label.name} color={label.color}/>
                    ))}
                </span>
            )}
            <span className="card-item__title">{card.title}</span>
            {(card.due_date || assignee) && (
                <span className="card-item__footer">
                    {card.due_date && (
                        <span className={`card-item__due${overdue ? ' card-item__due--overdue' : ''}`}>
                            {formatDueDate(card.due_date)}
                        </span>
                    )}
                    {assignee && (
                        <span className="card-item__assignee">
                            <Avatar name={assignee.first_name} email={assignee.email} size="sm"/>
                        </span>
                    )}
                </span>
            )}
        </>
    )
}

interface CardItemProps {
    card: Card
    members: Member[]
    disabled: boolean
    onClick: () => void
    wasJustDragged: () => boolean
}

export const CardItem: React.FC<CardItemProps> = ({card, members, disabled, onClick, wasJustDragged}) => {
    const {setNodeRef, attributes, listeners, transform, transition, isDragging} = useSortable({
        id: getCardDndId(card.id),
        data: {type: 'card', columnId: card.column_id},
        disabled
    })
    const style = {
        transform: CSS.Translate.toString(transform),
        transition
    }

    const className = [
        'card-item',
        isDragging && 'card-item--dragging',
        disabled && 'card-item--readonly'
    ].filter(Boolean).join(' ')

    return (
        <button
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={className}
            type="button"
            onClick={() => {
                if (wasJustDragged()) return
                onClick()
            }}
        >
            <CardContent card={card} members={members}/>
        </button>
    )
}