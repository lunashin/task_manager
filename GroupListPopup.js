//---------------------------------------
// Global
//---------------------------------------



//---------------------------------------
// Class
//---------------------------------------
/**
 * グループ一覧ポップアップ
 */
class GruopListPopup {

  /**
   * @summary コンストラクタ
   * @param ベース領域の要素ID
   * @param イベントコールバック {'イベント名': コールバック関数, ...}
   */
  constructor(base_elem_id, mode = 'select', cb_event = null) {
    this.base_elem_id = base_elem_id;
    this.mode = mode;
    this.cb_event= cb_event;
  }

  /**
   * @summary ダイアログ表示
   * @param 動作モード(select: クリックでリスト選択, drop: ドロップでアイテムの所属グループ移動)
   */
  show(group_ids) {
    this.make(group_ids);
    let elem = document.getElementById(this.base_elem_id);

    // 画面中央部に移動
    elem.style.top = window.innerHeight/2 - elem.clientHeight/2;
    elem.style.left = window.innerWidth/2 - elem.clientWidth/2;

    // 表示
    elem.style.visibility = 'visible';
    elem.style.opacity = 1;
  }

  /**
   * @summary ダイアログを閉じる
   */
  close() {
    let elem = document.getElementById(this.base_elem_id);
    elem.style.visibility = 'hidden';
    elem.style.opacity = 0;
  }

  /**
   * @summary 表示状態取得
   */
  is_show() {
    return (document.getElementById(this.base_elem_id).style.visibility === 'visible');
  }

  /**
   * @summary ポップアップ内要素作成
   * @param　表示するグループID一覧
   */
  make(group_ids) {
    let base_div = document.getElementById(this.base_elem_id);
    
    // 空にする
    while (base_div.firstChild) {
      base_div.removeChild(base_div.firstChild);
    }

    // グループ一覧取得
    // let additional_classes = ['popup_group_list_item_bk_white', 'popup_group_list_item_bk_red'];
    let additional_classes = ['popup_group_list_item_bk_white', 'popup_group_list_item_bk_red', 'popup_group_list_item_bk_blue'];
    let group_no = 0;
    let prev_name = '';
    for (let i = 0; i < group_ids.length; i++) {
      let group_name = getInternal(group_ids[i]).name;
      let elem_div = document.createElement("div");

      // 「:」以前が一致しないアイテムが来たら背景色を変更
      if (prev_name !== '' && prev_name.split(':')[0].trim() !== group_name.split(':')[0].trim()) {
        // base_div.appendChild(document.createElement("hr"));
        group_no++;
      }

      elem_div.innerText = group_name;
      elem_div.dataset.id = group_ids[i];
      elem_div.classList.add('popup_group_list_item');
      elem_div.classList.add(additional_classes[group_no % additional_classes.length]);

      // イベントハンドラ登録
      if (this.mode === 'select') {
        elem_div.addEventListener("click", this.cb_event['click']);
      } else if (this.mode === 'drop') {
        elem_div.addEventListener("drop", this.drop_handler.bind(this));
        elem_div.addEventListener("dragover", this.dragover_handler.bind(this));
        elem_div.addEventListener("dragenter", this.dragenter_handler.bind(this));
        elem_div.addEventListener("dragleave", this.dragleave_handler.bind(this));
      }

      base_div.appendChild(elem_div);
      prev_name = group_name;
    }
  }

  /**
   * @summary dropハンドラ
   */
  drop_handler(event) {
    console.log("GruopListPopup.onDrop");
    event.currentTarget.classList.remove("progress-dialog-box-title-group-dragging");  // ドロップ先要素のクラス変更

    // コールバック呼び出し
    this.cb_event['drop'](event);

    this.close();
  }

  /**
   * @summary dragoverハンドラ
   */
  dragover_handler(event) {
    event.preventDefault();
  }

  /**
   * @summary dragenterハンドラ
   */
  dragenter_handler(event) {
    console.log("GruopListPopup.onDragenter");
    event.currentTarget.classList.toggle("progress-dialog-box-title-group-dragging");  // ドロップ先要素のクラス変更
  }

  /**
   * @summary dragleaveハンドラ
   */
  dragleave_handler(event) {
    console.log("GruopListPopup.onDragleave");
    event.currentTarget.classList.toggle("progress-dialog-box-title-group-dragging");  // ドロップ先要素のクラス変更
  }

};