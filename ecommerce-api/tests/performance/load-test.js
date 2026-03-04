import http from 'k6/http';
import { check, sleep } from 'k6';

// 1. Opciones (Profile de Carga y SLAs)
export const options = {
    // Definimos las etapas de la prueba (Stress Test)
    stages: [
        { duration: '30s', target: 20 },  // Ramp-up (subida a 20 usuarios en 30s)
        { duration: '1m', target: 50 },   // Subida sostenida a 50 usuarios
        { duration: '30s', target: 100 }, // Pico de estrés a 100 usuarios concurrentes
        { duration: '1m', target: 100 },  // Mantener carga al máximo
        { duration: '30s', target: 0 },   // Ramp-down (bajada a 0 usuarios)
    ],

    // 2. Criterios de Éxito (SLAs / Thresholds)
    thresholds: {
        // El 95% de las peticiones deben ser menores a 1000ms (1s) según el requerimiento.
        // Y el 99% a menos de 1500ms
        http_req_duration: ['p(95)<1000', 'p(99)<1500'],

        // La cantidad de peticiones fallidas debe ser menor al 1%
        http_req_failed: ['rate<0.01'],
    },
};

// Variables comunes
const BASE_URL = __ENV.API_URL || 'http://localhost:3000/api/v1';

// 3. Flujo Principal (Escenario VU)
export default function () {
    // Escenario 1: Obtener la lista de productos
    const resProducts = http.get(`${BASE_URL}/products`);

    // Validación (Assertions integradas)
    check(resProducts, {
        'status is 200 (productos)': (r) => r.status === 200,
        'tiempo de respuesta es menor a 1s': (r) => r.timings.duration < 1000,
    });

    // Simulamos tiempo de lectura (Think time real de usuario)
    sleep(1);

    // Escenario 2: Ver detalles de un producto específico (suponiendo ID válido en BD)
    // Extraer random ID si es posible, aquí usamos uno estático de ejemplo
    // const resProductDetail = http.get(`${BASE_URL}/products/123456789`);
    // check(resProductDetail, {
    //    'status is 200 (detalle de producto)': (r) => r.status === 200,
    // });

    // sleep(2);
}
