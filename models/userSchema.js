const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name'],
    },
    email: {
        type: String,
        required: [true, 'Please enter your Email Id'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Email format: xxxxx@gmail.com'],
    },
    photo: {
        type: String,
    },
    password: {
        type: String,
        required: [true, 'Please enter 8 digit password'],
        minlength: 8,
        select: false,
    },
    confirmPassword: {
        type: String,
        required: [true, 'Please enter 8 digit password'],
        minlength: 8,
        validate: {
            validator: function(el) {
                return el === this.password;
            },
        },
    },
    passwordChangedAt: {
        type: Date,
    },
    passwordresetToken: { type: String },
    resetTokenExpriresIn: { type: Date },
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
});
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
    next();
});
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password') || this.isNew) return next();
    this.passwordChangedAt = Date.now() + 1000;
    next();
});
UserSchema.methods.correctPassword = async function(
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};
UserSchema.methods.passwordChangedAfter = function(jwtTimestamp) {
    if (this.passwordChangedAt) {
        let time = this.passwordChangedAt.getTime();
        time = time / 1000;
        if (time > jwtTimestamp) {
            return true;
        }
        // console.log(time, jwtTimestamp);
        return false;
    }
    return false;
};
UserSchema.methods.passwordResetToken = function() {
    const token = crypto.randomBytes(32).toString('hex');
    const resetToken = crypto.createHash('sha256').update(token).digest('hex');
    this.passwordresetToken = resetToken;
    this.resetTokenExpriresIn = Date.now() + 10 * 60 * 1000;
    return token;
};
const user = mongoose.model('User', UserSchema);
module.exports = user;