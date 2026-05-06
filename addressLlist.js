// ##############################################
// Function
// ##############################################

/**
 * @summary ボタンクリック処理
 */
function click_handler(event) {
  let index = event.target.dataset.index;
  let item = g_address_list[index];

  // アドレスコピー
  if (event.target.dataset.type === 'address') {
    if (event.shiftKey) {
      // 宛先の名前をコピー
      navigator.clipboard.writeText(getAddressNamesStr(item, g_names_separator));
      copy_animation(event.target, 'blue');
    } else {
      // 宛先コピー
      navigator.clipboard.writeText(getAddressListStr(item));
      copy_animation(event.target, 'green');
    }
  }

  // メール作成
  if (event.target.dataset.type === 'create') {
    // 入力ポップアップ表示
    // showInputPopup(item.param_input);

    // TODO: メール作成処理をpromise化

    let items_to = get_items_from_names(item.address_to_name);
    let items_cc = get_items_from_names(item.address_cc_name);
    let subject = item.subject;
    let body = item.body;

    // 置換
    // {name} → 差出人
    subject = subject.replaceAll('{name}', g_name);
    body = body.replaceAll('{name}', g_name);
    // {name_s} → 差出人(short)
    subject = subject.replaceAll('{name_s}', g_name_short);
    body = body.replaceAll('{name_s}', g_name_short);
    // {today} → 今日の日付
    let today = get_today_str(true, false, false, true);
    subject = subject.replaceAll('{today}', today);
    body = body.replaceAll('{today}', today);
    // {to_names} → 宛先の名前
    let to_names = getAddressNamesStrFromItems(items_to, g_names_separator);
    subject = subject.replaceAll('{to_names}', to_names);
    body = body.replaceAll('{to_names}', to_names);
    // {cc_names} → 宛先(CC)の名前
    if (items_cc !== null) {
      let cc_names = getAddressNamesStrFromItems(items_cc, g_names_separator);
      subject = subject.replaceAll('{cc_names}', cc_names);
      body = body.replaceAll('{cc_names}', cc_names);
    }
    // {signature} → 署名 (bodyのみ)
    body = body.replaceAll('{signature}', g_signature);

    // パラメータ入力/置換
    let param_content = [];
    if (item.param_input !== undefined && item.param_input.length > 0) {
      // 入力
      for (let i = 0; i < item.param_input.length; i++) {
        param_content[i] = prompt(item.param_input[i]);
      }
      // 置換
      for (let i = 0; i < item.param_input.length; i++) {
        subject = subject.replaceAll(`{${i}}`, param_content[i]);
        body = body.replaceAll(`{${i}}`, param_content[i]);
      }
    }

    // 宛先
    let address_to = '';
    if (items_to !== null) {
      address_to = getAddressListStrFromItems(items_to);
    }
    let address_cc = '';
    if (items_cc !== null) {
      address_cc = getAddressListStrFromItems(items_cc);
    }

    // mailto URL生成
    let url = create_mailto_url(address_to, address_cc, subject, body);
    // URLへ遷移
    open_url(url);
  }
}


/**
 * @summary 宛先アドレス一覧文字列作成
 * @param item
 * @returns 宛先アドレス一覧(文字列)
 */
function getAddressListStr(item) {
  let keys = Object.keys(item.address);
  return keys.join('; \n');
}

/**
 * @summary 宛先アドレス一覧文字列作成
 * @param item(配列)
 * @returns 宛先アドレス一覧(文字列)
 */
function getAddressListStrFromItems(items) {
  let ret = '';
  for (let i = 0; i < items.length; i++) {
    ret += getAddressListStr(items[i]);
  }
  return ret;
}

/**
 * @summary 宛先アドレスの名前一覧文字列作成
 * @param item
 * @param セパレーター
 * @returns 宛先アドレスの名前一覧(文字列)
 */
function getAddressNamesStr(item, separator=' ') {
  let keys = Object.keys(item.address);
  let names = [];
  for (let i = 0; i < keys.length; i++) {
    names.push(item.address[keys[i]]);
  }
  return names.join(separator);
}

/**
 * @summary 宛先アドレスの名前一覧文字列作成
 * @param item(配列)
 * @param セパレーター
 * @returns 宛先アドレスの名前一覧(文字列)
 */
function getAddressNamesStrFromItems(items, separator=' ') {
  let ret = '';
  for (let i = 0; i < items.length; i++) {
    ret += getAddressNamesStr(items[i], separator);
    ret += separator;
  }
  return ret;
}

/**
 * @summary nameからアイテムを検索
 * @param name属性値(配列)
 * @returns item(配列)
 */
function get_items_from_names(names) {
  let ret = [];
  for (let i = 0; i < names.length; i++) {
    for (let k = 0; k < g_address_list.length; k++) {
      if (g_address_list[k].name === names[i]) {
        ret.push(g_address_list[k]);
      }
    }
  }
  if (ret.length > 0) {
    return ret;
  }
  return null;
}

/**
 * @summary ボタン生成
 */
function createButton() {
  let elem_parent = document.getElementById('button_area');
  elem_parent.classList.add('flex-box');

  for (let field = 1; field <= g_field_number; field++) {
    let div = document.createElement('div');
    for (let i = 0; i < g_address_list.length; i++) {
      let item = g_address_list[i];
      if (item.field !== field) {
        continue;
      }

      // ボタン要素生成
      let btn = document.createElement('button');
      btn.textContent = item.name;
      if (item.type === 'address') {
        btn.title = getAddressNamesStr(item, g_names_separator);
      }
      if (item.type === 'create') {
        btn.title = item.subject + '\n------------------\n' + item.body;
      }
      btn.classList.add('btn_medium');
      btn.dataset.index = i;
      btn.dataset.type = item.type;
      btn.addEventListener('click', click_handler);
      div.appendChild(btn);
      div.appendChild(document.createElement('br'));
    }
    elem_parent.appendChild(div);
  }
}

/**
 * @summary パラメータ入力ポップアップ表示
 * @param パラメータリスト
 */
function showInputPopup(param_input) {
  // ベース作成
  let base_div = document.createElement('div');
  base_div.classList.add('popup-base');
  base_div.style.top = 500;
  base_div.style.left = 500;

  // 要素作成
  let keys = Object.keys(param_input);
  for (let i = 0; i < keys.length; i++) {
    let elem_label = document.createElement('span');
    elem_label.innerText = keys[i];
    let elem_input = document.createElement('input');
    if (param_input[keys[i]] === 'date') {
      elem_input.type = 'date';
    } else {
      elem_input.type = 'text';
    }
    elem_input.classList.add('popup-input');
    elem_input.dataset.key = keys[i];
    base_div.appendChild(elem_label);
    base_div.appendChild(elem_input);
    base_div.appendChild(document.createElement('br'));
  }
  document.body.appendChild(base_div);
}

/**
 * @summary パラメータ入力ポップアップ消去
 */
function deleteInputPopup() {
  let elem = document.getElementsByClassName('popup-base');
  if (elem.length > 0) {
    elem.remove();
  }
}



// ##############################################
// Function (Common)
// ##############################################

/**
 * @summary URL作成
 * @param TO宛先(;区切り)
 * @param CC宛先(;区切り)
 * @param 件名
 * @param 本文
 */
function create_mailto_url(address_to, address_cc, subject, body) {
  let url = 'mailto:';
  url += address_to;
  url += '?';
  if (address_cc !== null) {
    url += 'cc=' + address_cc;
    url += '&';
  }
  url += 'subject=' + subject;
  url += '&';
  url += 'body=' + body.replaceAll('\n', '%0D%0A');
  url += '&';

  return url;
}

/**
 * @summary URLを開く(別タブ)
 * @param URL
 */
function open_url(url) {
  window.open(url, '_blank');
}

/**
 * @summary コピーアニメーション(要素の色を一定時間だけ変更)
 * @param 対象要素
 * @param 色
 */
function copy_animation(elem, color) {
  // アニメーション
  let backgroundColor_org = elem.style.backgroundColor;
  elem.style.transition = undefined;
  elem.style.backgroundColor = color;

  setTimeout(() => {
    elem.style.transition = "background-color 0.5s ease-in-out";
    elem.style.backgroundColor = backgroundColor_org;
  }, 500);
}





// ##############################################
// Function (Date)
// ##############################################

/**
 * @summary 日付文字列を返す
 * @param Dateオブジェクト
 * @param 区切り記号を入れるかどうか(/, :) (true|false)
 * @param 時刻を含めるかどうか (true|false)
 * @param 年を含めるかどうか (true|false)
 * @param ゼロパディングするかどうか (true|false)
 * @param 曜日を付与するかどうか(true|false)
 * @returns 日付文字列 (yyyy/MM/dd or yyyyMMdd)
 */
function get_date_str(d, is_separate, is_include_time, is_include_year, is_zero_padding, is_add_weekday) {

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

  if (is_add_weekday === true) {
    let weekdday_str = getWeekDay(d);
    ret = ret + `(${weekdday_str})`;
  }

  if (is_include_time === true) {
    ret = ret + ` ${hour}${sep2}${minute}`;
  }

  return ret;
}

/**
 * @summary 今日の日付文字列を返す
 * @param 区切り記号を入れるかどうか(/, :)
 * @param 時刻を含めるかどうか (true|false)
 * @param 年を含めるかどうか (true|false)
 * @param 曜日を付与するかどうか(true|false)
 * @returns 日付文字列 (yyyy/MM/dd or yyyyMMdd)
 */
function get_today_str(is_separate, is_include_time, is_include_year, is_add_weekday) {
  return get_date_str(new Date(), is_separate, is_include_time, is_include_year, false, is_add_weekday);
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
 * @summary 曜日文字列を取得
 * @param 日時(Date)
 * @returns 曜日
 */
function getWeekDay(d) {
  // 曜日リスト（日曜始まり）
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  return weekdays[d.getDay()];
}






// ##############################################
// Main
// ##############################################

// ボタン生成
createButton();
