// https://qiita.com/kan_dai/items/b1850750b883f83b9bee


// ##############################################
// Values
// ##############################################

// 設定
const config = {
  prev: 2,  // 先月以前の表示月数
  show: 30, // 次月以降の表示月数
}

// 週のテーブル
const weeks = ['日', '月', '火', '水', '木', '金', '土']

// 休日(24年度)
const holidays = [
  '2024/12/27',
  '2024/12/28',
  '2024/12/29',
  '2024/12/30',
  '2024/12/31',
  '2025/1/1',
  '2025/1/2',
  '2025/1/3',
  '2025/1/4',
  '2025/1/5',
]





// ##############################################
// Function(Common)
// ##############################################

// イベント登録
function registerEvent() {
  // カレンダー内のクリックイベント登録
  document.addEventListener("click", function(e) {
    if(e.target.classList.contains("calendar_td")) {
      let date_str = e.target.dataset.date;
      copy_animation(e.target);
      copyToClipboard(date_str);
    }
  })
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

// クリップボードへコピー
function copyToClipboard(text)
{
  navigator.clipboard.writeText(text);
}

// 日を増減する
function addDays(target_date, days, exclude_weekend)
{
  let d = new Date(target_date.getTime() + days * 24 * 60 * 60 * 1000);

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

// ゼロパディング(2桁)
function zeroPadding(num) {
    return ( '00' + num ).slice( -2 );
}






// ##############################################
// Function
// ##############################################

/**
 * @summary カレンダー表示
 * @param 開始年
 * @param 開始月
 * @param 表示する月数
 */
function showCalendar(year, month, month_count, today_str) {
  for ( i = 0; i < month_count; i++) {
    const calendarHtml = createCalendar(year, month, today_str);
    const sec = document.createElement('section');
    sec.innerHTML = calendarHtml;
    document.querySelector('#calendar').appendChild(sec);

    month++
    if (month > 12) {
      year++;
      month = 1;
    }
  }
}

/** 
 * カレンダーテーブル作成　(指定月)
 * @summary カレンダー表示
 * @param 年
 * @param 月
 * @param 今日の年月日 (ex 2024/1/1)
 */
function createCalendar(year, month, today_str) {
  const startDate = new Date(year, month - 1, 1); // 月の最初の日を取得
  const endDate = new Date(year, month,  0); // 月の最後の日を取得
  const endDay = endDate.getDate(); // 月の末日
  const lastMonthEndDate = new Date(year, month - 1, 0); // 前月の最後の日の情報
  const lastMonthEndDay = lastMonthEndDate.getDate(); // 前月の末日
  const startDay = startDate.getDay(); // 月の最初の日の曜日を取得
  let dayCount = 1; // 日にちのカウント
  let calendarHtml = ''; // HTMLを組み立てる変数

  // 年/月のテキスト色を替える
  let h1_class = 'even_month';
  let year_tmp = year;
  if (month >= 1  && month <= 3) {
    // 1-3月は前年扱い(年度のため)
    year_tmp = year - 1;
  }
  if (year_tmp % 2) {
    h1_class = 'odd_month';
  }
  calendarHtml += `<h1 class="${h1_class}">${year}/${month}</h1>`;
  calendarHtml += '<table>';

  // 曜日の行を作成
  for (let i = 0; i < weeks.length; i++) {
    calendarHtml += '<td>' + weeks[i] + '</td>';
  }

  // 週を回す(1〜6週目)
  for (let week = 0; week < 6; week++) {
    calendarHtml += '<tr>';

    // 曜日を回す (日〜土)
    for (let week_day = 0; week_day < 7; week_day++) {
      let ret = get_day_status(week, year, month, dayCount, week_day, startDay, endDay, today_str);
      let day = 0;
      let attr_data = '';
      if (ret.is_prev_month) {
        // 1行目 かつ 前月の日
        day = lastMonthEndDay - startDay + week_day + 1;
      } else if (ret.is_next_month) {
        // 次の月
        day = dayCount - endDay;
        dayCount++;
      } else {
        // 月内の日
        day = dayCount;
        attr_data = `${year}/${month}/${day}(${weeks[week_day]})`;
        dayCount++
      }
      calendarHtml += `<td class="${ret.classes}" data-date=${attr_data}>${day}</td>`
    }
    calendarHtml += '</tr>'
  }
  calendarHtml += '</table>'

  return calendarHtml
}


/**
 * @summary 日毎のステータスを取得
 * @param 週番号(0-)
 * @param 対象日の年
 * @param 対象日の月
 * @param 対象日の日
 * @param 対象日の曜日(0-6)
 * @param 対象月の最初の曜日
 * @param 対象月の終了日
 * @returns dict { class_name: [クラス], is_prev_month: true|false, is_next_month: true|false }
 */
function get_day_status(week, year, month, day, weekDay, startWeekDay, endDay, today_str) {
  let class_name = '';
  let is_prev_month = false;
  let is_next_month = false;

  if (week == 0 && weekDay < startWeekDay) {
    // 1行目 かつ 前月の日
    class_name = 'is-disabled';
    is_prev_month = true;
  } else if (day > endDay) {
    // 月末日以降
    class_name = 'is-disabled';
    is_next_month = true;
  } else {
    // 月内の日
    class_name = "calendar_td";
    if (today_str === `${year}/${month}/${day}`){
      // 本日
      class_name += ' is-today';
    }
    if (holidays.includes(`${year}/${month}/${day}`)){
      // 休日
      class_name += ' is-holiday';
    }
  }
  return { classes: class_name, is_prev_month: is_prev_month, is_next_month: is_next_month };
}




// ##############################################
// Main
// ##############################################

const date = new Date()
const today_str = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
const year = date.getFullYear()
const month = date.getMonth() + 1 - config.prev;

// カレンダー表示
showCalendar(year, month, config.show, today_str);
// クリックイベント登録
registerEvent();
