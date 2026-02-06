export interface HotStockCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  stocks: HotStock[];
}

export interface HotStock {
  code: string;
  name: string;
  market: 'SH' | 'SZ';
  reason?: string;
}

export const HOT_STOCK_CATEGORIES: HotStockCategory[] = [
  {
    id: 'blue-chip',
    name: '蓝筹权重',
    description: '沪深两市优质蓝筹股，市值大、流动性好',
    icon: '💎',
    stocks: [
      { code: '600519', name: '贵州茅台', market: 'SH', reason: '白酒龙头，A股市值之王' },
      { code: '601318', name: '中国平安', market: 'SH', reason: '保险龙头，金融权重股' },
      { code: '600036', name: '招商银行', market: 'SH', reason: '零售银行标杆' },
      { code: '000001', name: '平安银行', market: 'SZ', reason: '平安集团旗下银行' },
      { code: '601166', name: '兴业银行', market: 'SH', reason: '股份制银行龙头' },
      { code: '600000', name: '浦发银行', market: 'SH', reason: '上海本地银行股' },
      { code: '000002', name: '万科A', market: 'SZ', reason: '地产龙头' },
      { code: '600837', name: '海通证券', market: 'SH', reason: '大型券商' },
      { code: '000333', name: '美的集团', market: 'SZ', reason: '家电龙头' },
      { code: '000651', name: '格力电器', market: 'SZ', reason: '空调龙头' },
    ],
  },
  {
    id: 'tech',
    name: '科技创新',
    description: '科技、互联网、新能源等成长型股票',
    icon: '🚀',
    stocks: [
      { code: '300750', name: '宁德时代', market: 'SZ', reason: '电池龙头，新能源核心' },
      { code: '300059', name: '东方财富', market: 'SZ', reason: '互联网金融平台' },
      { code: '002594', name: '比亚迪', market: 'SZ', reason: '新能源汽车龙头' },
      { code: '600276', name: '恒瑞医药', market: 'SH', reason: '医药研发龙头' },
      { code: '000725', name: '京东方A', market: 'SZ', reason: '面板显示龙头' },
      { code: '002475', name: '立讯精密', market: 'SZ', reason: '消费电子龙头' },
      { code: '300015', name: '爱尔眼科', market: 'SZ', reason: '眼科医疗龙头' },
      { code: '688981', name: '中芯国际', market: 'SH', reason: '芯片制造龙头' },
      { code: '603019', name: '中科曙光', market: 'SH', reason: '超算龙头' },
      { code: '002415', name: '海康威视', market: 'SZ', reason: '安防监控龙头' },
    ],
  },
  {
    id: 'consumption',
    name: '消费白马',
    description: '大消费领域优质白马股',
    icon: '🛒',
    stocks: [
      { code: '600887', name: '伊利股份', market: 'SH', reason: '乳制品龙头' },
      { code: '000568', name: '泸州老窖', market: 'SZ', reason: '白酒龙头之一' },
      { code: '000596', name: '古井贡酒', market: 'SZ', reason: '知名白酒品牌' },
      { code: '600809', name: '山西汾酒', market: 'SH', reason: '清香型白酒代表' },
      { code: '000858', name: '五粮液', market: 'SZ', reason: '浓香型白酒龙头' },
      { code: '002304', name: '洋河股份', market: 'SZ', reason: '知名白酒品牌' },
      { code: '600315', name: '上海家化', market: 'SH', reason: '日化龙头' },
      { code: '000895', name: '双汇发展', market: 'SZ', reason: '肉制品龙头' },
      { code: '002557', name: '洽洽食品', market: 'SZ', reason: '坚果零食龙头' },
      { code: '603288', name: '海天味业', market: 'SH', reason: '调味品龙头' },
    ],
  },
  {
    id: 'finance',
    name: '金融板块',
    description: '银行、保险、证券等金融股',
    icon: '💰',
    stocks: [
      { code: '601318', name: '中国平安', market: 'SH', reason: '综合金融集团' },
      { code: '601601', name: '中国太保', market: 'SH', reason: '保险龙头之一' },
      { code: '600030', name: '中信证券', market: 'SH', reason: '券商龙头' },
      { code: '600837', name: '海通证券', market: 'SH', reason: '大型券商' },
      { code: '600999', name: '招商证券', market: 'SH', reason: '招商局旗下券商' },
      { code: '601166', name: '兴业银行', market: 'SH', reason: '股份制银行' },
      { code: '601398', name: '工商银行', market: 'SH', reason: '宇宙行' },
      { code: '601288', name: '农业银行', market: 'SH', reason: '大型国有银行' },
      { code: '600036', name: '招商银行', market: 'SH', reason: '零售之王' },
      { code: '000001', name: '平安银行', market: 'SZ', reason: '零售银行' },
    ],
  },
  {
    id: 'healthcare',
    name: '医药健康',
    description: '医药、医疗器械、医疗服务',
    icon: '💊',
    stocks: [
      { code: '600276', name: '恒瑞医药', market: 'SH', reason: '创新药龙头' },
      { code: '000661', name: '长春高新', market: 'SZ', reason: '生长激素龙头' },
      { code: '300015', name: '爱尔眼科', market: 'SZ', reason: '眼科医疗连锁' },
      { code: '300760', name: '迈瑞医疗', market: 'SZ', reason: '医疗器械龙头' },
      { code: '002821', name: '凯莱英', market: 'SZ', reason: 'CDMO龙头' },
      { code: '300347', name: '泰格医药', market: 'SZ', reason: 'CRO龙头' },
      { code: '600436', name: '片仔癀', market: 'SH', reason: '中药瑰宝' },
      { code: '000538', name: '云南白药', market: 'SZ', reason: '中药品牌' },
      { code: '002007', name: '华兰生物', market: 'SZ', reason: '血液制品龙头' },
      { code: '300122', name: '智飞生物', market: 'SZ', reason: '疫苗龙头' },
    ],
  },
  {
    id: 'energy',
    name: '能源新能源',
    description: '传统能源与新能源产业链',
    icon: '⚡',
    stocks: [
      { code: '300750', name: '宁德时代', market: 'SZ', reason: '动力电池全球第一' },
      { code: '002594', name: '比亚迪', market: 'SZ', reason: '新能源汽车全产业链' },
      { code: '601012', name: '隆基绿能', market: 'SH', reason: '光伏龙头' },
      { code: '300274', name: '阳光电源', market: 'SZ', reason: '逆变器龙头' },
      { code: '688599', name: '天合光能', market: 'SH', reason: '光伏组件龙头' },
      { code: '002129', name: '中环股份', market: 'SZ', reason: '硅片龙头' },
      { code: '601899', name: '紫金矿业', market: 'SH', reason: '矿业龙头' },
      { code: '600585', name: '海螺水泥', market: 'SH', reason: '水泥龙头' },
      { code: '601877', name: '正泰电器', market: 'SH', reason: '电力设备' },
      { code: '000400', name: '许继电气', market: 'SZ', reason: '特高压龙头' },
    ],
  },
];

// 所有热门股票的扁平化列表
export const ALL_HOT_STOCKS = HOT_STOCK_CATEGORIES.flatMap(category =>
  category.stocks.map(stock => ({
    ...stock,
    fullCode: `${stock.market.toLowerCase()}${stock.code}`,
    categoryId: category.id,
  }))
);

// 获取随机推荐股票
export function getRandomStocks(count: number = 10): HotStock[] {
  const shuffled = [...ALL_HOT_STOCKS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// 根据ID获取分类
export function getCategoryById(id: string): HotStockCategory | undefined {
  return HOT_STOCK_CATEGORIES.find(cat => cat.id === id);
}

// 搜索股票
export function searchHotStocks(keyword: string): HotStock[] {
  const lowerKeyword = keyword.toLowerCase();
  return ALL_HOT_STOCKS.filter(stock =>
    stock.name.includes(keyword) ||
    stock.code.includes(keyword) ||
    stock.reason?.toLowerCase().includes(keyword)
  );
}
