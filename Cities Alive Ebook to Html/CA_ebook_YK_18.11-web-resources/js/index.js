(function main () {

// index to sections of the work

var divs = $('div')
var front = divs.get(2), toc = divs.get(3), body = divs.get(6), foot = divs.get(7)
console.log({front:div(front), toc:div(toc), body:div(body), foot:div(foot)})
function div (e) { return $(e).find('p').map(p) }
function p (i,e) { return e.className + ' ⇒ ' + $(e).text() }

// emit json for body pages

var contents = {title:'Contents', story:[]}
var page = {title:'Prefix', story:[]}
var site = {contents:contents}

function begin (e,f) {
  // finish one page
  page.journal = ([{type:'create', item:deepCopy(page), date:Date.now()}])
  slug = asSlug(page.title)
  site[slug] = page
  // start another
  longtitle = title = $(e).text().replace(/\d+$/,'')
  console.log('begin',longtitle)
  if (f) {
    item = {type:'markdown', id:id(), text:(f + longtitle)}
  } else {
    title = shorten(longtitle)
    longtitle = longtitle.replace(title, '[['+title+']]')
    item = {type:'paragraph', id:id(), text:(longtitle)}
  }
  contents.story.push(item)
  page = {title: title, story:[]}
}

function shorten (longtitle) {
  if (m = longtitle.match(/^(\d+\. *)?(.*?):/)) { return m[2] }
  if (m = longtitle.match(/“(.*?)”/)) { return m[1] }
  if (m = longtitle.match(/^(\d+\. *)?(.*)$/)) { return m[2] }
  return longtitle
}

function titlecase (title) {
  return title.replace(/\b([a-z])/,'\1'.toUpperCase())
}

$(body).find('p').map(para)
function para (i,e) {
  selector = e.className.match(/^([^ -]+)/)[0]
  switch (selector) {
  case 'BOOK_Titles_Section':
    begin(e,'# ')
    break
  case 'BOOK_Titles_Chapter':
    begin(e)
    break
  case 'BOOK_Titles_Photo':
    item = {type:'html', id:id(), text:('<h3>' + $(e).html() + '</h3>')}
    page.story.push(item)
    break
  case 'BOOK_BODY_Photo':
    item = {type:'html', id:id(), text:('<h5>' + $(e).html() + '</h5>')}
    page.story.push(item)
    break
  case 'BOOK_BODY_':
    item = {type:'html', id:id(), text:('<center>* * *</center>')}
    page.story.push(item)
    break
  case 'BOOK_BODY_Quotes_quote':
    var prev = page.story[page.story.length-1]
    if (prev && (m = prev.text.match(/^(.*)<\/blockquote>$/))) {
      prev.text = m[1] + "<br>" + $(e).html() + '</blockquote>'
    } else {
      item = {type:'html', id:id(), text:('<blockquote>' + $(e).html() + '</blockquote>')}
      page.story.push(item)
    }
    break
  case 'BOOK_BODY_Images_Figure':
    var img = $(e).find('img').get(0)
    item = {type:'image', id:id(), text:'No Caption', url:dataurl(img)}
    page.story.push(item)
    break
  case 'BOOK_BODY_Images_Caption':
    var prev = page.story[page.story.length-1]
    if (prev && prev.type == 'image') {
      prev.text = $(e).text()
    } else {
      item = {type:'html', id:id(), text:('<font size=-1><i>' + $(e).html() + '</i></font>')}
      page.story.push(item)
    }
    break
  case 'BOOK_BODY_Lists_list':
  case 'BOOK_BODY_footnote':
    item = {type:'html', id:id(), text:('<font size=-1>' + $(e).html() + '</font>')}
    page.story.push(item)
    break
  case 'BOOK_BODY_body':
    item = {type:'html', id:id(), text:$(e).html()}
    page.story.push(item)
    break
  case 'BREAK':
    break
  default:
    console.log(selector)
    item = {type:'html', id:id(), text:e.className + ' ⇒ ' + $(e).html()}
    page.story.push(item)    
  }
}

begin('Sufix')
var json = JSON.stringify(site, null, '  ')
download(json, 'export.json', 'text/plain')

// utility functions

function deepCopy (obj) {
  return JSON.parse(JSON.stringify(obj))
}

function id () {
  return Math.floor(Math.random()*1000000000000000).toString()
}

function asSlug (name) {
  return name
    .replace(/\s/g, '-')
    .replace(/[^A-Za-z0-9-]/g, '')
    .toLowerCase()
}

function download(text, name, type) {
  var a = document.createElement("a");
  var file = new Blob([text], {type: type});
  a.href = URL.createObjectURL(file);
  a.download = name;
  a.click();
}

/* decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 * Original source: https://github.com/fedwiki/wiki-client/blob/ad505eaf6020141ebf7bc66b87b41671aac6713a/lib/factory.coffee#L170-L189 */

const resizeImage = function(dataURL) {
  const smallEnough = src => (src.width <= 500) || (src.height <= 300);
  var squeezeSteps = function(src) {
    let cH, cW;
    if (smallEnough(src)) { return src; }
    const canvas = document.createElement('canvas');
    canvas.width = (cW = src.width / 2);
    canvas.height = (cH = src.height / 2);
    const context = canvas.getContext('2d');
    context.drawImage(src, 0, 0, cW, cH);
    return squeezeSteps(canvas);
  };
  const img = new Image;
  img.src = dataURL;
  if (smallEnough(img)) { return dataURL; }
  return squeezeSteps(img).toDataURL('image/jpeg', .5);  // medium quality encoding
};

function dataurl (src) {
  const canvas = document.createElement('canvas')
  cW = canvas.width = src.width
  cH = canvas.height = src.height
  const context = canvas.getContext('2d')
  context.drawImage(src, 0, 0, cW, cH)
  console.log('dataurl',cW, cH)
  return canvas.toDataURL('image/jpeg', .9)
}

})()