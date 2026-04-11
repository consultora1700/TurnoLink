/**
 * Rubro Attributes — Fichas Técnicas por Industria
 *
 * Define atributos estructurados para cada rubro.
 * Para agregar un nuevo rubro, solo hay que agregar una entrada en RUBRO_ATTRIBUTES.
 */

export type AttributeFieldType = 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'multiselect';

export interface AttributeDefinition {
  key: string;
  label: string;
  type: AttributeFieldType;
  unit?: string;           // sufijo visual: "m²", "km", "$/mes"
  options?: string[];      // para select/multiselect
  placeholder?: string;
  showOnCard?: boolean;    // mostrar en resumen compacto de la card
  cardOrder?: number;      // orden en la card (menor = primero)
  group?: string;          // agrupación visual en el form
}

// ─── Definiciones por rubro ──────────────────────────────────

const INMOBILIARIAS_ATTRIBUTES: AttributeDefinition[] = [
  { key: 'operacion', label: 'Operación', type: 'select', options: ['Venta', 'Alquiler', 'Venta y Alquiler'], showOnCard: true, cardOrder: 0 },
  { key: 'tipo_propiedad', label: 'Tipo de propiedad', type: 'select', options: ['Departamento', 'Casa', 'PH', 'Local', 'Oficina', 'Terreno', 'Cochera', 'Depósito'], showOnCard: true, cardOrder: 1 },
  { key: 'ambientes', label: 'Ambientes', type: 'number', showOnCard: true, cardOrder: 2 },
  { key: 'dormitorios', label: 'Dormitorios', type: 'number', showOnCard: true, cardOrder: 2.5 },
  { key: 'banos', label: 'Baños', type: 'number' },
  { key: 'm2_cubiertos', label: 'm² Cubiertos', type: 'number', unit: 'm²', group: 'Superficie' },
  { key: 'm2_descubiertos', label: 'm² Descubiertos', type: 'number', unit: 'm²', group: 'Superficie' },
  { key: 'm2_totales', label: 'm² Totales', type: 'number', unit: 'm²', showOnCard: true, cardOrder: 3, group: 'Superficie' },
  { key: 'cochera', label: 'Cochera', type: 'select', options: ['No', '1', '2', '3+'], group: 'Detalles' },
  { key: 'antiguedad', label: 'Antigüedad', type: 'text', placeholder: 'Ej: A estrenar, 10 años', group: 'Detalles' },
  { key: 'estado', label: 'Estado', type: 'select', options: ['A estrenar', 'Excelente', 'Muy bueno', 'Bueno', 'Regular'], group: 'Detalles' },
  { key: 'orientacion', label: 'Orientación', type: 'select', options: ['Frente', 'Contrafrente', 'Lateral', 'Interno'], group: 'Detalles' },
  { key: 'barrio', label: 'Barrio', type: 'text', placeholder: 'Ej: Belgrano, Palermo', group: 'Ubicación' },
  { key: 'expensas', label: 'Expensas', type: 'number', unit: '$/mes', group: 'Ubicación' },
  { key: 'amenities', label: 'Amenities', type: 'multiselect', options: ['Pileta', 'SUM', 'Gym', 'Laundry', 'Seguridad 24h', 'Parrilla', 'Terraza', 'Balcón', 'Baulera'], group: 'Extras' },
  { key: 'mascotas', label: 'Mascotas', type: 'select', options: ['Sí', 'No', 'Consultar'], group: 'Extras' },
  { key: 'apto_credito', label: 'Apto crédito', type: 'boolean', group: 'Extras' },
  { key: 'apto_profesional', label: 'Apto profesional', type: 'boolean', group: 'Extras' },
];

// ─── Mercado Sub-Rubros ──────────────────────────────────────

const MERCADO_CELULARES_ATTRIBUTES: AttributeDefinition[] = [
  { key: 'marca', label: 'Marca', type: 'select', options: ['Apple', 'Samsung', 'Xiaomi', 'Motorola', 'Google', 'Huawei', 'OnePlus', 'Otro'], showOnCard: true, cardOrder: 0 },
  { key: 'linea', label: 'Línea', type: 'text', placeholder: 'Ej: iPhone 17, Galaxy S25', showOnCard: true, cardOrder: 1 },
  { key: 'gama', label: 'Gama', type: 'select', options: ['Estándar', 'Pro', 'Pro Max', 'Ultra', 'Air', 'Lite', 'Plus'], showOnCard: true, cardOrder: 2 },
  { key: 'capacidad', label: 'Capacidad', type: 'select', options: ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB', '2TB'], showOnCard: true, cardOrder: 3, group: 'Almacenamiento' },
  { key: 'ram', label: 'RAM', type: 'select', options: ['2GB', '3GB', '4GB', '6GB', '8GB', '12GB', '16GB'], group: 'Almacenamiento' },
  { key: 'estado', label: 'Estado', type: 'select', options: ['Nuevo sellado', 'Nuevo abierto', 'Reacondicionado', 'Usado - Excelente', 'Usado - Muy bueno', 'Usado - Bueno'], showOnCard: true, cardOrder: 4, group: 'Condición' },
  { key: 'bateria', label: 'Salud batería', type: 'text', placeholder: 'Ej: 100%, 92%', group: 'Condición' },
  { key: 'garantia', label: 'Garantía', type: 'select', options: ['Sin garantía', '3 meses', '6 meses', '12 meses', 'Garantía oficial'], group: 'Condición' },
  { key: 'color', label: 'Color', type: 'text', placeholder: 'Ej: Negro, Blanco, Titanio', group: 'Apariencia' },
  { key: 'red', label: 'Red', type: 'select', options: ['4G', '5G'], group: 'Conectividad' },
  { key: 'dual_sim', label: 'Dual SIM', type: 'boolean', group: 'Conectividad' },
  { key: 'liberado', label: 'Liberado', type: 'boolean', group: 'Conectividad' },
];

const MERCADO_INDUMENTARIA_ATTRIBUTES: AttributeDefinition[] = [
  { key: 'talle', label: 'Talle', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'], showOnCard: true, cardOrder: 0 },
  { key: 'color', label: 'Color', type: 'text', showOnCard: true, cardOrder: 1 },
  { key: 'genero', label: 'Género', type: 'select', options: ['Hombre', 'Mujer', 'Unisex', 'Niño', 'Niña'], showOnCard: true, cardOrder: 2 },
  { key: 'tipo', label: 'Tipo', type: 'select', options: ['Remera', 'Camisa', 'Pantalón', 'Jean', 'Campera', 'Buzo', 'Vestido', 'Pollera', 'Short', 'Bermuda', 'Ropa interior', 'Accesorio'], group: 'Detalles' },
  { key: 'material', label: 'Material', type: 'select', options: ['Algodón', 'Poliéster', 'Lana', 'Seda', 'Denim', 'Cuero', 'Sintético', 'Otro'], group: 'Detalles' },
  { key: 'marca', label: 'Marca', type: 'text', group: 'Detalles' },
  { key: 'temporada', label: 'Temporada', type: 'select', options: ['Verano', 'Invierno', 'Primavera/Otoño', 'Todo el año'], group: 'Detalles' },
];

const MERCADO_CALZADO_ATTRIBUTES: AttributeDefinition[] = [
  { key: 'talle', label: 'Talle', type: 'select', options: ['34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'], showOnCard: true, cardOrder: 0 },
  { key: 'tipo', label: 'Tipo', type: 'select', options: ['Zapatilla', 'Bota', 'Botín', 'Sandalia', 'Ojota', 'Zapato', 'Mocasín', 'Alpargata'], showOnCard: true, cardOrder: 1 },
  { key: 'color', label: 'Color', type: 'text', showOnCard: true, cardOrder: 2 },
  { key: 'marca', label: 'Marca', type: 'select', options: ['Nike', 'Adidas', 'Puma', 'New Balance', 'Converse', 'Vans', 'Topper', 'Otro'], group: 'Detalles' },
  { key: 'material', label: 'Material', type: 'select', options: ['Cuero', 'Sintético', 'Lona', 'Textil', 'Goma'], group: 'Detalles' },
  { key: 'genero', label: 'Género', type: 'select', options: ['Hombre', 'Mujer', 'Unisex', 'Niño', 'Niña'], group: 'Detalles' },
];

const MERCADO_COMPUTACION_ATTRIBUTES: AttributeDefinition[] = [
  { key: 'marca', label: 'Marca', type: 'select', options: ['Apple', 'Lenovo', 'HP', 'Dell', 'Asus', 'Acer', 'Samsung', 'MSI', 'Otro'], showOnCard: true, cardOrder: 0 },
  { key: 'tipo', label: 'Tipo', type: 'select', options: ['Notebook', 'Desktop', 'All-in-One', 'Monitor', 'Tablet'], showOnCard: true, cardOrder: 1 },
  { key: 'ram', label: 'RAM', type: 'select', options: ['4GB', '8GB', '16GB', '32GB', '64GB'], showOnCard: true, cardOrder: 2 },
  { key: 'almacenamiento', label: 'Almacenamiento', type: 'select', options: ['128GB SSD', '256GB SSD', '512GB SSD', '1TB SSD', '1TB HDD', '2TB HDD'], group: 'Specs' },
  { key: 'procesador', label: 'Procesador', type: 'select', options: ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'AMD Ryzen 3', 'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9', 'Apple M3', 'Apple M4', 'Otro'], group: 'Specs' },
  { key: 'pantalla', label: 'Pantalla', type: 'text', placeholder: 'Ej: 15.6", Full HD', group: 'Specs' },
  { key: 'estado', label: 'Estado', type: 'select', options: ['Nuevo', 'Reacondicionado', 'Usado - Excelente', 'Usado - Bueno'], showOnCard: true, cardOrder: 3, group: 'Condición' },
  { key: 'garantia', label: 'Garantía', type: 'select', options: ['Sin garantía', '3 meses', '6 meses', '12 meses', 'Garantía oficial'], group: 'Condición' },
];

const MERCADO_ELECTRONICA_ATTRIBUTES: AttributeDefinition[] = [
  { key: 'marca', label: 'Marca', type: 'select', options: ['Samsung', 'LG', 'Sony', 'Philips', 'Whirlpool', 'BGH', 'Atma', 'Otro'], showOnCard: true, cardOrder: 0 },
  { key: 'tipo', label: 'Tipo', type: 'select', options: ['TV', 'Aire acondicionado', 'Heladera', 'Lavarropas', 'Microondas', 'Horno', 'Aspiradora', 'Otro'], showOnCard: true, cardOrder: 1 },
  { key: 'garantia', label: 'Garantía', type: 'select', options: ['Sin garantía', '6 meses', '12 meses', '24 meses', 'Garantía oficial'], showOnCard: true, cardOrder: 2, group: 'Condición' },
  { key: 'estado', label: 'Estado', type: 'select', options: ['Nuevo', 'Reacondicionado', 'Usado - Excelente', 'Usado - Bueno'], showOnCard: true, cardOrder: 3, group: 'Condición' },
  { key: 'potencia', label: 'Potencia', type: 'text', unit: 'W', placeholder: 'Ej: 2200', group: 'Specs' },
  { key: 'eficiencia', label: 'Eficiencia', type: 'select', options: ['A+++', 'A++', 'A+', 'A', 'B', 'C'], group: 'Specs' },
];

const MERCADO_ACCESORIOS_TECH_ATTRIBUTES: AttributeDefinition[] = [
  { key: 'tipo', label: 'Tipo', type: 'select', options: ['Auricular', 'Cargador', 'Funda', 'Cable', 'Parlante', 'Mouse', 'Teclado', 'Soporte', 'Otro'], showOnCard: true, cardOrder: 0 },
  { key: 'marca', label: 'Marca', type: 'select', options: ['Apple', 'Samsung', 'JBL', 'Logitech', 'Razer', 'Xiaomi', 'Otro'], showOnCard: true, cardOrder: 1 },
  { key: 'compatibilidad', label: 'Compatibilidad', type: 'select', options: ['iPhone', 'Android', 'Universal', 'PC', 'Mac', 'PlayStation', 'Xbox'], group: 'Detalles' },
  { key: 'conectividad', label: 'Conectividad', type: 'select', options: ['Bluetooth', 'USB-C', 'Lightning', 'Jack 3.5mm', 'WiFi', 'Otro'], group: 'Detalles' },
  { key: 'color', label: 'Color', type: 'text', group: 'Detalles' },
];

const MERCADO_AUTOMOTORAS_ATTRIBUTES: AttributeDefinition[] = [
  { key: 'marca', label: 'Marca', type: 'select', options: ['Toyota', 'Ford', 'Volkswagen', 'Chevrolet', 'Fiat', 'Renault', 'Peugeot', 'Honda', 'Hyundai', 'Kia', 'BMW', 'Mercedes-Benz', 'Otro'], showOnCard: true, cardOrder: 0 },
  { key: 'modelo', label: 'Modelo', type: 'text', placeholder: 'Ej: Corolla, Ranger, Gol', showOnCard: true, cardOrder: 1 },
  { key: 'anio', label: 'Año', type: 'number', placeholder: 'Ej: 2024', showOnCard: true, cardOrder: 2 },
  { key: 'kilometraje', label: 'Kilómetros', type: 'number', unit: 'km', placeholder: 'Ej: 45000', showOnCard: true, cardOrder: 3 },
  { key: 'combustible', label: 'Combustible', type: 'select', options: ['Nafta', 'Diésel', 'GNC', 'Híbrido', 'Eléctrico'], group: 'Mecánica' },
  { key: 'transmision', label: 'Transmisión', type: 'select', options: ['Manual', 'Automática', 'CVT'], group: 'Mecánica' },
  { key: 'tipo_vehiculo', label: 'Tipo de vehículo', type: 'select', options: ['Auto', 'Camioneta', 'SUV', 'Moto', 'Utilitario'], group: 'General' },
  { key: 'color', label: 'Color', type: 'text', group: 'General' },
  { key: 'estado', label: 'Estado', type: 'select', options: ['0km', 'Usado - Excelente', 'Usado - Muy bueno', 'Usado - Bueno'], group: 'General' },
];

const MERCADO_ALIMENTOS_ATTRIBUTES: AttributeDefinition[] = [
  { key: 'tipo', label: 'Tipo', type: 'select', options: ['Snack', 'Bebida', 'Congelado', 'Conserva', 'Lácteo', 'Panadería', 'Dulce', 'Condimento', 'Otro'], showOnCard: true, cardOrder: 0 },
  { key: 'peso_volumen', label: 'Peso/Volumen', type: 'text', placeholder: 'Ej: 500g, 1L, 750ml', showOnCard: true, cardOrder: 1 },
  { key: 'sin_tacc', label: 'Sin TACC', type: 'boolean', showOnCard: true, cardOrder: 2 },
  { key: 'vegano', label: 'Vegano', type: 'boolean', group: 'Dieta' },
  { key: 'organico', label: 'Orgánico', type: 'boolean', group: 'Dieta' },
  { key: 'marca', label: 'Marca', type: 'text', group: 'Detalles' },
];

const MERCADO_MUEBLES_ATTRIBUTES: AttributeDefinition[] = [
  { key: 'tipo', label: 'Tipo', type: 'select', options: ['Silla', 'Mesa', 'Escritorio', 'Sillón', 'Cama', 'Ropero', 'Estantería', 'Aparador', 'Otro'], showOnCard: true, cardOrder: 0 },
  { key: 'material', label: 'Material', type: 'select', options: ['Madera maciza', 'MDF/Melamina', 'Metal', 'Vidrio', 'Tela', 'Cuero', 'Mimbre', 'Otro'], showOnCard: true, cardOrder: 1 },
  { key: 'color', label: 'Color', type: 'text', showOnCard: true, cardOrder: 2 },
  { key: 'dimensiones', label: 'Dimensiones', type: 'text', placeholder: 'Ej: 180x90x75 cm', group: 'Detalles' },
  { key: 'estilo', label: 'Estilo', type: 'select', options: ['Moderno', 'Industrial', 'Nórdico', 'Clásico', 'Rústico', 'Minimalista'], group: 'Detalles' },
];

const MERCADO_JUGUETES_ATTRIBUTES: AttributeDefinition[] = [
  { key: 'edad', label: 'Edad recomendada', type: 'select', options: ['0-2 años', '3-5 años', '6-8 años', '9-12 años', '13+ años', 'Adultos'], showOnCard: true, cardOrder: 0 },
  { key: 'tipo', label: 'Tipo', type: 'select', options: ['Muñeco', 'Juego de mesa', 'Peluche', 'Construcción', 'Vehículo', 'Educativo', 'Exterior', 'Otro'], showOnCard: true, cardOrder: 1 },
  { key: 'marca', label: 'Marca', type: 'select', options: ['Mattel', 'Hasbro', 'LEGO', 'Fisher-Price', 'Playmobil', 'Otro'], group: 'Detalles' },
  { key: 'material', label: 'Material', type: 'select', options: ['Plástico', 'Madera', 'Tela', 'Metal'], group: 'Detalles' },
];

const MERCADO_DEPORTES_ATTRIBUTES: AttributeDefinition[] = [
  { key: 'deporte', label: 'Deporte', type: 'select', options: ['Fútbol', 'Básquet', 'Tenis', 'Running', 'Ciclismo', 'Natación', 'Gym', 'Camping', 'Otro'], showOnCard: true, cardOrder: 0 },
  { key: 'tipo', label: 'Tipo', type: 'select', options: ['Indumentaria', 'Calzado', 'Equipamiento', 'Accesorio', 'Nutrición'], showOnCard: true, cardOrder: 1 },
  { key: 'marca', label: 'Marca', type: 'select', options: ['Nike', 'Adidas', 'Puma', 'Under Armour', 'Reebok', 'Topper', 'Otro'], group: 'Detalles' },
  { key: 'talle', label: 'Talle', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], group: 'Detalles' },
];

const MERCADO_LIBRERIA_ATTRIBUTES: AttributeDefinition[] = [
  { key: 'tipo', label: 'Tipo', type: 'select', options: ['Cuaderno', 'Carpeta', 'Lapicera', 'Resma', 'Mochila', 'Cartuchera', 'Pegamento', 'Otro'], showOnCard: true, cardOrder: 0 },
  { key: 'marca', label: 'Marca', type: 'select', options: ['Rivadavia', 'Gloria', 'Faber-Castell', 'Staedtler', 'BIC', 'Otro'], group: 'Detalles' },
  { key: 'formato', label: 'Formato', type: 'select', options: ['A4', 'A5', 'Oficio', 'Carta', 'Otro'], group: 'Detalles' },
];

const MERCADO_COSMETICA_ATTRIBUTES: AttributeDefinition[] = [
  { key: 'tipo', label: 'Tipo', type: 'select', options: ['Perfume', 'Crema', 'Maquillaje', 'Shampoo', 'Esmalte', 'Desodorante', 'Sérum', 'Otro'], showOnCard: true, cardOrder: 0 },
  { key: 'marca', label: 'Marca', type: 'text', showOnCard: true, cardOrder: 1 },
  { key: 'volumen', label: 'Volumen', type: 'text', placeholder: 'Ej: 100ml, 50g', showOnCard: true, cardOrder: 2 },
  { key: 'genero', label: 'Género', type: 'select', options: ['Mujer', 'Hombre', 'Unisex'], group: 'Detalles' },
];

const MERCADO_MASCOTAS_ATTRIBUTES: AttributeDefinition[] = [
  { key: 'tipo', label: 'Tipo', type: 'select', options: ['Alimento', 'Snack', 'Juguete', 'Accesorio', 'Higiene', 'Ropa', 'Cama/Cucha', 'Otro'], showOnCard: true, cardOrder: 0 },
  { key: 'especie', label: 'Especie', type: 'select', options: ['Perro', 'Gato', 'Ave', 'Pez', 'Roedor', 'Reptil', 'Otro'], showOnCard: true, cardOrder: 1 },
  { key: 'marca', label: 'Marca', type: 'select', options: ['Royal Canin', 'Pro Plan', 'Pedigree', 'Whiskas', 'Dog Chow', 'Otro'], group: 'Detalles' },
  { key: 'peso_volumen', label: 'Peso/Volumen', type: 'text', placeholder: 'Ej: 15kg, 3kg, 500g', group: 'Detalles' },
];

const MERCADO_JOYERIA_ATTRIBUTES: AttributeDefinition[] = [
  { key: 'tipo', label: 'Tipo', type: 'select', options: ['Anillo', 'Cadena', 'Pulsera', 'Aros', 'Reloj', 'Piercing', 'Otro'], showOnCard: true, cardOrder: 0 },
  { key: 'material', label: 'Material', type: 'select', options: ['Oro', 'Plata', 'Acero', 'Titanio', 'Cuero', 'Bijouterie'], showOnCard: true, cardOrder: 1 },
  { key: 'marca', label: 'Marca', type: 'text', group: 'Detalles' },
  { key: 'genero', label: 'Género', type: 'select', options: ['Mujer', 'Hombre', 'Unisex'], group: 'Detalles' },
];

const MERCADO_FERRETERIA_ATTRIBUTES: AttributeDefinition[] = [
  { key: 'tipo', label: 'Tipo', type: 'select', options: ['Herramienta manual', 'Herramienta eléctrica', 'Pintura', 'Bulonería', 'Electricidad', 'Plomería', 'Otro'], showOnCard: true, cardOrder: 0 },
  { key: 'marca', label: 'Marca', type: 'select', options: ['Bosch', 'Makita', 'DeWalt', 'Stanley', 'Black+Decker', 'Otro'], group: 'Detalles' },
  { key: 'material', label: 'Material', type: 'select', options: ['Acero', 'Hierro', 'Aluminio', 'PVC', 'Otro'], group: 'Detalles' },
  { key: 'medida', label: 'Medida', type: 'text', placeholder: 'Ej: 10mm, 1/2"', group: 'Detalles' },
];

const MERCADO_BAZAR_ATTRIBUTES: AttributeDefinition[] = [
  { key: 'tipo', label: 'Tipo', type: 'select', options: ['Vaso', 'Plato', 'Olla', 'Sartén', 'Cubiertos', 'Organizador', 'Decoración', 'Otro'], showOnCard: true, cardOrder: 0 },
  { key: 'material', label: 'Material', type: 'select', options: ['Vidrio', 'Cerámica', 'Acero', 'Plástico', 'Madera', 'Silicona'], showOnCard: true, cardOrder: 1 },
  { key: 'color', label: 'Color', type: 'text', group: 'Detalles' },
];

// ─── Gastronomía ──────────────────────────────────────────────

const GASTRONOMIA_ATTRIBUTES: AttributeDefinition[] = [
  // Clasificación (visible en cards)
  { key: 'seccion', label: 'Sección', type: 'select', options: ['Entrada', 'Principal', 'Postre', 'Bebida', 'Guarnición', 'Menú del día', 'Promo'], showOnCard: true, cardOrder: 0 },
  { key: 'apto_celiaco', label: 'Apto celíaco', type: 'boolean', showOnCard: true, cardOrder: 1 },
  { key: 'apto_vegano', label: 'Vegano/Vegetariano', type: 'select', options: ['No', 'Vegetariano', 'Vegano'], showOnCard: true, cardOrder: 2 },

  // Detalle del plato
  { key: 'porciones', label: 'Porciones', type: 'select', options: ['Individual', 'Para 2', 'Para compartir', 'Familiar'], group: 'Detalle' },
  { key: 'picante', label: 'Picante', type: 'select', options: ['No', 'Suave', 'Medio', 'Fuerte'], group: 'Detalle' },
  { key: 'tiempo_prep', label: 'Tiempo aprox.', type: 'select', options: ['10 min', '20 min', '30 min', '45 min', '+60 min'], group: 'Detalle' },
  { key: 'calorias', label: 'Calorías aprox.', type: 'text', placeholder: 'Ej: 450 kcal', group: 'Detalle' },

  // Ficha gastronómica (visible en detalle del plato para comensales)
  { key: 'ingredientes', label: 'Ingredientes principales', type: 'textarea', placeholder: 'Ej: Bife de chorizo, papas rústicas, chimichurri casero, ensalada de rúcula y parmesano', group: 'Ficha del plato' },
  { key: 'elaboracion', label: 'Elaboración', type: 'textarea', placeholder: 'Ej: Cocción a la parrilla con leña de quebracho, acompañado de guarnición de estación', group: 'Ficha del plato' },
  { key: 'origen', label: 'Origen / Historia', type: 'textarea', placeholder: 'Ej: Receta tradicional del norte argentino, heredada de la abuela de nuestro chef', group: 'Ficha del plato' },
  { key: 'maridaje', label: 'Maridaje sugerido', type: 'text', placeholder: 'Ej: Malbec reserva, Torrontés', group: 'Ficha del plato' },

  // Información alimentaria
  { key: 'alergenos', label: 'Alérgenos', type: 'multiselect', options: ['Gluten', 'Lácteos', 'Huevo', 'Frutos secos', 'Mariscos', 'Soja', 'Maní'], group: 'Alimentación' },
];

// ─── Registry ─────────────────────────────────────────────────

export const RUBRO_ATTRIBUTES: Record<string, AttributeDefinition[]> = {
  // Rubros principales
  inmobiliarias: INMOBILIARIAS_ATTRIBUTES,
  gastronomia: GASTRONOMIA_ATTRIBUTES,

  // Mercado sub-rubros
  'mercado-celulares': MERCADO_CELULARES_ATTRIBUTES,
  'mercado-indumentaria': MERCADO_INDUMENTARIA_ATTRIBUTES,
  'mercado-calzado': MERCADO_CALZADO_ATTRIBUTES,
  'mercado-computacion': MERCADO_COMPUTACION_ATTRIBUTES,
  'mercado-electronica': MERCADO_ELECTRONICA_ATTRIBUTES,
  'mercado-accesorios-tech': MERCADO_ACCESORIOS_TECH_ATTRIBUTES,
  'mercado-automotoras': MERCADO_AUTOMOTORAS_ATTRIBUTES,
  'mercado-alimentos': MERCADO_ALIMENTOS_ATTRIBUTES,
  'mercado-muebles': MERCADO_MUEBLES_ATTRIBUTES,
  'mercado-juguetes': MERCADO_JUGUETES_ATTRIBUTES,
  'mercado-deportes': MERCADO_DEPORTES_ATTRIBUTES,
  'mercado-libreria': MERCADO_LIBRERIA_ATTRIBUTES,
  'mercado-cosmetica': MERCADO_COSMETICA_ATTRIBUTES,
  'mercado-mascotas': MERCADO_MASCOTAS_ATTRIBUTES,
  'mercado-joyeria': MERCADO_JOYERIA_ATTRIBUTES,
  'mercado-ferreteria': MERCADO_FERRETERIA_ATTRIBUTES,
  'mercado-bazar': MERCADO_BAZAR_ATTRIBUTES,
  // mercado-general: sin atributos (fallback)

  // Backward compatibility alias
  celulares: MERCADO_CELULARES_ATTRIBUTES,
};

// ─── Helpers ──────────────────────────────────────────────────

export function getRubroAttributes(rubro: string): AttributeDefinition[] {
  return RUBRO_ATTRIBUTES[rubro] || [];
}

export function hasRubroAttributes(rubro: string): boolean {
  return (RUBRO_ATTRIBUTES[rubro]?.length ?? 0) > 0;
}

/** Check if a rubro is a mercado sub-rubro (or mercado itself) */
export function isMercadoRubro(rubro: string): boolean {
  return rubro === 'mercado' || rubro.startsWith('mercado-') || rubro === 'celulares';
}

/** Check if a rubro is gastronomia (hybrid: bookings + catalog) */
export function isGastronomiaRubro(rubro: string): boolean {
  return rubro === 'gastronomia';
}

/** Check if a rubro should show the catalog page (not booking) */
export function isCatalogRubro(rubro: string): boolean {
  return rubro === 'inmobiliarias' || rubro === 'gastronomia' || isMercadoRubro(rubro);
}

/**
 * Genera resumen compacto para cards: "Venta · Depto · 3 amb · 80m²"
 */
export function buildAttributeSummary(
  attributes: Array<{ key: string; value: string }> | null | undefined,
  rubro: string,
): string {
  if (!attributes?.length) return '';
  const defs = getRubroAttributes(rubro);
  if (!defs.length) return '';

  const cardDefs = defs
    .filter((d) => d.showOnCard)
    .sort((a, b) => (a.cardOrder ?? 99) - (b.cardOrder ?? 99));

  return cardDefs
    .map((def) => {
      const attr = attributes.find((a) => a.key === def.key);
      if (!attr?.value) return null;
      // Formato compacto según key
      if (def.key === 'ambientes') return `${attr.value} amb`;
      if (def.key === 'dormitorios') return `${attr.value} dorm`;
      if (def.key === 'm2_totales') return `${attr.value}m²`;
      if (def.key === 'kilometraje') return `${Number(attr.value).toLocaleString('es-AR')} km`;
      if (def.key === 'marca' && rubro === 'mercado-celulares') return null; // skip if linea already contains it
      if (def.key === 'apto_celiaco' && attr.value === 'true') return 'Sin TACC';
      if (def.key === 'apto_celiaco') return null; // don't show "false"
      if (def.key === 'apto_vegano' && attr.value === 'No') return null;
      return attr.value;
    })
    .filter(Boolean)
    .join(' · ');
}
