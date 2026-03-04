import { browseProducts } from './scenarios/browse.js';
import { registerAndLogin } from './scenarios/auth.js';
import { addToCart } from './scenarios/cart.js';
import { adminOperations } from './scenarios/admin.js';

export const options = {
    // Definición de Multi-Scenarios ejecutándose en paralelo
    scenarios: {
        // 60% de la carga: Navegadores casuales
        Casual_Browsers: {
            executor: 'constant-vus',
            vus: 60, // Mantenemos 60 usuarios concurrentes
            duration: '2m', // Duración de la prueba base
            exec: 'casualBrowsers', // Función a ejecutar
        },
        // 30% de la carga: Compradores que interactúan con carritos
        Power_Shoppers: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '30s', target: 30 }, // Pico a 30 usuarios (el 30%)
                { duration: '1m', target: 30 },  // Mantener carga
                { duration: '30s', target: 0 },  // Rampa de bajada
            ],
            exec: 'powerShoppers',
        },
        // 10% de la carga: Operaciones de estrés del sistema admin
        Admin_Stress: {
            executor: 'constant-vus',
            vus: 10, // 10 usuarios fijos (10%)
            duration: '2m',
            exec: 'adminStress',
        },
    },
    thresholds: {
        http_req_duration: ['p(95)<1000'], // SLA del Tiempos de Respuesta < 1s
        http_req_failed: ['rate<0.05'], // Tolerancia de fallo del 5% debido a la alta carga combinada
    },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:4000/api';

export function casualBrowsers() {
    browseProducts(BASE_URL);
}

export function powerShoppers() {
    // Flujo complejo: Registrarse, Login y obtener token
    const token = registerAndLogin(BASE_URL);
    if (token) {
        addToCart(BASE_URL, token);
    }
}

export function adminStress() {
    // Simulamos un inicio de sesión de personal 
    const token = registerAndLogin(BASE_URL);
    if (token) {
        // Operaciones pesadas de escritura y lecturas complejas
        adminOperations(BASE_URL, token);
    }
}
