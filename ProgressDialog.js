//---------------------------------------
// Global
//---------------------------------------



//---------------------------------------
// Class
//---------------------------------------
/**
 * 進捗管理ダイアログ
 */
class ProgressDialog {

  /**
   * @summary コンストラクタ
   * @param タスク名領域の要素ID
   * @param 進捗内容領域の要素ID
   * @param タスク名領域keydownイベントコールバック {'イベント名': コールバック関数, ...}
   */
  constructor(title_elem_id, item_elem_id, cb_event_title = null) {
    this.title_elem_id = title_elem_id;
    this.item_elem_id= item_elem_id;
    this.cb_event_title = cb_event_title;
    this.items = null;
  }

  /**
   * @summary 画面更新
   * @param アイテム(配列)
   * @param 開始日(Date)
   */
  make(items, d_start = null) {
    this.items = items;
    let groupid_prev = null;
    for (let idx = 0; idx < items.length; idx++) {
      let item = items[idx];
      let lines = item.note.split('\n'); // noteを改行で分割
      let prev1 = '';
      let disp_notes = [];
      // 各行を処理 (後ろから回す)
      for (let k = lines.length - 1; k >= 0; k--) {
        // 日付を抽出
        let temp = lines[k].split(' ');
        let d_str = temp[0];
        if (temp.length >= 2) {
          if (temp[0].split('/').length <= 2) {
            d_str = '2026/' + d_str;
          }
        }
        // 今日のコメント + 昨日以前のコメント1 のリストを作成
        let days_diff = get_days_from_today(d_str);
        if (days_diff > 0) {
          prev1 = lines[k];
        } else if (days_diff === 0) {
          if (prev1 !== '') {
            disp_notes.push({content: prev1, type: 'past'});
            prev1 = '';
          }
          disp_notes.push({content: lines[k], type: 'today'});
        }
      }
      // 今日のメモがない場合、過去の最近のメモを追加
      if (prev1 !== '') {
        disp_notes.push({content: prev1, type: 'past'});
        prev1 = '';
      }

      // グループが変わったらグループ行を作成
      let group = getInternalGroupFromItemID(item.id);
      if (groupid_prev !== group.id) {
        this.addGroupRow(group);
      }
      groupid_prev = group.id;

      // 要素を作成
      this.addItemRow(item, disp_notes);
    }
  }

  /**
   * @summary タスク列追加
   * @param アイテム
   * @param コメント情報(dict配列) / [{content: '表示文字列', type: '[past|today]'} ... ]
   */
  addItemRow(item, comments) {
    // タスク名列へ行追加
    let elem_title_div = document.getElementById(this.title_elem_id);
    let new_title_div = document.createElement("div");
    new_title_div.classList.add('progress-dialog-box-title');
    if (item.is_wait) {
      new_title_div.classList.add('progress-dialog-box-title-wait');
    }
    new_title_div.id = `progress-dialog-box-title-${item.id}`;
    new_title_div.innerText = get_before_icons(item) + ' ' + item.name + ' ' + get_after_icons(item); // 前アイコン + タスク名 + 後アイコン
    new_title_div.dataset.id = item.id;
    new_title_div.tabIndex = 0; // フォーカスを持てるようにする
    // ダブルクリックイベント
    new_title_div.addEventListener('dblclick', this.dblclick_handler_title.bind(this));
    // その他イベント
    let keys = Object.keys(this.cb_event_title);
    for (let i = 0; i < keys.length; i++) {
      new_title_div.addEventListener(keys[i], this.cb_event_title[keys[i]]);
    }
    elem_title_div.appendChild(new_title_div);

    // コメント列へ行追加
    let elem_item_div = document.getElementById(this.item_elem_id);
    let new_item_row_div = document.createElement("div");
    new_item_row_div.classList.add('progress-dialog-item-row-div');
    if (comments.length <= 0) {
      // コメントなしの場合は空のdivを置く
      let new_item_div = document.createElement("div");
      new_item_div.classList.add('progress-dialog-box-item');
      new_item_div.classList.add('progress-dialog-box-item-empty');
      new_item_row_div.appendChild(new_item_div);
    } else {
      for (let i = 0; i < comments.length; i++) {
        let new_item_div = document.createElement("div");
        new_item_div.classList.add('progress-dialog-box-item');
        if (comments[i].type === 'past') {
          new_item_div.classList.add('progress-dialog-box-item-past');
        }
        new_item_div.dataset.id = item.id;
        new_item_div.innerText = comments[i].content;

        // 最後の要素にダブルクリックイベント登録
        if (i === comments.length - 1) {
          new_item_div.addEventListener('dblclick', this.div_dblclick_item_handler.bind(this));
        }
        new_item_row_div.appendChild(new_item_div);
      }
    }
    elem_item_div.appendChild(new_item_row_div);
  }

  /**
   * @summary グループ列追加
   * @param アイテム(Group)
   */
  addGroupRow(group) {
    // タスク名列へ行追加
    let elem_title_div = document.getElementById(this.title_elem_id);
    let new_title_div = document.createElement("div");
    new_title_div.classList.add('progress-dialog-box-title-group');
    new_title_div.innerText = group.name;
    elem_title_div.appendChild(new_title_div);

    // コメント列へ行追加
    let elem_item_div = document.getElementById(this.item_elem_id);
    let new_item_row_div = document.createElement("div");
    let new_item_div = document.createElement("div");
    new_item_div.innerText = ' ';
    new_item_div.classList.add('progress-dialog-box-item-group');
    new_item_row_div.appendChild(new_item_div);

    elem_item_div.appendChild(new_item_row_div);
  }

  /**
   * @summary titleダブルクリックハンドラ
   */
  dblclick_handler_title(event) {
    // アイテムのコメントを入力
    let today_str = get_date_str(new Date(), true, false, false, false);
    // アイテムのコメントを変更
    let comment = prompt('コメント登録');
    if (comment === null || comment === '') {
      // キャンセル or 空
      return;
    }

    pushHistory();

    comment = `${today_str} ${comment}`;
    let item = getInternal(parseInt(event.target.dataset.id));
    item.note = `${comment}\n${item.note}`;
    
    // 表示更新
    this.reflesh('');
  }

  /**
   * @summary itemダブルクリックハンドラ
   */
  div_dblclick_item_handler(event) {
    // アイテムのコメントを変更
    let comment = prompt('コメント変更', event.target.innerText);
    if (comment === null || comment === '') {
      // キャンセル or 空
      return;
    }

    pushHistory();

    // コメントの先頭行を変更
    let item = getInternal(parseInt(event.target.dataset.id));
    let lines = item.note.split('\n');
    lines[0] = comment;
    item.note = lines.join('\n');
    
    // 表示更新
    this.reflesh('');
  }

  /**
   * @summary 要素 全削除
   */
  resetAll() {
    let elem_title_div = document.getElementById(this.title_elem_id);
    for (let i = elem_title_div.children.length - 1; i >= 0; i--) {
      elem_title_div.children[i].remove();
    }
    let elem_item_div = document.getElementById(this.item_elem_id);
    for (let i = elem_item_div.children.length - 1; i >= 0; i--) {
      elem_item_div.children[i].remove();
    }
  }

  /**
   * @summary 画面更新
   * @param 開始日(string)
   */
  reflesh(start_date = '') {
    this.resetAll();
    this.make(this.items, start_date);
  }
};