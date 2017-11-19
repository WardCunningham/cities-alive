(function main () {

// index to sections of the work

var divs = $('div')
var front = divs.get(2), toc = divs.get(3), body = divs.get(6), foot = divs.get(7)
console.log({front:div(front), toc:div(toc), body:div(body), foot:div(foot)})
function div (e) { return $(e).find('p').map(p) }
function p (i,e) { return e.className + ' ⇒ ' + $(e).text() }

// emit json for body pages

var index = {title:'Index', story:[]}
var page = {title:'Prefix', story:[]}
var site = {index:index}

function begin (e) {
  title = $(e).text()
  page.journal = ([{type:'create', item:deepCopy(page), date:Date.now()}])
  slug = asSlug(page.title)
  site[slug] = page
  page = {title: title, story:[]}
  item = {type:'paragraph', id:id(), text:e.className + ' ⇒ [[' + title + ']]'}
  index.story.push(item)    
}

$(body).find('p').map(para)
function para (i,e) {
  switch (e.className) {
  case 'BOOK_Titles_Section-subtitle':
    begin(e)
    break
  case 'BOOK_Titles_Chapter-title':
  case 'BOOK_Titles_Chapter-Intro--etc':
    begin(e)
    break
  default:
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

})()