
const { userMapper } = require("../mappers/user-mapper");

Parse.Cloud.define("v1-get-user", async (request) => {

    const user = request.user;

    return userMapper(user.toJSON());

});
