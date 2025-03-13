import React from 'react'
import { Image } from 'antd'

interface MediaPreviewProps {
    src: string
    alt?: string
    style?: React.CSSProperties
    maxWidth?: string | number
}

const MediaPreview: React.FC<MediaPreviewProps> = ({
    src,
    alt = '预览图',
    style,
    maxWidth = '100%',
}) => {
    const defaultStyle: React.CSSProperties = {
        maxWidth: maxWidth,
        marginBottom: '16px',
        ...style,
    }

    return (
        <div className="media-preview">
            <Image src={src} alt={alt} style={defaultStyle} />
        </div>
    )
}

export default MediaPreview
