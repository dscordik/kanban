import * as React from "react";
import type {ReactNode} from "react";
import {QueryClientProvider} from "@tanstack/react-query";
import {AuthProvider} from "../../Entities/session";
import {queryClient} from "../../Shared/lib/query-client";

interface WithAuthProps {
    children: ReactNode
}

export const WithAuth: React.FC<WithAuthProps> = ({children}) => {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                {children}
            </AuthProvider>
        </QueryClientProvider>
    )
}
