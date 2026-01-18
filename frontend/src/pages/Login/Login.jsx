import { useState } from 'react';
import Button from '../../components/Button/Button.jsx';
import Loader from '../../components/Loader/Loader.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const Login = () => {
  const { signInWithPassword, signUp, authLoading, authError } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    try {
      if (isSignUp) {
        await signUp(email, password);
        setSuccessMessage('Account created! You can now sign in.');
        setIsSignUp(false); // Switch to sign-in view
        setPassword('');   // Clear password field
      } else {
        await signInWithPassword(email, password);
      }
    } catch (err) {
      setError(err.message || `Failed to ${isSignUp ? 'sign up' : 'sign in'}`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-card p-8 shadow-card">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light text-primary">
            🎓
          </div>
          <h1 className="text-2xl font-semibold text-body">
            {isSignUp ? 'Create your Account' : 'Welcome Back'}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {isSignUp ? 'Join your campus startup network.' : 'Sign in to continue.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {successMessage && (
            <div className="rounded-2xl bg-primary-light p-4 text-center text-sm text-primary">
              {successMessage}
            </div>
          )}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-muted">
                University Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="yourname@university.edu"
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-body outline-none ring-primary transition focus:ring"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-muted">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-body outline-none ring-primary transition focus:ring"
              />
            </div>

            <Button type="submit" variant="primary" className="w-full" disabled={authLoading}>
              {authLoading ? (
                <Loader size="sm" label={isSignUp ? 'Creating Account...' : 'Signing In...'} inline />
              ) : isSignUp ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </Button>

            {authError && <p className="text-sm text-danger">{authError}</p>}
            {error && <p className="text-sm text-danger">{error}</p>}
          </form>

        <div className="mt-6 text-center text-sm">
          <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="font-medium text-primary hover:underline">
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
