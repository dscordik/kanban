import * as React from "react";
import {Link, NavLink, useNavigate} from "react-router-dom";
import {BOARDS_PATH, LOGIN_PATH, REGISTER_PATH} from "../../config/routes";
import "./Header.css";
import {Button} from "../Button/Button";
import {useAuth} from "../../../Entities/session";
import {queryClient} from "../../lib/query-client";

function getLinkClass({isActive}: {isActive: boolean}) {
    return `site-nav__link${isActive ? ' site-nav__link--active' : ''}`
}

export const Header: React.FC = () => {
    const {user, logout} = useAuth()
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        queryClient.clear()
        navigate(LOGIN_PATH);
    }

    return (
        <header className="site-header">
            <div className="site-header__inner">
                <span className="site-header__brand">Misha`s Kanban</span>
                <nav className="site-nav">
                    {user ? (
                        <>
                            <NavLink className={getLinkClass} to={BOARDS_PATH}>Мои доски</NavLink>
                            <span className="site-nav__user">{user.first_name || user.email}</span>
                            <Button className="site-nav__logout" variant="secondary" size="sm" onClick={handleLogout}>Выйти</Button>
                        </>
                    ) : (
                        <>
                            <NavLink className={getLinkClass} to={LOGIN_PATH}>Войти</NavLink>
                            <Link className="button button--primary button--sm" to={REGISTER_PATH}>Регистрация</Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};
