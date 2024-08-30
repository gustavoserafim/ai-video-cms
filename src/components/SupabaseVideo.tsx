import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface SupabaseVideoProps {
  videoPath: string;
  className?: string;
}

const SupabaseVideo: React.FC<SupabaseVideoProps> = ({ videoPath, className }) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  useEffect(() => {
    async function getVideoUrl() {
      const { data, error } = await supabase
        .storage
        .from("video")
        .createSignedUrl(videoPath, 3600) // 1 hour expiration

      if (error) {
        console.error('Error fetching video:', error)
      } else {
        setVideoUrl(data.signedUrl)
      }
    }

    getVideoUrl()
  }, [videoPath])

  if (!videoUrl) {
    return null // or a loading spinner
  }

  return <video src={videoUrl} className={className} controls />
}

export default SupabaseVideo