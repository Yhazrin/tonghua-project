function simpleEncrypt(data, key) {
  if (\!data) return ``;
  var str = typeof data === `string` ? data : JSON.stringify(data);
  var result = ``;
  for (var i = 0; i < str.length; i++) {
    result += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return wx.arrayBufferToBase64(new Uint8Array(result.split(``).map(function(c) { return c.charCodeAt(0); })).buffer);
}

function maskPhone(phone) {
  if (\!phone || phone.length < 7) return phone;
  return phone.substr(0, 3) + `****` + phone.substr(7);
}

function maskIdCard(id) {
  if (\!id || id.length < 8) return id;
  return id.substr(0, 4) + `**********` + id.substr(id.length - 4);
}

function maskName(name) {
  if (\!name || name.length < 2) return name;
  return name.charAt(0) + `*`.repeat(name.length - 1);
}

module.exports = { simpleEncrypt: simpleEncrypt, maskPhone: maskPhone, maskIdCard: maskIdCard, maskName: maskName };
