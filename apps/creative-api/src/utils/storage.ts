import fs from 'fs';
import path from 'path';
import { config } from '../config';

export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function ensureAllDirs(): void {
  Object.values(config.paths).forEach(ensureDir);
}

export function getOutputPath(category: keyof typeof config.paths, filename: string): string {
  const dir = config.paths[category];
  ensureDir(dir);
  return path.join(dir, filename);
}

export function getFileUrl(category: string, filename: string): string {
  return `${config.baseUrl}/files/${category}/${filename}`;
}

export function getFileSize(filePath: string): number {
  try {
    const stat = fs.statSync(filePath);
    return stat.size;
  } catch {
    return 0;
  }
}

export function deleteFile(filePath: string): boolean {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function getTenantDir(category: keyof typeof config.paths, tenantId: string): string {
  const dir = path.join(config.paths[category], tenantId);
  ensureDir(dir);
  return dir;
}
