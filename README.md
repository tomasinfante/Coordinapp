# CoordinAPP

Aplicación web estática para coordinar tiempos entre amigos, familia o equipos de trabajo.

## Características

- Funciona sin Node, sin instalación y sin base de datos externa.
- Persistencia local con `localStorage`.
- Gestión de grupos independientes.
- Integrantes ficticios para probar la app.
- Ocupaciones por integrante, día y rango horario.
- Cálculo automático de ventanas libres donde ningún integrante está ocupado.
- Filtros: Modo Trabajo, Modo Ocio y Todo.
- Diseño responsivo, moderno, sobrio y con modo claro/oscuro.

## Archivos

```text
index.html
style.css
app.js
README.md
assets/logo.svg
```

## Cómo usar en GitHub Pages

1. Crea un repositorio en GitHub.
2. Sube todos los archivos y la carpeta `assets` a la raíz del repositorio.
3. Ve a `Settings > Pages`.
4. En `Source`, elige `Deploy from a branch`.
5. Elige branch `main` y carpeta `/root`.
6. Guarda.
7. GitHub entregará una URL como:

```text
https://tuusuario.github.io/tu-repositorio/
```

## Cómo probar localmente

Abre `index.html` con doble clic en tu navegador.

## Nota importante

Los datos se guardan en el navegador de cada computador. Si otra persona abre la app desde otro dispositivo, verá la app funcional, pero no compartirá automáticamente los mismos datos porque no se usa base de datos externa.
