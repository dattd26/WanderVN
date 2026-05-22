import React, { useState, useEffect } from 'react'
import './App.css'

type ViewType = 'login' | 'register'

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  terms?: string;
}

function App() {
  const [view, setView] = useState<ViewType>('register')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  
  // Loading and Interactive States
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' })

  // Clear inputs and errors when toggling views
  const handleViewToggle = (newView: ViewType) => {
    setView(newView)
    setFullName('')
    setEmail('')
    setPassword('')
    setAgreeTerms(false)
    setErrors({})
    setPasswordStrength({ score: 0, label: '', color: '' })
  }

  // Live password strength validator
  useEffect(() => {
    if (!password) {
      setPasswordStrength({ score: 0, label: '', color: '' })
      return
    }

    let score = 0
    if (password.length >= 6) score += 1
    if (password.length >= 8) score += 1
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1

    let label = 'Weak'
    let color = 'bg-red-500'

    if (score === 2) {
      label = 'Moderate'
      color = 'bg-yellow-500'
    } else if (score >= 3) {
      label = 'Strong'
      color = 'bg-green-600'
    }

    setPasswordStrength({ score, label, color })
  }, [password])

  // Toast auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  // Form Validation
  const validateForm = (): boolean => {
    const tempErrors: FormErrors = {}
    
    if (view === 'register') {
      if (!fullName.trim()) {
        tempErrors.fullName = 'Full name is required for registration.'
      } else if (fullName.trim().length < 2) {
        tempErrors.fullName = 'Please enter a valid full name.'
      }

      if (!agreeTerms) {
        tempErrors.terms = 'You must agree to the Terms and Privacy Policy to proceed.'
      }
    }

    if (!email) {
      tempErrors.email = 'Email address is required.'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Please provide a valid email format (e.g. traveler@wandervn.com).'
    }

    if (!password) {
      tempErrors.password = 'Password is required.'
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters.'
    }

    setErrors(tempErrors)
    return Object.keys(tempErrors).length === 0
  }

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    
    // Simulate premium API request with loader state
    setTimeout(() => {
      setIsLoading(false)
      setIsSuccess(true)
      
      // Keep success state for 2 seconds then reset or transition
      setTimeout(() => {
        setIsSuccess(false)
        if (view === 'register') {
          setToastMessage('Account created successfully! Welcome to WanderVN.')
          setView('login')
        } else {
          setToastMessage('Welcome back! Loading your heritage journey...')
        }
      }, 2000)
    }, 1500)
  }

  // Handle Mock Forgot Password
  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: 'Please enter a valid email address first to receive the reset link.' })
      return
    }
    setErrors({})
    setToastMessage(`A heritage reset link has been dispatched to ${email}.`)
  }

  return (
    <div className="relative min-h-screen w-full bg-background text-on-background font-body-md overflow-x-hidden flex flex-col justify-between selection:bg-secondary-container selection:text-on-secondary-container">
      
      {/* Toast Alert System */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in bg-surface border border-secondary/30 shadow-[0_10px_30px_rgba(115,92,0,0.15)] px-6 py-4 flex items-center gap-3 max-w-md w-[90%] md:w-auto">
          <span className="material-symbols-outlined text-secondary text-xl">compass_calibration</span>
          <p className="font-label-md text-sm text-on-surface-variant font-medium tracking-wide">{toastMessage}</p>
        </div>
      )}

      {/* Cinematic Background Crossfade */}
      <div className="fixed inset-0 z-0 transition-all duration-1000 ease-in-out">
        {/* Background image for Sign Up page */}
        <div 
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${view === 'register' ? 'opacity-100' : 'opacity-0 z-10'}`}
        >
          <img 
            alt="Vietnamese landscape at dawn" 
            className="w-full h-full object-cover select-none" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKmGEbQk-_4b7xNcLj2HZoCEmK0IC06xAoaBvkzYz1yZ4f8l0pi57VuBqpiqbk3zHddO30D072em3fqJXX6JVs7r2zhMeJf4L-dXE1Ro4vKDhH2NsnM0TstxDZumat3r-CspfE5rxsOPBh6I7u_Lrz-dvgn9kwVm0CstOnGzgA0_aFGpqg8uV-f8Rh7yYHhfav_FYb-kTk-WXO7am30lufVsEAwMZHOPTU_JSXhRW5_H6YIIrjRT9WnRXoi4rw1o3nMR5AaGTPu-c"
          />
          <div className="absolute inset-0 cinematic-overlay bg-black/40"></div>
        </div>

        {/* Background image for Sign In page */}
        <div 
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${view === 'login' ? 'opacity-100' : 'opacity-0 z-10'}`}
        >
          <img 
            alt="Cinematic heritage hotel" 
            className="w-full h-full object-cover select-none" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXC-T5xskZCGh3YZVVaP5f2A1yY9db03Oa_XhkC5tAtfDF08znuq4Z35OHAqmlP_elNFh62ycwR-oaRUEuCdNcg_UrBnOIXZOJSfNwJK2rf4owAhbPWl_C2MhictCoMiN0RVJ46DHX_9jbqqdNOEaF92R05G-w_vFBcWD_CkJSgV375vI5e3RVZXN20wvb_Fhwnp5TWKrsBWLny69FUUcu5okGAKnr21bugzrM00ZPuWZ-XStV7ycnuoWO2AzqjTqB6a_8pfgZ4zA"
          />
          <div className="absolute inset-0 bg-primary/40 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/60 via-transparent to-primary/30"></div>
        </div>
      </div>

      {/* Top Header Panel (Sign In brand identity is top-left pinned, Sign Up centered in card) */}
      <header className="relative z-10 w-full px-margin-mobile md:px-margin-desktop py-6 md:py-8 max-w-container-max mx-auto flex justify-between items-center select-none pointer-events-none">
        <div className={`font-display-lg text-2xl md:text-3xl text-surface-bright tracking-tighter transition-all duration-700 ease-in-out ${view === 'login' ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 pointer-events-none'}`}>
          WanderVN
        </div>
      </header>

      {/* Primary Card Workspace */}
      <main className={`relative z-10 flex-grow w-full flex items-center px-margin-mobile py-8 md:py-16 md:px-margin-desktop transition-all duration-700 ease-in-out ${view === 'login' ? 'justify-center md:justify-end md:pr-margin-desktop' : 'justify-center'}`}>
        
        <div 
          className={`relative w-full shadow-[0_20px_40px_rgba(26,26,26,0.25)] border border-on-primary-container/5 transition-all duration-500 ease-in-out overflow-hidden animate-fade-scale
            ${view === 'register' 
              ? 'max-w-[480px] p-8 md:p-12 bg-surface-container-low paper-grain' 
              : 'max-w-[440px] p-10 md:p-14 bg-surface-container-low paper-grain'
            }`}
        >
          {/* Success Overlay Screen */}
          {isSuccess && (
            <div className="absolute inset-0 z-30 bg-surface flex flex-col items-center justify-center p-8 animate-fade-in text-center">
              <div className="w-16 h-16 rounded-full border border-secondary flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-secondary text-4xl animate-bounce">check</span>
              </div>
              <h3 className="font-headline-md text-2xl text-primary tracking-tight">
                {view === 'register' ? 'Registration Dispatched' : 'Journey Initiated'}
              </h3>
              <p className="font-body-md text-on-surface-variant mt-2 text-sm max-w-[280px]">
                {view === 'register' 
                  ? 'Your travelers legacy is being recorded. Preparing authentication portal...' 
                  : 'Welcome back, traveler. Synchronizing boutique itineraries...'}
              </p>
            </div>
          )}

          {/* REGISTER (SIGN UP) VIEW */}
          {view === 'register' && (
            <div>
              {/* Brand Header */}
              <div className="mb-8 md:mb-10 text-center select-none animate-fade-in">
                <h2 className="font-display-lg text-4xl text-primary tracking-tighter mb-2">WanderVN</h2>
                <div className="w-12 h-[1px] bg-secondary mx-auto mb-6 opacity-40"></div>
                <h1 className="font-headline-md text-2xl text-on-background">Join the Journey</h1>
                <p className="font-body-md text-sm text-on-surface-variant mt-2">Curate your legacy of travel.</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in" noValidate>
                
                {/* Full Name input */}
                <div className="relative group">
                  <label 
                    className={`block font-label-md text-xs uppercase tracking-wider mb-1 transition-colors duration-300 ${errors.fullName ? 'text-error' : 'text-on-surface-variant group-focus-within:text-secondary'}`}
                    htmlFor="full_name"
                  >
                    Full Name
                  </label>
                  <input 
                    className={`w-full bg-transparent border-b py-2 focus:outline-none focus:ring-0 transition-all placeholder:text-surface-variant/70 font-body-md text-sm bg-surface-container-lowest/20
                      ${errors.fullName 
                        ? 'border-error focus:border-error' 
                        : 'border-outline-variant focus:border-secondary'
                      }`}
                    id="full_name" 
                    name="full_name" 
                    placeholder="Enter your full name" 
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value)
                      if (errors.fullName) setErrors({ ...errors, fullName: undefined })
                    }}
                  />
                  {errors.fullName && (
                    <span className="text-error font-caption text-xs mt-1 block tracking-tight">{errors.fullName}</span>
                  )}
                </div>

                {/* Email Address input */}
                <div className="relative group">
                  <label 
                    className={`block font-label-md text-xs uppercase tracking-wider mb-1 transition-colors duration-300 ${errors.email ? 'text-error' : 'text-on-surface-variant group-focus-within:text-secondary'}`}
                    htmlFor="email"
                  >
                    Email Address
                  </label>
                  <input 
                    className={`w-full bg-transparent border-b py-2 focus:outline-none focus:ring-0 transition-all placeholder:text-surface-variant/70 font-body-md text-sm bg-surface-container-lowest/20
                      ${errors.email 
                        ? 'border-error focus:border-error' 
                        : 'border-outline-variant focus:border-secondary'
                      }`}
                    id="email" 
                    name="email" 
                    placeholder="your@email.com" 
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (errors.email) setErrors({ ...errors, email: undefined })
                    }}
                  />
                  {errors.email && (
                    <span className="text-error font-caption text-xs mt-1 block tracking-tight">{errors.email}</span>
                  )}
                </div>

                {/* Password input */}
                <div className="relative group">
                  <label 
                    className={`block font-label-md text-xs uppercase tracking-wider mb-1 transition-colors duration-300 ${errors.password ? 'text-error' : 'text-on-surface-variant group-focus-within:text-secondary'}`}
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <input 
                    className={`w-full bg-transparent border-b py-2 focus:outline-none focus:ring-0 transition-all placeholder:text-surface-variant/70 font-body-md text-sm bg-surface-container-lowest/20
                      ${errors.password 
                        ? 'border-error focus:border-error' 
                        : 'border-outline-variant focus:border-secondary'
                      }`}
                    id="password" 
                    name="password" 
                    placeholder="Create a secure password" 
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (errors.password) setErrors({ ...errors, password: undefined })
                    }}
                  />
                  
                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="mt-2 animate-fade-in">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-caption text-[11px] text-on-surface-variant">Strength: <strong>{passwordStrength.label}</strong></span>
                      </div>
                      <div className="w-full bg-surface-variant h-1 rounded-full overflow-hidden flex gap-0.5">
                        <div className={`h-full transition-all duration-500 ${passwordStrength.color} ${passwordStrength.score >= 1 ? 'w-1/3' : 'w-0'}`}></div>
                        <div className={`h-full transition-all duration-500 ${passwordStrength.color} ${passwordStrength.score >= 2 ? 'w-1/3' : 'w-0'}`}></div>
                        <div className={`h-full transition-all duration-500 ${passwordStrength.color} ${passwordStrength.score >= 3 ? 'w-1/3' : 'w-0'}`}></div>
                      </div>
                    </div>
                  )}

                  {errors.password && (
                    <span className="text-error font-caption text-xs mt-1 block tracking-tight">{errors.password}</span>
                  )}
                </div>

                {/* Terms of Service check */}
                <div className="flex flex-col pt-1">
                  <div className="flex items-start gap-3">
                    <input 
                      className={`mt-1 h-4 w-4 border-on-background/20 text-secondary focus:ring-secondary cursor-pointer transition-colors
                        ${errors.terms ? 'border-error focus:ring-error' : 'border-outline-variant'}`}
                      id="terms" 
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => {
                        setAgreeTerms(e.target.checked)
                        if (errors.terms) setErrors({ ...errors, terms: undefined })
                      }}
                    />
                    <label className="font-caption text-xs leading-relaxed text-on-surface-variant cursor-pointer select-none" htmlFor="terms">
                      I agree to the <a className="underline hover:text-secondary transition-colors" href="#terms" onClick={(e) => e.preventDefault()}>Terms of Service</a> and <a className="underline hover:text-secondary transition-colors" href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>.
                    </label>
                  </div>
                  {errors.terms && (
                    <span className="text-error font-caption text-xs mt-1 block tracking-tight">{errors.terms}</span>
                  )}
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button 
                    disabled={isLoading}
                    className="w-full bg-secondary-container text-on-secondary-container py-4 font-label-md text-xs uppercase tracking-[0.2em] shadow-md hover:opacity-90 active:scale-[0.99] transition-all flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed select-none group"
                    type="submit"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-on-secondary-container" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        COMMITTING LEGACY...
                      </span>
                    ) : (
                      <>
                        CREATE ACCOUNT
                        <span className="material-symbols-outlined ml-2 text-[18px] transition-transform group-hover:translate-x-1">arrow_right_alt</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Toggle to Sign In */}
              <div className="mt-8 text-center animate-fade-in select-none">
                <p className="font-body-md text-sm text-on-surface-variant">
                  Already have an account? 
                  <button 
                    onClick={() => handleViewToggle('login')}
                    className="text-primary font-semibold hover:text-secondary transition-colors inline-flex items-center ml-1 border-b border-transparent hover:border-secondary py-0.5"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* LOGIN (SIGN IN) VIEW */}
          {view === 'login' && (
            <div>
              {/* Card Header */}
              <header className="mb-10 md:mb-12 animate-fade-in select-none">
                <h1 className="font-headline-lg text-3xl text-primary mb-2">Sign In</h1>
                <p className="font-body-md text-sm text-on-surface-variant opacity-80">Return to your curated journey.</p>
              </header>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-6 animate-fade-in" noValidate>
                
                {/* Email Input */}
                <div className="flex flex-col gap-1.5 group">
                  <label 
                    className={`font-label-md text-xs text-on-surface uppercase tracking-widest opacity-60 transition-colors duration-300 ${errors.email ? 'text-error opacity-100' : 'group-focus-within:text-secondary group-focus-within:opacity-100'}`} 
                    htmlFor="email"
                  >
                    Email Address
                  </label>
                  <input 
                    className={`bg-transparent border-b py-2 font-body-md text-sm focus:outline-none transition-colors placeholder:text-outline-variant/60 bg-surface-container-lowest/10
                      ${errors.email 
                        ? 'border-error focus:border-error' 
                        : 'border-outline-variant focus:border-primary'
                      }`}
                    id="email" 
                    name="email" 
                    placeholder="traveler@wandervn.com" 
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (errors.email) setErrors({ ...errors, email: undefined })
                    }}
                  />
                  {errors.email && (
                    <span className="text-error font-caption text-xs mt-1 block tracking-tight">{errors.email}</span>
                  )}
                </div>

                {/* Password Input */}
                <div className="flex flex-col gap-1.5 group">
                  <div className="flex justify-between items-baseline select-none">
                    <label 
                      className={`font-label-md text-xs text-on-surface uppercase tracking-widest opacity-60 transition-colors duration-300 ${errors.password ? 'text-error opacity-100' : 'group-focus-within:text-secondary group-focus-within:opacity-100'}`} 
                      htmlFor="password"
                    >
                      Password
                    </label>
                    <a 
                      className="font-caption text-xs text-secondary hover:text-on-secondary-container transition-colors uppercase tracking-tight" 
                      href="#forgot-password"
                      onClick={handleForgotPassword}
                    >
                      Forgot Password?
                    </a>
                  </div>
                  <input 
                    className={`bg-transparent border-b py-2 font-body-md text-sm focus:outline-none transition-colors placeholder:text-outline-variant/60 bg-surface-container-lowest/10
                      ${errors.password 
                        ? 'border-error focus:border-error' 
                        : 'border-outline-variant focus:border-primary'
                      }`}
                    id="password" 
                    name="password" 
                    placeholder="••••••••" 
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (errors.password) setErrors({ ...errors, password: undefined })
                    }}
                  />
                  {errors.password && (
                    <span className="text-error font-caption text-xs mt-1 block tracking-tight">{errors.password}</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-6 mt-4">
                  <button 
                    disabled={isLoading}
                    className="w-full bg-secondary-container text-on-secondary-container py-4 font-label-md text-xs uppercase tracking-[0.2em] shadow-md hover:opacity-90 active:scale-[0.99] transition-all flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed select-none" 
                    type="submit"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-on-secondary-container" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        INITIATING...
                      </span>
                    ) : (
                      'Sign In'
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 py-1 select-none">
                    <span className="font-body-md text-sm text-on-surface-variant opacity-70">New to the heritage?</span>
                    <button 
                      type="button"
                      onClick={() => handleViewToggle('register')}
                      className="font-label-md text-sm text-secondary border-b border-transparent hover:border-secondary transition-all font-semibold"
                    >
                      Create an Account
                    </button>
                  </div>
                </div>
              </form>

              {/* Cinematic Footer Note */}
              <footer className="mt-12 pt-6 border-t border-on-primary-container/10 select-none animate-fade-in">
                <p className="font-caption text-xs text-on-surface-variant leading-relaxed italic opacity-60 text-center">
                  "Luxury is not a place, but a moment captured in time."
                </p>
              </footer>
            </div>
          )}

        </div>
      </main>

      {/* Decorative Information overlay panel (switches based on active view) */}
      <div className="relative z-10 w-full select-none">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-6 flex justify-between items-end">
          
          {/* Bottom Left: Cinematic Site Description */}
          <div className="hidden lg:block">
            <div className="flex flex-col gap-3 text-surface-bright/70 max-w-sm">
              <span className="font-label-md text-[10px] uppercase tracking-[0.4em] text-secondary-fixed">
                {view === 'register' ? 'Dawn over Trang An' : 'Ancient Hue'}
              </span>
              <div className="w-12 h-[1px] bg-surface-bright/30"></div>
              <p className="font-caption text-xs leading-relaxed text-surface-bright/60">
                {view === 'register' 
                  ? 'A breathtaking cinematic landscape of Ninh Binh. Limestone karsts emerge from morning mist, evoking the quiet luxury of the natural world.' 
                  : 'Experience the quiet sophistication of boutique French-colonial villas through our hand-curated stays in ancient Vietnam.'
                }
              </p>
            </div>
          </div>

          {/* Bottom Right: Copyright and Navigation links */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 w-full lg:w-auto text-surface-bright/40 text-[11px] uppercase tracking-widest border-t border-white/5 pt-4 md:pt-0 md:border-none">
            <p className="text-center md:text-left">
              © {new Date().getFullYear()} WanderVN. Crafted for the Discerning Traveler.
            </p>
            <div className="flex gap-4">
              <a className="hover:text-surface-bright transition-colors" href="#privacy" onClick={(e) => e.preventDefault()}>Privacy</a>
              <a className="hover:text-surface-bright transition-colors" href="#terms" onClick={(e) => e.preventDefault()}>Terms</a>
              <a className="hover:text-surface-bright transition-colors" href="#contact" onClick={(e) => e.preventDefault()}>Contact</a>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}

export default App;
