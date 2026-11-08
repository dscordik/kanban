export const boardKeys = {
    all: ['boards'] as const,
    list: ['boards', 'list'] as const,
    detail: (id: number) => ['boards', 'detail', id] as const,
}