//---------------------------------------
// Global
//---------------------------------------



//---------------------------------------
// Class
//---------------------------------------
/**
 * タイムライン要素制御
 */
class ElementMouseMoveCtonrol {

  /**
   * @summary コンストラクタ
   */
  constructor(elem_id) {
    this.target_elem_id = elem_id;
    this.init();
  }

  /**
   * @summary 初期化
   */
  init() {
    let elem = document.getElementById(this.target_elem_id);
    elem.addEventListener('mousedown', this.mousedown_handler_base.bind(this));
    elem.addEventListener('mousemove', this.mousemove_handler_base.bind(this));
  }

  /**
   * @summary 解放
   */
  release() {
    let elem = document.getElementById(this.target_elem_id);
    elem.removeEventListener('mousedown', this.mousedown_handler_base.bind(this));
    elem.removeEventListener('mousemove', this.mousemove_handler_base.bind(this));
  }

  /**
   * @summary ベースdiv mousedownイベントハンドラ
   */
  mousedown_handler_base(event) {
    // ベース要素の位置とクリック座標を記憶
    this.base_move_info = {};
    this.base_move_info.base_click_top = event.clientY;
    this.base_move_info.base_click_left = event.clientX;
    let elem_base = document.getElementById(this.target_elem_id);
    this.base_move_info.base_org_top = parseInt(elem_base.style.top.replace('px', ''));
    this.base_move_info.base_org_left = parseInt(elem_base.style.left.replace('px', ''));
  }

  /**
   * @summary ベースdiv mousemoveイベントハンドラ
   */
  mousemove_handler_base(event) {
    // 左クリック中ならマウス移動に合わせてベース要素を移動
    if ((event.buttons & 1) === 1) {
      let elem_base = document.getElementById(this.target_elem_id);
      elem_base.style.top = this.base_move_info.base_org_top + event.clientY - this.base_move_info.base_click_top;
      elem_base.style.left = this.base_move_info.base_org_left + event.clientX - this.base_move_info.base_click_left;
    }
  }

};