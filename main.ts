function append_ComHis (value: number) {
    cHistory.append(value);
}
function compassTick (angle: number) {
    compass = angle
    append_ComHis(compass)
    serial.writeValue("c", compass)
}
function getDelta_ComHis () {
    return cHistory.getDelta(1)
}
function compassDelta () {
    tmp = getDelta_ComHis()
    if (tmp < 0) {
        serial.writeString(" ERR " + '\n')
    } else {
        delta = tmp
        serial.writeValue("D", delta)
        serial.writeValue("L", cHistory.getLength())
    }
}
input.onButtonPressed(Button.B, function () {
    reset_ComHis()
})
function debugCorrection () {
    console.log(cHistory.getHistory())
serial.writeValue("L", cHistory.getLength())
    for (let i = 0; i <= cHistory.getKnownAngles().length - 1; i++) {
        tmp = cHistory.getKnownAngles()[i]
        console.log(tmp +" [" + cHistory.getCorrection()[tmp][0] + "]");
    }
}
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
        return (this.angleList.indexOf(angle) < 0)
    }
    addAngle(angle: number) {        
        if (this.isNewAngle(angle)) {
            this.map[angle] = [];
            this.map[angle][0] = 0;
            this.angleList.push(angle);
        }
        this.map[angle][0] = this.map[angle][0] + 1;
    }
    private xxx(item: number[], index: number) {

    }
    removeAngle(angle: number) {
        console.log("removeAngle("+angle+")")
        if (this.isNewAngle(angle)) {
            console.log("remAngle> new angle - this should not happen")
            return false;
        }            

        console.log("remAngle("+ angle +")> subtrackt angle");
        this.map[angle][0] = this.map[angle][0] - 1;
        try {    
            if (this.map[angle][0] == 0) {
                console.log("remAngle> final cleanup");
                //this.map.splice(angle-1, 1)
                /*this.map.forEach(function (value: number[], index: number) {
                    tmp = NaN;
                    if ( (!! this.map[index]) && this.map[index][0] !== NaN) {
                        tmp = this.map[index][0]
                    }
                    console.log("check> [" + index + "]:" + (isNaN(tmp) ? "" : tmp))
                })*/
            }
        } catch (error) {
            console.log(error)
        }
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
        if (this.history.length == this.maxEntries) {
            this.correction.removeAngle(this.history[0]);
            this.history.splice(0, this.history.length - this.maxEntries +1);                        
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
let cHistory = new CompassHistory(10);
loops.everyInterval(2000, function () {
    compassTick(input.compassHeading())
    debugCorrection()
})
loops.everyInterval(2000, function () {
	
})
