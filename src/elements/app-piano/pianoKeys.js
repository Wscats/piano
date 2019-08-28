

export default[{
    black: { name: "C#2", keyCode: 81 },
    white: { name: "C2", keyCode: 49 },
},
{
    black: { name: "D#2", keyCode: 87 },
    white: { name: "D2", keyCode: 50 },
},
{
    black: { name: null, keyCode: null },
    white: { name: "E2", keyCode: 51 },
},
{
    black: { name: "F#2", keyCode: 69 },
    white: { name: "F2", keyCode: 52 },
},
{
    black: { name: "G#2", keyCode: 82 },
    white: { name: "G2", keyCode: 53 },
},
{
    black: { name: "A#2", keyCode: 84 },
    white: { name: "A2", keyCode: 54 },
},
{
    black: { name: null, keyCode: null },
    white: { name: "B2", keyCode: 55 },
},
{
    black: { name: "C#3", keyCode: 81 },
    white: { name: "C3", keyCode: 49 },
},
{
    black: { name: "D#3", keyCode: 87 },
    white: { name: "D3", keyCode: 50 },
},
{
    black: { name: null, keyCode: null },
    white: { name: "E3", keyCode: 51 },
},
{
    black: { name: "F#3", keyCode: 69 },
    white: { name: "F3", keyCode: 52 },
},
{
    black: { name: "G#3", keyCode: 82 },
    white: { name: "G3", keyCode: 53 },
},
{
    black: { name: "A#3", keyCode: 84 },
    white: { name: "A3", keyCode: 54 },
},
{
    black: { name: null, keyCode: null },
    white: { name: "B3", keyCode: 55 },
},
{
    black: { name: "C#4", keyCode: 81 },
    white: { name: "C4", keyCode: 49 },
},
{
    black: { name: "D#4", keyCode: 87 },
    white: { name: "D4", keyCode: 50 },
},
{
    black: { name: null, keyCode: null },
    white: { name: "E4", keyCode: 51 },
},
{
    black: { name: "F#4", keyCode: 69 },
    white: { name: "F4", keyCode: 52 },
},
{
    black: { name: "G#4", keyCode: 82 },
    white: { name: "G4", keyCode: 53 },
},
{
    black: { name: "A#4", keyCode: 84 },
    white: { name: "A4", keyCode: 54 },
},
{
    black: { name: null, keyCode: null },
    white: { name: "B4", keyCode: 55 },
},
{
    black: { name: "C#5", keyCode: 81 },
    white: { name: "C5", keyCode: 49 },
},
{
    black: { name: "D#5", keyCode: 87 },
    white: { name: "D5", keyCode: 50 },
},
{
    black: { name: null, keyCode: null },
    white: { name: "E5", keyCode: 51 },
},
{
    black: { name: "F#5", keyCode: 69 },
    white: { name: "F5", keyCode: 52 },
},
{
    black: { name: "G#5", keyCode: 82 },
    white: { name: "G5", keyCode: 53 },
},
{
    black: { name: "A#5", keyCode: 84 },
    white: { name: "A5", keyCode: 54 },
},
{
    black: { name: null, keyCode: null },
    white: { name: "B5", keyCode: 55 },
},
{
    black: { name: "C#6", keyCode: 81 },
    white: { name: "C6", keyCode: 49 },
},
{
    black: { name: "D#6", keyCode: 87 },
    white: { name: "D6", keyCode: 50 },
},
{
    black: { name: null, keyCode: null },
    white: { name: "E6", keyCode: 51 },
},
{
    black: { name: "F#6", keyCode: 69 },
    white: { name: "F6", keyCode: 52 },
},
{
    black: { name: "G#6", keyCode: 82 },
    white: { name: "G6", keyCode: 53 },
},
{
    black: { name: "A#6", keyCode: 84 },
    white: { name: "A6", keyCode: 54 },
},
{
    black: { name: null, keyCode: null },
    white: { name: "B6", keyCode: 55 }
}]

// 创建音符和键盘的映射关系表 用于生成上面的数组
const createPianoKeys = () => {
    // 存放钢琴的按键顺序
    let pianoKeys = [];
    [2, 3, 4, 5, 6].map((item) => {
        pianoKeys = pianoKeys.concat([{
            white: {
                name: `C${item}`,
                keyCode: 49
            },
            black: {
                name: `C#${item}`,
                keyCode: 81
            }
        }, {
            white: {
                name: `D${item}`,
                keyCode: 50
            },
            black: {
                name: `D#${item}`,
                keyCode: 87
            }
        }, {
            white: {
                name: `E${item}`,
                keyCode: 51
            },
            black: {
                name: null,
                keyCode: null
            }
        }, {
            white: {
                name: `F${item}`,
                keyCode: 52
            },
            black: {
                name: `F#${item}`,
                keyCode: 69
            }
        }, {
            white: {
                name: `G${item}`,
                keyCode: 53
            },
            black: {
                name: `G#${item}`,
                keyCode: 82
            }
        }, {
            white: {
                name: `A${item}`,
                keyCode: 54
            },
            black: {
                name: `A#${item}`,
                keyCode: 84
            }
        }, {
            white: {
                name: `B${item}`,
                keyCode: 55
            },
            black: {
                name: null,
                keyCode: null
            }
        }])
    })
    return pianoKeys
}