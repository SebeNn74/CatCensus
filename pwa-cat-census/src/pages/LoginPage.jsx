import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { loginApi } from '../api/auth'
import catLogo from '/icon_rounded.png'

function LoginPage() {
	const [user, setUser] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState(null)
	const [loading, setLoading] = useState(false)

	const { login } = useAuth()
	const navigate = useNavigate()

	const handleSubmit = async (e) => {
		e.preventDefault()
		setLoading(true)
		setError(null)

		try {
			const data = await loginApi(user, password)
			login(data.token)
			navigate('/censo')
		} catch (err) {
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div>
			<div className="hero">
				<img src={catLogo} alt="Gato logo" />
			</div>
			<h1>Iniciar Sesión</h1>
			<form onSubmit={handleSubmit}>
				<input
					type="text"
					placeholder="Usuario"
					value={user}
					onChange={(e) => setUser(e.target.value)}
					required
				/>
				<input
					type="password"
					placeholder="Contraseña"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
				/>
				<button type="submit" disabled={loading}>
					{loading ? 'Entrando...' : 'Ingresar'}
				</button>
				{error && <p style={{ color: 'red' }}>{error}</p>}
			</form>
		</div>
	)
}

export default LoginPage