import { spawn, spawnSync, ChildProcess } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { query } from '../../config/database.js';

const STREAMS_DIR = path.join(os.tmpdir(), 'aone-cctv-streams');
const activeStreams = new Map<string, { process: ChildProcess; createdAt: Date }>();

if (!fs.existsSync(STREAMS_DIR)) fs.mkdirSync(STREAMS_DIR, { recursive: true });

export function isFfmpegAvailable(): boolean {
  try {
    const result = spawnSync('ffmpeg', ['-version'], { stdio: 'pipe', timeout: 3000 });
    return result.status === 0;
  } catch {
    return false;
  }
}

export async function startStream(cameraId: string, rtspUrl: string): Promise<string> {
  const streamDir = path.join(STREAMS_DIR, cameraId);
  if (!fs.existsSync(streamDir)) fs.mkdirSync(streamDir, { recursive: true });

  const existing = activeStreams.get(cameraId);
  if (existing) {
    try { existing.process.kill('SIGTERM'); } catch {}
    activeStreams.delete(cameraId);
  }

  const hlsPath = path.join(streamDir, 'index.m3u8');

  const ffmpeg = spawn('ffmpeg', [
    '-rtsp_transport', 'tcp',
    '-i', rtspUrl,
    '-fflags', 'nobuffer',
    '-flags', 'low_delay',
    '-strict', 'experimental',
    '-analyzeduration', '1000000',
    '-probesize', '1000000',
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-tune', 'zerolatency',
    '-c:a', 'aac',
    '-ar', '44100',
    '-ac', '1',
    '-b:v', '512k',
    '-maxrate', '512k',
    '-bufsize', '1024k',
    '-f', 'hls',
    '-hls_time', '2',
    '-hls_list_size', '3',
    '-hls_flags', 'delete_segments+omit_endlist',
    '-hls_segment_filename', path.join(streamDir, 'segment_%03d.ts'),
    hlsPath,
  ], {
    stdio: ['pipe', 'pipe', 'pipe'],
    detached: false,
  });

  ffmpeg.on('error', () => cleanupStream(cameraId));
  ffmpeg.on('exit', () => cleanupStream(cameraId));

  activeStreams.set(cameraId, { process: ffmpeg, createdAt: new Date() });

  return `/api/v1/campus/cctv/stream/${cameraId}/index.m3u8`;
}

export async function stopStream(cameraId: string): Promise<void> {
  cleanupStream(cameraId);
}

function cleanupStream(cameraId: string): void {
  const existing = activeStreams.get(cameraId);
  if (existing) {
    try { existing.process.kill('SIGTERM'); } catch {}
    activeStreams.delete(cameraId);
  }
  const streamDir = path.join(STREAMS_DIR, cameraId);
  if (fs.existsSync(streamDir)) {
    fs.rmSync(streamDir, { recursive: true, force: true });
  }
}

export function getStreamStatus(cameraId: string): { active: boolean; streamUrl: string | null; elapsed: number | null } {
  const existing = activeStreams.get(cameraId);
  if (!existing) return { active: false, streamUrl: null, elapsed: null };
  return {
    active: true,
    streamUrl: `/api/v1/campus/cctv/stream/${cameraId}/index.m3u8`,
    elapsed: Date.now() - existing.createdAt.getTime(),
  };
}

export function getStreamFilePath(cameraId: string, file: string): string | null {
  const filePath = path.join(STREAMS_DIR, cameraId, path.basename(file));
  if (!filePath.startsWith(STREAMS_DIR)) return null;
  if (!fs.existsSync(filePath)) return null;
  return filePath;
}

// Cleanup stale streams (older than 30 min)
setInterval(() => {
  const now = Date.now();
  for (const [id, stream] of activeStreams) {
    if (now - stream.createdAt.getTime() > 30 * 60 * 1000) {
      cleanupStream(id);
    }
  }
}, 60_000);

// Cleanup on exit
process.on('exit', () => {
  for (const [id] of activeStreams) cleanupStream(id);
});
process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));
