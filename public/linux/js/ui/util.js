/* UI共通の小物 */
(function () {
'use strict';
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
/* プレーンテキストを段落として出す。コードっぽい行は等幅で見せる */
function text2html(s) {
  return esc(s).split('\n').map(function (line) {
    if (/^\s{2,}\S/.test(line)) return '<code class="blk">' + bold(line.replace(/^\s+/, '')) + '</code>';
    if (line === '') return '<br>';
    return '<span class="ln">' + bold(line) + '</span>';
  }).join('');
}
/* **ここだけ強調** を太字にする。*** で囲んだ文字（*** System restart required *** など、画面に出る文言）は太字にしない */
function bold(line) {
  return line.replace(/(^|[^*])\*\*([^*]+)\*\*(?!\*)/g, '$1<strong>$2</strong>');
}
window.LFR = window.LFR || {};
window.LFR.esc = esc;
window.LFR.text2html = text2html;
})();
