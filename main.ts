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
        //unused right now
        this.maxKeys = keys;
        // rename to maxEntities
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
    removeAngle(angle: number) {
        if (this.isNewAngle(angle)) 
            return false;
        if (this.map[angle][0] < 1) {
            this.map[angle] = []
            return true;
        } 
        this.map[angle][0] = this.map[angle][0] - 1;
        return true;
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
    getKnownAngles() {
        return this.angleList;
    }
    /*
    for (var key in myArray) {
      console.log("key " + key + " has value " + myArray[key]);
    }
    */ 
}
class CompassHistory {
    private maxEntries: number;
    private history: number[];
    private correction: CorrectionMap;
    constructor(max: number) {
        this.history = [];
        this.maxEntries = max;
        this.correction = new CorrectionMap(10, 20);
    }
    append(angle: number) {
        if (this.history.length >= this.maxEntries) {
            this.history.splice(0, this.history.length - this.maxEntries +1);
            this.correction.removeAngle(angle);
        }
        this.history.push(angle);
        this.correction.addAngle(angle);
    }
    getDelta(dec: number) {
        if (this.getLength() < 1) return -100;
        let sum = 0;
        this.history.forEach(function (e) {
            sum += e;
        });
        return Math.round( (sum * Math.pow(10, dec)) / this.getLength() ) / Math.pow(10, dec);
    }
    getFromRow() {
        if (this.history.length > 0) {
            return this.history.slice(0,1);
        }
        return -100;
    }
    getLength() {
        return this.history.length;
    }
    reset() {
        this.history = [];
        this.correction.reset();
    }
    getHistory() {
        return this.history
    }
    getCorrection() {
        return this.correction.getAll();
    }
    getKnownAngles() {
        return this.correction.getKnownAngles();
    }
}
let cHistory = new CompassHistory(100);
loops.everyInterval(1000, function () {
    tmp = getDelta_ComHis()
    if (tmp < 0) {
        serial.writeString(" ERR " + '\n')
    } else {
        delta = tmp
        serial.writeValue("D", delta)
        serial.writeValue("L", cHistory.getLength())
    }
})
loops.everyInterval(1000, function () {
    compass = input.compassHeading()
    append_ComHis(compass)
    serial.writeValue("c", compass)
})
loops.everyInterval(1000, function () {
    console.log(cHistory.getHistory())
    
    for (let i = 0; i < cHistory.getKnownAngles().length; i++) {
        tmp = cHistory.getKnownAngles()[i]
        console.log(tmp +" [" + cHistory.getCorrection()[tmp][0] + "]");
    }    
})
basic.forever(function () {
	
})
