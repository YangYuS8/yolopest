import os
import asyncio
from openai import OpenAI
from fastapi import HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional

class AnalysisRequest(BaseModel):
    statisticsData: Dict[str, Any]
    dateRange: List[str]
    comparisonData: Optional[Dict[str, Any]] = None

class AIAnalysisService:
    def __init__(self):
        #TODO： 从环境变量获取API密钥，确保安全性
        self.api_key = os.getenv("DEEPSEEK_API_KEY")
        if not self.api_key:
            print("警告: 未设置DEEPSEEK_API_KEY环境变量")
            self.api_key = "demo_key"  # 仅用于开发，生产环境需要设置真实密钥
        
        self.client = OpenAI(
            api_key=self.api_key,
            base_url="https://api.deepseek.com"
        )
    
    async def generate_analysis(self, data: AnalysisRequest) -> Dict[str, Any]:
        """根据统计数据生成智能分析报告"""
        try:
            # 检查API密钥是否可用
            if not self.api_key or self.api_key == "demo_key":
                return {
                    "status": "error", 
                    "message": "DeepSeek API密钥未配置，请联系管理员设置有效的API密钥"
                }
            
            # 构建提示信息
            prompt = self._build_prompt(data)
            
            # 使用asyncio.to_thread将同步API调用转换为异步操作
            # 这样API调用会在单独的线程中执行，不会阻塞主事件循环
            response = await asyncio.to_thread(
                self.client.chat.completions.create,
                model="deepseek-reasoner",
                messages=[
                    {
                        "role": "system", 
                        "content": "你是一个专业的农业害虫分析助手。根据提供的害虫检测统计数据，分析害虫发生规律、提供防治建议，并预测可能的发展趋势。使用专业且易懂的语言，结构清晰地呈现分析结果。"
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                stream=False
            )
            
            analysis_text = response.choices[0].message.content
            
            # 解析markdown格式的回复
            return {
                "status": "success",
                "analysis": analysis_text,
                "summary": self._extract_summary(analysis_text)
            }
        except Exception as e:
            print(f"调用DeepSeek API出错: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"生成分析报告失败: {str(e)}"
            )
    
    def _build_prompt(self, data: AnalysisRequest) -> str:
        """构建提示词"""
        stats = data.statisticsData
        date_range = data.dateRange
        
        prompt = f"""
分析以下害虫检测统计数据，并提供专业的分析报告：

## 基本统计信息
- 分析时间范围: {date_range[0]} 至 {date_range[1]}
- 总检测数: {stats.get('totalDetections', 0)}个
- 害虫类型数: {stats.get('uniquePestTypes', 0)}种
- 平均置信度: {stats.get('averageConfidence', 0) * 100:.2f}%

## 害虫分布情况
"""
        # 添加害虫分布数据
        if 'pestDistribution' in stats and stats['pestDistribution']:
            for pest in stats['pestDistribution']:
                prompt += f"- {pest['name']}: {pest['value']}个\n"
        
        # 添加环比数据
        if data.comparisonData:
            prompt += "\n## 环比分析\n"
            current = data.comparisonData.get('currentData', {})
            previous = data.comparisonData.get('previousData', {})
            
            if 'total' in current and 'total' in previous:
                change = ((current['total'] - previous['total']) / previous['total'] * 100) if previous['total'] > 0 else 100
                prompt += f"- 当前周期总数: {current['total']}，上一周期总数: {previous['total']}，环比变化: {change:.2f}%\n"
        
        prompt += """
请根据以上数据提供:
1. 总体情况概述
2. 主要害虫分析（出现最多的前3种害虫）
3. 发展趋势分析
4. 防治建议
5. 风险预警（如果有必要）

使用markdown格式输出，并确保内容专业、实用且易于理解。
注意：请直接使用markdown语法，不要将整个回复包装在markdown代码块(```)中。
"""
        return prompt
    
    def _extract_summary(self, analysis_text: str) -> str:
        """从分析报告中提取摘要信息"""
        # 简单实现：取前200个字符作为摘要
        if not analysis_text:
            return "无法生成分析摘要"
        
        summary = analysis_text[:200].strip()
        if len(analysis_text) > 200:
            summary += "..."
            
        return summary

# 创建单例服务
ai_analysis_service = AIAnalysisService()