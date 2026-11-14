import * as React from "react";
import "./LabelChip.css";

interface LabelChipProps {
    name: string
    color: string
    selected?: boolean
    onClick?: () => void
}

export const LabelChip: React.FC<LabelChipProps> = ({name, color, selected = false, onClick}) => {
    const style = {'--label-color': color} as React.CSSProperties
    const classes = [
        'label-chip',
        onClick ? 'label-chip--clickable' : '',
        selected ? 'label-chip--selected' : ''
    ].filter(Boolean).join(' ')

    const content = (
        <>
            <span className="label-chip__dot"/>
            <span className="label-chip__text">{name}</span>
        </>
    )

    if (onClick) {
        return (
            <button type="button" className={classes} style={style} onClick={onClick} aria-pressed={selected}>
                {content}
            </button>
        )
    }
    return <span className={classes} style={style}>{content}</span>
}