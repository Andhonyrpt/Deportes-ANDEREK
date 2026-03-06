import "./Button.css";

export default function Button({
    children,
    onClick,
    type = "button",
    disabled = false,
    variant = "primary",
    size = "base",
    className = "",
    "data-testid": testId,
}) {
    const buttonClasses = [
        "btn",
        `btn-${variant}`,
        size !== "base" ? `btn-${size}` : "",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <button
            type={type}
            data-testid={testId}
            className={buttonClasses}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
