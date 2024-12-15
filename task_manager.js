//---------------------------------------
// Global
//---------------------------------------




//---------------------------------------
// Event
//---------------------------------------

// Double Click Event
document.getElementById("stock_list").addEventListener("dblclick", move_today_item);
document.getElementById("todays_list").addEventListener("dblclick", done_item);
document.getElementById("done_list").addEventListener("dblclick", return_item);

// Click Event
// regist
document.getElementById("btn_input_reflect").addEventListener("click", regist_from_textarea);
document.getElementById("btn_input_json").addEventListener("click", regist_from_json);

// stock list
document.getElementById("copy_stock_list").addEventListener("click", copy_stock_list);

// todays list
document.getElementById("copy_todays_list").addEventListener("click", copy_todays_list);
document.getElementById("set_first_task").addEventListener("click", toggle_todays_first_task);
document.getElementById("clear_first_task").addEventListener("click", clear_first_task);
document.getElementById("toggle_show_done").addEventListener("click", toggle_show_todays_done);
document.getElementById("lock_todays_task").addEventListener("click", toggle_lock_todays_task);

// done list
document.getElementById("copy_done_list").addEventListener("click", copy_todays_done_list);
document.getElementById("release_todays_done").addEventListener("click", release_todays_done);

// other
document.getElementById("save").addEventListener("click", save_data);
document.getElementById("load").addEventListener("click", load_data);
document.getElementById("add_item").addEventListener("click", add_items);
document.getElementById("remove_item").addEventListener("click", remove_item);
document.getElementById("undo").addEventListener("click", undo_item);
document.getElementById("copy_now_json").addEventListener("click", copy_now_json);
document.getElementById("download_now_json").addEventListener("click", download_now_json);
document.getElementById("import_mail_flag").addEventListener("click", read_mail_flag);

// Popup
document.getElementById("popup_edit_form").addEventListener("submit", submit_edit_popup);
// document.getElementById("popup_edit_update_btn").addEventListener("click", submit_edit_popup);
document.getElementById("popup_edit_cancel_btn").addEventListener("click", close_edit_popup);


// document.querySelectorAll(".td_edit").forEach(function(elem) { elem.addEventListener('click', click_stock_list_item); });

// Key event
document.getElementById("stock_list").addEventListener("keydown", keyhandler_stock_list);
document.getElementById("todays_list").addEventListener("keydown", keyhandler_todays_list);
document.getElementById("done_list").addEventListener("keydown", keyhandler_done_list);
document.getElementById("popup_edit_base").addEventListener("keydown", keyhandler_edit_popup);

// Show message Before Close Browwer
window.onbeforeunload = function(e) {
  return "";
}




//---------------------------------------
// Data
//---------------------------------------

// key code
// https://developer.mozilla.org/ja/docs/Web/API/KeyboardEvent/keyCode
const key_a = 65;
const key_c = 67;
const key_d = 68;
const key_f = 70;
const key_arrow_left = 37;
const key_arrow_right = 39;
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
var g_last_group_id = 1000;
var g_last_id = 0;

// 編集履歴
var g_list_history = [];
const g_list_history_num = 20;

// 今日の済みタスク表示フラグ (true:表示する / false:表示しない)
var g_is_show_todays_done = false;
// 今日のタスク ロック状態
var g_lock_todays_task = false;

// 編集ポップアップ表示状態
var g_show_popup = false;

// timeline Object
var timeline = null;
// 表示する日付範囲
const past_days = 2;
const post_days = 14;





//---------------------------------------
// Function
//---------------------------------------

// inputへ入力された内容をALLリストへ追加
function regist_from_textarea() {
  // 入力テキスト取得
  let input = document.getElementById("input_area").value;

  // 内部データへ変換
  let group_id = convert_internal_data(input);

  // 内部データをリストへ反映
  update_list();

  // テキストをクリア
  document.getElementById("input_area").value = '';

  // 選択
  // if (group_id !== null) {
  //   set_select("stock_list", group_id);
  // }
}

// JSONをリストへ反映
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

// 内部データをリストへ反映
function update_list() {
  update_stock_list(g_list_data);
  update_todays_list(g_list_data);
  update_done_list(g_list_data);
  show_timeline();
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
 * フラグメール情報を取り込み ('メール'グループへ追加)
 */
function read_mail_flag() {
  if (mail_flag === undefined) {
    return;
  }

  // 追加先グループ取得
  let group = getInternalFromName('メール');
  if (group === null) {
    return;
  }

  // タスクを追加
  let titles = [];
  for (let i =0; i < mail_flag.length; i++) {
    titles.push(`(${mail_flag[i].receive_date}) ${mail_flag[i].title}`);
  }
  pushHistory();
  addIntarnalDataEx2(group.id, titles, true);

  update_list();
}



/**
 * @summary 内部データのアイテムを取得 (id指定)
 * @param ID
 * @returns アイテムデータ or null
 */
function getInternal(id) {
  let keys = Object.keys(g_list_data);

  //　アイテムデータを検索
  for (let i = 0 ; i < keys.length; i++) {
    let items = g_list_data[keys[i]].sub_tasks;
    for (let j = 0 ; j < items.length; j++) {
      if (items[j].id == id) {
        return items[j];
      }
    }
  }

  // グループを検索
  for (let i = 0 ; i < keys.length; i++) {
    let group = g_list_data[keys[i]];
    if (group.id == id) {
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
  let keys = Object.keys(g_list_data);

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
 * @summary 内部データアイテムを指定idの後ろへ追加
 * @param id
 * @param タスク名
 */
function addIntarnalData(id, name) {
  let keys = Object.keys(g_list_data);
  for (let i = 0 ; i < keys.length; i++) {
    let items = g_list_data[keys[i]].sub_tasks;
    for (let j = 0 ; j < items.length; j++) {
      if (items[j].id == id) {
        // アイテム追加
        let item = makeInternalItem(name);
        items.splice(j+1, 0, item);
        return item.id;
      }
    }
  }
}

/**
 * @summary 内部データアイテムを指定idの後ろへ追加(複数)
 * @param id
 * @param タスク名リスト 
 * @param 最後に追加したアイテムのID
 */
function addIntarnalDataEx(id, names) {
  let last_id = null;
  for (let i = 0 ; i < names.length; i++) {
    last_id = addIntarnalData(id, names[i]);
  }
  return last_id;
}

/**
 * @summary 内部データアイテムを指定グループIDへ追加(複数アイテム)
 * @param グループID
 * @param タスク名リスト 
 * @param 最後に追加したアイテムのID
 */
function addIntarnalDataEx2(group_id, names, is_ignore_same_name) {
  // グループ取得
  let group = getInternal(group_id);
  if (group.type !== 'group') {
    return null;
  }

  let last_id = null;
  for (let i = 0 ; i < names.length; i++) {
    if (is_ignore_same_name) {
      // 同名のタスクが存在するか確認し、存在しなければ追加
      if (getInternalFromName(names[i]) === null) {
        let item = makeInternalItem(names[i])
        last_id = item.id;
        group.sub_tasks.push(item);
      }
    } else {
      let item = makeInternalItem(names[i])
      last_id = item.id;
      group.sub_tasks.push(item);
    }
  }
  return last_id;
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
    id: g_last_group_id, 
    type: 'group', 
    name: name, 
    period: period, 
    sub_tasks: []
  };
  g_last_group_id++;
  return ret;
}

/**
 * @summary 内部データアイテム要素作成
 * @param タスク名
 * @returns dict
 */
function makeInternalItem(name) {
  let ret = {
    id: g_last_id, 
    type: 'item', 
    name: name, 
    status: 'yet', 
    is_today: 0,  // 0:明日以降 / 1:今日 / 2:今日の追加分 
    is_first: false, 
    last_update: ''
  };
  g_last_id++;
  return ret;
}

/**
 * @summary 内部データ削除
 * @param id
 * @param グループのサブタスクが空になったらグループを削除するかどうか
 */
function removeIntarnalData(id, is_remove_empty_group) {
  let keys = Object.keys(g_list_data);
  for (let i = 0 ; i < keys.length; i++) {
    let group = g_list_data[keys[i]]

    // group削除
    if (group.id == id) {
      delete g_list_data[keys[i]];
    } else {
      let items = group.sub_tasks;
      for (let j = 0 ; j < items.length; j++) {
        if (items[j].id == id) {
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
 * @summary リスト表示更新
 * @param リストデータ
 * @param 更新対象リストのエレメントID
 * @param 表示判定コールバック
 * @param クラスリスト取得コールバック
 * @param 最終更新日表示判定コールバック
 * @param 空のグループ表示判定コールバック
 */
function update_list_common(list_data, elem_id, func_show_condition, func_get_classes, func_show_lastupdate, func_is_show_empty_group) {
  let selected_ids = get_select_id_ex(elem_id);
  let select = document.getElementById(elem_id);
  select.innerHTML = '';

  let keys = get_internal_keys();
  for (let i = 0 ; i < keys.length; i++) {
    // サブタスクのエレメント一覧を作成
    let append_elems = [];
    let items = list_data[keys[i]].sub_tasks;
    for (let j = 0 ; j < items.length; j++) {
      let item = items[j];
      if (func_show_condition(item) === true) {
        append_elems.push(make_option(item, func_get_classes(item), false, func_show_lastupdate(item)));
      }
    }
    if (func_is_show_empty_group() || append_elems.length > 0) {
      // params
      let group_top = {}
      group_top.name = `${list_data[keys[i]].name} ( ${get_date_string(list_data[keys[i]].period)} ) (〜 ${list_data[keys[i]].period} )`;
      group_top.id = list_data[keys[i]].id;
      // class
      let classes = ["group_top"];
      if (list_data[keys[i]].period !== '') {
        let days_from_today = get_days_from_today(list_data[keys[i]].period);
        if (days_from_today >= -3) {
          classes.push("group_expire_soon");
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
 * ALLタスクリスト更新
 */
function update_stock_list() {
  update_list_common(
    g_list_data, "stock_list", 
    function(item) {
      return true;
    },
    function(item) {
      let classes = ["group_level1"];
      if (item.status === 'done') {
        classes.push('done');
      } else if (item.is_today > 0) {
        classes.push('today');
      }
      return classes;
    },
    function(item) {
      if (item.status === 'done') {
        return true;
      }
      return false;
    },
    function() {
      // アイテムが無いグループを表示するかどうか
      return true;
    }
  );
}

/**
 * 今日のリストを更新
 */
function update_todays_list() {
  update_list_common(
    g_list_data, "todays_list", 
    function(item) {
      // 表示条件
      if (!g_is_show_todays_done) {
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
    g_list_data, "done_list", 
    function(item) {
      // 表示条件
      return (item.is_today > 0 && item.status === 'done');
    },
    function(item) {
      // クラスリスト
      return ["group_level1"];
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
  @summary  リストのoptionタグを生成
  @param    dict
  @param    クラスリスト
  @param    グループかどうか
  @param    最終更新日を表示するかどうか
  @return    Element
 */
function make_option(item, class_list, is_group_top, show_last_update) {
  let option = document.createElement("option");
  option.text = item.name;
  if (!is_group_top && show_last_update) {
    option.text += ' (' + get_date_string(item.last_update) + ')';
  }
  option.value = option.text;
  option.dataset.id = item.id;
  if (!is_group_top) {
    option.dataset.status = item.status;
  }

  // クラス追加
  if (class_list.length !== 0) {
    for (i=0; i < class_list.length; i++) {
      option.classList.add(class_list[i]);
    }
  }

  return option;
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
      if (options[i].classList.contains('group_top')) {
        return null;
      }
      return options[i].dataset.id
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
        return null;
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
 * @summary 指定された data-id のアイテムを選択状態にする
 * @param エレメントID
 * @param 選択状態にするアイテムのID
 */
function set_select(elem_id, id) {
  if (id == null) {
    return;
  }
  // 全リストから選択アイテムを選択、選択アイテムを削除
  let options = document.getElementById(elem_id).options;
  for (let i = 0; i < options.length; i++) {
    if(options[i].dataset.id == id) {
      options[i].selected = true;
    } else {
      options[i].selected = false;
    }
  }
}

/**
 * @summary 指定された data-id のアイテムを選択状態にする
 * @param エレメントID
 * @param 選択状態にするアイテムのID(2つまでの候補)
 */
function set_select_ex(elem_id, ids) {
  if (ids == null) {
    return;
  }

  // 全リストから選択アイテムを選択、選択アイテムを削除
  let options = document.getElementById(elem_id).options;
  for (let i = 0; i < options.length; i++) {
    if(options[i].dataset.id == ids[0]) {
      return options[i].selected = true;
    }
  }

  // 対象IDが見つからなかった場合は、次の候補を検索
  for (let i = 0; i < options.length; i++) {
    if(options[i].dataset.id == ids[1]) {
      return options[i].selected = true;
    }
  }
}


// stock_listをクリック
/*
function click_stock_list_item(e) {
  console.log(this.value);

  let text = this.value;
  this.innerHTML = '<input type="text" placeholder=\"タスク名\" value="' + text + '" />';
  // this.outerHTML = '<input type="text" value="aaaaaaaaaaa">';
}
*/


// 選択アイテムを今日のタスクへ移動
function move_today_item() {
  // リストから選択アイテムを取得
  let id = get_select_id("stock_list");
  if (id === null) {
    // グループを選択している
    return;
  }

  pushHistory();

  // idから内部データの配列を取得し、ステータスを変更
  let item = getInternal(id);
  if (g_lock_todays_task) {
    item.is_today = 2;  // 今日の追加タスク
  } else {
    item.is_today = 1;
  }
  item.last_update = get_today_str(true);

  // リストへ反映
  update_list();
}

// 選択アイテムを今日のタスクから削除
function remove_today_item() {
  pushHistory();

  // 全リストから選択アイテムを選択、選択アイテムを削除
  left_items = document.getElementById("todays_list").options;
  for (let i = 0; i < left_items.length; i++) {
    if(left_items[i].selected) {
      // is_today を false へ更新
      let id = left_items[i].dataset.id
      item = getInternal(id)
      item.is_today = 0;
      item.is_first = false;  // 優先タスクフラグ解除
      item.last_update = get_today_str(true);
    }
  }
  // リストへ反映
  update_list();
}

// 選択アイテムをファーストタスクへ設定
function toggle_todays_first_task() {
  pushHistory();

  let id = get_selected_id("todays_list");
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

// 全てのファーストタスクを解除
function clear_first_task() {
  pushHistory();

  let keys = Object.keys(g_list_data);
  for (let i = 0 ; i < keys.length; i++) {
    let items = g_list_data[keys[i]].sub_tasks;
    for (let j = 0 ; j < items.length; j++) {
      items[j].is_first = false;
    }
  }
  // リスト更新
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


// 選択アイテムを処理済みへ
function done_item() {
  pushHistory();

  // 左リストから選択アイテムを選択、選択アイテムを削除
  left_items = document.getElementById("todays_list").options;
  for (let i = 0; i < left_items.length; i++) {
    if(left_items[i].selected) {
      // status を done へ更新
      let id = left_items[i].dataset.id
      item = getInternal(id)
      if (item.status !== 'done') {
        item.status = 'done';
        item.is_first = false;  // 優先タスクフラグ解除
        item.last_update = get_today_str(true);
        break;
      }
    }
  }
  // リストへ反映
  update_list();
}

// 選択アイテムのステータスを戻す
function return_item() {
  // 履歴保存
  pushHistory();

  // 左リストから選択アイテムを選択、選択アイテムを削除
  left_items = document.getElementById("done_list").options;
  for (let i = 0; i < left_items.length; i++) {
    if(left_items[i].selected) {
      // status を yet へ更新
      let id = left_items[i].dataset.id
      getInternal(id).status = 'yet';
      break;
    }
  }
  // リストへ反映
  update_list();
}

// 今日の処理済みを今日から外す
function release_todays_done() {
  // 履歴保存
  pushHistory();

  let keys = Object.keys(g_list_data);
  for (let i = 0 ; i < keys.length; i++) {
    items = g_list_data[keys[i]].sub_tasks;
    for (let j = 0 ; j < items.length; j++) {
      if (items[j].is_today > 0 && items[j].status == 'done') {
        items[j].is_today = 0;
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
 
  let selected_id = get_selected_id("stock_list");
  addIntarnalDataEx(selected_id, lines);
 
  // リストを更新
  update_list();
 
  // 入力値をクリア
  document.getElementById("add_item_text").value = '';
}

// フラグ付きメール情報を取り込む
// function import_mail_flag() {
//   if (mail_flag === undefined) {
//     // ファイルがない or インポートされていない
//     return;
//   }

//   let items = [];
//   for (let i = 0 ; i < mail_flag.length; i++) {
//     let name = `${mail_flag[i].receive_date} / ${mail_flag[i].title}`;
//     items.push(makeInternalItem(name));
//   }

//   // 内部データへ追加
//   if (g_list_data['メール'] === undefined) {
//     g_list_data['メール'] = { period: group_period, sub_tasks: [] };
//   }
//   for (i = 0; i < items.length; i++) {
//     if (!g_list_data['メール'].sub_tasks.includes(items[i])) {
//       g_list_data['メール'].sub_tasks.push(items[i]);
//     }
//   }
// }

/**
 * @summary 全リストの選択中アイテム削除
 */
function remove_item() {
  pushHistory();

  let selected_id = get_selected_id("stock_list");
  removeIntarnalData(selected_id, false);

  // リストを更新
  update_list();
}

// 戻す
function undo_item() {
  let data = popHistory();
  if (data !== null) {
    g_list_data = data;
  }

  // リストを更新
  update_list();
}

/**
 * @summary 選択中アイテムの 内部データid を取得
 * @param selectエレメントID
 * @returns ID or null
 */
function get_selected_id(elem_id) {
  let elem = get_selected_option(elem_id);
  if (elem !== null) {
    return elem.dataset.id;
  }
  return null;
}

/**
 * @summary 選択されているoptionを取得
 * @param selectエレメントID
 * @returns エレメントオブジェクト
 */
function get_selected_option(elem_id) {
  let options = document.getElementById(elem_id).options;
  for (let i = 0; i < options.length; i++) {
    if(options[i].selected) {
      return options[i];
    }
  }
  return null;
}

// g_last_group_id / g_last_id を更新
function update_last_id() {
  let last_group_id = 1000;
  let last_id = 0;

  let keys = Object.keys(g_list_data);
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
 * @summary 今日の全タスク数, 今日の処理済みタスク数 を取得
 * @return dict / {task_number: [今日の全タスク数], task_number_done: [今日の処理済みタスク数] }
 */
function get_todays_task_number() {
  let task_number = 0;
  let task_number_done = 0;

  let keys = Object.keys(g_list_data);
  for (let i = 0 ; i < keys.length; i++) {
    let items = g_list_data[keys[i]].sub_tasks;
    for (let j = 0 ; j < items.length; j++) {
      if (items[j].is_today > 0) {
        task_number++;
        if (items[j].status === 'done') {
          task_number_done++;
        }
      }
    }
  }
  return {task_number: task_number, task_number_done: task_number_done};
}



// 保存
function save_data() {
  let keys = Object.keys(g_list_data);
  if (keys.length <= 0) {
    return;
  }

  let yesno = confirm('現在の状態を保存しますか？');
  if (yesno) {
    let list_data_str = JSON.stringify(g_list_data);
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
    g_list_data = JSON.parse(list_data_str);

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
  let copy_text = get_todays_list_text(false);
  navigator.clipboard.writeText(copy_text);

  copy_animation(this);
}

// 済みリストをクリップボードにコピー
function copy_todays_done_list() {
  let copy_text = get_todays_list_text(true);
  navigator.clipboard.writeText(copy_text);

  copy_animation(this);
}

// 選択アイテムをクリップボードにコピー
function copy_selected_item_name(elem_id) {
  let id = get_selected_id(elem_id);
  let item = getInternal(id)
  navigator.clipboard.writeText(item.name);

  // copy_animation(this);
}

// Allリストをテキストで取得
function get_all_text() {
  let copy_text = '';
  let keys = Object.keys(g_list_data);

  for (let i = 0 ; i < keys.length; i++) {
    copy_text += keys[i];
    copy_text += '\n';
    items = g_list_data[keys[i]].sub_tasks;
    for (let j = 0 ; j < items.length; j++) {
      copy_text += items[j].name;
      copy_text += '\n';
    }
  }

  return copy_text;
}

// 済みリストをテキストで取得
function get_todays_list_text(only_done) {
  let copy_text = '';

  // 対象となるタスクリストを作成
  let keys = Object.keys(g_list_data);
  for (let i = 0 ; i < keys.length; i++) {
    let ary = [];
    let items = g_list_data[keys[i]].sub_tasks;
    for (let j = 0 ; j < items.length; j++) {
      if (items[j].is_today > 0) {
        if (only_done) {
          if (items[j].status === 'done') {
            ary.push(items[j].name);
          }
        } else {
          ary.push(items[j].name);
        }
      }
    }

    // テキストを整形
    if (ary.length > 0) {
      copy_text += "⚫︎" + keys[i];
      copy_text += '\n';
      for (let j = 0 ; j < ary.length; j++) {
        copy_text += " " + ary[j];
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

  let keys = Object.keys(g_list_data);
  for (let i = 0 ; i < keys.length; i++) {
    let ary = [];
    let items = g_list_data[keys[i]].sub_tasks;
    for (let j = 0 ; j < items.length; j++) {
      if (items[j].is_today > 0 && items[j].status === 'done') {
        ary.push(items[j].name);
      }
    }
    if (ary.length > 0) {
      copy_text += "⚫︎" + keys[i];
      copy_text += '\n';
      for (let j = 0 ; j < ary.length; j++) {
        copy_text += " " + ary[j];
        copy_text += '\n';
      }
      copy_text += '\n';
    }
  }
  return copy_text;
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
  const blob = new Blob([JSON.stringify(g_list_data)], { type: 'application/json' });
  const url = (window.URL || window.webkitURL).createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  let date_str = get_today_str(false);
  a.download = `task_manager_status_${date_str}.json`;
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

// 現在の状態をJSONテキストで取得
function get_now_json() {
  return JSON.stringify(g_list_data, null , "  ");
}

/**
 * @summary データ互換性維持のための調整 / 内部データの不足している属性補完
 */
function adjust_attr_internal_data() {
  let keys = Object.keys(g_list_data);

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
        item.type = "item";
      }
    }
  }
}

/**
 * 編集ポップアップ表示
 */
function show_edit_popup() {
  if (g_show_popup) {
    return;
  }

  let elem = document.getElementById("popup_edit_base");
  let selected_id = get_selected_id("stock_list");
  let item = getInternal(selected_id);
  if (item.type === "group") {
    // タスク名
    document.getElementById("popup_edit_text").value = item.name;
    // 期限
    let elem_date = document.getElementById("popup_edit_date");
    elem_date.value = item.period.replaceAll('/','-');
    elem_date.style.display = "block";
    // ID 
    document.getElementById("popup_edit_id").value = selected_id;
    document.getElementById("popup_edit_hidden_id").value = selected_id;
  }

  if (item.type === "item") {
    // タスク名
    document.getElementById("popup_edit_text").value = item.name;
    // 期限(非表示)
    document.getElementById("popup_edit_date").style.display = "none";
    // ID 
    document.getElementById("popup_edit_id").value = selected_id;
    document.getElementById("popup_edit_hidden_id").value = selected_id;
  }

  // ポップアップをリストの選択位置へ移動
  let selected_elem = get_selected_option("stock_list");
  if (selected_elem !== null) {
    let rect = selected_elem.getBoundingClientRect();
    elem.style.top = rect.top;
    elem.style.left = rect.right;
  }

  // 表示
  elem.style.display = "block";
  // フォーカス移動
  document.getElementById("popup_edit_text").focus();

  g_show_popup = true;
}

/**
 * グループ情報変更
 */
function submit_edit_popup() {
  let new_name = document.getElementById("popup_edit_text").value;
  let new_period = document.getElementById("popup_edit_date").value;
  let id_hidden_str = document.getElementById("popup_edit_hidden_id").value;
  let id_edit_str = document.getElementById("popup_edit_id").value;
  let id_hidden = parseInt(id_hidden_str);
  let id_edit = parseInt(id_edit_str);

  // 内部データ取得
  let item = getInternal(id_hidden);

  if (item.type === 'group') {
    // 入力値を適用
    item.name = new_name;
    item.period = new_period.replaceAll('-', '/');
  }
  if (item.type === 'item') {
    // 入力値を適用
    item.name = new_name;
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
  document.getElementById("stock_list").focus();
}

/**
 * 編集ポップアップを閉じる
 */
function close_edit_popup() {
  let elem = document.getElementById("popup_edit_base");
  elem.style.display = "none";
  g_show_popup = false;

  // フォーカスをリストへ移動
  document.getElementById("stock_list").focus();
}



/**
 * タイムライン: グループデータ作成
 */
function make_groups() {
  let groups = [];
  groups.push( {id: 'task', content: 'タスク', title: 'タスク' } );
  return groups;
}

/**
 * タイムライン: アイテムデータ作成
 */
function make_items()
{
  let items = [];

  let keys = Object.keys(g_list_data);
  for (let i = 0 ; i < keys.length; i++) {
    let group = g_list_data[keys[i]];
    if (group.period === undefined) {
      continue;
    }

    let name = keys[i];
    if (group.name !== undefined) {
      name = group.name;
    }
    let period = group.period + ' 12:00';
    items.push( { group: 'task', id: group.id, content: name, title: name, start: period, type: 'point' } );
  }

  // { title:"あああああ", comment:"コメント", date:"2024/03/01 8:00" },
  // ↓
  // {id: 0, group: 'AutomateでSharePoint通知', content: 'xxxxxxx', start: '2024/02/29 18:00', type: 'point'},
  // for (let i = 0; i < tasks.length; i++) {
  //   items.push( { group: group_id, id: i, content: tasks[i].name, title: tasks[i].name, start: tasks[i].period + ' 12:00', type: 'point' } );
  // }

  return items;
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
  groups = groups.concat(make_groups());
  items = items.concat(make_items());

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
    height: "100px",     // 縦幅 (minHeightと合わせて指定すると日付軸が固定になる)
    minHeight: "150px",  // 最大縦幅
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
    timeline.on('select', function (properties) {
      // alert('selected items: ' + properties.items);
      set_select('stock_list', properties.items);
    });
  }

  // 指定した日付の位置に垂直の線を引く
  // timeline.addCustomTime('2014-03-02', 'v-bar');
}






//---------------------------------------
// Key Event
//---------------------------------------

// All List
function keyhandler_stock_list(event) {
  const keyCode = event.keyCode;

  // right key
  if (keyCode === key_arrow_right) {
    move_today_item();
  }
  // c key
  if (keyCode === key_c) {
    copy_selected_item_name('stock_list');
  }
  // ctrl + d key
  if (keyCode === key_d) {
    event.preventDefault(); // d は既定の動作をキャンセル
    remove_item();
  }
  // Space key
  if (keyCode === key_space) {
    if (g_show_popup) {
      close_edit_popup();
    } else {
      show_edit_popup();
    }
  }
}

// Today List
function keyhandler_todays_list(event) {
  const keyCode = event.keyCode;

  // right key
  if (keyCode === key_arrow_right) {
    done_item();
  }
  // left key
  if (keyCode === key_arrow_left) {
    remove_today_item();
  }
  // f key
  if (keyCode === key_f) {
    toggle_todays_first_task();
  }
  // c key
  if (keyCode === key_c) {
    copy_selected_item_name('todays_list');
  }
}

// After List
function keyhandler_done_list(event) {
  const keyCode = event.keyCode;

  // right key
  if (keyCode === key_arrow_right) {
  } else if (keyCode === key_arrow_left) {
    return_item();   
  }
}

// Edit Popup
function keyhandler_edit_popup(event) {
  const keyCode = event.keyCode;

  // Esc key
  if (keyCode === key_esc) {
    close_edit_popup();
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

// 内部データソート 比較関数
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
 * @summary 内部データのキーリストをソートして返す
 * @param ソート無しとするかどうか
 * @return キー一覧
 */
function get_internal_keys(is_no_sort) {
  let keys = Object.keys(g_list_data);
  let ary = [];
  for (let i = 0 ; i < keys.length; i++) {
    ary.push({ name: keys[i], period: g_list_data[keys[i]].period })
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


// ゼロパディング
function zero_padding(num, len) {
  return ( Array(len).join('0') + num ).slice( -len );
}




//---------------------------------------
// Function (Date)
//---------------------------------------

/**
 * @summary 今日の日付を返す
 * @param Dateオブジェクト
 * @param 区切り記号を入れるかどうか(/, :)
 * @param 時刻を含めるかどうか
 * @returns 日付文字列
 */
function get_date_str(d, is_separate, is_include_time) {
  let year = d.getFullYear();
  let month = zero_padding(d.getMonth() + 1, 2);
  let date = zero_padding(d.getDate(), 2);
  let hour = zero_padding(d.getHours(), 2);
  let minute = zero_padding(d.getMinutes(), 2);
  // let second = today.getSeconds();

  let sep = '';
  let sep2 = '';
  if (is_separate === true) {
    sep = '/';
    sep2 = ':';
}

  if (is_include_time === true) {
    return `${year}${sep}${month}${sep}${date} ${hour}${sep2}${minute}`;
  }
  return `${year}${sep}${month}${sep}${date}`;
}

/**
 * @summary 今日の日付文字列を返す
 * @param 区切り記号を入れるかどうか(/, :)
 * @returns 日付文字列
 */
function get_today_str(is_separate) {
  return get_date_str(new Date(), is_separate, true);
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

// 日付加算 (週末考慮オプション付き)
// return String


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
  return get_date_str(dt, true, false);
}

/**
 * @summary 日を増減する
 * @param 基準日
 * @param 増減する日数
 * @param 週末を除外するかどうか
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

// 表示日付文字列取得 (「1日前」とかの表示)
function get_date_string(date_str) {
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
    if (diff_days <= 15) {
      // 過去 (規定日数まで日数を表示)
      return Math.floor(diff_days) + "日前";
    }
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
    return get_date_str(d, true, false);
  }

  return get_date_str(new Date(date_str), true, false);
}




//---------------------------------------
// Main
//---------------------------------------
update_check_todays_done();

// reflesh(default_start_date, default_data);


// let d2 = new Date('2024/11/23');
// let d1 = new Date('2024/11/29');

// let ret = get_days(d1, d2, true);
// console.log(ret);



