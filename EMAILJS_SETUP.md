# Configuración de EmailJS para Formulario de Contacto MIA

Este documento explica cómo configurar el servicio EmailJS para el formulario de contacto del sitio web de MIA.

## Pasos para configurar EmailJS

1. **Crear una cuenta en EmailJS**
   - Visita [EmailJS](https://www.emailjs.com/) y crea una cuenta gratuita
   - El plan gratuito permite enviar hasta 200 correos por mes

2. **Crear un servicio de correo**
   - En el panel de EmailJS, ve a "Email Services"
   - Haz clic en "Add New Service"
   - Selecciona tu proveedor de correo (Gmail, Outlook, etc.)
   - Introduce tus credenciales de correo
   - Nombra el servicio (por ejemplo, "mia_service")
   - Guarda el Service ID para usarlo en el código

3. **Crear una plantilla de correo**
   - Ve a "Email Templates"
   - Haz clic en "Create New Template"
   - Diseña tu plantilla de correo con variables
   - Ejemplo de plantilla:
     ```html
     <h2>Nuevo mensaje de contacto</h2>
     <p><strong>Nombre:</strong> {{name}}</p>
     <p><strong>Email:</strong> {{email}}</p>
     <p><strong>Mensaje:</strong></p>
     <p>{{message}}</p>
     ```
   - Asigna destinatarios (a quién se enviará el correo)
   - Guarda el Template ID para usarlo en el código

4. **Actualizar el código del sitio web**
   - Abre el archivo `index.html` y busca la sección de EmailJS
   - Reemplaza `YOUR_USER_ID` con tu User ID de EmailJS
   - Abre el archivo `js/main.js` y busca la función `processFormSubmission`
   - Actualiza las siguientes variables con tus valores:
     - `serviceID`: ID de tu servicio de correo
     - `templateID`: ID de tu plantilla de correo
     - `userID`: Tu User ID de EmailJS (mismo que pusiste en index.html)

## Verificación

Para verificar que el formulario funciona correctamente:

1. Abre tu sitio web
2. Completa el formulario de contacto
3. Envía el formulario
4. Verifica que el correo haya llegado al destinatario configurado

## Solución de problemas

Si el formulario no funciona como se espera:

1. Abre la consola del navegador para ver posibles errores
2. Verifica que los IDs configurados sean correctos
3. Comprueba el panel de EmailJS para ver si hay errores de envío

## Recursos adicionales

- [Documentación de EmailJS](https://www.emailjs.com/docs/)
- [Guía de integración con EmailJS](https://www.emailjs.com/docs/tutorial/creating-contact-form/) 