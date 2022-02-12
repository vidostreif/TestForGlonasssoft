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

  let mas1 = []
  let mas2 = []
  let mas3 = []

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

  const getTabLegth = (tabl) => {
    return tabl.querySelector('tbody').querySelectorAll('tr').length
  }

  const getTabInput = (tabl, str, vector) => {
    return tabl
      .querySelector('tbody')
      .querySelector(`#inputstr${tabl.id.slice(-1)}${str}${vector}`)
  }

  //класс отрисовки графиков
  class drawCanvas {
    constructor(canv, mas) {
      this.indent = 40 //отступ графика от края
      this.step = 30 //шаг сетки
      this.closeEnough = 20 // допустимое растояние удаленности мыши от точки изменения размера при нажатии
      this.pointOffsetX = 50 //смещение точки изменения размера X
      this.pointOffsetY = 70 //смещение точки изменения размера Y
      this.dragBR = false
      this.minSizeCanv = 150 //минимальный размер canvas
      this.canv = canv
      this.mas = mas
      this.ctx = this.canv.getContext('2d')

      this.canv.width = 500
      this.canv.height = 500

      this.mouseDown = this.mouseDown.bind(this)
      this.mouseUp = this.mouseUp.bind(this)
      this.mouseMove = this.mouseMove.bind(this)
      this.mouseOut = this.mouseOut.bind(this)

      this.canv.addEventListener('mousedown', this.mouseDown, false)
      this.canv.addEventListener('mouseup', this.mouseUp, false)
      this.canv.addEventListener('mousemove', this.mouseMove, false)
      this.canv.addEventListener('mouseout', this.mouseOut, false)

      this.draw()
    }

    //отрисовка
    draw = () => {
      let { canv, ctx, mas, indent, step } = this

      if (mas.length === 0) mas.push({ x: 0, y: 0 })
      //обнуление
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canv.width, canv.height)

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
          (Math.min(canv.width, canv.height) - indent - step - step - 15) / step
        ) //шаг чисел

      //рисуем направляющие
      ctx.fillStyle = 'black' // Задаём чёрный цвет для линий
      ctx.lineWidth = 2.0 // Ширина линии
      ctx.beginPath() // Запускает путь
      ctx.moveTo(indent, 10) // Указываем начальный путь
      ctx.lineTo(indent, canv.height - indent) // Перемешаем указатель
      ctx.lineTo(canv.width - 10, canv.height - indent) // Ещё раз перемешаем указатель
      ctx.stroke() // Делаем контур
      ctx.fillText('X', canv.width - 10, canv.height - indent + 10) //X
      ctx.fillText('Y', indent - 10, 10) //X

      // Цвет для рисования
      ctx.fillStyle = 'black'

      // Цикл для отображения значений по X
      let iterationX = 0
      for (
        var x = step + indent;
        x < canv.width - 15;
        x += step, iterationX++
      ) {
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
      for (
        var y = canv.height - indent - step;
        y > 15;
        y -= step, iterationY++
      ) {
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
      ctx.strokeStyle = '#7a1959' // Задаём цвет для линий
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
        ctx.fillText(
          mas[index].x.toFixed(2) + ' ' + mas[index].y.toFixed(2),
          indent + step + (mas[index].x - min) * (ourWidth / di),
          canv.height - indent - step - (mas[index].y - min) * (ourHeight / di)
        )
        if (index < mas.length - 1) {
          ctx.beginPath()
          ctx.moveTo(
            indent + step + (mas[index].x - min) * (ourWidth / di),
            canv.height -
              indent -
              step -
              (mas[index].y - min) * (ourHeight / di)
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

      this.drawHandles()
    }

    //зумирование
    relativeCoors = (ev) => {
      return {
        mouseX: ev.pageX - ev.target.offsetLeft,
        mouseY: ev.pageY - ev.target.offsetTop,
      }
    }

    mouseDown(e) {
      console.log(e)
      const { mouseX, mouseY } = this.relativeCoors(e)

      if (
        this.checkCloseEnough(mouseX, this.canv.width - this.pointOffsetX) &&
        this.checkCloseEnough(mouseY, this.canv.height - this.pointOffsetY)
      ) {
        this.dragBR = true
      }

      this.ctx.clearRect(0, 0, this.canv.width, this.canv.height)
      this.draw()
    }

    checkCloseEnough(p1, p2) {
      return Math.abs(p1 - p2) < this.closeEnough
    }

    mouseUp() {
      this.dragBR = false
    }

    mouseMove(e) {
      if (this.dragBR) {
        let { mouseX, mouseY } = this.relativeCoors(e)

        if (mouseX < this.minSizeCanv) mouseX = this.minSizeCanv
        if (mouseY < this.minSizeCanv) mouseY = this.minSizeCanv

        this.canv.width = mouseX + this.pointOffsetX
        this.canv.height = mouseY + this.pointOffsetY

        this.ctx.clearRect(0, 0, this.canv.width, this.canv.height)
        this.draw()
      }
    }

    mouseOut(e) {
      if (this.dragBR) {
        let { mouseX, mouseY } = this.relativeCoors(e)

        if (mouseX < this.minSizeCanv) mouseX = this.minSizeCanv
        if (mouseY < this.minSizeCanv) mouseY = this.minSizeCanv

        this.canv.width = mouseX + this.pointOffsetX
        this.canv.height = mouseY + this.pointOffsetY
        this.ctx.clearRect(0, 0, this.canv.width, this.canv.height)
        this.draw()
      }
    }

    drawCircle(x, y, radius) {
      this.ctx.fillStyle = '#FF0000'
      this.ctx.beginPath()
      this.ctx.arc(x, y, radius, 0, 2 * Math.PI)
      this.ctx.fill()
      // this.ctx.fillStyle = 'black'

      let i = 3
      let k = 1.2
      this.ctx.beginPath()
      this.ctx.strokeStyle = 'black'
      this.ctx.lineWidth = 1
      this.ctx.moveTo(x - radius / i - 2, y - radius / i + 2)
      this.ctx.lineTo(x - radius / k, y)
      this.ctx.lineTo(x - radius / i - 2, y + radius / i - 2)
      this.ctx.moveTo(x + radius / i + 2, y - radius / i + 2)
      this.ctx.lineTo(x + radius / k, y)
      this.ctx.lineTo(x + radius / i + 2, y + radius / i - 2)
      this.ctx.moveTo(x - radius / i + 2, y - radius / i - 2)
      this.ctx.lineTo(x, y - radius / k)
      this.ctx.lineTo(x + radius / i - 2, y - radius / i - 2)
      this.ctx.moveTo(x - radius / i + 2, y + radius / i + 2)
      this.ctx.lineTo(x, y + radius / k)
      this.ctx.lineTo(x + radius / i - 2, y + radius / i + 2)
      this.ctx.stroke()
    }

    drawHandles() {
      this.drawCircle(
        this.canv.width - this.pointOffsetX,
        this.canv.height - this.pointOffsetY,
        this.closeEnough
      )
    }
  }

  let canvasMas = []
  let canv1 = document.querySelector('#canvas1')
  canvasMas.push(new drawCanvas(canv1, mas1))
  let canv2 = document.querySelector('#canvas2')
  canvasMas.push(new drawCanvas(canv2, mas2))
  let canv3 = document.querySelector('#canvas3')
  canvasMas.push(new drawCanvas(canv3, mas3))

  //пробрасываем отжатие мышки во все canvas, в случае если мышку отжали вне canvas
  document.body.addEventListener(
    'mouseup',
    (e) => {
      canvasMas.forEach((canv) => canv.mouseUp())
    },
    false
  )

  drawAll = () => {
    canvasMas.forEach((canv) => canv.draw())
  }
}
