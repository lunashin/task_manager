//---------------------------------------
// Global
//---------------------------------------



//---------------------------------------
// Class
//---------------------------------------
/**
 * 編集ポップアップ
 */
class EditDialog {

  /**
   * @summary コンストラクタ
   * @param ベース領域の要素ID
   * @param タスク名領域の要素ID
   * @param 進捗内容領域の要素ID
   * @param タスク名領域イベントコールバック {'イベント名': コールバック関数, ...}
   */
  constructor() {
    this.show_popup = false;

    this.user_operation_promise = null;
    this.user_operation_resolve = null;
    this.user_operation_reject = null;

    // Popup
    document.getElementById("popup_edit_base").addEventListener("keydown", this.keyhandler_edit_popup.bind(this));
    document.getElementById("popup_edit_form").addEventListener("submit", this.submit_edit_popup.bind(this));
    document.getElementById("popup_edit_cancel_btn").addEventListener("click", this.cancel_edit_popup.bind(this));
    // Popup(multi)
    document.getElementById("popup_edit_multi_base").addEventListener("keydown", this.keyhandler_edit_popup_multi.bind(this));
    document.getElementById("popup_edit_multi_form").addEventListener("submit", this.submit_edit_multi_popup.bind(this));
    document.getElementById("popup_edit_multi_cancel_btn").addEventListener("click", this.close_edit_multi_popup.bind(this));

    // 期限（今日にセットするボタン）
    document.getElementById("popup_button_set_today").addEventListener("click", this.click_handler_period_today.bind(this));
    document.getElementById("popup_button_date_end_set_today").addEventListener("click", this.click_handler_period_today.bind(this));
    // 期限（+1日するボタン）
    document.getElementById("popup_button_date_inc").addEventListener("click", this.click_handler_period_inc_xxx_day.bind(this));
    document.getElementById("popup_button_date_end_inc").addEventListener("click", this.click_handler_period_inc_xxx_day.bind(this));
    // 期限（+1Wするボタン）
    document.getElementById("popup_button_date_inc1w").addEventListener("click", this.click_handler_period_inc_xxx_day.bind(this));
    document.getElementById("popup_button_date_end_inc1w").addEventListener("click", this.click_handler_period_inc_xxx_day.bind(this));
    // 期限（+1Mするボタン）
    document.getElementById("popup_button_date_inc1m").addEventListener("click", this.click_handler_period_inc_1m.bind(this));
    document.getElementById("popup_button_date_end_inc1m").addEventListener("click", this.click_handler_period_inc_1m.bind(this));
    // 期限（Clearボタン）
    document.getElementById("popup_button_date_clear").addEventListener("click", this.click_handler_period_clear.bind(this));
    document.getElementById("popup_button_date_end_clear").addEventListener("click", this.click_handler_period_clear.bind(this));
    // 期限変更イベント(曜日を表示)
    document.getElementById("popup_edit_date").addEventListener("change", this.change_handler_period_refresh_weekday.bind(this));
    document.getElementById("popup_edit_date").addEventListener("input", this.change_handler_period_refresh_weekday.bind(this));
    document.getElementById("popup_edit_date_end").addEventListener("change", this.change_handler_period_refresh_weekday.bind(this));
    document.getElementById("popup_edit_date_end").addEventListener("input", this.change_handler_period_refresh_weekday.bind(this));

    document.getElementById("popup_button_copy_url").addEventListener("click", this.clickhandler_edit_popup_copy_url.bind(this));
    document.getElementById("popup_edit_note_add_btn").addEventListener("click", this.clickhandler_edit_popup_note_add.bind(this));
    document.getElementById("popup_edit_note").addEventListener("keydown", this.keydownhandler_edit_popup_note_add.bind(this));

    // Setterフック初期化
    this.init_setter_date(popup_edit_date);
    this.init_setter_date(popup_edit_date_end);
  }

  /**
   * @summary 日付要素のSetterフック初期化
   */
  init_setter_date(el) {
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
      console.log(error.message);
    }
  }

  /**
   * @summary 編集ポップアップ キーイベント処理
   * @param イベント情報
   */
  keyhandler_edit_popup(event) {
    switch (event.keyCode){
      case key_esc:       // ESC
        this.cancel_edit_popup();
        break;
    }
  }

  /**
   * @summary 編集ポップアップ キーイベント処理(複数版)
   * @param イベント情報
   */
  keyhandler_edit_popup_multi(event) {
    switch (event.keyCode){
      case key_esc:       // ESC
        this.cancel_edit_multi_popup();
        break;
    }
  }

  // URL（Copyボタン）
  clickhandler_edit_popup_copy_url() {
    let url = document.getElementById("popup_edit_url").value;
    navigator.clipboard.writeText(url);
    copy_animation2(this);
  }

  // メモ追加ボタン
  clickhandler_edit_popup_note_add() {
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
  }

  // メモ欄(Enterで編集完了)
  keydownhandler_edit_popup_note_add(event) {
    switch (event.keyCode){
      case key_enter:     // Enter(修飾キーなし)
        if (!event.altKey && !event.shiftKey && !event.ctrlKey) {
          event.preventDefault();
          this.submit_edit_popup();
          break;
        }
        break;
    }
  }



  /**
   * 編集ポップアップ内の期限設定ボタン（今日にセットするボタン）
   */
  click_handler_period_today(event) {
    let target_elem_id = event.target.dataset.target;
    document.getElementById(target_elem_id).value = get_today_str(true, false, true).replaceAll('/','-');
  }

  /**
   * 編集ポップアップ内の期限設定ボタン（+1日/+1wするボタン）
   */
  click_handler_period_inc_xxx_day(event) {
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
  click_handler_period_inc_1m(event) {
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
  click_handler_period_clear(event) {
    let target_elem_id = event.target.dataset.target;
    document.getElementById(target_elem_id).value = '';
  }

  /**
   * 編集ポップアップ内の期限変更イベント(曜日を更新)
   */
  change_handler_period_refresh_weekday(event) {
    change_handler_period_refresh_weekday_for_hook(event.target);
  }

  /**
   * @summary 編集ポップアップ表示
   * @param アイテムID(複数)
   * @param 表示位置の基準となる要素ID
   * @returns true: OK, false: Cancel
   */
  async show_edit_popup(item_ids, parent_elem_id) {
    if (item_ids.length === 1) {
      this.show_edit_popup_single(item_ids[0], {parent_elem_id: parent_elem_id});
    } else {
      this.show_edit_popup_multi(item_ids, {parent_elem_id: parent_elem_id});
    }

    // ユーザー操作を待つ
    this.user_operation_promise = new Promise((resolve, reject) => {
      this.user_operation_resolve = resolve;
      this.user_operation_reject = reject;
    });

    return this.user_operation_promise;
  }

  /**
   * @summary 編集ポップアップ表示
   * @param アイテムID(複数)
   * @param top
   * @param left
   * @returns true: OK, false: Cancel
   */
  async show_edit_popup_ex(item_ids, top, left) {
    if (item_ids.length === 1) {
      this.show_edit_popup_single(item_ids[0], {top: top, left: left});
    } else {
      this.show_edit_popup_multi(item_ids, {top: top, left: left});
    }

    // ユーザー操作を待つ
    this.user_operation_promise = new Promise((resolve, reject) => {
      this.user_operation_resolve = resolve;
      this.user_operation_reject = reject;
    });

    return this.user_operation_promise;
  }

  /**
   * @summary 編集ポップアップ表示(アイテム指定)
   * @param アイテム or グループ情報
   * @param 拡張情報 {parent_elem_id, top, left, group_id}
   */
  show_edit_popup_single_ex(item_or_group, option) {
    if (this.show_popup) {
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
      set_group_select("popup_edit_group_list", false, item.id);
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

    // ポップアップの左上位置を決定
    let top, left = 0;
    if (option.parent_elem_id !== undefined) {
      let elem = document.getElementById(option.parent_elem_id);
      let rect = elem.getBoundingClientRect();
      top = rect.top;
      left = rect.right;
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

    this.show_popup = true;
  }

  /**
   * @summary 編集ポップアップ表示
   * @param 編集対象アイテムID
   * @param 親情報(ポップアップ位置に利用) {parent_elem_id, top, left}
   */
  show_edit_popup_single(selected_id, option) {
    this.show_edit_popup_single_ex(getInternal(selected_id), option);
  }  

  /**
   * @summary 編集ポップアップ表示(複数用)
   * @param 編集対象アイテムID(配列)
   * @param 親情報(ポップアップ位置に利用) {parent_elem_id}
   */
  show_edit_popup_multi(selected_ids, option) {
    if (this.show_popup) {
      return;
    }

    // itemのみを対象とする
    let target_ids = [];
    for (let i = 0; i < selected_ids.length; i++) {
      let item = getInternal(selected_ids[i]);
      if (item.type === 'item') {
        target_ids.push(selected_ids[i]);
    }
    }

    // コントロール状態取得
    let is_wait = undefined;
    let status = undefined;
    let group_id = undefined;
    for (let i = 0; i < target_ids.length; i++) {
      let item = getInternal(target_ids[i]);
      if (item.type === 'group') {
        continue;
      }

      // is_wait 共通確認
      if (is_wait !== null) {
        if (is_wait === undefined) {
          is_wait = item.is_wait;
        } else if (is_wait !== item.is_wait) {
          is_wait = null;
        }
      }
      // status 共通確認
      if (status !== null) {
        if (status === undefined) {
          status = item.status;
        } else if (status !== item.status) {
          status = null;
        }
      }
      // group.id 共通確認
      let group = getInternalGroupFromItemID(item.id)
      if (group !== null) {
        if (group_id === undefined) {
          group_id = group.id;
        } else if (group_id !== group.id) {
          group_id = null;
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
    // グループ
    if (group_id === null) {
      set_group_select_ex("popup_edit_multi_group_list", true, -1);
    } else {
      set_group_select_ex("popup_edit_multi_group_list", false, group_id);
    }

    // ID 
    document.getElementById("popup_edit_multi_hidden_id").value = target_ids.join(',');

    // ポップアップの左上位置を決定
    let top, left = 0;
    let elem = document.getElementById("popup_edit_multi_base");
    if (option.parent_elem_id !== undefined) {
      let elem = document.getElementById(option.parent_elem_id);
      let rect = elem.getBoundingClientRect();
      top = rect.top;
      left = rect.right;
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
    document.getElementById("popup_edit_multi_done").focus();

    this.show_popup = true;
  }

  /**
   * @summary アイテム編集完了
   */
  submit_edit_popup() {
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

    // 進捗があったかどうか
    let is_progress = (
      item.note !== new_note || 
      item.is_wait !== new_wait ||
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

    // 最終更新日更新
    item.last_update = get_today_str(true, true, true);

    // 進捗更新
    if (is_progress) {
      item.last_progress_updated = get_today_str(true, true, true);
    }

    // 更新履歴登録
    registerModifyHistory(item_bak, item);

    // ポップアップ消去
    this.close_edit_popup();

    this.user_operation_resolve(true);
    this.user_operation_resolve = null;
    this.user_operation_reject = null;
  }

  /**
   * @summary アイテム編集完了(Multi)
   */
  submit_edit_multi_popup() {
    let elem_group = document.getElementById("popup_edit_multi_group_list");
    let elem_done = document.getElementById("popup_edit_multi_done");
    let elem_wait = document.getElementById("popup_edit_multi_wait");
    let ids_str = document.getElementById("popup_edit_multi_hidden_id").value;

    pushHistory();

    // 各アイテムIDに対して変更処理
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
      // グループ
      let elem_sel_group_option = get_selected_element('popup_edit_multi_group_list');
      if (elem_sel_group_option.dataset.id !== -1 && elem_sel_group_option.dataset.id !== elem_group.dataset.orgid) {
        // グループ移動
        moveIntarnalDataToGroup(parseInt(elem_sel_group_option.dataset.id), item, false);
      }
    }

    // ポップアップ消去
    this.close_edit_multi_popup();
    // リスト更新 / TODO:期限変更判断追加
    refresh_screen('all');

    this.user_operation_resolve(true);
    this.user_operation_resolve = null;
    this.user_operation_reject = null;
  }

  /**
   * @summary キャンセルボタンハンドラ
   */
  cancel_edit_popup(event) {
    this.close_edit_popup();
    this.user_operation_resolve(false);
    this.user_operation_resolve = null;
    this.user_operation_reject = null;
  }

  /**
   * 編集ポップアップを閉じる
   */
  close_edit_popup() {
    let elem = document.getElementById("popup_edit_base");
    elem.style.visibility = "hidden";
    elem.style.opacity= "0";
    document.getElementById("popup_bg_cover").style.display = 'none';

    this.show_popup = false;
  }

  /**
   * @summary キャンセルボタンハンドラ(Multi)
   */
  cancel_edit_multi_popup() {
    this.close_edit_multi_popup();
    this.user_operation_resolve(false);
    this.user_operation_resolve = null;
    this.user_operation_reject = null;
  }

  /**
   * 編集ポップアップを閉じる(Multi)
   */
  close_edit_multi_popup() {
    let elem = document.getElementById("popup_edit_multi_base");
    elem.style.visibility = "hidden";
    elem.style.opacity= "0";
    document.getElementById("popup_bg_cover").style.display = 'none';

    this.show_popup = false;
  }

  /**
   * @summary 編集ポップアップ表示中華どうか
   */
  is_show() {
    return this.show_popup;
  }

};


/**
 * @summary ポップアップ内の日付要素をjsで変更した場合のイベントフック
 */
function change_handler_period_refresh_weekday_for_hook(elem) {
  let weekday_elem_id = elem.dataset.weekday_elem;
  const val = elem.value; // "YYYY-MM-DD" 形式
  let weekday_str = getWeekDayStr(val);
  document.getElementById(weekday_elem_id).textContent = weekday_str;
}
