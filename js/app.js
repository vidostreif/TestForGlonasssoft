const tab1 = document.querySelector('#tab1')
const tab2 = document.querySelector('#tab2')
const tab3 = document.querySelector('#tab3')
const btnAdd1 = document.querySelector('#btnAdd1')
const btnAdd2 = document.querySelector('#btnAdd2')
const btnCalculate = document.querySelector('#btnCalculate')

btnAdd1.addEventListener('click', () => addString(tab1))
btnAdd2.addEventListener('click', () => addString(tab2))
btnCalculate.addEventListener('click', () => calculate(tab1, tab2, tab3))

const addString = (tab, withBtn = true) => {
  const num =
    'str' +
    tab.id.slice(-1) +
    (tab.querySelector('tbody').querySelectorAll('tr').length + 1)

  const newTr = document.createElement('tr')
  newTr.id = num
  newTr.innerHTML = `<td><input type="number" size="1" id="input${num}x" value="1"></td>
                    <td><input type="number" size="1" id="input${num}y" value="1"></td>`

  if (withBtn) {
    newTr.insertAdjacentHTML(
      'beforeend',
      `<td><button id="btnDel${num}">Delete</button></td>`
    )

    newTr
      .querySelector(`#btnDel${num}`)
      .addEventListener('click', () => newTr.remove())
  }

  tab.querySelector('tbody').append(newTr)
}

const calculate = (inTab1, inTab2, inTab3) => {
  const tabLegth = Math.min(getTabLegth(inTab1), getTabLegth(inTab2))

  let currentTabLegth = getTabLegth(inTab3)
  while (currentTabLegth !== tabLegth) {
    if (currentTabLegth > tabLegth) {
      inTab3
        .querySelector('tbody')
        .querySelector(
          `#str${inTab3.id.slice(-1) + currentTabLegth.toString()}`
        )
        .remove()
    } else {
      addString(inTab3, false)
    }
    currentTabLegth = getTabLegth(inTab3)
  }

  for (let index = 1; index < tabLegth + 1; index++) {
    getTabInput(inTab3, index, 'x').value =
      (Number(getTabInput(inTab1, index, 'x').value) +
        Number(getTabInput(inTab2, index, 'x').value)) /
      2
    getTabInput(inTab3, index, 'y').value =
      (Number(getTabInput(inTab1, index, 'y').value) +
        Number(getTabInput(inTab2, index, 'y').value)) /
      2
  }
}

const getTabLegth = (tabl) => {
  return tabl.querySelector('tbody').querySelectorAll('tr').length
}

const getTabInput = (tabl, str, vector) => {
  return tabl
    .querySelector('tbody')
    .querySelector(`#inputstr${tabl.id.slice(-1)}${str}${vector}`)
}
