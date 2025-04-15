const bcrypt = require('bcryptjs');

function hashPassword(password) {
    const salt = bcrypt.genSalt(10);
    return bcrypt.hashSync(password,salt);
}

function comparePassword(raw, hash) {
    return bcrypt.compareSync(raw, hash);
}
module.exports = {
    hashPassword,
    comparePassword,
}