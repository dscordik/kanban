import * as React from 'react';
import type { BoardRole } from '../../../Entities/board';
import './RoleBadge.css';

interface RoleBadgeProps {
    role: BoardRole;
}

const roleTexts: Record<BoardRole, string> = {
    owner: 'Владелец',
    editor: 'Редактор',
    viewer: 'Наблюдатель',
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
    return (
        <span className={`role-badge role-badge--${role}`}>
            {roleTexts[role]}
        </span>
    );
};