import { useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface UseApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
    execute: (...args: any[]) => Promise<T | null>;
    reset: () => void;
}

export function useApi<T = any>(
    apiFunction: (...args: any[]) => Promise<{ data: T }>,
    options?: {
        onSuccess?: (data: T) => void;
        onError?: (error: string) => void;
        showErrorToast?: boolean;
        showSuccessToast?: string;
    }
): UseApiReturn<T> {
    const [state, setState] = useState<UseApiState<T>>({
        data: null,
        loading: false,
        error: null,
    });

    const execute = useCallback(async (...args: any[]): Promise<T | null> => {
        setState(s => ({ ...s, loading: true, error: null }));
        try {
            const response = await apiFunction(...args);
            const data = response.data;
            setState({ data, loading: false, error: null });
            if (options?.onSuccess) options.onSuccess(data);
            if (options?.showSuccessToast) toast.success(options.showSuccessToast);
            return data;
        } catch (err: any) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                'An unexpected error occurred';
            setState(s => ({ ...s, loading: false, error: message }));
            if (options?.showErrorToast !== false) toast.error(message);
            if (options?.onError) options.onError(message);
            return null;
        }
    }, [apiFunction, options]);

    const reset = useCallback(() => {
        setState({ data: null, loading: false, error: null });
    }, []);

    return { ...state, execute, reset };
}

export function useApiMutation<T = any>(
    apiFunction: (...args: any[]) => Promise<{ data: T }>,
    options?: {
        onSuccess?: (data: T) => void;
        onError?: (error: string) => void;
        successMessage?: string;
        showErrorToast?: boolean;
    }
) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const mutate = useCallback(async (...args: any[]): Promise<T | null> => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiFunction(...args);
            const data = response.data;
            if (options?.successMessage) toast.success(options.successMessage);
            if (options?.onSuccess) options.onSuccess(data);
            setLoading(false);
            return data;
        } catch (err: any) {
            const message = err?.response?.data?.message || err?.message || 'An error occurred';
            setError(message);
            setLoading(false);
            if (options?.showErrorToast !== false) toast.error(message);
            if (options?.onError) options.onError(message);
            return null;
        }
    }, [apiFunction, options]);

    return { mutate, loading, error };
}