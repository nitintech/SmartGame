const INVALID_INPUT_EXCETION_TYPE = "InvalidInputException";
class CustomException {
    
    constructor(message, type) {
        this.message = message;
        this.type = type;
    }

    getMessage() {
        return this.message;
    }
    getType() {
        return this.type;
    }
}

module.exports = {CustomException, INVALID_INPUT_EXCETION_TYPE};