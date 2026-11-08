import * as React from "react";
import { useEffect } from "react";
import "./Modal.css";

interface ModalProps {
    isOpen: boolean;
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, title, onClose, children }) => {
    useEffect(() => {
        if (!isOpen) return;
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal__backdrop" onClick={handleBackdropClick}>
            <div className="modal__content" role="dialog" aria-modal="true">
                <div className="modal__header">
                    <h2 className="modal__title">{title}</h2>
                    <button className="modal__close-btn" onClick={onClose} aria-label="Закрыть">&times;</button>
                </div>
                <div className="modal__body">
                    {children}
                </div>
            </div>
        </div>
    );
};