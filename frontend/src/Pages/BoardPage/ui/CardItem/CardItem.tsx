import * as React from "react";
import "./CardItem.css";
import {formatDueDate, isOverdue} from "../../../../Shared/lib/due-date.ts";
import {LabelChip} from "../../../../Shared/ui/LabelChip/LabelChip";
import {Avatar} from "../../../../Shared/ui/Avatar/Avatar";
import type {Card} from "../../../../Entities/board";
import type {Member} from "../../../../Entities/board-member";

interface CardItemProps {
    card: Card
    members: Member[]
    onClick: () => void
}

export const CardItem: React.FC<CardItemProps> = ({card, members, onClick}) => {
    const assignee = card.assignee_id ? members.find((member) => member.user_id === card.assignee_id) : undefined
    const overdue = card.due_date ? isOverdue(card.due_date) : false

    return (
        <button type="button" className="card-item" onClick={onClick}>
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
        </button>
    )
}