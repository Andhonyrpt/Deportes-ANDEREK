import './FormField.css';

export default function FormField({
    id,
    label,
    name,
    value,
    type = 'text',
    placeholder = "",
    onChange,
    onBlur,
    error,
    showError,
    autoComplete
}) {
    const errorId = `${id}-error`;
    const invalid = Boolean(showError && error);

    return (
        <div className=' formField'>
            <label className='formLabel' htmlFor={id}>
                {label}
            </label>

            <input
                id={id}
                className={`formInput ${invalid ? "isInvalid" : ""}`}
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
                <p className='formError' id={errorId}>
                    {error}
                </p>
            ) : null}
        </div>
    );
};