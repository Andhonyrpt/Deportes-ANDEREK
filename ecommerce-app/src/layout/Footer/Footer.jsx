import Icon from "../../components/common/Icon";
import { Link } from 'react-router-dom';
import Newsletter from "../Newsletter/Newsletter";
import './Footer.css';

export default function Footer() {

    return (
        <footer className="footer">

            {/* Main Footer */}
            <section className="footer-main">
                <div className="container footer-container">
                    <div className="footer-content">
                        <div className="footer-section">
                            <div className="footer-logo">
                                <Link to="/" className="logo">
                                    Playeras la 10
                                </Link>
                            </div>
                            <p className="footer-description">
                                Tienda oficial de jerseys de temporada. <br />
                                Productos 100% auténticos.
                            </p>

                            <div className="social-links">
                                <h4>Síguenos</h4>
                                <div className="social-icons">
                                    <Link
                                        to="https://www.facebook.com/AndhonyR/?locale=es_LA"
                                        aria-label="Facebook">
                                        <Icon name="Facebook" size={20} />
                                    </Link>
                                    <Link to="#" aria-label="Twitter">
                                        <Icon name="twitter" size={20} />
                                    </Link>
                                    <Link
                                        to="https://www.instagram.com/playeras_la_10/"
                                        aria-label="Instagram">
                                        <Icon name="instagram" size={20} />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="footer-section">
                            <h3>Atención al Cliente</h3>
                            <ul>
                                <li>
                                    <Link to="#">Preguntas frecuentes</Link>
                                </li>
                                <li>
                                    <Link to="#">Envíos y Devoluciones</Link>
                                </li>
                                <li>
                                    <Link to="#">Terminos y condiciones</Link>
                                </li>
                                <li>
                                    <p>Contacto: soporte@example.com</p>
                                </li>
                            </ul>
                        </div>

                        <div className="footer-section">
                            <div className="payment-content">
                                <div className="payment-section">
                                    <h3>Métodos de pago</h3>
                                    <div className="payment-icons">
                                        <Icon name="visa" size={32} />
                                        <Icon name="mastercard" size={32} />
                                        <Icon name="amex" size={32} />
                                        <Icon name="paypal" size={32} />
                                        <Icon name="applepay" size={32} />
                                        <Icon name="googlepay" size={32} />
                                    </div>
                                </div>
                            </div>
                            <Newsletter />

                        </div>
                    </div>
                </div>
            </section>

            {/* Footer Bottom */}
            <section className="footer-bottom">
                <div className="container">
                    <div className="footer-bottom-content">
                        <p className="copyright">
                            &copy; {new Date().getFullYear()} playerasla10.com. Todos los derechos reservados.
                        </p>
                    </div>
                </div>
            </section>
        </footer>
    );
};