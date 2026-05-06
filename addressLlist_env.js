
// ##############################################
// Values
// ##############################################

// field number
const g_field_number = 3;

// names separator
const g_names_separator = '、';

// from name
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
    name: 'メール作成テスト',
    type: "create",
    field: 3,
    param_input: {},
    address_to_name: ['グループメンバー(全員)'],
    address_cc_name: ['ほげほげ株式会社(開発メンバー)'],
    subject: 'テスト タイトル',
    body: `テスト 本文`,
  },
  {
    name: '会議案内',
    type: "create",
    field: 3,
    // param_input: ['日時(yyyy/dd/mm hh:mm)', 'URL','備考'],
    param_input: {'日時': 'date', 'URL':'string', '備考':'string' },
    address_to_name: ['グループメンバー(全員)', 'グループ(MG)'],
    address_cc_name: ['ほげほげ株式会社(開発メンバー)'],
    subject: 'XX会議の案内 [日時: {0}]',
    body: `XX部
{to_names}
(CC: {cc_names})

お疲れ様です。{name}です。

表題の件ですが、以下の通りご連絡いたします。
尚、本日({today})夕方には資料を展開予定です。

- 日時: {0}
- 場所: XX棟 302 会議室
- 参加者: XX部 XXGrメンバー
- URL: {1}
- 備考: {2}

以上、よろしくお願いします。

{signature}
`,
  },
];
