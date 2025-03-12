import React from 'react'
import { Image } from 'antd'

interface ImagePreviewProps {
    src: string
    alt?: string
    style?: React.CSSProperties
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
    src,
    alt = '预览图像',
    style = { maxWidth: '100%', marginBottom: '16px' },
}) => {
    return <Image src={src} alt={alt} style={style} />
}

export default ImagePreview
