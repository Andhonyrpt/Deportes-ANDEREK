# Guía para Agentes - ecommerce-app

Esta guía documenta los patrones técnicos, estructuras y APIs esenciales del proyecto `ecommerce-app`.

## Estructura de Directorios `src/`

- `components/`: Componentes React organizados por funcionalidad.
  - `common/`: Componentes reutilizables de bajo nivel (UI atomica).
- `context/`: Proveedores de estado global (Auth, Cart).
- `hooks/`: Hooks personalizados reutilizables (ej. `useFormReducer`).
- `layout/`: Componentes que definen la estructura visual de las páginas.
- `pages/`: Componentes de página que corresponden a las rutas.
- `services/`: Lógica de comunicación con la API (usando `http.js`).
- `utils/`: Funciones de utilidad y helpers de almacenamiento.

---

## Contextos Disponibles

### `useAuth()`
Gestiona el estado de sesión y perfil de usuario.
**Retorna:**
- `user`: Objeto con datos del usuario actual o `null`.
- `isAuth`: Booleano indicando si hay una sesión activa.
- `loading`: Booleano de estado de carga inicial.
- `login(email, password)`: `async`, retorna `{ success, user }` o `{ success, error }`.
- `register(userData)`: `async`, retorna `{ success, email, message }`.
- `logout()`: Cierra la sesión y limpia el almacenamiento.
- `hasRole(role)`: Retorna si el usuario tiene un rol específico.
- `getToken()`: Retorna el `authToken` actual.

### `useCart()`
Gestiona el carrito de compras persistente (Sincronizado con API si `isAuth`).
**Retorna:**
- `cartItems`: Array de productos en el carrito.
- `total`: Monto total de la compra.
- `addToCart(product, quantity, size)`: Agrega o incrementa un producto.
- `removeFromCart(productId, size)`: Elimina un producto.
- `updateQuantity(productId, size, quantity)`: Actualiza cantidad.
- `changeItemSize(productId, quantity, oldSize, newSize)`: Cambia talla.
- `clearCart()`: Vacía el carrito.
- `getTotalItems()`: Retorna cantidad total de unidades.

---

## Componentes de `common/`

| Componente | Props Destacadas | Uso |
| :--- | :--- | :--- |
| `Badge` | `text`, `variant` (info, success, etc.), `className` | Etiquetas de estado. |
| `Button` | `children`, `onClick`, `type`, `disabled`, `variant`, `size` | Botón estándar del sistema. |
| `ErrorMessage`| `children` | Mensaje de error con contenedor rojo. |
| `FormField` | `id`, `label`, `name`, `value`, `onChange`, `onBlur`, `error`, `showError` | Input con label y manejo de error integrado. |
| `Icon` | `name`, `size`, `className` | Selector de iconos SVG inline. |
| `Input` | `id`, `label`, `name`, `value`, `onChange`, `onBlur`, `error`, `showError` | Input básico con estilos del sistema. |
| `Loading` | `children` | Spinner de carga con texto opcional. |

---

## Patrón `useFormReducer`

Hook para gestión de formularios complejos con validación.

### Ejemplo de uso:
```javascript
const { values, errors, onChange, onBlur, handleSubmit } = useFormReducer({
  initialValues: { email: "", password: "" },
  validate: (vals) => {
    const errs = {};
    if (!vals.email) errs.email = "Requerido";
    return errs;
  }
});

const onSubmit = async (data) => { /* Lógica de envío */ };

return (
  <form onSubmit={(e) => { e.preventDefault(); handleSubmit(onSubmit); }}>
    <FormField 
      label="Email" name="email" 
      value={values.email} onChange={onChange} onBlur={onBlur}
      error={errors.email} showError={true}
    />
    <Button type="submit">Enviar</Button>
  </form>
);
```

---

## Flujo de Checkout (paso a paso)

Basado en `Checkout.jsx`:
1.  **Validación Inicial**: Si el carrito está vacío, redirige a `/cart`.
2.  **Carga de Datos**: Inicializa direcciones y métodos de pago desde `localStorage` (o servicios).
3.  **Sección 1: Dirección**: El usuario selecciona o crea una dirección. Se persiste en `localStorage` y estado local.
4.  **Sección 2: Pago**: El usuario selecciona o crea un método de pago.
5.  **Sección 3: Revisión**: Se muestra `CartView` para confirmación final.
6.  **Cálculo**: Se aplica `TAX_RATE` (16%) y `SHIPPING_RATE` (si total < 1000).
7.  **Confirmación**: Al hacer clic en "Confirmar y Pagar":
    - Se crea objeto `order`.
    - Se guarda en el historial (`localStorage` de órdenes).
    - Se limpia el carrito (`clearCart`).
    - Redirige a `/order-confirmation` con el estado de la orden.

---

---

## Servicios Disponibles (`services/`)

Toda la comunicación con el backend se centraliza en archivos de servicio:

| Servicio | Funcionalidad Principal |
| :--- | :--- |
| `auth.js` | Login, Registro, Refresh Token, Perfil. |
| `productService.js` | Listado, búsquedas, detalle de producto. |
| `cartService.js` | Sincronización de carrito con API. |
| `categoryService.js` | Gestión de categorías y subcategorías. |
| `orderService.js` | Creación y consulta de órdenes. |
| `shippingService.js`| Direcciones de envío. |
| `paymentService.js` | Métodos de pago. |
| `userService.js` | Gestión de usuarios (Admin). |

---

## Flujos Adicionales

### Wishlist
- **Toggle**: Agregar/remover productos desde miniaturas o detalle.
- **Sincronización**: Se persiste en el backend si el usuario está autenticado.

### Reviews
- **Lectura**: Disponibles públicamente en el detalle del producto.
- **Escritura**: Solo usuarios autenticados que hayan comprado el producto (recomendado verificar en controlador).

---

## Estado del Checkout
> [!NOTE]
> Actualmente, el Checkout (`Checkout.jsx`) utiliza un modelo **híbrido**:
> 1.  Carga datos iniciales desde la API si están disponibles.
> 2.  Utiliza `localStorage` mediante `storageHelpers.js` para persistencia temporal y fallback.
> 3.  **Hito de Mejora**: Se planea una migración completa a persistencia en base de datos para todas las secciones.

---

## Restricciones del Agente

- **NO** modificar `localStorage` directamente para Auth o Cart; usar los métodos de los Contextos.
- **NO** crear estilos inline; usar archivos `.css` existentes o crear nuevos en el mismo directorio del componente.
- **NO** saltarse la validación de `useFormReducer` en formularios nuevos.
- **NO** usar `fetch` nativo; preferir siempre la instancia `http` de `services/http.js`.
- **NO** implementar lógica de formateo de moneda manualmente; usar `formatMoney` de `utils` o `Checkout.jsx`.
