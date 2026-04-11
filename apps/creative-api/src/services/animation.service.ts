import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import sharp from 'sharp';
import { config } from '../config';
import { getOutputPath, getFileUrl, getFileSize, ensureDir } from '../utils/storage';

export interface AnimationOptions {
  tenantId: string;
  type: 'slideshow' | 'kenburns' | 'fade';
  images: string[]; // paths to images
  duration?: number; // seconds per image
  transition?: number; // transition duration in seconds
  outputFormat?: 'mp4' | 'gif';
  width?: number;
  height?: number;
  fps?: number;
  quality?: number;
}

export interface AnimationResult {
  outputPath: string;
  outputUrl: string;
  width: number;
  height: number;
  fileSize: number;
  format: string;
  duration: number;
}

export async function createAnimation(options: AnimationOptions): Promise<AnimationResult> {
  const {
    tenantId,
    type,
    images,
    duration = 3,
    transition = 1,
    outputFormat = 'mp4',
    width = 1080,
    height = 1080,
    fps = 30,
  } = options;

  if (images.length === 0) {
    throw new Error('At least one image is required');
  }

  const tmpDir = path.join(config.storagePath, 'tmp', uuid());
  ensureDir(tmpDir);

  try {
    // Pre-process: resize all images to same dimensions
    const resizedPaths: string[] = [];
    for (let i = 0; i < images.length; i++) {
      const resizedPath = path.join(tmpDir, `frame-${i.toString().padStart(3, '0')}.png`);
      await sharp(images[i])
        .resize(width, height, { fit: 'cover', position: 'center' })
        .png()
        .toFile(resizedPath);
      resizedPaths.push(resizedPath);
    }

    const filename = `${tenantId}-anim-${uuid().slice(0, 8)}.${outputFormat}`;
    const outputPath = getOutputPath('animations', filename);

    let command: string;

    if (type === 'slideshow' || type === 'fade') {
      // Build FFmpeg filter for slideshow with fade transitions
      const inputs = resizedPaths.map((p) => `-loop 1 -t ${duration} -i "${p}"`).join(' ');

      if (images.length === 1) {
        // Single image — just encode
        command = `ffmpeg -loop 1 -t ${duration} -i "${resizedPaths[0]}" -vf "scale=${width}:${height}" -c:v libx264 -pix_fmt yuv420p -r ${fps} -y "${outputPath}"`;
      } else {
        // Multiple images with xfade transitions
        let filterParts: string[] = [];
        let lastStream = '[0:v]';

        for (let i = 1; i < resizedPaths.length; i++) {
          const offset = i * duration - transition * i;
          const outLabel = i === resizedPaths.length - 1 ? '[v]' : `[v${i}]`;
          filterParts.push(
            `${lastStream}[${i}:v]xfade=transition=fade:duration=${transition}:offset=${Math.max(0, offset)}${outLabel}`
          );
          lastStream = outLabel;
        }

        const filter = filterParts.join(';');
        command = `ffmpeg ${inputs} -filter_complex "${filter}" -map "[v]" -c:v libx264 -pix_fmt yuv420p -r ${fps} -y "${outputPath}"`;
      }
    } else if (type === 'kenburns') {
      // Ken Burns: zoom & pan effect
      const inputs = resizedPaths.map((p) => `-loop 1 -t ${duration} -i "${p}"`).join(' ');
      const totalFrames = duration * fps;

      if (images.length === 1) {
        command = `ffmpeg -loop 1 -t ${duration} -i "${resizedPaths[0]}" -vf "scale=${width * 2}:${height * 2},zoompan=z='min(zoom+0.0015,1.5)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${totalFrames}:s=${width}x${height}:fps=${fps}" -c:v libx264 -pix_fmt yuv420p -y "${outputPath}"`;
      } else {
        // Simplified: concat with zoom for each
        const filterParts = resizedPaths.map((_, i) =>
          `[${i}:v]scale=${width * 2}:${height * 2},zoompan=z='min(zoom+0.0015,1.5)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${totalFrames}:s=${width}x${height}:fps=${fps}[z${i}]`
        );
        const concatInputs = resizedPaths.map((_, i) => `[z${i}]`).join('');
        filterParts.push(`${concatInputs}concat=n=${images.length}:v=1:a=0[v]`);

        command = `ffmpeg ${inputs} -filter_complex "${filterParts.join(';')}" -map "[v]" -c:v libx264 -pix_fmt yuv420p -y "${outputPath}"`;
      }
    } else {
      throw new Error(`Unknown animation type: ${type}`);
    }

    // Convert to GIF if needed
    if (outputFormat === 'gif') {
      const mp4Path = outputPath.replace('.gif', '.mp4');
      // First generate MP4
      const mp4Command = command.replace(outputPath, mp4Path);
      await execPromise(mp4Command);

      // Convert to GIF with palette for better quality
      const paletteFile = path.join(tmpDir, 'palette.png');
      await execPromise(`ffmpeg -i "${mp4Path}" -vf "fps=${Math.min(fps, 15)},scale=${width}:-1:flags=lanczos,palettegen" -y "${paletteFile}"`);
      await execPromise(`ffmpeg -i "${mp4Path}" -i "${paletteFile}" -lavfi "fps=${Math.min(fps, 15)},scale=${width}:-1:flags=lanczos [x]; [x][1:v] paletteuse" -y "${outputPath}"`);

      // Clean up MP4
      fs.unlinkSync(mp4Path);
    } else {
      await execPromise(command);
    }

    const totalDuration = images.length * duration - (images.length - 1) * transition;

    return {
      outputPath,
      outputUrl: getFileUrl('animations', filename),
      width,
      height,
      fileSize: getFileSize(outputPath),
      format: outputFormat,
      duration: totalDuration,
    };
  } finally {
    // Clean up tmp dir
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

function execPromise(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, { maxBuffer: 50 * 1024 * 1024, timeout: 120000 }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`FFmpeg error: ${stderr || error.message}`));
        return;
      }
      resolve(stdout);
    });
  });
}
