import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { loginApi, registerApi } from "../api/auth";
import catLogo from "/icon_maskable.png";
import "./styles/LoginPage.css";

const DOC_TYPES = [
  { value: "CC", label: "CC – Cédula de Ciudadanía" },
  { value: "CE", label: "CE – Cédula de Extranjería" },
  { value: "Pasaporte", label: "Pasaporte" },
];

const INITIAL_REGISTER_FIELDS = {
  name: "",
  lastName: "",
  docType: "CC",
  document: "",
  address: "",
  phone: "",
  city: "",
};

function FormField({ type = "text", placeholder, value, onChange, required }) {
  return (
    <input
      className="login-input"
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
    />
  );
}

function RegisterFields({ fields, onChange }) {
  return (
    <>
      <FormField
        placeholder="Nombres"
        value={fields.name}
        onChange={(e) => onChange("name", e.target.value)}
        required
      />
      <FormField
        placeholder="Apellidos"
        value={fields.lastName}
        onChange={(e) => onChange("lastName", e.target.value)}
        required
      />

      <select
        className="login-input login-select"
        value={fields.docType}
        onChange={(e) => onChange("docType", e.target.value)}
        required
      >
        {DOC_TYPES.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <FormField
        placeholder="Número de Documento"
        value={fields.document}
        onChange={(e) => onChange("document", e.target.value)}
        required
      />
      <FormField
        placeholder="Dirección"
        value={fields.address}
        onChange={(e) => onChange("address", e.target.value)}
        required
      />
      <FormField
        placeholder="Teléfono"
        value={fields.phone}
        onChange={(e) => onChange("phone", e.target.value)}
        required
      />
      <FormField
        placeholder="Ciudad"
        value={fields.city}
        onChange={(e) => onChange("city", e.target.value)}
        required
      />
    </>
  );
}

function useLoginForm() {
  const [credentials, setCredentials] = useState({ user: "", password: "" });
  const [registerFields, setRegisterFields] = useState(INITIAL_REGISTER_FIELDS);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const updateCredential = (field) => (e) =>
    setCredentials((prev) => ({ ...prev, [field]: e.target.value }));

  const updateRegisterField = (field, value) =>
    setRegisterFields((prev) => ({ ...prev, [field]: value }));

  return {
    credentials,
    registerFields,
    error,
    loading,
    setError,
    setLoading,
    updateCredential,
    updateRegisterField,
  };
}

function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);

  const {
    credentials,
    registerFields,
    error,
    loading,
    setError,
    setLoading,
    updateCredential,
    updateRegisterField,
  } = useLoginForm();

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAuthSuccess = (token) => {
    login(token);
    navigate("/censo");
  };

  const handleLogin = async () => {
    const data = await loginApi(credentials.user, credentials.password);
    handleAuthSuccess(data.token);
  };

  const handleRegister = async () => {
    const data = await registerApi({
      name: registerFields.name,
      last_name: registerFields.lastName,
      docType: registerFields.docType,
      document: registerFields.document,
      address: registerFields.address,
      phone: registerFields.phone,
      city: registerFields.city,
      user: credentials.user,
      password: credentials.password,
    });
    handleAuthSuccess(data.token);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegistering) {
        await handleRegister();
      } else {
        await handleLogin();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering((prev) => !prev);
    setError(null);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Encabezado */}
        <div className="login-header">
          <div className="login-logo-wrapper">
            <img src={catLogo} alt="Logo de la app" className="login-logo" />
          </div>
          <h1 className="login-title">
            {isRegistering ? "Crear Cuenta" : "Bienvenido"}
          </h1>
          <p className="login-subtitle">
            {isRegistering
              ? "Completa tus datos para registrarte"
              : "Ingresa tus credenciales para continuar"}
          </p>
        </div>

        {/* Formulario */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {isRegistering && (
            <RegisterFields
              fields={registerFields}
              onChange={updateRegisterField}
            />
          )}

          <FormField
            placeholder="Usuario"
            value={credentials.user}
            onChange={updateCredential("user")}
            required
          />
          <FormField
            type="password"
            placeholder="Contraseña"
            value={credentials.password}
            onChange={updateCredential("password")}
            required
          />

          {error && <p className="login-error">{error}</p>}

          <button
            className="login-btn-primary"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Procesando..."
              : isRegistering
                ? "Crear Cuenta"
                : "Ingresar"}
          </button>
        </form>

        {/* Pie de tarjeta */}
        <div className="login-footer">
          <button className="login-btn-link" type="button" onClick={toggleMode}>
            {isRegistering
              ? "¿Ya tienes cuenta? Inicia sesión"
              : "¿No tienes cuenta? Regístrate"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
