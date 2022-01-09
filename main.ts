function append_ComHis (value: number) {
    cHistory.append(value);
}
function getDelta_ComHis () {
    return cHistory.getDelta(1)
}
input.onButtonPressed(Button.B, function () {
    reset_ComHis()
})
function reset_ComHis () {
    cHistory.reset();
}
let tmp: number;
tmp = -100
let compass: number;
compass = 0
let delta: number;
delta = 0
class CorrectionMap {
    private maxKeys: number;
    private maxInRow: number;
    private map: number[][]; // angle index - values count
    private angleList: number[];
    constructor(keys: number, inRow: number) {
        this.maxKeys = keys;
        this.maxInRow = inRow;        
        this.reset();
    }
    private isNewAngle(angle: number) {
        return ! (this.angleList.indexOf(angle) >= 0)
    }
    addAngle(angle: number) {
        if (this.isNewAngle(angle)) {
            this.map[angle] = [];
            this.map[angle][0] = 0;
            this.angleList.push(angle);
        }
        this.map[angle][0] = this.map[angle][0] + 1;
    }
    removeAngleHistory(angle: number) {
        this.map[angle][0] = 0;
    }
    reset() {
        this.map = [];
        this.angleList = [];
    }
    getAll() {
        return this.map;
    }
    /*
    for (var key in myArray) {
      console.log("key " + key + " has value " + myArray[key]);
    }
    */ 
}
class LimitedFront {
    private maxEntries: number;
    private front: number[];
    private correction: CorrectionMap;
    constructor(max: number) {
        this.front = [];
        this.maxEntries = max;
        this.correction = new CorrectionMap(10, 20);
    }
    append(value: number) {
        if (this.front.length >= this.maxEntries) {
            this.front.splice(0, this.front.length - this.maxEntries +1);
        }
        this.front.push(value);
        this.correction.addAngle(value);
    }
    getDelta(dec: number) {
        if (this.getLength() < 1) return -100;
        let sum = 0;
        this.front.forEach(function (e) {
            sum += e;
        });
        return Math.round( (sum * Math.pow(10, dec)) / this.getLength() ) / Math.pow(10, dec);
    }
    getFromRow() {
        if (this.front.length > 0) {
            return this.front.slice(0,1);
        }
        return -100;
    }
    getLength() {
        return this.front.length;
    }
    reset() {
        this.front = [];
        this.correction.reset();
    }
    getHistory() {
        return this.front
    }
    getCorrection() {
        return this.correction.getAll();
    }
}
let cHistory = new LimitedFront(100);
loops.everyInterval(1000, function () {
	
})
loops.everyInterval(500, function () {
    tmp = getDelta_ComHis()
    if (tmp < 0) {
        serial.writeString(" ERR " + '\n')
    } else {
        delta = tmp
        serial.writeValue("D", delta)
        serial.writeValue("L", cHistory.getLength())
    }
})
loops.everyInterval(25, function () {
    compass = input.compassHeading()
    append_ComHis(compass)
    serial.writeValue("c", compass)
})
basic.forever(function () {
	
})
