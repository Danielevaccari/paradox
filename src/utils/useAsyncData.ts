import { useCallback, useEffect, useEffectEvent, useState } from "react";
import { errorMessage } from "./format";

type State<T> = { key: string | null; requestKey: string | null; data?: T; error?: string };

/**
 * Loads data for `key` and reloads when the key changes. Pass null to skip loading.
 * Keeps the previous data for the same key while reloading, so lists don't flicker.
 */
export const useAsyncData = <T>(key: string | null, load: (signal: AbortSignal) => Promise<T>) => {
    const [state, setState] = useState<State<T>>({ key: null, requestKey: null });
    const [nonce, setNonce] = useState(0);
    const requestKey = key === null ? null : `${key}#${nonce}`;
    const runLoad = useEffectEvent(load);

    useEffect(() => {
        if (requestKey === null) {
            return;
        }
        const controller = new AbortController();
        runLoad(controller.signal).then(
            (data) => setState({ key, requestKey, data }),
            (error) => {
                if (!controller.signal.aborted) {
                    setState({ key, requestKey, error: errorMessage(error) });
                }
            },
        );
        return () => controller.abort();
    }, [key, requestKey]);

    const reload = useCallback(() => setNonce((n) => n + 1), []);
    const sameKey = state.key === key;

    return {
        data: sameKey ? state.data : undefined,
        error: state.requestKey === requestKey ? state.error : undefined,
        loading: requestKey !== null && state.requestKey !== requestKey,
        reload,
    };
};
