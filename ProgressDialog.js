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
   * @param ベース領域の要素ID
   * @param アイテム一覧取得コールバック
   * @param タスク名領域イベントコールバック {'イベント名': コールバック関数, ...}
   */
  constructor(base_elem_id, cb_get_itemlist, cb_event_title = null) {
    this.base_elem_id = base_elem_id;

    this.frame_everyday_elem_id = base_elem_id + '-frame-everyday-div';
    this.title_everyday_elem_id = base_elem_id + '-title-everyday-div';
    this.item_everyday_elem_id= base_elem_id + '-item-everyday-div';
    this.frame_elem_id = base_elem_id + '-frame-div';
    this.title_elem_id = base_elem_id + '-title-div';
    this.item_elem_id= base_elem_id + '-item-div';

    this.cb_get_itemlist = cb_get_itemlist;
    this.cb_event_title = cb_event_title;
    // this.items = null;
    this.sel_elem_id = null;
    this.base_move_info = null;
    this.group_list_popup = null;
    this.hidden_wait_task = false;
    this.only_first_task = false;

    // ベースdiv キーイベント登録
    let elem_base = document.getElementById(this.base_elem_id);
    elem_base.tabIndex = 0;
    elem_base.addEventListener('keydown', this.keydown_handler_base.bind(this));

    // マウスによるポップアップ移動設定
    this.MouseMoveCtonrolObj = new ElementMouseMoveCtonrol(this.base_elem_id);
  }

  /**
   * @summary ダイアログ表示
   * @param items(配列)
   */
  show() {
    this.make();
    let elem = document.getElementById(this.base_elem_id);

    // 画面中央部に移動
    elem.style.top = window.innerHeight/2 - elem.clientHeight/2;
    elem.style.left = window.innerWidth/2 - elem.clientWidth/2;

    elem.style.visibility = 'visible';
    elem.focus();
  }

  /**
   * @summary ダイアログを閉じる
   */
  close() {
    document.getElementById(this.base_elem_id).style.visibility = 'hidden';
  }

  /**
   * @summary 表示状態取得
   */
  is_show() {
    return (document.getElementById(this.base_elem_id).style.visibility === 'visible');
  }

  /**
   * @summary 画面更新
   * @param フォーカス移動
   */
  make(is_focus = true) {
    // フレームを作成
    this.makeInternalFrameDiv();

    // this.items = items;   // 更新用に参照を保持
    // this.make_ex(this.items, { is_first: true, is_wait: false });  // 優先アイテム(待ちアイテムは除く)
    // this.make_ex(this.items, { is_first: false, is_wait: false });  // 優先/待ちアイテム以外
    // this.make_ex(this.items, { is_wait: true });   // 待ちアイテム
    let is_first = this.only_first_task ? this.only_first_task : null;
    if (this.hidden_wait_task) {
      this.make_ex(this.cb_get_itemlist(), { is_everyday: true, is_first: is_first, is_wait: false }, this.title_everyday_elem_id, this.item_everyday_elem_id);   // 毎日のタスク
      this.make_ex(this.cb_get_itemlist(), { is_everyday: false, is_first: is_first, is_wait: false }, this.title_elem_id, this.item_elem_id);   // 今日のMUSTタスク
    } else {
      this.make_ex(this.cb_get_itemlist(), { is_everyday: true, is_first: is_first}, this.title_everyday_elem_id, this.item_everyday_elem_id);   // 毎日のタスク
      this.make_ex(this.cb_get_itemlist(), { is_everyday: false, is_first: is_first}, this.title_elem_id, this.item_elem_id);   // 今日のMUSTタスク
    }

    // フォーカス移動
    if (is_focus && this.sel_elem_id !== null) {
      let elem_focus = document.getElementById(this.sel_elem_id)
      if (elem_focus !== null) {
        document.getElementById(this.sel_elem_id).focus();
      } else {
        this.sel_elem_id = null;
      }
    }
  }

  /**
   * @summary 画面更新
   * @param アイテム(配列)
   * @param 条件(is_wait, is_first, is_everyday) ( {is_wait: true|false, is_first: true|false, is_everyday: true|false} )
   * @param 追加先タイトルdiv要素ID
   * @param 追加先コメントdiv要素ID
   */
  make_ex(items, option, title_elem_id, comment_elem_id) {
    let groupid_prev = null;
    for (let idx = 0; idx < items.length; idx++) {
      let item = items[idx];

      // オプションに応じたアイテムを処理
      if (option.is_wait != null && option.is_wait !== item.is_wait) {
        continue;
      }
      if (option.is_first != null && option.is_first !== item.is_first) {
        continue;
      }
      if (option.is_everyday != null && option.is_everyday !== item.is_everyday) {
        continue;
      }

      // グループが変わったらグループ行を作成
      let group = getInternalGroupFromItemID(item.id);
      if (groupid_prev !== group.id) {
        this.drawGroupRow(group, title_elem_id, comment_elem_id, false);
      }
      groupid_prev = group.id;

      // 行要素を描画
      this.drawItemRow(item, title_elem_id, comment_elem_id);
    }
  }

  /**
   * @summary 今日のコメントリストを作成
   * @param アイテム
   * @returns コメント情報(dictの配列) / [{content: '表示文字列', type: '[past|today]'} ... ]
   */
  get_todays_comments(item) {
    let lines = item.note.split('\n'); // noteを改行で分割
    let prev1 = '';
    let todays_notes = [];

    // メモの各行を処理 (後ろから回す)
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
        prev1 = `(${days_diff}日前) ${lines[k]}`;
      } else if (days_diff === 0) {
        if (prev1 !== '') {
          todays_notes.push({content: prev1, type: 'past'});
          prev1 = '';
        }
        todays_notes.push({content: `(本日) ${lines[k]}`, type: 'today'});
      }
    }
    // 今日のメモがない場合、過去の最近のメモを追加
    if (prev1 !== '') {
      todays_notes.push({content: prev1, type: 'past'});
      prev1 = '';
    }

    return todays_notes;
  }

  /**
   * @summary 内部の枠を作成
   */
  makeInternalFrameDiv() {
    // 一旦全削除
    this.resetAll();

    // 待ちタスク表示/非表示切り替えボタン
    let btn_toggle_wait_task = document.createElement('input');
    btn_toggle_wait_task.id = 'progress_dialog_toggle_wait_button';
    btn_toggle_wait_task.type = 'checkbox';
    btn_toggle_wait_task.classList.add('checkbox_ex');
    btn_toggle_wait_task.addEventListener('click', this.click_handler_toggle_hidden_wait.bind(this));
    btn_toggle_wait_task.checked = this.hidden_wait_task;
    let label_toggle_wait_task = document.createElement('label');
    label_toggle_wait_task.id = 'progress_dialog_toggle_wait_label';
    label_toggle_wait_task.htmlFor = 'progress_dialog_toggle_wait_button';
    label_toggle_wait_task.classList.add('checkbox_ex');
    label_toggle_wait_task.innerText = '待ちタスク非表示';
    document.getElementById(this.base_elem_id).appendChild(btn_toggle_wait_task);
    document.getElementById(this.base_elem_id).appendChild(label_toggle_wait_task);

    // 優先タスクのみ表示切り替えボタン
    let btn_toggle_first_task = document.createElement('input');
    btn_toggle_first_task.id = 'progress_dialog_toggle_first_button';
    btn_toggle_first_task.type = 'checkbox';
    btn_toggle_first_task.classList.add('checkbox_ex');
    btn_toggle_first_task.addEventListener('click', this.click_handler_toggle_only_first_task.bind(this));
    btn_toggle_first_task.checked = this.only_first_task;
    let label_toggle_first_task = document.createElement('label');
    label_toggle_first_task.id = 'progress_dialog_toggle_first_label';
    label_toggle_first_task.htmlFor = 'progress_dialog_toggle_first_button';
    label_toggle_first_task.classList.add('checkbox_ex');
    label_toggle_first_task.innerText = '優先タスクのみ';
    document.getElementById(this.base_elem_id).appendChild(btn_toggle_first_task);
    document.getElementById(this.base_elem_id).appendChild(label_toggle_first_task);

    // title/item div格納フレーム
    let frame_outer_div = document.createElement('div');
    frame_outer_div.classList.add('progress-dialog-frame-outer-div');

    // 内部フレーム(毎日のタスク用)
    let frame_everyday_div = document.createElement('div');
    frame_everyday_div.id = this.frame_everyday_elem_id;
    frame_everyday_div.classList.add('progress-dialog-frame-everyday-div');
    // タイトル列div
    let title_everyday_div = document.createElement('div');
    title_everyday_div.id = this.title_everyday_elem_id;
    title_everyday_div.classList.add('progress-dialog-title-div');
    frame_everyday_div.appendChild(title_everyday_div);
    // コメント列div
    let item_everyday_div = document.createElement('div');
    item_everyday_div.id = this.item_everyday_elem_id;
    item_everyday_div.classList.add('progress-dialog-item-div');
    frame_everyday_div.appendChild(item_everyday_div);
    frame_outer_div.appendChild(frame_everyday_div);

    // 内部フレーム(今日のMUSTタスク用)
    let frame_div = document.createElement('div');
    frame_div.id = this.frame_elem_id;
    frame_div.classList.add('progress-dialog-frame-div');
    // タイトル列div
    let title_div = document.createElement('div');
    title_div.id = this.title_elem_id;
    title_div.classList.add('progress-dialog-title-div');
    frame_div.appendChild(title_div);
    // コメント列div
    let item_div = document.createElement('div');
    item_div.id = this.item_elem_id;
    item_div.classList.add('progress-dialog-item-div');
    frame_div.appendChild(item_div);
    frame_outer_div.appendChild(frame_div)

    document.getElementById(this.base_elem_id).appendChild(frame_outer_div);
  }

  /**
   * @summary タスク・コメント描画
   * @param アイテム
   * @param 追加先タイトルdiv要素ID
   * @param 追加先コメントdiv要素ID
   */
  drawItemRow(item, title_elem_id, comment_elem_id) {
    // タイトル名列 描画(既にあれば更新)
    this.drawItemRowTitle(item, title_elem_id);
    // コメント列 描画
    this.drawItemRowComment(item, comment_elem_id);
  }

  /**
   * @summary タイトル列描画
   * @param アイテム
   * @param 追加先タイトル列div要素ID
   * @param 更新
   */
  drawItemRowTitle(item, title_elem_id) {
    let title_div_id = `progress-dialog-box-title-${item.id}`;
    let is_update = (document.getElementById(title_div_id) !== null);

    let elem_title_div = document.getElementById(title_elem_id);
    
    // タスク名列へ行追加
    let new_title_frame = null;
    if (!is_update) {
      new_title_frame = document.createElement("div");
      new_title_frame.id = `progress-dialog-box-title-frame-${item.id}`;
      new_title_frame.classList.add('progress-dialog-box-title-frame');
      let new_title_space = document.createElement("div");
      new_title_space.classList.add('progress-dialog-box-title-space'); // 左側のスペース
      new_title_frame.appendChild(new_title_space);
    }

    // タイトル用div作成
    let new_title_div = document.getElementById(title_div_id);
    if (!is_update) {
      new_title_div = document.createElement("div");
      new_title_div.id = title_div_id;
    } else {
      // 要素をクリア
      for (let i = new_title_div.children.length - 1; i >= 0; i--) {
        new_title_div.children[i].remove();
      }
      new_title_div.classList.remove(...new_title_div.classList);
    }

    // 表示対象ではなければ削除
    if(!this.is_target_item(item.id)) {
      let frame = document.getElementById(`progress-dialog-box-title-frame-${item.id}`);
      if (frame !== null) {
        frame.remove();
      }
      return;
    }

    // class
    new_title_div.classList.add('progress-dialog-box-title');
    if (item.is_wait) {
      new_title_div.classList.add('progress-dialog-box-title-wait');
    }
    if (item.is_first) {
      new_title_div.classList.add('progress-dialog-box-title-first');
    }

    // 属性
    let period_date = item.period_end !== '' ? item.period_end : item.period;
    let period_days = period_date !== '' ? ' (⌛' + get_display_date_str(period_date) + ')' : '';
    new_title_div.innerText = get_before_icons(item) + ' ' + item.name + ' ' + get_after_icons(item) + period_days; // 前アイコン + タスク名 + 後アイコン + 期限までの日数
    new_title_div.dataset.id = item.id;
    new_title_div.tabIndex = 0; // フォーカスを持てるようにする
    new_title_div.draggable = true; // ドラッグ可

    // 期限間近バッチ(今日 or 1日後)
    if (period_date !== '') {
      let days = get_days_from_today(period_date, true);
      if (days === 0) {
        let badge = document.createElement("div");
        badge.innerText = '本日'
        badge.classList.add('progress-dialog-box-title-badge-today');
        new_title_div.appendChild(badge);
      } else if (days === -1) {
        let badge = document.createElement("div");
        badge.innerText = '1日後'
        badge.classList.add('progress-dialog-box-title-badge-1dayafter');
        new_title_div.appendChild(badge);
      } else if (days === -2) {
        let badge = document.createElement("div");
        badge.innerText = '2日後'
        badge.classList.add('progress-dialog-box-title-badge-2dayafter');
        new_title_div.appendChild(badge);
      } else if (days >= 1) {
        let badge = document.createElement("div");
        badge.innerText = '期限切れ'
        badge.classList.add('progress-dialog-box-title-badge-expired');
        new_title_div.appendChild(badge);
      }
    }

    if (!is_update) {
      // クリックイベント
      new_title_div.addEventListener('dblclick', this.dblclick_handler_title.bind(this));
      new_title_div.addEventListener('click', this.click_handler_title.bind(this));
      // ドラッグイベント
      new_title_div.addEventListener("dragstart", this.dragStart_handler_title.bind(this));
      new_title_div.addEventListener("dragend", this.dragEnd_handler_title.bind(this));
      // その他イベント
      let keys = Object.keys(this.cb_event_title);
      for (let i = 0; i < keys.length; i++) {
        new_title_div.addEventListener(keys[i], this.cb_event_title[keys[i]]);
      }

      // 親要素へ追加
      new_title_frame.appendChild(new_title_div);
      elem_title_div.appendChild(new_title_frame);
    }
  }

  /**
   * @summary コメント列へ行追加
   * @param アイテム
   * @param コメント
   * @param 追加先コメント列div要素ID
   */
  drawItemRowComment(item, comment_elem_id) {
    let comment_row_div_id = `progress-dialog-box-item-row-${item.id}`;
    let is_update = (document.getElementById(comment_row_div_id) !== null);

    // 追加先コメント列div
    let elem_item_div = document.getElementById(comment_elem_id);

    // コメント行div作成
    let new_comment_row_div = document.getElementById(comment_row_div_id);
    if (!is_update) {
      new_comment_row_div = document.createElement("div");
      new_comment_row_div.id = comment_row_div_id;
      new_comment_row_div.classList.add('progress-dialog-item-row-div');
    }

    // 表示対象ではなければ削除
    if(!this.is_target_item(item.id)) {
      new_comment_row_div.remove();
      return;
    }

    // 全てのコメントdivを削除
    if(is_update) {
      for (let i = new_comment_row_div.children.length - 1; i >= 0; i--) {
        new_comment_row_div.children[i].remove();
      }
    }

    // 今日のコメントリスト取得
    let comments = this.get_todays_comments(item);

    if (comments.length <= 0) {
      // コメントなしの場合は空のdivを置く
      let new_comment_div = document.createElement("div");
      new_comment_div.classList.add('progress-dialog-box-item');
      new_comment_div.classList.add('progress-dialog-box-item-empty');
      new_comment_row_div.appendChild(new_comment_div);
    } else {
      // コメントdiv作成
      for (let i = 0; i < comments.length; i++) {
        let new_comment_div = document.createElement("div");
        new_comment_div.classList.add('progress-dialog-box-item');
        if (comments[i].type === 'past') {
          new_comment_div.classList.add('progress-dialog-box-item-past');
        }
        new_comment_div.dataset.id = item.id;
        new_comment_div.innerText = comments[i].content;

        // 最後の要素にダブルクリックイベント登録
        if (i === comments.length - 1) {
          new_comment_div.addEventListener('dblclick', this.div_dblclick_item_handler.bind(this));
        }
        new_comment_row_div.appendChild(new_comment_div);
      }
    }
    if (!is_update) {
      elem_item_div.appendChild(new_comment_row_div);
    }
  }

  /**
   * @summary グループ列追加
   * @param アイテム(Group)
   * @param 追加先タイトルdiv要素ID
   * @param 追加先コメントdiv要素ID
   */
  drawGroupRow(group, title_col_elem_id, comment_col_elem_id, check_has_target = false) {
    let elem_title_id = `progress-dialog-box-title-group-${group.id}`;
    let elem_comment_id = `progress-dialog-box-comment-group-${group.id}`;
    let is_update = (document.getElementById(elem_title_id) !== null);

    // タスク名列へ行追加
    if (!is_update) {
      let elem_title_div = document.getElementById(title_col_elem_id);
      let new_title_div = document.createElement("div");
      new_title_div.id = elem_title_id;
      new_title_div.classList.add('progress-dialog-box-title-group');
      new_title_div.innerText = group.name;
      new_title_div.dataset.id = group.id;
      // ドロップイベント
      new_title_div.addEventListener("drop", this.drop_handler_title_group.bind(this));
      new_title_div.addEventListener("dragover", this.dragover_handler_title_group.bind(this));
      new_title_div.addEventListener("dragenter", this.dragenter_handler_title_group.bind(this));
      new_title_div.addEventListener("dragleave", this.dragleave_handler_title_group.bind(this));
      // 子要素へ追加
      elem_title_div.appendChild(new_title_div);
      
      // コメント列へ行追加
      let elem_item_div = document.getElementById(comment_col_elem_id);
      let new_item_row_div = document.createElement("div");
      new_item_row_div.id = elem_comment_id;
      let new_item_div = document.createElement("div");
      new_item_div.innerText = ' ';
      new_item_div.classList.add('progress-dialog-box-item-group');
      new_item_row_div.appendChild(new_item_div);
      
      elem_item_div.appendChild(new_item_row_div);
    } else {
      // 該当グループに表示アイテムがあるか確認し、無ければ削除
      if (check_has_target && this.has_target_items_in_group(group.id)) {
        document.getElementById(elem_title_id).remove();
        document.getElementById(elem_comment_id).remove();
      }
    }
  }

  /**
   * @summary 描画対象アイテムかどうか判定
   * @param アイテムID
   * @returns true:対象 / false:対象ではない
   */
  is_target_item(id) {
    let items = this.cb_get_itemlist();
    for (let idx = 0; idx < items.length; idx++) {
      if(items[idx].id === id) {
        return true;
      }
    }
    return false;
  }

  /**
   * @summary グループに描画対象アイテムがあるかどうか判定
   * @param グループID
   * @returns true:対象がある / false:対象がない
   */
  has_target_items_in_group(group_id) {
    let group = getInternal(group_id);
    for (const item of group.sub_tasks) {
      if (this.is_target_item(item.id)) {
        return true;
      }
    }
    return false;
  }

  /**
   * @summary ベースdiv キーハンドラ
   */
  keydown_handler_base(event) {
    switch (event.keyCode){
      case key_esc:
        event.preventDefault(); // 既定の動作をキャンセル
        this.close();
        break;
    }
  }

  /**
   * @summary 待ちタスク非表示ボタン クリックハンドラ
   */
  click_handler_toggle_hidden_wait(event) {
    this.hidden_wait_task = !this.hidden_wait_task;
    this.make();
  }

  /**
   * @summary 優先タスクのみ表示ボタン クリックハンドラ
   */
  click_handler_toggle_only_first_task(event) {
    this.only_first_task = !this.only_first_task;
    this.make();
  }

  /**
   * @summary titleクリックハンドラ
   */
  click_handler_title(event) {
    // クリックされた要素IDを記憶する
    this.sel_elem_id = event.target.id;
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
    item.last_progress_updated = get_today_str(true, true, true);

    // 表示更新
    this.reflesh(item.id);
  }

  /**
   * @summary titleドラッグ開始ハンドラ
   */
  dragStart_handler_title(event) {
    console.log("onDragStart");
    event.dataTransfer.setData("text", event.currentTarget.dataset.id); // アイテムID

    // グループ一覧ポップアップ表示
    this.group_list_popup = new GruopListPopup('popup_group_list_div', 'drop', {'drop': this.drop_handler_title_group.bind(this) });
    this.group_list_popup.show(get_group_ids(g_stock_filter));
  }

  /**
   * @summary titleドラッグ終了ハンドラ
   */
  dragEnd_handler_title(event) {
    console.log("onDragEnd");
    this.group_list_popup.close();
  }

  /**
   * @summary title dropハンドラ
   */
  drop_handler_title_group(event) {
    console.log("onDrop");
    event.currentTarget.classList.remove("progress-dialog-box-title-group-dragging");  // ドロップ先要素のクラス変更

    // アイテムのグループを移動
    let item_id = parseInt(event.dataTransfer.getData("text"));
    let group_id = parseInt(event.currentTarget.dataset.id);

    // 同じグループの場合は何もしない
    if (group_id === getInternalGroupFromItemID(item_id).id) {
      return;
    }

    // グループ移動
    pushHistory();
    moveIntarnalDataToGroup(group_id, item_id, false);

    // 表示更新
    this.reflesh();
  }

  /**
   * @summary title dragoverハンドラ
   */
  dragover_handler_title_group(event) {
    event.preventDefault();
  }

  /**
   * @summary title dragenterハンドラ
   */
  dragenter_handler_title_group(event) {
    console.log("onDragenter");
    event.currentTarget.classList.toggle("progress-dialog-box-title-group-dragging");  // ドロップ先要素のクラス変更
  }

  /**
   * @summary title dragleaveハンドラ
   */
  dragleave_handler_title_group(event) {
    console.log("onDragleave");
    event.currentTarget.classList.toggle("progress-dialog-box-title-group-dragging");  // ドロップ先要素のクラス変更
  }

  /**
   * @summary itemダブルクリックハンドラ
   */
  div_dblclick_item_handler(event) {
    // アイテムのコメントを変更
    let input_initial = event.target.innerText;
    if (event.target.innerText.split(' ').length > 2) {
      // 先頭の「(xx日前)」を削除
      let temp_list = event.target.innerText.split(' ');
      temp_list.splice(0,1);
      input_initial = temp_list.join(' ');
    }
    let comment = prompt('コメント変更', input_initial);
    if (comment === null) {
      // キャンセル
      return;
    }

    pushHistory();

    // コメントの先頭行を変更
    let item = getInternal(parseInt(event.target.dataset.id));
    let lines = item.note.split('\n');
    if (comment === '') {
      // 空の場合は削除
      lines.splice(0,1);
    } else {
      lines[0] = comment;
    }
    item.note = lines.join('\n');
    item.last_progress_updated = get_today_str(true, true, true);

    // 表示更新
    this.reflesh(item.id);
  }

  /**
   * @summary 要素 全削除
   */
  resetAll() {
    // ポップアップ内の要素を削除
    let elem_base = document.getElementById(this.base_elem_id);
    if (elem_base !== null) {
      for (let i = elem_base.children.length - 1; i >= 0; i--) {
        elem_base.children[i].remove();
      }
    }
  }

  /**
   * @summary 画面更新
   * @param 更新対象アイテムID(nullは全削除＆全更新)
   * @param フォーカス移動するかどうか
   */
  reflesh(item_id = null, is_focus = true) {
    if (item_id !== null) {
      let item = getInternal(item_id);
      if (item == null) {
        item = {id: item_id}; // nullの場合は削除された可能性があるため、idだけ渡す
      }
      // アイテム行・コメント行 描画
      this.drawItemRow(item, this.title_elem_id, this.item_elem_id);
  } else {
      this.resetAll();
      this.make(is_focus);
    }
    // if (items !== null) {
    //   this.make(items);
    // } else {
    //   this.make(this.items);
    // }
  }
};