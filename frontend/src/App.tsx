import React, { useState } from 'react'
import { Row, Col, Tabs, Button } from 'antd'
import type { TabsProps } from 'antd'
import ImageUploader from './components/ImageUploader/ImageUploader'
import ResultDisplay from './components/ResultDisplay/ResultDisplay'
import BatchResultDisplay from './components/BatchResultDisplay/BatchResultDisplay'
import VideoUploader from './components/VideoUploader/VideoUploader'
import VideoResultDisplay from './components/VideoResultDisplay/VideoResultDisplay'
import { useImageUpload } from './hooks/useImageUpload'
import { useMultipleImageUpload } from './hooks/useMultipleImageUpload'
import { useVideoUpload } from './hooks/useVideoUpload'

const App: React.FC = () => {
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
    // 新增视频处理hook，添加缺少的属性
    const {
        videoResult,
        videoPreview,
        loading: videoLoading,
        progress,
        taskId, // 添加这一行
        handleVideoSelect,
        clearResult: clearVideoResult,
        updateResultFromWebSocket, // 添加这一行
    } = useVideoUpload()

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
                            onFileSelect={() => {}} // 添加空函数以满足类型要求
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
        // 新增视频检测标签页
        {
            key: 'video',
            label: '视频检测',
            children: (
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <VideoUploader onVideoSelect={handleVideoSelect} />
                    </Col>
                    <Col span={24}>
                        <VideoResultDisplay
                            loading={videoLoading}
                            progress={progress}
                            videoPreview={videoPreview}
                            videoResult={videoResult}
                            onClear={clearVideoResult}
                            taskId={taskId} // 确保传递taskId
                            onWebSocketResult={updateResultFromWebSocket} // 添加WebSocket结果回调
                        />
                    </Col>
                </Row>
            ),
        },
    ]

    return (
        <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
                style={{ marginBottom: 16 }}
            />
        </div>
    )
}

export default App
