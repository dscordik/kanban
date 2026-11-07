export const HOME_PATH = '/'
export const LOGIN_PATH = '/login'
export const REGISTER_PATH = '/register'
export const BOARDS_PATH = '/boards'
export const BOARD_PATH = '/boards/:id'

export const getBoardPath = (id: number) => `/boards/${id}`