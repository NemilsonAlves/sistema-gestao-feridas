'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'

interface AsyncOperationState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface AsyncOperationOptions {
  showSuccessToast?: boolean
  showErrorToast?: boolean
  successMessage?: string
  errorMessage?: string
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

export function useAsyncOperation<T = any>(
  options: AsyncOperationOptions = {}
) {
  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    loading: false,
    error: null
  })

  const {
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Operação realizada com sucesso!',
    errorMessage = 'Ocorreu um erro. Tente novamente.',
    onSuccess,
    onError
  } = options

  const execute = useCallback(async (
    asyncFunction: () => Promise<T>
  ): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const result = await asyncFunction()
      
      setState({
        data: result,
        loading: false,
        error: null
      })

      if (showSuccessToast) {
        toast.success(successMessage)
      }

      if (onSuccess) {
        onSuccess(result)
      }

      return result
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : errorMessage
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMsg
      }))

      if (showErrorToast) {
        toast.error(errorMsg)
      }

      if (onError) {
        onError(error instanceof Error ? error : new Error(errorMsg))
      }

      return null
    }
  }, [showSuccessToast, showErrorToast, successMessage, errorMessage, onSuccess, onError])

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null
    })
  }, [])

  const setData = useCallback((data: T) => {
    setState(prev => ({ ...prev, data }))
  }, [])

  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error, loading: false }))
  }, [])

  return {
    ...state,
    execute,
    reset,
    setData,
    setError,
    isLoading: state.loading,
    hasError: !!state.error,
    hasData: !!state.data
  }
}

// Specialized hook for API calls
export function useApiCall<T = any>(
  options: AsyncOperationOptions = {}
) {
  const asyncOp = useAsyncOperation<T>(options)

  const call = useCallback(async (
    url: string,
    options: RequestInit = {}
  ): Promise<T | null> => {
    return asyncOp.execute(async () => {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      return response.json()
    })
  }, [asyncOp])

  return {
    ...asyncOp,
    call
  }
}

export default useAsyncOperation