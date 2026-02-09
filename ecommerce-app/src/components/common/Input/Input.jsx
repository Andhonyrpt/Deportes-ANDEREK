import "./Input.css";

export default function Input({
  id,
  label,
  name,
  value,
  type = "text",
  placeholder = "",
  onChange,
  onBlur,
  error,
  showError,
  autoComplete,
}) {
  const errorId = `${id}-error`;
  const invalid = Boolean(showError, error);
  const className = "";

  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}
      
      <input
        id={id}
        className={`form-input ${invalid} ? "isInvalid" : "" `}
        name={name}
        value={value}
        type={type}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
        autoComplete={autoComplete}
        aria-invalid={invalid ? "true" : "false"}
        aria-describedby={invalid ? errorId : undefined}
      />
      {invalid ? (
        <p className="formError" errorId>
          {error}
        </p>
      ) : null}
    </div>
  );
}
