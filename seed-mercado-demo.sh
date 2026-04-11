#!/bin/bash
# =============================================================================
# TurnoLink Mercado — Seed Demo Data
# Creates 2 mercado accounts with products, categories, branding, and orders
# =============================================================================

API="http://localhost:3001/api"
set -e

echo "=== Creating Demo Accounts ==="

# ─── Account 1: Moda Urbana (Catálogo) ───────────────────────
echo ""
echo ">>> Creating: Moda Urbana"
RES1=$(curl -s -X POST "$API/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo-moda@turnolink.com.ar",
    "password": "Demo2026Moda!",
    "name": "Valentina López",
    "businessName": "Moda Urbana BA",
    "businessSlug": "moda-urbana-ba",
    "accountType": "BUSINESS",
    "industry": "mercado"
  }')

TOKEN1=$(echo $RES1 | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])" 2>/dev/null)
if [ -z "$TOKEN1" ]; then
  echo "Registration may have failed or account exists. Trying login..."
  RES1=$(curl -s -X POST "$API/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"demo-moda@turnolink.com.ar","password":"Demo2026Moda!"}')
  TOKEN1=$(echo $RES1 | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])")
fi
echo "Token 1: ${TOKEN1:0:20}..."

# ─── Account 2: TechStore BA (E-commerce) ────────────────────
echo ""
echo ">>> Creating: TechStore BA"
RES2=$(curl -s -X POST "$API/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo-tech@turnolink.com.ar",
    "password": "Demo2026Tech!",
    "name": "Martín Rodríguez",
    "businessName": "TechStore BA",
    "businessSlug": "techstore-ba",
    "accountType": "BUSINESS",
    "industry": "mercado"
  }')

TOKEN2=$(echo $RES2 | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])" 2>/dev/null)
if [ -z "$TOKEN2" ]; then
  echo "Registration may have failed or account exists. Trying login..."
  RES2=$(curl -s -X POST "$API/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"demo-tech@turnolink.com.ar","password":"Demo2026Tech!"}')
  TOKEN2=$(echo $RES2 | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])")
fi
echo "Token 2: ${TOKEN2:0:20}..."

# =============================================================================
# ACCOUNT 1: MODA URBANA — Ropa y accesorios (Catálogo WhatsApp)
# =============================================================================
echo ""
echo "=== Populating: Moda Urbana BA ==="
AUTH1="Authorization: Bearer $TOKEN1"

# ─── Update tenant info ──────────────────────────────────────
curl -s -X PUT "$API/tenants/current" \
  -H "Content-Type: application/json" -H "$AUTH1" \
  -d '{
    "description": "Ropa urbana y accesorios con estilo. Envíos a todo el país.",
    "phone": "+5491155551234",
    "address": "Av. Santa Fe 1234",
    "city": "Buenos Aires",
    "instagram": "@modaurbana.ba",
    "facebook": "https://facebook.com/modaurbanaba"
  }' > /dev/null

# ─── Branding ────────────────────────────────────────────────
echo "  Setting branding..."
curl -s -X PUT "$API/branding" \
  -H "Content-Type: application/json" -H "$AUTH1" \
  -d '{
    "primaryColor": "#E11D48",
    "secondaryColor": "#BE185D",
    "accentColor": "#F43F5E",
    "backgroundColor": "#FFFBFB",
    "textColor": "#1C1917",
    "fontFamily": "DM Sans",
    "headingFontFamily": "Playfair Display",
    "welcomeTitle": "Moda Urbana BA",
    "welcomeSubtitle": "Estilo que define tu personalidad. Envíos a todo AMBA.",
    "footerText": "© 2026 Moda Urbana BA. Todos los derechos reservados.",
    "metaTitle": "Moda Urbana BA — Ropa y Accesorios",
    "metaDescription": "Comprá ropa urbana, remeras, buzos, accesorios y más. Envíos rápidos a todo AMBA. Consultá por WhatsApp.",
    "showPrices": true,
    "showStock": true,
    "enableWishlist": false,
    "enableReviews": false,
    "storeEnabled": true,
    "backgroundStyle": "elegant"
  }' > /dev/null

# ─── Categories ──────────────────────────────────────────────
echo "  Creating categories..."
CAT_REMERAS=$(curl -s -X POST "$API/products/categories" \
  -H "Content-Type: application/json" -H "$AUTH1" \
  -d '{"name":"Remeras","description":"Remeras de algodón premium"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

CAT_BUZOS=$(curl -s -X POST "$API/products/categories" \
  -H "Content-Type: application/json" -H "$AUTH1" \
  -d '{"name":"Buzos y Hoodies","description":"Buzos oversize y hoodies"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

CAT_PANTALONES=$(curl -s -X POST "$API/products/categories" \
  -H "Content-Type: application/json" -H "$AUTH1" \
  -d '{"name":"Pantalones","description":"Jeans, cargos y joggers"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

CAT_ACCESORIOS=$(curl -s -X POST "$API/products/categories" \
  -H "Content-Type: application/json" -H "$AUTH1" \
  -d '{"name":"Accesorios","description":"Gorras, bolsos y bijou"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

echo "  Categories: $CAT_REMERAS, $CAT_BUZOS, $CAT_PANTALONES, $CAT_ACCESORIOS"

# ─── Products ────────────────────────────────────────────────
echo "  Creating products..."

# Remera Oversized Básica
P1=$(curl -s -X POST "$API/products" \
  -H "Content-Type: application/json" -H "$AUTH1" \
  -d "{
    \"name\": \"Remera Oversize Algodón\",
    \"shortDescription\": \"Algodón 100% premium, corte oversize. Ideal para el día a día.\",
    \"description\": \"Remera oversize confeccionada en algodón peinado 24/1 de primera calidad. Costuras reforzadas, cuello redondo y un calce relajado que se adapta a cualquier cuerpo. Disponible en múltiples colores y talles.\n\nComposición: 100% algodón peinado\nPeso: 190 gr/m²\nLavado: máquina a 30°C\",
    \"price\": 8990,
    \"compareAtPrice\": 12990,
    \"costPrice\": 3500,
    \"sku\": \"REM-OVR-001\",
    \"stock\": 45,
    \"lowStockThreshold\": 5,
    \"trackInventory\": true,
    \"categoryId\": \"$CAT_REMERAS\",
    \"isActive\": true,
    \"isFeatured\": true
  }" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
# Add image
curl -s -X POST "$API/products/$P1/images" -H "Content-Type: application/json" -H "$AUTH1" \
  -d '{"url":"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80","alt":"Remera oversize blanca"}' > /dev/null
curl -s -X POST "$API/products/$P1/images" -H "Content-Type: application/json" -H "$AUTH1" \
  -d '{"url":"https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80","alt":"Remera oversize negra"}' > /dev/null
# Add variants
curl -s -X POST "$API/products/$P1/variants" -H "Content-Type: application/json" -H "$AUTH1" \
  -d '{"name":"Talle","value":"S","stock":10}' > /dev/null
curl -s -X POST "$API/products/$P1/variants" -H "Content-Type: application/json" -H "$AUTH1" \
  -d '{"name":"Talle","value":"M","stock":15}' > /dev/null
curl -s -X POST "$API/products/$P1/variants" -H "Content-Type: application/json" -H "$AUTH1" \
  -d '{"name":"Talle","value":"L","stock":12}' > /dev/null
curl -s -X POST "$API/products/$P1/variants" -H "Content-Type: application/json" -H "$AUTH1" \
  -d '{"name":"Talle","value":"XL","stock":8}' > /dev/null

# Remera Estampada
P2=$(curl -s -X POST "$API/products" \
  -H "Content-Type: application/json" -H "$AUTH1" \
  -d "{
    \"name\": \"Remera Estampada Urban\",
    \"shortDescription\": \"Diseños exclusivos de nuestra colección Urban 2026.\",
    \"description\": \"Remera con estampado serigráfico de alta definición. Algodón 100%, corte regular fit. Diseños exclusivos que no encontrás en otro lado.\",
    \"price\": 11990,
    \"compareAtPrice\": 14990,
    \"costPrice\": 4200,
    \"sku\": \"REM-EST-001\",
    \"stock\": 30,
    \"lowStockThreshold\": 5,
    \"trackInventory\": true,
    \"categoryId\": \"$CAT_REMERAS\",
    \"isActive\": true,
    \"isFeatured\": true
  }" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
curl -s -X POST "$API/products/$P2/images" -H "Content-Type: application/json" -H "$AUTH1" \
  -d '{"url":"https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80","alt":"Remera estampada"}' > /dev/null

# Buzo Oversize
P3=$(curl -s -X POST "$API/products" \
  -H "Content-Type: application/json" -H "$AUTH1" \
  -d "{
    \"name\": \"Buzo Oversize Hoodie\",
    \"shortDescription\": \"Hoodie oversize con capucha y bolsillo canguro. Ultra cómodo.\",
    \"description\": \"Buzo hoodie oversize confeccionado en frisa premium. Capucha con cordón ajustable, bolsillo canguro y puños y cintura con elástico.\n\nComposición: 80% algodón, 20% poliéster\nPeso: 320 gr/m²\nIdeal para: otoño-invierno\",
    \"price\": 24990,
    \"compareAtPrice\": 29990,
    \"costPrice\": 9000,
    \"sku\": \"BUZ-HOD-001\",
    \"stock\": 20,
    \"lowStockThreshold\": 3,
    \"trackInventory\": true,
    \"categoryId\": \"$CAT_BUZOS\",
    \"isActive\": true,
    \"isFeatured\": true
  }" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
curl -s -X POST "$API/products/$P3/images" -H "Content-Type: application/json" -H "$AUTH1" \
  -d '{"url":"https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80","alt":"Buzo hoodie oversize"}' > /dev/null
curl -s -X POST "$API/products/$P3/images" -H "Content-Type: application/json" -H "$AUTH1" \
  -d '{"url":"https://images.unsplash.com/photo-1578768079470-fa604cf29daa?w=800&q=80","alt":"Buzo hoodie detalle"}' > /dev/null
curl -s -X POST "$API/products/$P3/variants" -H "Content-Type: application/json" -H "$AUTH1" \
  -d '{"name":"Talle","value":"M","stock":8}' > /dev/null
curl -s -X POST "$API/products/$P3/variants" -H "Content-Type: application/json" -H "$AUTH1" \
  -d '{"name":"Talle","value":"L","stock":7}' > /dev/null
curl -s -X POST "$API/products/$P3/variants" -H "Content-Type: application/json" -H "$AUTH1" \
  -d '{"name":"Talle","value":"XL","stock":5}' > /dev/null

# Buzo Crewneck
P4=$(curl -s -X POST "$API/products" \
  -H "Content-Type: application/json" -H "$AUTH1" \
  -d "{
    \"name\": \"Buzo Crewneck Liso\",
    \"shortDescription\": \"Buzo cuello redondo en colores sólidos. Básico que no puede faltar.\",
    \"description\": \"Buzo crewneck de frisa premium sin capucha. Perfecto para layering o para usar solo. Corte relajado y colores que combinan con todo.\",
    \"price\": 19990,
    \"costPrice\": 7000,
    \"sku\": \"BUZ-CRW-001\",
    \"stock\": 25,
    \"lowStockThreshold\": 5,
    \"trackInventory\": true,
    \"categoryId\": \"$CAT_BUZOS\",
    \"isActive\": true
  }" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
curl -s -X POST "$API/products/$P4/images" -H "Content-Type: application/json" -H "$AUTH1" \
  -d '{"url":"https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80","alt":"Buzo crewneck"}' > /dev/null

# Jean Cargo
P5=$(curl -s -X POST "$API/products" \
  -H "Content-Type: application/json" -H "$AUTH1" \
  -d "{
    \"name\": \"Jean Cargo Wide Leg\",
    \"shortDescription\": \"Jean cargo de pierna ancha. La tendencia del momento.\",
    \"description\": \"Jean cargo wide leg con bolsillos laterales funcionales. Tiro alto, cierre con botón y cremallera. Denim premium con leve elasticidad.\n\nComposición: 98% algodón, 2% elastano\nPeso: 12 oz\",
    \"price\": 29990,
    \"compareAtPrice\": 35990,
    \"costPrice\": 11000,
    \"sku\": \"PAN-CRG-001\",
    \"stock\": 15,
    \"lowStockThreshold\": 3,
    \"trackInventory\": true,
    \"categoryId\": \"$CAT_PANTALONES\",
    \"isActive\": true,
    \"isFeatured\": true
  }" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
curl -s -X POST "$API/products/$P5/images" -H "Content-Type: application/json" -H "$AUTH1" \
  -d '{"url":"https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80","alt":"Jean cargo wide leg"}' > /dev/null
curl -s -X POST "$API/products/$P5/variants" -H "Content-Type: application/json" -H "$AUTH1" \
  -d '{"name":"Talle","value":"36","stock":4}' > /dev/null
curl -s -X POST "$API/products/$P5/variants" -H "Content-Type: application/json" -H "$AUTH1" \
  -d '{"name":"Talle","value":"38","stock":5}' > /dev/null
curl -s -X POST "$API/products/$P5/variants" -H "Content-Type: application/json" -H "$AUTH1" \
  -d '{"name":"Talle","value":"40","stock":4}' > /dev/null
curl -s -X POST "$API/products/$P5/variants" -H "Content-Type: application/json" -H "$AUTH1" \
  -d '{"name":"Talle","value":"42","stock":2}' > /dev/null

# Jogger
P6=$(curl -s -X POST "$API/products" \
  -H "Content-Type: application/json" -H "$AUTH1" \
  -d "{
    \"name\": \"Jogger Deportivo Premium\",
    \"shortDescription\": \"Jogger de algodón frizado con puños elásticos.\",
    \"description\": \"Jogger confeccionado en frisa algodón premium. Cintura elástica con cordón, bolsillos laterales y puños en los tobillos. Perfecto para el día a día o entrenar.\",
    \"price\": 17990,
    \"costPrice\": 6500,
    \"sku\": \"PAN-JOG-001\",
    \"stock\": 35,
    \"lowStockThreshold\": 5,
    \"trackInventory\": true,
    \"categoryId\": \"$CAT_PANTALONES\",
    \"isActive\": true
  }" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
curl -s -X POST "$API/products/$P6/images" -H "Content-Type: application/json" -H "$AUTH1" \
  -d '{"url":"https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&q=80","alt":"Jogger deportivo"}' > /dev/null

# Gorra Snapback
P7=$(curl -s -X POST "$API/products" \
  -H "Content-Type: application/json" -H "$AUTH1" \
  -d "{
    \"name\": \"Gorra Snapback Bordada\",
    \"shortDescription\": \"Gorra snapback con logo bordado. Ajuste universal.\",
    \"description\": \"Gorra snapback con visera plana, logo bordado frontal y cierre snapback ajustable. Talle único.\",
    \"price\": 7990,
    \"costPrice\": 2500,
    \"sku\": \"ACC-GOR-001\",
    \"stock\": 50,
    \"lowStockThreshold\": 10,
    \"trackInventory\": true,
    \"categoryId\": \"$CAT_ACCESORIOS\",
    \"isActive\": true
  }" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
curl -s -X POST "$API/products/$P7/images" -H "Content-Type: application/json" -H "$AUTH1" \
  -d '{"url":"https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=800&q=80","alt":"Gorra snapback"}' > /dev/null

# Riñonera
P8=$(curl -s -X POST "$API/products" \
  -H "Content-Type: application/json" -H "$AUTH1" \
  -d "{
    \"name\": \"Riñonera Impermeable\",
    \"shortDescription\": \"Riñonera con cierre YKK y tela impermeable. Ideal para salidas.\",
    \"description\": \"Riñonera confeccionada en tela impermeable con cierre YKK premium. Compartimento principal y bolsillo secreto trasero. Correa ajustable.\",
    \"price\": 9990,
    \"compareAtPrice\": 12990,
    \"costPrice\": 3000,
    \"sku\": \"ACC-RIN-001\",
    \"stock\": 40,
    \"lowStockThreshold\": 5,
    \"trackInventory\": true,
    \"categoryId\": \"$CAT_ACCESORIOS\",
    \"isActive\": true
  }" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
curl -s -X POST "$API/products/$P8/images" -H "Content-Type: application/json" -H "$AUTH1" \
  -d '{"url":"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80","alt":"Riñonera impermeable"}' > /dev/null

# Producto con stock bajo (para probar alerta)
P9=$(curl -s -X POST "$API/products" \
  -H "Content-Type: application/json" -H "$AUTH1" \
  -d "{
    \"name\": \"Campera Bomber Edición Limitada\",
    \"shortDescription\": \"Campera bomber en edición limitada. Pocas unidades.\",
    \"description\": \"Campera bomber con interior de satin, cierre metálico y ribetes elásticos. Edición limitada — no se repone.\",
    \"price\": 45990,
    \"costPrice\": 18000,
    \"sku\": \"CAM-BOM-001\",
    \"stock\": 3,
    \"lowStockThreshold\": 5,
    \"trackInventory\": true,
    \"categoryId\": \"$CAT_BUZOS\",
    \"isActive\": true,
    \"isFeatured\": true
  }" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
curl -s -X POST "$API/products/$P9/images" -H "Content-Type: application/json" -H "$AUTH1" \
  -d '{"url":"https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80","alt":"Campera bomber"}' > /dev/null

# Producto inactivo (para probar filtro)
P10=$(curl -s -X POST "$API/products" \
  -H "Content-Type: application/json" -H "$AUTH1" \
  -d "{
    \"name\": \"Remera Tie-Dye (Próximamente)\",
    \"shortDescription\": \"Remera tie-dye artesanal. Próximamente disponible.\",
    \"description\": \"Remera tie-dye teñida a mano. Cada prenda es única.\",
    \"price\": 13990,
    \"sku\": \"REM-TDY-001\",
    \"stock\": 0,
    \"trackInventory\": true,
    \"categoryId\": \"$CAT_REMERAS\",
    \"isActive\": false
  }" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

echo "  Moda Urbana: 10 products created"

# =============================================================================
# ACCOUNT 2: TECHSTORE BA — Electrónica y accesorios tech
# =============================================================================
echo ""
echo "=== Populating: TechStore BA ==="
AUTH2="Authorization: Bearer $TOKEN2"

# ─── Update tenant info ──────────────────────────────────────
curl -s -X PUT "$API/tenants/current" \
  -H "Content-Type: application/json" -H "$AUTH2" \
  -d '{
    "description": "Tu tienda de tecnología de confianza. Productos originales con garantía.",
    "phone": "+5491155559876",
    "address": "Av. Corrientes 4567",
    "city": "Buenos Aires",
    "instagram": "@techstore.ba",
    "website": "https://techstore.example.com"
  }' > /dev/null

# ─── Branding ────────────────────────────────────────────────
echo "  Setting branding..."
curl -s -X PUT "$API/branding" \
  -H "Content-Type: application/json" -H "$AUTH2" \
  -d '{
    "primaryColor": "#2563EB",
    "secondaryColor": "#3B82F6",
    "accentColor": "#F59E0B",
    "backgroundColor": "#F8FAFC",
    "textColor": "#0F172A",
    "fontFamily": "Inter",
    "headingFontFamily": "DM Sans",
    "welcomeTitle": "TechStore BA",
    "welcomeSubtitle": "Tecnología original con garantía. Enviamos a todo el país.",
    "footerText": "© 2026 TechStore BA. Todos los derechos reservados.",
    "metaTitle": "TechStore BA — Electrónica y Accesorios Tech",
    "metaDescription": "Comprá auriculares, cargadores, fundas y accesorios tech originales. Garantía oficial. Envíos a todo el país.",
    "showPrices": true,
    "showStock": true,
    "enableWishlist": true,
    "enableReviews": false,
    "storeEnabled": true,
    "backgroundStyle": "modern"
  }' > /dev/null

# ─── Categories ──────────────────────────────────────────────
echo "  Creating categories..."
CAT_AUDIO=$(curl -s -X POST "$API/products/categories" \
  -H "Content-Type: application/json" -H "$AUTH2" \
  -d '{"name":"Audio","description":"Auriculares, parlantes y micrófonos"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

CAT_CARGA=$(curl -s -X POST "$API/products/categories" \
  -H "Content-Type: application/json" -H "$AUTH2" \
  -d '{"name":"Carga y Cables","description":"Cargadores, cables y power banks"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

CAT_FUNDAS=$(curl -s -X POST "$API/products/categories" \
  -H "Content-Type: application/json" -H "$AUTH2" \
  -d '{"name":"Fundas y Protección","description":"Fundas, vidrios y protectores"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

CAT_SMART=$(curl -s -X POST "$API/products/categories" \
  -H "Content-Type: application/json" -H "$AUTH2" \
  -d '{"name":"Smart Home","description":"Dispositivos inteligentes para tu hogar"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

CAT_GAMING=$(curl -s -X POST "$API/products/categories" \
  -H "Content-Type: application/json" -H "$AUTH2" \
  -d '{"name":"Gaming","description":"Periféricos y accesorios gamer"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

echo "  Categories: $CAT_AUDIO, $CAT_CARGA, $CAT_FUNDAS, $CAT_SMART, $CAT_GAMING"

# ─── Products ────────────────────────────────────────────────
echo "  Creating products..."

# Auriculares Bluetooth
T1=$(curl -s -X POST "$API/products" \
  -H "Content-Type: application/json" -H "$AUTH2" \
  -d "{
    \"name\": \"Auriculares Bluetooth TWS Pro\",
    \"shortDescription\": \"Auriculares true wireless con cancelación de ruido activa y 8hs de batería.\",
    \"description\": \"Auriculares TWS con cancelación de ruido activa (ANC), Bluetooth 5.3, drivers de 12mm y micrófono dual con supresión de viento. El estuche de carga proporciona hasta 32hs de uso total.\n\nCaracterísticas:\n- ANC híbrido (reducción -35dB)\n- Modo transparencia\n- Bluetooth 5.3\n- IPX5 resistente al sudor\n- Touch controls\n- 8hs + 24hs con estuche\n- USB-C carga rápida\",
    \"price\": 34990,
    \"compareAtPrice\": 44990,
    \"costPrice\": 15000,
    \"sku\": \"AUD-TWS-PRO\",
    \"stock\": 25,
    \"lowStockThreshold\": 5,
    \"trackInventory\": true,
    \"categoryId\": \"$CAT_AUDIO\",
    \"isActive\": true,
    \"isFeatured\": true
  }" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
curl -s -X POST "$API/products/$T1/images" -H "Content-Type: application/json" -H "$AUTH2" \
  -d '{"url":"https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=800&q=80","alt":"Auriculares TWS Pro"}' > /dev/null
curl -s -X POST "$API/products/$T1/images" -H "Content-Type: application/json" -H "$AUTH2" \
  -d '{"url":"https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&q=80","alt":"Auriculares TWS estuche"}' > /dev/null
curl -s -X POST "$API/products/$T1/variants" -H "Content-Type: application/json" -H "$AUTH2" \
  -d '{"name":"Color","value":"Negro","stock":12}' > /dev/null
curl -s -X POST "$API/products/$T1/variants" -H "Content-Type: application/json" -H "$AUTH2" \
  -d '{"name":"Color","value":"Blanco","stock":8}' > /dev/null
curl -s -X POST "$API/products/$T1/variants" -H "Content-Type: application/json" -H "$AUTH2" \
  -d '{"name":"Color","value":"Azul","stock":5}' > /dev/null

# Parlante Bluetooth
T2=$(curl -s -X POST "$API/products" \
  -H "Content-Type: application/json" -H "$AUTH2" \
  -d "{
    \"name\": \"Parlante Bluetooth Portátil 20W\",
    \"shortDescription\": \"Parlante portátil IPX7 con 20W de potencia y 12hs de batería.\",
    \"description\": \"Parlante Bluetooth portátil con sonido 360° y graves profundos. Resistente al agua IPX7 — podés sumergirlo sin problema.\n\n- 20W de potencia RMS\n- Bluetooth 5.0\n- IPX7 sumergible\n- 12hs de batería\n- TWS: conectá dos para sonido estéreo\n- Mosquetón incluido\",
    \"price\": 24990,
    \"costPrice\": 10000,
    \"sku\": \"AUD-SPK-001\",
    \"stock\": 18,
    \"lowStockThreshold\": 3,
    \"trackInventory\": true,
    \"categoryId\": \"$CAT_AUDIO\",
    \"isActive\": true,
    \"isFeatured\": true
  }" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
curl -s -X POST "$API/products/$T2/images" -H "Content-Type: application/json" -H "$AUTH2" \
  -d '{"url":"https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80","alt":"Parlante Bluetooth"}' > /dev/null

# Cargador USB-C GaN
T3=$(curl -s -X POST "$API/products" \
  -H "Content-Type: application/json" -H "$AUTH2" \
  -d "{
    \"name\": \"Cargador USB-C 65W GaN\",
    \"shortDescription\": \"Cargador rápido GaN con 3 puertos. Carga notebook y celular al mismo tiempo.\",
    \"description\": \"Cargador compacto con tecnología GaN (Nitruro de Galio) que permite una potencia de 65W en un tamaño mínimo. Compatible con notebooks, tablets, celulares y más.\n\n- 65W total (1 USB-C PD 65W + 1 USB-C PD 30W + 1 USB-A QC3.0)\n- Tecnología GaN III\n- Protección contra sobrecarga\n- Compatible con iPhone, Samsung, MacBook, iPad\n- Enchufe plegable\",
    \"price\": 19990,
    \"costPrice\": 8000,
    \"sku\": \"CAR-GAN-65W\",
    \"stock\": 30,
    \"lowStockThreshold\": 5,
    \"trackInventory\": true,
    \"categoryId\": \"$CAT_CARGA\",
    \"isActive\": true,
    \"isFeatured\": true
  }" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
curl -s -X POST "$API/products/$T3/images" -H "Content-Type: application/json" -H "$AUTH2" \
  -d '{"url":"https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80","alt":"Cargador GaN 65W"}' > /dev/null

# Cable USB-C
T4=$(curl -s -X POST "$API/products" \
  -H "Content-Type: application/json" -H "$AUTH2" \
  -d "{
    \"name\": \"Cable USB-C a USB-C 100W 2m\",
    \"shortDescription\": \"Cable USB-C trenzado de nylon, soporta 100W PD y 480Mbps.\",
    \"description\": \"Cable USB-C a USB-C de 2 metros con cubierta de nylon trenzado para máxima durabilidad. Soporta hasta 100W de carga rápida PD y transferencia a 480Mbps.\",
    \"price\": 5990,
    \"costPrice\": 1800,
    \"sku\": \"CAB-CC-2M\",
    \"stock\": 100,
    \"lowStockThreshold\": 15,
    \"trackInventory\": true,
    \"categoryId\": \"$CAT_CARGA\",
    \"isActive\": true
  }" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
curl -s -X POST "$API/products/$T4/images" -H "Content-Type: application/json" -H "$AUTH2" \
  -d '{"url":"https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80","alt":"Cable USB-C"}' > /dev/null

# Power Bank
T5=$(curl -s -X POST "$API/products" \
  -H "Content-Type: application/json" -H "$AUTH2" \
  -d "{
    \"name\": \"Power Bank 20000mAh PD 22.5W\",
    \"shortDescription\": \"Batería externa de 20000mAh con carga rápida. Carga tu celular 4 veces.\",
    \"description\": \"Power bank de alta capacidad con carga rápida bidireccional. Display LED que muestra la carga restante.\n\n- 20000mAh\n- USB-C PD 22.5W (entrada y salida)\n- USB-A QC3.0\n- Display LED\n- Carga 2 dispositivos a la vez\n- Peso: 380g\",
    \"price\": 15990,
    \"compareAtPrice\": 19990,
    \"costPrice\": 6000,
    \"sku\": \"BAT-PB-20K\",
    \"stock\": 22,
    \"lowStockThreshold\": 5,
    \"trackInventory\": true,
    \"categoryId\": \"$CAT_CARGA\",
    \"isActive\": true
  }" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
curl -s -X POST "$API/products/$T5/images" -H "Content-Type: application/json" -H "$AUTH2" \
  -d '{"url":"https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80","alt":"Power bank 20000mAh"}' > /dev/null

# Funda iPhone
T6=$(curl -s -X POST "$API/products" \
  -H "Content-Type: application/json" -H "$AUTH2" \
  -d "{
    \"name\": \"Funda Silicona iPhone 15/16\",
    \"shortDescription\": \"Funda de silicona suave con interior de microfibra. Tacto premium.\",
    \"description\": \"Funda de silicona líquida con interior de microfibra que protege tu iPhone de rayones. Compatible con carga inalámbrica MagSafe.\",
    \"price\": 6990,
    \"costPrice\": 2000,
    \"sku\": \"FUN-IPH-SIL\",
    \"stock\": 60,
    \"lowStockThreshold\": 10,
    \"trackInventory\": true,
    \"categoryId\": \"$CAT_FUNDAS\",
    \"isActive\": true
  }" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
curl -s -X POST "$API/products/$T6/images" -H "Content-Type: application/json" -H "$AUTH2" \
  -d '{"url":"https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80","alt":"Funda iPhone silicona"}' > /dev/null
curl -s -X POST "$API/products/$T6/variants" -H "Content-Type: application/json" -H "$AUTH2" \
  -d '{"name":"Color","value":"Negro","stock":20}' > /dev/null
curl -s -X POST "$API/products/$T6/variants" -H "Content-Type: application/json" -H "$AUTH2" \
  -d '{"name":"Color","value":"Azul Pacífico","stock":15}' > /dev/null
curl -s -X POST "$API/products/$T6/variants" -H "Content-Type: application/json" -H "$AUTH2" \
  -d '{"name":"Color","value":"Rosa Arena","stock":12}' > /dev/null
curl -s -X POST "$API/products/$T6/variants" -H "Content-Type: application/json" -H "$AUTH2" \
  -d '{"name":"Color","value":"Verde Menta","stock":13}' > /dev/null

# Luz LED inteligente
T7=$(curl -s -X POST "$API/products" \
  -H "Content-Type: application/json" -H "$AUTH2" \
  -d "{
    \"name\": \"Lámpara LED Inteligente WiFi\",
    \"shortDescription\": \"Lámpara E27 WiFi con 16 millones de colores. Compatible con Alexa y Google.\",
    \"description\": \"Lámpara LED inteligente con conexión WiFi directa (no necesita hub). Controlá desde el celular o con voz vía Alexa o Google Home.\n\n- E27\n- 9W (equivale a 60W)\n- 16 millones de colores RGB\n- Blanco cálido a frío (2700K-6500K)\n- Programá horarios y escenas\n- App gratuita\",
    \"price\": 4990,
    \"costPrice\": 1500,
    \"sku\": \"SMH-LED-001\",
    \"stock\": 80,
    \"lowStockThreshold\": 15,
    \"trackInventory\": true,
    \"categoryId\": \"$CAT_SMART\",
    \"isActive\": true
  }" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
curl -s -X POST "$API/products/$T7/images" -H "Content-Type: application/json" -H "$AUTH2" \
  -d '{"url":"https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80","alt":"Lámpara LED WiFi"}' > /dev/null

# Enchufe inteligente
T8=$(curl -s -X POST "$API/products" \
  -H "Content-Type: application/json" -H "$AUTH2" \
  -d "{
    \"name\": \"Enchufe Inteligente WiFi\",
    \"shortDescription\": \"Controlá tus electrodomésticos desde el celular. Timer y consumo.\",
    \"description\": \"Enchufe inteligente WiFi que te permite prender y apagar cualquier electrodoméstico desde tu celular. Incluye medición de consumo en tiempo real.\n\n- WiFi 2.4GHz\n- 16A máximo\n- Timer y programación\n- Medición de consumo\n- Compatible con Alexa y Google Home\",
    \"price\": 7990,
    \"costPrice\": 2800,
    \"sku\": \"SMH-PLG-001\",
    \"stock\": 45,
    \"lowStockThreshold\": 10,
    \"trackInventory\": true,
    \"categoryId\": \"$CAT_SMART\",
    \"isActive\": true
  }" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
curl -s -X POST "$API/products/$T8/images" -H "Content-Type: application/json" -H "$AUTH2" \
  -d '{"url":"https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=800&q=80","alt":"Enchufe inteligente"}' > /dev/null

# Mouse Gaming
T9=$(curl -s -X POST "$API/products" \
  -H "Content-Type: application/json" -H "$AUTH2" \
  -d "{
    \"name\": \"Mouse Gaming RGB 12000 DPI\",
    \"shortDescription\": \"Mouse gaming con sensor óptico de 12000 DPI y 7 botones programables.\",
    \"description\": \"Mouse gaming ergonómico con sensor óptico de alta precisión. Perfecto para FPS y MOBA.\n\n- Sensor óptico 12000 DPI (ajustable)\n- 7 botones programables\n- RGB personalizable (16.8M colores)\n- Polling rate: 1000Hz\n- Cable trenzado de 1.8m\n- Software de configuración incluido\n- Peso: 95g\",
    \"price\": 12990,
    \"compareAtPrice\": 16990,
    \"costPrice\": 5000,
    \"sku\": \"GAM-MOU-001\",
    \"stock\": 15,
    \"lowStockThreshold\": 3,
    \"trackInventory\": true,
    \"categoryId\": \"$CAT_GAMING\",
    \"isActive\": true,
    \"isFeatured\": true
  }" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
curl -s -X POST "$API/products/$T9/images" -H "Content-Type: application/json" -H "$AUTH2" \
  -d '{"url":"https://images.unsplash.com/photo-1527814050087-3793815479db?w=800&q=80","alt":"Mouse gaming RGB"}' > /dev/null

# Teclado Mecánico
T10=$(curl -s -X POST "$API/products" \
  -H "Content-Type: application/json" -H "$AUTH2" \
  -d "{
    \"name\": \"Teclado Mecánico 65% RGB\",
    \"shortDescription\": \"Teclado mecánico compacto 65% con switches hot-swappable y RGB.\",
    \"description\": \"Teclado mecánico formato 65% (67 teclas) con switches mecánicos hot-swappable. Podés cambiar los switches sin soldar.\n\n- Switches: Gateron (Red/Blue/Brown)\n- Hot-swappable\n- RGB por tecla\n- PBT doubleshot keycaps\n- USB-C desmontable\n- Gasket mount\n- Foam de silencio incluido\",
    \"price\": 29990,
    \"costPrice\": 12000,
    \"sku\": \"GAM-KEY-65\",
    \"stock\": 8,
    \"lowStockThreshold\": 3,
    \"trackInventory\": true,
    \"categoryId\": \"$CAT_GAMING\",
    \"isActive\": true
  }" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
curl -s -X POST "$API/products/$T10/images" -H "Content-Type: application/json" -H "$AUTH2" \
  -d '{"url":"https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&q=80","alt":"Teclado mecánico 65%"}' > /dev/null
curl -s -X POST "$API/products/$T10/variants" -H "Content-Type: application/json" -H "$AUTH2" \
  -d '{"name":"Switch","value":"Red (Lineal)","stock":3}' > /dev/null
curl -s -X POST "$API/products/$T10/variants" -H "Content-Type: application/json" -H "$AUTH2" \
  -d '{"name":"Switch","value":"Blue (Clicky)","stock":2}' > /dev/null
curl -s -X POST "$API/products/$T10/variants" -H "Content-Type: application/json" -H "$AUTH2" \
  -d '{"name":"Switch","value":"Brown (Táctil)","stock":3}' > /dev/null

# Pad XL
T11=$(curl -s -X POST "$API/products" \
  -H "Content-Type: application/json" -H "$AUTH2" \
  -d "{
    \"name\": \"Mousepad XL Desk Mat 80x30\",
    \"shortDescription\": \"Mousepad extendido para escritorio completo. Base antideslizante.\",
    \"description\": \"Mousepad XL de 80x30cm que cubre todo tu escritorio. Superficie de microfibra optimizada para cualquier tipo de sensor.\n\n- 800 x 300 x 4mm\n- Bordes cosidos\n- Base de goma antideslizante\n- Lavable\",
    \"price\": 8990,
    \"costPrice\": 3000,
    \"sku\": \"GAM-PAD-XL\",
    \"stock\": 35,
    \"lowStockThreshold\": 5,
    \"trackInventory\": true,
    \"categoryId\": \"$CAT_GAMING\",
    \"isActive\": true
  }" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
curl -s -X POST "$API/products/$T11/images" -H "Content-Type: application/json" -H "$AUTH2" \
  -d '{"url":"https://images.unsplash.com/photo-1616588589676-62b3d4ff6a10?w=800&q=80","alt":"Mousepad XL"}' > /dev/null

# Producto próximamente (inactivo)
T12=$(curl -s -X POST "$API/products" \
  -H "Content-Type: application/json" -H "$AUTH2" \
  -d "{
    \"name\": \"Webcam 4K con Tracking AI\",
    \"shortDescription\": \"Webcam 4K con seguimiento facial AI. Próximamente.\",
    \"description\": \"Webcam 4K con tracking facial por inteligencia artificial.\",
    \"price\": 39990,
    \"sku\": \"GAM-CAM-4K\",
    \"stock\": 0,
    \"trackInventory\": true,
    \"categoryId\": \"$CAT_GAMING\",
    \"isActive\": false
  }" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

echo "  TechStore BA: 12 products created"

# =============================================================================
# CREATE ORDERS & HISTORY (Direct DB inserts)
# =============================================================================
echo ""
echo "=== Creating Orders & Sales History ==="

# Get tenant IDs from tokens
TENANT1_ID=$(curl -s "$API/tenants/current" -H "$AUTH1" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
TENANT2_ID=$(curl -s "$API/tenants/current" -H "$AUTH2" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

echo "  Tenant 1 (Moda): $TENANT1_ID"
echo "  Tenant 2 (Tech): $TENANT2_ID"

# Insert orders directly via SQL for realistic history
PGPASSWORD=$(grep DATABASE_URL /var/www/turnolink/backend/apps/api/.env | sed 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/' | head -1)
PGUSER=$(grep DATABASE_URL /var/www/turnolink/backend/apps/api/.env | sed 's/.*:\/\/\([^:]*\):.*/\1/' | head -1)
PGDB=$(grep DATABASE_URL /var/www/turnolink/backend/apps/api/.env | sed 's/.*\/\([^?]*\).*/\1/' | head -1)

echo "  Inserting orders via SQL..."

psql -U "$PGUSER" -d "$PGDB" -h localhost <<EOSQL

-- ─── ORDERS FOR MODA URBANA ────────────────────────────────
-- Get some product IDs
DO \$\$
DECLARE
  t1_id TEXT := '$TENANT1_ID';
  t2_id TEXT := '$TENANT2_ID';
  p_id TEXT;
  o_id TEXT;
  oi_id TEXT;
  pay_id TEXT;
BEGIN
  -- Order 1: Moda Urbana — Completed order
  o_id := gen_random_uuid()::TEXT;
  INSERT INTO orders (id, "tenantId", "orderNumber", "customerEmail", "customerPhone", "customerName", status, subtotal, "shippingCost", discount, tax, total, notes, "createdAt", "updatedAt")
  VALUES (o_id, t1_id, 'MU-001', 'sofia@gmail.com', '+5491122334455', 'Sofía Martínez', 'DELIVERED', 33980, 0, 0, 0, 33980, 'Enviar por Correo Argentino', NOW() - INTERVAL '7 days', NOW() - INTERVAL '2 days');

  SELECT id INTO p_id FROM products WHERE "tenantId" = t1_id AND sku = 'REM-OVR-001' LIMIT 1;
  INSERT INTO order_items (id, "orderId", "productId", "productName", "sku", quantity, "unitPrice", "totalPrice", "createdAt")
  VALUES (gen_random_uuid()::TEXT, o_id, p_id, 'Remera Oversize Algodón', 'REM-OVR-001', 2, 8990, 17980, NOW() - INTERVAL '7 days');

  SELECT id INTO p_id FROM products WHERE "tenantId" = t1_id AND sku = 'BUZ-HOD-001' LIMIT 1;
  INSERT INTO order_items (id, "orderId", "productId", "productName", "sku", quantity, "unitPrice", "totalPrice", "createdAt")
  VALUES (gen_random_uuid()::TEXT, o_id, p_id, 'Buzo Oversize Hoodie', 'BUZ-HOD-001', 1, 24990, 24990, NOW() - INTERVAL '7 days');

  -- Ajustar total = items reales
  UPDATE orders SET subtotal = 42970, total = 42970 WHERE id = o_id;

  INSERT INTO order_status_history (id, "orderId", status, note, "createdAt")
  VALUES (gen_random_uuid()::TEXT, o_id, 'PENDING', 'Orden creada', NOW() - INTERVAL '7 days'),
         (gen_random_uuid()::TEXT, o_id, 'CONFIRMED', 'Pago confirmado por WhatsApp', NOW() - INTERVAL '6 days'),
         (gen_random_uuid()::TEXT, o_id, 'SHIPPED', 'Enviado por Correo Argentino - Tracking: CP123456789AR', NOW() - INTERVAL '4 days'),
         (gen_random_uuid()::TEXT, o_id, 'DELIVERED', 'Entregado', NOW() - INTERVAL '2 days');

  INSERT INTO payments (id, "orderId", amount, currency, status, "paymentMethod", "payerEmail", "payerName", "paidAt", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::TEXT, o_id, 42970, 'ARS', 'APPROVED', 'Transferencia', 'sofia@gmail.com', 'Sofía Martínez', NOW() - INTERVAL '6 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days');

  -- Order 2: Moda Urbana — Confirmed, being prepared
  o_id := gen_random_uuid()::TEXT;
  INSERT INTO orders (id, "tenantId", "orderNumber", "customerEmail", "customerPhone", "customerName", status, subtotal, "shippingCost", discount, tax, total, "createdAt", "updatedAt")
  VALUES (o_id, t1_id, 'MU-002', 'lucas@hotmail.com', '+5491133445566', 'Lucas Fernández', 'CONFIRMED', 29990, 1500, 0, 0, 31490, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day');

  SELECT id INTO p_id FROM products WHERE "tenantId" = t1_id AND sku = 'PAN-CRG-001' LIMIT 1;
  INSERT INTO order_items (id, "orderId", "productId", "productName", "sku", quantity, "unitPrice", "totalPrice", "createdAt")
  VALUES (gen_random_uuid()::TEXT, o_id, p_id, 'Jean Cargo Wide Leg', 'PAN-CRG-001', 1, 29990, 29990, NOW() - INTERVAL '2 days');

  INSERT INTO order_status_history (id, "orderId", status, note, "createdAt")
  VALUES (gen_random_uuid()::TEXT, o_id, 'PENDING', 'Orden creada', NOW() - INTERVAL '2 days'),
         (gen_random_uuid()::TEXT, o_id, 'CONFIRMED', 'Pago recibido', NOW() - INTERVAL '1 day');

  INSERT INTO payments (id, "orderId", amount, currency, status, "paymentMethod", "payerEmail", "payerName", "paidAt", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::TEXT, o_id, 31490, 'ARS', 'APPROVED', 'MercadoPago', 'lucas@hotmail.com', 'Lucas Fernández', NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day');

  -- Order 3: Moda Urbana — Pending payment
  o_id := gen_random_uuid()::TEXT;
  INSERT INTO orders (id, "tenantId", "orderNumber", "customerEmail", "customerPhone", "customerName", status, subtotal, "shippingCost", discount, tax, total, "createdAt", "updatedAt")
  VALUES (o_id, t1_id, 'MU-003', 'camila@yahoo.com', '+5491144556677', 'Camila Ruiz', 'PENDING', 19980, 0, 0, 0, 19980, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours');

  SELECT id INTO p_id FROM products WHERE "tenantId" = t1_id AND sku = 'ACC-RIN-001' LIMIT 1;
  INSERT INTO order_items (id, "orderId", "productId", "productName", "sku", quantity, "unitPrice", "totalPrice", "createdAt")
  VALUES (gen_random_uuid()::TEXT, o_id, p_id, 'Riñonera Impermeable', 'ACC-RIN-001', 2, 9990, 19980, NOW() - INTERVAL '4 hours');

  INSERT INTO order_status_history (id, "orderId", status, note, "createdAt")
  VALUES (gen_random_uuid()::TEXT, o_id, 'PENDING', 'Orden creada — esperando pago', NOW() - INTERVAL '4 hours');

  -- Order 4: Moda Urbana — Older delivered order
  o_id := gen_random_uuid()::TEXT;
  INSERT INTO orders (id, "tenantId", "orderNumber", "customerEmail", "customerPhone", "customerName", status, subtotal, "shippingCost", discount, tax, total, "createdAt", "updatedAt")
  VALUES (o_id, t1_id, 'MU-004', 'martin@gmail.com', '+5491155667788', 'Martín Gómez', 'DELIVERED', 53970, 0, 0, 0, 53970, NOW() - INTERVAL '14 days', NOW() - INTERVAL '9 days');

  SELECT id INTO p_id FROM products WHERE "tenantId" = t1_id AND sku = 'CAM-BOM-001' LIMIT 1;
  INSERT INTO order_items (id, "orderId", "productId", "productName", "sku", quantity, "unitPrice", "totalPrice", "createdAt")
  VALUES (gen_random_uuid()::TEXT, o_id, p_id, 'Campera Bomber Edición Limitada', 'CAM-BOM-001', 1, 45990, 45990, NOW() - INTERVAL '14 days');

  SELECT id INTO p_id FROM products WHERE "tenantId" = t1_id AND sku = 'ACC-GOR-001' LIMIT 1;
  INSERT INTO order_items (id, "orderId", "productId", "productName", "sku", quantity, "unitPrice", "totalPrice", "createdAt")
  VALUES (gen_random_uuid()::TEXT, o_id, p_id, 'Gorra Snapback Bordada', 'ACC-GOR-001', 1, 7990, 7990, NOW() - INTERVAL '14 days');

  INSERT INTO order_status_history (id, "orderId", status, note, "createdAt")
  VALUES (gen_random_uuid()::TEXT, o_id, 'PENDING', 'Orden creada', NOW() - INTERVAL '14 days'),
         (gen_random_uuid()::TEXT, o_id, 'CONFIRMED', 'Pago confirmado', NOW() - INTERVAL '13 days'),
         (gen_random_uuid()::TEXT, o_id, 'SHIPPED', 'Enviado', NOW() - INTERVAL '11 days'),
         (gen_random_uuid()::TEXT, o_id, 'DELIVERED', 'Entregado', NOW() - INTERVAL '9 days');

  INSERT INTO payments (id, "orderId", amount, currency, status, "paymentMethod", "payerEmail", "payerName", "paidAt", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::TEXT, o_id, 53970, 'ARS', 'APPROVED', 'Transferencia', 'martin@gmail.com', 'Martín Gómez', NOW() - INTERVAL '13 days', NOW() - INTERVAL '14 days', NOW() - INTERVAL '13 days');

  -- ─── ORDERS FOR TECHSTORE BA ─────────────────────────────
  -- Order 1: TechStore — Delivered
  o_id := gen_random_uuid()::TEXT;
  INSERT INTO orders (id, "tenantId", "orderNumber", "customerEmail", "customerPhone", "customerName", status, subtotal, "shippingCost", discount, tax, total, "createdAt", "updatedAt")
  VALUES (o_id, t2_id, 'TS-001', 'pedro@gmail.com', '+5491166778899', 'Pedro Sánchez', 'DELIVERED', 54980, 2500, 0, 0, 57480, NOW() - INTERVAL '10 days', NOW() - INTERVAL '5 days');

  SELECT id INTO p_id FROM products WHERE "tenantId" = t2_id AND sku = 'AUD-TWS-PRO' LIMIT 1;
  INSERT INTO order_items (id, "orderId", "productId", "productName", "sku", quantity, "unitPrice", "totalPrice", "createdAt")
  VALUES (gen_random_uuid()::TEXT, o_id, p_id, 'Auriculares Bluetooth TWS Pro', 'AUD-TWS-PRO', 1, 34990, 34990, NOW() - INTERVAL '10 days');

  SELECT id INTO p_id FROM products WHERE "tenantId" = t2_id AND sku = 'CAR-GAN-65W' LIMIT 1;
  INSERT INTO order_items (id, "orderId", "productId", "productName", "sku", quantity, "unitPrice", "totalPrice", "createdAt")
  VALUES (gen_random_uuid()::TEXT, o_id, p_id, 'Cargador USB-C 65W GaN', 'CAR-GAN-65W', 1, 19990, 19990, NOW() - INTERVAL '10 days');

  INSERT INTO order_status_history (id, "orderId", status, note, "createdAt")
  VALUES (gen_random_uuid()::TEXT, o_id, 'PENDING', 'Orden creada', NOW() - INTERVAL '10 days'),
         (gen_random_uuid()::TEXT, o_id, 'CONFIRMED', 'Pago aprobado por MercadoPago', NOW() - INTERVAL '10 days'),
         (gen_random_uuid()::TEXT, o_id, 'SHIPPED', 'Enviado por Andreani - AR123456', NOW() - INTERVAL '7 days'),
         (gen_random_uuid()::TEXT, o_id, 'DELIVERED', 'Entregado', NOW() - INTERVAL '5 days');

  INSERT INTO payments (id, "orderId", amount, currency, status, "paymentMethod", "paymentType", "payerEmail", "payerName", "paidAt", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::TEXT, o_id, 57480, 'ARS', 'APPROVED', 'credit_card', 'visa', 'pedro@gmail.com', 'Pedro Sánchez', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days');

  -- Order 2: TechStore — Shipped
  o_id := gen_random_uuid()::TEXT;
  INSERT INTO orders (id, "tenantId", "orderNumber", "customerEmail", "customerPhone", "customerName", status, subtotal, "shippingCost", discount, tax, total, "createdAt", "updatedAt")
  VALUES (o_id, t2_id, 'TS-002', 'ana@outlook.com', '+5491177889900', 'Ana Torres', 'SHIPPED', 42980, 0, 0, 0, 42980, NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day');

  SELECT id INTO p_id FROM products WHERE "tenantId" = t2_id AND sku = 'GAM-MOU-001' LIMIT 1;
  INSERT INTO order_items (id, "orderId", "productId", "productName", "sku", quantity, "unitPrice", "totalPrice", "createdAt")
  VALUES (gen_random_uuid()::TEXT, o_id, p_id, 'Mouse Gaming RGB 12000 DPI', 'GAM-MOU-001', 1, 12990, 12990, NOW() - INTERVAL '3 days');

  SELECT id INTO p_id FROM products WHERE "tenantId" = t2_id AND sku = 'GAM-KEY-65' LIMIT 1;
  INSERT INTO order_items (id, "orderId", "productId", "productName", "sku", quantity, "unitPrice", "totalPrice", "createdAt")
  VALUES (gen_random_uuid()::TEXT, o_id, p_id, 'Teclado Mecánico 65% RGB', 'GAM-KEY-65', 1, 29990, 29990, NOW() - INTERVAL '3 days');

  INSERT INTO order_status_history (id, "orderId", status, note, "createdAt")
  VALUES (gen_random_uuid()::TEXT, o_id, 'PENDING', 'Orden creada', NOW() - INTERVAL '3 days'),
         (gen_random_uuid()::TEXT, o_id, 'CONFIRMED', 'Pago aprobado', NOW() - INTERVAL '3 days'),
         (gen_random_uuid()::TEXT, o_id, 'SHIPPED', 'Enviado por OCA - OC456789', NOW() - INTERVAL '1 day');

  INSERT INTO payments (id, "orderId", amount, currency, status, "paymentMethod", "paymentType", "payerEmail", "payerName", "paidAt", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::TEXT, o_id, 42980, 'ARS', 'APPROVED', 'debit_card', 'maestro', 'ana@outlook.com', 'Ana Torres', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days');

  -- Order 3: TechStore — Pending
  o_id := gen_random_uuid()::TEXT;
  INSERT INTO orders (id, "tenantId", "orderNumber", "customerEmail", "customerPhone", "customerName", status, subtotal, "shippingCost", discount, tax, total, "createdAt", "updatedAt")
  VALUES (o_id, t2_id, 'TS-003', 'jorge@gmail.com', '+5491188990011', 'Jorge López', 'PENDING', 15990, 1500, 0, 0, 17490, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours');

  SELECT id INTO p_id FROM products WHERE "tenantId" = t2_id AND sku = 'BAT-PB-20K' LIMIT 1;
  INSERT INTO order_items (id, "orderId", "productId", "productName", "sku", quantity, "unitPrice", "totalPrice", "createdAt")
  VALUES (gen_random_uuid()::TEXT, o_id, p_id, 'Power Bank 20000mAh PD 22.5W', 'BAT-PB-20K', 1, 15990, 15990, NOW() - INTERVAL '6 hours');

  INSERT INTO order_status_history (id, "orderId", status, note, "createdAt")
  VALUES (gen_random_uuid()::TEXT, o_id, 'PENDING', 'Esperando pago', NOW() - INTERVAL '6 hours');

  -- Order 4: TechStore — Cancelled
  o_id := gen_random_uuid()::TEXT;
  INSERT INTO orders (id, "tenantId", "orderNumber", "customerEmail", "customerPhone", "customerName", status, subtotal, "shippingCost", discount, tax, total, "createdAt", "updatedAt")
  VALUES (o_id, t2_id, 'TS-004', 'maria@yahoo.com', '+5491199001122', 'María García', 'CANCELLED', 6990, 0, 0, 0, 6990, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days');

  SELECT id INTO p_id FROM products WHERE "tenantId" = t2_id AND sku = 'FUN-IPH-SIL' LIMIT 1;
  INSERT INTO order_items (id, "orderId", "productId", "productName", "sku", quantity, "unitPrice", "totalPrice", "createdAt")
  VALUES (gen_random_uuid()::TEXT, o_id, p_id, 'Funda Silicona iPhone 15/16', 'FUN-IPH-SIL', 1, 6990, 6990, NOW() - INTERVAL '5 days');

  INSERT INTO order_status_history (id, "orderId", status, note, "createdAt")
  VALUES (gen_random_uuid()::TEXT, o_id, 'PENDING', 'Orden creada', NOW() - INTERVAL '5 days'),
         (gen_random_uuid()::TEXT, o_id, 'CANCELLED', 'Cliente canceló — cambio de opinión', NOW() - INTERVAL '4 days');

  -- Order 5: TechStore — Delivered (older)
  o_id := gen_random_uuid()::TEXT;
  INSERT INTO orders (id, "tenantId", "orderNumber", "customerEmail", "customerPhone", "customerName", status, subtotal, "shippingCost", discount, tax, total, "createdAt", "updatedAt")
  VALUES (o_id, t2_id, 'TS-005', 'roberto@live.com', '+5491100112233', 'Roberto Díaz', 'DELIVERED', 22970, 0, 0, 0, 22970, NOW() - INTERVAL '20 days', NOW() - INTERVAL '15 days');

  SELECT id INTO p_id FROM products WHERE "tenantId" = t2_id AND sku = 'AUD-SPK-001' LIMIT 1;
  INSERT INTO order_items (id, "orderId", "productId", "productName", "sku", quantity, "unitPrice", "totalPrice", "createdAt")
  VALUES (gen_random_uuid()::TEXT, o_id, p_id, 'Parlante Bluetooth Portátil 20W', 'AUD-SPK-001', 1, 24990, 24990, NOW() - INTERVAL '20 days');

  UPDATE orders SET subtotal = 24990, total = 24990 WHERE id = o_id;

  INSERT INTO order_status_history (id, "orderId", status, note, "createdAt")
  VALUES (gen_random_uuid()::TEXT, o_id, 'PENDING', 'Orden creada', NOW() - INTERVAL '20 days'),
         (gen_random_uuid()::TEXT, o_id, 'CONFIRMED', 'Pago aprobado', NOW() - INTERVAL '20 days'),
         (gen_random_uuid()::TEXT, o_id, 'SHIPPED', 'Enviado', NOW() - INTERVAL '18 days'),
         (gen_random_uuid()::TEXT, o_id, 'DELIVERED', 'Entregado', NOW() - INTERVAL '15 days');

  INSERT INTO payments (id, "orderId", amount, currency, status, "paymentMethod", "payerEmail", "payerName", "paidAt", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::TEXT, o_id, 24990, 'ARS', 'APPROVED', 'account_money', 'roberto@live.com', 'Roberto Díaz', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days');

  RAISE NOTICE 'Orders created successfully!';
END \$\$;

EOSQL

echo ""
echo "=== DONE ==="
echo ""
echo "Demo accounts created:"
echo ""
echo "┌────────────────────────────────────────────────────────────────┐"
echo "│ MODA URBANA BA (Catálogo WhatsApp)                           │"
echo "│ Email:    demo-moda@turnolink.com.ar                         │"
echo "│ Password: Demo2026Moda!                                      │"
echo "│ Store:    turnolink.com.ar/moda-urbana-ba                    │"
echo "│ Products: 10 (9 active + 1 inactive)                        │"
echo "│ Categories: 4 (Remeras, Buzos, Pantalones, Accesorios)      │"
echo "│ Orders: 4 (2 delivered, 1 confirmed, 1 pending)             │"
echo "├────────────────────────────────────────────────────────────────┤"
echo "│ TECHSTORE BA (E-commerce)                                     │"
echo "│ Email:    demo-tech@turnolink.com.ar                         │"
echo "│ Password: Demo2026Tech!                                      │"
echo "│ Store:    turnolink.com.ar/techstore-ba                      │"
echo "│ Products: 12 (11 active + 1 inactive)                       │"
echo "│ Categories: 5 (Audio, Carga, Fundas, Smart Home, Gaming)    │"
echo "│ Orders: 5 (2 delivered, 1 shipped, 1 pending, 1 cancelled)  │"
echo "└────────────────────────────────────────────────────────────────┘"
