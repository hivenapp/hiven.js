module.exports = {
    Client: require('./Client'),

    // Stores
    HouseStore: require('./Stores/House'),
    MemberStore: require('./Stores/Member'),
    MessageStore: require('./Stores/Message'),
    RoomStore: require('./Stores/Room'),
    UserStore: require('./Stores/User')
}