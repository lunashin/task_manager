
// ##############################################
// Values
// ##############################################

// const g_address_list = [];

// field number
const field_number = 3;




// ##############################################
// Function(Common)
// ##############################################







// ##############################################
// Function
// ##############################################

/**
 * @summary ボタンクリック時のコピー
 */
function copyAddress(event) {
  if (event.shiftKey) {
    navigator.clipboard.writeText(event.target.dataset.names);
    copy_animation(event.target, 'blue');
  } else {
    navigator.clipboard.writeText(event.target.value);
    copy_animation(event.target, 'green');
  }
}

// コピーアニメーション
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


/**
 * @summary ボタン生成
 */
function createButton() {
  let elem_parent = document.getElementById('button_area');
  elem_parent.classList.add('flex-box');

  for (let field = 1; field <= field_number; field++) {
    let div = document.createElement('div');
    for (let i = 0; i < g_address_list.length; i++) {
      let item = g_address_list[i];
      if (item.field !== field) {
        continue;
      }
      // ボタン要素生成
      let btn = document.createElement('button');
      btn.textContent = item.name;
      let keys = Object.keys(item.address);
      btn.value = keys.join('; \n');
      let names = [];
      for (let k = 0; k < keys.length; k++) {
        names.push(item.address[keys[k]]);
      }
      btn.dataset.names = names.join(' ');
      btn.title = names.join(' ');
      btn.classList.add('btn_medium');
      btn.addEventListener('click', copyAddress);
      div.appendChild(btn);
      // elem_parent.appendChild(btn);
      div.appendChild(document.createElement('br'));
    }
    elem_parent.appendChild(div);
  }
}




// ##############################################
// Main
// ##############################################

// ボタン生成
createButton();
