const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/userSchema");

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };
    if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

    res.cookie("jwt", token, cookieOptions);
    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user,
        },
    });
};
exports.signup = async(req, res, next) => {
    // console.log('sign up');
    const newUser = await User.create(req.body);
    createSendToken(newUser, 201, res);
};

exports.login = async(req, res, next) => {
    const { email, password } = req.body;
    console.log(req.body);
    const user = await User.findOne({ email }).select("+password");
    console.log(user);
    if (!user || !(await user.correctPassword(password, user.password))) {
        res.status(404).json({
            status: "fail",
            message: "Invalid email Id or password",
        });
        return next();
    }
    createSendToken(user, 200, res);
};
exports.logout = (req, res) => {
    res.cookie("jwt", "loggedout", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({ status: "success" });
};
exports.protect = async(req, res, next) => {
    if (!req.headers.authorization) {
        res.status(401).json({
            status: "fail",
            message: `please login to access portal`,
        });
        return;
    }
    const arr = req.headers.authorization.split(" ");
    if (req.headers.authorization && arr[0] === "Bearer") {
        if (!arr[1]) {
            res.status(401).json({
                status: "fail",
                message: `you are not logged in! please login to get access`,
            });
            return next();
        }
    }
    try {
        const decoded = await jwt.verify(arr[1], process.env.JWT_SECRET);
        const freshUser = await User.findById(decoded.id);
        if (!freshUser) {
            res.status(401).json({
                status: "fail",
                message: `please login again!`,
            });
        }
        req.user = freshUser;
        res.locals.user = freshUser;
        next();
    } catch (err) {
        // console.log(err);
        res.status(401).json({
            status: "fail",
            message: "Something went wrong! Please try logging in or try again later",
        });
    }
};