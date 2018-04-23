/* STARS */

const root = document.querySelector('header')
const leaf = document.createElement('div')
leaf.setAttribute('class', 'starroot')
root.insertBefore(leaf, root.firstChild)

const addStar = (x, y, size = 0.5, el = leaf) => {
  let star = document.createElement('div')
  star.setAttribute('class', 'star')
  star.style.right = (100 - x) + '%'
  star.style.top = y / size + 'em'
  star.style.fontSize = size + 'em'
  el.appendChild(star)
}

const n = 5
for (let i = 1, maxX = [100, 100], x; i < n; i++) {
  for (let j = 1; j < n - ~~(i / 2); j++) {
    x = Math.min(j * 100 / n + i * 50 / n +
                 (Math.random() - 0.5) * 40 / n,
                 maxX[i % 2] - Math.random())
    addStar(x, (i - Math.random() * 0.5) * 2.5,
            1 - 0.1 * (i + 2 * Math.random()))
  }
  maxX[i % 2] = x
}

document.addEventListener('scroll', (e) => {
  let offset = window.pageYOffset * 0.5
  leaf.style.marginTop = offset + 'px'
  leaf.style.marginBottom = -offset + 'px'
})

/* HORIZONTAL SCROLL */
let scrolljack = []
for (let root of document.querySelectorAll('[data-scroll-x="1"]')) {
  root.style.flexWrap = 'nowrap'
  const pseudos = [root.cloneNode(true), 
                   root.cloneNode(true)]

  for (let e of pseudos) e.setAttribute('class', e.getAttribute('class') + ' fixwidth')

  pseudos[0].style.position = 'absolute'
  pseudos[0].style.overflowX = 'visible'
  pseudos[0].style.paddingLeft = '9999px'
  pseudos[0].style.marginLeft = '-9999px'
  pseudos[0].style.paddingRight = '9999px'
  document.body.style.overflowX = 'hidden'

  // const fakeChild = document.createElement('div')
  // fakeChild.innerHTML = '&nbsp;'
  // fakeChild.style.width = root.scrollWidth + 'px'
  // fakeChild.style.height = root.scrollHeight + 'px'
  // pseudos[1].style.display = 'block'
  pseudos[1].style.overflowX = 'scroll'
  // pseudos[1].appendChild(fakeChild)
  pseudos[1].addEventListener('scroll', (e) => {
    pseudos[0].style.marginLeft = (-9999 - pseudos[1].scrollLeft) + 'px'
  })

  pseudos[0].setAttribute('data-scroll-hook', '2')
  pseudos[1].setAttribute('data-scroll-hook', '1')

  root.innerHTML = ''
  root.style.display = 'block'
  root.appendChild(pseudos[0])
  root.appendChild(pseudos[1])

  scrolljack = [pseudos[1]]
}

if (scrolljack) {
  let scrolljackCallback = (prop, threshold, inv = 1, mul = 1) => e => {
    for (const t of scrolljack) {
      console.log(
        [e.pageY >= t.offsetTop, e.pageY <= t.offsetTop + t.offsetHeight],
        [e[prop] * inv <= -threshold * inv, t.scrollLeft + t.offsetWidth < t.scrollWidth],
        [e[prop] * inv >= threshold * inv, t.scrollLeft > 0])
      if (e.pageY >= t.offsetTop && e.pageY <= t.offsetTop + t.offsetHeight) {
        if (e[prop] * inv <= -threshold * inv && t.scrollLeft + t.offsetWidth < t.scrollWidth) {
          t.scrollBy(-e[prop] * inv * mul, 0)
          e.preventDefault()
        }
        if (e[prop] * inv >= threshold * inv && t.scrollLeft > 0) {
          t.scrollBy(-e[prop] * inv * mul, 0)
          e.preventDefault()
        }

        return
      }
    }
  }

  if ('onmousewheel' in document) document.body.addEventListener('mousewheel', scrolljackCallback('wheelDeltaY', 120))
  else document.body.addEventListener('DOMMouseScroll', scrolljackCallback('detail', 1, -1, 24))
}

/* FILTER */
const filterRoot = document.querySelector('[data-filterable="1"]#repos')
const sel = document.createElement('select')
if (filterRoot && window.data && ('selectedOptions' in sel)) { 
  const header = filterRoot.querySelector('.header-row')

  const opt = document.createElement('option')
  opt.innerHTML = 'All'
  sel.appendChild(opt)

  for (let key0 in window.data) {
    const group = document.createElement('optgroup')
    for (let key1 in window.data[key0]) {
      const opt = document.createElement('option')
      opt.setAttribute('data-filter-key', key0)
      opt.setAttribute('data-filter-value', key1)
      opt.innerHTML = window.data[key0][key1]
      group.appendChild(opt)
    }
    sel.appendChild(group)
  }
  header.appendChild(sel)

  sel.addEventListener('change', e => {
    let opt = sel.selectedOptions[0]

    for (let el of filterRoot.querySelectorAll('[data-filtered="1"]')) {
      el.setAttribute('data-filtered', '0')
      el.style.display = 'unset'
    }

    const key = opt.getAttribute('data-filter-key')
    const value = opt.getAttribute('data-filter-value')
    if (key !== null) {
      for (let el of filterRoot.querySelectorAll(`[data-${key}]:not([data-${key}="${value}"]), [data-filter="_always"]`)) {
        el.setAttribute('data-filtered', '1')
        el.style.display = 'none'
      }
    }
  })
}