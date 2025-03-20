import React, { useState } from 'react'
import { Row, Col, Tabs, Button } from 'antd'
import type { TabsProps } from 'antd'
import { ImageUploader } from '../components/media'
import { ResultDisplay, BatchResultDisplay } from '../components/display'
import { useImageUpload } from '../hooks/useImageUpload'
import { useMultipleImageUpload } from '../hooks/useMultipleImageUpload'
import { PageLayout } from '../components/layout'

const ImageDetection: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>('single')
    const { previewImage, result, loading, handleFileSelect } = useImageUpload()
    const {
        batchResult,
        loading: batchLoading,
        selectedFiles,
        handleFilesSelect,
        uploadFiles,
        clearResults,
    } = useMultipleImageUpload()

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
        {
            key: 'batch',
            label: '批量识别',
            children: (
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <ImageUploader
                            multiple={true}
                            onFilesSelect={handleFilesSelect}
                        />
                    </Col>
                    <Col
                        span={24}
                        style={{ textAlign: 'center', marginBottom: 16 }}
                    >
                        <Button
                            type="primary"
                            onClick={uploadFiles}
                            loading={batchLoading}
                            disabled={selectedFiles.length === 0}
                        >
                            开始批量识别 ({selectedFiles.length}个文件)
                        </Button>
                    </Col>
                    <Col span={24}>
                        <BatchResultDisplay
                            loading={batchLoading}
                            selectedFiles={selectedFiles}
                            batchResult={batchResult}
                            onClear={clearResults}
                        />
                    </Col>
                </Row>
            ),
        },
    ]

    return (
        <PageLayout title="图像害虫检测">
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
                style={{ marginBottom: 16 }}
            />
        </PageLayout>
    )
}

export default ImageDetection
