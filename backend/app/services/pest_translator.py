"""
害虫中英文对照表
基于 IP102 数据集（46 类害虫） + 农业领域常见中文名

数据来源:
- IP102 数据集类别名称 (v1/v2)
- 农业农村部公开害虫名录
- 国内农技推广常用译名

格式: 英文名(模型输出) -> 中文名(展示给用户)
中文名优先采用通俗易懂的农业推广名，括号内备注学名或别称。
"""
from typing import Dict, List, Optional


# 主映射表
PEST_NAME_ZH: Dict[str, str] = {
    "rice leaf roller": "稻纵卷叶螟",
    "rice gall midge": "稻瘿蚊",
    "rice water weevil": "稻水象甲",
    "grub": "蛴螬（金龟子幼虫）",
    "mole cricket": "蝼蛄",
    "wireworm": "金针虫（叩甲幼虫）",
    "black cutworm": "小地老虎",
    "red spider": "红蜘蛛（叶螨）",
    "corn borer": "玉米螟",
    "aphids": "蚜虫",
    "Potosiabre vitarsis": "黄足黄守瓜",
    "peach borer": "桃小食心虫",
    "penthaleus major": "麦圆蜘蛛",
    "longlegged spider mite": "长腿蜘蛛螨",
    "wheat phloeothrips": "麦管蓟马",
    "wheat sawfly": "小麦叶蜂",
    "beet fly": "甜菜潜叶蝇",
    "flea beetle": "跳甲",
    "Locustoidea": "蝗虫",
    "legume blister beetle": "豆芫菁",
    "blister beetle": "芫菁",
    "Thrips": "蓟马",
    "Viteus vitifoliae": "葡萄根瘤蚜",
    "Colomerus vitis": "葡萄瘿螨",
    "oides decempunctata": "十星瓢虫",
    "Polyphagotars onemus latus": "茶黄蓟马（侧多食跗线螨）",
    "Pseudococcus comstocki Kuwana": "康氏粉蚧",
    "parathrene regalis": "葡萄透翅蛾",
    "Ampelophaga": "葡萄天蛾",
    "Lycorma delicatula": "斑衣蜡蝉",
    "Xylotrechus": "虎天牛",
    "Cicadella viridis": "大青叶蝉",
    "Miridae": "盲蝽",
    "Phyllocoptes oleiverus ashmead": "油橄榄瘿螨",
    "Icerya purchasi Maskell": "吹绵蚧",
    "Unaspis yanonensis": "矢尖蚧",
    "Ceroplastes rubens": "红蜡蚧",
    "Parlatoria zizyphus Lucus": "枣糠蚧",
    "Dacus dorsalis(Hendel)": "橘小实蝇",
    "Prodenia litura": "斜纹夜蛾",
    "Adristyrannus": "长吻蝽",
    "Phyllocnistis citrella Stainton": "柑橘潜叶蛾",
    "Lawana imitata Melichar": "白蛾蜡蝉",
    "Salurnis marginella Guerr": "褐缘蛾蜡蝉",
    "Rhytidodera bowrinii white": "芒果天牛",
    "Cicadellidae": "叶蝉",
}

# 类别 ID（按模型训练时的顺序，与 detector 输出一致）
# 数字索引必须与 YOLO 模型加载时打印的顺序保持一致
PEST_ID_TO_ZH: Dict[int, str] = {i: PEST_NAME_ZH[name] for i, name in enumerate(PEST_NAME_ZH.keys())}


def to_chinese(english_name: str) -> str:
    """
    将英文害虫名翻译成中文。

    Args:
        english_name: 模型输出的英文类别名

    Returns:
        中文害虫名（如果未找到映射则返回原英文名）
    """
    if not english_name:
        return english_name
    # 精确匹配
    if english_name in PEST_NAME_ZH:
        return PEST_NAME_ZH[english_name]
    # 大小写不敏感匹配
    for en, zh in PEST_NAME_ZH.items():
        if en.lower() == english_name.lower():
            return zh
    # 找不到就返回原名
    return english_name


def to_chinese_by_id(class_id: int) -> str:
    """
    根据类别 ID 翻译成中文（不依赖英文名）。
    """
    return PEST_ID_TO_ZH.get(class_id, f"未知害虫(类别 {class_id})")


def get_pest_aliases(english_name: str) -> List[str]:
    """
    返回害虫的别名列表（用于前端展示更多信息）。
    """
    # 一些常见害虫的别名映射
    aliases_map = {
        "aphids": ["腻虫", "蜜虫"],
        "rice leaf roller": ["卷叶虫", "稻纵卷叶虫"],
        "red spider": ["叶螨", "蜘蛛螨"],
        "Locustoidea": ["蝗虫", "蚱蜢"],
        "Thrips": ["蓟马"],
    }
    return aliases_map.get(english_name, [])


def search_pest(keyword: str) -> List[Dict[str, str]]:
    """
    根据关键词（中英文皆可）搜索害虫。

    Returns:
        [{"en": "...", "zh": "...", "aliases": ["..."]}, ...]
    """
    results = []
    keyword_lower = keyword.lower()
    for en, zh in PEST_NAME_ZH.items():
        if keyword_lower in en.lower() or keyword in zh:
            results.append({
                "en": en,
                "zh": zh,
                "aliases": get_pest_aliases(en),
            })
    return results
