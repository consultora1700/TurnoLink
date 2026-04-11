#!/usr/bin/env node
/**
 * Migrate Imola Autos vehicle images to demo tenant.
 * Downloads from imolaautos.com, processes with Sharp (WebP + JPEG + thumb), saves locally.
 */

const apiDir = require('path').join(__dirname, '..', 'apps', 'api');
const sharp = require(require.resolve('sharp', { paths: [apiDir] }));
const { v4: uuidv4 } = require(require.resolve('uuid', { paths: [apiDir] }));
const path = require('path');
const fs = require('fs/promises');
const https = require('https');
const http = require('http');

const TENANT_ID = 'd762f52e-fff2-4d70-a063-fbdac0788a70';
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', TENANT_ID, 'products');
const API_URL = 'https://api.turnolink.com.ar';
const DB_CONN = {
  host: '127.0.0.1',
  user: 'turnolink_user',
  password: 'Tp6l5MpvJKYEVRDzJCDjRdghKqqBpdX01w9e9S3V4UU=',
  database: 'turnolink_db',
};

// Map product IDs to image galleries from imolaautos.com
// Each entry: [productId, [array of image URLs]]
// We limit to 5 images per product to keep storage reasonable
const PRODUCT_IMAGES = {
  // Honda HR-V 1.8 EX CVT
  'a1000000-0013-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1774443891-IMG_2756.JPG',
    'https://imolaautos.com/storage/vehicles/1774443891-IMG_2754.JPG',
    'https://imolaautos.com/storage/vehicles/1774443891-IMG_2752.JPG',
    'https://imolaautos.com/storage/vehicles/1774443891-IMG_2749.JPG',
    'https://imolaautos.com/storage/vehicles/1774443893-IMG_2734.JPG',
  ],
  // VW Vento 2.0T GLI DSG
  'a1000000-0001-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1773858788-IMG_2587.JPG',
    'https://imolaautos.com/storage/vehicles/1773858789-IMG_2589.JPG',
    'https://imolaautos.com/storage/vehicles/1773858788-IMG_2595.JPG',
    'https://imolaautos.com/storage/vehicles/1773858785-IMG_2580.JPG',
    'https://imolaautos.com/storage/vehicles/1773858788-IMG_2565.JPG',
  ],
  // Toyota Corolla Cross 2.0 XEI CVT
  'a1000000-0014-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1773761652-IMG_2525.JPG',
    'https://imolaautos.com/storage/vehicles/1773761652-IMG_2524.JPG',
    'https://imolaautos.com/storage/vehicles/1773761652-IMG_2522.JPG',
    'https://imolaautos.com/storage/vehicles/1773761654-IMG_2531.JPG',
    'https://imolaautos.com/storage/vehicles/1773761656-IMG_2501.JPG',
  ],
  // Mercedes-Benz A 200 1.3 Style AT
  'a1000000-0049-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1773339420-IMG_2334.JPG',
    'https://imolaautos.com/storage/vehicles/1773339420-IMG_2331.JPG',
    'https://imolaautos.com/storage/vehicles/1773339420-IMG_2327.JPG',
    'https://imolaautos.com/storage/vehicles/1773339420-IMG_2337.JPG',
    'https://imolaautos.com/storage/vehicles/1773339429-IMG_2305.JPG',
  ],
  // Jeep Compass 1.3T Limited AT (8940)
  'a1000000-0020-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1773762964-IMG_2426.JPG',
    'https://imolaautos.com/storage/vehicles/1773762964-IMG_2423.JPG',
    'https://imolaautos.com/storage/vehicles/1773762964-IMG_2420.JPG',
    'https://imolaautos.com/storage/vehicles/1773762964-IMG_2430.JPG',
    'https://imolaautos.com/storage/vehicles/1773762966-IMG_2403.JPG',
  ],
  // BAIC X55 1.5T Honor CVT (8939)
  'a1000000-0023-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1773764031-IMG_2392.JPG',
    'https://imolaautos.com/storage/vehicles/1773764031-IMG_2391.JPG',
    'https://imolaautos.com/storage/vehicles/1773764031-IMG_2388.JPG',
    'https://imolaautos.com/storage/vehicles/1773764031-IMG_2400.JPG',
    'https://imolaautos.com/storage/vehicles/1773764036-IMG_2371.JPG',
  ],
  // Ford Ranger 3.0 TDI V6 XLS 4x4 AT
  'a1000000-0029-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1774290183-IMG_2685.JPG',
    'https://imolaautos.com/storage/vehicles/1774290183-IMG_2684.JPG',
    'https://imolaautos.com/storage/vehicles/1774290183-IMG_2681.JPG',
    'https://imolaautos.com/storage/vehicles/1774290183-IMG_2687.JPG',
    'https://imolaautos.com/storage/vehicles/1774290182-IMG_2662.JPG',
  ],
  // Peugeot 208 1.0T GT 2025 (8935)
  'a1000000-0041-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1774444848-IMG_2723.JPG',
    'https://imolaautos.com/storage/vehicles/1774444849-IMG_2718.JPG',
    'https://imolaautos.com/storage/vehicles/1774444849-IMG_2715.JPG',
    'https://imolaautos.com/storage/vehicles/1774444849-IMG_2728.JPG',
    'https://imolaautos.com/storage/vehicles/1774444849-IMG_2694.JPG',
  ],
  // Ford Territory 1.8 Titanium 2024 (8934)
  'a1000000-0042-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1773233231-IMG_2188.JPG',
    'https://imolaautos.com/storage/vehicles/1773233230-IMG_2186.JPG',
    'https://imolaautos.com/storage/vehicles/1773233231-IMG_2184.JPG',
    'https://imolaautos.com/storage/vehicles/1773233231-IMG_2192.JPG',
    'https://imolaautos.com/storage/vehicles/1773233239-IMG_2165.JPG',
  ],
  // VW Fox 1.6 Highline
  'a1000000-0003-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1774011540-IMG_2556.JPG',
    'https://imolaautos.com/storage/vehicles/1774011539-IMG_2555.JPG',
    'https://imolaautos.com/storage/vehicles/1774011541-IMG_2553.JPG',
    'https://imolaautos.com/storage/vehicles/1774011541-IMG_2561.JPG',
    'https://imolaautos.com/storage/vehicles/1774011542-IMG_2535.JPG',
  ],
  // Peugeot 308 1.6 HDI Allure Nav
  'a1000000-0004-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1773673645-IMG_2292.JPG',
    'https://imolaautos.com/storage/vehicles/1773673645-IMG_2294.JPG',
    'https://imolaautos.com/storage/vehicles/1773673646-IMG_2300.JPG',
    'https://imolaautos.com/storage/vehicles/1773673645-IMG_2289.JPG',
    'https://imolaautos.com/storage/vehicles/1773673770-IMG_2280.JPG',
  ],
  // VW Suran 1.6 Comfortline
  'a1000000-0005-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1773762479-IMG_2458.JPG',
    'https://imolaautos.com/storage/vehicles/1773762478-IMG_2455.JPG',
    'https://imolaautos.com/storage/vehicles/1773762479-IMG_2452.JPG',
    'https://imolaautos.com/storage/vehicles/1773762479-IMG_2463.JPG',
    'https://imolaautos.com/storage/vehicles/1773762482-IMG_2437.JPG',
  ],
  // Peugeot 208 1.6 Active Pack AT (8924)
  'a1000000-0002-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1772892971-IMG_1986.JPG',
    'https://imolaautos.com/storage/vehicles/1772892971-IMG_1988.JPG',
    'https://imolaautos.com/storage/vehicles/1772892971-IMG_1993.JPG',
    'https://imolaautos.com/storage/vehicles/1772892971-IMG_1983.JPG',
    'https://imolaautos.com/storage/vehicles/1772892972-IMG_1972.JPG',
  ],
  // VW Gol Trend 1.6
  'a1000000-0035-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1773413281-IMG_2058.JPG',
    'https://imolaautos.com/storage/vehicles/1773413266-IMG_2055.JPG',
    'https://imolaautos.com/storage/vehicles/1773413266-IMG_2052.JPG',
    'https://imolaautos.com/storage/vehicles/1773413281-IMG_2061.JPG',
    'https://imolaautos.com/storage/vehicles/1773413245-IMG_2044.JPG',
  ],
  // Honda CR-V 2.4 LX AT
  'a1000000-0017-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1772627072-IMG_1833.JPG',
    'https://imolaautos.com/storage/vehicles/1772627072-IMG_1835.JPG',
    'https://imolaautos.com/storage/vehicles/1772627072-IMG_1843.JPG',
    'https://imolaautos.com/storage/vehicles/1772627072-IMG_1828.JPG',
    'https://imolaautos.com/storage/vehicles/1772627078-IMG_1815.JPG',
  ],
  // Honda ZR-V 2.0 Touring AT
  'a1000000-0018-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1772566390-IMG_1876.JPG',
    'https://imolaautos.com/storage/vehicles/1772566390-IMG_1874.JPG',
    'https://imolaautos.com/storage/vehicles/1772566390-IMG_1869.JPG',
    'https://imolaautos.com/storage/vehicles/1772566390-IMG_1880.JPG',
    'https://imolaautos.com/storage/vehicles/1772566392-IMG_1853.JPG',
  ],
  // VW Tiguan Allspace 1.4T DSG
  'a1000000-0019-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1772455547-IMG_1676.JPG',
    'https://imolaautos.com/storage/vehicles/1772455547-IMG_1675.JPG',
    'https://imolaautos.com/storage/vehicles/1772455547-IMG_1670.JPG',
    'https://imolaautos.com/storage/vehicles/1772455547-IMG_1680.JPG',
    'https://imolaautos.com/storage/vehicles/1772455554-IMG_1653.JPG',
  ],
  // Jeep Compass 2.4 Sport MT (8916)
  'a1000000-0015-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1772040567-1-(2).jpg',
    'https://imolaautos.com/storage/vehicles/1772040567-2-(2).jpg',
    'https://imolaautos.com/storage/vehicles/1772040567-3-(2).jpg',
    'https://imolaautos.com/storage/vehicles/1772040567-7-(2).jpg',
    'https://imolaautos.com/storage/vehicles/1772040566-14.jpg',
  ],
  // Ford Territory 1.8 Titanium AT 2025 (8915)
  'a1000000-0016-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1773760239-IMG_2490.JPG',
    'https://imolaautos.com/storage/vehicles/1773760240-IMG_2487.JPG',
    'https://imolaautos.com/storage/vehicles/1773760239-IMG_2484.JPG',
    'https://imolaautos.com/storage/vehicles/1773760239-IMG_2497.JPG',
    'https://imolaautos.com/storage/vehicles/1773760240-IMG_2466.JPG',
  ],
  // BAIC X55 Plus 1.5T Luxury DCT (8914)
  'a1000000-0022-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1771967493-1-(3).jpg',
    'https://imolaautos.com/storage/vehicles/1771967493-2-(3).jpg',
    'https://imolaautos.com/storage/vehicles/1771967493-3-(3).jpg',
    'https://imolaautos.com/storage/vehicles/1771967493-7-(3).jpg',
    'https://imolaautos.com/storage/vehicles/1771967492-9.jpg',
  ],
  // Nissan Versa 1.6 Exclusive AT (8913)
  'a1000000-0006-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1772633776-IMG_1902.JPG',
    'https://imolaautos.com/storage/vehicles/1772633776-IMG_1905.JPG',
    'https://imolaautos.com/storage/vehicles/1772633776-IMG_1909.JPG',
    'https://imolaautos.com/storage/vehicles/1772633776-IMG_1899.JPG',
    'https://imolaautos.com/storage/vehicles/1772633780-IMG_1884.JPG',
  ],
  // Chery QQ 1.0 Comfort
  'a1000000-0036-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1771871100-1-(3).jpg',
    'https://imolaautos.com/storage/vehicles/1771871100-2-(3).jpg',
    'https://imolaautos.com/storage/vehicles/1771871101-3-(3).jpg',
    'https://imolaautos.com/storage/vehicles/1771871101-7-(3).jpg',
    'https://imolaautos.com/storage/vehicles/1771871103-9.JPG',
  ],
  // Renault Duster 2.0 Privilege
  'a1000000-0025-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1772891587-IMG_1966.JPG',
    'https://imolaautos.com/storage/vehicles/1772891587-IMG_1964.JPG',
    'https://imolaautos.com/storage/vehicles/1772891587-IMG_1960.JPG',
    'https://imolaautos.com/storage/vehicles/1772891587-IMG_1970.JPG',
    'https://imolaautos.com/storage/vehicles/1772891588-IMG_1945.JPG',
  ],
  // Peugeot 208 Allure 1.6 (8905)
  'a1000000-0037-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1771509057-1.JPG',
    'https://imolaautos.com/storage/vehicles/1771509057-2.JPG',
    'https://imolaautos.com/storage/vehicles/1771509057-3.JPG',
    'https://imolaautos.com/storage/vehicles/1771509057-7.JPG',
    'https://imolaautos.com/storage/vehicles/1771509060-9.JPG',
  ],
  // Citroën Berlingo Multispace 1.6 HDI
  'a1000000-0039-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1772541962-IMG_1747.JPG',
    'https://imolaautos.com/storage/vehicles/1772541950-IMG_1745.JPG',
    'https://imolaautos.com/storage/vehicles/1772541950-IMG_1742.JPG',
    'https://imolaautos.com/storage/vehicles/1772541962-IMG_1750.JPG',
    'https://imolaautos.com/storage/vehicles/1772542630-IMG_1727.JPG',
  ],
  // Renault Alaskan 2.3 TDI 4x4 Iconic AT
  'a1000000-0030-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1771614989-1-(4).jpg',
    'https://imolaautos.com/storage/vehicles/1771614989-2-(4).jpg',
    'https://imolaautos.com/storage/vehicles/1771614989-3-(4).jpg',
    'https://imolaautos.com/storage/vehicles/1771614989-6-(5).jpg',
    'https://imolaautos.com/storage/vehicles/1771614989-9.jpg',
  ],
  // VW Taos 1.4T Comfortline DSG
  'a1000000-0028-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1770917463-IMG_1299.JPG',
    'https://imolaautos.com/storage/vehicles/1770917463-IMG_1303.JPG',
    'https://imolaautos.com/storage/vehicles/1770917463-IMG_1307.JPG',
    'https://imolaautos.com/storage/vehicles/1770917463-IMG_1296.JPG',
    'https://imolaautos.com/storage/vehicles/1770917463-IMG_1314.JPG',
  ],
  // Kia Cerato SX 2.0 AT
  'a1000000-0007-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1771456550-1.JPG',
    'https://imolaautos.com/storage/vehicles/1771456550-2.JPG',
    'https://imolaautos.com/storage/vehicles/1771456550-3.JPG',
    'https://imolaautos.com/storage/vehicles/1771456550-7.JPG',
    'https://imolaautos.com/storage/vehicles/1771456552-9.JPG',
  ],
  // Chevrolet Captiva 2.4 LS MT 7as
  'a1000000-0026-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1772720709-1.JPG',
    'https://imolaautos.com/storage/vehicles/1772720709-2.JPG',
    'https://imolaautos.com/storage/vehicles/1772720709-8.JPG',
    'https://imolaautos.com/storage/vehicles/1772720709-5.JPG',
    'https://imolaautos.com/storage/vehicles/1772720713-9.JPG',
  ],
  // VW Virtus 1.6 Highline
  'a1000000-0009-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1770659921-IMG_1164.JPG',
    'https://imolaautos.com/storage/vehicles/1770659920-IMG_1163.JPG',
    'https://imolaautos.com/storage/vehicles/1770659920-IMG_1162.JPG',
    'https://imolaautos.com/storage/vehicles/1770659920-IMG_1166.JPG',
    'https://imolaautos.com/storage/vehicles/1770659921-IMG_1155.JPG',
  ],
  // Nissan Kicks 1.6 X-Play CVT
  'a1000000-0024-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1772639740-1.jpg',
    'https://imolaautos.com/storage/vehicles/1772639740-2.jpg',
    'https://imolaautos.com/storage/vehicles/1772639740-3.jpg',
    'https://imolaautos.com/storage/vehicles/1772639740-7.jpg',
    'https://imolaautos.com/storage/vehicles/1772639743-9.jpg',
  ],
  // Ford EcoSport SE 1.6 MT
  'a1000000-0027-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1772629840-IMG_1807.JPG',
    'https://imolaautos.com/storage/vehicles/1772629840-IMG_1805.JPG',
    'https://imolaautos.com/storage/vehicles/1772629840-IMG_1801.JPG',
    'https://imolaautos.com/storage/vehicles/1772629840-IMG_1809.JPG',
    'https://imolaautos.com/storage/vehicles/1772629843-IMG_1783.JPG',
  ],
  // Ford Mondeo 2.0T Titanium AT (8863)
  'a1000000-0008-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1769797632-IMG_0873.JPG',
    'https://imolaautos.com/storage/vehicles/1769797632-IMG_0872.JPG',
    'https://imolaautos.com/storage/vehicles/1769797634-IMG_0869.JPG',
    'https://imolaautos.com/storage/vehicles/1769797635-IMG_0875.JPG',
    'https://imolaautos.com/storage/vehicles/1769797635-IMG_0862.JPG',
  ],
  // Peugeot 208 1.6 Allure Nav (8859)
  'a1000000-0034-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1769798991-IMG_0889.JPG',
    'https://imolaautos.com/storage/vehicles/1769798988-IMG_0888.JPG',
    'https://imolaautos.com/storage/vehicles/1769798991-IMG_0886.JPG',
    'https://imolaautos.com/storage/vehicles/1769798991-IMG_0891.JPG',
    'https://imolaautos.com/storage/vehicles/1769798808-IMG_0878.JPG',
  ],
  // VW Amarok 3.0 V6 TDI Extreme 4x4 AT
  'a1000000-0031-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1772723597-IMG_0457.JPG',
    'https://imolaautos.com/storage/vehicles/1772723597-IMG_0456.JPG',
    'https://imolaautos.com/storage/vehicles/1772723597-IMG_0453.JPG',
    'https://imolaautos.com/storage/vehicles/1772723597-IMG_0459.JPG',
    'https://imolaautos.com/storage/vehicles/1772723599-IMG_0444.JPG',
  ],
  // VW Golf 1.4T Comfortline DSG
  'a1000000-0012-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1769181538-IMG_0606.JPG',
    'https://imolaautos.com/storage/vehicles/1769181538-IMG_0605.JPG',
    'https://imolaautos.com/storage/vehicles/1769181538-IMG_0602.JPG',
    'https://imolaautos.com/storage/vehicles/1769181538-IMG_0608.JPG',
    'https://imolaautos.com/storage/vehicles/1769181538-IMG_0598.JPG',
  ],
  // Jeep Compass Longitud 1.3T AT 2023 (8844)
  'a1000000-0044-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1768587009-IMG_0372.JPG',
    'https://imolaautos.com/storage/vehicles/1768587008-IMG_0373.JPG',
    'https://imolaautos.com/storage/vehicles/1768587009-IMG_0375.JPG',
    'https://imolaautos.com/storage/vehicles/1768587009-IMG_0368.JPG',
    'https://imolaautos.com/storage/vehicles/1768587006-IMG_0363.JPG',
  ],
  // Nissan Frontier S 2.3 TDI 4x2 AT
  'a1000000-0032-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1768599028-IMG_0175.JPG',
    'https://imolaautos.com/storage/vehicles/1768599028-IMG_0174.JPG',
    'https://imolaautos.com/storage/vehicles/1768599028-IMG_0171.JPG',
    'https://imolaautos.com/storage/vehicles/1768599028-IMG_0177.JPG',
    'https://imolaautos.com/storage/vehicles/1768599028-IMG_0168.JPG',
  ],
  // Citroën C3 1.6 Feel Pack
  'a1000000-0038-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1770298745-IMG_1037.JPG',
    'https://imolaautos.com/storage/vehicles/1770298743-IMG_1036.JPG',
    'https://imolaautos.com/storage/vehicles/1770298746-IMG_1034.JPG',
    'https://imolaautos.com/storage/vehicles/1770298746-IMG_1039.JPG',
    'https://imolaautos.com/storage/vehicles/1770298745-IMG_1029.JPG',
  ],
  // Peugeot 208 Allure 1.6 Tiptronic Nav (8828)
  'a1000000-0046-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1771851570-1.jpg',
    'https://imolaautos.com/storage/vehicles/1769610327-IMG_0729.JPG',
    'https://imolaautos.com/storage/vehicles/1769610327-IMG_0727.JPG',
    'https://imolaautos.com/storage/vehicles/1769610326-IMG_0732.JPG',
    'https://imolaautos.com/storage/vehicles/1769610327-IMG_0720.JPG',
  ],
  // VW Polo 1.6 Trendline
  'a1000000-0010-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1767977161-IMG_0194.JPG',
    'https://imolaautos.com/storage/vehicles/1767977160-IMG_0193.JPG',
    'https://imolaautos.com/storage/vehicles/1767977160-IMG_0191.JPG',
    'https://imolaautos.com/storage/vehicles/1767977161-IMG_0196.JPG',
    'https://imolaautos.com/storage/vehicles/1767977160-IMG_0181.JPG',
  ],
  // Chevrolet Onix 1.4 LTZ
  'a1000000-0011-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1770825006-IMG_8619.jpg',
    'https://imolaautos.com/storage/vehicles/1770825005-IMG_8618.jpg',
    'https://imolaautos.com/storage/vehicles/1770825006-IMG_8616.jpg',
    'https://imolaautos.com/storage/vehicles/1770825006-IMG_8621.jpg',
    'https://imolaautos.com/storage/vehicles/1770825006-IMG_8613.jpg',
  ],
  // VW Vento 1.4 TSI Highline DSG (8804)
  'a1000000-0045-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1765555397-IMG_9627.JPG',
    'https://imolaautos.com/storage/vehicles/1765555396-IMG_9626.JPG',
    'https://imolaautos.com/storage/vehicles/1765555397-IMG_9624.JPG',
    'https://imolaautos.com/storage/vehicles/1765555397-IMG_9628.JPG',
    'https://imolaautos.com/storage/vehicles/1765555397-IMG_9613.JPG',
  ],
  // Nissan Versa 1.6 Advance MT (8786)
  'a1000000-0047-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1772640867-versa1.jpg',
    'https://imolaautos.com/storage/vehicles/1766501533-IMG_9966.JPG',
    'https://imolaautos.com/storage/vehicles/1766501533-IMG_9964.JPG',
    'https://imolaautos.com/storage/vehicles/1766501533-IMG_9969.JPG',
    'https://imolaautos.com/storage/vehicles/1766501532-IMG_9958.JPG',
  ],
  // Dodge RAM 1500 Laramie 5.7 V8 4x4
  'a1000000-0033-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1769516707-1.jpg',
    'https://imolaautos.com/storage/vehicles/1769516707-2.jpg',
    'https://imolaautos.com/storage/vehicles/1769516707-3.jpg',
    'https://imolaautos.com/storage/vehicles/1769516707-7.jpg',
    'https://imolaautos.com/storage/vehicles/1769516707-9.jpg',
  ],
  // Ford Mondeo 2.0T Titanium AT 2017 (8767)
  'a1000000-0048-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1765890024-1.JPG',
    'https://imolaautos.com/storage/vehicles/1765890024-2.JPG',
    'https://imolaautos.com/storage/vehicles/1765890024-3.JPG',
    'https://imolaautos.com/storage/vehicles/1765890024-7.JPG',
    'https://imolaautos.com/storage/vehicles/1765890023-10.JPG',
  ],
  // Ford Kuga 2.5 Titanium MHEV AT
  'a1000000-0021-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1762367148-1.JPG',
    'https://imolaautos.com/storage/vehicles/1762367146-2.JPG',
    'https://imolaautos.com/storage/vehicles/1762367149-3.JPG',
    'https://imolaautos.com/storage/vehicles/1762367255-7.JPG',
    'https://imolaautos.com/storage/vehicles/1762367260-10.JPG',
  ],
  // VW Vento GLI 350TSI DSG 2025 (8615)
  'a1000000-0040-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1761576635-IMG_7750.jpg',
    'https://imolaautos.com/storage/vehicles/1761576635-IMG_7751.jpg',
    'https://imolaautos.com/storage/vehicles/1761576635-IMG_7756.jpg',
    'https://imolaautos.com/storage/vehicles/1761576635-IMG_7746.jpg',
    'https://imolaautos.com/storage/vehicles/1761576637-IMG_7731.JPG',
  ],
  // BAIC BJ30e Híbrido 2025 — reuse BAIC X55 images (same brand, similar look)
  'a1000000-0043-0000-0000-000000000001': [
    'https://imolaautos.com/storage/vehicles/1773764031-IMG_2397.JPG',
    'https://imolaautos.com/storage/vehicles/1773764031-IMG_2394.JPG',
    'https://imolaautos.com/storage/vehicles/1773764036-IMG_2375.JPG',
    'https://imolaautos.com/storage/vehicles/1773764036-IMG_2379.jpg',
    'https://imolaautos.com/storage/vehicles/1773764036-IMG_2380.JPG',
  ],
};

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Referer': 'https://imolaautos.com/',
      },
      timeout: 30000,
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadImage(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

async function processAndSave(buffer, uuid, folderPath) {
  await Promise.all([
    sharp(buffer)
      .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(path.join(folderPath, `${uuid}.webp`)),
    sharp(buffer)
      .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(path.join(folderPath, `${uuid}.jpg`)),
    sharp(buffer)
      .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(path.join(folderPath, `${uuid}-thumb.webp`)),
  ]);
  return `${API_URL}/uploads/${TENANT_ID}/products/${uuid}.webp`;
}

async function main() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const { Client } = require('pg');
  const client = new Client(DB_CONN);
  await client.connect();

  let totalImages = 0;
  let failedImages = 0;
  const productIds = Object.keys(PRODUCT_IMAGES);

  for (const productId of productIds) {
    const images = PRODUCT_IMAGES[productId];
    const productName = await client.query('SELECT name FROM products WHERE id = $1', [productId]);
    const name = productName.rows[0]?.name || productId;
    process.stdout.write(`\n📦 ${name} (${images.length} imgs): `);

    for (let i = 0; i < images.length; i++) {
      const url = images[i];
      const uuid = uuidv4();
      const isPrimary = i === 0;

      try {
        const buffer = await downloadImage(url);

        if (buffer.length < 1000) {
          process.stdout.write('⚠');
          failedImages++;
          continue;
        }

        const savedUrl = await processAndSave(buffer, uuid, UPLOAD_DIR);

        await client.query(
          `INSERT INTO product_images (id, "productId", url, alt, "order", "isPrimary", "createdAt")
           VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [uuidv4(), productId, savedUrl, `${name} - foto ${i + 1}`, i, isPrimary]
        );

        totalImages++;
        process.stdout.write('✓');
      } catch (err) {
        process.stdout.write('✗');
        failedImages++;
        if (process.env.DEBUG) console.error(`\n  Error: ${err.message}`);
      }

      // Small delay to be polite
      await new Promise(r => setTimeout(r, 150));
    }
  }

  // Update products.images array with primary image URL
  const products = await client.query(
    `SELECT p.id, pi.url FROM products p
     JOIN product_images pi ON pi."productId" = p.id AND pi."isPrimary" = true
     WHERE p."tenantId" = $1`,
    [TENANT_ID]
  );

  let updatedProducts = 0;
  for (const row of products.rows) {
    await client.query(
      `UPDATE products SET images = $1 WHERE id = $2`,
      [JSON.stringify([row.url]), row.id]
    );
    updatedProducts++;
  }

  await client.end();

  console.log(`\n\n✅ Done! ${totalImages} images saved, ${failedImages} failed`);
  console.log(`📦 ${updatedProducts} products updated with primary image`);
  console.log(`📁 Files in: ${UPLOAD_DIR}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
