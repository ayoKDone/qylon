import { useState } from "react"
import { useForm } from "react-hook-form"
import { FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa"
import { Divider } from "../UI/Divider"
import { SocialLogin } from "../UI/SocialLogin"

type LoginFormInputs = {
  email: string
  password: string
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>()

  const onSubmit = async (data: LoginFormInputs) => {
    console.log("Login Data:", data)
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }

  return (
    <div className="flex-1 xui-flex-ai-center xui-flex-jc-center p-12">
      <form
        className="xui-form xui-max-w-500 xui-mx-auto"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h2 className="xui-font-sz-x-large font-bold mb-2">Welcome back</h2>
        <p className="xui-font-sz-small text-gray-500 mb-6">
          Sign in to your Qylon account
        </p>

        <SocialLogin />
        <Divider label="Or continue with email" />

        {/* Email */}
        <div className="xui-form-box" xui-error={errors.email ? "true" : "false"}>
          <label>Email</label>
          <input
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Please enter a valid email",
              },
            })}
            type="email"
            id="email"
            placeholder="olivia@untitledui.com"
          />
          {errors.email && <span className="message">{errors.email.message}</span>}
        </div>

        {/* Password */}
        <div className="xui-form-box" xui-error={errors.password ? "true" : "false"}>
          <label>Password</label>
          <div className="relative">
            <input
              {...register("password", {
                required: "Password is required",
              })}
              type={showPassword ? "text" : "password"}
              id="password"
              className="pr-10 w-full"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex xui-flex-ai-center px-2 text-gray-600"
            >
              {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && <span className="message">{errors.password.message}</span>}
        </div>

        {/* Remember + Forgot */}
        <div className="xui-d-flex xui-flex-ai-center xui-flex-jc-space-between xui-font-sz-small">
          <div className="xui-d-inline-flex xui-font-sz-small xui-flex-ai-center">
            <div className="xui-d-inline-flex">
              <input className="xui-form-input" type="checkbox" />
            </div>
            <span className="">Remember me</span>
          </div>
          <a href="/forgot-password" className="text-purple-600 underline">
            Forgot password?
          </a>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full outline-none xui-mt-half py-2.5 xui-bdr-rad-half bg-gradient-to-r from-purple-500 to-indigo-500 text-white flex items-center justify-center"
        >
          {isSubmitting ? <FaSpinner className="animate-spin h-6 w-6" /> : "Sign In"}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-4 text-center">
        Don’t have an account?{" "}
        <a href="/signup" className="text-purple-600 font-medium">
          Create one
        </a>
      </p>
    </div>
  )
}
