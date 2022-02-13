// Крыгин Сергей Сергеевич 13.02.2022
// Код выполняет поставленные в двух пунктах задачи,
// так же реализовано "растягивание" с помощью передвижения зеленого круга мышкой

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

  // массивы для удобства передачи данных в canvas
  let mas1 = []
  let mas2 = []
  let mas3 = []

  // добавление строки в таблицу
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
        .addEventListener('click', () => removeString(tab, newTr))
    }

    tab.querySelector('tbody').append(newTr)
  }

  // удаление строки
  const removeString = (tab, tr) => {
    // индекс удаляемой строки
    const iStr = tr.id.slice(-1) - 1
    tr.remove()

    const allStr = tab.querySelector('tbody').querySelectorAll('tr')
    for (let i = iStr; i < allStr.length; i++) {
      // переименовываем строку
      allStr[i].id = allStr[i].id.slice(0, -1) + (i + 1)
      // переименовываем поля ввода
      const allInput = allStr[i].querySelectorAll('input')
      for (const input of allInput) {
        input.id = input.id.slice(0, -2) + (i + 1) + input.id.slice(-1)
      }
      // переименовываем кнопку удаления
      const button = allStr[i].querySelector('button')
      if (button) {
        button.id = button.id.slice(0, -1) + (i + 1)
      }
    }
  }

  // расчет и передача данных в canvas
  const calculate = (inTab1, inTab2, inTab3) => {
    const tab1Legth = getTabLegth(inTab1)
    const tab2Legth = getTabLegth(inTab2)
    const tab3Legth = Math.min(tab1Legth, tab2Legth)

    mas1.length = 0
    mas2.length = 0
    mas3.length = 0

    let currentTabLegth = getTabLegth(inTab3)
    while (currentTabLegth !== tab3Legth) {
      if (currentTabLegth > tab3Legth) {
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

    for (let index = 1; index < tab1Legth + 1; index++) {
      const x = Number(getTabInput(inTab1, index, 'x').value)
      const y = Number(getTabInput(inTab1, index, 'y').value)
      mas1.push({ x, y })
    }

    for (let index = 1; index < tab2Legth + 1; index++) {
      const x = Number(getTabInput(inTab2, index, 'x').value)
      const y = Number(getTabInput(inTab2, index, 'y').value)
      mas2.push({ x, y })
    }

    for (let index = 1; index < tab3Legth + 1; index++) {
      const x =
        (Number(getTabInput(inTab1, index, 'x').value) +
          Number(getTabInput(inTab2, index, 'x').value)) /
        2
      const y =
        (Number(getTabInput(inTab1, index, 'y').value) +
          Number(getTabInput(inTab2, index, 'y').value)) /
        2
      mas3.push({ x, y })

      getTabInput(inTab3, index, 'x').value = x
      getTabInput(inTab3, index, 'y').value = y
    }

    drawAll()
  }

  // получить количество строк в таблице
  const getTabLegth = (tabl) => {
    return tabl.querySelector('tbody').querySelectorAll('tr').length
  }

  // получить input из таблицы
  const getTabInput = (tabl, str, vector) => {
    return tabl
      .querySelector('tbody')
      .querySelector(`#inputstr${tabl.id.slice(-1)}${str}${vector}`)
  }

  // класс отрисовки графиков
  class drawCanvas {
    constructor(canv, mas) {
      this.indent = 40 // отступ графика от края
      this.step = 30 // шаг сетки
      this.resizeCircleSize = 20 // размер круга изменения размера
      this.resizeCircleOffsetX = 50 // смещение точки изменения размера X
      this.resizeCircleOffsetY = 70 // смещение точки изменения размера Y
      this.drag = false
      this.minSizeCanv = 150 // минимальный размер canvas
      this.canv = canv
      this.mas = mas // массив данных
      this.ctx = this.canv.getContext('2d')

      this.canv.width = 400 // стартовая ширина
      this.canv.height = 400 // стартовая высота

      this.mouseDown = this.mouseDown.bind(this)
      this.mouseUp = this.mouseUp.bind(this)
      this.mouseMove = this.mouseMove.bind(this)

      this.canv.addEventListener('mousedown', this.mouseDown, false)
      this.canv.addEventListener('mouseup', this.mouseUp, false)
      this.canv.addEventListener('mousemove', this.mouseMove, false)

      this.draw()
    }

    // отрисовка
    draw = () => {
      const { canv, ctx, mas, indent, step } = this
      const indPlusStep = step + indent
      const width = canv.width
      const height = canv.height

      // если пустой массив
      if (mas.length === 0) mas.push({ x: 0, y: 0 })

      // обнуление
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, width, height)

      // вычисляем минимальное и максимальное число в переданных данных
      let min = Number.MAX_VALUE
      let max = Number.MIN_VALUE
      for (let index = 0; index < mas.length; index++) {
        min = Math.min(mas[index].x, mas[index].y, min)
        max = Math.max(mas[index].x, mas[index].y, max)
      }

      // шаг чисел
      let numberStep =
        (max - min) /
        Math.ceil((Math.min(width, height) - indPlusStep - step - 15) / step)

      // рисуем направляющие
      ctx.fillStyle = 'black'
      ctx.lineWidth = 2.0
      ctx.beginPath()
      ctx.moveTo(indent, 10)
      ctx.lineTo(indent, height - indent)
      ctx.lineTo(width - 10, height - indent)
      ctx.stroke()
      ctx.font = '12px Georgia'
      ctx.fillText('X', width - 10, height - indent + 10) //X
      ctx.fillText('Y', indent - 10, 10) //Y
      ctx.font = '10px Verdana'

      // цикл для отображения значений по X
      let iterX = 0 // количество отрисованных значений X
      for (let x = indPlusStep; x < width - 15; x += step, iterX++) {
        ctx.fillText(
          (min + numberStep * iterX).toFixed(2),
          x - 10,
          height - indent + (iterX % 2 === 0 ? 20 : 30)
        )
        ctx.beginPath()
        ctx.moveTo(x, height - indent + 5)
        ctx.lineTo(x, height - indent)
        ctx.stroke()
      }

      // цикл для отображения значений по Y
      let iterY = 0 // количество отрисованных значений Y
      for (let y = height - indPlusStep; y > 15; y -= step, iterY++) {
        ctx.fillText((min + numberStep * iterY).toFixed(2), indent - 35, y)
        ctx.beginPath()
        ctx.moveTo(indent - 5, y)
        ctx.lineTo(indent, y)
        ctx.stroke()
      }

      // рисуем сетку
      let lastX = 0 // позиция последней линии по X
      for (let x = indPlusStep; x < width - 15; x += step) {
        // вертикальные
        lastX = x
        ctx.beginPath()
        ctx.strokeStyle = '#7a7979'
        ctx.lineWidth = 0.5
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height - indent)
        ctx.closePath()
        ctx.stroke()
      }
      let lastY = 0 // позиция последней линии по Y
      for (let y = height - indPlusStep; y > 15; y -= step) {
        // горизонтальные
        lastY = y
        ctx.beginPath()
        ctx.moveTo(indent, y)
        ctx.lineTo(width, y)
        ctx.closePath()
        ctx.stroke()
      }

      // рисуем график
      ctx.strokeStyle = '#7a1959' // задаём цвет для линий
      ctx.fillStyle = '#7a1929' // задаём цвет для подписей
      ctx.font = '16px Georgia'
      ctx.lineWidth = 3.0 // ширина линии
      let di = max - min // рабочий диапазон
      let ourWidth = lastX - indPlusStep - Math.max(iterX - iterY, 0) * step // рабочий диапазон по ширине в px
      let ourHeight =
        height - indPlusStep - lastY - Math.max(iterY - iterX, 0) * step // рабочий диапазон по высоте в px

      for (let index = 0; index < mas.length; index++) {
        // вычисляем координаты точки
        const x = indPlusStep + (mas[index].x - min) * (ourWidth / di)
        const y = height - indPlusStep - (mas[index].y - min) * (ourHeight / di)
        // рисуем точку
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, 2 * Math.PI)
        ctx.fill()
        // подписываем
        ctx.fillText((index + 1).toString(), x + 5, y - 5)
        // если есть следующая точка, то рисуем линию к ней
        if (index < mas.length - 1) {
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(
            indPlusStep + (mas[index + 1].x - min) * (ourWidth / di),
            height - indPlusStep - (mas[index + 1].y - min) * (ourHeight / di)
          )
          ctx.stroke()
        }
      }

      this.drawHandles()
    }

    // зумирование
    relativeCoors = (ev) => {
      return {
        mouseX: ev.pageX - this.canv.offsetLeft,
        mouseY: ev.pageY - this.canv.offsetTop,
      }
    }

    mouseDown(e) {
      const { mouseX, mouseY } = this.relativeCoors(e)
      // если попали в круг изменения размера
      if (
        this.checkCloseEnough(
          mouseX,
          this.canv.width - this.resizeCircleOffsetX
        ) &&
        this.checkCloseEnough(
          mouseY,
          this.canv.height - this.resizeCircleOffsetY
        )
      ) {
        this.drag = true
      }

      this.draw()
    }

    checkCloseEnough(p1, p2) {
      return Math.abs(p1 - p2) < this.resizeCircleSize
    }

    mouseUp() {
      this.drag = false
    }

    mouseMove(e) {
      if (this.drag) {
        let { mouseX, mouseY } = this.relativeCoors(e)

        if (mouseX < this.minSizeCanv) mouseX = this.minSizeCanv
        if (mouseY < this.minSizeCanv) mouseY = this.minSizeCanv

        this.canv.width = mouseX + this.resizeCircleOffsetX
        this.canv.height = mouseY + this.resizeCircleOffsetY

        this.draw()
      }
    }

    drawCircle(x, y, radius) {
      // рисуем круг изменения размера
      this.ctx.fillStyle = 'rgba(0, 255, 0, 0.6)'
      this.ctx.beginPath()
      this.ctx.arc(x, y, radius, 0, 2 * Math.PI)
      this.ctx.fill()

      // рисуем стрелки в круге
      let i = 3
      let k = 1.2
      let u = 2
      this.ctx.beginPath()
      this.ctx.strokeStyle = 'black'
      this.ctx.lineWidth = 1
      this.ctx.moveTo(x - radius / i - u, y - radius / i + u)
      this.ctx.lineTo(x - radius / k, y)
      this.ctx.lineTo(x - radius / i - u, y + radius / i - u)
      this.ctx.moveTo(x + radius / i + u, y - radius / i + u)
      this.ctx.lineTo(x + radius / k, y)
      this.ctx.lineTo(x + radius / i + u, y + radius / i - u)
      this.ctx.moveTo(x - radius / i + u, y - radius / i - u)
      this.ctx.lineTo(x, y - radius / k)
      this.ctx.lineTo(x + radius / i - u, y - radius / i - u)
      this.ctx.moveTo(x - radius / i + u, y + radius / i + u)
      this.ctx.lineTo(x, y + radius / k)
      this.ctx.lineTo(x + radius / i - u, y + radius / i + u)
      this.ctx.stroke()
    }

    drawHandles() {
      this.drawCircle(
        this.canv.width - this.resizeCircleOffsetX,
        this.canv.height - this.resizeCircleOffsetY,
        this.resizeCircleSize
      )
    }
  }

  // создаем массив canvas
  let canvasMas = []
  let canv1 = document.querySelector('#canvas1')
  canvasMas.push(new drawCanvas(canv1, mas1))
  let canv2 = document.querySelector('#canvas2')
  canvasMas.push(new drawCanvas(canv2, mas2))
  let canv3 = document.querySelector('#canvas3')
  canvasMas.push(new drawCanvas(canv3, mas3))

  // пробрасываем отжатие мышки во все canvas, в случае если мышку отжали вне canvas
  window.addEventListener(
    'mouseup',
    (e) => {
      canvasMas.forEach((canv) => canv.mouseUp())
    },
    false
  )

  // пробрасываем движение мышки во все canvas, в случае если мышка во время ресайза вышла за пределы canvas
  window.addEventListener(
    'mousemove',
    (e) => {
      canvasMas.forEach((canv) => canv.mouseMove(e))
    },
    false
  )

  // отрисовка всех canvas
  drawAll = () => {
    canvasMas.forEach((canv) => canv.draw())
  }
}
