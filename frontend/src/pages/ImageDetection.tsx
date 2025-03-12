import React, { useState } from 'react'
import { Row, Col, Tabs, Divider } from 'antd'
import type { TabsProps } from 'antd'
import ImageUploader from '../components/ImageUploader/ImageUploader'
import ResultDisplay from '../components/ResultDisplay/ResultDisplay'
import { useImageUpload } from '../hooks/useImageUpload'

const ImageDetection: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>('single')
    const { previewImage, result, loading, handleFileSelect } = useImageUpload()

    const tabItems: TabsProps['items'] = [
        {
            key: 'single',
            label: '单张识别',
            children: (
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <ImageUploader onFileSelect={handleFileSelect} />
                    </Col>
                    <Col span={24}>
                        <ResultDisplay
                            loading={loading}
                            previewImage={previewImage}
                            result={result}
                        />
                    </Col>
                </Row>
            ),
        },
    ]

    return (
        <div style={{ padding: '20px', width: '100%' }}>
            <h1>图像害虫检测</h1>
            <Divider />

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
                style={{ marginBottom: 16 }}
            />
        </div>
    )
}

export default ImageDetection
