# Analisis UI/UX - Portales Inmobiliarios Argentina y Mundo

> Investigacion: Abril 2026
> Objetivo: Disenar un sitio web inmobiliario PREMIUM para cada inmobiliaria individual (no marketplace)

---

## 1. ZONAPROP (zonaprop.com.ar)

### Hero / Landing
- **Altura**: ~80vh (aprox 600-700px desktop)
- **Fondo**: Imagen de alta calidad de propiedad/ciudad con overlay oscuro
- **Overlay**: rgba(0,0,0,0.4) gradiente sutil de abajo hacia arriba
- **Headline**: ~36-40px, font-weight 700, color blanco, texto tipo "Encontra tu proximo hogar"
- **CTA principal**: Integrado en el buscador (boton de busqueda)
- **Trust**: Cantidad de propiedades publicadas, logo de marca reconocida

### Buscador Principal
- **Posicion**: Centrado verticalmente en el hero, ligeramente debajo del centro
- **Tabs**: Comprar | Alquilar | Alquiler Temporario | Emprendimientos (pills redondeadas)
- **Campos visibles**: Ubicacion (autocomplete con barrios/ciudades), Tipo propiedad, Ambientes, Precio
- **Input ubicacion**: Autocomplete con iconos de pin, agrupa por Barrios/Ciudades/Zonas
- **Boton busqueda**: Color primario brand (violeta/purpura ZonaProp), ~50px alto, icono lupa + "Buscar"
- **Mobile**: Buscador se apila vertical, campos full-width, tabs horizontales scrolleables

### Property Cards (pagina de resultados)
- **Layout**: Grid 3 columnas desktop, 2 tablet, 1 mobile. Gap ~16-20px
- **Aspect ratio imagen**: 4:3 (landscape)
- **Carousel fotos**: Flechas izq/der en hover, contador "1/12" en esquina inferior
- **Info mostrada** (orden): Precio > Expensas > Titulo/Direccion > Superficie total/cubierta > Ambientes > Banos > Cochera > Descripcion corta
- **Badges**: "Apto credito", "Nuevo", "Destacado" (fondo color, texto blanco, border-radius 4px)
- **Precio**: ~22-24px, font-weight 700, color dark. Moneda "USD" o "$" prefix
- **Features**: Iconos lineales (dormitorio, bano, superficie, cochera) + valor. Layout horizontal
- **Hover**: Sombra aumenta, ligero scale(1.01), cursor pointer
- **CTA**: Click completo en card, no boton separado. Favorito (corazon) en esquina superior derecha

### Filtros (pagina resultados)
- **Posicion**: Top bar horizontal + sidebar izquierda expandible
- **Principales**: Operacion (tabs), Ubicacion, Tipo, Precio, Ambientes, Superficie
- **Avanzados**: Modal/dropdown desplegable "Mas filtros" (antiguedad, disposicion, orientacion, amenities)
- **Chips activos**: Fondo gris claro con X para cerrar, border-radius 16px
- **Contador**: "X propiedades encontradas" debajo del buscador

### Colores y Tipografia
- **Primario**: Violeta/Purpura (#7B2D8E aproximado) - marca distintiva
- **Secundario**: Blanco, grises neutros
- **Acento**: Verde para badges positivos, rojo para alertas
- **Tipografia**: Sans-serif (similar a Roboto/Nunito), body 14-15px
- **Border-radius**: 8px cards, 4px inputs, 20px pills/chips
- **Shadows**: 0 2px 8px rgba(0,0,0,0.1) cards en reposo, aumenta en hover

---

## 2. ARGENPROP (argenprop.com)

### Hero / Landing
- **Altura**: 482px desktop, 570px mobile
- **Fondo**: Imagen full-width con object-fit: cover
- **Overlay**: Dark overlay rgba(0,0,0,0.5) via pseudo-element ::before
- **Headline**: 40px, font-weight 600, blanco con text-shadow (1px 1px 2px #000)
- **CTA**: Boton de busqueda integrado en search bar
- **Trust**: Rating stars, badges de featured

### Buscador Principal
- **Posicion**: Centrado en hero, 55px altura
- **Tabs**: Comprar | Alquilar (botones 188px width cada uno)
- **Campos**: Ubicacion (autocomplete dropdown, max-height 300px), Tipo propiedad, Ambientes, Precio
- **Boton busqueda**: Teal (#006d5c), 55px width, alineado a derecha, icono lupa
- **Mobile**: Campos apilados, boton full-width

### Property Cards
- **Layout**: Grid 4 columnas desktop, 2 tablet, scroll horizontal mobile
- **Aspect ratio imagen**: 4:3 (padding-top trick para mantener ratio)
- **Info**: Precio (20px bold) > Direccion > 3 iconos features (dormitorios/banos/superficie)
- **Badges**: Featured badges con rating stars
- **Hover**: Elevation sutil

### Filtros
- **Principales**: En top bar desplegable
- **Avanzados**: Panel expandible
- **Chips**: Tags con X para remover

### Colores y Tipografia
- **Primario**: Teal (#006d5c), hover (#005548)
- **Secundario**: Verde claro (#cff08e) para botones secundarios
- **Peligro/Acento**: Rojo (#da2a36)
- **Neutros**: Dark gray (#3b4043), light gray (#efefef)
- **Tipografia**: "Open Sans" (400, 600, 700)
- **Headings**: H1 36px, H2 30px, H3 24px, Body 15px
- **Nav**: 52px altura con shadow, logo 210px
- **Footer**: Background #efefef, multi-columna responsive
- **Border-radius**: 4-8px cards, inputs rectangulares

---

## 3. MERCADO LIBRE INMUEBLES (inmuebles.mercadolibre.com.ar)

### Hero / Landing
- **Altura**: Minima - ML prioriza busqueda directa, no hero aspiracional
- **Fondo**: Fondo blanco limpio, sin imagen hero
- **Headline**: Branding ML con titulo de categoria "Inmuebles"

### Buscador Principal
- **Posicion**: Top bar sticky, consistente con toda la plataforma ML
- **Campos**: Input texto libre (autocomplete con sugerencias de tipo + ubicacion)
- **Boton**: Azul ML (#3483FA), icono lupa
- **Estilo**: Muy funcional, sin decoracion, fondo amarillo (#FFF159) del header ML

### Property Cards
- **Layout**: Lista vertical (1 columna) con imagen a la izquierda, info a la derecha. Tambien grid 4 cols
- **Aspect ratio**: 4:3 horizontal
- **Carousel**: Hover muestra flechas, counter de fotos
- **Info**: Precio (grande, bold) > Tipo operacion > Superficie > Ambientes > Ubicacion > Inmobiliaria
- **Badges**: "Apto credito hipotecario" (verde), tipo publicacion (clasica/premium)
- **Precio**: ~24px, font-weight 700. Formato "USD 120.000" o "$ 150.000/mes"
- **Features**: Iconos minimalistas, layout horizontal compacto

### Filtros
- **Posicion**: Sidebar izquierda (desktop), modal bottom-sheet (mobile)
- **Tipos**: Checkboxes para tipo propiedad, sliders para precio, radio buttons para ambientes
- **Chips activos**: Pills celestes con X
- **Contador**: "X resultados" prominente

### Colores y Tipografia
- **Primario**: Azul ML (#3483FA)
- **Secundario**: Amarillo (#FFF159) header
- **Neutros**: Blanco fondo, #333 texto, #EEEEEE separadores
- **Tipografia**: Proxima Nova (propietary ML), body 14px
- **Border-radius**: 6px cards, 4px inputs
- **Shadows**: Minimas, bordes sutiles 1px solid #eee

---

## 4. PROPERATI (properati.com.ar)

### Hero / Landing
- **Altura**: ~60-70vh
- **Fondo**: Imagen urbana/propiedad con overlay gradiente
- **Headline**: Sans-serif grande (~32-36px), blanco, peso 600-700
- **CTA**: Buscador integrado, estilo minimalista

### Buscador Principal
- **Posicion**: Centrado en hero
- **Tabs**: Comprar | Alquilar (toggle pills)
- **Campos**: Ubicacion con autocomplete, tipo propiedad
- **Boton**: Azul/verde acento, redondeado
- **Diferenciador**: UI mas moderna, mas aire, menos campos visibles inicialmente

### Property Cards
- **Layout**: Grid 3 columnas, cards limpias
- **Imagen**: 16:9 o 4:3, foto unica (sin carousel visible en grid)
- **Info**: Precio > Ubicacion > Superficie > Ambientes
- **Precio**: Bold, grande, USD predominante
- **Estilo**: Muy limpio, whitespace generoso

### Colores y Tipografia
- **Primario**: Azul oscuro
- **Secundario**: Blanco, grises suaves
- **Tipografia**: Sans-serif moderna (tipo Inter/Poppins)
- **Border-radius**: 8-12px (mas redondeado que competidores)
- **Shadows**: Sutiles, estilo material design lite

---

## 5. RE/MAX (remax.com.ar) - Basado en redesign RE/MAX Portugal (mismo sistema global)

### Hero / Landing
- **Altura**: ~70-80vh
- **Fondo**: Imagen de propiedad premium o video
- **Headline**: Grande, sans-serif, sobre marca RE/MAX
- **Trust**: 9.000+ agentes, marca global, "Product of the Year"

### Buscador Principal
- **Posicion**: Centrado y prominente en homepage
- **Tabs**: Toggle Alquilar | Comprar
- **Autocomplete**: Sugiere regiones, agentes y emprendimientos (3 tipos)
- **Toggle mapa**: Opcion de buscar por mapa interactivo en vez de texto
- **Boton**: Azul RE/MAX (version pasteurizada del brand blue, no el azul intenso original)

### Property Cards
- **Disenadas mobile-first**: Info esencial: precio, region, tipologia, superficie, ambientes, banos
- **Favorito**: Boton discreto esquina superior derecha
- **Tags**: Area reservada para badges
- **Estilo**: Minimalista, sin ruido visual

### Property Detail
- **Galeria**: Soporta imagenes, video, y vistas 360 grados
- **Contacto**: Widget de contacto como focal point, links a redes sociales del agente
- **Agente**: Pagina dedicada con foto, bio, story, contacto

### Colores y Tipografia (Redesign)
- **Estrategia**: NO usan el rojo/azul intenso del logo en toda la UI
- **Primario UI**: Azul pastel suave (reduce carga cognitiva)
- **Azul original**: Solo en CTAs, elementos clickeables, tags, dropdowns, toggles
- **Rojo**: Solo acento puntual, no protagonista
- **Fundamento**: Accesibilidad, foco, reduccion de fatiga visual

### Resultados del Redesign
- +14% visitas
- +44% duracion de sesion promedio

---

## 6. REALTOR.COM (referencia internacional USA)

### Hero / Landing
- **Altura**: ~60-70vh
- **Fondo**: Imagen full-width de propiedad/barrio en tonos calidos
- **Headline**: Sans-serif grande, blanco, "Find Homes for Sale"
- **CTA**: Buscador integrado prominente

### Buscador Principal
- **Posicion**: Centrado en hero, prominente
- **Tabs**: Buy | Rent | Sell | Mortgage | Home Estimate
- **Campos**: Input de ubicacion (city, ZIP, address, neighborhood, school)
- **Autocomplete**: Dropdown con categorias agrupadas
- **Boton**: Rojo (#D92228 brand Realtor), icono lupa

### Property Cards
- **Layout**: Grid 3-4 columnas, gap generoso
- **Imagen**: 16:10 aspect ratio, carousel con flechas
- **Info**: Precio (grande bold) > Beds/Baths/Sqft > Direccion > Status badge
- **Badges**: "New", "Open House", "Price Reduced" (colores diferenciados)
- **Features**: Iconos + numeros inline (3 bd | 2 ba | 1,500 sqft)

### Property Detail
- **Galeria**: Grid asimetrico (1 grande + 4 chicas), click abre lightbox
- **Info**: Precio, Zestimate equivalent, beds/baths/sqft prominente
- **Mapa**: Embedido con walking score, transit score, bike score
- **Formulario contacto**: Sidebar sticky derecha con foto del agente
- **Similar**: Grid de propiedades similares al final

### Colores y Tipografia
- **Primario**: Rojo (#D92228)
- **Secundario**: Blanco, gris muy claro
- **Neutros**: #333 texto, #666 secundario
- **Tipografia**: Sans-serif (system fonts stack)
- **Border-radius**: 8px cards
- **Shadows**: 0 2px 4px rgba(0,0,0,0.1)

---

## 7. ZILLOW (zillow.com) - Referencia premium mundial

### Hero / Landing
- **Altura**: ~50-60vh, mas contenido y menos hero
- **Fondo**: Imagen de propiedad en tonos suaves/muted, alta calidad
- **Headline**: "Find Your Way Home" - tipografia grande, limpia
- **CTA**: Buscador centrado
- **Trust**: Zestimate, brand recognition, "the most-visited real estate website"

### Buscador Principal
- **Posicion**: Centro del hero, barra horizontal prominente
- **Tabs**: Buy | Rent | Sell | Home Loans | Agent Finder
- **Campos**: Un solo campo de ubicacion principal (address, neighborhood, city, ZIP)
- **Autocomplete**: Muy inteligente, sugiere resultados mixtos
- **Boton**: Azul Zillow Denim (#1277E1), border-radius alto, icono lupa
- **Mobile**: Buscador simplificado, prominent en top

### Property Cards (Search Results - Half Map Layout)
- **Layout**: Split view: Lista izquierda + Mapa interactivo derecha
- **Grid lista**: 2 columnas en panel izquierdo
- **Imagen**: 16:10, carousel horizontal swipeable
- **Info**: Precio ($XXX,XXX bold grande ~20px) > Beds/Baths/Sqft inline > Direccion > Status
- **Badges**: "New" (azul), "Price Cut" (rojo), "3D Tour" (iconico)
- **Features**: "3 bd | 2 ba | 1,200 sqft" - layout inline con separadores
- **Hover**: Card se eleva, borde azul sutil, pin en mapa se resalta
- **Favorito**: Corazon outline, esquina superior derecha foto
- **Mapa**: Circulos azules con precios, clusters, zoom interactivo

### Property Detail (Redesign 2023)
- **Layout**: Single-scroll mas ancho, sin multi-columna
- **Galeria**: Media section arriba - grid asimetrico (1 hero + thumbnails)
- **Expansion**: Click en foto abre "full-page magazine-style layout"
- **Formatos**: Fotos, 3D tours, video
- **Precio**: Grande, prominente, con Zestimate debajo
- **Info clave**: Fonts mas grandes para datos importantes (sqft, lot size, home type)
- **Mobile (iOS)**: Secciones colapsables: "What's Special", "Market Value", "Monthly Cost", "Neighborhood"
- **Financiamiento**: Tab "Home Loans" integrado

### Colores y Tipografia
- **Primario**: Zillow Denim (#1277E1)
- **Background**: Blanco puro, off-white secciones alternas
- **Texto**: Charcoal oscuro
- **Tipografia**: Open Sans (400, 600, 700 weights)
- **Border-radius**: 8-12px cards y elementos
- **Shadows**: Sutiles, aumentan en hover
- **Whitespace**: Muy generoso, diseño "breathable"

---

## ANALISIS COMPARATIVO

### Tabla Resumen de Patrones

| Elemento | ZonaProp | Argenprop | ML Inmuebles | Properati | RE/MAX | Realtor | Zillow |
|---|---|---|---|---|---|---|---|
| **Hero Height** | ~80vh | 482px | Minimo | ~65vh | ~75vh | ~65vh | ~55vh |
| **Hero Fondo** | Imagen+overlay | Imagen+overlay | Sin hero | Imagen+overlay | Imagen/video | Imagen calida | Imagen suave |
| **Buscador Pos** | Centro hero | Centro hero | Top bar sticky | Centro hero | Centro hero | Centro hero | Centro hero |
| **Tabs Operacion** | 4 tabs | 2 tabs | N/A | 2 toggle | 2 toggle | 5 tabs | 5 tabs |
| **Cards Grid** | 3 cols | 4 cols | 1 col lista | 3 cols | 3 cols | 3-4 cols | 2 cols+mapa |
| **Card Image** | 4:3 | 4:3 | 4:3 | 16:9/4:3 | Mobile-first | 16:10 | 16:10 |
| **Carousel** | Flechas+counter | Basico | Hover flechas | No visible | Basico | Flechas | Swipeable |
| **Color Primario** | Violeta | Teal | Azul ML | Azul oscuro | Azul pastel | Rojo | Azul denim |
| **Font** | Sans-serif | Open Sans | Proxima Nova | Inter/Poppins | Sans-serif | System | Open Sans |
| **Border Radius** | 8px | 4-8px | 6px | 8-12px | 8px | 8px | 8-12px |
| **Half-Map** | No default | No | No | No | Si (toggle) | Si | Si (default) |
| **Mobile First** | No | No | Si | Parcial | Si | Si | Si |

### Patrones Ganadores Identificados

1. **Zillow: Half-map layout** - Split view lista+mapa es el gold standard para busqueda de propiedades
2. **RE/MAX: Color strategy** - No saturar con colores de marca, usar version pastel para UI y reservar brand color solo para CTAs
3. **Zillow: Property detail single-scroll** - Formato magazine, secciones colapsables en mobile
4. **Argenprop: Hero search UX** - Buscador limpio con autocomplete bien organizado
5. **ML Inmuebles: Filtros sidebar** - Estructura de filtros probada con millones de usuarios
6. **Zillow: Carousel swipeable** - UX nativa, sin botones, gesture-based
7. **RE/MAX: Pagina de agente dedicada** - Con story, contacto multicanal, redes sociales

---

## PROPUESTA: DISENO ENTERPRISE-GRADE PARA INMOBILIARIA INDIVIDUAL

### Filosofia de Diseno
> "Premium individual, no marketplace. Cada inmobiliaria es una marca, no un anuncio mas."

A diferencia de ZonaProp/Argenprop (que son marketplaces donde las inmobiliarias son una mas), este sistema crea un sitio WEB PROPIO para cada inmobiliaria que se ve MAS PROFESIONAL que los portales.

---

### 1. HERO / LANDING

```
Altura: 85vh desktop, 70vh mobile
Fondo: Video loop sutil (propiedad premium de la inmobiliaria) con fallback imagen
Overlay: Gradiente sofisticado:
  - linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)
  - Opcionalmente: blur leve en el fondo (backdrop-filter: blur(2px))

Headline:
  - Font: Inter 700, 48px desktop / 32px mobile
  - Color: #FFFFFF
  - Letter-spacing: -0.02em (tightened para premium)
  - Texto personalizable por inmobiliaria: "Tu proximo hogar te espera"
  - Subtitulo: Inter 400, 18px, #FFFFFF/80, max-width 600px

Trust Elements (debajo del buscador):
  - Row horizontal de stats: "150+ Propiedades | 12 Anos de experiencia | 98% satisfaccion"
  - Iconos sutiles, tipografia 14px, #FFFFFF/60
  - Logos de certificaciones (matricula, camara inmobiliaria)
```

### 2. BUSCADOR PRINCIPAL

```
Posicion: Centro del hero, ligeramente debajo del centro vertical
Estilo: Glassmorphism premium
  - Background: rgba(255,255,255,0.95)
  - Backdrop-filter: blur(20px)
  - Border: 1px solid rgba(255,255,255,0.3)
  - Border-radius: 16px
  - Box-shadow: 0 8px 32px rgba(0,0,0,0.15)
  - Padding: 8px

Tabs (sobre el buscador):
  - Pills: "Comprar" | "Alquilar" | "Temporario" | "Emprendimientos"
  - Activo: Fondo brand-color, texto blanco, border-radius 24px
  - Inactivo: Transparente, texto blanco/80
  - Transicion: 200ms ease

Campos (horizontal desktop, stacked mobile):
  - Ubicacion: Icono pin + "Barrio, ciudad o zona..." placeholder
    - Autocomplete dropdown con shadow, max-height 350px
    - Agrupa: Barrios | Ciudades | Zonas
    - Highlight match en bold
  - Tipo: Dropdown "Departamento, Casa, PH..." con checkbox multiple
  - Ambientes: Selector numerico 1-5+ con pills
  - Precio: Rango min-max con prefijo moneda (USD/$)

Boton Buscar:
  - Width: 56px height, min-width 140px
  - Background: Brand color primario
  - Color: Blanco
  - Border-radius: 12px
  - Icono: Lupa + "Buscar"
  - Hover: Darken 10%, scale(1.02)
  - Transicion: all 200ms ease

Mobile:
  - Buscador se convierte en boton "Buscar propiedades" que abre modal full-screen
  - Modal con campos apilados, teclado optimizado
  - Tab bar sticky en top del modal
```

### 3. PROPERTY CARDS

```
Layout:
  - Desktop: Grid 3 columnas, gap 24px, max-width 1280px
  - Tablet: Grid 2 columnas, gap 20px
  - Mobile: 1 columna, gap 16px
  - Opcion lista vs grid (toggle en toolbar)

Card Structure:
  - Border-radius: 12px
  - Overflow: hidden
  - Background: #FFFFFF
  - Border: 1px solid #E5E7EB
  - Shadow reposo: 0 1px 3px rgba(0,0,0,0.08)
  - Shadow hover: 0 8px 24px rgba(0,0,0,0.12)
  - Transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1)
  - Hover: translateY(-4px)

Imagen:
  - Aspect ratio: 16:10 (mas cinematografico que 4:3)
  - Object-fit: cover
  - Carousel: Swipeable + flechas en hover (40px, semi-transparentes)
  - Indicador: "1/12" badge en esquina inferior derecha, fondo rgba(0,0,0,0.6)
  - Lazy loading: Placeholder blur (blurhash)

Badges (sobre imagen, esquina superior izquierda):
  - Stack vertical, gap 6px
  - "VENTA" / "ALQUILER": Brand color, 11px uppercase, font-weight 700, letter-spacing 0.05em
  - "APTO CREDITO": Verde #059669, mismo estilo
  - "NUEVO": Amber #D97706
  - "EXCLUSIVO": Gradiente premium (brand dark -> brand light)
  - Border-radius: 6px, padding 4px 10px

Favorito:
  - Corazon outline blanco, esquina superior derecha imagen
  - Hover: Escala, relleno rojo
  - Con animacion de "pop" al activar

Contenido (padding 16px 20px):
  Precio:
    - Font: Inter 700, 24px, color #111827
    - Moneda: "USD" 14px, font-weight 500, color #6B7280, margin-right 4px
    - Formato: "USD 185.000" o "$ 350.000/mes"
    - Expensas: 13px, #9CA3AF, debajo: "+ $ 25.000 expensas"

  Ubicacion:
    - Font: Inter 400, 14px, color #6B7280
    - Icono pin 14px inline
    - "Palermo, Buenos Aires"
    - Truncate con ellipsis si es largo

  Features (row horizontal):
    - Iconos custom SVG, 18px, color #6B7280
    - Gap 16px entre features
    - Layout: [icon] [valor] [unidad]
    - Dormitorios: bed icon + "3"
    - Banos: bath icon + "2"
    - Superficie: maximize icon + "85 m2"
    - Cochera: car icon + "1" (si aplica)
    - Font: Inter 500, 14px, color #374151

  Titulo/Descripcion:
    - Font: Inter 600, 16px, color #111827
    - Line-clamp: 2 lineas
    - Margin-top: 8px
```

### 4. PAGINA DE RESULTADOS (SEARCH)

```
Layout Split-View (inspirado Zillow):

Desktop:
  [Toolbar filtros]           [Full width, 56px height, sticky top]
  [Lista 55%] | [Mapa 45%]   [Split horizontal, height: calc(100vh - 56px)]

  Lista: Scroll independiente, cards 2 columnas
  Mapa: Sticky, interactivo, markers con precio
  Toggle: Boton para ocultar mapa y ver grid 3 cols

Tablet:
  Mapa como drawer inferior (30vh) o toggle full-screen
  Lista 2 columnas arriba

Mobile:
  Toggle Lista/Mapa con tab bar
  Lista 1 columna
  Mapa full-screen con cards overlay en bottom sheet

Toolbar Filtros:
  - Background: #FFFFFF
  - Border-bottom: 1px solid #E5E7EB
  - Padding: 12px 24px
  - Chips scrolleables: Ubicacion, Tipo, Precio, Ambientes, Superficie, "Mas filtros"
  - Cada chip: Border 1px solid #D1D5DB, border-radius 20px, padding 6px 16px
  - Chip activo: Background brand-color/10, border brand-color, color brand-color
  - "Mas filtros": Abre panel lateral derecho (drawer) en desktop, modal en mobile
  - Ordenar: Dropdown derecha "Mas relevantes" | "Menor precio" | "Mayor precio" | "Mas recientes"
  - Contador: "147 propiedades" - Inter 600, 16px, color #111827

Mapa Interactivo:
  - Markers: Circulos con precio (fondo blanco, border brand-color, font 12px bold)
  - Hover marker: Popup con mini-card (foto + precio + ubicacion)
  - Clusters: Numero de propiedades en circulo mas grande
  - Provider: Mapbox o Google Maps
```

### 5. PROPERTY DETAIL

```
Galeria (parte superior):
  Desktop:
    - Layout grid asimetrico: 1 imagen hero (60% width) + grid 2x2 (40% width)
    - Height: 500px
    - Border-radius: 12px (contenedor exterior)
    - Boton "Ver X fotos" en esquina inferior derecha, transparente con blur
    - Click abre lightbox full-screen

  Lightbox:
    - Fondo negro, fotos centradas, flechas grandes
    - Thumbnails en bottom strip
    - Counter "3/24"
    - Soporte: Fotos, Video tour, 360 virtual tour (tabs en lightbox)
    - Swipe en mobile
    - Teclas ← → en desktop

  Mobile:
    - Carousel full-width, dots indicadores
    - Swipeable nativo
    - Counter overlay

Layout Contenido (debajo galeria):
  Max-width: 1280px, padding: 0 24px

  Columna Principal (65%):
    Header:
      - Precio: Inter 800, 36px, #111827
      - Moneda + expensas debajo
      - Badges inline: Operacion + Apto credito + Exclusivo
      - Direccion: 18px, #6B7280, con link a mapa

    Features Bar:
      - Background: #F9FAFB
      - Border-radius: 12px
      - Padding: 20px 24px
      - Grid: 4 columnas iguales
      - Cada feature: Icono 24px + Valor grande (20px bold) + Label (13px, gris)
      - Superficie total, Superficie cubierta, Ambientes, Banos, Dormitorios, Cocheras, Antiguedad

    Descripcion:
      - Font: Inter 400, 16px, line-height 1.7
      - Color: #374151
      - Expandible con "Ver mas" si > 4 lineas

    Ficha Tecnica:
      - Grid 2 columnas, rows alternando fondo gris/blanco
      - Label (14px, #6B7280) | Valor (14px, #111827, font-weight 500)
      - Datos: Tipo, Ambientes, Dormitorios, Banos, Cocheras, Superficie, Antiguedad, Disposicion, Orientacion, Estado, Luminosidad

    Amenities:
      - Grid 3-4 columnas
      - Icono + texto, checkmark verde si tiene
      - Pileta, SUM, Gimnasio, Laundry, Seguridad 24hs, Balcon, Terraza, etc.

    Mapa:
      - Height: 400px, border-radius 12px
      - Marker de ubicacion
      - Info contextual: Colegios, Transporte, Supermercados (radio configurable)

  Sidebar Derecha (35%) - Sticky:
    Card Contacto:
      - Background: #FFFFFF
      - Border: 1px solid #E5E7EB
      - Border-radius: 16px
      - Shadow: 0 4px 16px rgba(0,0,0,0.08)
      - Padding: 24px
      - Position: sticky, top: 80px

      Contenido:
        - Logo inmobiliaria + nombre
        - Foto agente (si tiene) + nombre + tel
        - Formulario: Nombre, Email, Telefono, Mensaje (pre-filled)
        - Boton principal: "Contactar" full-width, brand-color, 48px height
        - Boton secundario: "WhatsApp" verde, icono WA
        - Texto: "Responde en menos de 2hs" (trust)

    Card Compartir:
      - Iconos: WhatsApp, Email, Copiar link
      - Boton "Guardar" con corazon

Propiedades Similares (full width, debajo):
  - Titulo: "Propiedades similares"
  - Carousel horizontal de cards (mismo diseno que grid)
  - 4 visibles desktop, swipeable
  - Flechas de navegacion
```

### 6. SISTEMA DE COLORES (Personalizable por inmobiliaria)

```
Base System (CSS Variables):

--color-brand-50:  #EFF6FF;   /* Fondos sutiles */
--color-brand-100: #DBEAFE;   /* Hover fondos */
--color-brand-200: #BFDBFE;   /* Bordes activos */
--color-brand-500: #3B82F6;   /* Brand principal (personalizable) */
--color-brand-600: #2563EB;   /* CTAs principales */
--color-brand-700: #1D4ED8;   /* Hover CTAs */
--color-brand-900: #1E3A5F;   /* Textos brand */

--color-gray-50:  #F9FAFB;
--color-gray-100: #F3F4F6;
--color-gray-200: #E5E7EB;
--color-gray-300: #D1D5DB;
--color-gray-400: #9CA3AF;
--color-gray-500: #6B7280;
--color-gray-600: #4B5563;
--color-gray-700: #374151;
--color-gray-800: #1F2937;
--color-gray-900: #111827;

--color-success: #059669;     /* Apto credito, disponible */
--color-warning: #D97706;     /* Nuevo, atencion */
--color-error:   #DC2626;     /* Vendido, error */
--color-info:    #2563EB;     /* Informativo */

Neutrales de fondo:
--bg-primary:   #FFFFFF;
--bg-secondary: #F9FAFB;
--bg-tertiary:  #F3F4F6;

Shadows (elevation system):
--shadow-xs:  0 1px 2px rgba(0,0,0,0.05);
--shadow-sm:  0 1px 3px rgba(0,0,0,0.08);
--shadow-md:  0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06);
--shadow-lg:  0 8px 24px rgba(0,0,0,0.12);
--shadow-xl:  0 20px 48px rgba(0,0,0,0.15);

Border Radius:
--radius-sm:  6px;    /* Inputs, badges */
--radius-md:  8px;    /* Buttons */
--radius-lg:  12px;   /* Cards */
--radius-xl:  16px;   /* Modals, buscador */
--radius-full: 9999px; /* Pills, chips, avatares */
```

### 7. TIPOGRAFIA

```
Font Stack:
  Primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
  Display (opcional premium): 'DM Serif Display', Georgia, serif (solo H1 hero)

Scale:
  --text-xs:   12px / 16px (line-height)
  --text-sm:   14px / 20px
  --text-base: 16px / 24px
  --text-lg:   18px / 28px
  --text-xl:   20px / 28px
  --text-2xl:  24px / 32px
  --text-3xl:  30px / 36px
  --text-4xl:  36px / 40px
  --text-5xl:  48px / 1.1

Pesos usados:
  400 - Body text
  500 - Labels, features, UI elements
  600 - Subtitulos, card titles
  700 - Headlines, precios
  800 - Hero headline (Extra Bold)
```

### 8. PAGINAS ADICIONALES

```
/nosotros - Sobre la Inmobiliaria:
  - Hero con foto del equipo/oficina
  - Historia, valores, mision
  - Stats animados: Anos, Propiedades vendidas, Clientes satisfechos
  - Grid del equipo con fotos, nombre, cargo, contacto
  - Testimonios de clientes (carousel)
  - Certificaciones y membresías

/agentes o /equipo:
  - Grid de cards de agentes
  - Card: Foto circular + Nombre + Especialidad + Rating + Propiedades activas
  - Click abre perfil con bio, propiedades asignadas, reviews

/tasaciones:
  - Hero: "Conoce el valor de tu propiedad"
  - Formulario: Direccion, Tipo, Superficie, Ambientes, Antiguedad, Fotos (upload)
  - CTA: "Solicitar tasacion gratuita"
  - Trust: "Respondemos en 24hs"

/barrios o /zonas:
  - Grid de cards por barrio (foto representativa + nombre + rango precios)
  - Click abre: Descripcion del barrio, mapa, propiedades en la zona, estadisticas

/contacto:
  - Formulario limpio
  - Mapa con ubicacion de la oficina
  - Telefono, WhatsApp, Email, Redes sociales
  - Horarios de atencion
```

### 9. DIFERENCIADORES CLAVE vs COMPETENCIA

| Aspecto | Marketplaces (ZP/AP) | Nuestra Solucion |
|---|---|---|
| **Marca** | La inmobiliaria se pierde entre miles | Sitio 100% branded, dominio propio |
| **Hero** | Generico, misma imagen siempre | Video/fotos de SUS propiedades premium |
| **Buscador** | Busca en TODO el mercado | Busca solo en SU catalogo (mas relevante) |
| **Agentes** | No tienen presencia | Perfil dedicado con bio, foto, reviews |
| **Confianza** | Trust del portal, no de la inmobiliaria | Trust propio: testimonios, stats, certificaciones |
| **Contacto** | Formulario generico | WhatsApp directo, agente asignado, chat |
| **SEO** | Compite con miles de publicaciones | Landing pages por barrio, posiciona directo |
| **Diseno** | Mismo para todos, no personalizable | Colores/fuentes personalizables por marca |
| **Velocidad** | Pesado, muchos ads | Ultra rapido, sin publicidad, optimizado |
| **Detail Page** | Standard, sin diferenciacion | Magazine-style, video tour, 360, mapa rico |

### 10. RESPONSIVE BREAKPOINTS

```
--breakpoint-sm:  640px    /* Mobile landscape */
--breakpoint-md:  768px    /* Tablet */
--breakpoint-lg:  1024px   /* Desktop small */
--breakpoint-xl:  1280px   /* Desktop */
--breakpoint-2xl: 1536px   /* Desktop wide */

Mobile-first approach:
  Base styles = mobile
  @media (min-width: 768px) = tablet
  @media (min-width: 1024px) = desktop
  @media (min-width: 1280px) = desktop wide
```

### 11. PERFORMANCE TARGETS

```
Core Web Vitals:
  LCP: < 2.5s
  FID: < 100ms
  CLS: < 0.1

PageSpeed Score: > 90

Tecnicas:
  - Next.js Image optimization con BlurHash placeholders
  - Lazy loading para galeria y cards below fold
  - Prefetch de property detail en hover
  - CDN para imagenes (Cloudflare/Vercel)
  - Font subsetting (Inter solo pesos 400,500,600,700,800)
  - Critical CSS inlined
```

---

## CONCLUSION

El diseno propuesto toma lo MEJOR de cada competidor:

- **De Zillow**: Half-map layout, property detail magazine-style, carousel swipeable, secciones colapsables mobile
- **De RE/MAX**: Color strategy inteligente (brand solo en CTAs), mobile-first, paginas de agente dedicadas
- **De Argenprop**: Buscador con autocomplete bien organizado por categorias, hero con overlay efectivo
- **De ZonaProp**: Sistema de badges efectivo, filtros con chips visuales
- **De ML Inmuebles**: Sidebar de filtros probada, estructura funcional sin ruido
- **De Realtor**: Grid asimetrico de galeria, scoring de barrios
- **De Properati**: Estilo moderno, border-radius generosos, whitespace amplio

Y SUPERA a todos con:
- Personalizacion total por inmobiliaria (marca, colores, fotos)
- Glassmorphism en buscador (premium feel)
- Video hero con fallback
- Perfil de agentes con reviews
- WhatsApp nativo como canal primario (Argentina-specific)
- Paginas de barrios con data enriquecida
- Performance target > 90 PageSpeed
