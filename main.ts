function append_ComHis (value: number) {
    cHistory.append(value);
}
function getDelta_ComHis () {
    return cHistory.getDelta(1)
}
let tmp: number;
tmp = -100
let compass: number;
compass = 0
let delta: number;
delta = 0
class LimitedFront {
    private maxEntries: number;
    private front: number[];
    constructor(max: number) {
        this.front = [];
        this.maxEntries = max;
    }
    append(value: number) {
        if (this.front.length >= this.maxEntries) {
            this.front.splice(0, this.maxEntries - this.front.length);
        }
        this.front.push(value);
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
            return this.front.slice();
        }
        return -100;
    }
    getLength() {
        return this.front.length;
    }
    clear() {
        this.front = [];
    }
}
let cHistory = new LimitedFront(10);
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
basic.forever(function () {
	
})
loops.everyInterval(100, function () {
    compass = input.compassHeading()
    append_ComHis(compass)
    serial.writeValue("c", compass)
})
