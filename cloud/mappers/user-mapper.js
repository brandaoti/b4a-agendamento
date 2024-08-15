function userMapper(user) {
    return {
        id: user.objectId,
        email: user.email,
        phone: user.phone,
        username: user.username,
        fullName: user.fullName,
        sessionToken: user.sessionToken,
    }
}

module.exports = { userMapper };