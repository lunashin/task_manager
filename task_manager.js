//---------------------------------------
// Global
//---------------------------------------



//---------------------------------------
// Data
//---------------------------------------

// Element ID
const elem_id_list_stock = 'stock_list';
const elem_id_list_today = 'todays_list';
const elem_id_list_done = 'done_list';
const elem_id_list_tomorrow = 'tomorrow_list';


// key code
// https://developer.mozilla.org/ja/docs/Web/API/KeyboardEvent/keyCode
const key_enter = 13;
const key_a = 65;
const key_c = 67;
const key_d = 68;
const key_f = 70;
const key_n = 78;
const key_s = 83;
const key_z = 90;
const key_arrow_left = 37;
const key_arrow_up = 38;
const key_arrow_right = 39;
const key_arrow_down = 40;
const key_space = 32;
const key_esc = 27;

/* 内部リストデータ
 * {
 *   'タスク名': name:'', period:'yyyy/mm/dd', sub_tasks: [ 
 *     {id: 1, name: '子タスク名', status:'yet|done', is_today: 0|1|2, last_update: '' }, {...} ], 
 *     ...
 * }
 */
var g_list_data = {};
// 内部リスト 次回追加時のID
const g_initial_group_id = 10000;
var g_last_group_id = g_initial_group_id;
var g_last_id = 0;

// 全リストのフィルタ
// {name: '[文字列]', has_url: [true|false], has_mail: [true|false], has_note: [true|false], is_wait: [true|false] };
var g_stock_filter = '';
var g_stock_filter_id = 0;

// 編集履歴
var g_list_history = [];
const g_list_history_num = 20;

// 今日の済みタスク表示フラグ (true:表示する / false:表示しない)
var g_is_show_todays_done = false;
// 今日のタスク ロック状態
var g_lock_todays_task = false;

// 編集ポップアップ表示状態
var g_show_popup = false;
var g_show_popup_list = '';

// timeline Object
var timeline = null;
// 表示する日付範囲
const past_days = 2;
const post_days = 8;

// ファイル名
// const g_mail_flag = 'timeline_mail_flag.js.txt';
// const g_meeting_script = 'timeline_tasks.js';
const g_mail_flag = '../timeline_mail_flag.js.txt';
const g_meeting_script = '../timeline_tasks.js';




//---------------------------------------
// Event
//---------------------------------------
// Click Event
document.getElementById(elem_id_list_stock).addEventListener("click", click_handler_stock_list);
document.getElementById(elem_id_list_stock).addEventListener("dblclick", move_today_item);
document.getElementById(elem_id_list_today).addEventListener("dblclick", done_item);
document.getElementById(elem_id_list_today).addEventListener("click", click_handler_todays_list);
document.getElementById(elem_id_list_done).addEventListener("dblclick", return_item);

// Click Event
// regist
document.getElementById("btn_input_reflect").addEventListener("click", regist_from_textarea);
document.getElementById("btn_input_json").addEventListener("click", regist_from_json);

// stock list
document.getElementById("copy_stock_list").addEventListener("click", copy_stock_list);

// todays list
document.getElementById("copy_todays_list").addEventListener("click", copy_todays_list);

document.getElementById("release_todays_add_task").addEventListener("click", release_todays_add_task);
// document.getElementById("set_first_task").addEventListener("click", toggle_todays_first_task);
// document.getElementById("clear_first_task").addEventListener("click", clear_first_task);
document.getElementById("toggle_show_done").addEventListener("click", toggle_show_todays_done);
document.getElementById("lock_todays_task").addEventListener("click", toggle_lock_todays_task);

// done list
document.getElementById("copy_done_list").addEventListener("click", copy_todays_done_list);
document.getElementById("release_todays_done").addEventListener("click", release_todays_done);

// tomorrow list
document.getElementById("release_tomorrow").addEventListener("click", release_tomorrow_item);


// other
document.getElementById("save").addEventListener("click", save_data);
document.getElementById("load").addEventListener("click", load_data);
document.getElementById("add_item").addEventListener("click", add_items);
document.getElementById("remove_item").addEventListener("click", remove_selected_item_stock_list);
document.getElementById("undo").addEventListener("click", undo_item);
document.getElementById("copy_now_json").addEventListener("click", copy_now_json);
document.getElementById("download_now_json").addEventListener("click", download_now_json);
document.getElementById("import_mail_flag").addEventListener("click", read_mail_flag);
document.getElementById("import_todays_meeting").addEventListener("click", read_todays_meeting);
document.getElementById("import_tomorrows_meeting").addEventListener("click", read_tomorrows_meeting);

// Popup
document.getElementById("popup_edit_form").addEventListener("submit", submit_edit_popup);
document.getElementById("popup_edit_cancel_btn").addEventListener("click", close_edit_popup);
// Popup(multi)
document.getElementById("popup_edit_multi_form").addEventListener("submit", submit_edit_multi_popup);
document.getElementById("popup_edit_multi_cancel_btn").addEventListener("click", close_edit_multi_popup);


// document.querySelectorAll(".td_edit").forEach(function(elem) { elem.addEventListener('click', click_stock_list_item); });

// Key event
document.getElementById(elem_id_list_stock).addEventListener("keydown", keyhandler_stock_list);
document.getElementById(elem_id_list_today).addEventListener("keydown", keyhandler_todays_list);
document.getElementById(elem_id_list_done).addEventListener("keydown", keyhandler_done_list);
document.getElementById(elem_id_list_tomorrow).addEventListener("keydown", keyhandler_tomorroy_list);
document.getElementById("popup_edit_base").addEventListener("keydown", keyhandler_edit_popup);
document.getElementById("popup_edit_multi_base").addEventListener("keydown", keyhandler_edit_popup_multi);

// wheel event
document.getElementById(elem_id_list_stock).addEventListener("wheel", wheelhandler_stock_list);

// Right Click
document.getElementById(elem_id_list_stock).addEventListener("contextmenu", contextmenu_handler_list);
document.getElementById(elem_id_list_today).addEventListener("contextmenu", contextmenu_handler_list);
document.getElementById(elem_id_list_done).addEventListener("contextmenu", contextmenu_handler_list);
document.getElementById(elem_id_list_tomorrow).addEventListener("contextmenu", contextmenu_handler_list);


// Popup
// 期限（今日にセットするボタン）
document.getElementById("popup_button_set_today").addEventListener("click", function(){
  document.getElementById("popup_edit_date").value = get_today_str(true, false, true).replaceAll('/','-');
});
// 期限（+1日するボタン）
document.getElementById("popup_button_date_inc").addEventListener("click", function(){
  let date_str = document.getElementById("popup_edit_date").value.replaceAll('-','/');
  if (date_str === '') {
    date_str = get_today_str(true, false, true).replaceAll('/','-');
  }
  let ret = addDays_s(new Date(date_str), 1, true);
  document.getElementById("popup_edit_date").value = ret.replaceAll('/','-');
});
// 期限（+1Wするボタン）
document.getElementById("popup_button_date_inc1w").addEventListener("click", function(){
  let date_str = document.getElementById("popup_edit_date").value.replaceAll('-','/');
  if (date_str === '') {
    date_str = get_today_str(true, false, true).replaceAll('/','-');
  }
  let ret = addDays_s(new Date(date_str), 7, true);
  document.getElementById("popup_edit_date").value = ret.replaceAll('/','-');
});
// 期限（+1Mするボタン）
document.getElementById("popup_button_date_inc1m").addEventListener("click", function(){
  let date_str = document.getElementById("popup_edit_date").value.replaceAll('-','/');
  if (date_str === '') {
    date_str = get_today_str(true, false, true).replaceAll('/','-');
  }
  let ret = addMonths_s(new Date(date_str), 1, true);
  document.getElementById("popup_edit_date").value = ret.replaceAll('/','-');
});
// メモ追加ボタン
document.getElementById("popup_edit_note_add_btn").addEventListener("click", function(){
  let elem_popup_note = document.getElementById("popup_edit_note");
  let date_str = get_date_str(new Date(), true, false, false, false);
  let text_note = '';
  if (elem_popup_note.value.length <= 0) {
    text_note = date_str + ' ';
  } else {
    text_note = date_str + ' \n' + elem_popup_note.value;
  }
  elem_popup_note.value = text_note;
  elem_popup_note.focus();
  elem_popup_note.selectionStart = date_str.length+1;
  elem_popup_note.selectionEnd = date_str.length+1;
  elem_popup_note.scrollTo({top:0, left:0});
});
// メモ欄(Enterで編集完了)
document.getElementById("popup_edit_note").addEventListener("keydown", function(event){
  switch (event.keyCode){
    case key_enter:     // Enter
      event.preventDefault();
      submit_edit_popup();
      break;
  }
});


// Show message Before Close Browwer
window.onbeforeunload = function(e) {
  return "";
}







//---------------------------------------
// Key Event
//---------------------------------------

/**
 * @summary Allリスト クリックイベント
 */
function click_handler_stock_list(event) {
  const elem_id = elem_id_list_stock;
}

/**
 * @summary 今日のリスト クリックイベント
 */
function click_handler_todays_list(event) {
  const elem_id = elem_id_list_today;

  if (event.altKey) {
    // outlook用クエリコピー
    event.preventDefault(); // 既定の動作をキャンセル
    copy_selected_item_name_for_mailquery(elem_id);
  }
}

/**
 * @summary ALLリスト キーイベント処理
 * @param イベント情報
 */
function keyhandler_stock_list(event) {
  const elem_id = elem_id_list_stock;

  switch (event.keyCode){
    case key_arrow_up:    // ↑
      if (event.altKey) {
        event.preventDefault(); // 既定の動作をキャンセル
        swap_selected_item(elem_id, true);
        break;
      }
      break;
    case key_arrow_down:  // ↓
      if (event.altKey) {
        event.preventDefault(); // 既定の動作をキャンセル
        swap_selected_item(elem_id, false);
        break;
      }
      break;
    case key_arrow_right: // →
      move_today_item();
      break;
    case key_a:           // a
      if (event.shiftKey) {
        // 選択行の下へ選択タスクを複製
        event.preventDefault(); // 既定の動作をキャンセル
        const add_id = addItemBehindSelectedItem(elem_id, true, false);
        update_list();
        set_select(elem_id, add_id, false, false);
        break;
      }
      // 空白タスクを選択行の下へ追加
      event.preventDefault(); // 既定の動作をキャンセル
      const add_id = addItemBehindSelectedItem(elem_id, false, false);
      update_list();
      set_select(elem_id, add_id, false, false);
      break;
    case key_c:           // c
      if (event.shiftKey) {
        event.preventDefault(); // 既定の動作をキャンセル
        copy_selected_item_name_for_mailquery(elem_id);
        break;
      }
      if (event.ctrlKey) {
        event.preventDefault(); // 既定の動作をキャンセル
        copy_selected_item_name(elem_id);
        break;
      }
      break;
    case key_d:           // d
      event.preventDefault(); // 既定の動作をキャンセル
      remove_selected_item(elem_id);
      break;
    case key_n:           //n
      // 非タスク化
      toggle_non_task(elem_id);
      break
    case key_s:           // s
      if (event.shiftKey) {
        // ALLリストの選択アイテムを、今日/済み/明日のリスト内を探して選択
        event.preventDefault(); // 既定の動作をキャンセル
        let id = get_select_id(elem_id);
        if (id !== null) {
          let is_sel = set_select(elem_id_list_today, id, true, true);
          if (!is_sel) {
            is_sel = set_select(elem_id_list_done, id), true, true;
            if (!is_sel) {
              is_sel = set_select(elem_id_list_tomorrow, id, true, true);
            }
          }
        }
        break;
      }
      break;
    case key_z:           // z
      if (event.ctrlKey) {
        event.preventDefault(); // 既定の動作をキャンセル
        // 元に戻す
        undo_item()
        break;
      }
      break;
    case key_space:       // space
      if (event.shiftKey) {
        // 設定されたURLを開く
        open_select_items_url(elem_id);
        break;
      }

      // 編集ポップアップ
      if (g_show_popup) {
        close_edit_popup();
      } else {
        show_edit_popup(elem_id);
      }
      break;
    case key_enter:     // Enter
      event.preventDefault(); // 既定の動作をキャンセル
      // 編集ポップアップ
      if (g_show_popup) {
        close_edit_popup();
      } else {
        show_edit_popup(elem_id);
      }
      break;
  }
}

/**
 * @summary 今日のリスト キーイベント処理
 * @param イベント情報
 */
function keyhandler_todays_list(event) {
  const elem_id = elem_id_list_today;

  switch (event.keyCode){
    case key_arrow_up:    // ↑
      if (event.altKey) {
        break;
      }
      break;
    case key_arrow_down:  // ↓
      if (event.altKey) {
        break;
      }
      break;
    case key_arrow_left: // ←
      remove_today_item();
      break;
    case key_arrow_right: // →
      if (event.ctrlKey) {
        // 明日のタスクへ設定
        set_tomorrow_item(elem_id , true);
        break;
      }
      done_item();
      break;
    case key_a:           // a
      if (event.shiftKey) {
        // 選択行の下へ選択タスクを複製
        event.preventDefault(); // 既定の動作をキャンセル
        const add_id = addItemBehindSelectedItem(elem_id, true, true);
        update_list();
        set_select(elem_id, add_id, false, false);
        break;
      }
      // 空白タスクを選択行の下へ追加
      event.preventDefault(); // 既定の動作をキャンセル
      const add_id = addItemBehindSelectedItem(elem_id, false, true);
      update_list();
      set_select(elem_id, add_id, false, false);
      break;
    case key_f:           // f
      event.preventDefault(); // 既定の動作をキャンセル
      if (event.shiftKey) {
        // 作業中タスク
        toggle_todays_doing_task();
        break;
      }
      // ファーストタスク
      toggle_todays_first_task();
      break;
    case key_n:           //n
      // 非タスク化
      toggle_non_task(elem_id);
      break
    case key_c:           // c
      if (event.shiftKey) {
        event.preventDefault(); // 既定の動作をキャンセル
        copy_selected_item_name_for_mailquery(elem_id);
        break;
      }
      if (event.ctrlKey) {
        event.preventDefault(); // 既定の動作をキャンセル
        copy_selected_item_name(elem_id);
        break;
      }
      break;
    case key_d:           // d
      event.preventDefault(); // 既定の動作をキャンセル
      remove_selected_item(elem_id);
      break;
    case key_s:           // s
      if (event.shiftKey) {
        // ALLリストの選択アイテムを、今日のリストと同期
        event.preventDefault(); // 既定の動作をキャンセル
        let id = get_select_id(elem_id);
        if (id !== null) {
          set_list_filter(elem_id_list_stock, 0);
          set_select(elem_id_list_stock, id, true, true);
          document.getElementById(elem_id_list_stock).focus();  // フォーカス移動
        }
        break;
      }
      break;
    case key_z:           // z
      if (event.ctrlKey) {
        event.preventDefault(); // 既定の動作をキャンセル
        // 元に戻す
        undo_item()
        break;
      }
      event.preventDefault(); // 既定の動作をキャンセル
      toggle_todays_wait();
      break;
    case key_space:       // space
      if (event.shiftKey) {
        // 設定されたURLを開く
        open_select_items_url(elem_id);
        break;
      }

      // 編集ポップアップ
      if (g_show_popup) {
        close_edit_popup();
      } else {
        show_edit_popup(elem_id);
      }
      break;
    case key_enter:     // Enter
      event.preventDefault(); // 既定の動作をキャンセル
      // 編集ポップアップ
      if (g_show_popup) {
        close_edit_popup();
      } else {
        show_edit_popup(elem_id);
      }
      break;
  }
}

/**
 * @summary 済みリスト キーイベント処理
 * @param イベント情報
 */
function keyhandler_done_list(event) {
  const elem_id = elem_id_list_done;

  switch (event.keyCode){
    case key_arrow_left:       // ←
      return_item();   
      break;
    case key_c:           // c
      if (event.shiftKey) {
        event.preventDefault(); // 既定の動作をキャンセル
        copy_selected_item_name_for_mailquery(elem_id);
        break;
      }
      if (event.ctrlKey) {
        event.preventDefault(); // 既定の動作をキャンセル
        copy_selected_item_name(elem_id);
        break;
      }
      break;
    case key_s:           // s
      if (event.shiftKey) {
        // ALLリストの選択アイテムを、本リストと同期
        event.preventDefault(); // 既定の動作をキャンセル
        let id = get_select_id(elem_id);
        if (id !== null) {
          set_list_filter(elem_id_list_stock, 0); // フィルタ解除
          set_select(elem_id_list_stock, id, true, true);
          document.getElementById(elem_id_list_stock).focus();  // フォーカス移動
        }
        break;
      }
      break;
    case key_z:           // z
      if (event.ctrlKey) {
        event.preventDefault(); // 既定の動作をキャンセル
        // 元に戻す
        undo_item()
        break;
      }
      break;
    case key_space:       // space
      if (event.shiftKey) {
        // 設定されたURLを開く
        open_select_items_url(elem_id);
        break;
      }
      break;
  }
}

/**
* @summary 明日のリスト キーイベント処理
* @param イベント情報
*/
function keyhandler_tomorroy_list(event) {
  const elem_id = elem_id_list_tomorrow;
 
  switch (event.keyCode){
    case key_arrow_left:  // ←
      set_tomorrow_item(elem_id , false);
      break;
    case key_c:           // c
      if (event.shiftKey) {
        event.preventDefault(); // 既定の動作をキャンセル
        copy_selected_item_name_for_mailquery(elem_id);
        break;
      }
      if (event.ctrlKey) {
        event.preventDefault(); // 既定の動作をキャンセル
        copy_selected_item_name(elem_id);
        break;
      }
      break;
    case key_s:           // s
      if (event.shiftKey) {
        // ALLリストの選択アイテムを、本リストと同期
        event.preventDefault(); // 既定の動作をキャンセル
        let id = get_select_id(elem_id);
        if (id !== null) {
          set_list_filter(elem_id_list_stock, 0); // フィルタ解除
          set_select(elem_id_list_stock, id, true, true);
          document.getElementById(elem_id_list_stock).focus();  // フォーカス移動
        }
        break;
      }
      break;
    case key_z:           // z
      if (event.ctrlKey) {
        event.preventDefault(); // 既定の動作をキャンセル
        // 元に戻す
        undo_item()
        break;
      }
      break;
    case key_space:       // space
      if (event.shiftKey) {
        // 設定されたURLを開く
        open_select_items_url(elem_id);
        break;
      }
      break;
  }
}

/**
 * @summary 編集ポップアップ キーイベント処理
 * @param イベント情報
 */
function keyhandler_edit_popup(event) {
  switch (event.keyCode){
    case key_esc:       // ESC
      close_edit_popup();
      break;
  }
}

/**
 * @summary 編集ポップアップ キーイベント処理(複数版)
 * @param イベント情報
 */
function keyhandler_edit_popup_multi(event) {
  switch (event.keyCode){
    case key_esc:       // ESC
    close_edit_multi_popup();
      break;
  }
}

/**
 * @summary マウスホイールイベント
 */
function wheelhandler_stock_list(event) {
  if (event.shiftKey) {
    if (event.deltaY < 0) {
      // 上へ
      move_list_filter(true);
    } else if (event.deltaY > 0) {
      // 下へ
      move_list_filter(false);
    }
  }
  // console.log("whoeel");
}

/**
 * @summary リスト 右クリック
 */
function contextmenu_handler_list(event) {
  const elem_id = event.target.parentNode.id;
  event.preventDefault(); // 既定の動作をキャンセル

  // アイテムを選択
  set_select(elem_id, parseInt(event.target.dataset.id), false, false);

  if (event.shiftKey) {
    // テキストをコピー
    copy_selected_item_name(elem_id, event);
  } else {
    // テキストをコピー(Outlook用クエリ)
    copy_selected_item_name_for_mailquery(elem_id, event);
  }
}












//---------------------------------------
// Function
//---------------------------------------

/**
 * @summary textareaへ入力された内容をALLリストへ追加
 */
function regist_from_textarea() {
  // 入力テキスト取得
  let input = document.getElementById("input_area").value;

  // 内部データへ変換
  let group_id = convert_internal_data(input);

  // 内部データをリストへ反映
  update_list();

  // 追加グループ選択
  set_select(elem_id_list_stock, group_id, true, true);

  // テキストをクリア
  document.getElementById("input_area").value = '';
}

/**
 * @summary 内部データをリストへ反映
 */
function update_list() {
  update_stock_list(g_stock_filter);
  update_todays_list();
  update_done_list();
  update_tomorrow_list();
  show_timeline();
}

/**
 * @summary フィルタ実行
 */
function click_set_list_filter() {
  set_list_filter(elem_id_list_stock, parseInt(this.dataset.id));
}

/**
 * @summary フィルタ設定
 */
function set_list_filter(elem_id, filter_id) {
  // 同じフィルタなら何もしない
  if (g_stock_filter_id === filter_id) {
    return;
  }

  g_stock_filter_id = filter_id;
  filter = g_filtersEx[filter_id];
  g_stock_filter = {name: filter.word, has_url: filter.has_url, has_mail: filter.has_mail, has_note: filter.has_note, is_wait: filter.is_wait };
  update_stock_list(g_stock_filter);

  // ボタン選択状態変更
  let c = document.querySelectorAll(".set_filter_condition");
  c.forEach(function(target) {
    if (parseInt(target.dataset.id) === g_stock_filter_id) {
      target.classList.add('set_filter_condition_on');
    } else {
      if (target.classList.contains('set_filter_condition_on')) {
        target.classList.remove('set_filter_condition_on');
      }
    }
  });

  // タイムライン更新
  show_timeline();
}

/**
* @summary フィルタ実行(前・後)
* @param true:前へ / false:後ろへ
*/
function move_list_filter(prev) {
  let next_filter_id = -1;
  if (prev) {
    if (g_stock_filter_id > 0) {
      next_filter_id = g_stock_filter_id - 1;
    }
  } else {
    if (g_stock_filter_id < g_filtersEx.length - 1) {
      next_filter_id = g_stock_filter_id + 1;
    }
  }
  // console.log(next_filter_id);
 
  // リスト更新
  if (next_filter_id >= 0) {
    set_list_filter(elem_id_list_stock, next_filter_id);
  }
}

/**
 * @summary フラグメール情報を取り込み ('メール'グループへ追加)
 */
function read_mail_flag() {
  // ボタン無効化
  this.disabled = true;

  // スクリプト読み込み
  load_script(
    g_mail_flag,   // 読み取りファイル
    function() {
      if (mail_flag === undefined) {
        return;
      }
    
      // 追加先グループ取得
      const group_name = 'メール';
      let group = getInternalFromName(group_name);
      if (group === null) {
        // グループがなければ追加
        group = makeInternalGroup(group_name, '');
        // g_list_data[group_name] = group;
        setInternalGroup(group_name, group);
      }

      pushHistory();
      
      // タスクを追加
      let items = [];
      for (let i =0; i < mail_flag.length; i++) {
        let name = `(${mail_flag[i].receive_date}) ${mail_flag[i].title}`;
        if (getInternalFromName(name) === null) {
          let item = makeInternalItem(name);
          item.mail = mail_flag[i].title;
          group.sub_tasks.push(item);
        }
      }

      // addIntarnalDataEx2(group.id, titles, true);
      update_list();
    
      // 選択
      set_select(elem_id_list_stock, group.id, true, true);
    }
  );
}

/**
 * @summary 今日の会議予定を取り込み
 */
function read_todays_meeting() {
  read_meeting(new Date());
  this.disabled = true;
}
/**
 * @summary 明日の会議予定を取り込み
 */
function read_tomorrows_meeting() {
  read_meeting(addDays(new Date(), 1, true));
  this.disabled = true;
}

/**
 * @summary 指定日の会議予定を取り込み(from timeline_tasks.js)
 * @param 指定日(Date)
 */
function read_meeting(target_d) {
  // スクリプト読み込み
  load_script(
    g_meeting_script,   // 読み取りファイル 
    function() {
      if (schedules === undefined) {
        return;
      }
      let meeting_list = get_meeting_text(schedules, target_d);
      if (meeting_list.length <= 0) {
        return;
      }
    
      // 追加先グループ取得
      const group_name = '会議';
      let group = getInternalFromName(group_name);
      if (group === null) {
        // グループがなければ追加
        group = makeInternalGroup(group_name, '');
        // g_list_data[group_name] = group;
        setInternalGroup(group_name, group);
      }
      // タスクリストへ追加
      pushHistory();
      addIntarnalDataEx2(group.id, meeting_list, true);
      update_list();
    
      // 選択
      set_select(elem_id_list_stock, group.id, true, true);

      // 変数削除 (削除できない)
      // delete schedules;
    }
  );
}

/**
 * @summary 指定日の会議予定を抽出
 * @param スケジュールdict
 * @param 対象日時(Date)
 * @returns 指定日の会議予定リスト
 */
function get_meeting_text(schedules, target_d)
{
  let meetings = get_meeting_list(schedules, target_d);
  if (meetings.length <= 0) {
    return null;
  }

  let ret = [];
  for (let i = 0; i < meetings.length; i++) {
    let title = meetings[i].title;
    let start_time = meetings[i].start.split(" ")[1];
    let end_time = meetings[i].end.split(" ")[1];
    let d_s = new Date(meetings[i].start);
    let d_e = new Date(meetings[i].end);
    let diff_msec = (d_e - d_s);
    let diff_hour = floorEx(diff_msec / 1000 / 60 / 60, 10);
    ret.push(`${title} (${start_time}〜${end_time} / ${diff_hour}h)`);
  }

  return ret;
}

/**
 * @summary 指定日の会議予定を抽出
 * @param スケジュールdict
 * @param 対象日時(Date)
 * @returns 指定日の会議予定リスト (list)
 */
function get_meeting_list(schedules, target_d)
{
  let meetings = [];
  let target_date_str = get_date_str(target_d,true,true,true,true);

  // 指定日の会議予定を抽出
  // { title:"会議", isCC:false, start:"2024/03/01 8:00", end:"2024/03/01 12:00" },
  for (let i = 0; i < schedules.length; i++) {
    // 指定日だけを抽出
    if (schedules[i].start.includes(target_date_str)) {
      meetings.push(schedules[i]);
    }
  }
  // ソート(日時が早い順)
  if (meetings.length > 0) {
    meetings.sort(compare_schedule_fn);
  }
  
  return meetings;
}

/**
 * @summary スケジュールソート 比較関数
 * @param 比較対象データ1 (dict)
 * @param 比較対象データ2 (dict)
 * @returns 結果(0:変更なし / <0:aをbの前に並べる / >0:aをbの後に並べる )
 */
function compare_schedule_fn(data1, data2) {
  const d1 = new Date(data1.start);
  const d2 = new Date(data2.start);

  let is_invalid1 = isInvalidDate(d1);
  let is_invalid2 = isInvalidDate(d2);

  // どちらかが無効な日付
  if (is_invalid1 || is_invalid2) {
    if (is_invalid1 && !is_invalid2) {
      return 1;
    }
    if (!is_invalid1 && is_invalid2) {
      return -1;
    }
    // 変動なし
    return 0;
  }

  // 日付比較
  if (d1 < d2) {
   return -1;
  } else if (d1 > d2) {
    return 1;
  }
  return 0;
}










//---------------------------------------
// Data Manage
//---------------------------------------

/**
 * @summary JSONをリストへ反映
 */
function regist_from_json() {
  let json_input = document.getElementById("input_json_area").value;
  let json_obj = JSON.parse(json_input);
  if (json_obj === null) {
    return;
  }
  g_list_data = json_obj;

  // 内部データをリストへ反映
  update_list();

  // エディットボックスをクリア
  document.getElementById("input_json_area").value = '';
}

/**
 * @summary 入力テキストを内部データへ変換
 * @param テキスト
 * @returns グループID
 */
function convert_internal_data(input) {
  let internal_list = {};
  let group_name = '';
  let group_id = null;

  let lines = input.split('\n');
  for (let i = 0 ; i < lines.length; i++) {
    // 先頭がスペースではない(親グループ)
    if (lines[i][0] !== ' ') {
      let parent_items = lines[i].split(';'); // グループ名と期限を分離
      group_name = parent_items[0].trim();
      let period = '';
      if (parent_items[1] !== undefined) {
        period = date_from_str_ex(parent_items[1].replace(" ", ""));
      }
      internal_list[group_name] = makeInternalGroup(group_name, period);
      group_id = internal_list[group_name].id;
    } else {
      let item = makeInternalItem(lines[i]);
      internal_list[group_name].sub_tasks.push(item);
    }
  }
  Object.assign(g_list_data, internal_list);
  return group_id;
}

/**
 * @summary 内部データ取得
 */
function getInternalRawData() {
  return g_list_data;
}

/**
 * @summary 内部データ更新
 */
function setInternalRawData(data) {
  g_list_data = data;
}

/**
 * @summary 内部データ グループデータ取得
 */
function getInternalGroup(key) {
  return g_list_data[key];
}

/**
 * @summary 内部データ グループデータ更新
 */
function setInternalGroup(key, group_data) {
  g_list_data[key] = group_data;
}

/**
 * @summary 内部データのキーリストを条件に沿って返す
 * @param フィルタ文字列
 * @param ソート指定 true:ソートしない / false:期限の早い順にソートする
 * @return キー一覧
 */
function get_internal_keys(filter, is_no_sort) {
  let keys = Object.keys(g_list_data);
  let ary = [];
  for (let i = 0 ; i < keys.length; i++) {
    if (filter !== '' && filter !== undefined) {
      if (g_list_data[keys[i]].name.indexOf(filter) >= 0) {
        ary.push({ name: keys[i], period: g_list_data[keys[i]].period });
      }
    } else {
      ary.push({ name: keys[i], period: g_list_data[keys[i]].period });
    }
  }

  if (!is_no_sort) {
    ary.sort(compareFn);
  }

  ret = [];
  for (let i = 0 ; i < ary.length; i++) {
    ret.push(ary[i].name);
  }
  return ret;
}

/**
 * @summary グループID一覧取得
 * @return グループID一覧
 */
function get_group_ids() {
  let ret = [];
  let keys = get_internal_keys('', false);
  for (let i = 0 ; i < keys.length; i++) {
    ret.push(g_list_data[keys[i]].id);
  }
  return ret;
}

/**
 * @summary 内部データのアイテムを取得 (id指定)
 * @param ID
 * @returns アイテムデータ or null
 */
function getInternal(id) {
  // let keys = Object.keys(g_list_data);
  let keys = get_internal_keys('', true);

  //　アイテムデータを検索
  for (let i = 0 ; i < keys.length; i++) {
    let items = g_list_data[keys[i]].sub_tasks;
    for (let j = 0 ; j < items.length; j++) {
      if (items[j].id === id) {
        return items[j];
      }
    }
  }

  // グループを検索
  for (let i = 0 ; i < keys.length; i++) {
    let group = g_list_data[keys[i]];
    if (group.id === id) {
      return group;
    }
  }

  return null;
}

/**
 * @summary タスク名からアイテムIDを取得
 * @param タスク名
 * @returns id
 */
function getInternalFromName(name) {
  // let keys = Object.keys(g_list_data);
  let keys = get_internal_keys('', true);

  //　アイテムデータを検索
  for (let i = 0 ; i < keys.length; i++) {
    let items = g_list_data[keys[i]].sub_tasks;
    for (let j = 0 ; j < items.length; j++) {
      if (items[j].name === name) {
        return items[j];
      }
    }
  }

  // グループを検索
  for (let i = 0 ; i < keys.length; i++) {
    let group = g_list_data[keys[i]];
    if (group.name === name) {
      return group;
    }
  }

  return null;
}

/**
 * @summary 内部データの所属グループを取得 (id指定)
 * @param アイテムID
 * @returns アイテムデータ or null
 */
function getInternalGroupFromItemID(id) {
  // let keys = Object.keys(g_list_data);
  let keys = get_internal_keys('', true);

  //　アイテムデータを検索
  for (let i = 0 ; i < keys.length; i++) {
    let items = g_list_data[keys[i]].sub_tasks;
    for (let j = 0 ; j < items.length; j++) {
      if (items[j].id == id) {
        // グループを返す
        return g_list_data[keys[i]];
      }
    }
  }

  return null;
}

/**
 * @summary 指定IDの後ろへアイテムを追加
 * @param ID
 * @param アイテム
 * @returns アイテムID or null
 */
function addItemBehind(id, item) {
  // 所属グループのデータ取得
  let group = getInternalGroupFromItemID(id);
  if (group === null) {
    return;
  }
  // 指定位置へアイテム挿入
  pushHistory();
  let items = group.sub_tasks;
  for (let j = 0 ; j < items.length; j++) {
    if (items[j].id === id) {
      // アイテム追加
      items.splice(j+1, 0, item);
      return item.id;
    }
  }
  return null;
}

/**
 * @summary 内部データアイテムを指定idの後ろへ追加
 * @param id
 * @param タスク名
 * @returns 追加アイテムのID
 */
function addIntarnalData(id, name) {
  let item = makeInternalItem(name);
  if (addItemBehind(id, item)) {
    return item.id;
  }
  return null;
}

/**
 * @summary 内部データアイテムを指定idの後ろへ追加(複数)
 * @param id
 * @param タスク名リスト 
 * @param 最後に追加したアイテムのID
 */
function addIntarnalDataEx(id, names) {
  let insert_pos_id = id;
  let last_id = null;
  for (let i = 0 ; i < names.length; i++) {
    last_id = addIntarnalData(insert_pos_id, names[i]);
    insert_pos_id = last_id;
  }
  return last_id;
}

/**
 * @summary アイテムを指定グループへ追加(複数アイテム)
 * @param グループID
 * @param アイテム(複数)
 * @param 同名のタスクがあった場合スキップするかどうか
 * @param 最後に追加したアイテムのID
 */
function addIntarnalDatasToGroup(group_id, items, is_ignore_same_name) {
  // グループ取得
  let group = getInternal(group_id);
  if (group.type !== 'group') {
    return null;
  }

  let last_id = null;
  for (let i = 0 ; i < items.length; i++) {
    if (is_ignore_same_name) {
      // 同名のタスクが存在するか確認し、存在しなければ追加
      if (getInternalFromName(items[i].name) === null) {
        last_id = items[i].id;
        group.sub_tasks.push(items[i]);
      }
    } else {
      last_id = items[i].id;
      group.sub_tasks.push(items[i]);
    }
  }
  return last_id;
}

/**
 * @summary アイテムを指定グループへ追加(複数アイテム)
 * @param グループID
 * @param タスク名リスト
 * @param 同名のタスクがあった場合スキップするかどうか
 * @returns 最後に追加したアイテムのID
 */
function addIntarnalDataEx2(group_id, names, is_ignore_same_name) {
  // グループ取得
  let group = getInternal(group_id);
  if (group.type !== 'group') {
    return null;
  }

  let items = [];
  for (let i = 0 ; i < names.length; i++) {
    items.push(makeInternalItem(names[i]));
  }
  return addIntarnalDatasToGroup(group_id, items, is_ignore_same_name);
}

/**
 * @summary 空タスクを指定idの後ろへ追加
 * @param id
 * @returns 登録アイテムのID
 */
function addIntarnalBlankData(id, set_today) {
  const taskname = '';
  if (set_today) {
    let item = makeInternalItem(taskname);
    item.is_today = 1;
    if (g_lock_todays_task) {
      item.is_today = 2;  // 今日の追加タスク
    }

    if (addItemBehind(id, item)) {
      return item.id;
    }
  }
  return addIntarnalData(id, taskname);
}

/**
 * @summary タスクを選択行の下へ追加
 * @param 要素ID
 * @param true:選択アイテムを複製 / false:空タスクを追加
 * @param true:今日のタスクへ設定(複製指定の場合、無効) / false:指定なし
 * @returns アイテムID
 */
function addItemBehindSelectedItem(elem_id, is_duplicate, set_today) {
  let sel_id = get_select_id(elem_id);
  if (sel_id !== null) {
    if (is_duplicate) {
      let item = getInternal(sel_id);
      if (item === null) {
        return;
      }

      // item複製、ID付け替え
      let item_d = structuredClone(item);
      item_d.id = genItemID();
      if (item.is_today > 0 && g_lock_todays_task) {
        item.is_today = 2;  // 今日の追加タスク
      }
    
      // 追加
      return addItemBehind(sel_id, item_d);
    } else {
      return addIntarnalBlankData(sel_id, set_today);
    }
  }
}

/**
 * @summary 指定IDがグループかどうか
 * @param id
 * @returns true:グループ / false:グループ以外
 */
function is_group(id) {
  let item = getInternal(id);
  if (item === null) {
    return false;
  }
  return (item.type === 'group');
}

/**
 * @summary 指定IDがアイテムかどうか
 * @param id
 * @returns true:アイテム / false:アイテム以外
 */
function is_item(id) {
  let item = getInternal(id);
  if (item === null) {
    return false;
  }
  return (item.type === 'item');
}


/**
 * @summary 内部データ グループ要素を作成
 * @param 期限(MM/dd or yyyy/MM/dd)
 * @return dict
 */
function makeInternalGroup(name, period) {
  let ret = { 
    id: genGroupID(), 
    type: 'group', 
    name: name, 
    period: period, 
    sub_tasks: []
  };
  return ret;
}

/**
 * @summary 内部データアイテム要素作成
 * @param タスク名
 * @returns dict
 */
function makeInternalItem(name) {
  let ret = {
    id: genItemID(), 
    type: 'item', 
    name: name, 
    period: '',
    url: '',
    status: 'yet', 
    mail: '',
    note: '',
    is_today: 0,  // 0:明日以降 / 1:今日 / 2:今日の追加分 
    is_first: false, 
    is_wait: false,
    is_doing: false,
    is_tomorrow: false,
    last_update: '',
    created: get_today_str(true, true, true),
  };
  return ret;
}

/**
 * @summary 新しいアイテムIDを発行する
 * @returns ID
 */
function genItemID() {
  let new_id = g_last_id;
  g_last_id++;
  return new_id;
}

/**
 * @summary 新しいグループIDを発行する
 * @returns ID
 */
function genGroupID() {
  let new_id = g_last_group_id;
  g_last_group_id++;
  return new_id;
}

/**
 * @summary 内部データ削除
 * @param id
 * @param グループのサブタスクが空になったらグループを削除するかどうか
 */
function removeIntarnalData(id, is_remove_empty_group) {
  // let keys = Object.keys(g_list_data);
  let keys = get_internal_keys('', true);
  for (let i = 0 ; i < keys.length; i++) {
    let group = g_list_data[keys[i]]

    // group削除
    if (group.id === id) {
      delete g_list_data[keys[i]];
    } else {
      let items = group.sub_tasks;
      for (let j = 0 ; j < items.length; j++) {
        if (items[j].id === id) {
          // アイテム削除
          items.splice(j,1);
          if (is_remove_empty_group) {
            // アイテムが1つも存在しない場合はグループも削除
            if (items.length <= 0) {
              delete g_list_data[keys[i]];
            }
          }
          return;
        }
      }
    }
  }
}

/**
 * @summary 同一グループ内でアイテムの順番を入れ替え
 * @param ID
 * @param true:前へ移動 / false:後ろへ移動
 * 
 */
function swap_item(id, is_up) {
  let group = getInternalGroupFromItemID(id);
  if (group === null) {
    return;
  }

  for (let i = 0; i < group.sub_tasks.length; i++) {
    if (group.sub_tasks[i].id === id) {
      // 前へ
      if (is_up === true) {
        if (i === 0) {
          // 先頭要素なので何もしない
          break;
        }
        // swap
        [group.sub_tasks[i], group.sub_tasks[i-1]] = [group.sub_tasks[i-1], group.sub_tasks[i]]
        break;
      }

      // 後ろへ
      if (is_up === false) {
        if (i === group.sub_tasks.length-1) {
          // 最終要素なので何もしない
          break;
        }
        // swap
        [group.sub_tasks[i], group.sub_tasks[i+1]] = [group.sub_tasks[i+1], group.sub_tasks[i]]
        break;
      }
    }
  }
}

// 履歴保存
function pushHistory() {
  // 先頭へ追加
  let json_str = JSON.stringify(g_list_data);
  // let copy = { ...data };
  g_list_history.splice(0, 0, json_str);

  // 規定要素数以上なら、超過分を削除
  if (g_list_history.length > g_list_history_num) {
    g_list_history.splice(g_list_history_num, g_list_history.length - g_list_history_num);
  }
}

// 履歴取り出し
function popHistory() {
  if (g_list_history.length > 0) {
    // 先頭要素を返し、削除
    // let copy = { ...g_list_history[0] };
    let json_str = g_list_history.splice(0,1);
    return JSON.parse(json_str);
  }
  return null;
}

/**
 * @summary データ互換性維持のための調整 / 内部データの不足している属性補完
 */
function adjust_attr_internal_data() {
  // let keys = Object.keys(g_list_data);
  let keys = get_internal_keys('', true);

  // group
  for (let i = 0 ; i < keys.length; i++) {
    let group = g_list_data[keys[i]];
    // name
    if (group.name === undefined) {
      group.name = keys[i];
    }
    // type
    if (group.type === undefined) {
      group.type = "group";
    }
    // created
    if (group.created === undefined) {
      group.created = '';
    }
  }

  // item
  for (let i = 0 ; i < keys.length; i++) {
    let items = g_list_data[keys[i]].sub_tasks;
    for (let j = 0 ; j < items.length; j++) {
      let item = items[j];
      // is_today
      if (item.is_today === true) {
        item.is_today = 1;
      }
      if (item.is_today === false) {
        item.is_today = 0;
      }
      // type
      if (item.type === undefined) {
        item.type = 'item';
      }
      // period
      if (item.period === undefined) {
        item.period = '';
      }
      // created
      if (item.created === undefined) {
        item.created = '';
      }
      // URL
      if (item.url === undefined) {
        item.url = '';
      }
      // is_wait
      if (item.is_wait === undefined) {
        item.is_wait = false;
      }
      // is_tomorrow
      if (item.is_tomorrow === undefined) {
        item.is_tomorrow = false;
      }
      // is_doing
      if (item.is_doing === undefined) {
        item.is_doing = false;
      }
      // non_task
      if (item.is_non_task === undefined) {
        item.is_non_task = false;
      }
      // mail
      if (item.mail === undefined) {
        item.mail = '';
      }
      // note
      if (item.note === undefined) {
        item.note = '';
      }
    }
  }

  // グループIDを再付番
  // renumbering_groupid();
}

/**
 * @summary 今日の全タスク数, 今日の処理済みタスク数 を取得
 * @return dict / {task_number: [今日の全タスク数], task_number_done: [今日の処理済みタスク数] }
 */
function get_todays_task_number() {
  let task_number = 0;
  let task_number_done = 0;

  // let keys = Object.keys(g_list_data);
  let keys = get_internal_keys('', true);
  for (let i = 0 ; i < keys.length; i++) {
    let items = g_list_data[keys[i]].sub_tasks;
    for (let j = 0 ; j < items.length; j++) {
      if (items[j].is_today > 0 && !items[j].is_non_task && !items[j].is_tomorrow) {
        task_number++;
        if (items[j].status === 'done') {
          task_number_done++;
        }
      }
    }
  }
  return {task_number: task_number, task_number_done: task_number_done};
}

// Allリストをテキストで取得
function get_all_text() {
  let copy_text = '';
  let keys = get_internal_keys('', true);

  for (let i = 0 ; i < keys.length; i++) {
    copy_text += g_list_data[keys[i]].name;
    copy_text += '\n';
    items = g_list_data[keys[i]].sub_tasks;
    for (let j = 0 ; j < items.length; j++) {
      copy_text += items[j].name;
      copy_text += '\n';
    }
  }

  return copy_text;
}

/**
 * @summary 今日のタスクをテキストで取得
 * @param true:処理済みのみ / false:未処理も含める
 * @param モード(0:全て / 1:処理済みのみ / 2:処理済みを除く)
 * @returns テキスト
 */
function get_todays_list_text(mode) {
  let copy_text = '';

  // 対象となるタスクリストを作成
  // let keys = Object.keys(g_list_data);
  let keys = get_internal_keys('', true);
  
  for (let i = 0 ; i < keys.length; i++) {
    let ary = [];
    let items = g_list_data[keys[i]].sub_tasks;
    for (let j = 0 ; j < items.length; j++) {
      if (items[j].is_today > 0) {
        if (mode === 1) {
          if (items[j].status === 'done') {
            ary.push(items[j].name);
          }
        } else if (mode === 2) {
          if (items[j].status !== 'done') {
            ary.push(items[j].name);
          }
        } else {
          ary.push(items[j].name);
        }
      }
    }

    // テキストを整形
    if (ary.length > 0) {
      copy_text += "●" + g_list_data[keys[i]].name;
      copy_text += '\n';
      for (let j = 0 ; j < ary.length; j++) {
        copy_text += ary[j];
        copy_text += '\n';
      }
      // copy_text += '\n';
    }
  }

  return copy_text;
}

// 済みリストをテキストで取得
function get_done_list_text() {
  let copy_text = '';

  // let keys = Object.keys(g_list_data);
  let keys = get_internal_keys('', true);

  for (let i = 0 ; i < keys.length; i++) {
    let ary = [];
    let items = g_list_data[keys[i]].sub_tasks;
    for (let j = 0 ; j < items.length; j++) {
      if (items[j].is_today > 0 && items[j].status === 'done') {
        ary.push(items[j].name);
      }
    }
    if (ary.length > 0) {
      copy_text += "●" + g_list_data[keys[i]].name;
      copy_text += '\n';
      for (let j = 0 ; j < ary.length; j++) {
        copy_text += ary[j];
        copy_text += '\n';
      }
      copy_text += '\n';
    }
  }
  return copy_text;
}

// g_last_group_id / g_last_id を更新
function update_last_id() {
  let last_group_id = g_initial_group_id;
  let last_id = 0;

  // let keys = Object.keys(g_list_data);
  let keys = get_internal_keys('', true);
  for (let i = 0 ; i < keys.length; i++) {
    // group ID
    if (g_list_data[keys[i]].id > last_group_id) {
      last_group_id = g_list_data[keys[i]].id;
    }

    // item ID
    let items = g_list_data[keys[i]].sub_tasks;
    for (let j = 0 ; j < items.length; j++) {
      if (items[j].id > last_id) {
        last_id = items[j].id;
      }
    }
  }

  last_group_id++;
  g_last_group_id = last_group_id;

  last_id++;
  g_last_id = last_id;
}

/**
* @summary グループIDを再付番
*/
function renumbering_groupid() {
  // let keys = Object.keys(g_list_data);
  let keys = get_internal_keys('', true);
  let groupid = g_initial_group_id;
 
  for (let i = 0 ; i < keys.length; i++) {
    // let group = g_list_data[keys[i]];
    let group = getInternalGroup(keys[i]);
    group.id = groupid;
    groupid++;
  }
  g_last_group_id = groupid;
}








//---------------------------------------
// List Manage
//---------------------------------------

/**
 * @summary リスト表示更新
 * @param リストデータ
 * @param 更新対象リストのエレメントID
 * @param グループフィルタ文字列
 * @param 表示判定コールバック
 * @param クラスリスト取得コールバック
 * @param 最終更新日表示判定コールバック
 * @param 空のグループ表示判定コールバック
 */
function update_list_common(list_data, elem_id, filter, func_is_show, func_get_classes, func_show_lastupdate, func_is_show_empty_group) {
  let selected_ids = get_select_id_ex(elem_id);
  let select = document.getElementById(elem_id);
  select.innerHTML = '';

  let keys = get_internal_keys(filter, false);
  for (let i = 0 ; i < keys.length; i++) {
    // アイテムの要素一覧を作成
    let append_elems = [];
    let items = list_data[keys[i]].sub_tasks;
    for (let j = 0 ; j < items.length; j++) {
      let item = items[j];
      if (func_is_show(item) === true) {
        append_elems.push(make_option(item, func_get_classes(item), false, func_show_lastupdate(item)));
      }
    }

    if (func_is_show_empty_group() || append_elems.length > 0) {
      // params (group)
      let group_top = {}
      group_top.name = `${list_data[keys[i]].name} ( ${get_display_date_str(list_data[keys[i]].period)} ) (〜 ${list_data[keys[i]].period} )`;
      group_top.id = list_data[keys[i]].id;
      // class (group)
      let classes = ["group_top"];
      if (list_data[keys[i]].period !== '') {
        let days_from_today = get_days_from_today(list_data[keys[i]].period);
        if (days_from_today >= -3) {
          classes.push("group_expire_soon");
        }
        if (days_from_today >= 0) {
          classes.push("period_today");
        }
      }
      // グループ用エレメント追加
      select.appendChild(make_option(group_top, classes, true, false));
  
      // アイテム用エレメント追加
      for (let k = 0; k < append_elems.length; k++) {
        select.appendChild(append_elems[k]);
      }
    }
  }

  // 選択
  set_select_ex(elem_id, selected_ids);
}


/**
 * @summary ALLタスクリスト更新
 * @param フィルタ(dict) { name:'', has_url:[true|false], has_mail:[true|false], has_note:[true|false] }
 */
function update_stock_list(filter) {
  update_list_common(
    getInternalRawData(), elem_id_list_stock, filter.name,
    function(item) {
      // 表示条件
      if (filter.has_url && item.url === '') {
        return false;
      }
      if (filter.has_mail && item.mail === '') {
        return false;
      }
      if (filter.has_note && item.note === '') {
        return false;
      }
      if (filter.is_wait && item.is_wait !== true) {
        return false;
      }
      return true;
    },
    function(item) {
      // クラスリスト
      let classes = ["group_level1"];
      if (item.status === 'done') {
        classes.push('done');
      } else if (item.is_today > 0) {
        classes.push('today');
      }
      if (item.is_wait === true) {
        classes.push('wait');
      }
      if (item.is_non_task === true) {
        classes.push('non_task');
      }
      if (item.url !== '') {
        classes.push('has_url');
      }
      return classes;
    },
    function(item) {
      // 最終更新日表示判定
      if (item.status === 'done') {
        return true;
      }
      if (item.is_wait === true) {
        return true;
      }
      return false;
    },
    function() {
      // アイテムが無いグループを表示するかどうか
      if (filter.has_url || filter.has_mail || filter.has_note || filter.is_wait) {
        // 特殊条件の場合は非表示
        return false;
      }
      return true;
    }
  );
}

/**
 * 今日のリストを更新
 */
function update_todays_list() {
  update_list_common(
    getInternalRawData(), elem_id_list_today, '', 
    function(item) {
      // 表示条件
      if (item.is_tomorrow) {
        // 明日のタスク
        return false;
      }
      if (!g_is_show_todays_done) {
        // 今日の済みタスク表示OFF
        return (item.is_today > 0 && item.status == 'yet');
      }
      return (item.is_today > 0);
    },
    function(item) {
      // クラスリスト
      let classes = ["group_level1"];
      if (item.status === 'done') {
        classes.push('done');
      }
      if (item.is_first === true) {
        classes.push('first');
      }
      if (item.is_today >= 2) {
        classes.push('later');
      }
      if (item.is_wait === true) {
        classes.push('wait');
      }
      if (item.is_non_task === true) {
        classes.push('non_task');
      }
      if (item.is_doing === true) {
        classes.push('now');
      }
      if (item.url !== '') {
        classes.push('has_url');
      }
      return classes;
    },
    function(item) {
      // 更新日表示判定
      if (item.is_wait === true) {
        return true;
      }
      return false;
    },
    function() {
      // アイテムが無いグループを表示するかどうか
      return false;
    }
  );

  // タスク進捗率 更新
  const task_number_info = get_todays_task_number();
  let rate = Math.floor(task_number_info.task_number_done / task_number_info.task_number * 100);
  let label = `今日のタスク (${task_number_info.task_number_done}/${task_number_info.task_number}) (${rate}%)`;
  document.getElementById("label_todays_task").innerHTML = label;
}

/**
 * 済みリストを更新
 */
function update_done_list() {
  update_list_common(
    getInternalRawData(), elem_id_list_done, '', 
    function(item) {
      // 表示条件
      return (item.is_today > 0 && item.status === 'done');
    },
    function(item) {
      // クラスリスト
      let classes = ["group_level1"];
      if (item.url !== '') {
        classes.push('has_url');
      }
      return classes;
    },
    function(item) {
      // 更新日表示判定
      return false;
    },
    function() {
      // アイテムが無いグループを表示するかどうか
      return false;
    }
  );
}

/**
* 明日のみリストを更新
*/
function update_tomorrow_list() {
  update_list_common(
    getInternalRawData(), elem_id_list_tomorrow, '',
    function(item) {
      // 表示条件
      return (item.is_tomorrow);
    },
    function(item) {
      // クラスリスト
      let classes = ["group_level1"];
      if (item.is_wait === true) {
        classes.push('wait');
      }
      if (item.url !== '') {
        classes.push('has_url');
      }
      return classes;
    },
    function(item) {
      // 更新日表示判定
      return false;
    },
    function() {
      // アイテムが無いグループを表示するかどうか
      return false;
    }
  );
}

/**
 * 今日の済みタスク表示チェックを更新
 */
function update_check_todays_done() {
  document.getElementById("toggle_show_done").checked = !g_is_show_todays_done;
}

/**
 * フィルターボタン生成
 */
function make_filter_buttons() {
  let elem_div = document.getElementById('set_filter_condition_div');
  
  // ボタン生成
  // <button class="set_filter_condition set_filter_condition_on" value="">全て</button>
  for (let i = 0; i < g_filters.length; i++) {
    let elem_button = document.createElement("button");
    elem_button.classList.add('set_filter_condition');
    elem_button.value = g_filters[i];
    elem_button.dataset.id = i;
    if (g_filters[i] === '') {
      elem_button.textContent = '全て';
      elem_button.classList.add('set_filter_condition_on');
    } else {
      elem_button.textContent = g_filters[i];
    }
    elem_button.addEventListener("click", click_set_list_filter);
    elem_div.appendChild(elem_button);
  }
}

/**
 * フィルターボタン生成
 */
function make_filter_buttons_ex() {
  let elem_div = document.getElementById('set_filter_condition_div');
  
  // ボタン生成
  // <button class="set_filter_condition set_filter_condition_on" value="">全て</button>
  for (let i = 0; i < g_filtersEx.length; i++) {
    // 要素生成
    let elem_button = document.createElement("button");
    elem_button.value = g_filtersEx[i].word;
    elem_button.textContent = g_filtersEx[i].name;
    elem_button.dataset.id = i;
    elem_button.classList.add('set_filter_condition');
    elem_button.addEventListener("click", click_set_list_filter);
    if (g_filtersEx[i].select !== undefined) {
      elem_button.classList.add('set_filter_condition_on');
    }

    // 特殊条件
    if (g_filtersEx[i].has_url !== undefined) {
      elem_button.dataset.has_url = g_filtersEx[i].has_url;
    }
    if (g_filtersEx[i].has_mail !== undefined) {
      elem_button.dataset.has_mail = g_filtersEx[i].has_mail;
    }
    if (g_filtersEx[i].has_note !== undefined) {
      elem_button.dataset.has_note = g_filtersEx[i].has_note;
    }

    // 要素追加
    elem_div.appendChild(elem_button);
  }
}


/**
  @summary  リストのoptionタグを生成
  @param    dict
  @param    クラスリスト
  @param    グループかどうか
  @param    最終更新日を表示するかどうか
  @return   Element
 */
function make_option(item, class_list, is_group_top, show_last_update) {
  let elem = document.createElement("option");

  // text
  let disp_text = item.name;
  if (disp_text === '') {
    disp_text = '-';
  }
  let before_icon = get_before_icons(item);
  if (before_icon !== '') {
    elem.text = before_icon + ' ' + disp_text + get_after_icons(item);
  } else {
    elem.text = disp_text + get_after_icons(item);
  }

  if (!is_group_top && item.period !== '') {
    // 期限
    elem.text += ' (⌛' + get_display_date_str(item.period) + ')';
  }
  if (!is_group_top && show_last_update) {
    // 最終更新日時
    elem.text += ' (🕘' + get_display_date_str(item.last_update) + ')';
  }
  // title
  elem.title = item.name;
  if (!is_group_top && item.note !== '') {
    elem.title += '\n--------------\n' + item.note;
  }
  // value
  elem.value = elem.text;
  // data-id
  elem.dataset.id = item.id;
  // data-status
  if (!is_group_top) {
    elem.dataset.status = item.status;
  }

  // クラス追加
  if (class_list.length !== 0) {
    for (i=0; i < class_list.length; i++) {
      elem.classList.add(class_list[i]);
    }
  }

  // インデント
  if (item.type === 'item') {
    let indent_count = 3 - [...before_icon].length;    // max 3 indent
    elem.style.textIndent = indent_count + 'rem';
  }

  return elem;
}

/**
 * @summary アイテムの前に表示するアイコン取得
 * @param アイテム
 * @returns アイコン
 */
function get_before_icons(item) {
  // アイテム以外なら空
  if (item.type !== 'item') {
    return '';
  }

  let ret = '';
  if(item.url !== '') {
    ret += '🌏';
  }
  if(item.mail !== '') {
    // ret += '📩';
    ret += '📥';
  }
  if(item.note !== '') {
    // ret += '🔖';
    ret += '📓';
  }

  // if(ret !== '') {
  //   ret += ' ';
  // }
  return ret;
}

/**
 * @summary アイテムの前に表示するアイコン取得
 * @param アイテム
 * @returns アイコン
 */
function get_after_icons(item) {
  // アイテム以外なら空
  if (item.type !== 'item') {
    return '';
  }

  let ret = '';
  if(item.is_wait) {
    ret = '💤';
  }

  if(ret !== '') {
    ret += ' ';
  }
  return ret;
}

/**
 * @summary 選択されているアイテムの data-id 値を取得
 * @param エレメントID
 * @returns ID
 */
function get_select_id(elem_id) {
  // 全リストから選択アイテムを選択、選択アイテムを削除
  let options = document.getElementById(elem_id).options;
  for (let i = 0; i < options.length; i++) {
    if(options[i].selected) {
      // if (options[i].classList.contains('group_top')) {
      //   return null;
      // }
      return parseInt(options[i].dataset.id);
    }
  }
  return null;
}

/**
 * @summary 選択されているアイテムの data-id 値を取得
 * @param エレメントID
 * @returns IDs ( [選択中ID, 次のアイテムのID] )
 */
function get_select_id_ex(elem_id) {
  // 全リストから選択アイテムを選択、選択アイテムを削除
  let options = document.getElementById(elem_id).options;
  for (let i = 0; i < options.length; i++) {
    if(options[i].selected) {
      if (options[i].classList.contains('group_top')) {
        return [options[i].dataset.id];
      }

      let ret = [];
      ret.push(options[i].dataset.id);
      if (options[i+1] !== undefined) {
        ret.push(options[i+1].dataset.id);
      }
      return ret;
    }
  }
  return null;
}

/**
 * @summary select要素の選択されているoption要素を取得
 * @param select要素ID
 * @returns 要素 or null
 */
function get_selected_element(elem_id) {
  // 全リストから選択アイテムを選択、選択アイテムを削除
  let options = document.getElementById(elem_id).options;
  for (let i = 0; i < options.length; i++) {
    if(options[i].selected) {
      return options[i];
    }
  }
  return null;
}

/**
 * @summary 指定された data-id のアイテムを選択状態にする
 * @param エレメントID
 * @param 選択状態にするアイテムのID
 * @param スクロールするかどうか
 * @param フォーカス移動するかどうか
 * @returns true:成功 / false:失敗(idなし)
 */
function set_select(elem_id, id, is_scroll, is_focus) {
  if (id == null) {
    return false;
  }

  // 全リストから選択アイテムを選択、選択アイテムを削除
  let selected_top = -1;
  let elem_group = null;
  let options = document.getElementById(elem_id).options;
  for (let i = 0; i < options.length; i++) {
    // スクロール位置取得の為にグループ要素を取っておく
    if (options[i].classList.contains('group_top')) {
      elem_group = options[i];
    }
    if(options[i].dataset.id == id) {
      options[i].selected = true;
      // selected_top = options[i].offsetTop;  // 要素位置(スクロールの為に取得)
      selected_top = elem_group.offsetTop;  // 要素位置(スクロールの為に取得)
    } else {
      options[i].selected = false;
    }
  }

  // フォーカス移動
  if (is_focus) {
    document.getElementById(elem_id).focus();
  }

  if (is_scroll !== false) {
    // 0.005秒後にスクロール
    if (selected_top > 0) {
      setTimeout(() => {
        let list_top = document.getElementById(elem_id).getBoundingClientRect().top;
        document.getElementById(elem_id).scrollTo({top: selected_top - list_top, left: 0, behavior: "smooth"});
      }, 5);
    }
  }

  return (selected_top > 0);
}

/**
 * @summary 指定された data-id のアイテムを選択状態にする
 * @param 要素ID
 * @param 選択状態にするアイテムのID(2つまでの候補) (配列)
 */
function set_select_ex(elem_id, ids) {
  if (ids == null) {
    return;
  }

  let ret = set_select(elem_id, ids[0], true, true);
  if (!ret && ids.length > 1) {
    ret = set_select(elem_id, ids[1], true, true);
  }

  // // 全リストから選択アイテムを選択、選択アイテムを削除
  // let options = document.getElementById(elem_id).options;
  // for (let i = 0; i < options.length; i++) {
  //   if(options[i].dataset.id == ids[0]) {
  //     return options[i].selected = true;
  //   }
  // }

  // // 対象IDが見つからなかった場合は、次の候補を検索
  // for (let i = 0; i < options.length; i++) {
  //   if(options[i].dataset.id == ids[1]) {
  //     return options[i].selected = true;
  //   }
  // }
}

// 選択アイテムを今日のタスクへ移動
function move_today_item() {
  // リストから選択アイテムを取得
  let id = get_select_id(elem_id_list_stock);
  if (id === null) {
    // グループを選択している
    return;
  }

  // idから内部データの配列を取得し、ステータスを変更
  let item = getInternal(id);
  if (item.is_today >= 1) {
    // すでに今日のタスクの場合は何もしない
    return;
  }

  pushHistory();
  if (g_lock_todays_task) {
    item.is_today = 2;  // 今日の追加タスク
  } else {
    item.is_today = 1;
  }
  item.last_update = get_today_str(true, true, true);

  // リストへ反映
  update_list();

  // 今日のリストのタスクを選択
  set_select(elem_id_list_today, item.id, false, false);
}

// 選択アイテムを今日のタスクから削除
function remove_today_item() {
  let id = get_select_id(elem_id_list_today);
  if (id === null) {
    return;
  }
  
  let item = getInternal(id)
  if (item === null) {
    return;
  }

  pushHistory();
  item.is_today = 0;
  item.is_first = false;  // 優先タスクフラグ解除
  item.last_update = get_today_str(true, true, true);

  // リストへ反映
  update_list();
}

// 選択アイテムをファーストタスクへ設定
function toggle_todays_first_task() {
  pushHistory();

  let id = get_selected_id(elem_id_list_today);
  if (id === null) {
    return;
  }

  let item = getInternal(id)
  if (item === null) {
    return;
  }

  if (item.is_first) {
    // ファーストタスクの場合はOFF
    item.is_first = false;
  } else if (item.is_today > 0 && item.status !== 'done') {
    // 非ファーストタスクで、今日 かつ 処理済みでないデータならファーストへ
    item.is_first = true;
  }
  update_list();
}

// 選択アイテムを作業中タスクへ設定
function toggle_todays_doing_task() {
  pushHistory();

  let id = get_selected_id(elem_id_list_today);
  if (id === null) {
    return;
  }

  let item = getInternal(id)
  if (item === null) {
    return;
  }

  if (item.is_doing) {
    // 作業中タスクの場合はOFF
    item.is_doing = false;
  } else if (item.is_today > 0 && item.status !== 'done') {
    // 非作業中タスクで、今日 かつ 処理済みでないデータなら作業中へ
    item.is_doing = true;
  }
  update_list();
}

// 全てのファーストタスクを解除
function clear_first_task() {
  pushHistory();

  // let keys = Object.keys(g_list_data);
  let keys = get_internal_keys('', true);
  for (let i = 0 ; i < keys.length; i++) {
    // let items = g_list_data[keys[i]].sub_tasks;
    let items = getInternalGroup(keys[i]).sub_tasks;
    for (let j = 0 ; j < items.length; j++) {
      items[j].is_first = false;
    }
  }
  // リスト更新
  update_list();
}

/**
 * 待ち状態を設定
 */
function toggle_todays_wait() {
  pushHistory();

  let id = get_selected_id(elem_id_list_today);
  if (id === null) {
    return;
  }

  let item = getInternal(id)
  if (item === null) {
    return;
  }
  
  item.is_wait = !item.is_wait;
  item.last_update = get_today_str(true, true, true);

  update_list();
}

// 全ての追加タスクを解除
function release_todays_add_task() {
  pushHistory();

  // let keys = Object.keys(g_list_data);
  let keys = get_internal_keys('', true);
  for (let i = 0 ; i < keys.length; i++) {
    // let items = g_list_data[keys[i]].sub_tasks;
    let items = getInternalGroup(keys[i]).sub_tasks;
    for (let j = 0 ; j < items.length; j++) {
      if (items[j].is_today >= 2)
      items[j].is_today = 1;
    }
  }
  // リスト更新
  update_list();
}

/**
 * 非タスク切り替え
 */
function toggle_non_task(elem_id) {
  pushHistory();

  let id = get_selected_id(elem_id);
  if (id === null) {
    return;
  }

  let item = getInternal(id)
  if (item === null) {
    return;
  }
  
  item.is_non_task = !item.is_non_task;

  update_list();
}


/**
 * 今日のリストの済みアイテム表示/非表示を切り替え
 */
function toggle_show_todays_done() {
  g_is_show_todays_done = !g_is_show_todays_done;

  // 表示更新
  update_todays_list();
}

/**
 * 今日のリストのロック状態 切り替え
 */
function toggle_lock_todays_task() {
  g_lock_todays_task= !g_lock_todays_task;
}

/**
 * @summary 選択アイテムを処理済みへ
 */
function done_item() {
  let id = get_select_id(elem_id_list_today);
  if (id === null) {
    return;
  }
  
  let item = getInternal(id)
  if (item === null) {
    return;
  }

  pushHistory();
  item.status = 'done';
  item.is_first = false;  // 優先タスクフラグ解除
  item.last_update = get_today_str(true, true, true);

  // リストへ反映
  update_list();
}

/**
 * @summary 選択アイテムのステータスを戻す
 */
function return_item() {
  // 履歴保存
  pushHistory();

  let id = get_selected_id(elem_id_list_done);
  if (id === null) {
    return;
  }

  // status を yet へ更新
  let item = getInternal(id);
  if (item !== null) {
    item.status = 'yet';
    update_list();
  }
}

/**
 * @summary 今日の処理済みを今日から外す
 */
function release_todays_done() {
  // 履歴保存
  pushHistory();

  // let keys = Object.keys(g_list_data);
  let keys = get_internal_keys('', true);
  for (let i = 0 ; i < keys.length; i++) {
    // items = g_list_data[keys[i]].sub_tasks;
    let items = getInternalGroup(keys[i]).sub_tasks;
    for (let j = 0 ; j < items.length; j++) {
      if (items[j].is_today > 0 && items[j].status == 'done') {
        items[j].is_today = 0;
      }
    }
  }
  // リストへ反映
  update_list();
}

/**
 * @summary 明日のタスクへ追加
 * @param 要素ID
 * @param true:明日のタスクON / false:明日のタスクOFF
 */
function set_tomorrow_item(elem_id, is_tomorrow) {
  // 履歴保存
  pushHistory();
 
  let id = get_selected_id(elem_id);
  if (id === null) {
    return;
  }
 
  // status を更新
  let item = getInternal(id);
  if (item !== null) {
    item.is_tomorrow = is_tomorrow;
    update_list();
  }
}

/**
 * @summary 明日のタスク解除
 * @param 要素ID
 */
function release_tomorrow_item() {
  // 履歴保存
  pushHistory();

  // let keys = Object.keys(g_list_data);
  let keys = get_internal_keys('', true);
  for (let i = 0 ; i < keys.length; i++) {
    // items = g_list_data[keys[i]].sub_tasks;
    let items = getInternalGroup(keys[i]).sub_tasks;
    for (let j = 0 ; j < items.length; j++) {
      if (items[j].is_tomorrow) {
        items[j].is_tomorrow = false;
      }
    }
  }
  // リストへ反映
  update_list();
}

// アイテム追加
function add_items() {
  pushHistory();
 
  let task_names = document.getElementById("add_item_text").value;
  let lines = task_names.split('\n');
 
  let selected_id = get_selected_id(elem_id_list_stock);
  addIntarnalDataEx(selected_id, lines);
 
  // リストを更新
  update_list();
 
  // 入力値をクリア
  document.getElementById("add_item_text").value = '';
}

/**
 * @summary 選択中アイテム削除
 * @param リストID
 */
function remove_selected_item(elem_id) {
  pushHistory();

  let selected_id = get_selected_id(elem_id);
  removeIntarnalData(selected_id, false);

  // リストを更新
  update_list();
}

/**
 * @summary 全リストの選択中アイテム削除
 */
function remove_selected_item_stock_list() {
  remove_selected_item(elem_id_list_stock);
}

/**
 * 選択されているアイテムを移動
 */
function swap_selected_item(elem_id, is_up) {
  let sel_id = get_selected_id(elem_id);
  if (sel_id === null) {
    return;
  }

  // アイテム入れ替え
  pushHistory();
  swap_item(sel_id, is_up);

  // リストを更新
  update_list();
}

/**
 * 選択アイテムのURLを開く
 */
function open_select_items_url(elem_id) {
  let id = get_select_id(elem_id);
  if (id === null) {
    return;
  }
  let item = getInternal(id);
  if (item === null) {
    return;
  }
  if (item.url !== '' ) {
    window.open(item.url, '_blank');
  }
}

// 戻す
function undo_item() {
  let data = popHistory();
  if (data !== null) {
    // g_list_data = data;
    setInternalRawData(data);
  }

  // リストを更新
  update_list();
}

/**
 * @summary 選択中アイテムの 内部データid を取得
 * @param アイテムID
 * @returns ID or null
 */
function get_selected_id(elem_id) {
  let select_elems = get_selected_option(elem_id);
  if (select_elems.length > 0) {
    return parseInt(select_elems[0].dataset.id);
  }
  return null;
}

/**
 * @summary 選択中アイテムの 内部データID(複数) を取得
 * @param アイテムID(配列)
 * @returns ID or null
 */
function get_selected_ids(elem_id) {
  let ret = [];
  let select_elems = get_selected_option(elem_id);
  for (let i = 0; i < select_elems.length; i++) {
    ret.push(parseInt(select_elems[i].dataset.id));
  }
  return ret;
}

/**
 * @summary 選択されているoptionを取得
 * @param selectエレメントID
 * @returns エレメントオブジェクト
 */
function get_selected_option(elem_id) {
  let ret = [];
  let options = document.getElementById(elem_id).options;
  for (let i = 0; i < options.length; i++) {
    if(options[i].selected) {
      ret.push(options[i]);
    }
  }
  return ret;
}







// 保存
function save_data() {
  // let keys = Object.keys(g_list_data);
  let keys = get_internal_keys('', true);
  if (keys.length <= 0) {
    return;
  }

  let yesno = confirm('現在の状態を保存しますか？');
  if (yesno) {
    let list_data_str = JSON.stringify(getInternalRawData());
    saveStorage("tast_manager_list_data", list_data_str);
  
    alert('現在の状態を保存しました。');
  }
}

// 復元
function load_data() {
  let yesno = confirm('現在の状態を破棄して読み込みますか？');
  if (yesno) {
    pushHistory();

    // 内部データへ上書き
    let list_data_str = loadStorage("tast_manager_list_data");
    // g_list_data = JSON.parse(list_data_str);
    setInternalRawData(JSON.parse(list_data_str));

    // 内部データの属性を補完
    adjust_attr_internal_data();
  
    // リストを更新
    update_list();
  
    // 最新のIDを再計算
    update_last_id();
  }
}


// Allリストをクリップボードにコピー
function copy_stock_list() {
  let copy_text = get_all_text();
  navigator.clipboard.writeText(copy_text);

  copy_animation(this);
}

// 今日のタスクリストをクリップボードにコピー
function copy_todays_list() {
  let mode = 2;
  if (g_is_show_todays_done) {
    mode = 0;
  }
  let copy_text = get_todays_list_text(mode);
  navigator.clipboard.writeText(copy_text);

  copy_animation(this);
}

// 済みリストをクリップボードにコピー
function copy_todays_done_list() {
  let copy_text = get_todays_list_text(1);
  navigator.clipboard.writeText(copy_text);

  copy_animation(this);
}

/**
 * @summary 選択アイテムテキストをクリップボードにコピー
 * @param 要素ID
 * @param イベントオブジェクト(コピーアニメーション表示時指定)
 * @returns true:成功 / false:失敗(未選択)
 */
function copy_selected_item_name(elem_id, event) {
  let id = get_selected_id(elem_id);
  if (id === null) {
    return false;
  }

  let item = getInternal(id)
  navigator.clipboard.writeText(item.name);

  // コピーアニメーション
  if (event !== undefined) {
    show_copy_popup(event);
  }

  return true;
}

/**
 * @summary 選択アイテムのmail属性(空ならタスク名)をクリップボードにコピー(メール検索クエリ用)
 * @param 要素ID
 * @param イベントオブジェクト(コピーアニメーション表示時指定)
 * @returns true:成功 / false:失敗(未選択)
 */
function copy_selected_item_name_for_mailquery(elem_id, event) {
  let id = get_selected_id(elem_id);
  if (id === null) {
    return false;
  }
  let item = getInternal(id);

  let text = item.name;
  if (item.mail !== '') {
    text = item.mail;
  }

  let copy_text = `subject: "${text}"`;
  navigator.clipboard.writeText(copy_text);

  // コピーアニメーション
  if (event !== undefined) {
    show_copy_popup(event, ' (for Outlook)');
  }

  return true;
}

// 現在の状態をJSONテキストでコピー
function copy_now_json() {
  let copy_text = get_now_json();
  navigator.clipboard.writeText(copy_text);

  copy_animation(this);
}

// 現在の状態をJSONファイルとしてダウンロード
function download_now_json() {
  // ダウンロード
  const blob = new Blob([JSON.stringify(getInternalRawData())], { type: 'application/json' });
  const url = (window.URL || window.webkitURL).createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  let date_str = get_today_str(false, true, true);
  a.download = `task_manager_status_${date_str}.json`;
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

// 現在の状態をJSONテキストで取得
function get_now_json() {
  return JSON.stringify(getInternalRawData(), null , "  ");
}


/**
 * @summary 編集ポップアップ表示
 * @param 要素ID
 */
function show_edit_popup(elem_id) {
  let selected_ids = get_selected_ids(elem_id);
  if (selected_ids.length === 1) {
    // 1件の編集
    show_edit_popup_single(elem_id, selected_ids[0]);
  } else if (selected_ids.length > 1) {
    // 複数件の編集
    show_edit_popup_multi(elem_id, selected_ids);
  }
}

/**
 * @summary 編集ポップアップ表示
 * @param 要素ID
 * @param 編集対象ID(配列)
 */
function show_edit_popup_single(elem_id, selected_id) {
  if (g_show_popup) {
    return;
  }

  let elem = document.getElementById("popup_edit_base");
  let item = getInternal(selected_id);
  if (item.type === "group") {
    // 非表示
    // 所属グループ
    document.getElementById("popup_edit_group_list").style.display = "none";
    // URL
    document.getElementById("popup_edit_url").style.display = "none";
    // メール
    document.getElementById("popup_edit_mail").style.display = "none";
    // メモ
    document.getElementById("popup_edit_note").style.display = "none";
    // 済み
    document.getElementById("popup_edit_done").style.display = "none";
    document.getElementById("popup_edit_done_label").style.display = "none";
    // 待ち
    document.getElementById("popup_edit_wait").style.display = "none";
    document.getElementById("popup_edit_wait_label").style.display = "none";
  }

  if (item.type === "item") {
    // 所属グループ
    let elem_groups = document.getElementById("popup_edit_group_list");
    elem_groups.innerHTML = '';
    let group_id = getInternalGroupFromItemID(selected_id).id;
    elem_groups.dataset.orgid = group_id;
    // グループ一覧作成
    let ids = get_group_ids();
    for (let i = 0; i < ids.length; i++) {
      let elem_option = document.createElement("option");
      elem_option.text = getInternal(ids[i]).name;
      elem_option.dataset.id = ids[i];
      // 所属グループを選択
      elem_option.selected = (ids[i] == group_id);
      elem_groups.appendChild(elem_option);
    }
    document.getElementById("popup_edit_group_list").style.display = "block";
    // URL
    document.getElementById("popup_edit_url").value = item.url;
    document.getElementById("popup_edit_url").style.display = "block";
    // メール
    document.getElementById("popup_edit_mail").value = item.mail;
    document.getElementById("popup_edit_mail").style.display = "block";
    // メモ
    document.getElementById("popup_edit_note").value = item.note;
    document.getElementById("popup_edit_note").style.display = "block";
    // 済み
    document.getElementById("popup_edit_done").checked = (item.status === 'done');
    document.getElementById("popup_edit_done").style.display = "block";
    document.getElementById("popup_edit_done_label").style.display = "block";
    // 待ち
    document.getElementById("popup_edit_wait").checked = item.is_wait;
    document.getElementById("popup_edit_wait").style.display = "block";
    document.getElementById("popup_edit_wait_label").style.display = "block";
  }

  // タスク名
  document.getElementById("popup_edit_text").value = item.name.trim();

  // 期限
  document.getElementById("popup_edit_date").value = item.period.replaceAll('/','-');

  // 期限
  document.getElementById("popup_edit_created").value = item.created;

  // ID 
  document.getElementById("popup_edit_id").value = selected_id;
  document.getElementById("popup_edit_hidden_id").value = selected_id;

  // ポップアップをリストの選択位置へ移動
  let selected_elems = get_selected_option(elem_id);
  if (selected_elems.length > 0) {
    let rect = selected_elems[0].getBoundingClientRect();
    elem.style.top = rect.top;
    elem.style.left = rect.right;
  }

  // 表示
  elem.style.display = "block";
  // フォーカス移動
  document.getElementById("popup_edit_text").focus();

  g_show_popup = true;
  g_show_popup_list = elem_id;
}

/**
 * @summary 編集ポップアップ表示(複数用)
 * @param 要素ID
 * @param 編集対象ID(配列)
 */
function show_edit_popup_multi(elem_id, selected_ids) {
  if (g_show_popup) {
    return;
  }

  // コントロール状態取得
  let is_wait = undefined;
  let status = undefined;
  for (let i = 0; i < selected_ids.length; i++) {
    let item = getInternal(selected_ids[i]);
    if (item.type === 'group') {
      continue;
    }

    if (is_wait !== null) {
      if (is_wait === undefined) {
        is_wait = item.is_wait;
      } else if (is_wait !== item.is_wait) {
        is_wait = null;
      }
    }
    if (status !== null) {
      if (status === undefined) {
        status = item.status;
      } else if (status !== item.status) {
        status = null;
      }
    }
  }
  
  // 済み
  if (is_wait === null) {
    document.getElementById("popup_edit_multi_wait").indeterminate = true;
  } else {
    document.getElementById("popup_edit_multi_wait").indeterminate = false;
    document.getElementById("popup_edit_multi_wait").checked = is_wait;
  }
  document.getElementById("popup_edit_multi_wait").style.display = "block";
  document.getElementById("popup_edit_multi_wait_label").style.display = "block";
  // 待ち
  if (status === null) {
    document.getElementById("popup_edit_multi_done").indeterminate = true;
  } else {
    document.getElementById("popup_edit_multi_done").indeterminate = false;
    document.getElementById("popup_edit_multi_done").checked = (status === 'done');
  }
  document.getElementById("popup_edit_multi_done").style.display = "block";
  document.getElementById("popup_edit_multi_done_label").style.display = "block";

  // ID 
  document.getElementById("popup_edit_multi_hidden_id").value = selected_ids.join(',');

  // ポップアップをリストの選択位置へ移動
  let elem = document.getElementById("popup_edit_multi_base");
  let selected_elems = get_selected_option(elem_id);
  if (selected_elems.length > 0) {
    let rect = selected_elems[0].getBoundingClientRect();
    elem.style.top = rect.top;
    elem.style.left = rect.right;
  }

  // 表示
  elem.style.display = "block";
  // フォーカス移動
  document.getElementById("popup_edit_multi_done").focus();

  g_show_popup = true;
  g_show_popup_list = elem_id;
}

/**
 * @summary アイテム編集完了
 */
function submit_edit_popup() {
  let new_name = document.getElementById("popup_edit_text").value;
  let new_period = document.getElementById("popup_edit_date").value;
  let new_url = document.getElementById("popup_edit_url").value;
  let new_mail = document.getElementById("popup_edit_mail").value;
  let new_note = document.getElementById("popup_edit_note").value;
  let new_done = document.getElementById("popup_edit_done").checked;
  let new_wait = document.getElementById("popup_edit_wait").checked;
  let id_hidden_str = document.getElementById("popup_edit_hidden_id").value;
  let id_edit_str = document.getElementById("popup_edit_id").value;
  let id_hidden = parseInt(id_hidden_str);
  let id_edit = parseInt(id_edit_str);

  pushHistory();

  // 内部データ取得
  let item = getInternal(id_hidden);

  item.name = new_name.trim();
  item.period = new_period.replaceAll('-', '/');

  if (item.type === 'item') {
    // 入力値を適用
    item.name = new_name.trim();
    item.url = new_url;
    item.mail = new_mail;
    item.note = new_note;
    item.is_wait = new_wait;
    if (new_done) {
      item.status = 'done';
    } else {
      item.status = 'yet';
    }

    // グループ
    let elem_groups = document.getElementById("popup_edit_group_list");
    let elem_sel_group_option = get_selected_element('popup_edit_group_list');
    if (elem_sel_group_option.dataset.id !== elem_groups.dataset.orgid) {
        // グループ変更があれば移動
        // 複製
        let item_copy = JSON.parse(JSON.stringify(item));
        // 削除
        removeIntarnalData(item.id);
        // 追加
        addIntarnalDatasToGroup(parseInt(elem_sel_group_option.dataset.id), [item_copy], false);
    }

  }

  // ID更新
  if (id_hidden !== id_edit) {
    item.id = id_edit;
  }

  // ポップアップ消去
  close_edit_popup();
  // リスト更新
  update_list();

  // リストへフォーカス移動
  // document.getElementById(elem_id_list_stock).focus();
}

/**
 * @summary アイテム編集完了(Multi)
 */
function submit_edit_multi_popup() {
  let elem_done = document.getElementById("popup_edit_multi_done");
  let elem_wait = document.getElementById("popup_edit_multi_wait");
  let ids_str = document.getElementById("popup_edit_multi_hidden_id").value;

  pushHistory();

  let ids = ids_str.split(',');
  for (let i = 0; i < ids.length; i++) {
    let id = parseInt(ids[i]);
    let item = getInternal(id);

    // 済み状態
    if(!elem_done.indeterminate) {
      if (elem_done.checked) {
        item.status = 'done';
      } else {
        item.status = 'yet';
      }
    }
    // 待ち状態
    if(!elem_wait.indeterminate) {
      item.is_wait = elem_wait.checked;
    }
  }

  // ポップアップ消去
  close_edit_multi_popup();
  // リスト更新
  update_list();

}

/**
 * 編集ポップアップを閉じる
 */
function close_edit_popup() {
  let elem = document.getElementById("popup_edit_base");
  elem.style.display = "none";

  // フォーカスをリストへ移動
  document.getElementById(g_show_popup_list).focus();

  g_show_popup = false;
  g_show_popup_list = '';
}

/**
 * 編集ポップアップを閉じる(Multi)
 */
function close_edit_multi_popup() {
  let elem = document.getElementById("popup_edit_multi_base");
  elem.style.display = "none";

  // フォーカスをリストへ移動
  document.getElementById(g_show_popup_list).focus();

  g_show_popup = false;
  g_show_popup_list = '';
}



/**
 * @summary タイムライン: グループデータ作成
 * @returns タイムライングループデータ(配列)
 */
function make_timeline_groups() {
  let groups = [];
  groups.push( {id: 'task', content: 'タスク', title: 'タスク' } );
  return groups;
}

/**
 * @summary タイムライン: アイテムデータ作成
 * @returns タイムラインアイテムデータ(配列)
 */
function make_timeline_items()
{
  let ret = [];

  let keys = get_internal_keys(g_stock_filter.name, true);
  for (let i = 0 ; i < keys.length; i++) {
    let group = getInternalGroup(keys[i]);
    if (group.period === undefined || group.period === '') {
      continue;
    }

    // グループデータを追加
    let name = keys[i];
    if (group.name !== undefined) {
      name = group.name;
    }
    let period = group.period + ' 12:00';
    let period_disp = new Date(group.period).getMonth()+1 + '/' + new Date(group.period).getDate();
    ret.push( { group: 'task', id: group.id, content: name, title: period_disp + ' ' + name, start: period, type: 'point', className: 'timeline_item_group' } );

    // アイテムデータを追加
    for (let j = 0; j < group.sub_tasks.length; j++) {
      let item = group.sub_tasks[j];
      if (item.period === undefined || item.period === '') {
        continue;
      }
      let period = item.period + ' 12:00';
      let className = 'timeline_item_item';
      if (item.status === 'done') {
        className = 'timeline_item_item_done';
      }
      let title = new Date(item.period).getMonth()+1 + '/' + new Date(item.period).getDate();
      title += ' ' + item.name;
      if (item.note !== '') {
        title += '<br>---------------<br>' + item.note.replaceAll('\n', '<br>');
      }
      ret.push( { group: 'task', id: item.id, content: item.name, title: title, start: period, type: 'point', className: className } );
    }
  }
  return ret;
}


// show timeline
// mode: "" / "high_priority" / "close_period"
function show_timeline(mode, showNested)
{
  groups = [];
  items = [];

  // DOM element where the Timeline will be attached
  const container = document.getElementById('visualization');

  // make group/item
  groups = groups.concat(make_timeline_groups());
  items = items.concat(make_timeline_items());

  let today = new Date(Date.now()); // 今日
  let today_str= today.getFullYear() + '/' + (today.getMonth()+1) + '/' + today.getDate();
  let date_start = new Date(today.getTime() - past_days * 24 * 60 * 60 * 1000);  // 前
  let range_start_str = date_start.getFullYear() + '/' + (date_start.getMonth()+1) + '/' + date_start.getDate();
  let date_end = new Date(today.getTime() + post_days * 24 * 60 * 60 * 1000);  // 後
  let range_end_str = date_end.getFullYear() + '/' + (date_end.getMonth()+1) + '/' + date_end.getDate();

  // Configuration
  const options = {
    start: range_start_str, // timeline軸が表す期間の範囲の開始日
    end: range_end_str,     // （同）範囲の終了日
    orientation: 'top',    // timeline軸(見出し行）の表示場所(top:上部/both:上下/bottom:下部)
    // orientation: {
    //   axis: 'both',
    //   item: 'top'
    // },
    tooltip: {
      delay: 10,              // tooltipが表示されるまでのdelay(ms)
      followMouse: true,      // マウスに追従
      overflowMethod: 'cap'   // マウス移動追従時、ツールチップが枠外に出ないように制御する
    },
    horizontalScroll: true, // 横スクロール
    verticalScroll: true, // 横スクロール
    zoomKey: 'shiftKey',    // zoom key
    zoomMin: 4000000,      // 約1時間
    zoomMax: 50000000000, // 約1年
    height: timelineHeight,     // 縦幅 (minHeightと合わせて指定すると日付軸が固定になる)
    minHeight: timelineHeight,  // 最大縦幅
    // onInitialDrawComplete: onTimelineShowComplete,
  };

  // Create a Timeline
  if (timeline !== null) {
    // timeline.destroy();
    timeline.setData( {groups: groups, items: items });
    timeline.redraw();
  }
  else {
    timeline = new vis.Timeline(container, items, groups, options);

    // クリックイベント登録
    timeline.on('select', function (properties) {
      // 2回イベント発生するため、抑制 (クリックすると press, tap の2回呼ばれる)
      console.log(properties.event.type);
      if (properties.event.type !== 'tap') {
        return;
      }

      // フィルタ解除
      set_list_filter(elem_id_list_stock, 0);
      
      // クリックしたアイテムをリスト中で選択
      if (properties.items.length > 0) {
        set_select(elem_id_list_stock, properties.items[0], true, true);
      } else {
        // set_select(elem_id_list_stock, -1, false, false); // 選択解除
      }
    });
  }
}










//---------------------------------------
// Function (Common)
//---------------------------------------

//localStorageへ値を保存
function saveStorage(name, val)
{
  localStorage.setItem(name, val);
}

//localStorageから値を取得
function loadStorage(name)
{
  return localStorage.getItem(name);
}

// コピーアニメーション
function copy_animation(elem) {
  // アニメーション
  let backgroundColor_org = elem.style.backgroundColor;
  elem.style.transition = undefined;
  elem.style.backgroundColor="green";

  setTimeout(() => {
    elem.style.transition = "background-color 0.5s ease-in-out";
    elem.style.backgroundColor = backgroundColor_org;
  }, 500);
}

/**
 * カーソル位置にコピーポップアップ表示 (500msecで消去)
 * @param イベントオブジェクト(マウスカーソル位置取得用)
 * @param 追加のテキスト
 */
function show_copy_popup(event, add_text) {
  const text = 'Copy!';
  if (add_text === undefined) {
    add_text = '';
  }

  let elem_popup_text = document.getElementById('popup_copy_text');
  elem_popup_text.innerHTML = text + add_text;

  let elem_popup = document.getElementById('popup_copy_base');
  elem_popup.style.display = 'block';
  elem_popup.style.top = event.pageY - 10;
  elem_popup.style.left = event.pageX + 20;

  setTimeout(() => {
    // elem_popup.style.transition = "display 0.5s ease-in-out";
    elem_popup.style.display = 'none';
  }, 700);
}


/**
 * @summary 内部データソート 比較関数
 * @param 比較対象データ1
 * @param 比較対象データ2
 * @returns 結果(0:変更なし / <0:aをbの前に並べる / >0:aをbの後に並べる )
 */
function compareFn(data1, data2) {
  const period1 = new Date(data1.period);
  const period2 = new Date(data2.period);

  let is_invalid1 = isInvalidDate(period1);
  let is_invalid2 = isInvalidDate(period2);

  // どちらかが無効な日付
  if (is_invalid1 || is_invalid2) {
    if (is_invalid1 && !is_invalid2) {
      return 1;
    }
    if (!is_invalid1 && is_invalid2) {
      return -1;
    }
    // 変動なし
    return 0;
  }

  if (period1 < period2) {
   return -1;
  } else if (period1 > period2) {
    return 1;
  }
  return 0;
}

/**
 * @summary 数値をゼロパディングして文字列化
 * @param 数値
 * @param 最大文字列長
 * @returns ゼロパディングされた文字列
 */
function zero_padding(num, len) {
  return ( Array(len).join('0') + num ).slice( -len );
}

/**
 * スクリプトファイルを読み込む
 * @param ファイル名
 * @param コールバック
 */
function load_script(filename, fn) {
  var done = false;
  var head = document.getElementsByTagName('head')[0];
  var script = document.createElement('script');
  script.src = filename;
  head.appendChild(script);
  script.onload = script.onreadystatechange = function() {
    if ( !done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") ) {
      done = true;
      if (fn !== undefined) {
        fn();
      }
      // Handle memory leak in IE
      script.onload = script.onreadystatechange = null;
      if ( head && script.parentNode ) {
        head.removeChild( script );
      }
    }
  };
}

/**
 * @summary 小数点以下切り捨て
 * @param {*} value 値
 * @param {*} base 切り捨て基準位置(10: 小数点第1位, 100:小数点第2位)
 * @return 処理済みの値
 */
function floorEx(value, base) {
  return Math.floor(value * base) / base;
}






//---------------------------------------
// Function (Date)
//---------------------------------------

/**
 * @summary 日付文字列を返す
 * @param Dateオブジェクト
 * @param 区切り記号を入れるかどうか(/, :) (true|false)
 * @param 時刻を含めるかどうか (true|false)
 * @param 年を含めるかどうか (true|false)
 * @param ゼロパディングするかどうか (true|false)
 * @returns 日付文字列 (yyyy/MM/dd or yyyyMMdd)
 */
function get_date_str(d, is_separate, is_include_time, is_include_year, is_zero_padding) {

  let year = d.getFullYear();
  let month = d.getMonth() + 1;
  let date = d.getDate();
  let hour = d.getHours();
  let minute = d.getMinutes();
  // let second = today.getSeconds();

  if (is_zero_padding) {
    month = zero_padding(month, 2);
    date = zero_padding(date, 2);
    hour = zero_padding(hour, 2);
    minute = zero_padding(minute, 2);
    // second = zero_padding(second, 2);
  }

  let sep = '';
  let sep2 = '';
  if (is_separate === true) {
    sep = '/';
    sep2 = ':';
  }

  let ret = '';
  if (is_include_year) {
    ret = `${year}${sep}${month}${sep}${date}`;
  } else {
    ret = `${month}${sep}${date}`;
  }

  if (is_include_time === true) {
    // return `${year}${sep}${month}${sep}${date} ${hour}${sep2}${minute}`;
    ret = ret + ` ${hour}${sep2}${minute}`
  }
  return ret;
}

/**
 * @summary 今日の日付文字列を返す
 * @param 区切り記号を入れるかどうか(/, :)
 * @param 時刻を含めるかどうか (true|false)
 * @param 年を含めるかどうか (true|false)
 * @returns 日付文字列 (yyyy/MM/dd or yyyyMMdd)
 */
function get_today_str(is_separate, is_include_time, is_include_year) {
  return get_date_str(new Date(), is_separate, is_include_time, is_include_year, true);
}

/**
 * @summary 平日判定
 * @param 検証対象日
 * @returns true:平日 / false:週末
 */
function is_weekday(date)
{
  day = date.getDay();
  return (day != 0 && day != 6);
}

/**
 * @summary 日を増減する
 * @param 基準日(Date)
 * @param 増減する日数
 * @param 週末を除外するかどうか
 * @returns String
 */
function addDays_s(date, days, exclude_weekend)
{
  let dt = addDays(date, days, exclude_weekend);
  return get_date_str(dt, true, false, true, true);
}

/**
 * @summary 日を増減する
 * @param 基準日(Date)
 * @param 増減する日数
 * @param 週末を除外するかどうか(true|false)
 * @returns Date
 */
function addDays(target_date, days, exclude_weekend)
{
  let d = new Date(target_date.getTime() + days * 24 * 60 * 60 * 1000);

  // 週末の場合、月曜日まで進める
  if (exclude_weekend)
  {
    // 曜日を取得（0:日曜、1:月曜、... 6:土曜）
    const week = d.getDay();
    if (week == 0)
    {
      return addDays(d, 1, false);
    }
    if (week == 6)
    {
      return addDays(d, 2, false);
    }
  }

  return d;
}

/**
 * @summary 月を増減する(文字列を返却)
 * @param 基準日(Date)
 * @param 増減する月数
 * @param 週末を除外するかどうか
 * @returns String
 */
function addMonths_s(date, days, exclude_weekend)
{
  let dt = addMonths(date, days, exclude_weekend);
  return get_date_str(dt, true, false, true, true);
}

/**
 * @summary 月を増減する
 * @param 基準日(Date)
 * @param 増減する月数
 * @returns Date
 */
function addMonths(target_date, months, exclude_weekend)
{
  let d = new Date(target_date);
  d.setMonth(d.getMonth() + months);

  // 週末の場合、月曜日まで進める
  if (exclude_weekend)
  {
    // 曜日を取得（0:日曜、1:月曜、... 6:土曜）
    const week = d.getDay();
    if (week == 0)
    {
      return addDays(d, 1, false);
    }
    if (week == 6)
    {
      return addDays(d, 2, false);
    }
  }

  return d;
}

/**
 * @summary 2つの日の差分日数を取得(当日を含める)
 * @param 日付1
 * @param 日付2
 * @param 週末を除外するかどうか
 * @returns 日数
 */
function get_days(target1, target2, exclude_weekend) {
  let d1 = null;
  let d2 = null;
  let dist = 1;

  if (target1 < target2) {
    d1 = new Date(target1.getFullYear(), target1.getMonth(), target1.getDate());
    d2 = new Date(target2.getFullYear(), target2.getMonth(), target2.getDate());
  } else {
    d2 = new Date(target1.getFullYear(), target1.getMonth(), target1.getDate());
    d1 = new Date(target2.getFullYear(), target2.getMonth(), target2.getDate());
    dist = -1;
  }

  let diff_msec = d2.getTime() - d1.getTime();
  let diff_days = diff_msec / 1000 / 60 / 60 / 24;

  if (diff_days > -1 && diff_days < 1) {
    // 今日
    return 0;
  }

  // 週末考慮なしならそのまま返す
  if (!exclude_weekend) {
    return Math.floor(diff_days);
  }

  // 比較対象日が週末なら営業日まで進める
  if (!is_weekday(d1)) {
    d1 = addDays(d1, 1, true);
  }
  if (!is_weekday(d2)) {
    d2 = addDays(d2, 1, true);
  }

  for (let i = 0; i < 50; i++) {
    d1 = addDays(d1, 1, true);
    if (d1 >= d2) {
      return (i + 1) * dist;
    }
  }
  return null;
}

/**
 * 表示用日付文字列取得 (「1日前」とかの表示)
 * @param 日付文字列(yyyy/mm/dd xx:xx)
 * @returns 表示用表示日付文字列
 */
function get_display_date_str(date_str) {
  let diff_days = get_days_from_today(date_str);

  // xx日以内なら、「xx日前」と返す
  if (diff_days === null) {
    return '';
  } else if (diff_days === 0) {
    return '本日';
  } else if (diff_days < 0) {
    // 未来
    return Math.floor(-diff_days)+ "日後";
  } else if (diff_days > 0) {
    // if (diff_days <= 15) {
      // 過去 (規定日数まで日数を表示)
      return Math.floor(diff_days) + "日前";
    // }
  }
  return date_str;
}

/**
 * @summary 今日との日数差分を取得
 * @param 日付(文字列)
 * @returns 日数(0:当日 / <0:未来 / >0:過去)
 */
function get_days_from_today(date_str) {
  let d = new Date(date_str);
  let d_now = new Date();
  let days = get_days(d, d_now, true);
  return days;
}

// 無効なDate判定
function isInvalidDate(d) {
  return Number.isNaN(d.getTime());
}

/**
 * @summary 日付文字列からDateオブジェクト作成(年を補正)
 * @param 日付文字列
 */
function date_from_str_ex(date_str) {
  // 年が省かれている形式 (MM/dd)
  if (date_str.split('/').length === 2) {
    let d = new Date(date_str);
    d.setFullYear(new Date().getFullYear());
    return get_date_str(d, true, false, true, true);
  }

  return get_date_str(new Date(date_str), true, false, true, true);
}






//---------------------------------------
// Class
//---------------------------------------

class Circle {
	radius; // クラスのインスタンス変数

	constructor() {
		this.radius = 2;
	}
	getArea() {
		return Math.PI * this.radius * this.radius;
	}
}



//---------------------------------------
// Main
//---------------------------------------
// 今日の済みタスク表示チェック更新
update_check_todays_done();

// フィルターボタン生成
// make_filter_buttons();
make_filter_buttons_ex();





// watch external server connection
XMLHttpRequest = new Proxy(XMLHttpRequest, {
  construct: function (target, args) {
    const xhr = new target(...args);
    // Do whatever you want with XHR request
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 1) {
        // Before sent request to server
        // xhr.setRequestHeader("Authorization", "XXXX-XXXX-XXXX-XXXX");
        alert('Detect Server Connecttion! (XMLHttpRequest)');
      }
    };
    return null;
  },
});

window.fetch = new Proxy(window.fetch, {
  apply: function (target, that, args) {
    // args holds argument of fetch function
    // Do whatever you want with fetch request
    let temp = target.apply(that, args);
    temp.then((res) => {
      alert('Detect Server Connecttion! (fetch)');
      console.log(res.url + ' / ' + res.status);
      // console.log(res.body);

      // After completion of request
      // if (res.status === 401) {
      //   alert("Session expired, please reload the page!");
      // }
    });
    return temp;
  },
});