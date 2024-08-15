
const { userMapper } = require("../mappers/user-mapper");

Parse.Cloud.define("v1-logging-in", async (request) => {

    const email = request.params.email.toLowerCase();
    const password = request.params.password;

    const user = await Parse.User.logIn(email, password);
    return userMapper(user.toJSON());

}, {
    fields: {
        email: {
            required: true,
        },
        password: {
            required: true
        }
    }
});