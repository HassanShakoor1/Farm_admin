// Automatic Video Compression - No External Tools Needed!
// Compresses videos in the browser before upload

export interface CompressionOptions {
  quality: 'low' | 'medium' | 'high' | 'ultra'
  maxSizeMB?: number
  onProgress?: (progress: number) => void
  onStatusChange?: (status: string) => void
}

export interface CompressionResult {
  compressedFile: File
  originalSize: number
  compressedSize: number
  compressionRatio: number
}

// Get quality settings
function getQualitySettings(quality: CompressionOptions['quality']) {
  const settings = {
    low: {
      videoBitrate: 500000,      // 500 Kbps - Very small files
      audioBitrate: 64000,       // 64 Kbps
      width: 640,                // 480p
      fps: 24
    },
    medium: {
      videoBitrate: 1000000,     // 1 Mbps - Good quality, reasonable size
      audioBitrate: 128000,      // 128 Kbps
      width: 1280,               // 720p
      fps: 30
    },
    high: {
      videoBitrate: 2500000,     // 2.5 Mbps - High quality
      audioBitrate: 192000,      // 192 Kbps
      width: 1920,               // 1080p
      fps: 30
    },
    ultra: {
      videoBitrate: 5000000,     // 5 Mbps - Very high quality
      audioBitrate: 256000,      // 256 Kbps
      width: 1920,               // 1080p
      fps: 60
    }
  }
  return settings[quality]
}

// Browser-native compression using MediaRecorder API
export async function compressVideoNative(
  file: File,
  options: CompressionOptions
): Promise<CompressionResult> {
  const { quality, onProgress, onStatusChange } = options
  const settings = getQualitySettings(quality)

  onStatusChange?.('Loading video...')

  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Canvas not supported'))
      return
    }

    video.src = URL.createObjectURL(file)
    video.muted = true

    video.onloadedmetadata = async () => {
      try {
        // Set canvas size based on quality setting
        const scale = Math.min(1, settings.width / video.videoWidth)
        canvas.width = video.videoWidth * scale
        canvas.height = video.videoHeight * scale

        onStatusChange?.('Compressing video...')

        // Create MediaRecorder for compression
        const stream = canvas.captureStream(settings.fps)
        
        // Add audio track
        try {
          const audioContext = new AudioContext()
          const source = audioContext.createMediaElementSource(video)
          const destination = audioContext.createMediaStreamDestination()
          source.connect(destination)
          destination.stream.getAudioTracks().forEach(track => stream.addTrack(track))
        } catch (audioError) {
          console.warn('Audio processing failed, continuing without audio:', audioError)
        }

        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm'

        const recorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: settings.videoBitrate,
          audioBitsPerSecond: settings.audioBitrate
        })

        const chunks: Blob[] = []
        recorder.ondataavailable = (e) => chunks.push(e.data)

        recorder.onstop = () => {
          const compressedBlob = new Blob(chunks, { type: mimeType })
          const compressedFile = new File(
            [compressedBlob],
            file.name.replace(/\.[^.]+$/, '.webm'),
            { type: mimeType }
          )

          const compressionRatio = ((1 - compressedFile.size / file.size) * 100).toFixed(1)

          onStatusChange?.('Compression complete!')
          
          resolve({
            compressedFile,
            originalSize: file.size,
            compressedSize: compressedFile.size,
            compressionRatio: parseFloat(compressionRatio)
          })

          // Cleanup
          URL.revokeObjectURL(video.src)
          video.remove()
          canvas.remove()
        }

        recorder.onerror = (error) => {
          reject(error)
        }

        // Start recording
        recorder.start()

        // Play video and draw to canvas
        video.play()
        const duration = video.duration
        let currentTime = 0

        const drawFrame = () => {
          if (video.paused || video.ended) {
            recorder.stop()
            return
          }

          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          currentTime = video.currentTime

          // Update progress
          const progress = Math.min(100, (currentTime / duration) * 100)
          onProgress?.(Math.round(progress))

          requestAnimationFrame(drawFrame)
        }

        drawFrame()

        // Stop recording when video ends
        video.onended = () => {
          setTimeout(() => recorder.stop(), 100)
        }

      } catch (error) {
        reject(error)
      }
    }

    video.onerror = () => {
      reject(new Error('Failed to load video'))
    }
  })
}

// Simple quality-based compression
export async function compressVideo(
  file: File,
  quality: CompressionOptions['quality'] = 'medium',
  onProgress?: (progress: number) => void,
  onStatusChange?: (status: string) => void
): Promise<CompressionResult> {
  const originalSizeMB = (file.size / 1024 / 1024).toFixed(2)
  
  onStatusChange?.(`Preparing to compress ${originalSizeMB}MB video...`)

  try {
    const result = await compressVideoNative(file, {
      quality,
      onProgress,
      onStatusChange
    })

    const compressedSizeMB = (result.compressedSize / 1024 / 1024).toFixed(2)
    onStatusChange?.(
      `Compressed from ${originalSizeMB}MB to ${compressedSizeMB}MB (${result.compressionRatio}% smaller)`
    )

    return result
  } catch (error) {
    console.error('Compression failed:', error)
    throw new Error('Video compression failed. Uploading original file...')
  }
}

// Check if compression is beneficial
export function shouldCompress(file: File, maxSizeMB: number = 50): boolean {
  const fileSizeMB = file.size / 1024 / 1024
  return fileSizeMB > maxSizeMB
}

