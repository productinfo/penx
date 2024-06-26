import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { getCsrfToken, signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import { toast } from 'uikit'
import { db, getNewSpace } from '@penx/local-db'
import { store } from '@penx/store'

export type LoginFormValues = {
  username: string
  password: string
}

export function useLoginForm() {
  const { push } = useRouter()
  const [loading, setLoading] = useState(false)
  const form = useForm<LoginFormValues>({
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    console.log('============data:', data)

    try {
      setLoading(true)
      const res = await signIn('credentials', {
        redirect: false,
        ...data,
        callbackUrl: '/',
      })

      if (res?.ok) {
        push('/')
      } else {
        console.log('======res:', res)

        toast.error('Invalid Username or Password')
        setLoading(false)
      }
    } catch (error) {
      console.log('==========error:', error)

      toast.error('Invalid Username or Password')
      setLoading(false)
    }
  }

  return { ...form, loading, onSubmit: form.handleSubmit(onSubmit) }
}
