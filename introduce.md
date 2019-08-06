# 用键盘8个键演奏一首蒲公英的约定送给996的自己或月亮代表我的心给七夕的她

用键盘8个键演奏一首蒲公英的约定送给996的自己或月亮代表我的心给七夕的她，非常简单~

这个项目仅仅用了几个简单的前端技术实现，献给每一位挚爱音乐的代码家🎹

先放上项目的演示地址：[https://wscats.github.io/piano/build/](https://wscats.github.io/piano/build/)

和源代码地址：[https://github.com/Wscats/piano](https://github.com/Wscats/piano)

如果你喜欢或者对你有帮助，给我点个赞支持下吧😊

# 简单乐理知识

首先我们先补习点音乐基础，提前收集好最基本的[钢琴单音素材](https://github.com/Wscats/piano/tree/master/public/samples/piano)，每个音符对应一份`.mp3`文件，用一个对象记录起来，类似下面这样，举个例子这里的`A`指的是`CDEFGAB`音名中`A`也就是`Sol`，这是最基本的乐理，有没有让你想起小时候上音乐课，画板上的五线谱。

```js
export default {
  A2: "./samples/piano/a54.mp3",
  A3: "./samples/piano/a69.mp3",
  A4: "./samples/piano/a80.mp3",
  A5: "./samples/piano/a74.mp3",
  A6: "./samples/piano/a66.mp3",
  'A#3': "./samples/piano/b69.mp3",
  'A#4': "./samples/piano/b80.mp3",
  'A#5': "./samples/piano/b74.mp3",
  'A#6': "./samples/piano/b66.mp3",
  // other... 
}
```

当然这里我们使用数字来等价替代，降低初学者的难度，看下表`1`等价于`C`中音也就是`Do`，由于很多歌都会用到钢琴更密集的中间部分按键，所以我们默认中音对应数字键：

> `1 === C4 === Do`

|数字键|1|2|3|4|5|6|7|
|-|-|-|-|-|-|-|-|
|音名|C4|D4|E4|F4|G4|A4|B4|
|音符|Do|Re|Mi|Fa|Sol|La|Si|

这里专门制作一张图方便我们理解：

<img src="./public/keys.png" />

当然实际情况还有全音和半音的区分，比如`A`的半音就是`A#`，还有中音，高音和倍高音，我们这里用`A4`表示中音，`A5`表示高音，`A6`表示倍高音，所以表格可以继续整理得更清晰，当我们要弹奏中音`A4`，只需要按键盘上的数字键`6`，如果要弹奏高音`A5`，只需要用组合键`Option+6`，我们只需要举一反三，就可以知道每个音符对应的键盘按键。

|||||||||
|-|-|-|-|-|-|-|-|
|倍低音|C2|D2|E2|F2|G2|A2|B2|
|Shift键+(1-7)|Shift+1|Shift+2|Shift+3|Shift+4|Shift+5|Shift+6|Shift+7|
|低音|C3|D3|E3|F3|G3|A3|B3|
|Ctrl键+(1-7)|Ctrl+1|Ctrl+2|Ctrl+3|Ctrl+4|Ctrl+5|Ctrl+6|Ctrl+7|
|中音|C4|D4|E4|F4|G4|A4|B4|
|数字键1-7|1|2|3|4|5|6|7|
|高音|C5|D5|E5|F5|G5|A5|B5|
|Option键+(1-7)|Option+1|Option+2|Option+3|Option+4|Option+5|Option+6|Option+7|
|倍高音|C6|D6|E6|F6|G6|A6|B6|
|Command键+(1-7)|Command+1|Command+2|Command+3|Command+4|Command+5|Command+6|Command+7|
|音符|Do|Re|Mi|Fa|Sol|La|Si|

上面是全音表，这里附上半音表：

|||||||
|-|-|-|-|-|-|
|倍低半音|C#2|D#2|F#2|G#2|A#2|
|Shift+|Shift+q|Shift+w|Shift+e|Shift+r|Shift+t|
|低半音|C#3|D#3|F#3|G#3|A#3|
|Ctrl+|Ctrl+q|Ctrl+w|Ctrl+e|Ctrl+r|Ctrl+t|
|中半音|C#4|D#4|F#4|G#4|A#4|
|字母键|q|w|e|r|t|
|高半音|C#5|D#5|F#5|G#5|A#5|
|Option+|Option+q|Option+w|Option+e|Option+r|Option+t|
|倍高半音|C#6|D#6|F#6|G#6|A#6|
|Command+|Command+q|Command+w|Command+e|Command+r|Command+t|

那么我们现在只需要用键盘上的5个`字母键(q,w,e,r,t)` + 4个`功能键(Shift,Control,Option和Command)` + 7个`数字键(1,2,3,4,5,6,7)`总共16个键，演奏钢琴60个单音(35个全音+25个半音)，实际情况一首简单的钢琴曲可以不需要用到那么多，用几个简单的和弦即可。

# 构建钢琴界面

有上面的前期准备，下面就是转化为我们的编程知识了，我们需要使用 HTML 来绘制我们的钢琴界面，我们可以参考 [codepen](https://codepen.io/search/pens?q=piano&page=1&order=popularity&depth=everything) 和 [codesandbox](https://codesandbox.io/search?query=piano&page=1&configure%5BhitsPerPage%5D=12) 的素材，这里我用了 `flex` 布局配合阴影和过度实现钢琴的黑白键，里面用了 React 的 JSX 语法去遍历渲染黑白键。

```html
<div class="piano">
  {this.data.pianoKeys.map((item)=>{return(
  <div class="piano-key">
    <div data-type="white" ref={e=>{ this[item.white.name] = e }} class="piano-key__white"
      onClick={this.playNote.bind(this,item.white.name)} data-key={item.white.keyCode}
      data-note={item.white.name}>
      <span class="piano-note">{item.white.name}</span>
      <audio preload="auto" src={this.data.notes[item.white.name]} hidden='true' data-note={item.white.name}
        class='audioEle'></audio>
    </div>
    <div data-type="black" ref={e=>{ this[item.black.name] = e }} style={{
      display: item.black.name ? 'block' : 'none'
    }} class="piano-key__black" onClick={this.playNote.bind(this,item.black.name)} data-key={item.black.keyCode}
      data-note={item.black.name}>
      <span class="piano-note" style="color:#fff">{item.black.name}</span>
      <audio preload="auto" src={this.data.notes[item.white.name]} hidden='true' data-note={item.white.name}
        class='audioEle'></audio>
    </div>
  </div>
  )})}
</div>
```

可以观察 CSS 的源代码，分别对应写黑键和白键的样式，还可以另外写多一个样式，用于键盘或者鼠标点击琴键时候的效果，可以简单给它加一个背景色即可，整体实现不会太复杂，具体可以调整样式的参数来打造属于自己的钢琴风格。

```css
.piano {
  margin: 0 200px;
  background: linear-gradient(-65deg, #000, #222, #000, #666, #222 75%);
  border-top: .8rem solid #282828;
  box-shadow: inset 0 -1px 1px hsla(0, 0%, 100%, .5), inset -0.4rem 0.4rem #282828;
  display: flex;
  height: 80vh;
  height: 20vh;
  justify-content: center;
  overflow: hidden;
  padding-bottom: 2%;
  padding-left: 2.5%;
  padding-right: 2.5%;
}
.piano-key {
  color: blue;
  flex: 1;
  margin: 0 .1rem;
  max-width: 8.8rem;
  position: relative;
}

.piano-key__white {
  display: flex;
  flex-direction: column-reverse;
  background: linear-gradient(-30deg, #f8f8f8, #fff);
  box-shadow: inset 0 1px 0 #fff, inset 0 -1px 0 #fff, inset 1px 0 0 #fff, inset -1px 0 0 #fff, 0 4px 3px rgba(0, 0, 0, .7), inset 0 -1px 0 #fff, inset 1px 0 0 #fff, inset -1px -1px 15px rgba(0, 0, 0, .5), -3px 4px 6px rgba(0, 0, 0, .5);
  height: 100%;
  position: relative;
}

.piano-key__black {
  display: flex;
  flex-direction: column-reverse;
  background: linear-gradient(-20deg, #222, #000, #222);
  box-shadow: inset 0 -1px 2px hsla(0, 0%, 100%, .4), 0 2px 3px rgba(0, 0, 0, .4);
  border-width: .2rem .4rem 1.2rem;
  border-style: solid;
  border-color: #666 #222 #111 #555;
  height: 60%;
  left: 100%;
  position: absolute;
  transform: translateX(-50%);
  top: 0;
  width: 70%;
  z-index: 1;
}
```

# 播放钢琴音

当我们实现完钢琴界面，我们就需要为每个按键匹配声音，这里使用 HTML5 的 `<audio>` 标签，它可以装载着钢琴的音符，当我们触发鼠标点击事件或者键盘点击事件的时候，我们就让它播放，在钢琴没播放之前我们使用属性值 `preload="auto"` 让其预加载。
```html
<audio preload="auto" src={this.data.notes[item.white.name]} hidden='true' data-note={item.white.name} class='audioEle'></audio>
```
播放只要用`ref`属性获取琴音的节点，然后对其触发方法控制播放逻辑，`audio.currentTime = 0`重置播放进度和`audio.play()`执行播放，当触发播放的同时可以用延时器实现按键动画。
```js
playNote(name) {
  let audio = this[name].childNodes[1]
  this[name].style.background = `linear-gradient(-20deg, #3330fb, #000, #222)`
  let timer = setTimeout(() => {
    this[name].getAttribute('data-type') === 'white' ? this[name].style.background = `linear-gradient(-30deg, #f8f8f8, #fff)` : this[name].style.background = `linear-gradient(-20deg, #222, #000, #222)`
    clearTimeout(timer)
  }, 1000)
  audio.currentTime = 0;
  audio.play();
}
```
完成 `<audio>` 的音频处理之后，就需要让键盘事件与其绑定逻辑了，这里需要了解键盘的 `keycode`，键盘每个实体按键都会对应有一个按键码，根据按键码用 `JS` 键盘事件监听来判断按键是否被摁住。

<img src="./public/keycode.png" />

我们使用 `window.document.onkeydown` 来监听页面全局的键盘事件，然后判断事件对象 `e.altKey`，`e.ctrlKey`，`e.metaKey` 和 `e.shiftKey` 这四个功能键是否被触发，再判断数字键是否被触发，最后判断字母键是否被触发。
```js
document.onkeydown = (event) => {
  var e = event || window.event || arguments.callee.caller.arguments[0];
  let playNote = (key) => {
    if (e.shiftKey === true) {
      this.playNote(`${key}2`)
    } else if (e.altKey === true) {
      this.playNote(`${key}5`)
    } else if (e.ctrlKey === true) {
      this.playNote(`${key}3`)
    } else if (e.metaKey === true) {
      this.playNote(`${key}6`)
      e.returnValue = false;
    } else {
      this.playNote(`${key}4`)
    }
  }
  if (e && 49 <= e.keyCode && e.keyCode <= 55) {
    switch (e.keyCode) {
      case 49:
        playNote('C')
        break;
      case 50:
        playNote('D')
        break;
      case 51:
        playNote('E')
        break;
      case 52:
        playNote('F')
        break;
      case 53:
        playNote('G')
        break;
      case 54:
        playNote('A')
        break;
      case 55:
        playNote('B')
        break;
    }
  }
  if (e && (81 === e.keyCode || e.keyCode === 87 || e.keyCode === 69 || e.keyCode === 82 || e.keyCode === 84)) {
    switch (e.keyCode) {
      case 81:
        playNote('C#')
        break;
      case 87:
        playNote('D#')
        break;
      case 69:
        playNote('F#')
        break;
      case 82:
        playNote('G#')
        break;
      case 84:
        playNote('A#')
        break;
    }
  }
};
```

# 自动播放

以下就是关于如何自动播放的逻辑，如果要演奏复杂的歌曲，我们可以编写好歌谱，然后交给编程自动演奏，下面是`周杰伦《蒲公英的约定》`的钢琴简谱，我们用数组把每个按键的音符记录下来，然后只要用定时器或者递归把每个音符取出来给函数识别，然后再触发对应的 `<audio>` 标签播放即可，这里解释下数组里面的每一项，如果字符串里面是数字的话就对应中音，也就是如果是`'3'`，那就只需要按键盘的`3`，如果是`'+3'`那就是高音，那就是前面提到的用组合键 `option + 3`，如果是 `+1..`，那就是告诉编程，这里要停顿两个节拍，我们自己实际演奏的时候就在这里稍微停顿下控制旋律即可。
```js
const song = [
    '3', '4',
    '5', '5', '5', '6', '7', '+1..',
    '+1', '+1', '7', '+2', '6', '5', '5', '5', '+2', '+1', '+1', '+3', '+3..',
    '+1', '+2', '+3', '+3', '+4', '+3', '+2', '+3', '+1', '+1', '6', '6',
    '6', '7', '+1', '+2', '+2', '+1', '7', '6', '+4', '+2',
    // 将愿望...
    '+2..', '3', '4', '5',
    // 折飞机寄成信...
    '5', '5', '5', '6', '7', '+1..',
    '+1', '+1', '7', '+2', '6', '5', '5', '5', '+2', '+1', '+1', '+3', '+3..',
    '+1', '+2', '+3', '+3', '+4', '+3', '+2', '+3', '+1', '+1', '6', '6',
    '6', '7', '+1', '+2', '+2', '+1', '7', '6', '+4', '+2..',
    // 一起长大的约定...
    '3', '5', '+1', '+3', '+3.', '+4', '+2..', '+2', '+5', '7', '+1..',
    '+3', '+4', '+5', '+1', '+1', '+2', '+3', '+3..',
    // 说好要一起旅行...
    '3', '5', '+1.', '+3', '+3.', '+4', '+2..',
    // 是你如今...
    '+2', '+5', '7', '+1..',
    // 唯一坚持的任性
    '+3', '+4', '+5', '+1', '+1', '+2.', '+1', '+1',
    // 在走廊...
    '3', '4',
    '5', '5', '5', '6', '7', '+1..',
    '+1', '+1', '7', '+2', '6', '5', '5', '5', '+2', '+1', '+1', '+3', '+3..',
    '+1', '+2', '+3', '+3', '+4', '+3', '+2', '+3', '+1', '+1', '6', '6',
    '6', '7', '+1', '+2', '+2', '+1', '7', '6', '+4', '+2',
    // 一起长大的约定...
    '3', '5', '+1', '+3', '+3.', '+4', '+2..', '+2', '+5', '7', '+1..',
    '+3', '+4', '+5', '+1', '+1', '+2', '+3', '+3..',
    // 说好要一起旅行...
    '3', '5', '+1.', '+3', '+3.', '+4', '+2..',
    // 是你如今...
    '+2', '+5', '7', '+1..',
    // 唯一坚持的任性...
    '+3', '+4', '+5', '+1', '+1', '+2.', '+1', '+1',
    // 一起长大的约定...
    '+6', '+5', '+3', '+2', '+1', '+3.', '+4', '+2..',
    '+6', '+5', '7', '+1..',
    // 与你聊不完的曾经...
    '+3', '+4', '+5', '+1', '+1', '+2', '+3', '+3..',
    // 而我已经分不清...
    '3', '5', '+1', '+3', '+3.', '+2', '+2', '+2..', '+2', '+5', '7', '+2', '+1', '+1',
    // 还是错过的爱情...
    '+3', '+4', '+5', '+1', '+1', '+2.', '+1', '+1..'
]
export default [...song]
```
有了上面的数组，我们只需要编写一个递归函数函数来遍历数组，然后根据这种类数字的简谱，把它转为音符 `CDEFGAB`，一开始的时候我用了定时器实现读谱函数，后来发现，用定时器比较难控制，音符之间的停顿时间，相反用递归会比较容易实现，但是递归同样很难实现暂停播放功能，因为从外部中断递归函数也比较复杂，所以同学们如果要自己实现钢琴的话，在这个地方要稍微注意一下。下面代码中出现的 `Promise` 配合 `await, async` 和定时器就是接受一个时间变量，来控制音符之间的停顿时间，而外层`if(offset < song.length && this.store.data.song.length > 0)`判断条件左边的条件是判断索引值要小于简谱数组的长度，右边就是外层传入的判断值作为递归函数的终止边界条件。
```js
playSong(song) {
  this.setSong([...song])
  let offset = 0
  let time = 0
  let playSong = async () => {
    // 右边是从外部来中断递归
    if (offset < song.length && this.store.data.song.length > 0) {
      switch (typeof song[offset]) {
        // 简谱2演奏方法 根据 ++12345--6. 简单旋律情况
        case 'string':
          let letters = song[offset].match(/[0-9]/g)
          switch (letters.length) {
            case 1:
              time = this.handleString(song, offset)
              break
            default:
              time = this.handleStrings(song, offset)
              break
          }
          break
        // 简谱1演奏方法 根据 CDEFGAB，复杂旋律情况，比如有和弦
        case 'object':
          console.log(song[offset]['note'])
          time = song[offset]['time'];
          this.playNote(song[offset]['note'])
          break;
        case 'number':
          // 休止符
          switch (song[offset]) {
            case 0:
              time = 1000
              break
          }
          break
      }
      await new Promise((resolve) => {
        let timer = setTimeout(() => {
          clearInterval(timer)
          resolve()
        }, time)
      })
      offset++
      // 自定义事件，跟下面底部的音符自动跳动结合
      this.add()
      playSong()
    } else {
      // 暂停播放
      clearTimeout(this.timer)
      this.store.data.song = []
      this.store.data.count = 0
      return
    }
  }
  playSong()
}
```

# 蒲公英的约定

看完上面的数组简谱当然肯定会有同学问，上文的数组里面不止运用到8个键吧，如果仔细观察，就会发现这里只用了中音和高音，也就是纯数字键`(1-7)`和`Option`键的配合，连半音都没用到，所以实际止用到了8个键而已，所以上面给编程识别的简谱，转化我们人类识别的键盘谱，只需要稍微调整为下面的按键组合即可。
```js
'3', '4', '5', '5', '5', '6', '7', 'Option+1..',
'Option+1', 'Option+1', '7', 'Option+2', '6', '5', '5', '5', 'Option+2', 'Option+1', 'Option+1', 'Option+3', 'Option+3..',
'Option+1', 'Option+2', 'Option+3', 'Option+3', 'Option+4', 'Option+3', 'Option+2', 'Option+3', 'Option+1', 'Option+1', '6', '6',
'6', '7', 'Option+1', 'Option+2', 'Option+2', 'Option+1', '7', '6', 'Option+4', 'Option+2',
// 将愿望...
'Option+2..', '3', '4', '5',
// 折飞机寄成信...
'5', '5', '5', '6', '7', 'Option+1..',
'Option+1', 'Option+1', '7', 'Option+2', '6', '5', '5', '5', 'Option+2', 'Option+1', 'Option+1', 'Option+3', 'Option+3..',
'Option+1', 'Option+2', 'Option+3', 'Option+3', 'Option+4', 'Option+3', 'Option+2', 'Option+3', 'Option+1', 'Option+1', '6', '6',
'6', '7', 'Option+1', 'Option+2', 'Option+2', 'Option+1', '7', '6', 'Option+4', 'Option+2..',
// 一起长大的约定...
'3', '5', 'Option+1', 'Option+3', 'Option+3.', 'Option+4', 'Option+2..', 'Option+2', 'Option+5', '7', 'Option+1..',
'Option+3', 'Option+4', 'Option+5', 'Option+1', 'Option+1', 'Option+2', 'Option+3', 'Option+3..',
// 说好要一起旅行...
'3', '5', 'Option+1.', 'Option+3', 'Option+3.', 'Option+4', 'Option+2..',
// 是你如今...
'Option+2', 'Option+5', '7', 'Option+1..',
// 唯一坚持的任性
'Option+3', 'Option+4', 'Option+5', 'Option+1', 'Option+1', 'Option+2.', 'Option+1', 'Option+1',
// 在走廊...
'3', '4', '5', '5', '5', '6', '7', 'Option+1..',
'Option+1', 'Option+1', '7', 'Option+2', '6', '5', '5', '5', 'Option+2', 'Option+1', 'Option+1', 'Option+3', 'Option+3..',
'Option+1', 'Option+2', 'Option+3', 'Option+3', 'Option+4', 'Option+3', 'Option+2', 'Option+3', 'Option+1', 'Option+1', '6', '6',
'6', '7', 'Option+1', 'Option+2', 'Option+2', 'Option+1', '7', '6', 'Option+4', 'Option+2',
// 一起长大的约定...
'3', '5', 'Option+1', 'Option+3', 'Option+3.', 'Option+4', 'Option+2..', 'Option+2', 'Option+5', '7', 'Option+1..',
'Option+3', 'Option+4', 'Option+5', 'Option+1', 'Option+1', 'Option+2', 'Option+3', 'Option+3..',
// 说好要一起旅行...
'3', '5', 'Option+1.', 'Option+3', 'Option+3.', 'Option+4', 'Option+2..',
// 是你如今...
'Option+2', 'Option+5', '7', 'Option+1..',
// 唯一坚持的任性...
'Option+3', 'Option+4', 'Option+5', 'Option+1', 'Option+1', 'Option+2.', 'Option+1', 'Option+1',
// 一起长大的约定...
'Option+6', 'Option+5', 'Option+3', 'Option+2', 'Option+1', 'Option+3.', 'Option+4', 'Option+2..',
'Option+6', 'Option+5', '7', 'Option+1..',
// 与你聊不完的曾经...
'Option+3', 'Option+4', 'Option+5', 'Option+1', 'Option+1', 'Option+2', 'Option+3', 'Option+3..',
// 而我已经分不清...
'3', '5', 'Option+1', 'Option+3', 'Option+3.', 'Option+2', 'Option+2', 'Option+2..', 'Option+2', 'Option+5', '7', 'Option+2', 'Option+1', 'Option+1',
// 还是错过的爱情...
'Option+3', 'Option+4', 'Option+5', 'Option+1', 'Option+1', 'Option+2.', 'Option+1', 'Option+1..'
```
我们还可以演奏另一首耳熟能详的的钢琴曲《月亮代表我的心》
```js
"Ctrl+5", "1", "3", "5", "1", "Ctrl+7", "3", "5", "5", "6", "7", "Option+1", "6", "5", "3", "2", "1", "1", "1", "3", "2", "1", "1", "1", "2", "3", "2", "1", "Ctrl+6", "2",

"3", "2", "Ctrl+5", "1", "3", "5", "1", "Ctrl+7", "3", "5", "5", "6", "7", "Option+1", "6", "5", "3", "2", "1", "1", "1", "3", "2", "1", "1", "1", "2", "3", "2", "1",

"Ctrl+6", "2", "3", "2", "3", "5", "3", "2", "1", "5", "Ctrl+7", "Ctrl+6", "Ctrl+7", "Ctrl+6", "Ctrl+7", "Ctrl+6", "Ctrl+5", "3", "5", "3", "2", "1", "5", "Ctrl+7", "Ctrl+6", "Ctrl+7", "1", "1", "1", "2",

"3", "2", "Ctrl+5", "1", "3", "5", "1", "Ctrl+7", "3", "5", "5", "6", "7", "Option+1", "6", "5", "3", "2", "1", "1", "1", "3", "2", "1", "1", "1", "2", "3", "2", "Ctrl+6",

"Ctrl+7", "1", "2", "1", "Ctrl+5", "1", "3", "5", "1", "Ctrl+7", "3", "5", "5", "6", "7", "Option+1", "6", "5", "3", "2", "1", "1", "1", "3", "2", "1", "1", "1", "2", "3",

"2", "1", "Ctrl+6", "2", "3", "2", "Ctrl+5", "1", "3", "5", "1", "Ctrl+7", "3", "5", "5", "6", "7", "Option+1", "6", "5", "3", "2", "1", "1", "1", "3", "2", "1", "1", "1",

"2", "3", "2", "1", "Ctrl+6", "2", "3", "2", "3", "5", "3", "2", "1", "5", "Ctrl+7", "Ctrl+6", "Ctrl+7", "Ctrl+6", "Ctrl+7", "Ctrl+6", "Ctrl+5", "3", "5", "3", "2", "1", "5", "Ctrl+7", "Ctrl+6", "Ctrl+7",

"1", "1", "1", "2", "3", "2", "Ctrl+5", "1", "3", "5", "1", "Ctrl+7", "3", "5", "5", "6", "7", "Option+1", "6", "5", "3", "2", "1", "1", "1", "3", "2", "1", "1", "1",

"2", "3", "2", "Ctrl+6", "Ctrl+7", "1", "2", "1"
```