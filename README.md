# 🔍 Pokédex App

Una aplicación web interactiva que funciona como una enciclopedia virtual de Pokémon, permitiendo a los usuarios explorar y conocer detalles sobre sus criaturas favoritas de forma dinámica.

## 🚀 Características

* **Listado Dinámico:** Visualización de Pokémon cargados en tiempo real desde la [PokéAPI](https://pokeapi.co/).
* **Búsqueda Inteligente:** Filtro funcional para encontrar Pokémon específicos por nombre o número de ID.
* **Tarjetas de Detalles:** Cada Pokémon presenta sus tipos (Fuego, Agua, Planta, etc.) con estilos visuales diferenciados.
* **Diseño Responsivo:** Interfaz adaptada para una navegación fluida en móviles, tablets y ordenadores.

## 🛠️ Tecnologías utilizadas

* **HTML5:** Estructura semántica.
* **CSS3:** Diseño personalizado, Flexbox/Grid y variables para los colores de tipos.
* **JavaScript (ES6+):** * Uso de `fetch` para peticiones asíncronas.
    * Manipulación dinámica del DOM para renderizar las tarjetas.
    * Promesas (`Promise.all`) para optimizar la carga de múltiples Pokémon.
* **PokéAPI:** Fuente de datos externa.

## ⚙️ Funcionamiento Técnico (`main.js`)

El núcleo de la aplicación realiza las siguientes acciones:
1. Petición a la API para obtener los datos básicos.
2. Mapeo de la información (nombre, ID, tipos, peso, altura e imagen).
3. Inyección dinámica de plantillas HTML en el contenedor principal.
4. Escucha de eventos en la barra de búsqueda para filtrar los resultados mostrados.

## 📦 Instalación y Uso Local

1.  **Clona el repositorio:**
    ```bash
    git clone [https://github.com/LauraMartinezS98/pokedex.git](https://github.com/LauraMartinezS98/pokedex.git)
    ```
2.  **Accede a la carpeta:**
    ```bash
    cd pokedex
    ```
3.  **Ejecución:** Abre el archivo `index.html` en tu navegador.

## 🌐 Despliegue (GitHub Pages)

Este proyecto está configurado para ser desplegado fácilmente:
1. Sube tus cambios a GitHub.
2. Ve a **Settings** > **Pages**.
3. En la sección "Build and deployment", selecciona la rama `main` y pulsa **Save**.
4. ¡Tu Pokédex estará disponible en `https://lauramartinezs98.github.io/pokedex/`!

## 🔮 Próximas Mejoras

- [ ] Añadir filtro por regiones/generaciones.
- [ ] Implementar un sistema de "Favoritos" usando `localStorage`.
- [ ] Reproducir el grito del Pokémon al hacer clic en su tarjeta.
- [ ] Comparador de estadísticas entre dos Pokémon.

---

Desarrollado con ❤️ por [Laura Martínez](https://github.com/LauraMartinezS98)
