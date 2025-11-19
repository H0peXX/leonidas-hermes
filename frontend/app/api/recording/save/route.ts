import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const sessionId = formData.get('sessionId') as string;

    if (!audioFile || !sessionId) {
      return NextResponse.json({ error: 'Missing audio file or session ID' }, { status: 400 });
    }

    const sessionPath = join('D:', 'mick_work', 'leonidas-hermes', 'test', sessionId);
    
    // Get existing files count for naming
    const existingFiles = await readdir(sessionPath).catch(() => []);
    const recordingCount = existingFiles.filter(f => f.startsWith('recording_')).length + 1;
    
    const fileName = `recording_${recordingCount.toString().padStart(3, '0')}.wav`;
    const filePath = join(sessionPath, fileName);

    // Save with .wav extension
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await writeFile(filePath, buffer);

    return NextResponse.json({ 
      success: true, 
      fileName,
      sessionId 
    });
  } catch (error) {
    console.error('Error saving recording:', error);
    return NextResponse.json({ error: 'Failed to save recording' }, { status: 500 });
  }
}