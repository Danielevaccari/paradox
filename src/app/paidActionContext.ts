import { createContext, useContext, type ReactNode } from "react";

export interface PaidActionRequest {
    /** What will happen, e.g. "Create topic “Coffee batch”". */
    title: string;
    description?: ReactNode;
    /** Typical fee in HBAR, shown before the user accepts. */
    feeHbar: number;
    /** Extra facts to show, e.g. the amount of a transfer. */
    facts?: Array<{ label: string; value: string }>;
    confirmLabel?: string;
    destructive?: boolean;
    /** The paid work. Only runs after the user accepts. Throw to report an error. */
    run: () => Promise<void>;
}

/** Resolves to true when the user accepted and the action succeeded. */
export type ConfirmPaidAction = (request: PaidActionRequest) => Promise<boolean>;

export const PaidActionContext = createContext<ConfirmPaidAction | null>(null);

/**
 * Every action that costs HBAR must go through this: it asks the user to accept before anything runs.
 * Reads never need it, they use the free mirror node.
 */
export const usePaidAction = () => {
    const value = useContext(PaidActionContext);
    if (!value) {
        throw new Error("usePaidAction must be used inside <AppProviders>");
    }
    return value;
};
