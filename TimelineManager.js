//---------------------------------------
// Global
//---------------------------------------



//---------------------------------------
// Class
//---------------------------------------
/**
 * タイムライン要素制御
 */
class TimelineManager {

  /**
   * @summary コンストラクタ
   * @param Canvas領域の要素ID
   * @param 縦幅(CSSと同じ値. %,px,emなど)
   * @param 表示アイテムのフィルタ情報
   * @param 編集ポップアップオブジェクト
   * @param タスク名領域イベントコールバック {'イベント名': コールバック関数, ...}
   */
  constructor(canvas_elem_id, height, filter, edit_dialog) {
    this.canvas_elem_id = canvas_elem_id;
    this.height = height;
    this.filter = filter;
    this.edit_dialog = edit_dialog;

    this.timeline = null;         // timelineオブジェクト
    this.selected_item_id = null; // 選択アイテム

    // 表示する日付範囲
    this.past_days = 2;
    this.post_days = 8;
    // タイムライン表示更新 遅延実行時間(タイムライン上での変更操作による)
    this.REFRESH_TIMELINE_DELAY = 100;
  }

  /**
   * フィルタ情報更新
   * @param 表示アイテムのフィルタ情報
   */
  set_filter(filter) {
    this.filter = filter;
  }

  /**
   * タイムライン表示
   * @param 更新モード(all:グループ/アイテムを更新, item:アイテムのみ(グループは更新しない))
   */
  show(mode = 'all')
  {
    let groups = [];
    let items = [];

    // Timeline をアタッチするCanvas要素取得
    const container = document.getElementById(this.canvas_elem_id);

    // 表示用データ作成
    groups = groups.concat(this.make_timeline_groups(false));
    items = items.concat(this.make_timeline_items(false));

    let today = new Date(Date.now()); // 今日
    let today_str= today.getFullYear() + '/' + (today.getMonth()+1) + '/' + today.getDate();
    let date_start = new Date(today.getTime() - this.past_days * 24 * 60 * 60 * 1000);  // 前
    let range_start_str = date_start.getFullYear() + '/' + (date_start.getMonth()+1) + '/' + date_start.getDate();
    let date_end = new Date(today.getTime() + this.post_days * 24 * 60 * 60 * 1000);  // 後
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
      height: this.height,     // 縦幅 (minHeightと合わせて指定すると日付軸が固定になる)
      minHeight: this.height,  // 最大縦幅
      // onInitialDrawComplete: onTimelineShowComplete,
      editable: {
        add: false,           // ダブルクリックでアイテム追加
        updateTime: true,     // 水平方向のアイテム移動
        updateGroup: false,   // 他のグループへのアイテム移動
        remove: false,        // deleteボタンによるアイテム削除
        overrideItems: false  // item.editableの上書きの許可
      },
      // アイテム移動後のコールバック
      onMove: this.item_move_handler.bind(this)
    };

    // Create a Timeline
    if (this.timeline !== null) {
      if (mode === 'all') {
        this.timeline.setData( {groups: groups, items: items });
      } else if (mode === 'item') {
        this.timeline.setItems(items);
      }

      // 更新前に選択していたアイテムを再選択
      if (this.selected_item_id !== null) {
        this.timeline.setSelection(this.selected_item_id);
      }
    }
    else {
      this.timeline = new vis.Timeline(container, items, groups, options);

      // クリックイベント登録
      this.timeline.on('select', this.click_handler.bind(this));
      // ダブルクリックイベント登録
      this.timeline.on('doubleClick', this.dblclick_handler.bind(this));
    }
  }

  /**
   * @summary 選択
   * @param アイテムID
   */
  setSelection(id) {
    this.timeline.setSelection(id);
  }

  /**
   * @summary 削除
   */
  remove() {
    this.timeline.destroy();
    this.timeline = null;
  }

  /**
   * @summary グループデータ作成
   * @param 1グループにまとめるかどうか / true:1つのグループのみ作成 / false:該当グループ毎に作成
   * @returns グループデータ(配列) / [ {id:[Group ID], content: [グループ名], title: [tips表示内容] }, ... ]
   */
  make_timeline_groups(is_one_group) {
    let group_id_default = 'task';
    let groups = [];

    if (is_one_group) {
      // 1つのグループに全アイテムをまとめる
      groups.push( {id: group_id_default, content: 'タスク', title: 'タスク' } );
    } else {
      // グループ毎にアイテムを分ける
      let keys = get_internal_keys(this.filter, 'string');
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
   * @returns アイテムデータ(配列) / [ { group: [所属グループID], id: group.id, content: [表示名], title: [tips], start: [開始日時], end: [終了日時], type: 'range', className: 'timeline_item_group', editable: false }, ... ]
   */
  make_timeline_items(is_one_group)
  {
    let ret = [];
    let group_id_default = 'task';

    let keys = get_internal_keys(this.filter, null);
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
        if (!is_show_item_stock_list(item, this.filter)) {
          continue;
        }
        // フィルタ条件のマッチを確認
        if (item.name.toLowerCase().indexOf(this.filter.item_name.toLowerCase()) === -1) {
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







  //---------------------------------------
  // Event
  //---------------------------------------

  /**
   * @summary タイムラインアイテム 日時移動
   * @param タイムラインアイテム情報
   * @param 既定処理オブジェクト
   */
  item_move_handler(target, callback) {
    console.log(target.id, target.group, target.start);
    let item = getInternal(target.id);
    if (item !== null) {
      pushHistory();
      item.period = get_date_str(target.start, true, false, true, true);
      if (target.end !== undefined) {
        item.period_end = get_date_str(target.end, true, false, true, true);
      } else if (item.period_end !== '') {
        // タイムライン上の終了日時が空でアイテムの終了日時設定がある場合(開始日と終了日が同日のケース)
        item.period_end = item.period;
      }
    }

    // 既定の処理を流す
    callback(target);

    // リスト更新(タイムライン更新含む)
    refresh_screen('item');

    // タイムライン更新(遅延更新)
    // setTimeout(() => {
    //   this.show('item');
    // }, this.REFRESH_TIMELINE_DELAY);
  }

  /**
   * @summary タイムラインアイテム クリックハンドラ
   * @param タイムラインアイテム情報
   */
  click_handler(properties) {
    // 2回イベント発生するため、抑制 (クリックすると press, tap の2回呼ばれる)
    console.log(properties.event.type);

    if (properties.event.type !== 'tap') {
      return;
    }

    // フィルタ解除
    // set_list_filter(elem_id_list_stock, 0);
    
    // クリックしたアイテムをリスト中で選択
    if (properties.items.length > 0) {
      set_select_all_list(properties.items[0], true, true);
      // 選択アイテムを記憶
      this.selected_item_id = properties.items[0]
    } else {
      // set_select(elem_id_list_stock, -1, false, false); // 選択解除
      // 選択アイテムクリア
      this.selected_item_id = null;
    }
  }

  /**
   * @summary タイムラインアイテム ダブルクリックハンドラ
   * @param タイムラインアイテム情報
   */
  async dblclick_handler(properties) {
    if (properties.what === 'background' && properties.item === null) {
      // 空欄をクリック. アイテム作成
      let item = makeInternalItem_ex("", genItemID());
      item.period = get_date_str(properties.time, true, false, true, true);
      this.edit_dialog.show_edit_popup_single_ex(item, {top: properties.event.clientY, left: properties.event.clientX, group_id: properties.group});
    } else if (properties.what === 'group-label' && properties.group !== undefined) {
      // グループ名をダブルクリック. グループ名でフィルタ
      let group = getInternal(properties.group);
      this.filter = {group_name: '^' + RegExp.escape(group.name) + '$', item_name: ''};
      update_stock_list(this.filter);
      this.show('all');
    } else {
      // アイテム編集
      // this.edit_dialog.show_edit_popup_single(properties.item, {top: properties.event.clientY, left: properties.event.clientX});
      // this.edit_dialog.show_edit_popup_single(properties.item, {top: properties.event.center.y+20, left: properties.event.center.x});
      if (await this.edit_dialog.show_edit_popup_ex([properties.item], properties.event.center.y+20, properties.event.center.x)) {
        this.show('item');
      }
    }
  }

};