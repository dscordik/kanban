import * as React from "react";
import {Modal} from "../../../../Shared/ui/Modal/Modal.tsx";
import {CreateBoardForm} from "../CreateBoardForm.tsx";

interface CreateBoardModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateBoardModal: React.FC<CreateBoardModalProps> = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} title="Новая доска" onClose={onClose}>
            <CreateBoardForm onSuccess={onClose}/>
        </Modal>
    );
};