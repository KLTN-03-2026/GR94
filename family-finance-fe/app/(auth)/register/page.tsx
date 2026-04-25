'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { parseMessage, isError } from '@/lib/helper'
import {
  GiaKeLogo, InputField, SubmitBtn, ErrorAlert,
  IconMail, IconLock, IconUser, IconCheck,
} from '@/components/ui/shared'
import { registerAction } from '@/lib/action'

//  Password strength rules 
const pwdRules = (p: string) => [
  { label: 'Ít nhất 6 ký tự',  ok: p.length >= 6 },
]

const RegisterPage = () => {
  const router = useRouter()

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: ''
  })
  const [errors,  setErrors]  = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setErrors((prev) => ({ ...prev, [k]: '' }))
    setApiError('')
  }

  // Validate từng field
  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim())   e.name     = 'Họ tên không được để trống'
    if (!form.email.trim())  e.email    = 'Email không được để trống'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email không hợp lệ'
    if (!form.password)      e.password = 'Mật khẩu không được để trống'
    else if (form.password.length < 6) e.password = 'Mật khẩu ít nhất 6 ký tự'
    if (!form.confirm)       e.confirm  = 'Vui lòng xác nhận mật khẩu'
    else if (form.confirm !== form.password) e.confirm = 'Mật khẩu xác nhận không khớp'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setApiError('')
    setLoading(true)
    try {
      const res = await registerAction({
        name:     form.name.trim(),
        email:    form.email.trim().toLowerCase(),
        password: form.password,
      })

      if (isError(res)) {
        setApiError(parseMessage(res.message))
        return
      }
      
      router.push(`/verify?email=${encodeURIComponent(form.email.trim().toLowerCase())}`)

    } catch {
      setApiError('Không thể kết nối tới server. Thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  const rules = pwdRules(form.password)

  return (
    <div className="min-h-screen bg-[#f6f8f7] dark:bg-[#0f1a14] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-2xl shadow-black/10">

        
        <div className="hidden lg:flex flex-col justify-between bg-[#22C55E] p-12 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/10" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-black/10" />

          
          <div className="relative z-10 flex items-center gap-2">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
              </svg>
            </div>
            <span className="text-white text-xl font-bold">Gia Kế</span>
          </div>

          
          <div className="relative z-10">
            <h2 className="text-white text-4xl font-black leading-tight tracking-tighter mb-8">
              Bắt đầu hành trình<br/>tài chính cùng gia đình
            </h2>
            <div className="flex flex-col gap-5">
              {[
                { icon: '🏠', title: 'Quản lý phòng gia đình',    desc: 'Tạo phòng, mời thành viên dễ dàng' },
                { icon: '📊', title: 'Theo dõi thu chi', desc: 'Biểu đồ trực quan, cảnh báo vượt ngân sách' },
                { icon: '🔔', title: 'Cảnh báo thông minh',       desc: 'Nhận thông báo khi gần vượt hạn mức' },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                    {f.icon}
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm tracking-tight">{f.title}</div>
                    <div className="text-white/70 text-xs font-medium mt-0.5">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex justify-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
            <div className="w-6 h-1.5 bg-white rounded-full" />
            <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
          </div>
        </div>

        
        <div className="bg-white dark:bg-[#122017] flex flex-col justify-center px-8 py-10 sm:px-12 lg:px-14 overflow-y-auto max-h-screen">

          
          <div className="flex lg:hidden justify-center mb-6">
            <GiaKeLogo size="lg" />
          </div>

          <div className="mb-7 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
              Tạo tài khoản
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1.5">
              Chỉ mất 1 phút để bắt đầu
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <InputField
              label="Họ tên"
              type="text"
              icon={<IconUser />}
              placeholder="Nguyễn Văn A"
              value={form.name}
              onChange={set('name')}
              error={errors.name}
              autoComplete="name"
            />

            <InputField
              label="Email"
              type="email"
              icon={<IconMail />}
              placeholder="nguyen@gmail.com"
              value={form.email}
              onChange={set('email')}
              error={errors.email}
              autoComplete="email"
            />

            <div>
              <InputField
                label="Mật khẩu"
                icon={<IconLock />}
                isPassword
                placeholder="Tối thiểu 6 ký tự"
                value={form.password}
                onChange={set('password')}
                error={errors.password}
                autoComplete="new-password"
              />
              
              {form.password && (
                <div className="flex gap-4 mt-2 pl-1">
                  {rules.map((r) => (
                    <div key={r.label} className={`flex items-center gap-1 text-xs transition-colors ${r.ok ? 'text-[#22C55E]' : 'text-slate-400'}`}>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${r.ok ? 'bg-[#22C55E] text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                        {r.ok && <IconCheck />}
                      </span>
                      {r.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <InputField
              label="Xác nhận mật khẩu"
              icon={<IconLock />}
              isPassword
              placeholder="Nhập lại mật khẩu"
              value={form.confirm}
              onChange={set('confirm')}
              error={errors.confirm}
              autoComplete="new-password"
            />

            {apiError && <ErrorAlert message={apiError} />}

            <SubmitBtn
              loading={loading}
              label="Tạo tài khoản"
              loadLabel="Đang tạo tài khoản..."
              disabled={!form.name || !form.email || !form.password || !form.confirm}
            />
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Đã có tài khoản?{' '}
            <Link href="/login" className="text-[#22C55E] hover:text-green-600 font-bold transition-colors">
              Đăng nhập
            </Link>
          </p>

          <div className="flex lg:hidden justify-center mt-6">
            <div className="w-28 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
export default RegisterPage