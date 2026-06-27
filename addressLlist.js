// ##############################################
// Function
// ##############################################

/**
 * @summary ボタンクリック処理
 */
async function click_handler(event) {
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
    let input = null;
    if (Object.keys(item.param).length > 0) {
      let p = showInputPopup(item.param);
      try {
        await p.then((result) => {
          input = result;
        });
        deleteInputPopup();
      } catch {
        deleteInputPopup();
        return;
      }
    }

    let items_to = get_items_from_names(item.address_to_name);
    let items_cc = get_items_from_names(item.address_cc_name);
    let subject = item.subject;
    let body = item.body;

    // 置換
    // {company} → 差出人
    subject = subject.replaceAll('{company}', g_company);
    body = body.replaceAll('{company}', g_company);
    // {name} → 差出人
    subject = subject.replaceAll('{name}', g_name);
    body = body.replaceAll('{name}', g_name);
    // {name_s} → 差出人(short)
    subject = subject.replaceAll('{name_s}', g_name_short);
    body = body.replaceAll('{name_s}', g_name_short);
    // {today} → 今日の日付(yyyy/mm/dd)
    let today = get_today_str(true, false, true, false);
    subject = subject.replaceAll('{today}', today);
    body = body.replaceAll('{today}', today);
    // {today_w} → 今日の日付(yyyy/mm/dd(曜日))
    let today_w = get_today_str(true, false, true, true);
    subject = subject.replaceAll('{today_w}', today_w);
    body = body.replaceAll('{today_w}', today_w);
    // {today_s} → 今日の日付(mm/dd)
    let today_s = get_today_str(true, false, false, false);
    subject = subject.replaceAll('{today_s}', today_s);
    body = body.replaceAll('{today_s}', today_s);
    // {today_sw} → 今日の日付(mm/dd(曜日))
    let today_sw = get_today_str(true, false, false, true);
    subject = subject.replaceAll('{today_sw}', today_sw);
    body = body.replaceAll('{today_sw}', today_sw);
    // {to_names} → 宛先の名前
    if (items_to !== null) {
      let to_names = getAddressNamesStrFromItems(items_to, g_names_separator);
      subject = subject.replaceAll('{to_names}', to_names);
      body = body.replaceAll('{to_names}', to_names);
    }
    // {cc_names} → 宛先(CC)の名前
    if (items_cc !== null) {
      let cc_names = getAddressNamesStrFromItems(items_cc, g_names_separator);
      subject = subject.replaceAll('{cc_names}', cc_names);
      body = body.replaceAll('{cc_names}', cc_names);
    }
    // {signature} → 署名 (bodyのみ)
    body = body.replaceAll('{signature}', g_signature);

    // パラメータ入力/置換
    let cc_add = '';
    if (input !== null && Object.keys(input).length > 0) {
      // 置換
      let keys = Object.keys(input);
      for (let i = 0; i < keys.length; i++) {
        // 'cc' は宛先のCCとして使う
        if (keys[i] === 'cc') {
          cc_add = input[keys[i]];
          continue;
        }
        subject = subject.replaceAll(`{${keys[i]}}`, input[keys[i]]);
        body = body.replaceAll(`{${keys[i]}}`, input[keys[i]]);
      }
    }

    // 宛先
    let address_to = '';
    if (items_to !== null) {
      address_to = getAddressListStrFromItems(items_to);
    }
    let address_cc = '';
    if (items_cc !== null) {
      address_cc = getAddressListStrFromItems(items_cc, cc_add);
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
function getAddressListStrFromItems(items, add = '') {
  let ret = '';
  for (let i = 0; i < items.length; i++) {
    if (i > 0) {
      ret += '; \n';
    }
    ret += getAddressListStr(items[i]);
  }
  if (add !== '') {
    ret += '; \n';
    ret += add;
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
    if (i > 0) {
      ret += separator;
    }
    ret += getAddressNamesStr(items[i], separator);
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

      btn.classList.add('button-base');
      if (item.type === 'create') {
        btn.classList.add('button-mail-create');
      }
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
async function showInputPopup(param) {
  const promise = new Promise((resolve, reject) => {
    // ベース作成
    let base_div = document.createElement('div');
    base_div.classList.add('popup-base');

    // 要素作成
    let keys = Object.keys(param);
    for (let i = 0; i < keys.length; i++) {
      let param_item = param[keys[i]];
      let elem_label = document.createElement('span');
      elem_label.innerText = param_item.name;
      let elem_input = document.createElement('input');
      if (param_item.type === 'date' || param_item.type === 'date_w' || param_item.type === 'date_s' || param_item.type === 'date_sw') {
        // 日付
        elem_input.type = 'date';
        // 今日の日付を初期値として設定
        elem_input.value = new Date().toLocaleDateString('sv-SE');  // スウェーデン語を指定すると yyyy-mm-dd 形式になる。
      } else if (param_item.type === 'string') {
        // テキスト
        elem_input.type = 'text';
      }
      elem_input.classList.add('popup-input');
      elem_input.dataset.key = keys[i];
      elem_input.dataset.type = param_item.type;
      if (param_item.default !== undefined) {
        elem_input.value = param_item.default;
      }
      base_div.appendChild(elem_label);
      base_div.appendChild(elem_input);
      base_div.appendChild(document.createElement('br'));
    }
    // OK / Cancelボタン
    let elem_button_ok = document.createElement('button');
    elem_button_ok.innerText = 'OK';
    elem_button_ok.addEventListener('click', function() { 
      // OKボタンの処理
      // 入力パラメータを収集
      let ret = {};
      let elems_input = document.getElementsByClassName('popup-input');
      for (let i = 0; i < elems_input.length; i++) {
        let value = elems_input[i].value.trim();
        if (elems_input[i].dataset.type === 'date') {
          value = get_date_str(new Date(value), true, false, true, false, false);
        } else if (elems_input[i].dataset.type === 'date_w') {
          value = get_date_str(new Date(value), true, false, true, false, true);
        // } else if (elems_input[i].dataset.type === 'date_dot') {
        //   value = value.replaceAll('-', '.');
        } else if (elems_input[i].dataset.type === 'date_s') {
          value = get_date_str(new Date(value), true, false, false, false, false);
        } else if (elems_input[i].dataset.type === 'date_sw') {
          value = get_date_str(new Date(value), true, false, false, false, true);
        // } else if (elems_input[i].dataset.type === 'date_s_dot') {
        //   let s = value.split('-');
        //   value = `${s[1]}.${s[2]}`;
        }
        ret[elems_input[i].dataset.key] = value;
      }
      resolve(ret);
    });
    base_div.appendChild(elem_button_ok);

    let elem_button_cancel = document.createElement('button');
    elem_button_cancel.innerText = 'Cancel';
    elem_button_cancel.addEventListener('click', function() { 
      // Cancelボタンの処理
      reject()
    });
    base_div.appendChild(elem_button_cancel);

    // bodyへ追加
    document.body.appendChild(base_div);

    // 最初の入力要素へフォーカス移動
    document.getElementsByClassName('popup-input')[0].focus();

    // 画面中央に表示
    moveCenter(base_div);

  });

  return promise;
}

/**
 * @summary パラメータ入力ポップアップ消去
 */
function deleteInputPopup() {
  let elem = document.getElementsByClassName('popup-base');
  if (elem.length > 0) {
    elem[0].remove();
  }
}

function moveCenter(elem) {
  let top = window.innerHeight / 2 - elem.clientHeight / 2;
  let left = window.innerWidth / 2 - elem.clientWidth / 2;
  elem.style.top = top;
  elem.style.left = left;
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
  if (address_cc !== '') {
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
