//---------------------------------------
// Global
//---------------------------------------



//---------------------------------------
// Data
//---------------------------------------
const timelineHeight = '250px';

// 全リスト フィルタボタン設定
// const g_filters = [
//   '',
//   'SO',
//   '旅行',
//   'タスク',
//   'Cyber',
//   '休み',
//   'テスト',
//   'ほげ',
// ];

// 全リスト フィルタボタン設定
const g_filtersEx = [
  { name: '全て', word: '', select: ''},
  { name: 'SO', word: '^SO' },
  { name: '旅行', word: '旅行' },
  { name: 'タスク', word: '^タスク' },
  { name: 'Cyber', word: 'Cyber' },
  { name: '休み', word: '休み' },
  { name: 'テスト', word: '^テスト' },
  { name: 'ほげ', word: 'ほげ' },
  { name: 'aaa', word: 'aaa' },
  { name: 'bbb', word: 'bbb' },
  { name: 'ccc', word: 'ccc' },
  { name: '🌏URL', word: 'URL', has_url: true },
  { name: '📥Mail', word: '', has_mail: true },
  { name: '📓Note', word: '', has_note: true },
  { name: '💤待ち', word: '', is_wait: true },
  { name: '🔴優先', word: '', priority: true },
  { name: '❤️', word: '', is_group_favorite: true },
  { name: '今日', word: '', is_today: true },
];

// 全リスト 検索文字列の選択肢
const g_StockListFilterTexts = [
  'テスト',
  '旅行',
  'aaa',
]