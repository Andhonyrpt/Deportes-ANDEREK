# 4. Historias de usuario

**ID:** US-001  
**Título:** Sincronización de Carrito al Iniciar Sesión  
**Como** cliente registrado  
**Quiero** que los artículos que agregué como invitado se unan a mi carrito guardado en la cuenta  
**Para** no perder mi selección al autenticarme.

**Criterios de aceptación:**
- Al hacer login, el sistema debe detectar si hay items en `localStorage`.
- Los items locales deben enviarse al backend para fusionarse con el carrito existente.
- No deben duplicarse productos (mismo ID + misma talla), se deben sumar cantidades.

**Definición de terminado:**
- Código de fusión implementado en `AuthContext` o `CartContext`.
- Test de integración que valide la fusión exitosa.

**Prioridad:** Crítico  
**Estado actual:** ✅ Implementado (CartContext merge logic).

---

**ID:** US-002  
**Título:** Previsualización de Orden desde el Servidor  
**Como** comprador en el checkout  
**Quiero** ver el desglose exacto de impuestos y envío calculado por la tienda  
**Para** tener la certeza de lo que voy a pagar antes de confirmar.

**Criterios de aceptación:**
- El frontend debe llamar a `/orders/preview` al cambiar de etapa en el checkout.
- El desglose mostrado (Subtotal, IVA, Envío, Total) debe provenir 100% de la respuesta de la API.
- Se debe mostrar un estado de carga mientras el servidor calcula los valores.

**Definición de terminado:**
- Endpoint `preview` funcionando en Backend.
- `Checkout.jsx` actualizado para consumir este endpoint.

**Prioridad:** Crítico  
**Estado actual:** ✅ Implementado (Backend endpoint + FE Service + Checkout integration).

---

**ID:** US-003  
**Título:** Gestión Centralizada de Direcciones  
**Como** cliente recurrente  
**Quiero** seleccionar mis direcciones guardadas sin que se guarden copias locales  
**Para** mantener mis datos de envío privados y actualizados en todos mis dispositivos.

**Criterios de aceptación:**
- Las direcciones nuevas deben persistir inmediatamente en el backend.
- El checkout no debe leer de `localStorage` para obtener direcciones si el usuario está logueado.

**Definición de terminado:**
- Integración total con `shippingService`.
- Eliminación de fallbacks de `localStorage` en `Checkout.jsx`.

**Prioridad:** Alto  
**Estado actual:** ✅ Implementado (Checkout refactored to prioritize service data).
