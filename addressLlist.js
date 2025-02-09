
// ##############################################
// Values
// ##############################################

// const g_address_list = [];





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

  for (let i = 0; i < g_address_list.length; i++) {
    let item = g_address_list[i];
    let btn = document.createElement('button');
    btn.textContent = item.name;
    btn.value = item.address.join('; ');
    btn.dataset.names = item.names.join(' ');
    btn.classList.add('btn_medium');
    btn.addEventListener('click', copyAddress);
    elem_parent.appendChild(btn);
    elem_parent.appendChild(document.createElement('br'));
  }
}




// ##############################################
// Main
// ##############################################

// ボタン生成
createButton();
