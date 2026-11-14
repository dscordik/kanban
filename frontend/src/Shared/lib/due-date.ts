export function getTodayString(): string {
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${now.getFullYear()}-${month}-${day}`
}

export function isOverdue(dueDate: string): boolean {
    return dueDate < getTodayString()
}

export function formatDueDate(dueDate: string): string {
    const [year, month, day] = dueDate.split('-').map(Number)
    return new Date(year, month - 1, day).toLocaleDateString('ru-RU', {day: 'numeric', month: 'short'})
}

export function getInitials(name: string | null, email: string): string {
    const source = (name && name.trim()) || email
    const parts = source.split(/\s+/)
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return source.slice(0, 2).toUpperCase()
}