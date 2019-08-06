import { render } from 'omi'
import './assets/index.css'
import './elements/app'


render(<my-app />, '#root', {
    data: {
        count: 0,
        song: []
    },
    sub() {
        this.data.count--
    },
    add() {
        this.data.count++
    },
    setSong(song) {
        // 构建新的数组，给它下标值来做索引
        let melody = [];
        song.map((item, index) => {
            melody.push({
                ...item,
                index
            })
        })
        // 处理成每30个音符一个数组，自动播放时候自动显示按键
        for (let j = 0; j < melody.length; j += 30) {
            this.data.song.push(melody.slice(j, j + 30))
        }
    }
})
