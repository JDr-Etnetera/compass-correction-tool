function append_ComHis (value: number) {
    cHistory.append(value);
}
function compassTick (angle: number) {
    compass = angle
    append_ComHis(compass)
    logValue("c", compass)
}
input.onButtonPressed(Button.A, function () {
    turnCar(90)
})
function getDelta_ComHis () {
    return cHistory.getDelta(1)
}
function turnCar (angle: number) {
    cHistory.fullCalibration();
let startHeading = cHistory.getDelta(1);
direction = 1
    if (angle == 0) {
        return
    }
    if (angle < 0) {
        direction = -1
    }
    rotationTime = Math.round(angle / ANGULAR_SPD)
    RingbitCar.freestyle(LEFT_ROTATION_SPD_MAX * direction, RIGHT_ROTATION_SPD_MAX * direction)
    basic.pause(rotationTime)
    RingbitCar.brake()
    cHistory.fullCalibration();
let correctionHeading = cHistory.getDelta(1);
// wait for calibration data
    // turns slowly to finish rotation while calibrating
    // break
    leftSpeed = 0
    rightSpeed = 0
}
function logValue (key: string, value: number) {
    if (SERIAL_LOGGING) {
        serial.writeValue(key, value)
    }
}
function compassDelta () {
    tmp = getDelta_ComHis()
    if (tmp < 0) {
        serial.writeString(" ERR " + '\n')
    } else {
        delta = tmp
        logValue("D", delta)
        logValue("L", cHistory.getLength())
    }
}
input.onButtonPressed(Button.B, function () {
    reset_ComHis()
})
function debugCorrection () {
    console.log(cHistory.getHistory())
logValue("L", cHistory.getLength())
    for (let i = 0; i <= cHistory.getKnownAngles().length - 1; i++) {
        tmp = cHistory.getKnownAngles()[i]
        console.log(tmp +" [" + cHistory.getCorrection()[tmp][0] + "]");
    }
}
function reset_ComHis () {
    cHistory.reset();
}
let rightSpeed = 0
let leftSpeed = 0
let rotationTime = 0
let direction = 0
let RIGHT_ROTATION_SPD_MAX = 0
let LEFT_ROTATION_SPD_MAX = 0
let ANGULAR_SPD = 0
let SERIAL_LOGGING = false
SERIAL_LOGGING = true
// Turning speed of car [deg per ms]
ANGULAR_SPD = 0.015
// time between gathering compass data
let COMPASS_TICK = 20
// How large compass history is gathered
let COMPASS_HISTORY = 100
// Maximal speed of left wheel while rotating car
LEFT_ROTATION_SPD_MAX = 75
// Maximal speed of right wheel while rotating car
RIGHT_ROTATION_SPD_MAX = -75
RingbitCar.init_wheel(AnalogPin.P1, AnalogPin.P2)
let tmp: number;
tmp = -100
let compass: number;
compass = 0
let delta: number;
delta = 0
class CorrectionMap {
    private maxKeys: number;
    private maxEntities: number;
    private map: number[][]; // angle index & values count
    private angleList: number[];
    /**
     * @keys        max number of different angles
     * @entities    max number of all records
     */
    constructor(keys: number, entities: number) {        
        this.maxKeys = keys; //unused right now
        this.maxEntities = entities;        
        this.reset();
    }
    private isNewAngle(angle: number) {
        return (this.angleList.indexOf(angle) < 0)
    }
    /**
     * Adds angle to history
     */
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
    /**
     * Removes angle from history
     */
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
    /**
     * Deletes all records of given angle
     */
    removeAngleHistory(angle: number) {
        this.map[angle][0] = 0;
    }
    /**
     * Deletes all records collected
     */
    reset() {
        this.map = [];
        this.angleList = [];
    }
    getAll() {
        return this.map;
    }
    /**
     * Returns list of collected angles
     */
    getKnownAngles() {
        return this.angleList;
    }
}
class CompassHistory {
    private maxEntries: number;
    private compassTick: number;
    private callibrationTime: number;
    private history: number[];
    private correction: CorrectionMap;
    /**
     * @max compass calibration history length
     * @tick how long wait before repeating reading from compass [ms]
     */
    constructor(max: number, tick: number) {        
        this.history = [];
        this.maxEntries = max;
        this.compassTick = tick;
        this.callibrationTime = max * tick;
        this.correction = new CorrectionMap(10, 20);
    }
    /**
     * Adds angle to history tracking
     */
    append(angle: number) {
        logValue("c", angle)
        if (this.history.length == this.maxEntries) {
            this.correction.removeAngle(this.history[0]);
            this.history.splice(0, this.history.length - this.maxEntries +1);                        
        }
        this.history.push(angle);
        this.correction.addAngle(angle);
    }
    /**
     * Returns angle with correction
     * @dec number of decimal places
     */
    getDelta(dec: number) {
        if (this.getLength() < 1) return -100;
        let sum = 0;
        this.history.forEach(function (e) {
            sum += e;
        });
        let delta2 = Math.round( (sum * Math.pow(10, dec)) / this.getLength() ) / Math.pow(10, dec);
        logValue("d", delta2)
        return delta2;
    }
    fullCalibration() {
        this.reset()
        for (let j = 0; j < this.maxEntries; j++) {
            this.append(input.compassHeading())
            basic.pause(this.compassTick)
        }
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
let cHistory = new CompassHistory(COMPASS_HISTORY, COMPASS_TICK);
loops.everyInterval(500, function () {
	
})
loops.everyInterval(5000, function () {
	
})
