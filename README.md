# LexiLaw AI

Crea una aplicación web moderna llamada "LexPDF" orientada a estudiantes y profesionales del derecho.



Enfoque inicial: Derecho Mexicano (pero con arquitectura flexible para expandir después a otras jurisdicciones).



Funcionalidades principales:

1. Subir archivo PDF

2. Botón "Analizar documento"

3. Al analizar, la IA genera:

   - Resumen ejecutivo estructurado

   - Esquema detallado por temas, capítulos y artículos

   - Lista de conceptos jurídicos clave con breve explicación

   - Artículos y fracciones más relevantes detectados

4. Sección de Chat: el usuario puede hacer preguntas sobre el documento subido y la IA responde citando partes del texto cuando sea posible

5. Botones para copiar y descargar el análisis en texto



Diseño:

- Interfaz limpia, profesional y moderna

- Colores principales: azul oscuro, azul medio y blanco

- Totalmente responsive (se vea bien en móvil, tablet y computadora)

- En español

- Usar Tailwind CSS



Importante:

- Deja preparado el código de forma modular para que en el futuro se pueda agregar un selector de jurisdicción (México, España, etc.)

- Por ahora, simula las respuestas de la IA con datos de ejemplo realistas de derecho mexicano

- Estructura clara y código limpio



Hazla lista para desplegar.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://clever-legal-read.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/14a24601-cb3c-4a06-9b8c-5517223f232e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
