import * as React from "react";
import {getInitials} from "../../lib/due-date";
import "./Avatar.css";

interface AvatarProps {
    name: string | null
    email: string
    size?: 'md' | 'sm'
}

export const Avatar: React.FC<AvatarProps> = ({name, email, size = 'md'}) => {
    const classes = ['avatar', size === 'sm' ? 'avatar--sm' : ''].filter(Boolean).join(' ')
    return <span className={classes} title={name || email}>{getInitials(name, email)}</span>
}