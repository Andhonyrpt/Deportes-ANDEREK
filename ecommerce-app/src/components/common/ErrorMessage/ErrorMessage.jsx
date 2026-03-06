import './ErrorMessage.css';

export default function ErrorMessage({ children, ...props }) {
    return (
        <div className='error-container' {...props}>{children}</div>
    );
};