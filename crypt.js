//---------------------------------------
// Global
//---------------------------------------



//---------------------------------------
// Function
//---------------------------------------
function generateSecurePassword(length = 16) {
  const charset = {
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lower: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()-_=+[]{}|;:,.<>?"
  };
 
  const allChars = charset.upper + charset.lower + charset.numbers + charset.symbols;
  const requiredSets = [charset.upper, charset.lower, charset.numbers, charset.symbols];
 
  // 暗号学的に安全な乱数生成
  function getRandomChar(set) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return set[array[0] % set.length];
  }
 
  // 各カテゴリから最低1文字を含める
  let passwordArray = requiredSets.map(set => getRandomChar(set));
 
  // 残りの文字をランダムに追加
  for (let i = passwordArray.length; i < length; i++) {
    passwordArray.push(getRandomChar(allChars));
  }
 
  // 配列をシャッフル（Fisher-Yatesアルゴリズム）
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = window.crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }
 
  return passwordArray.join('');
}
