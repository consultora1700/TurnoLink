import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsNumber,
  IsArray,
  ValidateNested,
  MaxLength,
  Matches,
  IsIn,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CarouselImageDto {
  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  linkUrl?: string;

  @IsNumber()
  order: number;
}

export class UpdateBrandingDto {
  // Colors
  @ApiPropertyOptional({ example: '#F59E0B' })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'Color debe ser formato hex (#RRGGBB)' })
  primaryColor?: string;

  @ApiPropertyOptional({ example: '#8b5cf6' })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'Color debe ser formato hex (#RRGGBB)' })
  secondaryColor?: string;

  @ApiPropertyOptional({ example: '#f59e0b' })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'Color debe ser formato hex (#RRGGBB)' })
  accentColor?: string;

  @ApiPropertyOptional({ example: '#ffffff' })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'Color debe ser formato hex (#RRGGBB)' })
  backgroundColor?: string;

  @ApiPropertyOptional({ example: '#1f2937' })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'Color debe ser formato hex (#RRGGBB)' })
  textColor?: string;

  // Typography
  @ApiPropertyOptional({ example: 'Inter' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  fontFamily?: string;

  @ApiPropertyOptional({ example: 'Inter' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  headingFontFamily?: string;

  // Images
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  faviconUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bannerImageUrl?: string;

  // Texts
  @ApiPropertyOptional({ example: 'Bienvenidos a Mi Tienda' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  welcomeTitle?: string;

  @ApiPropertyOptional({ example: 'Los mejores productos al mejor precio' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  welcomeSubtitle?: string;

  @ApiPropertyOptional({ example: '© 2026 Mi Tienda. Todos los derechos reservados.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  footerText?: string;

  // SEO
  @ApiPropertyOptional({ example: 'Mi Tienda — Ropa y Accesorios' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  metaTitle?: string;

  @ApiPropertyOptional({ example: 'La mejor ropa y accesorios en Buenos Aires' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  metaDescription?: string;

  // Store Config Toggles
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showPrices?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showStock?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enableWishlist?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enableReviews?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  storeEnabled?: boolean;

  // Background style
  @ApiPropertyOptional({ example: 'modern' })
  @IsOptional()
  @IsString()
  @IsIn(['minimal', 'modern', 'elegant', 'fresh', 'vibrant'])
  backgroundStyle?: string;

  // Store Visual Customization
  @ApiPropertyOptional({ example: 'classic' })
  @IsOptional()
  @IsString()
  @IsIn(['classic', 'centered', 'banner', 'split', 'minimal', 'gradient', 'glassmorphism', 'editorial', 'fullscreen', 'floating', 'ecommerce'])
  storeHeroStyle?: string;

  @ApiPropertyOptional({ example: 'standard' })
  @IsOptional()
  @IsString()
  @IsIn(['standard', 'minimal', 'compact', 'editorial', 'detailed', 'rounded'])
  storeCardStyle?: string;

  @ApiPropertyOptional({ example: 'round' })
  @IsOptional()
  @IsString()
  @IsIn(['none', 'round', 'square'])
  profilePhotoStyle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  announcementEnabled?: boolean;

  @ApiPropertyOptional({ example: 'ENVÍO GRATIS en compras mayores a $15.000' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  announcementText?: string;

  @ApiPropertyOptional({ example: '#000000' })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'Color debe ser formato hex (#RRGGBB)' })
  announcementBgColor?: string;

  @ApiPropertyOptional({ example: '#FFFFFF' })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'Color debe ser formato hex (#RRGGBB)' })
  announcementTextColor?: string;

  @ApiPropertyOptional({ example: 'normal' })
  @IsOptional()
  @IsString()
  @IsIn(['slow', 'normal', 'fast'])
  announcementSpeed?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showCategoryFilter?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showSearchBar?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showWhatsappButton?: boolean;

  // Advanced Store Customization
  @ApiPropertyOptional({ example: 'pill' })
  @IsOptional()
  @IsString()
  @IsIn(['pill', 'rounded', 'square', 'ghost'])
  buttonStyle?: string;

  @ApiPropertyOptional({ example: 'Consultar' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  buttonText?: string;

  @ApiPropertyOptional({ example: 'lg' })
  @IsOptional()
  @IsString()
  @IsIn(['sm', 'md', 'lg', 'xl', '2xl'])
  cardBorderRadius?: string;

  @ApiPropertyOptional({ example: 'square' })
  @IsOptional()
  @IsString()
  @IsIn(['square', 'portrait', 'landscape'])
  imageAspectRatio?: string;

  @ApiPropertyOptional({ example: 'medium' })
  @IsOptional()
  @IsString()
  @IsIn(['compact', 'medium', 'tall', 'full'])
  heroHeight?: string;

  @ApiPropertyOptional({ example: 'gradient' })
  @IsOptional()
  @IsString()
  @IsIn(['gradient', 'solid', 'blur', 'none'])
  heroOverlay?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(2)
  mobileColumns?: number;

  @ApiPropertyOptional({ example: 'default' })
  @IsOptional()
  @IsString()
  @IsIn(['default', 'badge', 'highlight', 'minimal'])
  priceStyle?: string;

  @ApiPropertyOptional({ example: 'pills' })
  @IsOptional()
  @IsString()
  @IsIn(['pills', 'underline', 'cards'])
  categoryStyle?: string;

  // Logo Glow
  @ApiPropertyOptional({ example: 1.0, description: 'Logo zoom scale (0.5 to 2.0)' })
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(2.0)
  logoScale?: number;

  @ApiPropertyOptional({ example: 0, description: 'Logo horizontal offset (-50 to 50)' })
  @IsOptional()
  @IsNumber()
  @Min(-50)
  @Max(50)
  logoOffsetX?: number;

  @ApiPropertyOptional({ example: 0, description: 'Logo vertical offset (-50 to 50)' })
  @IsOptional()
  @IsNumber()
  @Min(-50)
  @Max(50)
  logoOffsetY?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  logoGlowEnabled?: boolean;

  @ApiPropertyOptional({ example: '#6366f1' })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'Color debe ser formato hex (#RRGGBB)' })
  logoGlowColor?: string;

  @ApiPropertyOptional({ example: 'medium' })
  @IsOptional()
  @IsString()
  @IsIn(['subtle', 'medium', 'strong'])
  logoGlowIntensity?: string;

  // Background Effects
  @ApiPropertyOptional({ example: 'particles' })
  @IsOptional()
  @IsString()
  @IsIn(['none', 'particles', 'dots', 'grid', 'waves', 'gradient-mesh', 'bokeh', 'aurora'])
  backgroundEffect?: string;

  @ApiPropertyOptional({ example: '#6366f1' })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'Color debe ser formato hex (#RRGGBB)' })
  backgroundEffectColor?: string;

  @ApiPropertyOptional({ example: 0.15 })
  @IsOptional()
  @IsNumber()
  @Min(0.05)
  @Max(0.5)
  backgroundEffectOpacity?: number;

  // Page Gradient
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  gradientEnabled?: boolean;

  @ApiPropertyOptional({ example: 'fade' })
  @IsOptional()
  @IsString()
  @IsIn(['fade', 'immersive'])
  gradientStyle?: string;

  @ApiPropertyOptional({ example: '#ffffff' })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'Color debe ser formato hex (#RRGGBB)' })
  gradientFrom?: string;

  @ApiPropertyOptional({ example: '#111827' })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'Color debe ser formato hex (#RRGGBB)' })
  gradientTo?: string;

  // Carousel Images
  @ApiPropertyOptional({ example: [{ url: 'https://...', linkUrl: '', order: 0 }] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CarouselImageDto)
  carouselImages?: CarouselImageDto[];
}
