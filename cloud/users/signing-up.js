
const { userMapper } = require("../mappers/user-mapper");

Parse.Cloud.define("v1-signing-up", async (request) => {

    const user = new Parse.User();
    const data = request.params;

    const allowedFields = [
        "email",
        "phone",
        "password",
        "username",
        "fullName",
        "document",
    ];

    allowedFields.forEach(field => {
        if (data[field]) {
            user.set(field, data[field])
        }
    });

    const createUser = await user.signUp();

    return userMapper(createUser.toJSON());

}, {
    fields: {
        email: {
            required: true
        },
        password: {
            required: true
        },
        fullName: {
            required: true
        },
        username: {
            required: true
        }
    }
});