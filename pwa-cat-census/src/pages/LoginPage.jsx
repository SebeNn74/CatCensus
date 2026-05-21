import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { loginApi, registerApi } from '../api/auth'
import catLogo from '/icon_rounded.png'

function LoginPage() {
	const [isRegistering, setIsRegistering] = useState(false)
	const [user, setUser] = useState('')
	const [password, setPassword] = useState('')

	// Campos extra para registro
	const [name, setName] = useState('')
	const [lastName, setLastName] = useState('')
	const [docType, setDocType] = useState('CC')
	const [document, setDocument] = useState('')
	const [address, setAddress] = useState('')
	const [phone, setPhone] = useState('')
	const [city, setCity] = useState('')

	const [error, setError] = useState(null)
	const [loading, setLoading] = useState(false)

	const { login } = useAuth()
	const navigate = useNavigate()

	const handleSubmit = async (e) => {
		e.preventDefault()
		setLoading(true)
		setError(null)

		try {
			if (isRegistering) {
				const data = await registerApi({
					name,
					last_name: lastName,
					docType,
					document,
					address,
					phone,
					city,
					user,
					password
				})
				login(data.token)
				navigate('/censo')
			} else {
				const data = await loginApi(user, password)
				login(data.token)
				navigate('/censo')
			}
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
			<h1>{isRegistering ? 'Registrarse' : 'Iniciar Sesión'}</h1>
			<form onSubmit={handleSubmit}>
				{isRegistering && (
					<>
						<input type="text" placeholder="Nombres" value={name} onChange={(e) => setName(e.target.value)} required />
						<input type="text" placeholder="Apellidos" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
						<select value={docType} onChange={(e) => setDocType(e.target.value)} required style={{display: "block", width: "100%", marginBottom: "1rem", padding: "10px", borderRadius: "8px", border: "1px solid #ddd"}}>
							<option value="CC">CC</option>
							<option value="CE">CE</option>
							<option value="Pasaporte">Pasaporte</option>
						</select>
						<input type="text" placeholder="Número de Documento" value={document} onChange={(e) => setDocument(e.target.value)} required />
						<input type="text" placeholder="Dirección" value={address} onChange={(e) => setAddress(e.target.value)} required />
						<input type="text" placeholder="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} required />
						<input type="text" placeholder="Ciudad" value={city} onChange={(e) => setCity(e.target.value)} required />
					</>
				)}

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
					{loading ? 'Procesando...' : (isRegistering ? 'Crear Cuenta' : 'Ingresar')}
				</button>
				{error && <p style={{ color: 'red', marginTop: '8px' }}>{error}</p>}
			</form>

			<div style={{ textAlign: 'center', marginTop: '16px' }}>
				<button 
					type="button" 
					onClick={() => {
						setIsRegistering(!isRegistering)
						setError(null)
					}} 
					style={{ background: 'none', border: 'none', color: '#3b82f6', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
				>
					{isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
				</button>
			</div>
		</div>
	)
}

export default LoginPage