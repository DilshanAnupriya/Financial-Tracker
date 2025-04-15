const Notification = require("../model/notificationModel");

const createNotification = async  (sender,receiver,message,type) =>{
    try{
        return await Notification.create({sender,receiver,message,type});
    }catch (e){
        console.error(e);
    }
}

const getUserNotifications = async (receiver) => {
    try {
        return await Notification.find({ receiver }).sort({ createdAt: -1 });
    } catch (err) {
        throw new Error(err.message);
    }
};

module.exports = {
    createNotification,getUserNotifications
}