import * as React from "react";
import { useState } from "react";
import { Input } from "../../../../Shared/ui/Input/Input.tsx";
import { Button } from "../../../../Shared/ui/Button/Button.tsx";
import { getErrorMessage } from "../../../../Shared/lib/get-error-message.ts";
import type { useMembersActions } from "../../model/use-members-actions.ts";
import type { MemberAdd } from "../../../../Entities/board-member";
import {Select} from "../../../../Shared/ui/Select/Select.tsx";
import './AddMemberFrom.css'

interface AddMemberFormProps {
    actions: ReturnType<typeof useMembersActions>;
}

const roleOptions = [
    { value: "viewer", label: "Наблюдатель" },
    { value: "editor", label: "Редактор" },
    { value: "owner", label: "Владелец" },
];

export const AddMemberForm: React.FC<AddMemberFormProps> = ({ actions }) => {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<"viewer" | "editor" | "owner">("viewer");

    const { addMember } = actions;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        const data: MemberAdd = {
            email: email.trim().toLowerCase(),
            role,
        };
        addMember.mutate(data, {
            onSuccess: () => {
                setEmail("");
                setRole("viewer");
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="add-member-form">
            {addMember.isError && (
                <div className="add-member-form__error">
                    {getErrorMessage(addMember.error)}
                </div>
            )}
            <div className="add-member-form__fields">
                <div className="add-member-form__field">
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" required/>
                </div>

                <div className="add-member-form__field">
                    <label className="add-member-form__label">Роль</label>
                    <Select className="add-member-form__select" value={role} onChange={(e) => setRole(e.target.value as any)}>
                        {roleOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </Select>
                </div>
            </div>
            <div className="add-member-form__actions">
                <Button type="submit" disabled={addMember.isPending || !email.trim()}>
                    {addMember.isPending ? "Добавление..." : "Добавить"}
                </Button>
            </div>
        </form>
    );
};