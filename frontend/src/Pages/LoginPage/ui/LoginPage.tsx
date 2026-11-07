import {Link, useNavigate} from "react-router-dom"
import {BOARDS_PATH, REGISTER_PATH} from "../../../Shared/config/routes";
import {LoginForm} from "../../../Features/auth-by-email/login";
import "../../../Shared/ui/AuthPage.css";

export const LoginPage = () => {
    const navigate = useNavigate()

    function handleLoginSuccess() {
        navigate(BOARDS_PATH)
    }

    return (
        <div className="auth-page">
            <div className="auth-page__card">
                <h2 className="auth-page__title">Вход</h2>
                <LoginForm onSuccess={handleLoginSuccess}/>
                <p className="auth-page__footer">
                    <Link className="auth-page__link" to={REGISTER_PATH}>Нет аккаунта? Зарегистрироваться</Link>
                </p>
            </div>
        </div>
    )
}
