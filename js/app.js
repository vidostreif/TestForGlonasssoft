window.onload = () => {
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

  let mas = [
    { x: -10.43, y: 2 },
    { x: 3, y: 10 },
    { x: 15, y: 40 },
    { x: 25, y: 110.8 },
  ]

  //определяем минимальные и максимальные значения графика
  // let min = { x: Number.MAX_VALUE, y: Number.MAX_VALUE }
  // let max = { x: Number.MIN_VALUE, y: Number.MIN_VALUE }
  // for (let index = 0; index < mas.length; index++) {
  //   min.x = Math.min(mas[index].x, min.x)
  //   min.y = Math.min(mas[index].y, min.y)
  //   max.x = Math.max(mas[index].x, max.x)
  //   max.y = Math.max(mas[index].y, max.y)
  // }

  let indent = 40 //отступ графика от края
  let step = 30 //шаг сетки

  let canv = document.querySelector('#canvas')
  let ctx = canv.getContext('2d')

  canv.width = 800
  canv.height = 800

  // canvas.addEventListener(
  //   'mousedown',
  //   function (event) {
  //     alert('mousedown')
  //   },
  //   false
  // )

  let min = Number.MAX_VALUE
  let max = Number.MIN_VALUE
  for (let index = 0; index < mas.length; index++) {
    min = Math.min(mas[index].x, min)
    min = Math.min(mas[index].y, min)
    max = Math.max(mas[index].x, max)
    max = Math.max(mas[index].y, max)
  }

  let numberStep =
    (max - min) /
    Math.ceil(
      (Math.min(canv.width, canv.height) - indent - step - step - 10) / step
    ) //шаг чисел

  //рисуем направляющие
  ctx.fillStyle = 'black' // Задаём чёрный цвет для линий
  ctx.lineWidth = 2.0 // Ширина линии
  ctx.beginPath() // Запускает путь
  ctx.moveTo(indent, 10) // Указываем начальный путь
  ctx.lineTo(indent, canv.height - indent) // Перемешаем указатель
  ctx.lineTo(canv.width - 10, canv.height - indent) // Ещё раз перемешаем указатель
  ctx.stroke() // Делаем контур
  // ctx.fillText('0', indent - 10, canv.height - indent + 10) //0
  ctx.fillText('X', canv.width - 10, canv.height - indent + 10) //X
  ctx.fillText('Y', indent - 10, 10) //X

  // Цвет для рисования
  ctx.fillStyle = 'black'

  // Цикл для отображения значений по X
  let iterationX = 0
  for (var x = step + indent; x < canv.width - 15; x += step, iterationX++) {
    //вертикальные
    ctx.fillText(
      (min + numberStep * iterationX).toFixed(2),
      x - 10,
      canv.height - indent + 20
    )
    ctx.beginPath()
    ctx.moveTo(x, canv.height - indent + 5)
    ctx.lineTo(x, canv.height - indent)
    ctx.stroke()
  }
  // Цикл для отображения значений по Y
  let iterationY = 0
  for (var y = canv.height - indent - step; y > 15; y -= step, iterationY++) {
    ctx.fillText((min + numberStep * iterationY).toFixed(2), indent - 30, y)
    ctx.beginPath()
    ctx.moveTo(indent - 5, y)
    ctx.lineTo(indent, y)
    ctx.stroke()
  }

  //рисуем сетку
  let lastX = 0 // позиция последней линии по X
  for (var x = step + indent; x < canv.width - 15; x += step) {
    //вертикальные
    lastX = x
    ctx.beginPath()
    ctx.strokeStyle = '#7a7979'
    ctx.lineWidth = 0.5
    ctx.moveTo(x, 0)
    ctx.lineTo(x, canv.height - indent)
    ctx.closePath()
    ctx.stroke()
  }
  let lastY = 0 // позиция последней линии по Y
  for (var y = canv.height - indent - step; y > 15; y -= step) {
    //Горизонтальные
    lastY = y
    ctx.beginPath()
    ctx.moveTo(indent, y)
    ctx.lineTo(canv.width, y)
    ctx.closePath()
    ctx.stroke()
  }

  //рисуем график

  ctx.fillStyle = 'black' // Задаём чёрный цвет для линий
  ctx.lineWidth = 3.0 // Ширина линии
  let di = max - min
  let ourWidth =
    lastX - indent - step - Math.max(iterationX - iterationY, 0) * step
  let ourHeight =
    canv.height -
    indent -
    step -
    lastY -
    Math.max(iterationY - iterationX, 0) * step

  for (let index = 0; index < mas.length; index++) {
    // ctx.fillText((min + numberStep * i).toFixed(2), indent - 30, y)
    if (index < mas.length - 1) {
      ctx.beginPath()
      ctx.moveTo(
        indent + step + (mas[index].x - min) * (ourWidth / di),
        canv.height - indent - step - (mas[index].y - min) * (ourHeight / di)
      )
      ctx.lineTo(
        indent + step + (mas[index + 1].x - min) * (ourWidth / di),
        canv.height -
          indent -
          step -
          (mas[index + 1].y - min) * (ourHeight / di)
      )
      ctx.stroke()
    }
  }
  //обнуление
  // ctx.fillStyle = 'white'
  // ctx.fillRect(0, 0, canv.width, canv.height)
}
