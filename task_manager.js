//---------------------------------------
// Global
//---------------------------------------



//---------------------------------------
// Data
//---------------------------------------

// Element ID
const elem_id_list_stock = 'stock_list';
const elem_id_list_everyday = 'everyday_task_list';
const elem_id_list_today_must = 'todays_must_list';
const elem_id_list_today = 'todays_list';
const elem_id_list_done = 'done_list';
const elem_id_list_priority = 'priority_list';
// const elem_id_list_tomorrow = 'tomorrow_list';


// key code
// https://developer.mozilla.org/ja/docs/Web/API/KeyboardEvent/keyCode
const key_enter = 13;
const key_a = 65;
const key_c = 67;
const key_d = 68;
const key_f = 70;
const key_l = 76;
const key_n = 78;
const key_s = 83;
const key_z = 90;
const key_arrow_left = 37;
const key_arrow_up = 38;
const key_arrow_right = 39;
const key_arrow_down = 40;
const key_space = 32;
const key_esc = 27;

// 自動保存 遅延実行時間
const AUTOSAVE_DELAY = 500;

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

// リストのソート順(string | period)
const g_list_sort = 'string'

// 全リストのフィルタ
// {name: '[文字列]', has_url: [true|false], has_mail: [true|false], has_note: [true|false], is_wait: [true|false], priority:[true|false] };
var g_stock_filter = {group_name: '', item_name: '' , is_today: false, has_url: false, has_mail: false, has_note: false, is_wait: false, priority: false, is_group_favorite: false};
var g_stock_filter_id = 0;
// フィルタ変更時にカーソル位置記憶する
const enable_filter_cursor_pos = true;

// 編集履歴(Undo対応)
var g_list_history = [];
const g_list_history_num = 20;

// 変更履歴の記録
const g_modify_history_num = 50;  // 最大保持数

// 全リストの済みタスク表示フラグ (true:表示する / false:表示しない)
var g_is_show_stock_done = true;
// 今日の済みタスク表示フラグ (true:表示する / false:表示しない)
var g_is_show_todays_done = false;
// 今日のタスク ロック状態
var g_lock_todays_task = true;

// メモ/HTMLプレビュー
// 消去タイマーID
var g_note_preview_hidden_timer = null;
// 消去タイマー時間
const NOTE_PREVIEW_HIDDEN_DELAY = 0;

// 自動保存タイマーID
var g_autosave_timer = null;

// 編集ポップアップ表示状態
var g_show_popup = false;
var g_show_popup_list = null;

// timeline Object
var g_timeline = null;
// 表示する日付範囲
const past_days = 2;
const post_days = 8;
// 選択アイテム
var g_timeline_selected_itemid = null;
// タイムライン表示更新 遅延実行時間(タイムライン上での変更操作による)
const REFRESH_TIMELINE_DELAY = 100;

// 会議登録先グループ名
const g_meeting_group_name = '会議';

// ファイル名
// const g_mail_flag = 'timeline_mail_flag.js.txt';
// const g_meeting_script = 'timeline_tasks.js';
// const g_work_schedule_file = 'timeline_work_schedule.js';
const g_mail_flag = '../timeline_mail_flag.js.txt';
const g_meeting_script = '../export/timeline_schedule.js';
const g_work_schedule_file = '../export/timeline_work_status.js'



//---------------------------------------
// Event
//---------------------------------------
// Click Event
document.getElementById(elem_id_list_stock).addEventListener("click", click_handler_stock_list);
document.getElementById(elem_id_list_stock).addEventListener("dblclick", dblclick_handler_stock_list);
document.getElementById(elem_id_list_today).addEventListener("dblclick", done_item);
document.getElementById(elem_id_list_today).addEventListener("click", click_handler_todays_list);
document.getElementById(elem_id_list_done).addEventListener("dblclick", return_item);

// Click Event
// regist
document.getElementById("btn_input_reflect").addEventListener("click", regist_from_textarea);
document.getElementById("btn_input_json").addEventListener("click", regist_from_json);

// stock list
document.getElementById("copy_stock_list").addEventListener("click", copy_all_task_blob);
document.getElementById("stock_list_filter_text").addEventListener("input", change_filter_text);
document.getElementById("stock_list_filter_text").addEventListener("keydown", keyhandler_stock_list_filter_text);
document.getElementById("stock_list_done_hidden").addEventListener("click", toggle_show_stock_done);

// todays list
// document.getElementById("copy_todays_list").addEventListener("click", copy_todays_list);
// document.getElementById("todays_expires_to_todays_list").addEventListener("click", move_today_item_todays_expires);

// todays must list
document.getElementById("copy_todays_must_list").addEventListener("click", copy_todays_must_list);

document.getElementById("release_todays_add_task").addEventListener("click", release_todays_add_task);
// document.getElementById("set_first_task").addEventListener("click", toggle_todays_first_task);
// document.getElementById("clear_first_task").addEventListener("click", clear_first_task);
document.getElementById("toggle_show_done").addEventListener("click", toggle_show_todays_done);
document.getElementById("lock_todays_task").addEventListener("click", toggle_lock_todays_task);

// done list
document.getElementById("copy_done_list").addEventListener("click", copy_todays_done_list);
document.getElementById("copy_updates_list").addEventListener("click", copy_todays_updates_list);
document.getElementById("release_todays_done").addEventListener("click", release_todays_done);

// tomorrow list
// document.getElementById("release_tomorrow").addEventListener("click", release_tomorrow_item);


// other
document.getElementById("save").addEventListener("click", save_data);
document.getElementById("load").addEventListener("click", load_data);
document.getElementById("auto_save").addEventListener("click", toggle_auto_save);
document.getElementById("add_item").addEventListener("click", add_items);
document.getElementById("remove_item").addEventListener("click", remove_selected_item_stock_list);
document.getElementById("undo").addEventListener("click", undo_item);
document.getElementById('scroll_lock').addEventListener("click", toggle_scroll_lock);
document.getElementById('copy_generate_password').addEventListener("click", copy_generate_password);
document.getElementById("copy_now_json").addEventListener("click", copy_now_json);
document.getElementById("download_now_json").addEventListener("click", download_now_json);
document.getElementById("import_mail_flag").addEventListener("click", read_mail_flag);
document.getElementById("import_todays_meeting").addEventListener("click", read_todays_meeting);
document.getElementById("import_tomorrows_meeting").addEventListener("click", read_tomorrows_meeting);
document.getElementById("read_member_status").addEventListener("click", read_work_schedule);

// Buttons Div
document.getElementById('buttons_hover_area').addEventListener("mouseover", mouseover_handler_buttons_div);
// Address List Div
document.getElementById('address_list_hover_area').addEventListener("mouseover", mouseover_handler_address_list_div);

// Note/Mail Preview
document.getElementById('popup_note_mail_preview').addEventListener("mouseover", mouseover_handler_note_preview);
document.getElementById('popup_note_mail_preview').addEventListener("mouseleave", mouseleave_handler_note_preview);

// Popup
document.getElementById("popup_edit_form").addEventListener("submit", submit_edit_popup);
document.getElementById("popup_edit_cancel_btn").addEventListener("click", close_edit_popup);
// Popup(multi)
document.getElementById("popup_edit_multi_form").addEventListener("submit", submit_edit_multi_popup);
document.getElementById("popup_edit_multi_cancel_btn").addEventListener("click", close_edit_multi_popup);


// document.querySelectorAll(".td_edit").forEach(function(elem) { elem.addEventListener('click', click_stock_list_item); });

// Key event
document.addEventListener("keydown", keyhandler_body);
document.getElementById(elem_id_list_stock).addEventListener("keydown", keyhandler_stock_list);
document.getElementById(elem_id_list_everyday).addEventListener("keydown", keyhandler_everyday_list);
document.getElementById(elem_id_list_today_must).addEventListener("keydown", keyhandler_todays_must_list);
document.getElementById(elem_id_list_today).addEventListener("keydown", keyhandler_todays_list);
document.getElementById(elem_id_list_done).addEventListener("keydown", keyhandler_done_list);
document.getElementById(elem_id_list_priority).addEventListener("keydown", keyhandler_priority_list);
// document.getElementById(elem_id_list_tomorrow).addEventListener("keydown", keyhandler_tomorroy_list);
document.getElementById("popup_edit_base").addEventListener("keydown", keyhandler_edit_popup);
document.getElementById("popup_edit_multi_base").addEventListener("keydown", keyhandler_edit_popup_multi);

// wheel event
document.getElementById(elem_id_list_stock).addEventListener("wheel", wheelhandler_stock_list);

// Right Click
document.getElementById(elem_id_list_stock).addEventListener("contextmenu", contextmenu_handler_list);
document.getElementById(elem_id_list_everyday).addEventListener("contextmenu", contextmenu_handler_list);
document.getElementById(elem_id_list_today_must).addEventListener("contextmenu", contextmenu_handler_list);
document.getElementById(elem_id_list_today).addEventListener("contextmenu", contextmenu_handler_list);
document.getElementById(elem_id_list_done).addEventListener("contextmenu", contextmenu_handler_list);
document.getElementById(elem_id_list_priority).addEventListener("contextmenu", contextmenu_handler_list);
// document.getElementById(elem_id_list_tomorrow).addEventListener("contextmenu", contextmenu_handler_list);


// Popup
// URL（Copyボタン）
document.getElementById("popup_button_copy_url").addEventListener("click", function(){
  let url = document.getElementById("popup_edit_url").value;
  navigator.clipboard.writeText(url);
  copy_animation2(this);
});

// 期限（今日にセットするボタン）
document.getElementById("popup_button_set_today").addEventListener("click", click_handler_period_today);
document.getElementById("popup_button_date_end_set_today").addEventListener("click", click_handler_period_today);
// 期限（+1日するボタン）
document.getElementById("popup_button_date_inc").addEventListener("click", click_handler_period_inc_xxx_day);
document.getElementById("popup_button_date_end_inc").addEventListener("click", click_handler_period_inc_xxx_day);
// 期限（+1Wするボタン）
document.getElementById("popup_button_date_inc1w").addEventListener("click", click_handler_period_inc_xxx_day);
document.getElementById("popup_button_date_end_inc1w").addEventListener("click", click_handler_period_inc_xxx_day);
// 期限（+1Mするボタン）
document.getElementById("popup_button_date_inc1m").addEventListener("click", click_handler_period_inc_1m);
document.getElementById("popup_button_date_end_inc1m").addEventListener("click", click_handler_period_inc_1m);
// 期限（Clearボタン）
document.getElementById("popup_button_date_clear").addEventListener("click", click_handler_period_clear);
document.getElementById("popup_button_date_end_clear").addEventListener("click", click_handler_period_clear);
// 期限変更イベント(曜日を表示)
document.getElementById("popup_edit_date").addEventListener("change", change_handler_period_refresh_weekday);
document.getElementById("popup_edit_date").addEventListener("input", change_handler_period_refresh_weekday);
document.getElementById("popup_edit_date_end").addEventListener("change", change_handler_period_refresh_weekday);
document.getElementById("popup_edit_date_end").addEventListener("input", change_handler_period_refresh_weekday);


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
    case key_enter:     // Enter(修飾キーなし)
      if (!event.altKey && !event.shiftKey && !event.ctrlKey) {
        event.preventDefault();
        submit_edit_popup();
        break;
      }
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
 * @summary Allリスト ダブルクリックイベント
 */
function dblclick_handler_stock_list(event) {
  if (event.target.dataset.id === "") {
    // 未選択
    return;
  }

  let item = getInternal(parseInt(event.target.dataset.id));
  if (item === null) {
    return;
  }
  if (item.type === 'item') {
    // 編集ポップアップを表示
    show_edit_popup(elem_id_list_stock);
  } else if (item.type === 'group') {
    // グループ名を完全一致でフィルタ
    g_stock_filter = {group_name: '^' + RegExp.escape(item.name) + '$', item_name: ''};
    update_stock_list(g_stock_filter);
    show_timeline('all');
  }
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
 * @summary Body キーイベント処理
 * @param イベント情報
 */
function keyhandler_body(event) {
  switch (event.keyCode){
    case key_l:    // L
      // 画面スクロールロック切り替え
      toggle_scroll_lock();
      break;
  }
}

/**
 * @summary 全リスト フィルタテキスト入力欄
 * @param イベント情報
 */
function keyhandler_stock_list_filter_text(event) {
  switch (event.keyCode) {
    case key_esc:       // ESC
      event.preventDefault(); // 既定の動作をキャンセル
      clear_filter_text();
      break;
  }
}

/**
 * @summary 各リスト 共通キーイベント処理
 * @param イベント情報
 * @returns キーに対応する処理をしたかどうか. true:処理した / false:処理しない
 */
function keyhandler_list_common(event, elem_id, ignore_keys=null) {
  let is_processed = false;

  if (ignore_keys !== null && ignore_keys.includes(event.keyCode)) {
    return false;;
  }

  switch (event.keyCode){
    case key_c:           // c
      if (event.shiftKey) {
        event.preventDefault(); // 既定の動作をキャンセル
        copy_selected_item_name_for_mailquery(elem_id);
        is_processed = true;
        break;
      }
      if (event.ctrlKey) {
        event.preventDefault(); // 既定の動作をキャンセル
        copy_selected_item_name(elem_id);
        is_processed = true;
        break;
      }
      break;
    case key_d:           // d
      if (!event.shiftKey && !event.ctrlKey) {
        event.preventDefault(); // 既定の動作をキャンセル
        remove_selected_item(elem_id);
        is_processed = true;
      }
      break;
    case key_s:           // s
      if (event.shiftKey) {
        // ALLリストの選択アイテムを、今日のリストと同期
        event.preventDefault(); // 既定の動作をキャンセル
        let id = get_select_id(elem_id);
        if (id !== null) {
          g_timeline.setSelection(id);  // タイムライン上のアイテムを選択
          clear_list_filter(elem_id_list_stock);
          set_select(elem_id_list_stock, id, true, true);
          document.getElementById(elem_id_list_stock).focus();  // フォーカス移動
        }
        is_processed = true;
        break;
      }
      break;
    case key_z:           // z
      if (event.ctrlKey) {
        event.preventDefault(); // 既定の動作をキャンセル
        // 元に戻す
        undo_item()
        is_processed = true;
        break;
      }
      event.preventDefault(); // 既定の動作をキャンセル
      toggle_wait(elem_id);
      is_processed = true;
      break;
    case key_space:       // space
      event.preventDefault(); // 既定の動作をキャンセル
      if (event.shiftKey) {
        // 設定されたURLを開く
        open_select_items_url(elem_id);
        is_processed = true;
        break;
      }
      // 編集ポップアップ
      if (g_show_popup) {
        close_edit_popup();
      } else {
        show_edit_popup(elem_id);
      }
      is_processed = true;
      break;
    case key_enter:     // Enter
      event.preventDefault(); // 既定の動作をキャンセル
      // 編集ポップアップ
      if (g_show_popup) {
        close_edit_popup();
      } else {
        show_edit_popup(elem_id);
      }
      is_processed = true;
      break;
  }

  return is_processed;
}

/**
 * @summary ALLリスト キーイベント処理
 * @param イベント情報
 */
function keyhandler_stock_list(event) {
  const elem_id = elem_id_list_stock;

  // 共通処理
  if (keyhandler_list_common(event, elem_id, [key_s])) {
    return;
  }

  switch (event.keyCode){
    case key_arrow_up:    // ↑
      // 前のグループを選択
      if (event.ctrlKey) {
        event.preventDefault(); // 既定の動作をキャンセル
        break;
      }
      if (event.altKey) {
        event.preventDefault(); // 既定の動作をキャンセル
        swap_selected_item(elem_id, true);
        break;
      }
      break;
    case key_arrow_down:  // ↓
      if (event.ctrlKey) {
        // 次のグループを選択
        event.preventDefault(); // 既定の動作をキャンセル
        break;
      }
      if (event.altKey) {
        event.preventDefault(); // 既定の動作をキャンセル
        swap_selected_item(elem_id, false);
        break;
      }
      break;
    case key_arrow_right: // →
      if(event.ctrlKey) {
        set_todays_must_task(elem_id);  // 今日のMUSTタスクへ
      } else {
        move_today_item();  // 今日のタスクへ
      }
      break;
    case key_a:           // a
      // 空白タスクを選択行の下へ追加
      event.preventDefault(); // 既定の動作をキャンセル
      const add_id = addItemBehindSelectedItem(elem_id, false, false);
      refresh_screen('item');
      set_select(elem_id, add_id, false, false);
      break;
    case key_d:           // d
      if (event.ctrlKey) {
        event.preventDefault(); // 既定の動作をキャンセル
        const add_id = addItemBehindSelectedItem(elem_id, true, false);
        refresh_screen('item');
        set_select(elem_id, add_id, false, false);
        break;
      }
      break;
    case key_f:           // f
      if (event.ctrlKey) {
        event.preventDefault();
        // 検索文字入力欄へフォーカス移動
        document.getElementById('stock_list_filter_text').focus();
        break;
      }
    case key_n:           //n
      // 非タスク化
      toggle_non_task(elem_id);
      break
    case key_s:           // s
      if (event.shiftKey) {
        // アイテム選択を同期
        event.preventDefault(); // 既定の動作をキャンセル
        let id = get_select_id(elem_id);
        if (id !== null) {
          // タイムライン上のアイテムを選択
          g_timeline.setSelection(id);

          // ALLリストの選択アイテムを、今日/済み/明日のリスト内を探して選択
          let is_sel = set_select(elem_id_list_today, id, true, true);
          if (!is_sel) {
            is_sel = set_select(elem_id_list_today_must, id, true, true);
            if (!is_sel) {
              is_sel = set_select(elem_id_list_done, id, true, true);
              if (!is_sel) {
                is_sel = set_select(elem_id_list_tomorrow, id, true, true);
              }
            }
          }
        }
        break;
      }
      break;
    case key_esc:       // ESC
      event.preventDefault(); // 既定の動作をキャンセル
      clear_filter_text();
      clear_list_filter(elem_id_list_stock);  // フィルタクリア
      break;
  }
}

/**
 * @summary 毎日のリスト キーイベント処理
 * @param イベント情報
 */
function keyhandler_everyday_list(event) {
  const elem_id = elem_id_list_everyday;

  // 共通処理
  if (keyhandler_list_common(event, elem_id)) {
    return;
  }
}

/**
 * @summary 今日のMustリスト キーイベント処理
 * @param イベント情報
 */
function keyhandler_todays_must_list(event) {
  const elem_id = elem_id_list_today_must;

    // 共通処理
  if (keyhandler_list_common(event, elem_id)) {
    return;
  }

  switch (event.keyCode){
    case key_arrow_down:  // ↓
      if (event.ctrlKey) {
        event.preventDefault(); // 既定の動作をキャンセル
        // Mustタスクへ移動
        clear_todays_must_task(elem_id);
        break;
      }
      break;
    case key_arrow_right: // →
      done_item(elem_id);
      break;
    case key_arrow_left: // ←
      pushHistory();
      clear_today_and_must_task(elem_id);
      break;
    case key_d:           // d
      if (event.ctrlKey) {
        event.preventDefault(); // 既定の動作をキャンセル
        const add_id = addItemBehindSelectedItem(elem_id, true, false);
        refresh_screen('item');
        set_select(elem_id, add_id, false, false);
        break;
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

  // 共通処理
  if (keyhandler_list_common(event, elem_id)) {
    return;
  }

  switch (event.keyCode){
    case key_arrow_up:    // ↑
      if (event.ctrlKey) {
        event.preventDefault(); // 既定の動作をキャンセル
        // Mustタスクへ移動
        set_todays_must_task(elem_id);
        break;
      }
      break;
    case key_arrow_down:  // ↓
      if (event.altKey) {
        break;
      }
      break;
    case key_arrow_left: // ←
      remove_today_item(elem_id);
      break;
    case key_arrow_right: // →
      if (event.ctrlKey) {
        // 明日のタスクへ設定
        set_tomorrow_item(elem_id , true);
        break;
      }
      done_item(elem_id);
      break;
    case key_a:           // a
      // 空白タスクを選択行の下へ追加
      event.preventDefault(); // 既定の動作をキャンセル
      const add_id = addItemBehindSelectedItem(elem_id, false, true);
      refresh_screen('item');
      set_select(elem_id, add_id, false, false);
      break;
    case key_d:           // d
      if (event.ctrlKey) {
        event.preventDefault(); // 既定の動作をキャンセル
        const add_id = addItemBehindSelectedItem(elem_id, true, false);
        refresh_screen('item');
        set_select(elem_id, add_id, false, false);
        break;
      }
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
  }
}

/**
 * @summary 済みリスト キーイベント処理
 * @param イベント情報
 */
function keyhandler_done_list(event) {
  const elem_id = elem_id_list_done;

  // 共通処理
  if (keyhandler_list_common(event, elem_id)) {
    return;
  }

  switch (event.keyCode){
    case key_arrow_left:       // ←
      return_item();   
      break;
  }
}

/**
* @summary 優先順位順のタスクリスト キーイベント処理
* @param イベント情報
*/
function keyhandler_priority_list(event) {
  const elem_id = elem_id_list_priority;

  // 共通処理
  if (keyhandler_list_common(event, elem_id)) {
    return;
  }
}

/**
* @summary 明日のリスト キーイベント処理
* @param イベント情報
*/
function keyhandler_tomorroy_list(event) {
  const elem_id = elem_id_list_tomorrow;
 
  // 共通処理
  if (keyhandler_list_common(event, elem_id)) {
    return;
  }

  switch (event.keyCode){
    case key_arrow_left:  // ←
      set_tomorrow_item(elem_id , false);
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

/**
 * @summary リスト要素 mouseover
 */
function mouseover_handler_option(event) {
  show_note_preview(event);
}

/**
 * @summary リスト要素 mouseleave
 */
function mouseleave_handler_option(event) {
  // 遅延でメモプレビューを非表示
  g_note_preview_hidden_timer = setTimeout(() => {
    close_note_preview(event);
    g_note_preview_hidden_timer = null;
  }, NOTE_PREVIEW_HIDDEN_DELAY);
}

/**
 * @summary ボタン類(div) mouseover
 */
function mouseover_handler_buttons_div(event) {
  let elem_address_list = document.getElementById('button_area_div');

  // 一旦表示
  elem_address_list.style.visibility = 'visible';
  elem_address_list.style.opacity = 1;
  elem_address_list.style.top = event.clientY - 100;
  elem_address_list.style.left = event.clientX - 100;

  // 位置調整
  let pos = adjust_element_position('button_area_div', event.clientY-100, event.clientX-100);
  elem_address_list.style.top = pos.top;
  elem_address_list.style.left = pos.left;

  // イベント登録
  elem_address_list.addEventListener('mouseleave', mouseleave_handler_buttons);
}

/**
 * @summary ボタン類(Popup) mouseleave
 */
function mouseleave_handler_buttons(event) {
  // 非表示
  event.target.style.visibility = 'hidden';
  event.target.style.opacity = 0;
  // イベント削除
  event.target.removeEventListener('mouseleave', mouseleave_handler_buttons);
}

/**
 * @summary アドレス帳(div) mouseover
 */
function mouseover_handler_address_list_div(event) {
  let elem_address_list = document.getElementById('address_list_area');

  // 一旦表示
  elem_address_list.style.visibility = 'visible';
  elem_address_list.style.opacity = 1;
  elem_address_list.style.top = event.clientY - 100;
  elem_address_list.style.left = event.clientX - 100;

  // 位置調整
  let pos = adjust_element_position('address_list_area', event.clientY-100, event.clientX-100);
  elem_address_list.style.top = pos.top;
  elem_address_list.style.left = pos.left;

  // イベント登録
  elem_address_list.addEventListener('mouseleave', mouseleave_handler_address_list);
}

/**
 * @summary アドレス帳(Popup) mouseleave
 */
function mouseleave_handler_address_list(event) {
  // 非表示
  event.target.style.visibility = 'hidden';
  event.target.style.opacity = 0;
  // イベント削除
  event.target.removeEventListener('mouseleave', mouseleave_handler_address_list);
}

/**
 * @summary メモ/メールプレビュー枠 mouseover
 */
function mouseover_handler_note_preview(event) {
  // プレビュー消去をキャンセル
  if (g_note_preview_hidden_timer !== null) {
    clearTimeout(g_note_preview_hidden_timer);
    g_note_preview_hidden_timer = null;
  }
}

/**
 * @summary メモ/メールプレビュー枠 mouseleave
 */
function mouseleave_handler_note_preview(event) {
  close_note_preview(event);
}

/**
 * メモ/メールプレビュー表示
 * @param event
 */
function show_note_preview(event) {
  let elem = document.getElementById('popup_note_mail_preview');
  if (event.shiftKey) {
    // メモ内容をプレビュー
    let note = getInternal(parseInt(event.target.dataset.id)).note;
    if (note !== undefined && note !== '') {
      elem.dataset.type = 'note';
      elem.innerHTML = note.replaceAll('\n', '<br>');
      elem.style.top = event.clientY;
      elem.style.left = event.clientX + 20;
      elem.style.height = '';
      elem.style.display = 'block';
      // console.log( event.target.dataset.id +' : '+ getInternal(parseInt(event.target.dataset.id)).note);
    }
  } else if (event.ctrlKey) {
    // HTMLメールプレビュー
    // 表示中なら何もしない(カーソル追従もしない)
    // if (elem.style.display === 'block' && elem.dataset.type === 'mail_preview') {
    //   return;
    // }
    let mail_content = getInternal(parseInt(event.target.dataset.id)).mail_content;
    if (mail_content !== undefined && mail_content !== '') {
      elem.dataset.type = 'mail_preview';
      elem.innerHTML = mail_content;
      // imgタグのsrcがhttp(s)スキームでない場合は削除
      let tags = elem.getElementsByTagName('img');
      for (let i = tags.length - 1; i >= 0; i--) {
        if (!new RegExp('^https?:\/\/', 'i').test(tags[i].src)) {
          tags[i].remove();
        }
      }
      elem.style.display = 'block'; // ここで一旦表示
      let pos = adjust_element_position('popup_note_mail_preview', event.clientY, event.clientX + 20);
      elem.style.top = pos.top;
      elem.style.left = pos.left;
      // 高さが画面高さ以上の場合は画面高さに合わせる
      if (document.getElementById('popup_note_mail_preview').clientHeight > window.innerHeight) {
        elem.style.height = window.innerHeight;
      }
    }
  }
}

/**
 * メモ/メールプレビュー非表示
 * @param event
 */
function close_note_preview(event) {
  let elem = document.getElementById('popup_note_mail_preview');
  elem.style.display = 'none';
  elem.innerHTML = '';
  elem.style.height = '';
  elem.dataset.type = '';
  // console.log( event.target.dataset.id +' : ' + 'mouse leave');
}

/**
 * @summary フィルタ文字列変更
 */
function change_filter_text(event) {
  // console.log(event.target.value);

  // フィルタクリア
  clear_list_filter(elem_id_list_stock);

  // フィルタ条件変更
  g_stock_filter = {group_name: '', item_name: event.target.value, is_today: false, has_url: false, has_mail: false, has_note: false, is_wait: false, priority: false};
  update_stock_list(g_stock_filter);
  show_timeline('all');
}

/**
 * @summary フィルタ文字列クリア
 */
function clear_filter_text() {
  // テキストボックスをクリア
  let elem = document.getElementById("stock_list_filter_text");
  elem.value = '';
  // イベント発火
  const inputEvent = new InputEvent('input', {
    bubbles: true, // イベントが伝播するのを許可する
    cancelable: true // イベントをキャンセルできるのを許可する
  });
  elem.dispatchEvent(inputEvent);
}

/**
 * 編集ポップアップ内の期限設定ボタン（今日にセットするボタン）
 */
function click_handler_period_today(event) {
  let target_elem_id = event.target.dataset.target;
  document.getElementById(target_elem_id).value = get_today_str(true, false, true).replaceAll('/','-');
}

/**
 * 編集ポップアップ内の期限設定ボタン（+1日/+1wするボタン）
 */
function click_handler_period_inc_xxx_day(event) {
  let target_elem_id = event.target.dataset.target;
  let target_elem = document.getElementById(target_elem_id);

  let date_str = target_elem.value.replaceAll('-','/');
  if (date_str === '') {
    date_str = get_today_str(true, false, true).replaceAll('/','-');
    // 基準となる日時を取得(data-from_target タグ)
    if (event.target.dataset.from_target !== undefined) {
      let date_temp = document.getElementById(event.target.dataset.from_target).value.replaceAll('-','/');
      if (date_temp !== '') {
        date_str = date_temp;
      }
    }
  }
  // data-inc_date タグから加算する日数を取得し、加算
  let ret = addDays_s(new Date(date_str), parseInt(event.target.dataset.inc_date), true);
  target_elem.value = ret.replaceAll('/','-');
}

/**
 * 編集ポップアップ内の期限設定ボタン（+1mするボタン）
 */
function click_handler_period_inc_1m(event) {
  let target_elem_id = event.target.dataset.target;
  let target_elem = document.getElementById(target_elem_id);

  let date_str = target_elem.value.replaceAll('-','/');
  if (date_str === '') {
    date_str = get_today_str(true, false, true).replaceAll('/','-');
    // 基準となる日時を取得(data-from_target タグ)
    if (event.target.dataset.from_target !== undefined) {
      let date_temp = document.getElementById(event.target.dataset.from_target).value.replaceAll('-','/');
      if (date_temp !== '') {
        date_str = date_temp;
      }
    }
  }
  // 日数加算
  let ret = addMonths_s(new Date(date_str), 1, true);
  target_elem.value = ret.replaceAll('/','-');
}

/**
 * 編集ポップアップ内の期限設定ボタン（Clearボタン）
 */
function click_handler_period_clear(event) {
  let target_elem_id = event.target.dataset.target;
  document.getElementById(target_elem_id).value = '';
}

/**
 * 編集ポップアップ内の期限変更イベント(曜日を更新)
 */
function change_handler_period_refresh_weekday(event) {
  change_handler_period_refresh_weekday_for_hook(event.target);
}
function change_handler_period_refresh_weekday_for_hook(elem) {
  let weekday_elem_id = elem.dataset.weekday_elem;
  const val = elem.value; // "YYYY-MM-DD" 形式
  let weekday_str = getWeekDayStr(val);
  document.getElementById(weekday_elem_id).textContent = weekday_str;
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
  refresh_screen('all');

  // 追加グループ選択
  set_select(elem_id_list_stock, group_id, true, true);

  // テキストをクリア
  document.getElementById("input_area").value = '';
}

/**
 * @summary 画面更新
 * @param タイムライン更新モード(all:グループ/アイテムを更新, item:アイテムのみ(グループは更新しない))
 */
function refresh_screen(timeline_refreshmode = 'all') {
  update_stock_list(g_stock_filter);
  update_everyday_list();
  update_todays_must_list();
  update_todays_list();
  update_done_list();
  // update_tomorrow_list();
  update_priority_list();

  show_timeline(timeline_refreshmode);
}

/**
 * @summary フィルタ実行
 */
function click_set_list_filter() {
  set_list_filter(elem_id_list_stock, parseInt(this.dataset.id));
}

/**
 * @summary フィルタ設定
 * @param リストの要素ID
 * @param フィルタID
 */
function set_list_filter(elem_id, filter_id) {
  // 同じフィルタなら何もしない
  if (g_stock_filter_id === filter_id) {
    return;
  }

  // 元フィルタのカーソル位置を記憶
  let sel_itemid = get_select_id(elem_id_list_stock);
  if (sel_itemid !== null) {
    set_filter_cursor_pos(g_stock_filter_id, sel_itemid);
  }

  g_stock_filter_id = filter_id;
  // let filter = g_filtersEx[g_stock_filter_id];
  // g_stock_filter = {group_name: filter.word, item_name: '', has_url: filter.has_url, has_mail: filter.has_mail, has_note: filter.has_note, is_wait: filter.is_wait, priority: filter.priority, is_group_favorite: filter.is_group_favorite };
  g_stock_filter = make_filter_info(g_stock_filter_id);
  update_stock_list(g_stock_filter);

  // 前回のカーソル位置を復元
  sel_itemid = get_filter_cursor_pos(g_stock_filter_id);
  if (sel_itemid !== null) {
    set_select(elem_id_list_stock, sel_itemid, true, false);
  }

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
  show_timeline('all');
}

/**
 * @summary フィルタクリア
 * @param リストの要素ID
 */
function clear_list_filter(elem_id) {
  set_list_filter(elem_id, 0);
}

/**
 * @summary 内部用フィルタ情報作成
 * @param フィルタID
 * @returns 内部用フィルタ情報
 */
function make_filter_info(filter_id) {
  let filter = g_filtersEx[filter_id];
  return {group_name: filter.word, item_name: '', is_today: filter.is_today, has_url: filter.has_url, has_mail: filter.has_mail, has_note: filter.has_note, is_wait: filter.is_wait, priority: filter.priority, is_group_favorite: filter.is_group_favorite };
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
  // this.disabled = true;

  // スクリプト読み込み
  load_script(
    g_mail_flag,   // 読み取りファイル
    function() {
      if (window.mail_flag === undefined) {
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
      
      // 最後に読み込んだIDを検索して、読み込み開始を移動
      let mail_id_prev = get_last_mail_id();
      let start_index = 0;
      for (let i = 0; i < window.mail_flag.length; i++) {
        if (mail_flag[i].messageid === mail_id_prev) {
          start_index = i + 1;
          break;
        }
      }

      // タスクを追加
      let mail_id_last = '';
      let items = [];
      for (let i = start_index; i < window.mail_flag.length; i++) {
        let name = `(${window.mail_flag[i].receive_date}) ${mail_flag[i].title}`;
        let period = extractDateYMD(mail_flag[i].title);
        if (getInternalFromName(name) === null) {
          let item = makeInternalItem(name);
          item.mail = window.mail_flag[i].title;
          if (period !== null) {
            item.period = period; // 期限
          }
          // content
          if (window.mail_flag[i].content !== undefined) {
            item.mail_is_html = window.mail_flag[i].is_html_content;
            item.mail_content = window.mail_flag[i].content;
          }

          group.sub_tasks.push(item);
          // 最後のIDを記憶
          mail_id_last = mail_flag[i].messageid;
        }
      }
      if (mail_id_last !== '') {
        set_last_mail_id(mail_id_last);
      }

      // addIntarnalDataEx2(group.id, titles, true);
      refresh_screen('item');
    
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
  // this.disabled = true;
}
/**
 * @summary 明日の会議予定を取り込み
 */
function read_tomorrows_meeting() {
  read_meeting(addDays(new Date(), 1, true));
  // this.disabled = true;
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
      if (window.schedules === undefined) {
        return;
      }
      let meeting_list = get_meeting_text(window.schedules, target_d);
      if (meeting_list.length <= 0) {
        return;
      }
    
      // 追加先グループ取得
      let group = getInternalFromName(g_meeting_group_name);
      if (group === null) {
        // グループがなければ追加
        group = makeInternalGroup(g_meeting_group_name, '');
        // g_list_data[g_meeting_group_name] = group;
        setInternalGroup(g_meeting_group_name, group);
      }
      // タスクリストへ追加
      pushHistory();
      let date_str = get_date_str(target_d, true, false, true, true);
      addIntarnalDataEx2(group.id, meeting_list, true, date_str);
      refresh_screen('item');
    
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
    return [];
  }

  let ret = [];
  for (let i = 0; i < meetings.length; i++) {
    let title = meetings[i].title;
    let location = meetings[i].location.replaceAll('Microsoft Teams 会議', '');
    location = location.replaceAll('; [MMC Okazaki]', '');
    if (location) {location = '💺' +location};
    let start_time = meetings[i].start.split(" ")[1];
    let end_time = meetings[i].end.split(" ")[1];
    let d_s = new Date(meetings[i].start);
    let d_e = new Date(meetings[i].end);
    let diff_msec = (d_e - d_s);
    let diff_hour = floorEx(diff_msec / 1000 / 60 / 60, 10);
    ret.push(`${title} ${location} (${start_time}〜${end_time} / ${diff_hour}h)`);
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
  let target_date_str = get_date_str(target_d, true, false, true, true);

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
 * @summary 出勤予定を取り込み(from timeline_tasks.js)
 */
function read_work_schedule() {
  // スクリプト読み込み
  load_script(
    g_work_schedule_file,
    function() {
      if (window.members_status === undefined) {
        return;
      }
      show_remote_status();
    }
  );
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
  refresh_screen('all');

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
      let new_group = makeInternalGroup(group_name, period);
      internal_list[new_group.id] = new_group; 
      group_id = new_group.id;
    } else {
      let item = makeInternalItem(lines[i]);
      let period = extractDateYMD(lines[i]);
      if (period !== null) {
       item.period = period;  // 期限
      }
      internal_list[group_id].sub_tasks.push(item);
    }
  }
  Object.assign(getInternalRawTasksData(), internal_list);
  return group_id;
}

/**
 * @summary 内部データ取得
 */
function getInternalRawData() {
  return g_list_data;
}

/**
 * @summary 内部データ(tasks)取得
 */
function getInternalRawTasksData() {
  return g_list_data.tasks;
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
  return g_list_data.tasks[key];
}

/**
 * @summary 内部データ グループデータ更新
 */
function setInternalGroup(key, group_data) {
  g_list_data.tasks[key] = group_data;
}

/**
 * @summary 内部データのキーリストを返す
 * @param フィルタ情報(グループに対して適用) (null | { group_name:[グループ名(正規表現)], is_group_favorite:[true|false] })
 * @param ソート種類 (null:なし, 'string':文字列順, 'period':期限の早い順)
 * @return キー一覧
 */
function get_internal_keys(filter, sort_type) {
  let keys = Object.keys(g_list_data.tasks);

  // フィルタ条件に沿ってJSONキー(グループID)を抽出
  let ary = []; // [ {name:'', period:yyyy/mm/dd} ... ]
  for (let i = 0 ; i < keys.length; i++) {
    let group = getInternalGroup(keys[i]);
    // グループお気に入り確認
    if (filter !== null && filter.is_group_favorite === true) {
      if (group.favorite) {
        ary.push({ key: keys[i], name: group.name, period: group.period });
      }
      continue;
    }
    // グループ名フィルタ一致確認
    if (filter !== null && filter.group_name !== '') {
      // 大文字/小文字区別なし
      if (new RegExp(filter.group_name, 'i').test(group.name)) {
        ary.push({ key: keys[i], name: group.name, period: group.period });
      }
    } else {
      ary.push({ key: keys[i], name: group.name, period: group.period });
    }
  }

  // ソート
  if (sort_type === 'period') {
    ary.sort(compareFn_period); // 期限でソート
  }
  if (sort_type === 'string') {
    ary.sort(compareFn_string); // グループ名でソート
  }

  // 戻り値作成(キーのみの一覧)
  ret = [];
  for (let i = 0 ; i < ary.length; i++) {
    ret.push(ary[i].key);
  }
  return ret;
}

/**
 * @summary 内部データのキーリストを条件に沿って返す(拡張Ver)
 * @param フィルタ情報(dict)
 * @return キー一覧(配列)
 */
// function get_internal_keys_ex(filter_dict) {
//   let keys = Object.keys(g_list_data.tasks);

//   // グループ名を検証し、グループ一覧作成
//   let keys_target0 = [];
//   for (let i = 0 ; i < keys.length; i++) {
//     if (filter_dict !== null && filter_dict.name !== undefined && filter_dict.name !== '') {
//       if (getInternalGroup(keys[i]).name.indexOf(filter_dict.name) >= 0) {
//         keys_target0.push(keys[i]);
//       }
//     } else {
//       keys_target0.push(keys[i]);
//     }
//   }

//   // 期限でソート
//   // if (!is_no_sort) {
//   //   ary.sort(compareFn);
//   // }

//   let keys_target = [];

//   // アイテムを確認し、フィルタ条件に一致しないグループを除外
//   for (let i = 0 ; i < keys_target0.length; i++) {
//     let tasks = getInternalGroup(keys_target0[i]).sub_tasks;

//     // {name: '[文字列]', has_url: [true|false], has_mail: [true|false], has_note: [true|false], is_wait: [true|false], priority:[true|false] };
//     let hit = false;
//     for (let k = 0 ; k < tasks.length; k++) {
//       if (filter_dict.has_url !== undefined && filter_dict.has_url === true) {
//         if (tasks[k].url !== '') {
//           hit = true;
//         }
//       }
//       if (filter_dict.has_mail !== undefined && filter_dict.has_mail === true) {
//         if (tasks[k].mail !== '') {
//           hit = true;
//         }
//       }
//       if (filter_dict.has_note !== undefined && filter_dict.has_note === true) {
//         if (tasks[k].note !== '') {
//           hit = true;
//         }
//       }
//       if (filter_dict.is_wait !== undefined && filter_dict.is_wait === true) {
//         if (tasks[k].is_wait === true) {
//           hit = true;
//         }
//       }
//       if (filter_dict.priority !== undefined && filter_dict.priority === true) {
//         if (tasks[k].priority === true) {
//           hit = true;
//         }
//       }
//     }
//     if (hit) {
//       keys_target.push(keys_target0[i]);
//     }
//   }

//   ret = [];
//   for (let i = 0 ; i < keys_target.length; i++) {
//     ret.push(keys_target[i]);
//   }
//   return ret;
// }

/**
 * @summary グループID一覧取得
 * @return グループID一覧
 */
function get_group_ids() {
  let ret = [];
  let keys = get_internal_keys(null, 'string');
  for (let i = 0 ; i < keys.length; i++) {
    ret.push(getInternalGroup(keys[i]).id);
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
  let keys = get_internal_keys(null, null);

  //　アイテムデータを検索
  for (let i = 0 ; i < keys.length; i++) {
    let items = getInternalGroup(keys[i]).sub_tasks;
    for (let j = 0 ; j < items.length; j++) {
      if (items[j].id === id) {
        return items[j];
      }
    }
  }

  // グループを検索
  for (let i = 0 ; i < keys.length; i++) {
    let group = getInternalGroup(keys[i]);
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
  let keys = get_internal_keys(null, null);

  //　アイテムデータを検索
  for (let i = 0 ; i < keys.length; i++) {
    let items = getInternalGroup(keys[i]).sub_tasks;
    for (let j = 0 ; j < items.length; j++) {
      if (items[j].name === name) {
        return items[j];
      }
    }
  }

  // グループを検索
  for (let i = 0 ; i < keys.length; i++) {
    let group = getInternalGroup(keys[i]);
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
  let keys = get_internal_keys(null, null);

  //　アイテムデータを検索
  for (let i = 0 ; i < keys.length; i++) {
    let items = getInternalGroup(keys[i]).sub_tasks;
    for (let j = 0 ; j < items.length; j++) {
      if (items[j].id == id) {
        // グループを返す
        return getInternalGroup(keys[i]);
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
  // item作成
  let item = makeInternalItem(name);

  // 期限抽出
  let period = extractDateYMD(name);
  if (period !== null) {
    item.period = period;
  }

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
function addIntarnalDataEx2(group_id, names, is_ignore_same_name, period='') {
  // グループ取得
  let group = getInternal(group_id);
  if (group.type !== 'group') {
    return null;
  }

  let items = [];
  for (let i = 0 ; i < names.length; i++) {
    let item = makeInternalItem(names[i]);
    item.period = period;
    items.push(item);
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
    is_trashed: false,
    sub_tasks: []
  };
  return ret;
}

/**
 * @summary 内部データアイテム要素作成(ID指定)
 * @param タスク名
 * @param ID
 * @returns dict
 */
function makeInternalItem_ex(name, id) {
  let ret = {
    id: id, 
    type: 'item', 
    name: name, 
    period: '',
    period_end: '',
    url: '',
    url_app_type: 'auto',
    // is_open_app: false,
    status: 'yet', 
    mail: '',
    mail_content: '',
    mail_is_html: false,
    note: '',
    is_today: 0,  // 0:明日以降 / 1:今日 / 2:今日の追加分 
    is_todays_must: false,
    is_first: false, 
    is_wait: false,
    is_doing: false,
    is_tomorrow: false,
    is_non_task: false,
    priority: false,
    is_trashed: false,
    last_update: '',
    created: get_today_str(true, true, true),
  };
  return ret;
}

/**
 * @summary 内部データアイテム要素作成
 * @param タスク名
 * @returns dict
 */
function makeInternalItem(name) {
  return makeInternalItem_ex(name, genItemID());
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
  let keys = get_internal_keys(null, null);
  for (let i = 0 ; i < keys.length; i++) {
    let group = getInternalGroup(keys[i]);

    // group削除
    if (group.id === id) {
      delete g_list_data.tasks[keys[i]];
    } else {
      let items = group.sub_tasks;
      for (let j = 0 ; j < items.length; j++) {
        if (items[j].id === id) {
          // アイテム削除
          items.splice(j,1);
          if (is_remove_empty_group) {
            // アイテムが1つも存在しない場合はグループも削除
            if (items.length <= 0) {
              delete g_list_data.tasks[keys[i]];
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

/**
 * 履歴保存
 * @param 自動保存ONの場合に自動保存スケジュール有無(true:実行 / false:実行しない)
 */
function pushHistory(schedule_auto_save = true) {
  // 先頭へ追加
  let json_str = JSON.stringify(g_list_data);
  // let copy = { ...data };
  g_list_history.splice(0, 0, json_str);

  // 規定要素数以上なら、超過分を削除
  if (g_list_history.length > g_list_history_num) {
    g_list_history.splice(g_list_history_num, g_list_history.length - g_list_history_num);
  }

  // 自動保存試行
  if (schedule_auto_save && get_auto_save_status()) {
    scheduleAutosave();
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
 * @summary 更新履歴を登録
 * @param アイテム(更新前)
 * @param アイテム(更新後)
 */
function registerModifyHistory(item_before, item_after) {
  // 差分があるキーを取得
  let diff_keys = diffValueKeys(item_before, item_after, ["last_update"]);
  if (diff_keys.length <= 0) {
    return;
  }

  // 履歴登録
  // {"id":1, "type": ["create"|"modify"], "attributes": [], "note":"", "datetime": "2026/02/22 10:30:11" },
  let modify_history_dest = get_modify_history();
  let dict = {
    id: item_before.id,
    type: "modify",
    attributes: diff_keys,
    note: "",
    datetime: get_today_str(true, true, true)
  }
  modify_history_dest.push(dict);

  // 最大保持件数を超えていたら古いデータを削除
  if (modify_history_dest.length > g_modify_history_num) {
    modify_history_dest = modify_history_dest.splice(0,1);
  }
}

/**
 * @summary アイテム間で異なる属性名を取得
 * @param アイテム(更新前)
 * @param アイテム(更新後)
 * @param 無視するキー(配列)
 */
function diffValueKeys(item1, item2, ignoreKeys) {
  const keys = Object.keys(item1);
  const diffs = [];

  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    if(ignoreKeys.includes(k)) {
      continue;
    }
    if (!Object.is(item1[k], item2[k])) {
      diffs.push(k);
    }
  }
  return diffs;
}


/**
 * @summary データ互換性維持のための調整 / 内部データの不足している属性補完
 */
function adjust_attr_internal_data() {
  // let keys = Object.keys(g_list_data);
  let keys = get_internal_keys(null, null);

  // group
  for (let i = 0 ; i < keys.length; i++) {
    let group = getInternalGroup(keys[i]);
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
    // ignore_table_copy
    if (group.ignore_table_copy === undefined) {
      group.ignore_table_copy = false;
    }
    // favorite
    if (group.favorite === undefined) {
      group.favorite = false;
    }
    // is_trashed
    if (group.is_trashed === undefined) {
      group.is_trashed = false;
    }
  }

  // item
  for (let i = 0 ; i < keys.length; i++) {
    let items = getInternalGroup(keys[i]).sub_tasks;
    for (let j = 0 ; j < items.length; j++) {
      let item = items[j];
      // is_today
      if (item.is_today === true) {
        item.is_today = 1;
      }
      if (item.is_today === false) {
        item.is_today = 0;
      }
      // is_first
      if (item.is_first === undefined) {
        item.is_first = false;
      }
      // is_everyday
      if (item.is_everyday === undefined) {
        item.is_everyday = false;
      }
      // is_todays_must
      if (item.is_todays_must === undefined) {
        item.is_todays_must = false;
      }
      // type
      if (item.type === undefined) {
        item.type = 'item';
      }
      // period
      if (item.period === undefined) {
        item.period = '';
      }
      // period End
      if (item.period_end === undefined) {
        item.period_end = '';
      }
      // created
      if (item.created === undefined) {
        item.created = '';
      }
      // URL
      if (item.url === undefined) {
        item.url = '';
      }
      // URL(url_app_type)
      if (item.url_app_type === undefined) {
        item.url_app_type = 'auto';
      }
      // is_wait
      if (item.is_wait === undefined) {
        item.is_wait = false;
      }
      // priority
      if (item.priority === undefined) {
        item.priority = false;
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
      // mail content
      if (item.mail_content === undefined) {
        item.mail_content = '';
      }
      // mail content isHtml
      if (item.mail_is_html === undefined) {
        item.mail_is_html = false;
      }
      // note
      if (item.note === undefined) {
        item.note = '';
      }
      // is_trashed
      if (item.is_trashed === undefined) {
        item.is_trashed = false;
      }
    }
  }

  // グループIDを再付番
  // renumbering_groupid();
}

/**
 * @summary 内部データ変換(v2 to v3)
 * @param dict
 * @returns 変換後dict
 */
function convert_internal_data_v2_to_v3(dict_src) {
  // 変換元バージョンチェック
  if (dict_src.ver !== undefined && dict_src.ver !== 3) {
    return null;
  }

  let dest = {};

  // 新属性追加
  dest.ver = 3;
  dest.config = { search_history: [] };

  // 既存のデータを移行
  dest.tasks = {};
  let keys = Object.keys(dict_src);
  for (let i = 0; i < keys.length; i++) {
    if (dest.tasks[dict_src[keys[i]].id] !== undefined) {
      // 同じIDが存在する為、中断 (上書き防止)
      return null;
    }
    dest.tasks[dict_src[keys[i]].id] = dict_src[keys[i]];
  }

  return dest;
}

/**
 * @summary 今日の全タスク数, 今日の処理済みタスク数 を取得
 * @return dict / {task_number: [今日の全タスク数], task_number_done: [今日の処理済みタスク数] }
 */
function get_todays_task_number() {
  let task_number = 0;
  let task_number_done = 0;

  // let keys = Object.keys(g_list_data);
  let keys = get_internal_keys(null, null);
  for (let i = 0 ; i < keys.length; i++) {
    let items = getInternalGroup(keys[i]).sub_tasks;
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
  let keys = get_internal_keys(null, null);

  for (let i = 0 ; i < keys.length; i++) {
    let group = getInternalGroup(keys[i]);
    copy_text += group.name;
    copy_text += '\n';
    let items = group.sub_tasks;
    for (let j = 0 ; j < items.length; j++) {
      copy_text += items[j].name;
      copy_text += '\n';
    }
  }

  return copy_text;
}

/**
 * @summary 今日のタスクをテキストで取得
 * @param モード(0:全て / 1:処理済みのみ / 2:処理済みを除く / 3:MUSTのみ / 4:MUSTの処理済みを除く)
 * @returns アイテム一覧(配列)
 */
function get_todays_list_text(mode) {
  let items = get_todays_items(mode);
  return get_copy_text(items);
}

/**
 * @summary 今日のタスクをテキストで取得
 * @param モード(0:全て / 1:処理済みのみ / 2:処理済みを除く / 3:MUSTのみ / 4:MUSTの処理済みを除く)
 * @returns アイテム一覧(配列)
 */
function get_todays_items(mode) {
  let copy_text = '';

  // 対象となるタスクリストを作成
  // let keys = Object.keys(g_list_data);
  let keys = get_internal_keys(null, 'string');
  
  let ary = [];
  for (let i = 0 ; i < keys.length; i++) {
    let items = getInternalGroup(keys[i]).sub_tasks;
    for (let j = 0 ; j < items.length; j++) {
      let item = items[j];
      if (item.is_today > 0) {
        switch(mode) {
          case 1: // 処理済みのみ
            if (item.status === 'done') {
              ary.push(item);
            }
            break;
          case 2: // 処理済みを除く
            if (item.status !== 'done') {
              ary.push(item);
            }
            break;
          case 3: // MUSTのみ
            if (item.is_todays_must === true) {
              ary.push(item);
            }
            break;
          case 4: // MUSTの処理済みを除く
            if (item.is_todays_must === true && item.status !== 'done') {
              ary.push(item);
            }
            break;
          default:
            ary.push(item);
            break;
        }
      }
    }
  }
  return ary;
}

/**
 * @summary 本日更新されたタスクをテキストで取得
 * @param 非タスクを無視するか (true:無視 / false:含める)
 * @returns テキスト
 */
function get_todays_updates_text(ignore_non_task) {
  let items = get_todays_updates_items(ignore_non_task);
  return get_copy_text(items);
}

/**
 * @summary 本日更新されたタスクをテキストで取得
 * @returns テキスト
 */
function get_todays_updates_items(ignore_non_task) {
  let copy_text = '';

  // 対象となるタスクリストを作成
  let keys = get_internal_keys(null, 'string');
  
  let ary = [];
  for (let i = 0 ; i < keys.length; i++) {
    let items = getInternalGroup(keys[i]).sub_tasks;
    for (let j = 0 ; j < items.length; j++) {
      let item = items[j];
      // 非タスクはスキップ
      if (ignore_non_task === true && item.is_non_task === true) {
        continue;
      }
      if (item.last_update.includes(get_today_str(true, false, true))) {
        ary.push(item);
      }
    }
  }

  return ary;
}

/**
 * @summary 済みリストをテキストで取得
 * @returns テキスト
 */
function get_done_list_text() {
  let items = get_done_items();
  return get_copy_text(items);
}

/**
 * @summary 済みアイテム一覧を取得
 * @returns アイテム一覧(配列)
 */
function get_done_items() {
  let keys = get_internal_keys(null, null);

  let ary = [];
  for (let i = 0 ; i < keys.length; i++) {
    let items = getInternalGroup(keys[i]).sub_tasks;
    for (let j = 0 ; j < items.length; j++) {
      if (items[j].is_today > 0 && items[j].status === 'done') {
        ary.push(items[j]);
      }
    }
  }
  return ary;
}

/**
 * @summary コピーテキストを取得
 * @param アイテム一覧(配列)
 * @returns テキスト
 */
function get_copy_text(items) {
  if (items.length <= 0) {
    return '';
  }

  // テキストを整形
  let text = '';
  let group_id_prev = -1;
  for (let i = 0 ; i < items.length; i++) {
    let group = getInternalGroupFromItemID(items[i].id);
    if (group.id !== group_id_prev) {
      text += "●" + group.name;
      text += '\n';
    }
    text += '  ' + items[i].name;
    text += '\n';
    group_id_prev = group.id;
  }
  // copy_text += '\n';

  return text;
}

// g_last_group_id / g_last_id を更新
function update_last_id() {
  let last_group_id = g_initial_group_id;
  let last_id = 0;

  // let keys = Object.keys(g_list_data);
  let keys = get_internal_keys(null, null);
  for (let i = 0 ; i < keys.length; i++) {
    // group ID
    let group = getInternalGroup(keys[i]);
    if (group.id > last_group_id) {
      last_group_id = group.id;
    }

    // item ID
    let items = group.sub_tasks;
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
  let keys = get_internal_keys(null, null);
  let groupid = g_initial_group_id;
 
  for (let i = 0 ; i < keys.length; i++) {
    // let group = getInternalGroup(keys[i]);
    let group = getInternalGroup(keys[i]);
    group.id = groupid;
    groupid++;
  }
  g_last_group_id = groupid;
}

/**
 * @summary 最後に読み込んだメールID取得
 * @returns メールID(初回はundefined)
 */
function get_last_mail_id() {
  return g_list_data.config.last_mail_id;
}

/**
 * @summary 最後に読み込んだメールID保存
 * @param メールID
 */
function set_last_mail_id(mail_id) {
  g_list_data.config.last_mail_id = mail_id;
  scheduleAutosave();
}

/**
 * @summary 自動保存状態を取得
 * @returns true/false
 */
function get_auto_save_status() {
  if (g_list_data.config !== undefined && g_list_data.config.auto_save !== undefined) {
    return g_list_data.config.auto_save;
  }
  return false;
}

/**
 * @summary 自動保存状態を保存
 * @param true:自動保存ON / false:自動保存OFF
 */
function set_auto_save_status(auto_save) {
  g_list_data.config.auto_save = auto_save;
  scheduleAutosave();
}

/**
 * @summary 変更履歴格納先を取得
 * @returns 変更履歴格納先(配列)
 */
function get_modify_history() {
  if (g_list_data.config.modify_history === undefined) {
    g_list_data.config.modify_history = [];
  }
  return g_list_data.config.modify_history;
}

/**
 * @summary フィルタ毎の選択アイテムID取得
 * @param フィルタID
 * @param アイテムID
 */
function set_filter_cursor_pos(filter_id, itemid) {
  if(!enable_filter_cursor_pos) {
    return;
  }
  if (g_list_data.config.filter_cursor_pos === undefined) {
    g_list_data.config.filter_cursor_pos = {};
  }
  g_list_data.config.filter_cursor_pos[filter_id] = itemid;
  scheduleAutosave();
}

/**
 * @summary フィルタ毎の選択アイテムID取得
 * @return アイテムID
 */
function get_filter_cursor_pos(filter_id) {
  if(!enable_filter_cursor_pos) {
    return null;
  }
  if (g_list_data.config.filter_cursor_pos === undefined) {
    g_list_data.config.filter_cursor_pos = {};
    return null;
  }
  return g_list_data.config.filter_cursor_pos[filter_id];
}






//---------------------------------------
// List Manage
//---------------------------------------

/**
 * @summary リスト表示更新
 * @param リストデータ
 * @param 更新対象リストのエレメントID
 * @param フィルタ文字列(グループが対象)
 * @param フィルタ文字列(アイテムが対象)
 * @param コールバック(表示判定) / func(アイテム情報)
 * @param コールバック(クラスリスト取得) / func(アイテム情報)
 * @param コールバック(最終更新日表示判定) / func(アイテム情報)
 * @param コールバック(空グループ表示判定) / func()
 */
function update_list_common(list_data, elem_id, filter_group, filter_item, func_is_show, func_get_classes, func_show_lastupdate, func_is_show_empty_group) {
  let selected_ids = get_select_id_ex(elem_id);
  let select = document.getElementById(elem_id);
  select.innerHTML = '';

  let keys = get_internal_keys(filter_group, g_list_sort);
  for (let i = 0 ; i < keys.length; i++) {
    // アイテムの要素一覧を作成
    let append_elems = [];
    let items = list_data[keys[i]].sub_tasks;
    for (let j = 0 ; j < items.length; j++) {
      let item = items[j];
      // リスト側の表示条件
      if (func_is_show(item) === true) {
        // フィルタ条件(大文字/小文字区別しない)
        if (item.name.toLowerCase().indexOf(filter_item.toLowerCase()) !== -1) {
          append_elems.push(make_option(item.name, item, func_get_classes(item), false, func_show_lastupdate(item)));
        }
      }
    }

    if (func_is_show_empty_group() || append_elems.length > 0) {
      // params (group)
      let group_top = {}
      group_top.name = `${list_data[keys[i]].name} ( ${get_display_date_str(list_data[keys[i]].period)} ) (〜 ${list_data[keys[i]].period} )`;
      group_top.type = 'group';
      group_top.id = list_data[keys[i]].id;
      group_top.favorite = list_data[keys[i]].favorite;
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
      select.appendChild(make_option(group_top.name, group_top, classes, true, false));
  
      // アイテム用エレメント追加
      for (let k = 0; k < append_elems.length; k++) {
        select.appendChild(append_elems[k]);
      }
    }
  }

  // 選択
  set_select_ex(elem_id, selected_ids, false, false);
}

/**
 * @summary 日付範囲内に本日が含まれているかどうか
 * @param 開始日(String)
 * @param 終了日(String)
 * @returns true:含まれる / false:含まれない
 */
function is_date_range_include_today(start, end='') {
  if (start === '') {
    // イレギュラーケース
    return false;
  } else if (end !== '') {
    // 今日が開始日と終了日の間にある
    let today = get_today_str(true, false, true);
    let diff1 = get_days(new Date(start), new Date(today), false);
    let diff2 = get_days(new Date(today), new Date(end), false);
    if (diff1 >= 0 && diff2 >= 0) {
      return true;
    }
  } else if (start === get_today_str(true, false, true)) {
    // 終了日の指定なしなら、開始日が今日か確認
    return true;
  }

  return false;
}

/**
 * @summary 全タスクのアイテム表示判定
 * @param item
 * @param フィルタ(dict) { group_name:[グループ名フィルタ], item_name:[アイテム名フィルタ],  has_url:[true|false], has_mail:[true|false], has_note:[true|false], is_wait:[true|false], priority:[true|false], is_group_favorite:[true|false] }
 */
function is_show_item_stock_list(item, filter) {
  // 済みタスク表示OFF
  if (!g_is_show_stock_done && item.status !== 'yet') {
    return false;
  }

  // 表示条件
  if (filter.is_today && !is_date_range_include_today(item.period, item.period_end)) {
    return false;
  }
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
  if (filter.priority && item.priority !== true) {
    return false;
  }
  if (filter.is_group_favorite && getInternalGroupFromItemID(item.id).favorite !== true) {
    return false;
  }
  return true;
}

/**
 * @summary ALLタスクリスト更新
 * @param フィルタ(dict) { group_name:[グループ名フィルタ], item_name:[アイテム名フィルタ],  has_url:[true|false], has_mail:[true|false], has_note:[true|false], is_wait:[true|false], priority:[true|false], is_group_favorite:[true|false] }
 */
function update_stock_list(filter) {
  update_list_common(
    getInternalRawTasksData(), elem_id_list_stock, filter, filter.item_name,
    function(item) {
      return is_show_item_stock_list(item, filter);
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
      if (filter.item_name !== '' || filter.is_today || filter.has_url || filter.has_mail || filter.has_note || filter.is_wait || filter.priority || filter.is_group_favorite) {
        // 特殊条件の場合は非表示
        return false;
      }
      return true;
    }
  );
}

/**
 * 毎日のリストを更新
 */
function update_everyday_list() {
  update_list_common(
    getInternalRawTasksData(), elem_id_list_everyday, null, '',
    function(item) {
      // 表示条件
      return item.is_everyday;
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
}

/**
 * 今日のMustリストを更新
 */
function update_todays_must_list() {
  update_list_common(
    getInternalRawTasksData(), elem_id_list_today_must, null, '',
    function(item) {
      // 表示条件
      if (item.is_tomorrow || item.is_everyday) {
        // 明日のタスク or 毎日のタスクは表示しない
        return false;
      }
      if (!g_is_show_todays_done) {
        // 今日の済みタスク表示OFF
        return (item.is_today > 0 && item.is_todays_must === true && item.status == 'yet');
      }
      return (item.is_today > 0 && item.is_todays_must === true);
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
}

/**
 * 今日のリストを更新
 */
function update_todays_list() {
  update_list_common(
    getInternalRawTasksData(), elem_id_list_today, null, '',
    function(item) {
      // 表示条件
      if (item.is_tomorrow || item.is_everyday) {
        // 明日のタスク or 毎日のタスクは表示しない
        return false;
      }
      if (!g_is_show_todays_done) {
        // 今日の済みタスク表示OFF
        return (item.is_today > 0 && item.is_todays_must === false && item.status == 'yet');
      }
      return (item.is_today > 0 && item.is_todays_must === false);
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
  // const task_number_info = get_todays_task_number();
  // let rate = Math.floor(task_number_info.task_number_done / task_number_info.task_number * 100);
  // let label = `今日のタスク (${task_number_info.task_number_done}/${task_number_info.task_number}) (${rate}%)`;
  // document.getElementById("label_todays_task").innerHTML = label;
}

/**
 * 済みリストを更新
 */
function update_done_list() {
  update_list_common(
    getInternalRawTasksData(), elem_id_list_done, null, '', 
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
// function update_tomorrow_list() {
//   update_list_common(
//     getInternalRawTasksData(), elem_id_list_tomorrow, null, '',
//     function(item) {
//       // 表示条件
//       return (item.is_tomorrow);
//     },
//     function(item) {
//       // クラスリスト
//       let classes = ["group_level1"];
//       if (item.is_wait === true) {
//         classes.push('wait');
//       }
//       if (item.url !== '') {
//         classes.push('has_url');
//       }
//       return classes;
//     },
//     function(item) {
//       // 更新日表示判定
//       return false;
//     },
//     function() {
//       // アイテムが無いグループを表示するかどうか
//       return false;
//     }
//   );
// }

/**
 * 重要度順のタスクリスト表示
 */
function update_priority_list() {
  let list_data = getInternalRawTasksData();
  let select = document.getElementById(elem_id_list_priority);
  select.innerHTML = '';

  // アイテムの要素一覧を作成
  let elems = [];
  let keys = get_internal_keys(null, null);
  for (let i = 0 ; i < keys.length; i++) {
    // サブタスクを確認
    let items = list_data[keys[i]].sub_tasks;
    for (let j = 0 ; j < items.length; j++) {
      let group  = list_data[keys[i]];
      let item = items[j];

      // 未処理以外は除外
      if (item.status !== 'yet') {
        continue;
      }

      // 重要度スコア計算
      let score = calc_priority_score(item);

      // スコアが0以下は追加しない
      if (score <= 0) {
        continue;
      }

      // classes
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

      // 表示するグループ名作成
      let group_name = ' 〰️ ' + group.name.substring(0,10) + '...';
      elems.push({score: score, element: make_option('(' + score + ") " + item.name + group_name, item, classes, false, false)});
    }
  }

  // score順にソート
  elems.sort(compareFn_priority_score);

  // エレメント追加
  for (let k = 0; k < elems.length; k++) {
    select.appendChild(elems[k].element);
  }
}

/**
* @summary 重要度データをスコアが高い順に順にソート 比較関数
* @param データ1
* @param データ2
* @returns 結果(0:変更なし / <0:aをbの前に並べる / >0:aをbの後に並べる )
*/
function compareFn_priority_score(data1, data2) {
  let score1 = data1.score;
  let score2 = data2.score;
 
  if (score1 > score2) {
   return -1;
  } else if (score1 < score2) {
    return 1;
  }
  return 0;
}

/**
 * 重要度スコア計算
 * @param アイテムデータ
 * @returns 重要度スコア
 */
function calc_priority_score(item) {
  let score = 0;
  // 重要
  if (item.priority === true) {
    score += 15;
  }
  // 期限
  if (item.period !== '') {
    let remain_days = get_days_from_today(item.period);
    if (remain_days > 0) {
      // 過去はmaxスコア
      score += 10;
    } else  {
      let add_score = (10 + remain_days)
      if (add_score > 0) {
        score += add_score;
      }
    }
    // console.log(score, item.name, item.priority, item.period, remain_days);
  }
  return score;
}


/**
 * 今日の済みタスク表示チェックを更新
 */
function update_check_todays_done() {
  document.getElementById("toggle_show_done").checked = !g_is_show_todays_done;
}

/**
 * 今日のタスクのロック状態のチェックを更新
 */
function update_check_todays_lock() {
  document.getElementById("lock_todays_task").checked = g_lock_todays_task;
}

/**
 * 自動保存 チェックを更新
 */
function update_auto_save() {
  document.getElementById("auto_save").checked = get_auto_save_status();
}

/**
 * フィルターボタン生成
 */
// function make_filter_buttons() {
//   let elem_div = document.getElementById('set_filter_condition_div');
  
//   // ボタン生成
//   // <button class="set_filter_condition set_filter_condition_on" value="">全て</button>
//   for (let i = 0; i < g_filters.length; i++) {
//     let elem_button = document.createElement("button");
//     elem_button.classList.add('set_filter_condition');
//     elem_button.value = g_filters[i];
//     elem_button.dataset.id = i;
//     if (g_filters[i] === '') {
//       elem_button.textContent = '全て';
//       elem_button.classList.add('set_filter_condition_on');
//     } else {
//       elem_button.textContent = g_filters[i];
//     }
//     elem_button.addEventListener("click", click_set_list_filter);
//     elem_div.appendChild(elem_button);
//   }
// }

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
 * @summary グループID一覧リスト作成
 * @param select要素のID
 * @param 未選択アイテムを追加するかどうか(true/false)
 * @param 初期選択するグループのアイテムID
 */
function set_group_select_ex(elem_id, add_blank, select_group_id = -1) {
  // グループ一覧作成
  let elem_groups = document.getElementById(elem_id);
  elem_groups.innerHTML = '';
  if (add_blank) {
    // プランク追加
    let elem_option = document.createElement("option");
    elem_option.text = "---";
    elem_option.dataset.id = -1;
    elem_groups.appendChild(elem_option);
    elem_groups.appendChild(document.createElement("hr"));  // セパレータ
  }

  let prev_name = "";
  let ids = get_group_ids();
  for (let i = 0; i < ids.length; i++) {
    let group_name = getInternal(ids[i]).name;

    // 「:」以前が一致しないアイテムが来たらセパレータを挿入
    if (prev_name !== '' && prev_name.split(':')[0].trim() !== group_name.split(':')[0].trim()) {
      elem_groups.appendChild(document.createElement("hr"));
    }

    let elem_option = document.createElement("option");
    elem_option.text = group_name;
    elem_option.dataset.id = ids[i];
    // 所属グループを選択
    elem_option.selected = (ids[i] == select_group_id);
    elem_groups.appendChild(elem_option);
    prev_name = elem_option.text;
  }
}

/**
 * @summary グループID一覧リスト作成
 * @param select要素のID
 * @param 未選択アイテムを追加するかどうか(true/false)
 * @param 初期選択するグループのアイテムID
 */
function set_group_select(elem_id, add_blank, selected_item_id= -1) {
  // 所属グループ取得
  let elem_groups = document.getElementById(elem_id);
  elem_groups.innerHTML = '';
  let select_group_id = -1;
  let select_group = getInternalGroupFromItemID(selected_item_id);
  if (select_group !== null) {
    elem_groups.dataset.orgid = select_group.id;
    select_group_id = select_group.id
  }

  // グループリスト作成
  set_group_select_ex(elem_id, add_blank, select_group_id);
}

/**
 * @summary 全リストの検索テキスト選択肢作成
 */
function set_stocklist_filter_text_items() {
  let elem = document.getElementById("stock_list_filter_select_items");
  for (let i = 0; i < g_StockListFilterTexts.length; i++) {
    let option = document.createElement("option");
    option.value = g_StockListFilterTexts[i];
    elem.appendChild(option);
  }
}

/**
  @summary  リストのoptionタグを生成
  @param    表示文字列
  @param    アイテムデータ
  @param    クラスリスト
  @param    グループかどうか
  @param    最終更新日を表示するかどうか
  @return   Element
 */
function make_option(title, item, class_list, is_group_top, show_last_update) {
  const max_icon_num = 4; // icon数
  let elem = document.createElement("option");

  // text
  let disp_text = title;
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
  // elem.title = item.name;
  // if (!is_group_top && item.note !== '') {
  //   elem.title += '\n--------------\n' + item.note;
  // }
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
    let indent_count = max_icon_num - [...before_icon].length;    // max 4 indent
    elem.style.textIndent = indent_count + 'em';
  }

  // イベント
  elem.addEventListener('mousemove', mouseover_handler_option);
  elem.addEventListener('mouseleave', mouseleave_handler_option);

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
    if (item.url_app_type !== 'auto') {
      ret += '🌏';
    } else {
      ret += '🌏';
    }
  }
  if(item.mail !== '') {
    // ret += '📩';
    ret += '📥';
  }
  if(item.note !== '') {
    // ret += '🔖';
    ret += '📓';
  }
  if (item.priority) {
    ret += '🔴';
  }

  return ret;
}

/**
 * @summary アイテムの前に表示するアイコン取得
 * @param アイテム
 * @returns アイコン
 */
function get_after_icons(item) {
  let ret = '';

  // グループ
  if (item.type === 'group') {
    if (item.favorite) {
      ret = '❤️';
    }
  }

  // アイテム
  if (item.type === 'item') {
    if(item.is_wait) {
      ret = '💤';
    }

    if(ret !== '') {
      ret += ' ';
    }
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
      document.getElementById(elem_id).selectedIndex = i;   // アクティブ行の変更
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
 * @param フォーカス移動する/しない
 */
function set_select_ex(elem_id, ids, is_scroll, is_focus) {
  if (ids == null) {
    return;
  }

  let ret = set_select(elem_id, ids[0], is_scroll, is_focus);
  if (!ret && ids.length > 1) {
    ret = set_select(elem_id, ids[1], is_scroll, is_focus);
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
    // 未選択
    return;
  }

  // idから内部データの配列を取得し、ステータスを変更
  let item = getInternal(id);

  if(item.type === 'group') {
    // グループの場合は何もしない
    return;
  }

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
  // item.last_update = get_today_str(true, true, true);

  // リストへ反映
  refresh_screen('item');

  // 今日のリストのタスクを選択
  set_select(elem_id_list_today, item.id, false, false);
}

/**
 * 今日が期限のアイテムを今日のタスクへ移動
 */
function move_today_item_todays_expires() {
  pushHistory();
  let keys = get_internal_keys(null, null);
  for (let i = 0 ; i < keys.length; i++) {
    let items = getInternalGroup(keys[i]).sub_tasks;
    for (let j = 0 ; j < items.length; j++) {
      // 今日のタスク
      if (get_days_from_today(items[j].period) === 0) {
        // idから内部データの配列を取得し、ステータスを変更
        if (items[j].is_today >= 1) {
          // すでに今日のタスクの場合は何もしない
          continue;
        }
        // 今日のタスクを設定
        if (g_lock_todays_task) {
          items[j].is_today = 2;  // 今日の追加タスク
        } else {
          items[j].is_today = 1;
        }
      }
    }
  }
  // リストへ反映
  refresh_screen('item');
}

// 選択アイテムを今日のタスクから削除
function remove_today_item(elem_id) {
  let id = get_select_id(elem_id);
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
  // item.last_update = get_today_str(true, true, true);

  // リストへ反映
  refresh_screen('item');
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
  refresh_screen('item');
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
  refresh_screen('item');
}

// 全てのファーストタスクを解除
function clear_first_task() {
  pushHistory();

  // let keys = Object.keys(g_list_data);
  let keys = get_internal_keys(null, null);
  for (let i = 0 ; i < keys.length; i++) {
    // let items = getInternalGroup(keys[i]).sub_tasks;
    let items = getInternalGroup(keys[i]).sub_tasks;
    for (let j = 0 ; j < items.length; j++) {
      items[j].is_first = false;
    }
  }
  // リスト更新
  refresh_screen('item');
}

/**
 * 待ち状態を設定
 */
function toggle_wait(elem_id) {
  pushHistory();

  let id = get_selected_id(elem_id);
  if (id === null) {
    return;
  }

  let item = getInternal(id)
  if (item === null) {
    return;
  }
  
  item.is_wait = !item.is_wait;
  item.last_update = get_today_str(true, true, true);

  refresh_screen('item');
}

// 全ての追加タスクを解除
function release_todays_add_task() {
  pushHistory();

  // let keys = Object.keys(g_list_data);
  let keys = get_internal_keys(null, null);
  for (let i = 0 ; i < keys.length; i++) {
    // let items = getInternalGroup(keys[i]).sub_tasks;
    let items = getInternalGroup(keys[i]).sub_tasks;
    for (let j = 0 ; j < items.length; j++) {
      if (items[j].is_today >= 2)
      items[j].is_today = 1;
    }
  }
  // リスト更新
  refresh_screen('item');
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

  refresh_screen('item');
}

// 今日の必須タスクに設定
function set_todays_must_task(elem_id) {
  pushHistory();

  let id = get_selected_id(elem_id);
  if (id === null) {
    return;
  }

  let item = getInternal(id)
  if (item === null) {
    return;
  }
  
  if (item.is_today === 0) {
    item.is_today = 1;
  }
  item.is_todays_must = true;

  refresh_screen('item');
}

// 今日の必須タスクを解除
function clear_todays_must_task(elem_id) {
  pushHistory();

  let id = get_selected_id(elem_id);
  if (id === null) {
    return;
  }

  let item = getInternal(id)
  if (item === null) {
    return;
  }

  item.is_todays_must = false;

  refresh_screen('item');
}

// 今日のタスク & 必須タスクを解除
function clear_today_and_must_task(elem_id) {
  pushHistory();

  let id = get_selected_id(elem_id);
  if (id === null) {
    return;
  }

  let item = getInternal(id)
  if (item === null) {
    return;
  }
  
  item.is_todays_must = false;
  item.is_today = 0;
  item.is_first = false;  // 優先タスクフラグ解除

  refresh_screen('item');
}

/**
 * 全リストの済みアイテム表示/非表示を切り替え
 */
function toggle_show_stock_done() {
  g_is_show_stock_done = !g_is_show_stock_done;
  update_stock_list(g_stock_filter);
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
  g_lock_todays_task = !g_lock_todays_task;
}

/**
 * 自動保存 切り替え
 */
function toggle_auto_save() {
  set_auto_save_status(!get_auto_save_status())
}

/**
 * @summary 選択アイテムを処理済みへ
 */
function done_item(elem_id) {
  let id = null;
  if (typeof elem_id === "object") {
    // クリックイベントから飛んできた
    id = parseInt(elem_id.target.dataset.id);
  } else {
    id = get_select_id(elem_id);
  }
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
  refresh_screen('item');
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
    refresh_screen('item');
  }
}

/**
 * @summary 今日の処理済みを今日から外す
 */
function release_todays_done() {
  // 履歴保存
  pushHistory();

  // let keys = Object.keys(g_list_data);
  let keys = get_internal_keys(null, null);
  for (let i = 0 ; i < keys.length; i++) {
    // items = getInternalGroup(keys[i]).sub_tasks;
    let items = getInternalGroup(keys[i]).sub_tasks;
    for (let j = 0 ; j < items.length; j++) {
      if (items[j].is_today > 0 && items[j].status == 'done') {
        items[j].is_today = 0;
      }
    }
  }
  // リストへ反映
  refresh_screen('item');
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
    refresh_screen('item');
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
  let keys = get_internal_keys(null, null);
  for (let i = 0 ; i < keys.length; i++) {
    // items = getInternalGroup(keys[i]).sub_tasks;
    let items = getInternalGroup(keys[i]).sub_tasks;
    for (let j = 0 ; j < items.length; j++) {
      if (items[j].is_tomorrow) {
        items[j].is_tomorrow = false;
      }
    }
  }
  // リストへ反映
  refresh_screen('item');
}

// アイテム追加
function add_items() {
  pushHistory();
 
  let task_names = document.getElementById("add_item_text").value;
  let lines = task_names.split('\n');
 
  let selected_id = get_selected_id(elem_id_list_stock);
  addIntarnalDataEx(selected_id, lines);
 
  // リストを更新
  refresh_screen('item');
 
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
  let is_group_ = is_group(selected_id);
  removeIntarnalData(selected_id, false);

  // リストを更新
  refresh_screen(is_group_ ? 'all' : 'item');
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
  refresh_screen('item');
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
    let url = get_app_url(item.url, item.url_app_type);
    open_url(url);
  }
}

// 戻す
function undo_item() {
  let data = popHistory();
  if (data !== null) {
    // g_list_data = data;
    setInternalRawData(data);
    scheduleAutosave();
  }

  // リストを更新
  refresh_screen('item');
}

/**
 * @summary 画面スクロールロック切り替え
 */
function toggle_scroll_lock() {
  let body = document.getElementsByTagName('body');
  if (body[0].classList.contains('no_scroll')) {
    body[0].classList.remove('no_scroll');
  } else {
    body[0].classList.add('no_scroll');
  }
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







/**
 * 内部データ保存(localStorage)
 * @param 確認メッセージ表示有無(true:表示 / false:表示しない)
 */
function save_data(show_confirm = true) {
  // let keys = Object.keys(g_list_data);
  let keys = get_internal_keys(null, null);
  if (keys.length <= 0) {
    return;
  }

  let yesno = true;
  if (show_confirm) {
    yesno = confirm('現在の状態を保存しますか？');
  }
  if (yesno) {
    let list_data_str = JSON.stringify(getInternalRawData());
    saveStorage("tast_manager_list_data", list_data_str);
  
    if (show_confirm) {
      alert('現在の状態を保存しました。');
    }
  }
}

/**
 * オートセーブを遅延実行でスケジュールする。
 */
function scheduleAutosave() {
  console.log("Set Schedule AutoSave");
  clearTimeout(g_autosave_timer);
  g_autosave_timer = setTimeout(() => {
    console.log("Fire AutoSave");
    save_data(false);
  }, AUTOSAVE_DELAY);
}


/**
 * 内部データ読み込み(localStorage)
 * @param 確認メッセージ表示有無(true:表示 / false:表示しない)
 */
function load_data(show_confirm = true) {
  let yesno = true;
  if (show_confirm) {
    yesno = confirm('現在の状態を破棄して読み込みますか？');
  }

  if (yesno) {
    pushHistory();

    // 内部データへ上書き
    let list_data_str = loadStorage("tast_manager_list_data");
    // g_list_data = JSON.parse(list_data_str);
    setInternalRawData(JSON.parse(list_data_str));

    // 内部データコンバート(v2以前 to v3)
    let new_internal = convert_internal_data_v2_to_v3(g_list_data);
    if (new_internal !== null) {
      setInternalRawData(new_internal);
      // let json_text = JSON.stringify(new_internal, null , "  ");
      // navigator.clipboard.writeText(json_text);
    }

    // 内部データの属性を補完
    adjust_attr_internal_data();
  
    // リストを更新
    refresh_screen('all');
  
    // 最新のIDを再計算
    update_last_id();
  }
}


// Allリストをクリップボードにコピー
function copy_stock_list() {
  let copy_text = get_all_text();
  navigator.clipboard.writeText(copy_text);

  copy_animation2(this);
}

// 今日のタスクリストをクリップボードにコピー
function copy_todays_list() {
  let mode = 2;
  if (g_is_show_todays_done) {
    mode = 0;
  }
  let copy_text = get_todays_list_text(mode);
  navigator.clipboard.writeText(copy_text);

  copy_animation2(this);
}

// 今日のmustタスクリストをクリップボードにコピー
function copy_todays_must_list() {
  let mode = 4;
  if (g_is_show_todays_done) {
    mode = 3;
  }
  let copy_text = get_todays_list_text(mode);
  navigator.clipboard.writeText(copy_text);

  copy_animation2(this);
}

// 済みリストをクリップボードにコピー
function copy_todays_done_list() {
  let copy_text = get_todays_list_text(1);
  navigator.clipboard.writeText(copy_text);

  copy_animation2(this);
}

// 今日更新のあったタスクをクリップボードにコピー
function copy_todays_updates_list() {
  let copy_text = get_todays_updates_text(true);
  navigator.clipboard.writeText(copy_text);

  copy_animation2(this);
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

  copy_animation2(this);
}

// パスワード生成&コピー
function copy_generate_password() {
  let gen_pass = generateSecurePassword();
  navigator.clipboard.writeText(gen_pass);

  copy_animation2(this);
}

/**
 * @summary 全てのタスクをエクセルへ貼り付け可能なBLOB形式でコピー
 */
function copy_all_task_blob() {
  let html = get_html_table(true, true);
  // console.log(html);
  // document.getElementById('table_test').innerHTML = html; // test
  const item = new ClipboardItem({
    'text/html': new Blob([html], { type: 'text/html' })
  });
  navigator.clipboard.write([item]);

  copy_animation2(this);
}

/**
 * @summary HTMLテーブル取得(全てのタスク)
 * @param 非タスクの扱い(true:含めない / false:含める)
 * @returns HTMLテーブル
 */
function get_html_table(ignre_non_task, ignre_done_task) {
  let html = '';
  let keys = get_internal_keys(null, 'string');

  html += '<table style="border-collapse: collapse; border: 1px solid;" >';
  html += '<thead>\n';
  html += '<tr>\n';
  html += '<th scope="col">PJ: タスク</th>\n'
  html += '<th scope="col">サブタスク</th>\n'
  html += '<th scope="col">期限</th>\n'
  html += '<th scope="col">リンク等</th>\n'
  html += '<th scope="col">進捗等</th>\n'
  html += '</tr>\n';
  html += '</thead>\n';

  html += '<tbody>';
  html += '\n';

  // 現在日時挿入
  let html_group = '';
  html_group += '<tr>\n';
  html_group += `<td>最終更新日時</td>\n`;
  html_group += `<td>${get_today_str(true, true, true)}</td>\n`;
  html_group += `<td></td>\n`;
  html_group += `<td></td>\n`;
  html_group += `<td></td>\n`;
  html_group += '</tr>\n';
  html += html_group;

  for (let i = 0; i < keys.length; i++) {
    // タスク情報
    let group = getInternalGroup(keys[i]);
    if (group.ignore_table_copy) {
      continue;
    }

    let html_group = '';
    html_group += '<tr>\n';
    html_group += `<td>${group.name}</td>\n`;
    html_group += `<td></td>\n`;
    html_group += `<td>${group.period}</td>\n`;
    html_group += `<td></td>\n`;
    html_group += `<td></td>\n`;
    html_group += '</tr>\n';
    
    // サブタスク情報
    let html_items = '';
    let items = group.sub_tasks;
    for (let j = 0; j < items.length; j++) {
      let item = items[j];
      let style = '';
      
      // 非タスクはスキップ
      if (ignre_non_task === true && item.is_non_task === true) {
        continue;
      }
      // 済みタスクをスキップするかどうか
      if (ignre_done_task === true && item.status === 'done') {
        continue;
      }

      if (item.status === 'done') {
        style = 'style="font-size: 80%; color:rgb(182, 182, 182);"';
      }
      let td_link_content = '';
      if (item.url !== '') {
        td_link_content = `<a href="${item.url}">リンク</a>`;
      }
      html_items += '<tr>\n';
      html_items += `<td></td>\n`;
      html_items += `<td ${style}>${item.name}</td>\n`;
      html_items += `<td ${style}>${item.period}</td>\n`;
      html_items += `<td ${style}>${td_link_content}</td>\n`;
      html_items += `<td ${style}>${item.note.replaceAll('\n','<br>')}</td>\n`;
      html_items += '</tr>\n';
    }
    // サブタスクが1つでもあれば追加
    if (html_items !=='') {
      html += html_group + html_items;
    }
  }
  html += '</tbody>';
  html += '</table>';
  return html;
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
    show_edit_popup_single(selected_ids[0], {parent_elem_id: elem_id});
  } else if (selected_ids.length > 1) {
    // 複数件の編集
    show_edit_popup_multi(elem_id, selected_ids);
  }
}


/**
 * @summary 編集ポップアップ表示(アイテム指定)
 * @param アイテム or グループ情報
 * @param 拡張情報 {parent_elem_id, top, left, group_id}
 */
function show_edit_popup_single_ex(item_or_group, option) {
  if (g_show_popup) {
    return;
  }

  let elem = document.getElementById("popup_edit_base");
  let item = item_or_group;

  if (item.type === "group") {
    // 表示
    // Tコピー除外
    document.getElementById("popup_edit_ignore_tcopy").checked = item.ignore_table_copy;
    document.getElementById("popup_edit_ignore_tcopy_label").style.display = "block";
    // お気に入り
    document.getElementById("popup_edit_favorite").checked = item.favorite;
    document.getElementById("popup_edit_favorite_label").style.display = "block";

    // 非表示
    // 所属グループ
    document.getElementById("popup_edit_group_list").style.display = "none";
    // URL
    document.getElementById("popup_edit_url").style.display = "none";
    document.getElementById("popup_button_copy_url").style.display = "none";
    document.getElementById("popup_edit_url_app_type").style.display = "none";
    // メール
    document.getElementById("popup_edit_mail").style.display = "none";
    // メモ
    document.getElementById("popup_edit_note").style.display = "none";
    document.getElementById("popup_edit_note_add_btn").style.display = "none";
    // 済み
    document.getElementById("popup_edit_done_label").style.display = "none";
    // 待ち
    document.getElementById("popup_edit_wait_label").style.display = "none";
    // 毎日
    document.getElementById("popup_edit_everyday_label").style.display = "none";
    // 優先
    document.getElementById("popup_edit_priority_label").style.display = "none";
  }

  if (item.type === "item") {
    // // 所属グループ
    if (option.group_id !== undefined) {
      set_group_select_ex("popup_edit_group_list", false, option.group_id);
    } else {
      set_group_select("popup_edit_group_list", false, item.id);
    }

    document.getElementById("popup_edit_group_list").style.display = "block";
    // URL
    document.getElementById("popup_edit_url").value = item.url;
    document.getElementById("popup_button_copy_url").style.display = "block";
    document.getElementById("popup_edit_url").style.display = "block";
    // URLアプリ種類
    document.getElementById("popup_edit_form").elements['url_app_type'].value = item.url_app_type;
    document.getElementById("popup_edit_url_app_type").style.display = "block";
    // メール
    document.getElementById("popup_edit_mail").value = item.mail;
    document.getElementById("popup_edit_mail").style.display = "block";
    // メモ
    document.getElementById("popup_edit_note").value = item.note;
    document.getElementById("popup_edit_note").style.display = "block";
    document.getElementById("popup_edit_note_add_btn").style.display = "block";
    // 済み
    document.getElementById("popup_edit_done").checked = (item.status === 'done');
    document.getElementById("popup_edit_done_label").style.display = "block";
    // 待ち
    document.getElementById("popup_edit_wait").checked = item.is_wait;
    document.getElementById("popup_edit_wait_label").style.display = "block";
    // 毎日
    document.getElementById("popup_edit_everyday").checked = item.is_everyday;
    document.getElementById("popup_edit_everyday_label").style.display = "block";
    // 優先
    document.getElementById("popup_edit_priority").checked = item.priority;
    document.getElementById("popup_edit_priority_label").style.display = "block";
    // 期限(終了)
    document.getElementById("popup_edit_date_end").value = item.period_end.replaceAll('/','-');

    // Tコピー除外 (非表示)
    document.getElementById("popup_edit_ignore_tcopy_label").style.display = "none";
    // お気に入り (非表示)
    document.getElementById("popup_edit_favorite_label").style.display = "none";
  }

  // タスク名
  document.getElementById("popup_edit_text").value = item.name.trim();

  // 期限
  document.getElementById("popup_edit_date").value = item.period.replaceAll('/','-');

  // 作成日
  document.getElementById("popup_edit_created").value = item.created;

  // ID 
  document.getElementById("popup_edit_id").value = item.id;
  document.getElementById("popup_edit_hidden_id").value = item.id;

  // 親エレメントID(submit後のフォーカス移動用)
  document.getElementById("popup_edit_hidden_parent_elem_id").value = "";
  if (option.parent_elem_id !== undefined) {
    document.getElementById("popup_edit_hidden_parent_elem_id").value = option.parent_elem_id;
  }

  // 表示(非表示状態だと↓のclientHeightが取れない為、ここで表示)
  // elem.style.display = "block";

  // ポップアップの左上をリストの選択位置へ移動
  let top, left = 0;
  if (option.parent_elem_id !== undefined) {
    let selected_elems = get_selected_option(option.parent_elem_id);
    if (selected_elems.length > 0) {
      let rect = selected_elems[0].getBoundingClientRect();
      top = rect.top;
      left = rect.right;
    }
  } else if (option.top !== undefined && option.left !== undefined) {
      top = option.top;
      left = option.left;
  }
  // 表示位置調整
  let pos = adjust_element_position('popup_edit_base', top, left);
  elem.style.top = pos.top;
  elem.style.left = pos.left;

  // 表示
  document.getElementById("popup_bg_cover").style.display = 'block';
  elem.style.visibility = "visible";
  elem.style.opacity= "1";

  // フォーカス移動
  document.getElementById("popup_edit_text").focus();

  g_show_popup = true;
}

/**
 * @summary 編集ポップアップ表示
 * @param 編集対象ID
 * @param 親情報(ポップアップ位置に利用) {parent_elem_id, top, left}
 */
function show_edit_popup_single(selected_id, option) {
  show_edit_popup_single_ex(getInternal(selected_id), option);
}

/**
 * @summary ポップアップなどの表示位置を調整(画面外に出ないように調整)
 * @param 要素ID
 * @param 現在のTop
 * @param 現在のLeft 
 * @param 最小Top (nullは指定なし)
 * @param 最小Left (nullは指定なし)
 * @returns 補正後の位置 { top:x, left:x }
 */
function adjust_element_position(elem_id, top, left, minTop=null, minLeft=null) {
  let ret_top = top;
  let ret_left = left;

  // 全体が見えるようにTOPを調整
  let top_most_bottom = window.innerHeight - document.getElementById(elem_id).clientHeight;
  if (ret_top > top_most_bottom) {
    ret_top = top_most_bottom;
  }
  // 画面上部を飛び出している場合は、画面上部に合わせる。
  if (ret_top <= 0) {
    ret_top = 0;
  }
  if (minTop !== null) {
    if (ret_top > minTop) { 
      ret_top = minTop;
    }
  }

  // 全体が見えるようにLEFTを調整
  let left_most_left = window.innerWidth - document.getElementById(elem_id).clientWidth;
  if (ret_left > left_most_left) {
    ret_left = left_most_left;
  }
  if (minLeft !== null) {
    if (ret_left > minLeft) { 
      ret_left = minLeft;
    }
  }

  return {top: ret_top, left: ret_left};
}


/**
 * @summary 日付文字列から曜日を取得
 * @param 日付文字列(YYYY-MM-DD)
 */
function getWeekDayStr(date_str) {
  // 曜日リスト（日曜始まり）
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  if (!date_str) {
    return "(ー)";
  }
  const d = new Date(date_str);
  const w = weekdays[d.getDay()];
  return `(${w})`;
}

/**
 * @summary ポップアップの期限をjsで変更した場合のイベントフック
 */
(function (el) {
  hookValueSetterOnce(el);
})(document.getElementById("popup_edit_date"));
(function (el) {
  hookValueSetterOnce(el);
})(document.getElementById("popup_edit_date_end"));

function hookValueSetterOnce(el) {
  try {
    const proto = Object.getPrototypeOf(el);
    const desc  = Object.getOwnPropertyDescriptor(proto, "value");
    if (desc && typeof desc.set === "function" && typeof desc.get === "function") {
      Object.defineProperty(el, "value", {
        configurable: true,
        enumerable:   desc.enumerable,
        get()  { return desc.get.call(el); },
        set(v) { desc.set.call(el, v); change_handler_period_refresh_weekday_for_hook(el); }
      });
    }
  } catch (e) {
  }
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
  // elem.style.display = "block";
  document.getElementById("popup_bg_cover").style.display = 'block';
  elem.style.visibility = "visible";
  elem.style.opacity= "1";

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
  let new_period_end = document.getElementById("popup_edit_date_end").value;
  let new_url = document.getElementById("popup_edit_url").value;
  let new_url_app_type = document.getElementById("popup_edit_form").elements['url_app_type'].value;
  let new_mail = document.getElementById("popup_edit_mail").value;
  let new_note = document.getElementById("popup_edit_note").value;
  let new_done = document.getElementById("popup_edit_done").checked;
  let new_wait = document.getElementById("popup_edit_wait").checked;
  let new_everyday = document.getElementById("popup_edit_everyday").checked;
  let new_priority = document.getElementById("popup_edit_priority").checked;
  let new_ignore_table_copy = document.getElementById("popup_edit_ignore_tcopy").checked;
  let new_favorite = document.getElementById("popup_edit_favorite").checked;
  let id_hidden_str = document.getElementById("popup_edit_hidden_id").value;
  let parent_elem_id = document.getElementById("popup_edit_hidden_parent_elem_id").value;
  let id_edit_str = document.getElementById("popup_edit_id").value;
  let id_hidden = parseInt(id_hidden_str);
  let id_edit = parseInt(id_edit_str);

  new_period = new_period.replaceAll('-', '/');
  new_period_end = new_period_end.replaceAll('-', '/');
  new_name = new_name.trim();

  pushHistory();

  // 内部データ取得
  let item = getInternal(id_hidden);
  if (item === null) {
    // 新規作成
    item = makeInternalItem_ex("", id_hidden);
  }

  // 最終更新日更新判定
  let update_update_date = (
    item.name !== new_name || 
    new_url !== item.url ||
    new_mail !== item.mail ||
    item.note !== new_note || 
    item.is_wait !== new_wait ||
    item.is_everyday !== new_everyday ||
    (new_done && item.status !== 'done') ||
    (!new_done && item.status !== 'yet')
  )

  // アイテムバックアップ（更新履歴取得用）
  let item_bak = JSON.parse(JSON.stringify(item));

  // アイテム更新
  item.name = new_name;
  item.period = new_period;
  item.period_end = new_period_end;

  if (item.type === 'group') {
    // Tコピー除外
    item.ignore_table_copy = new_ignore_table_copy;
    // お気に入り
    item.favorite = new_favorite;
  }

  if (item.type === 'item') {
    // 入力値を適用
    item.name = new_name.trim();
    item.url = new_url;
    item.url_app_type = new_url_app_type;
    item.mail = new_mail;
    item.note = new_note;
    item.is_wait = new_wait;
    item.is_everyday = new_everyday;
    item.priority = new_priority;
    if (new_done) {
      item.status = 'done';
    } else {
      item.status = 'yet';
    }

    // 所属グループ
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

  // 最終更新日更新判定
  if (update_update_date) {
    // 最終更新日更新
    item.last_update = get_today_str(true, true, true);
  }

  // 更新履歴登録
  registerModifyHistory(item_bak, item);

  // ポップアップ消去
  close_edit_popup();
  // リスト更新 / TODO:期限変更判断追加
  refresh_screen(item.type === 'group' ? 'all' : 'item');

  // ポップアップ起動元リストへフォーカス移動
  if (parent_elem_id !== "") {
    document.getElementById(parent_elem_id).focus();
  }
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
  // リスト更新 / TODO:期限変更判断追加
  refresh_screen('all');

}

/**
 * 編集ポップアップを閉じる
 */
function close_edit_popup() {
  let elem = document.getElementById("popup_edit_base");
  // elem.style.display = "none";
  elem.style.visibility = "hidden";
  elem.style.opacity= "0";
  document.getElementById("popup_bg_cover").style.display = 'none';

  // // フォーカスをリストへ移動
  // if (g_show_popup_list !== null) {
  //   document.getElementById(g_show_popup_list).focus();
  // }

  // ポップアップ起動元リストへフォーカス移動
  let parent_elem_id = document.getElementById("popup_edit_hidden_parent_elem_id").value;
  if (parent_elem_id !== "") {
    document.getElementById(parent_elem_id).focus();
  }

  g_show_popup = false;
  // g_show_popup_list = null;
}

/**
 * 編集ポップアップを閉じる(Multi)
 */
function close_edit_multi_popup() {
  let elem = document.getElementById("popup_edit_multi_base");
  // elem.style.display = "none";
  elem.style.visibility = "hidden";
  elem.style.opacity= "0";
  document.getElementById("popup_bg_cover").style.display = 'none';

  // フォーカスをリストへ移動
  if (g_show_popup_list !== null) {
   document.getElementById(g_show_popup_list).focus();
  }

  g_show_popup = false;
  g_show_popup_list = null;
}



/**
 * @summary タイムライン: グループデータ作成
 * @param true:1つのグループのみ作成 / false:該当グループ毎に作成
 * @returns タイムライングループデータ(配列)
 */
function make_timeline_groups(is_one_group) {
  let group_id_default = 'task';
  let groups = [];
  if (is_one_group) {
    // 1つのグループに全アイテムをまとめる
    groups.push( {id: group_id_default, content: 'タスク', title: 'タスク' } );
  } else {
    // グループ毎にアイテムを分ける
    let keys = get_internal_keys(g_stock_filter, 'string');
    for (let i = 0 ; i < keys.length; i++) {
      let group = getInternalGroup(keys[i]);
      // アイテムデータを追加
      for (let j = 0; j < group.sub_tasks.length; j++) {
        let item = group.sub_tasks[j];
        // 期限設定があれば追加
        if (item.period !== undefined && item.period !== '') {
          groups.push( {id: group.id, content: group.name, title: group.name } );
          break;
        }
      }
    }
  }
  return groups;
}

/**
 * @summary タイムライン: アイテムデータ作成
 * @param true:1つのグループのみ作成 / false:該当グループ毎に作成
 * @returns タイムラインアイテムデータ(配列)
 */
function make_timeline_items(is_one_group)
{
  let ret = [];
  let group_id_default = 'task';

  let keys = get_internal_keys(g_stock_filter, null);
  for (let i = 0 ; i < keys.length; i++) {
    let group = getInternalGroup(keys[i]);

    let date_head = '';   // 最も早い日時
    let date_tail = '';   // 最も遅い日時

    // アイテムデータを追加
    for (let j = 0; j < group.sub_tasks.length; j++) {
      let item = group.sub_tasks[j];
      // 期限設定なし
      if (item.period === undefined || item.period === '') {
        continue;
      }
      // 表示条件確認
      if (!is_show_item_stock_list(item, g_stock_filter)) {
        continue;
      }
      // フィルタ条件のマッチを確認
      if (item.name.toLowerCase().indexOf(g_stock_filter.item_name.toLowerCase()) === -1) {
        continue;
      }

      // 日時
      let period = item.period + ' 12:00';
      // クラス
      let className = 'timeline_item_item';
      if (item.status === 'done') {
        className = 'timeline_item_item_done';
      } else if (item.priority) {
        className = 'timeline_item_item_priority';
      } else if (item.is_wait) {
        className = 'timeline_item_item_wait';
      }
      // マウスオーバー時に表示するテキスト
      let title = new Date(item.period).getMonth()+1 + '/' + new Date(item.period).getDate();
      title += ' ' + item.name;
      if (item.note !== '') {
        title += '<br>---------------<br>' + item.note.replaceAll('\n', '<br>');
      }
      // 表示テキスト
      let group_name = '<div>(' + group.name.substring(0,10) + '...) <br></div>';
      let name = group_name + item.name;
      if (item.is_wait) {
        name += get_after_icons(item);
      }
      // グループID
      let timeline_group_id = group_id_default;
      if (!is_one_group) {
        timeline_group_id = group.id;
      }
      // 日時
      if (item.period === item.period_end || item.period_end === '') {
        // 開始日のみ
        ret.push( { group: timeline_group_id, id: item.id, content: name, title: title, start: period, type: 'point', className: className } );
      } else {
        // 終了日あり
        let period_end = item.period_end + ' 12:00';
        ret.push( { group: timeline_group_id, id: item.id, content: name, title: title, start: period, end: period_end, type: 'range', className: className } );
      }

      // グループ内の最初と最後の日付を確保
      // 最初の日付
      if (date_head === '') {
        date_head = item.period;
      } else {
        if (new Date(item.period) < new Date(date_head)) {
          date_head = item.period;
        }
      }
      // 最後の日付
      if (date_tail === '') {
        date_tail = item.period_end !== '' ? item.period_end : item.period;
      } else {
        let temp_date_tail = item.period_end !== '' ? item.period_end : item.period;
        if (new Date(temp_date_tail) > new Date(date_tail)) {
          date_tail = temp_date_tail;
        }
      }
    }
    // console.log("date_head, date_tail");
    // console.log(date_head, date_tail);

    // グループデータを追加(ガントチャートの親っぽいオブジェクト)
    if (date_head !== '' && date_tail !== '' && date_head !== date_tail) {
      // 表示テキスト
      let name = keys[i];
      if (group.name !== undefined) {
        name = group.name;
      }
      // 開始日/終了日
      let start = date_head + ' 11:50';   // 最上部に表示する為、最速の日時にする
      let end = date_tail + ' 12:00';
      // マウスオーバー時に表示するテキスト
      let period_disp = `${new Date(date_head).getMonth()+1}/${new Date(date_head).getDate()}〜${new Date(date_tail).getMonth()+1}/${new Date(date_tail).getDate()} ${name}`;
      // グループID
      let timeline_group_id = group_id_default;
      if (!is_one_group) {
        timeline_group_id = group.id;
      }
      ret.push( { group: timeline_group_id, id: group.id, content: name, title: period_disp, start: start, end: end, type: 'range', className: 'timeline_item_group', editable: false } );
    }
  }
  return ret;
}

/**
 * タイムライン表示
 * @param 更新モード(all:グループ/アイテムを更新, item:アイテムのみ(グループは更新しない))
 */
function show_timeline(mode = 'all')
{
  groups = [];
  items = [];

  // DOM element where the Timeline will be attached
  const container = document.getElementById('visualization');

  // make group/item
  // let is_one_group = (g_stock_filter_id === 0);
  groups = groups.concat(make_timeline_groups(false));
  items = items.concat(make_timeline_items(false));

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
    editable: {
      add: false,           // ダブルクリックでアイテム追加
      updateTime: true,     // 水平方向のアイテム移動
      updateGroup: false,   // 他のグループへのアイテム移動
      remove: false,        // deleteボタンによるアイテム削除
      overrideItems: false  // item.editableの上書きの許可
    },
    onMove: function (target, callback) { // アイテム移動後のコールバック
      console.log(target.id, target.group, target.start);
      let item = getInternal(target.id);
      if (item !== null) {
        pushHistory();
        item.period = get_date_str(target.start, true, false, true, true);
        if (target.end !== undefined) {
          item.period_end = get_date_str(target.end, true, false, true, true);
        }
      }
      callback(target);

      // リスト更新
      refresh_screen('item');

      // タイムライン更新(遅延更新)
      setTimeout(() => {
        show_timeline('item');
      }, REFRESH_TIMELINE_DELAY);
    }
  };

  // Create a Timeline
  if (g_timeline !== null) {
    let elem = document.getElementById('visualization');
    // console.log("(visualization) elem.scrollTop:", elem.scrollTop);

    // g_timeline.destroy();
    // g_timeline.setData( {groups: groups, items: items });
    // g_timeline.redraw();

    if (mode === 'all') {
      g_timeline.setData( {groups: groups, items: items });
    } else if (mode === 'item') {
      g_timeline.setItems(items);
    }

    // 更新前に選択していたアイテムを再選択
    if (g_timeline_selected_itemid !== null) {
      g_timeline.setSelection(g_timeline_selected_itemid);
    }
  }
  else {
    g_timeline = new vis.Timeline(container, items, groups, options);

    // クリックイベント登録
    g_timeline.on('select', function (properties) {
      // 2回イベント発生するため、抑制 (クリックすると press, tap の2回呼ばれる)
      console.log(properties.event.type);
      if (properties.event.type !== 'tap') {
        return;
      }

      // フィルタ解除
      // set_list_filter(elem_id_list_stock, 0);
      
      // クリックしたアイテムをリスト中で選択
      if (properties.items.length > 0) {
        set_select(elem_id_list_stock, properties.items[0], true, true);
        // 選択アイテムを記憶
        g_timeline_selected_itemid = properties.items[0]
      } else {
        // set_select(elem_id_list_stock, -1, false, false); // 選択解除
        // 選択アイテムクリア
        g_timeline_selected_itemid = null;
      }
    });
    // ダブルクリックイベント登録
    g_timeline.on('doubleClick', function (properties) {
      // console.log("timeline dblclick" , properties.item);
      if (properties.what === 'background' && properties.item === null) {
        // 空欄をクリック. アイテム作成
        let item = makeInternalItem_ex("", genItemID());
        item.period = get_date_str(properties.time, true, false, true, true);
        show_edit_popup_single_ex(item, {top: properties.event.clientY, left: properties.event.clientX, group_id: properties.group});
      } else if (properties.what === 'group-label' && properties.group !== undefined) {
        // グループ名をダブルクリック. グループ名でフィルタ
        let group = getInternal(properties.group);
        g_stock_filter = {group_name: '^' + RegExp.escape(group.name) + '$', item_name: ''};
        update_stock_list(g_stock_filter);
        show_timeline('all');
      } else {
        // アイテム編集
        // show_edit_popup_single(properties.item, {top: properties.event.clientY, left: properties.event.clientX});
        show_edit_popup_single(properties.item, {top: properties.event.center.y+20, left: properties.event.center.x});
      }
    });
  }
}

/**
* @summary 出社/在宅状況を表示
*/
function show_remote_status() {
  let html = '';
  for (let i = 0; i < members_status.length; i++) {
    for (let k = 0; k < members.length; k++) {
      let cls = "status_office";
      let badge = "";
      const s = members_status[i][k];
 
      if (s === "リモート") {
        cls = "status_remote";
      } else if (s === "出張") {
        cls = "status_out";
      } else if (s === "名古屋WeWork") {
        cls = "status_wework";
      } else if (s.includes("休暇")) {
        cls = "status_dayoff";
        if (s.includes("AM")) badge = `<span class="dayoff_badge">AM</span>`;
        if (s.includes("PM")) badge = `<span class="dayoff_badge">PM</span>`;
      }
      html += `<span class="status_box ${cls}">${members[k]}${badge}</span>`;
    }
    html += "<br>";
  }
  document.getElementById("member_status_area").innerHTML = html;
}








//---------------------------------------
// Function (Common)
//---------------------------------------

//localStorageへ値を保存
function saveStorage(name, val)
{
  try {
    localStorage.setItem(name, val);
  } catch (e) {
    alert("データの保存に失敗しました。容量の上限に達した可能性があります。");
    console.log(e);
  }
}

//localStorageから値を取得
function loadStorage(name)
{
  try {
    return localStorage.getItem(name);
  } catch (e) {
    alert("データの取得に失敗しました。");
    console.log(e);
  }
  return null;
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
 * @summary コピーアニメーション(copyの文字がふわっと浮き上がる)
 * @param イベント情報
 */
function copy_animation2(elem) {
  // ボタン中央位置を計算
  const btn = document.getElementById(elem.id);
  const rect = btn.getBoundingClientRect();
  const x = rect.left + rect.width / 2 + window.scrollX;
  const y = rect.top  + rect.height / 2 + window.scrollY - 10;

  const steam = document.createElement('span');
  steam.className = 'copy-steam';
  steam.textContent = 'Copy!';
  steam.style.left = `${x}px`;
  steam.style.top  = `${y}px`;
  document.body.appendChild(steam);
  steam.addEventListener('animationend', () => steam.remove(), { once: true });
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
function compareFn_period(data1, data2) {
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
* @summary 内部データソート 比較関数
* @param 比較対象データ1
* @param 比較対象データ2
* @returns 結果(0:変更なし / <0:aをbの前に並べる / >0:aをbの後に並べる )
*/
function compareFn_string(data1, data2) {
  let name1 = data1.name;
  let name2 = data2.name;
 
  if (name1 < name2) {
   return -1;
  } else if (name1 > name2) {
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
 * @summary URLを開く(別タブ)
 * @param URL
 */
function open_url(url) {
  // console.log('open url: ' + url);
  window.open(url, '_blank');
}

/**
 * @summary URL取得(オプションによりMSアプリ起動のURIスキームを考慮)
 * @param URL
 * @param アプリ種類(auto, excel, powerpoint, word)
 * @returns URL
 */
function get_app_url(url, app_type) {
  let uri_scheme = get_app_uri_scheme(url, app_type);
  if (uri_scheme === 'msteams://') {
    return url.replace('https://', uri_scheme);
  }
  return uri_scheme + url;
}

/**
 * @summary MSアプリ起動のURIスキーム取得
 * @param URL
 * @param アプリ種類(auto, excel, powerpoint, word)
 * @returns URIスキーム
 */
function get_app_uri_scheme(url, app_type) {
  // auto
  if (app_type === 'auto') {
    if (new RegExp('\.xlsx[\?|&]').test(url)) {
      return 'ms-excel:ofe|u|';
    }
    if (new RegExp('\.pptx[\?|&]').test(url)) {
      return 'ms-powerpoint:ofe|u|';
    }
    if (new RegExp('\.docx[\?|&]').test(url)) {
      return 'ms-word:ofe|u|';
    }
    if (new RegExp('\.teams\.microsoft\.com\.').test(url)) {
      return 'msteams://';
    }
  }

  // アプリ指定
  if (app_type === 'web') {
    return '';
  }
  if (app_type === 'excel') {
    return 'ms-excel:ofe|u|';
  }
  if (app_type === 'powerpoint') {
    return 'ms-powerpoint:ofe|u|';
  }
  if (app_type === 'word') {
    return 'ms-word:ofe|u|';
  }

  // if (url.indexOf('.xlsx?') > 0) {
  //   return 'ms-excel:ofe|u|:';
  // }
  // if (url.indexOf('.pptx?') > 0) {
  //   return 'ms-powerpoint:ofe|u|:';
  // }
  // if (url.indexOf('.docx?') > 0) {
  //   return 'ms-word:ofe|u|:';
  // }
  return '';
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
    return Math.floor(diff_days) * dist;
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
  let days = get_days(d, d_now, false);
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

/**
 * @summary 文字列から日付を1つ抽出して "yyyy/MM/dd" で返す
 *  - 年なし（M/D or M月D日）は「今年」を補完
 *  - 全角→半角（数字・スラッシュ・ハイフン）へ正規化
 *  - 妥当なカレンダ日付のみ採用（存在しない日付は弾く）
 * 見つからなければ null を返す
 */
function extractDateYMD(input) {
  if (typeof input !== "string") return null;

  // 1) 全角 → 半角（数字・スラッシュ・ハイフン・ドット）
  const zenkakuToHankaku = (s) =>
    s.replace(/[！-～]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
     .replace(/　/g, " "); // 全角スペース→半角
  let s = zenkakuToHankaku(input);

  // 2) 日本語の年月日や区切りを統一
  //    "2025年9月7日" → "2025/9/7"
  //    区切りは最終的に "/" に寄せる
  s = s
    .replace(/[.]/g, "/")
    .replace(/-/g, "/")
    .replace(/年/g, "/")
    .replace(/月/g, "/")
    .replace(/日/g, "/")
    .replace(/\/+/g, "/"); // スラッシュ連続を1個に

  // 前後のノイズを減らす（カンマや多空白）
  s = s.replace(/[,，]/g, " ").trim();

  // 3) 正規表現で候補を探す（優先: 年あり → 年なし）
  // 年あり: 4桁年 / M / D
  const yearFull = /(\d{4})\/(\d{1,2})\/(\d{1,2})/;
  const m = s.match(yearFull);
  if (m) {
    const y = parseInt(m[1], 10);
    const mo = parseInt(m[2], 10);
    const d = parseInt(m[3], 10);
    if (isValidYMD(y, mo, d)) return formatYMD(y, mo, d);
  }

  // 年なし: M / D（今年を補完）
  const mdOnly = /(^|[^\d])(\d{1,2})\/(\d{1,2})(?!\d)/;
  const m2 = s.match(mdOnly);
  if (m2) {
    const now = new Date();
    const y = now.getFullYear();
    const mo = parseInt(m2[2], 10);
    const d = parseInt(m2[3], 10);
    if (isValidYMD(y, mo, d)) return formatYMD(y, mo, d);
  }

  // 見つからない場合
  return null;
}

/**
 * @summary 有効な日付かどうか判定
 */
function isValidYMD(y, m, d) {
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(y, m - 1, d);
  return (
    dt.getFullYear() === y &&
    dt.getMonth() === m - 1 &&
    dt.getDate() === d
  );
}

/**
 * @summary 日付文字列作成
 */
function formatYMD(y, m, d) {
  const z2 = (n) => String(n).padStart(2, "0");
  return `${y}/${z2(m)}/${z2(d)}`;
}







//---------------------------------------
// Initialize
//---------------------------------------
(function init() {
  console.log('call init');
  load_data(false);
})();






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
// 今日のタスクのロック状態のチェックを更新
update_check_todays_lock();
// 自動保存 チェック更新
update_auto_save();

// フィルターボタン生成
// make_filter_buttons();
make_filter_buttons_ex();

// 検索用グループリスト作成
// set_group_select("stock_list_group_list", true);

// 全リストの検索選択肢を設定
set_stocklist_filter_text_items();

// 出社/在宅状況の表示
read_work_schedule();



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