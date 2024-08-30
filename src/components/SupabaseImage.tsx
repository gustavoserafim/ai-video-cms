import { useState, useEffect } from 'react'
import Image, { ImageProps } from 'next/image'
import { supabase } from '../lib/supabase'

interface SupabaseImageProps extends Omit<ImageProps, 'src'> {
  imagePath: string;
}

const SupabaseImage: React.FC<SupabaseImageProps> = ({ imagePath, ...props }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  useEffect(() => {
    async function getImageUrl() {
      const { data, error } = await supabase
        .storage
        .from("image")
        .createSignedUrl(imagePath, 60) // 60 seconds expiration

      if (error) {
        console.error('Error fetching image:', error)
      } else {
        setImageUrl(data.signedUrl)
      }
    }

    getImageUrl()
  }, [imagePath])

  if (!imageUrl) {
    return null // or a loading spinner
  }

  return <Image src={imageUrl} {...props} />
}

export default SupabaseImage