import { useState } from "react";
import "./Newsletter.css";

export default function Newsletter() {
    const [email, setEmail] = useState("");

    const handleNewsletterSubmit = (e) => {
        e.preventDefault();
        console.log("Newsletter signup:", email);
        setEmail("");
    };

    return (
        <section>
            <div className="newsletter-content">
                <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
                    <div className="newsletter-input-group">
                        <input
                            type="email"
                            className="newsletter-input"
                            placeholder="Suscribete al boletín"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button type="submit" className="newsletter-btn">
                            Suscribirse
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}