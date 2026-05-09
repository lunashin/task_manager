
// ##############################################
// Values
// ##############################################

// field number
const g_field_number = 4;

// names separator
const g_names_separator = '、';

// my company
const g_company = '株式会社 XYZ'

// my name
const g_name = 'XX部 XXG XXXXX'
const g_name_short = 'XXXXX'

// signature
const g_signature = `
################################
# 株式会社XX XX部 XXグループ
# XXXXX XXXXX
# TEL: XXX-XXX-XXX
# MAIL: XXXXX@XXXXX.com
################################
`;

/* ##########################
- 件名,本文で利用可能な変数
{today}: 今日の日付 (yyyy/mm/dd)
{today_w}: 今日の日付 (yyyy/mm/dd(曜日))
{today_s}: 今日の日付 (mm/dd)
{today_sw}: 今日の日付 (mm/dd(曜日))
{name}: g_name 変数の内容 (本ファイルで定義)
{name_s}: g_name_short 変数の内容 (本ファイルで定義)
{signature}: g_signature 変数の内容 (本ファイルで定義)
{to_names}: TO宛先の人名一覧(g_names_separator 変数で区切り)
{cc_names}: CC宛先の人名一覧(g_names_separator 変数で区切り)

- param属性の書き方
(作成中)

########################## */

// data
const g_address_list = [
  {
    name: 'グループメンバー(全員)',
    type: "address",
    field: 1,
    address: {
      'aaa@hoge.com': 'aaaさん',
      'bbb@hoge.com': 'bbbさん',
      'ccc@hoge.com': 'cccさん',
      'ddd@hoge.com': 'dddさん',
    },
  },
  {
    name: '外注会社(MGのみ)',
    type: "address",
    field: 2,
    address: {
      'hogehoge@ohayo-.com': 'hogehoge',
      'hello@ohayo-.com': 'hello',
      'JOJO@ohayo-.com': 'JOJO',
      'Joseph@ohayo-.com': 'Joseph',
    },
  },
  {
    name: '外注会社(MGのみ) 2',
    type: "address",
    field: 2,
    address: {
      'hogehoge@ohayo-.com': 'hogehoge',
      'hello@ohayo-.com': 'hello',
      'JOJO@ohayo-.com': 'JOJO',
      'Joseph@ohayo-.com': 'Joseph',
    },
  },
  {
    name: 'グループ(MG)',
    type: "address",
    field: 1,
    address: {
      'hogehoge@sample.com': 'hogehoge',
      'hello@sample.com': 'hello',
    },
  },
  {
    name: 'ほげほげ株式会社(MG)',
    type: "address",
    field: 3,
    address: {
      'hogehoge@ohayo-.com': 'hogehoge',
      'hello@ohayo-.com': 'hello',
      'JOJO@ohayo-.com': 'JOJO',
      'Joseph@ohayo-.com': 'Joseph',
    },
  },
  {
    name: 'ほげほげ株式会社(開発メンバー)',
    type: "address",
    field: 3,
    address: {
      'hogehoge@ohayo-.com': 'hogehoge',
      'hello@ohayo-.com': 'hello',
      'JOJO@ohayo-.com': 'JOJO',
      'Joseph@ohayo-.com': 'Joseph',
    },
  },
  {
    name: 'テストメール作成',
    type: "create",
    field: 4,
    param: {
      'date': {name: '日時(full)', type: 'date'},
      'date2': {name: '日時(短い)', type: 'date_s'},
      'date3': {name: '日時(full/曜日付き)', type: 'date_w'},
      'date4': {name: '日時(短い/曜日付き)', type: 'date_sw'},
      'note': {name: '備考', type: 'string', default: 'sample note'},
    },
    address_to_name: ['グループメンバー(全員)'],
    address_cc_name: ['ほげほげ株式会社(開発メンバー)'],
    subject: 'テスト タイトル {today} {note}',
    body: `テスト
- TO宛先名一覧
{to_names}
- CC宛先名一覧
{cc_names}

- 自分の会社名
{company}

- 自分の名前
{name}
{name_s}

- 今日の日付
{today}
{today_w}
{today_s}
{today_sw}

- 入力パラメータ
{date}
{date2}
{date3}
{date4}
{note}

- 署名
{signature}
`,
  },
  {
    name: '会議案内',
    type: "create",
    field: 4,
    param: {
      'date': {name: '日時', type: 'date_sw'},
      'url': {name: 'URL', type: 'string', default: 'http://test.com'},
      'note': {name: '備考', type: 'string', default: 'sample note'},
    },
    address_to_name: ['グループメンバー(全員)', 'グループ(MG)'],
    address_cc_name: ['ほげほげ株式会社(開発メンバー)'],
    subject: 'XX会議の案内 [日時: {date}]',
    body: `XX部
{to_names}
(CC: {cc_names})

お疲れ様です。{company} {name}です。

表題の件ですが、以下の通りご連絡いたします。
尚、本日({today_sw})夕方には資料を展開予定です。

- 日時: {date}
- 場所: XX棟 302 会議室
- 参加者: XX部 XXGrメンバー
- URL: {url}
- 備考: {note}

以上、よろしくお願いします。

{signature}
`,
  },

];
