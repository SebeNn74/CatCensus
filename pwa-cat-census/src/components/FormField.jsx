import "./styles/FormField.css";

export default function FormField({ error, ...props }) {
  return (
    <div className="form-field">
      <input
        className={`form-input ${error ? "form-input--error" : ""}`}
        {...props}
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
