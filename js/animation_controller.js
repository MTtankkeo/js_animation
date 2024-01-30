import { Ticker } from "./ticker.js";

/**
 * @typedef {(availableDelta: number) => number} AnimationConsumeCallback
 * @typedef {(value: number) => void} AnimationUpdateListener
 * @typedef {(status: AnimationStatus) => void} AnimationStatusListener
 */

export const AnimationStatus = {
    NONE:       "none",
    FORWARD:    "forward",
    FORWARDED:  "forwarded",
    BACKWARD:   "backward",
    BACKWARDED: "backwarded",
}

export class Animatable {
    constructor() {
        if (this.constructor === Animatable) {
            throw "This class is an abstract class.";
        }
    }

    /**
     * @param {AnimationUpdateListener} callback 
     */
    addListener(callback) {
        throw "This function must be implemented.";
    }

    /**
     * @param {AnimationUpdateListener} callback 
     */
    removeListener(callback) {
        throw "This function must be implemented.";
    }

    /**
     * @param {AnimationStatusListener} callback 
     */
    addStatusListener(callback) {
        throw "This function must be implemented.";
    }

    /**
     * @param {AnimationStatusListener} callback 
     */
    removeStatusListener(callback) {
        throw "This function must be implemented.";
    }
}

export class AnimationController extends Animatable {
    /**
     * @param {number} duration - milliseconds
     * @param {number} initialValue
     * @param {number} lowerValue
     * @param {number} upperValue
     * @param {boolean} isAbsoluteDuration 
     */
    constructor(
        duration,
        initialValue,
        lowerValue,
        upperValue,
        isAbsoluteDuration
    ) {
        super();
        this.lowerValue = lowerValue || 0;
        this.upperValue = upperValue || 1;
        if (this.lowerValue > this.upperValue) throw "The lowerValue must be less than the upperValue.";

        /** @type {number} */
        this.value = initialValue || this.lowerValue;
        this.duration = duration;
        this.isAbsoluteDuration = isAbsoluteDuration || false;

        /** @type {Ticker} */
        this.activeTicker = null;
        this.status = AnimationStatus.NONE;

        // This is only raw member variables in this class.
        this.listeners = [];
        this.statusListeners = [];
    }

    /**
     * @param {number} newValue
     * @returns {number} Remaining value after being consumed.
     */
    setValue(newValue) {
        if (this.value == newValue) return 0;

        const previousValue = this.value;

        // When defining, the new value must not be out of extent.
        {
            if (newValue > this.upperValue) {
                this.notifyListeners(this.value = this.upperValue);
            } else if (newValue < this.lowerValue) {
                this.notifyListeners(this.value = this.lowerValue);
            } else {
                this.notifyListeners(this.value = newValue);
            }
        }

        return this.value - previousValue;
    }

    /**
     * @param {AnimationStatus} newStatus
     */
    setStatus(newStatus) {
        if (newStatus == null) {
            throw "status must be not nullable in this animation controller.";
        }

        this.notifyStatusListeners(this.status = newStatus);
    }

    forward() {
        if (this.upperValue == this.value) return;
        if (this.upperValue == null) {
            throw "upperValue must be defined for this function to be called.";
        }

        this.animateTo(this.upperValue, this.duration);
    }
    
    backward() { 
        if (this.lowerValue == this.value) return;
        if (this.lowerValue == null) {
            throw "lowerValue must be defined for this function to be called.";
        }

        this.animateTo(this.lowerValue, this.duration);
    }

    /**
     * @param {boolean} isBackward 
     */
    createConsumeFunc(isBackward = false) {
        if (isBackward) {
            return delta => this.setValue(this.value - delta);
        } else {
            return delta => this.setValue(this.value + delta);
        }
    }

    /**
     * @param {number} target
     * @param {number} duration milliseconds
     * @param {AnimationConsumeCallback} consume
     * @param {boolean} isAbsoluteDuration
     */
    animateTo(
        target,
        duration = this.duration,
        consume  = this.createConsumeFunc(this.value > target)
    ) {
        if (duration == null || isNaN(duration) || duration == 0) {
            throw "duration for animation was not given in animateTo() of the AnimationController.";
        }
        if (consume instanceof Function == false) {
            throw "consume callback was not given in animateTo() of the AnimationController.";
        }
        if (this.activeTicker != null) {
            this.activeTicker.dispose();
        }

        const isBackward = this.value > target;
        const totalConumed = Math.abs(target - this.value);

        this.setStatus(
            isBackward
                ? AnimationStatus.BACKWARD
                : AnimationStatus.FORWARD
        )

        this.activeTicker = new Ticker((delta) => {
            const durationExponent = this.isAbsoluteDuration ? totalConumed : this.upperValue
            const available = delta / (duration / durationExponent);
            
            // The consumed direction of movement of the value is not important.
            const consumed = Math.abs(consume(available));

            if (Math.abs(consumed - available) > Number.EPSILON) {
                this.activeTicker.dispose();
                this.activeTicker = null;

                this.setStatus(
                    isBackward
                        ? AnimationStatus.BACKWARDED
                        : AnimationStatus.FORWARDED
                )
            }
        });
    }

    /**
     * @param {AnimationUpdateListener} callback 
     */
    addListener(callback) {
        if (this.listeners.includes(callback)) {
            throw "Already added given listener in this controller.";
        }

        this.listeners.push(callback);
    }

    /**
     * @param {AnimationUpdateListener} callback 
     */
    removeListener(callback) {
        if (this.listeners.includes(callback) == false) {
            throw "Already not added given listener in this controller."
        }

        this.listeners.remove(callback);
    }

    /**
     * @param {number} value 
     */
    notifyListeners(value) {
        this.listeners.forEach(listener => listener(value))
    }

    /**
     * @param {AnimationStatusListener} callback 
     */
    addStatusListener(callback) {
        if (this.statusListeners.includes(callback)) {
            throw "Already added given status listener in this controller.";
        }

        this.statusListeners.push(callback);
    }

    /**
     * @param {AnimationStatusListener} callback 
     */
    removeStatusListener(callback) {
        if (this.statusListeners.includes(callback) == false) {
            throw "Already not added given status listener in this controller."
        }

        this.statusListeners.remove(callback);
    }

    /**
     * @param {AnimationStatus} status
     */
    notifyStatusListeners(status) {
        this.statusListeners.forEach(listener => listener(status))
    }
}