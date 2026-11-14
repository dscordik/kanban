import {createBrowserRouter, Navigate} from "react-router-dom";
import {BOARD_PATH, BOARDS_PATH, HOME_PATH, LOGIN_PATH, REGISTER_PATH} from "../../Shared/config/routes";
import {Layout} from "../../Shared/layout/Layout";
import {ProtectedRoute} from "../routes/protected-route";
import {LoginPage} from "../../Pages/LoginPage";
import {RegisterPage} from "../../Pages/RegisterPage";
import {BoardsPage} from "../../Pages/BoardsPage/ui/BoardsPage.tsx";
import {BoardPage} from "../../Pages/BoardPage/ui/BoardPage/BoardPage.tsx";

export const router = createBrowserRouter([
    {
        element: <Layout/>,
        children: [
            {
                path: HOME_PATH,
                element: <Navigate to={BOARDS_PATH} replace/>
            },
            {
                path: LOGIN_PATH,
                element: <LoginPage/>
            },
            {
                path: REGISTER_PATH,
                element: <RegisterPage/>
            },
            {
                path: BOARDS_PATH,
                element: <ProtectedRoute><BoardsPage/></ProtectedRoute>
            },
            {
                path: BOARD_PATH,
                element: <ProtectedRoute><BoardPage/></ProtectedRoute>
            },
            {
                path: '*',
                element: <Navigate to={BOARDS_PATH} replace/>
            }
        ]
    },
])
